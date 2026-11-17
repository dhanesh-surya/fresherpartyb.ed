import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import type { EditableEventConfig, ThankYouRecord } from './src/types/invitation';
import {
  adminDeleteJunior,
  adminUpsertJunior,
  applyThankYouHit,
  DEFAULT_EVENT_CONFIG,
  DEFAULT_SEED_RECORDS,
  normalizeJuniorName,
  registerJuniorLogin,
  sanitizeEventConfig,
  summarizeThankYouLedger,
} from './src/utils/invitationLogic';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '.data');
const DATA_FILE = path.join(DATA_DIR, 'thank-you-hits.json');
const CONFIG_FILE = path.join(DATA_DIR, 'event-config.json');

function ensureStore(): ThankYouRecord[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(DEFAULT_SEED_RECORDS, null, 2),
      'utf8'
    );
    return DEFAULT_SEED_RECORDS;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as ThankYouRecord[];
    }
  } catch {
    // Fall back to seed records if file is unreadable
  }
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(DEFAULT_SEED_RECORDS, null, 2),
    'utf8'
  );
  return DEFAULT_SEED_RECORDS;
}

function saveStore(records: ThankYouRecord[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function ensureConfig(): EditableEventConfig {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(
      CONFIG_FILE,
      JSON.stringify(DEFAULT_EVENT_CONFIG, null, 2),
      'utf8'
    );
    return DEFAULT_EVENT_CONFIG;
  }
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<EditableEventConfig>;
    return sanitizeEventConfig(parsed);
  } catch {
    fs.writeFileSync(
      CONFIG_FILE,
      JSON.stringify(DEFAULT_EVENT_CONFIG, null, 2),
      'utf8'
    );
    return DEFAULT_EVENT_CONFIG;
  }
}

function saveConfig(config: EditableEventConfig): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/thank-you', (req, res) => {
    const currentName =
      typeof req.query.name === 'string' ? req.query.name : null;
    const records = ensureStore();
    const summary = summarizeThankYouLedger(records, currentName, 'all', '');
    res.json({
      records: summary.allRecords,
      totalHits: summary.totalHits,
      thankedCount: summary.thankedCount,
      pendingCount: summary.pendingCount,
      currentRecord: summary.currentRecord,
    });
  });

  app.post('/api/login', (req, res) => {
    const rawName = typeof req.body?.name === 'string' ? req.body.name : '';
    const validation = normalizeJuniorName(rawName);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const records = ensureStore();
    const { records: updated, currentRecord } = registerJuniorLogin(
      records,
      validation.name,
      new Date().toISOString()
    );
    saveStore(updated);

    const summary = summarizeThankYouLedger(
      updated,
      currentRecord.name,
      'all',
      ''
    );
    res.json({
      records: summary.allRecords,
      totalHits: summary.totalHits,
      thankedCount: summary.thankedCount,
      pendingCount: summary.pendingCount,
      currentRecord,
    });
  });

  app.post('/api/thank-you', (req, res) => {
    const rawName = typeof req.body?.name === 'string' ? req.body.name : '';
    const validation = normalizeJuniorName(rawName);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const records = ensureStore();
    const { records: updated, currentRecord } = applyThankYouHit(
      records,
      validation.name,
      new Date().toISOString()
    );
    saveStore(updated);

    const summary = summarizeThankYouLedger(
      updated,
      currentRecord.name,
      'all',
      ''
    );
    res.json({
      records: summary.allRecords,
      totalHits: summary.totalHits,
      thankedCount: summary.thankedCount,
      pendingCount: summary.pendingCount,
      currentRecord,
    });
  });

  app.post('/api/juniors', (req, res) => {
    try {
      const records = ensureStore();
      const { records: updated, record } = adminUpsertJunior(
        records,
        {
          name: typeof req.body?.name === 'string' ? req.body.name : '',
          hits: Number(req.body?.hits ?? 0),
          status: req.body?.status === 'Thanked' ? 'Thanked' : 'Pending',
        },
        new Date().toISOString()
      );
      saveStore(updated);
      const summary = summarizeThankYouLedger(updated, null, 'all', '');
      res.json({
        records: summary.allRecords,
        totalHits: summary.totalHits,
        thankedCount: summary.thankedCount,
        pendingCount: summary.pendingCount,
        currentRecord: record,
      });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'Unable to save Junior.',
      });
    }
  });

  app.put('/api/juniors/:id', (req, res) => {
    try {
      const targetId = decodeURIComponent(req.params.id);
      const records = ensureStore();
      const { records: updated, record } = adminUpsertJunior(
        records,
        {
          targetId,
          name: typeof req.body?.name === 'string' ? req.body.name : '',
          hits: Number(req.body?.hits ?? 0),
          status: req.body?.status === 'Thanked' ? 'Thanked' : 'Pending',
        },
        new Date().toISOString()
      );
      saveStore(updated);
      const summary = summarizeThankYouLedger(updated, null, 'all', '');
      res.json({
        records: summary.allRecords,
        totalHits: summary.totalHits,
        thankedCount: summary.thankedCount,
        pendingCount: summary.pendingCount,
        currentRecord: record,
      });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'Unable to update Junior.',
      });
    }
  });

  app.delete('/api/juniors/:id', (req, res) => {
    try {
      const targetId = decodeURIComponent(req.params.id);
      const records = ensureStore();
      const updated = adminDeleteJunior(records, targetId);
      saveStore(updated);
      const summary = summarizeThankYouLedger(updated, null, 'all', '');
      res.json({
        records: summary.allRecords,
        totalHits: summary.totalHits,
        thankedCount: summary.thankedCount,
        pendingCount: summary.pendingCount,
        currentRecord: null,
      });
    } catch (err) {
      res.status(404).json({
        error: err instanceof Error ? err.message : 'Junior not found.',
      });
    }
  });

  app.get('/api/config', (_req, res) => {
    res.json(ensureConfig());
  });

  app.put('/api/config', (req, res) => {
    const next = sanitizeEventConfig(req.body as Partial<EditableEventConfig>);
    saveConfig(next);
    res.json(next);
  });

  app.delete('/api/config', (_req, res) => {
    const reset = sanitizeEventConfig(DEFAULT_EVENT_CONFIG);
    saveConfig(reset);
    res.json(reset);
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
