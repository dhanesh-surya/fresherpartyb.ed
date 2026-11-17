import {
  CheckCircle2,
  Clock3,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import type {
  EditableEventConfig,
  ProgramItem,
  ThankYouRecord,
  ThankYouStatus,
} from '../types/invitation';
import { summarizeThankYouLedger } from '../utils/invitationLogic';

interface SeniorAdminDashboardProps {
  adminName: string;
  records: ThankYouRecord[];
  eventConfig: EditableEventConfig;
  isBusy: boolean;
  onUpsertJunior: (input: {
    targetId?: string;
    name: string;
    hits: number;
    status: ThankYouStatus;
  }) => Promise<void>;
  onDeleteJunior: (targetId: string) => Promise<void>;
  onSaveEventConfig: (config: EditableEventConfig) => Promise<void>;
  onResetEventConfig: () => Promise<void>;
  onExitAdmin: () => void;
}

type AdminTab = 'juniors' | 'event' | 'dress-program';

export function SeniorAdminDashboard({
  adminName,
  records,
  eventConfig,
  isBusy,
  onUpsertJunior,
  onDeleteJunior,
  onSaveEventConfig,
  onResetEventConfig,
  onExitAdmin,
}: SeniorAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('juniors');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Add Junior state
  const [newName, setNewName] = useState('');
  const [newStatus, setNewStatus] = useState<ThankYouStatus>('Pending');
  const [newHits, setNewHits] = useState(0);

  // Edit Junior state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<ThankYouStatus>('Pending');
  const [editHits, setEditHits] = useState(0);

  // Editable Event Config draft
  const [draftConfig, setDraftConfig] = useState<EditableEventConfig>(eventConfig);

  // Program item create/edit state
  const [newProgTime, setNewProgTime] = useState('');
  const [newProgTitle, setNewProgTitle] = useState('');
  const [newProgDetail, setNewProgDetail] = useState('');
  const [editingProgId, setEditingProgId] = useState<string | null>(null);
  const [editProgDraft, setEditProgDraft] = useState<ProgramItem | null>(null);

  const summary = useMemo(
    () => summarizeThankYouLedger(records, null, 'all', searchQuery),
    [records, searchQuery]
  );

  const showSuccess = (msg: string) => {
    setErrorText(null);
    setFeedback(msg);
  };

  const handleAddJunior = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setErrorText(null);
      await onUpsertJunior({
        name: newName,
        status: newStatus,
        hits: newStatus === 'Pending' ? 0 : Math.max(1, Number(newHits) || 1),
      });
      setNewName('');
      setNewStatus('Pending');
      setNewHits(0);
      showSuccess('Junior added to the directory.');
    } catch (err) {
      setErrorText(
        err instanceof Error ? err.message : 'Unable to add Junior.'
      );
    }
  };

  const startEditJunior = (record: ThankYouRecord) => {
    setEditingId(record.id);
    setEditName(record.name);
    setEditStatus(record.status);
    setEditHits(record.hits);
    setErrorText(null);
  };

  const handleSaveEditJunior = async (targetId: string) => {
    try {
      setErrorText(null);
      await onUpsertJunior({
        targetId,
        name: editName,
        status: editStatus,
        hits: editStatus === 'Pending' ? 0 : Math.max(1, Number(editHits) || 1),
      });
      setEditingId(null);
      showSuccess('Junior record updated.');
    } catch (err) {
      setErrorText(
        err instanceof Error ? err.message : 'Unable to update Junior.'
      );
    }
  };

  const handleDelete = async (record: ThankYouRecord) => {
    try {
      setErrorText(null);
      await onDeleteJunior(record.id);
      if (editingId === record.id) setEditingId(null);
      showSuccess(`Removed ${record.name} from directory.`);
    } catch (err) {
      setErrorText(
        err instanceof Error ? err.message : 'Unable to delete Junior.'
      );
    }
  };

  const handleSaveConfigForm = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setErrorText(null);
      await onSaveEventConfig(draftConfig);
      showSuccess('Invitation & event details saved.');
    } catch (err) {
      setErrorText(
        err instanceof Error ? err.message : 'Unable to save event config.'
      );
    }
  };

  const handleResetDefaults = async () => {
    try {
      setErrorText(null);
      await onResetEventConfig();
      showSuccess('Event details restored to defaults.');
    } catch (err) {
      setErrorText(
        err instanceof Error ? err.message : 'Unable to reset defaults.'
      );
    }
  };

  const handleAddProgramItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!newProgTitle.trim()) {
      setErrorText('Please enter a program segment title.');
      return;
    }
    const nextItem: ProgramItem = {
      id: `prog-${Date.now()}`,
      time: newProgTime.trim() || 'TBA',
      title: newProgTitle.trim(),
      detail: newProgDetail.trim(),
    };
    const updated: EditableEventConfig = {
      ...draftConfig,
      program: [...draftConfig.program, nextItem],
    };
    setDraftConfig(updated);
    await onSaveEventConfig(updated);
    setNewProgTime('');
    setNewProgTitle('');
    setNewProgDetail('');
    showSuccess('Program segment added.');
  };

  const handleSaveProgramEdit = async () => {
    if (!editProgDraft || !editProgDraft.title.trim()) {
      setErrorText('Program title cannot be empty.');
      return;
    }
    const updated: EditableEventConfig = {
      ...draftConfig,
      program: draftConfig.program.map((item) =>
        item.id === editProgDraft.id ? editProgDraft : item
      ),
    };
    setDraftConfig(updated);
    await onSaveEventConfig(updated);
    setEditingProgId(null);
    setEditProgDraft(null);
    showSuccess('Program segment updated.');
  };

  const handleDeleteProgramItem = async (id: string) => {
    const updated: EditableEventConfig = {
      ...draftConfig,
      program: draftConfig.program.filter((item) => item.id !== id),
    };
    setDraftConfig(updated);
    await onSaveEventConfig(updated);
    showSuccess('Program segment removed.');
  };

  return (
    <section
      aria-label="Senior Admin Dashboard"
      className="mx-auto max-w-[1200px] px-6 py-8 lg:py-10"
    >
      <div className="border-b border-[#E8D5C8] pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#7B1633]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span>Senior Admin Portal · Signed in as {adminName}</span>
        </div>
        <h1 className="mt-1 font-display text-3xl font-bold text-[#2B1820]">
          Fresher Party Management
        </h1>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E8D5C8] bg-white p-5">
          <p className="text-xs font-medium text-[#6E4B56]">Juniors Signed In</p>
          <p className="mt-1 font-display text-3xl font-bold text-[#7B1633] tabular-nums">
            {summary.allRecords.length}
          </p>
        </div>
        <div className="rounded-xl border border-[#E8D5C8] bg-white p-5">
          <p className="text-xs font-medium text-[#6E4B56]">Thanked</p>
          <p className="mt-1 font-display text-3xl font-bold text-[#166534] tabular-nums">
            {summary.thankedCount}
          </p>
        </div>
        <div className="rounded-xl border border-[#E8D5C8] bg-white p-5">
          <p className="text-xs font-medium text-[#6E4B56]">Pending</p>
          <p className="mt-1 font-display text-3xl font-bold text-[#8C5B2B] tabular-nums">
            {summary.pendingCount}
          </p>
        </div>
        <div className="rounded-xl border border-[#E8D5C8] bg-white p-5">
          <p className="text-xs font-medium text-[#6E4B56]">Total Thank You Hits</p>
          <p className="mt-1 font-display text-3xl font-bold text-[#2B1820] tabular-nums">
            {summary.totalHits}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Senior Admin Sections"
          className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-[#E8D5C8] bg-white p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'juniors'}
            onClick={() => setActiveTab('juniors')}
            className={`rounded-md px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'juniors'
                ? 'bg-[#7B1633] text-white'
                : 'text-[#5C3A45] hover:text-[#2B1820]'
            }`}
          >
            Juniors CRUD ({summary.allRecords.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'event'}
            onClick={() => {
              setDraftConfig(eventConfig);
              setActiveTab('event');
            }}
            className={`rounded-md px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'event'
                ? 'bg-[#7B1633] text-white'
                : 'text-[#5C3A45] hover:text-[#2B1820]'
            }`}
          >
            Event &amp; Invitation Info
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'dress-program'}
            onClick={() => {
              setDraftConfig(eventConfig);
              setActiveTab('dress-program');
            }}
            className={`rounded-md px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'dress-program'
                ? 'bg-[#7B1633] text-white'
                : 'text-[#5C3A45] hover:text-[#2B1820]'
            }`}
          >
            Dress Code &amp; Program
          </button>
        </div>

        {(feedback || errorText) && (
          <p
            role={errorText ? 'alert' : 'status'}
            className={`text-xs font-semibold ${
              errorText ? 'text-[#B42318]' : 'text-[#166534]'
            }`}
          >
            {errorText ?? feedback}
          </p>
        )}
      </div>

      {activeTab === 'juniors' && (
        <div className="mt-6 space-y-6">
          <form
            onSubmit={handleAddJunior}
            className="rounded-2xl border border-[#E8D5C8] bg-white p-6"
          >
            <h2 className="font-display text-lg font-semibold text-[#2B1820]">
              Add Junior Manually
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-end">
              <div className="sm:col-span-5">
                <label
                  htmlFor="admin-add-junior-name"
                  className="block text-xs font-semibold text-[#5C3A45]"
                >
                  Junior Full Name
                </label>
                <input
                  id="admin-add-junior-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sonal Gupta"
                  className="mt-1.5 w-full rounded-lg border border-[#D8B9A6] bg-[#FDF8F5] px-3.5 py-2 text-sm text-[#2B1820] focus:border-[#7B1633] focus:bg-white focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="admin-add-junior-status"
                  className="block text-xs font-semibold text-[#5C3A45]"
                >
                  Status
                </label>
                <select
                  id="admin-add-junior-status"
                  value={newStatus}
                  onChange={(e) => {
                    const next = e.target.value as ThankYouStatus;
                    setNewStatus(next);
                    if (next === 'Thanked' && newHits === 0) setNewHits(1);
                    if (next === 'Pending') setNewHits(0);
                  }}
                  className="mt-1.5 w-full rounded-lg border border-[#D8B9A6] bg-[#FDF8F5] px-3 py-2 text-sm text-[#2B1820] focus:border-[#7B1633] focus:bg-white focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Thanked">Thanked</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="admin-add-junior-hits"
                  className="block text-xs font-semibold text-[#5C3A45]"
                >
                  Hits
                </label>
                <input
                  id="admin-add-junior-hits"
                  type="number"
                  min={0}
                  value={newHits}
                  onChange={(e) => setNewHits(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-lg border border-[#D8B9A6] bg-[#FDF8F5] px-3 py-2 text-sm text-[#2B1820] tabular-nums focus:border-[#7B1633] focus:bg-white focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isBusy}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#7B1633] px-4 py-2.5 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-[#621028] disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Add Junior</span>
                </button>
              </div>
            </div>
          </form>

          <div className="rounded-2xl border border-[#E8D5C8] bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8D5C8] pb-4">
              <h2 className="font-display text-xl font-semibold text-[#2B1820]">
                Signed-In Juniors Directory
              </h2>
              <input
                type="search"
                aria-label="Filter Juniors in admin"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Junior by name..."
                className="w-full rounded-lg border border-[#D8B9A6] bg-[#FDF8F5] px-3.5 py-2 text-xs text-[#2B1820] sm:w-64 focus:border-[#7B1633] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E8D5C8] text-xs font-semibold text-[#6E4B56]">
                    <th className="py-2.5 pr-4">Name</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5 text-right">Hits</th>
                    <th className="px-3 py-2.5">Signed In</th>
                    <th className="py-2.5 pl-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1E4DC]">
                  {summary.records.map((entry) => {
                    const isEditing = editingId === entry.id;
                    return (
                      <tr key={entry.id}>
                        <td className="py-3 pr-4">
                          {isEditing ? (
                            <input
                              type="text"
                              aria-label={`Edit name for ${entry.name}`}
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full rounded-md border border-[#D8B9A6] bg-[#FDF8F5] px-2.5 py-1.5 text-sm text-[#2B1820]"
                            />
                          ) : (
                            <span className="font-medium text-[#2B1820]">
                              {entry.name}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {isEditing ? (
                            <select
                              aria-label={`Edit status for ${entry.name}`}
                              value={editStatus}
                              onChange={(e) => {
                                const val = e.target.value as ThankYouStatus;
                                setEditStatus(val);
                                if (val === 'Pending') setEditHits(0);
                                if (val === 'Thanked' && editHits === 0)
                                  setEditHits(1);
                              }}
                              className="rounded-md border border-[#D8B9A6] bg-[#FDF8F5] px-2.5 py-1.5 text-xs text-[#2B1820]"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Thanked">Thanked</option>
                            </select>
                          ) : entry.status === 'Thanked' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#166534]">
                              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Thanked</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C5B2B]">
                              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              aria-label={`Edit hits for ${entry.name}`}
                              value={editHits}
                              onChange={(e) =>
                                setEditHits(Number(e.target.value))
                              }
                              className="w-20 rounded-md border border-[#D8B9A6] bg-[#FDF8F5] px-2 py-1 text-right text-sm text-[#2B1820]"
                            />
                          ) : (
                            <span className="font-semibold text-[#2B1820]">
                              {entry.hits}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-xs text-[#6E4B56] tabular-nums">
                          {new Date(entry.firstLoggedInAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 pl-3 text-right">
                          {isEditing ? (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveEditJunior(entry.id)}
                                className="inline-flex items-center gap-1 rounded-md bg-[#7B1633] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#621028]"
                              >
                                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Save</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="inline-flex items-center gap-1 rounded-md border border-[#D8B9A6] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#5C3A45]"
                              >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                aria-label={`Edit ${entry.name}`}
                                onClick={() => startEditJunior(entry)}
                                className="inline-flex items-center gap-1 rounded-md border border-[#D8B9A6] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#2B1820] hover:border-[#7B1633] hover:text-[#7B1633]"
                              >
                                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                aria-label={`Delete ${entry.name}`}
                                onClick={() => handleDelete(entry)}
                                className="inline-flex items-center gap-1 rounded-md border border-[#F3C6C6] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#B42318] hover:bg-[#FEF3F2]"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'event' && (
        <form
          onSubmit={handleSaveConfigForm}
          className="mt-6 rounded-2xl border border-[#E8D5C8] bg-white p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8D5C8] pb-4">
            <h2 className="font-display text-xl font-semibold text-[#2B1820]">
              Edit Invitation &amp; Event Details
            </h2>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8B9A6] bg-white px-3.5 py-2 text-xs font-semibold text-[#5C3A45] hover:border-[#7B1633] hover:text-[#7B1633]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="cfg-event-title"
                className="block text-xs font-semibold text-[#5C3A45]"
              >
                Masthead Event Title
              </label>
              <input
                id="cfg-event-title"
                type="text"
                value={draftConfig.eventTitle}
                onChange={(e) =>
                  setDraftConfig({ ...draftConfig, eventTitle: e.target.value })
                }
                className="mt-1.5 w-full rounded-lg border border-[#D8B9A6] bg-[#FDF8F5] px-3.5 py-2 text-sm text-[#2B1820]"
              />
            </div>

            <div>
              <label
                htmlFor="cfg-organized-by"
                className="block text-xs font-semibold text-[#5C3A45]"
              >
                Department / College Line
              </label>
              <input
                id="cfg-organized-by"
                type="text"
                value={draftConfig.organizedBy}
                onChange={(e) =>
                  setDraftConfig({
                    ...draftConfig,
                    organizedBy: e.target.value,
                  })
                }
                className="mt-1.5 w-full rounded-lg border border-[#D8B9A6] bg-[#FDF8F5] px-3.5 py-2 text-sm text-[#2B1820]"
              />
            </div>

            <div>
              <label
                htmlFor="cfg-date-display"
                className="block text-xs font-semibold text-[#5C3A45]"
              >
                Date (Short)
              </label>
              <input
                id="cfg-date-display"
                type="text"
                value={draftConfig.dateDisplay}
                onChange={(e) =>
                  setDraftConfig({
                    ...draftConfig,
                    dateDisplay: e.target.value,
                  })
                }
                className="mt-1.5 w-full rounded-lg border border-[#D8B9A6] bg-[#FDF8F5] px-3.5 py-2 text-sm text-[#2B1820]"
              />
            </div>

            <div>
              <label
                htmlFor="cfg-date-full"
                className="block text-xs font-semibold text-[#5C3A45]"
              >
                Date (Full Label)
              </label>
              <input
                id="cfg-date-full"
                type="text"
                value={draftConfig.dateFull}
                onChange={(e) =>
                  setDraftConfig({ ...draftConfig, dateFull: e.target.value })
                }
                className="mt-1.5 w-full rounded-lg border border-[#D8B9A6] bg-[#FDF8F5] px-3.5 py-2 text-sm text-[#2B1820]"
              />
            </div>

            <div>
              <label
                htmlFor="cfg-time-display"
                className="block text-xs font-semibold text-[#5C3A45]"
              >
                Event Time
              </label>
              <input
                id="cfg-time-display"
                type="text"
                value={draftConfig.timeDisplay}
                onChange={(e) =>
                  setDraftConfig({
                    ...draftConfig,
                    timeDisplay: e.target.value,
                  })
                }
                className="mt-1.5 w-full rounded-lg border border-[#D8B9A6] bg-[#FDF8F5] px-3.5 py-2 text-sm text-[#2B1820]"
              />
            </div>

            <div>
              <label
                htmlFor="cfg-venue-display"
                className="block text-xs font-semibold text-[#5C3A45]"
              >
                Venue
              </label>
              <input
                id="cfg-venue-display"
                type="text"
                value={draftConfig.venueDisplay}
                onChange={(e) =>
                  setDraftConfig({
                    ...draftConfig,
                    venueDisplay: e.target.value,
                  })
                }
                className="mt-1.5 w-full rounded-lg border border-[#D8B9A6] bg-[#FDF8F5] px-3.5 py-2 text-sm text-[#2B1820]"
              />
            </div>

            <div>
              <label
                htmlFor="cfg-organiser"
                className="block text-xs font-semibold text-[#5C3A45]"
              >
                Host / Batch Label
              </label>
              <input
                id="cfg-organiser"
                type="text"
                value={draftConfig.organiser}
                onChange={(e) =>
                  setDraftConfig({ ...draftConfig, organiser: e.target.value })
                }
                className="mt-1.5 w-full rounded-lg border border-[#D8B9A6] bg-[#FDF8F5] px-3.5 py-2 text-sm text-[#2B1820]"
              />
            </div>

            <div>
              <label
                htmlFor="cfg-kicker"
                className="block text-xs font-semibold text-[#5C3A45]"
              >
                Invitation Kicker
              </label>
              <input
                id="cfg-kicker"
                type="text"
                value={draftConfig.kicker}
                onChange={(e) =>
                  setDraftConfig({ ...draftConfig, kicker: e.target.value })
                }
                className="mt-1.5 w-full rounded-lg border border-[#D8B9A6] bg-[#FDF8F5] px-3.5 py-2 text-sm text-[#2B1820]"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="cfg-sub-greeting"
                className="block text-xs font-semibold text-[#5C3A45]"
              >
                Welcome Message
              </label>
              <textarea
                id="cfg-sub-greeting"
                rows={2}
                value={draftConfig.subGreeting}
                onChange={(e) =>
                  setDraftConfig({
                    ...draftConfig,
                    subGreeting: e.target.value,
                  })
                }
                className="mt-1.5 w-full rounded-lg border border-[#D8B9A6] bg-[#FDF8F5] px-3.5 py-2 text-sm text-[#2B1820]"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="cfg-invite-line"
                className="block text-xs font-semibold text-[#5C3A45]"
              >
                Invitation Body Text
              </label>
              <textarea
                id="cfg-invite-line"
                rows={2}
                value={draftConfig.inviteLine}
                onChange={(e) =>
                  setDraftConfig({ ...draftConfig, inviteLine: e.target.value })
                }
                className="mt-1.5 w-full rounded-lg border border-[#D8B9A6] bg-[#FDF8F5] px-3.5 py-2 text-sm text-[#2B1820]"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-xl bg-[#7B1633] px-6 py-3 text-sm font-semibold text-white hover:bg-[#621028] disabled:opacity-60"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>Save Event Details</span>
            </button>
          </div>
        </form>
      )}

      {activeTab === 'dress-program' && (
        <div className="mt-6 space-y-6">
          <form
            onSubmit={handleSaveConfigForm}
            className="rounded-2xl border border-[#E8D5C8] bg-white p-6"
          >
            <h2 className="font-display text-xl font-semibold text-[#2B1820]">
              Dress Code Settings
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-[#F1E4DC] bg-[#FDF8F5] p-4">
                <p className="text-xs font-semibold text-[#7B1633]">
                  Girls Formal Dress Code
                </p>
                <input
                  type="text"
                  aria-label="Girls formal attire title"
                  value={draftConfig.dressCode.girls.attire}
                  onChange={(e) =>
                    setDraftConfig({
                      ...draftConfig,
                      dressCode: {
                        ...draftConfig.dressCode,
                        girls: {
                          ...draftConfig.dressCode.girls,
                          attire: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full rounded-lg border border-[#D8B9A6] bg-white px-3 py-2 text-sm text-[#2B1820]"
                />
                <textarea
                  rows={2}
                  aria-label="Girls dress code details"
                  value={draftConfig.dressCode.girls.detail}
                  onChange={(e) =>
                    setDraftConfig({
                      ...draftConfig,
                      dressCode: {
                        ...draftConfig.dressCode,
                        girls: {
                          ...draftConfig.dressCode.girls,
                          detail: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full rounded-lg border border-[#D8B9A6] bg-white px-3 py-2 text-sm text-[#2B1820]"
                />
              </div>

              <div className="space-y-3 rounded-xl border border-[#F1E4DC] bg-[#FDF8F5] p-4">
                <p className="text-xs font-semibold text-[#2B1820]">
                  Boys Formal Dress Code
                </p>
                <input
                  type="text"
                  aria-label="Boys formal attire title"
                  value={draftConfig.dressCode.boys.attire}
                  onChange={(e) =>
                    setDraftConfig({
                      ...draftConfig,
                      dressCode: {
                        ...draftConfig.dressCode,
                        boys: {
                          ...draftConfig.dressCode.boys,
                          attire: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full rounded-lg border border-[#D8B9A6] bg-white px-3 py-2 text-sm text-[#2B1820]"
                />
                <textarea
                  rows={2}
                  aria-label="Boys dress code details"
                  value={draftConfig.dressCode.boys.detail}
                  onChange={(e) =>
                    setDraftConfig({
                      ...draftConfig,
                      dressCode: {
                        ...draftConfig.dressCode,
                        boys: {
                          ...draftConfig.dressCode.boys,
                          detail: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full rounded-lg border border-[#D8B9A6] bg-white px-3 py-2 text-sm text-[#2B1820]"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={isBusy}
                className="inline-flex items-center gap-2 rounded-lg bg-[#7B1633] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#621028]"
              >
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Save Dress Code</span>
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-[#E8D5C8] bg-white p-6">
            <h2 className="font-display text-xl font-semibold text-[#2B1820]">
              Event Program Timeline CRUD
            </h2>

            <form
              onSubmit={handleAddProgramItem}
              className="mt-4 grid grid-cols-1 gap-3 border-b border-[#E8D5C8] pb-5 sm:grid-cols-12 sm:items-end"
            >
              <div className="sm:col-span-3">
                <label
                  htmlFor="prog-time"
                  className="block text-xs font-semibold text-[#5C3A45]"
                >
                  Time
                </label>
                <input
                  id="prog-time"
                  type="text"
                  value={newProgTime}
                  onChange={(e) => setNewProgTime(e.target.value)}
                  placeholder="e.g. 03:30 PM"
                  className="mt-1 w-full rounded-lg border border-[#D8B9A6] bg-[#FDF8F5] px-3 py-2 text-sm text-[#2B1820]"
                />
              </div>
              <div className="sm:col-span-4">
                <label
                  htmlFor="prog-title"
                  className="block text-xs font-semibold text-[#5C3A45]"
                >
                  Segment Title
                </label>
                <input
                  id="prog-title"
                  type="text"
                  value={newProgTitle}
                  onChange={(e) => setNewProgTitle(e.target.value)}
                  placeholder="e.g. DJ & Cultural Dance"
                  className="mt-1 w-full rounded-lg border border-[#D8B9A6] bg-[#FDF8F5] px-3 py-2 text-sm text-[#2B1820]"
                />
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="prog-detail"
                  className="block text-xs font-semibold text-[#5C3A45]"
                >
                  Short Note
                </label>
                <input
                  id="prog-detail"
                  type="text"
                  value={newProgDetail}
                  onChange={(e) => setNewProgDetail(e.target.value)}
                  placeholder="Optional details"
                  className="mt-1 w-full rounded-lg border border-[#D8B9A6] bg-[#FDF8F5] px-3 py-2 text-sm text-[#2B1820]"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#7B1633] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#621028]"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Add Slot</span>
                </button>
              </div>
            </form>

            <ul className="mt-4 divide-y divide-[#F1E4DC]">
              {draftConfig.program.map((item) => {
                const isEdit = editingProgId === item.id && editProgDraft;
                return (
                  <li
                    key={item.id}
                    className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    {isEdit ? (
                      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-12">
                        <input
                          type="text"
                          value={editProgDraft.time}
                          onChange={(e) =>
                            setEditProgDraft({
                              ...editProgDraft,
                              time: e.target.value,
                            })
                          }
                          className="sm:col-span-3 rounded-md border border-[#D8B9A6] px-2.5 py-1.5 text-xs"
                        />
                        <input
                          type="text"
                          value={editProgDraft.title}
                          onChange={(e) =>
                            setEditProgDraft({
                              ...editProgDraft,
                              title: e.target.value,
                            })
                          }
                          className="sm:col-span-4 rounded-md border border-[#D8B9A6] px-2.5 py-1.5 text-xs"
                        />
                        <input
                          type="text"
                          value={editProgDraft.detail}
                          onChange={(e) =>
                            setEditProgDraft({
                              ...editProgDraft,
                              detail: e.target.value,
                            })
                          }
                          className="sm:col-span-3 rounded-md border border-[#D8B9A6] px-2.5 py-1.5 text-xs"
                        />
                        <div className="flex items-center gap-2 sm:col-span-2 sm:justify-end">
                          <button
                            type="button"
                            onClick={handleSaveProgramEdit}
                            className="rounded-md bg-[#7B1633] px-2.5 py-1.5 text-xs font-semibold text-white"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProgId(null);
                              setEditProgDraft(null);
                            }}
                            className="rounded-md border border-[#D8B9A6] px-2 py-1.5 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-xs font-semibold text-[#7B1633] tabular-nums">
                            {item.time}
                          </p>
                          <p className="text-sm font-semibold text-[#2B1820]">
                            {item.title}
                          </p>
                          {item.detail && (
                            <p className="text-xs text-[#6E4B56]">
                              {item.detail}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProgId(item.id);
                              setEditProgDraft({ ...item });
                            }}
                            className="inline-flex items-center gap-1 rounded-md border border-[#D8B9A6] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#2B1820] hover:border-[#7B1633]"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProgramItem(item.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-[#F3C6C6] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#B42318] hover:bg-[#FEF3F2]"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
