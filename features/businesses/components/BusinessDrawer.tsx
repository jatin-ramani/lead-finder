"use client";

import {
  BranchesOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  CheckOutlined,
  CloseCircleFilled,
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExportOutlined,
  FileTextOutlined,
  GlobalOutlined,
  HistoryOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  ScheduleOutlined,
  StarFilled,
  StarOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Avatar, Button, Drawer, Input, type InputRef, Popconfirm, Progress, Select, Skeleton, Tag, Tooltip } from "antd";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { useUpdateLeadStatus } from "@/features/businesses/hooks/useBusinessMutations";
import { useBusinessActivities } from "@/features/businesses/hooks/useBusinessActivities";
import { useBusinessFollowUps } from "@/features/businesses/hooks/useBusinessFollowUps";
import { LEAD_STATUS_OPTIONS } from "@/features/businesses/components/BusinessFilterBar";
import WebsiteDataCard from "@/features/scraping/components/WebsiteDataCard";
import {
  avatarColor,
  copyText,
  formatAbsoluteTime,
  formatRelativeTime,
  initials,
  isPresent,
  splitPhones,
  toAbsoluteUrl,
  toDisplayUrl,
  toMapsUrl,
  toTelHref,
} from "@/lib/format";
import { businessesApi, notesApi, queryKeys, tagsApi } from "@/services";
import type {
  Business,
  BusinessFollowUp,
  BusinessNote,
  FollowUpPriority,
  LeadStatus,
} from "@/types/api";

const { TextArea } = Input;

function getActivityIcon(type: string) {
  switch (type) {
    case "status_changed":
      return <BranchesOutlined className="text-blue-500" />;
    case "favorite_added":
      return <StarFilled className="text-amber-500" />;
    case "favorite_removed":
      return <StarOutlined className="text-[var(--lf-text-muted)]" />;
    case "tag_added":
      return <TagOutlined className="text-purple-500" />;
    case "tag_removed":
      return <TagOutlined className="text-[var(--lf-text-muted)]" />;
    case "note_created":
      return <FileTextOutlined className="text-emerald-500" />;
    case "note_updated":
      return <EditOutlined className="text-teal-500" />;
    case "note_deleted":
      return <DeleteOutlined className="text-rose-500" />;
    case "follow_up_created":
      return <ScheduleOutlined className="text-amber-500" />;
    case "follow_up_updated":
      return <EditOutlined className="text-blue-500" />;
    case "follow_up_completed":
      return <CheckCircleFilled className="text-emerald-500" />;
    case "follow_up_cancelled":
      return <CloseCircleFilled className="text-slate-400" />;
    case "follow_up_deleted":
      return <DeleteOutlined className="text-rose-500" />;
    case "business_created":
    case "lead_created":
      return <PlusCircleOutlined className="text-indigo-500" />;
    case "email_added":
      return <MailOutlined className="text-sky-500" />;
    case "phone_added":
      return <PhoneOutlined className="text-emerald-500" />;
    case "website_added":
    case "scrape_completed":
    case "lead_scraped":
      return <GlobalOutlined className="text-cyan-500" />;
    case "lead_score_changed":
      return <BranchesOutlined className="text-violet-500" />;
    default:
      return <HistoryOutlined className="text-[var(--lf-brand)]" />;
  }
}

interface BusinessDrawerProps {
  business: Business | null;
  open: boolean;
  onClose: () => void;
  onDelete: (business: Business) => void;
  isDeleting: boolean;
  onScrapeSingle?: (businessId: number) => void;
  isScrapingSingle?: boolean;
}

interface DetailRowProps {
  icon: ReactNode;
  label: string;
  value?: string | null;
  href?: string | null;
  external?: boolean;
  onCopy?: () => void;
}

function DetailRow({
  icon,
  label,
  value,
  href,
  external,
  onCopy,
}: DetailRowProps) {
  const present = isPresent(value);

  return (
    <div className="lf-detail-row">
      <span className="lf-detail-icon" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <span className="lf-detail-label">{label}</span>
        {present && href ? (
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="lf-detail-value lf-detail-value--link"
          >
            {value}
            {external && <ExportOutlined className="ms-1 text-[11px]" aria-hidden />}
          </a>
        ) : (
          <span
            className={`lf-detail-value ${present ? "" : "lf-detail-value--muted"}`}
          >
            {present ? value : "Not available"}
          </span>
        )}
      </div>
      {present && onCopy && (
        <Tooltip title={`Copy ${label.toLowerCase()}`}>
          <Button
            type="text"
            size="small"
            aria-label={`Copy ${label}`}
            icon={<CopyOutlined />}
            onClick={onCopy}
          />
        </Tooltip>
      )}
    </div>
  );
}

export default function BusinessDrawer({
  business,
  open,
  onClose,
  onDelete,
  isDeleting,
  onScrapeSingle,
  isScrapingSingle = false,
}: BusinessDrawerProps) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [favoriteOverride, setFavoriteOverride] = useState<{ id: number; is_favorite: boolean } | null>(null);
  const [statusOverride, setStatusOverride] = useState<{ id: number; status: LeadStatus } | null>(null);
  const inputRef = useRef<InputRef>(null);
  const updateStatusMutation = useUpdateLeadStatus();

  // Notes state
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const businessId = business?.id;

  const { data: notesData, isLoading: isLoadingNotes } = useQuery({
    queryKey: businessId ? queryKeys.notes.business(businessId) : ["notes", "empty"],
    queryFn: () => (businessId ? notesApi.getBusinessNotes(businessId) : Promise.resolve({ success: true, data: [], total: 0 })),
    enabled: Boolean(open && businessId),
  });

  const notes = notesData?.data || [];

  // Activities state
  const {
    activities,
    total: totalActivities,
    isLoading: isLoadingActivities,
    isFetchingNextPage,
    hasMore: hasMoreActivities,
    loadMore: loadMoreActivities,
    error: activitiesError,
    refetch: refetchActivities,
  } = useBusinessActivities(businessId, open);

  // Follow-ups state
  const {
    followUps,
    total: totalFollowUps,
    isLoading: isLoadingFollowUps,
    statusFilter: followUpStatusFilter,
    setStatusFilter: setFollowUpStatusFilter,
    createFollowUp,
    updateFollowUp,
    completeFollowUp,
    cancelFollowUp,
    deleteFollowUp,
    isCreating: isCreatingFollowUp,
    isUpdating: isUpdatingFollowUp,
  } = useBusinessFollowUps(businessId, open);

  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);
  const [newFollowUpTitle, setNewFollowUpTitle] = useState("");
  const [newFollowUpDesc, setNewFollowUpDesc] = useState("");
  const [newFollowUpPriority, setNewFollowUpPriority] = useState<FollowUpPriority>("medium");
  const [newFollowUpDue, setNewFollowUpDue] = useState("");

  const [editingFollowUpId, setEditingFollowUpId] = useState<number | null>(null);
  const [editingFollowUpTitle, setEditingFollowUpTitle] = useState("");
  const [editingFollowUpDesc, setEditingFollowUpDesc] = useState("");
  const [editingFollowUpPriority, setEditingFollowUpPriority] = useState<FollowUpPriority>("medium");
  const [editingFollowUpDue, setEditingFollowUpDue] = useState("");

  const isFavorite =
    favoriteOverride && favoriteOverride.id === business?.id
      ? favoriteOverride.is_favorite
      : Boolean(business?.is_favorite);

  const tags = business?.tags || [];

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  const handleClose = () => {
    setIsAddingNote(false);
    setNewNoteContent("");
    setEditingNoteId(null);
    setEditingContent("");
    setIsAddingFollowUp(false);
    setNewFollowUpTitle("");
    setNewFollowUpDesc("");
    setNewFollowUpPriority("medium");
    setNewFollowUpDue("");
    setEditingFollowUpId(null);
    onClose();
  };

  const handleCreateFollowUp = async () => {
    const trimmedTitle = newFollowUpTitle.trim();
    if (!trimmedTitle) {
      message.error("Follow-up title is required");
      return;
    }
    if (trimmedTitle.length > 255) {
      message.error("Follow-up title cannot exceed 255 characters");
      return;
    }
    try {
      await createFollowUp({
        title: trimmedTitle,
        description: newFollowUpDesc.trim() || undefined,
        priority: newFollowUpPriority,
        due_at: newFollowUpDue ? new Date(newFollowUpDue).toISOString() : undefined,
      });
      setIsAddingFollowUp(false);
      setNewFollowUpTitle("");
      setNewFollowUpDesc("");
      setNewFollowUpPriority("medium");
      setNewFollowUpDue("");
    } catch {
      // Handled in mutation onError
    }
  };

  const handleStartEditFollowUp = (fu: BusinessFollowUp) => {
    setEditingFollowUpId(fu.id);
    setEditingFollowUpTitle(fu.title);
    setEditingFollowUpDesc(fu.description || "");
    setEditingFollowUpPriority(fu.priority);
    setEditingFollowUpDue(
      fu.due_at ? new Date(fu.due_at).toISOString().slice(0, 16) : ""
    );
  };

  const handleCancelEditFollowUp = () => {
    setEditingFollowUpId(null);
  };

  const handleSaveEditFollowUp = async (id: number) => {
    const trimmedTitle = editingFollowUpTitle.trim();
    if (!trimmedTitle) {
      message.error("Follow-up title is required");
      return;
    }
    if (trimmedTitle.length > 255) {
      message.error("Follow-up title cannot exceed 255 characters");
      return;
    }
    try {
      await updateFollowUp(id, {
        title: trimmedTitle,
        description: editingFollowUpDesc.trim() || null,
        priority: editingFollowUpPriority,
        due_at: editingFollowUpDue ? new Date(editingFollowUpDue).toISOString() : null,
      });
      setEditingFollowUpId(null);
    } catch {
      // Handled in mutation onError
    }
  };

  const handleToggleFavorite = async () => {
    if (!business) return;
    const nextFav = !isFavorite;
    setFavoriteOverride({ id: business.id, is_favorite: nextFav });
    try {
      await businessesApi.favoriteBusiness(business.id, nextFav);
      message.success(nextFav ? "Added to favorites" : "Removed from favorites");
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    } catch {
      setFavoriteOverride(null);
      message.error("Could not update favorite status");
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    if (!business) return;
    try {
      await tagsApi.removeTagFromBusiness({ businessId: business.id, tagId });
      message.success("Tag removed");
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    } catch {
      message.error("Could not remove tag");
    }
  };

  const handleInputConfirm = async () => {
    if (!business || !inputValue.trim()) {
      setInputVisible(false);
      setInputValue("");
      return;
    }

    try {
      await tagsApi.attachTagToBusiness({
        businessId: business.id,
        name: inputValue.trim(),
      });
      message.success("Tag added");
      setInputValue("");
      setInputVisible(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    } catch {
      message.error("Could not add tag");
    }
  };

  const handleCreateNote = async () => {
    if (!business) return;
    const trimmed = newNoteContent.trim();
    if (!trimmed) {
      message.error("Note content cannot be empty");
      return;
    }
    if (trimmed.length > 5000) {
      message.error("Note content cannot exceed 5000 characters");
      return;
    }

    setIsSubmittingNote(true);
    try {
      await notesApi.createBusinessNote(business.id, trimmed);
      message.success("Note added");
      setNewNoteContent("");
      setIsAddingNote(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.business(business.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    } catch {
      message.error("Failed to add note");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleStartEditNote = (note: BusinessNote) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditingContent("");
  };

  const handleUpdateNote = async (noteId: number) => {
    if (!business) return;
    const trimmed = editingContent.trim();
    if (!trimmed) {
      message.error("Note content cannot be empty");
      return;
    }
    if (trimmed.length > 5000) {
      message.error("Note content cannot exceed 5000 characters");
      return;
    }

    setIsSubmittingNote(true);
    try {
      await notesApi.updateBusinessNote(noteId, trimmed);
      message.success("Note updated");
      setEditingNoteId(null);
      setEditingContent("");
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.business(business.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    } catch {
      message.error("Failed to update note");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!business) return;
    try {
      await notesApi.deleteBusinessNote(noteId);
      message.success("Note deleted");
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.business(business.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    } catch {
      message.error("Failed to delete note");
    }
  };

  const copy = async (label: string, value?: string | null) => {
    if (!isPresent(value)) return;

    const ok = await copyText(value);
    if (ok) message.success(`${label} copied`);
    else message.error(`Could not copy the ${label.toLowerCase()}.`);
  };

  const websiteHref = toAbsoluteUrl(business?.website);
  const online = Boolean(websiteHref);
  const phoneNumbers = splitPhones(business?.phone);

  const leadScore = business?.lead_score ?? 0;
  const leadGrade = business?.lead_grade || "D";
  const currentStatus: LeadStatus =
    statusOverride && statusOverride.id === business?.id
      ? statusOverride.status
      : business?.lead_status || "new";

  const handleStatusChange = (nextStatus: LeadStatus) => {
    if (!business) return;
    setStatusOverride({ id: business.id, status: nextStatus });
    updateStatusMutation.mutate(
      {
        id: business.id,
        status: nextStatus,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
        },
      }
    );
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      size={480}
      title="Business details"
      className="lf-drawer"
      destroyOnHidden
      extra={
        <div className="flex items-center gap-2">
          {business && (
            <Button
              size="small"
              className={isFavorite ? "lf-btn-favorite-active" : "lf-btn-favorite"}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              icon={
                isFavorite ? (
                  <StarFilled style={{ color: "#f59e0b" }} />
                ) : (
                  <StarOutlined />
                )
              }
              onClick={handleToggleFavorite}
            >
              {isFavorite ? "Favorited" : "Favorite"}
            </Button>
          )}
          {websiteHref && (
            <Button
              type="primary"
              size="small"
              icon={<ExportOutlined aria-hidden />}
              href={websiteHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit site
            </Button>
          )}
        </div>
      }
    >
      {business && (
        <div className="flex flex-col gap-6">
          <header className="flex items-start gap-3">
            <Avatar
              size={52}
              shape="square"
              style={{
                background: avatarColor(business.name),
                color: "var(--lf-surface)",
                fontSize: 18,
                fontWeight: 650,
                flexShrink: 0,
              }}
            >
              {initials(business.name)}
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="lf-drawer-title truncate">{business.name}</h2>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {online ? (
                  <Tag color="success" icon={<CheckCircleFilled />} className="lf-tag">
                    Has Website
                  </Tag>
                ) : (
                  <Tag color="error" icon={<CloseCircleFilled />} className="lf-tag">
                    No Website
                  </Tag>
                )}
                {isPresent(business.category) && (
                  <Tag className="lf-tag">{business.category}</Tag>
                )}
                {isFavorite && (
                  <Tag color="warning" icon={<StarFilled style={{ color: "#f59e0b" }} />} className="lf-tag">
                    Favorite
                  </Tag>
                )}
              </div>
            </div>
          </header>

          {/* CRM Pipeline Status Section */}
          <section className="lf-drawer-status-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--lf-text-muted)]">
                  CRM Pipeline Status
                </span>
                <p className="text-xs text-[var(--lf-text-secondary)] mt-0.5 mb-0">
                  Lead progression state
                </p>
              </div>
              <Select
                size="middle"
                value={currentStatus}
                className={`lf-status-select lf-status-select--${currentStatus} min-w-[135px]`}
                popupClassName="lf-status-select-popup"
                onChange={handleStatusChange}
                options={LEAD_STATUS_OPTIONS}
                aria-label="Change lead status in drawer"
              />
            </div>
          </section>

          {/* Lead Score & Opportunity Breakdown */}
          <section className="lf-score-card">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className={`lf-grade-badge lf-grade-badge--${leadGrade}`}>
                  Grade {leadGrade}
                </span>
                <span className="text-sm font-bold text-[var(--lf-text)]">Lead Score</span>
              </div>
              <div className="text-right">
                <span className="lf-num text-lg font-bold text-[var(--lf-text)]">
                  {leadScore}
                </span>
                <span className="text-xs text-[var(--lf-text-muted)] font-medium"> / 100</span>
              </div>
            </div>

            <Progress
              percent={leadScore}
              showInfo={false}
              strokeColor={
                leadScore >= 80
                  ? "#10B981"
                  : leadScore >= 60
                  ? "#3B82F6"
                  : leadScore >= 40
                  ? "#F59E0B"
                  : "#64748B"
              }
              size={["100%", 6]}
            />

            {business.lead_score_reasons && business.lead_score_reasons.length > 0 && (
              <div className="mt-3.5 pt-3 border-t border-[var(--lf-border-subtle)]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--lf-text-muted)] mb-2">
                  Why this lead is valuable:
                </p>
                <ul className="lf-score-reasons">
                  {business.lead_score_reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-xs text-[var(--lf-text-secondary)]">
                      <span className="text-[var(--lf-success)] font-semibold text-[11px]">✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Tags Section */}
          <section className="lf-drawer-tags-card">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="lf-drawer-section-title mb-0">Tags</h3>
              <span className="text-xs text-[var(--lf-text-muted)]">
                {tags.length} {tags.length === 1 ? "tag" : "tags"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 min-h-[36px] p-2 rounded-lg bg-[var(--lf-surface-sunken)] border border-[var(--lf-border-subtle)]">
              {tags.map((tag) => (
                <Tag
                  key={tag.id}
                  closable
                  onClose={(e) => {
                    e.preventDefault();
                    void handleRemoveTag(tag.id);
                  }}
                  className="lf-interactive-tag"
                >
                  {tag.name}
                </Tag>
              ))}
              {inputVisible ? (
                <Input
                  ref={inputRef}
                  type="text"
                  size="small"
                  className="lf-tag-input"
                  style={{ width: 130 }}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={() => void handleInputConfirm()}
                  onPressEnter={() => void handleInputConfirm()}
                  placeholder="Tag name..."
                />
              ) : (
                <Button
                  size="small"
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => setInputVisible(true)}
                  className="lf-add-tag-btn"
                >
                  Add Tag
                </Button>
              )}
            </div>
          </section>

          {/* CRM Follow-ups Section */}
          <section className="lf-drawer-followups-card">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <h3 className="lf-drawer-section-title mb-0">Follow-ups ({totalFollowUps})</h3>
              </div>
              {!isAddingFollowUp && (
                <Button
                  size="small"
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddingFollowUp(true)}
                  className="lf-add-followup-btn"
                  id="add-followup-button"
                >
                  Add Follow-up
                </Button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-[var(--lf-border-subtle)] overflow-x-auto">
              {(["all", "pending", "completed", "cancelled"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFollowUpStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors capitalize font-medium ${
                    followUpStatusFilter === st
                      ? "bg-[var(--lf-brand)] text-white"
                      : "bg-[var(--lf-surface-sunken)] text-[var(--lf-text-secondary)] hover:text-[var(--lf-text)]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Follow-up Creation Form */}
            {isAddingFollowUp && (
              <div className="lf-followup-editor mb-3" id="add-followup-form">
                <div className="flex flex-col gap-2.5">
                  <Input
                    placeholder="Follow-up title / subject (e.g. Call owner about proposal)..."
                    value={newFollowUpTitle}
                    onChange={(e) => setNewFollowUpTitle(e.target.value)}
                    maxLength={255}
                    id="new-followup-title"
                    aria-label="New follow-up title"
                  />
                  <TextArea
                    rows={2}
                    placeholder="Additional context, discussion points or agenda (optional)..."
                    value={newFollowUpDesc}
                    onChange={(e) => setNewFollowUpDesc(e.target.value)}
                    maxLength={2000}
                    id="new-followup-description"
                    aria-label="New follow-up description"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                      <span className="text-xs text-[var(--lf-text-muted)]">Priority:</span>
                      <Select<FollowUpPriority>
                        size="small"
                        value={newFollowUpPriority}
                        onChange={(val) => setNewFollowUpPriority(val)}
                        className="flex-1"
                        id="new-followup-priority"
                        options={[
                          { label: "High Priority", value: "high" },
                          { label: "Medium Priority", value: "medium" },
                          { label: "Low Priority", value: "low" },
                        ]}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
                      <span className="text-xs text-[var(--lf-text-muted)]">Due:</span>
                      <Input
                        type="datetime-local"
                        size="small"
                        value={newFollowUpDue}
                        onChange={(e) => setNewFollowUpDue(e.target.value)}
                        className="flex-1 text-xs"
                        id="new-followup-due"
                        aria-label="New follow-up due date"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--lf-border-subtle)]">
                    <span className="text-xs text-[var(--lf-text-muted)]">
                      {newFollowUpTitle.length} / 255
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="small"
                        onClick={() => {
                          setIsAddingFollowUp(false);
                          setNewFollowUpTitle("");
                          setNewFollowUpDesc("");
                          setNewFollowUpDue("");
                        }}
                        disabled={isCreatingFollowUp}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        size="small"
                        onClick={handleCreateFollowUp}
                        loading={isCreatingFollowUp}
                        disabled={!newFollowUpTitle.trim() || isCreatingFollowUp}
                        id="save-followup-button"
                      >
                        Schedule
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Follow-ups List */}
            <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {isLoadingFollowUps ? (
                <p className="text-xs text-[var(--lf-text-muted)] py-2">Loading follow-ups...</p>
              ) : followUps.length === 0 && !isAddingFollowUp ? (
                <div className="text-center py-4 px-2 border border-dashed border-[var(--lf-border)] rounded-md">
                  <p className="text-xs text-[var(--lf-text-muted)] m-0">
                    No follow-ups found for this filter.
                  </p>
                </div>
              ) : (
                followUps.map((fu) => (
                  <div
                    key={fu.id}
                    className={`lf-followup-item ${
                      fu.status === "completed" ? "lf-followup-item--completed" : ""
                    } ${fu.is_overdue ? "lf-followup-item--overdue" : ""}`}
                    data-testid={`followup-item-${fu.id}`}
                  >
                    {editingFollowUpId === fu.id ? (
                      <div className="flex flex-col gap-2">
                        <Input
                          value={editingFollowUpTitle}
                          onChange={(e) => setEditingFollowUpTitle(e.target.value)}
                          maxLength={255}
                          aria-label="Edit follow-up title"
                        />
                        <TextArea
                          rows={2}
                          value={editingFollowUpDesc}
                          onChange={(e) => setEditingFollowUpDesc(e.target.value)}
                          maxLength={2000}
                          aria-label="Edit follow-up description"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <Select<FollowUpPriority>
                            size="small"
                            value={editingFollowUpPriority}
                            onChange={(val) => setEditingFollowUpPriority(val)}
                            style={{ width: 110 }}
                            options={[
                              { label: "High", value: "high" },
                              { label: "Medium", value: "medium" },
                              { label: "Low", value: "low" },
                            ]}
                          />
                          <Input
                            type="datetime-local"
                            size="small"
                            value={editingFollowUpDue}
                            onChange={(e) => setEditingFollowUpDue(e.target.value)}
                            className="flex-1 text-xs"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--lf-border-subtle)]">
                          <Button size="small" onClick={handleCancelEditFollowUp} disabled={isUpdatingFollowUp}>
                            Cancel
                          </Button>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => handleSaveEditFollowUp(fu.id)}
                            loading={isUpdatingFollowUp}
                            disabled={!editingFollowUpTitle.trim() || isUpdatingFollowUp}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="lf-followup-header">
                          <div className="flex items-start gap-2 min-w-0 flex-1">
                            <span className="lf-followup-title">{fu.title}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`lf-priority-badge lf-priority-badge--${fu.priority}`}>
                              {fu.priority}
                            </span>
                            {fu.is_overdue && (
                              <Tag color="error" className="lf-overdue-tag m-0 text-[10.5px] px-1.5 py-0">
                                Overdue
                              </Tag>
                            )}
                            {fu.status === "completed" && (
                              <Tag color="success" className="m-0 text-[10.5px] px-1.5 py-0">
                                Completed
                              </Tag>
                            )}
                            {fu.status === "cancelled" && (
                              <Tag className="m-0 text-[10.5px] px-1.5 py-0">
                                Cancelled
                              </Tag>
                            )}
                          </div>
                        </div>

                        {fu.description && (
                          <p className="lf-followup-desc m-0">{fu.description}</p>
                        )}

                        <div className="lf-followup-footer">
                          <div className="lf-followup-meta text-[var(--lf-text-muted)]">
                            {fu.due_at && (
                              <Tooltip title={formatAbsoluteTime(fu.due_at)}>
                                <span className={`flex items-center gap-1 ${fu.is_overdue ? "text-rose-500 font-semibold" : ""}`}>
                                  <CalendarOutlined className="text-[11px]" />
                                  <span>Due: {formatRelativeTime(fu.due_at) || formatAbsoluteTime(fu.due_at)}</span>
                                </span>
                              </Tooltip>
                            )}
                            {fu.completed_at && (
                              <Tooltip title={formatAbsoluteTime(fu.completed_at)}>
                                <span className="flex items-center gap-1 text-emerald-600">
                                  <CheckOutlined className="text-[11px]" />
                                  <span>Completed: {formatRelativeTime(fu.completed_at)}</span>
                                </span>
                              </Tooltip>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {fu.status === "pending" && (
                              <>
                                <Tooltip title="Mark completed">
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<CheckOutlined className="text-emerald-500" />}
                                    onClick={() => completeFollowUp(fu.id)}
                                    aria-label="Complete follow-up"
                                    className="lf-note-action-btn"
                                  />
                                </Tooltip>
                                <Tooltip title="Cancel follow-up">
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<CloseOutlined className="text-slate-400" />}
                                    onClick={() => cancelFollowUp(fu.id)}
                                    aria-label="Cancel follow-up"
                                    className="lf-note-action-btn"
                                  />
                                </Tooltip>
                                <Tooltip title="Edit follow-up">
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined className="text-xs" />}
                                    onClick={() => handleStartEditFollowUp(fu)}
                                    aria-label="Edit follow-up"
                                    className="lf-note-action-btn"
                                  />
                                </Tooltip>
                              </>
                            )}
                            <Popconfirm
                              title="Delete this follow-up?"
                              description="Are you sure you want to delete this scheduled follow-up?"
                              okText="Delete"
                              cancelText="Cancel"
                              okButtonProps={{ danger: true }}
                              onConfirm={() => deleteFollowUp(fu.id)}
                            >
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined className="text-xs" />}
                                aria-label="Delete follow-up"
                                className="lf-note-action-btn"
                              />
                            </Popconfirm>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Business Internal CRM Notes Section */}
          <section className="lf-drawer-notes-card">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="lf-drawer-section-title mb-0">Notes ({notes.length})</h3>
              {!isAddingNote && (
                <Button
                  size="small"
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddingNote(true)}
                  className="lf-add-note-btn"
                >
                  Add Note
                </Button>
              )}
            </div>

            {/* Note Creation Editor */}
            {isAddingNote && (
              <div className="lf-note-editor mb-3">
                <TextArea
                  rows={3}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Add internal CRM note (follow-ups, call logs, requirements)..."
                  maxLength={5000}
                  className="lf-note-textarea"
                  aria-label="New note content"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-[var(--lf-text-muted)]">
                    {newNoteContent.length} / 5000
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="small"
                      onClick={() => {
                        setIsAddingNote(false);
                        setNewNoteContent("");
                      }}
                      disabled={isSubmittingNote}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      onClick={handleCreateNote}
                      loading={isSubmittingNote}
                      disabled={!newNoteContent.trim() || isSubmittingNote}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes List */}
            <div className="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {isLoadingNotes ? (
                <p className="text-xs text-[var(--lf-text-muted)] py-2">Loading notes...</p>
              ) : notes.length === 0 && !isAddingNote ? (
                <p className="text-xs text-[var(--lf-text-muted)] py-2 italic">
                  No internal notes added yet.
                </p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="lf-note-card">
                    {editingNoteId === note.id ? (
                      <div className="lf-note-editor">
                        <TextArea
                          rows={3}
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          maxLength={5000}
                          className="lf-note-textarea"
                          aria-label="Edit note content"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-[var(--lf-text-muted)]">
                            {editingContent.length} / 5000
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              size="small"
                              onClick={handleCancelEditNote}
                              disabled={isSubmittingNote}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="primary"
                              size="small"
                              onClick={() => handleUpdateNote(note.id)}
                              loading={isSubmittingNote}
                              disabled={!editingContent.trim() || isSubmittingNote}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="lf-note-content">{note.content}</div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--lf-border-subtle)] text-[11px] text-[var(--lf-text-muted)]">
                          <span>
                            {formatAbsoluteTime(note.created_at) || "Recently"}
                            {note.updated_at && note.updated_at !== note.created_at && " (edited)"}
                          </span>
                          <div className="flex items-center gap-1">
                            <Tooltip title="Edit note">
                              <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined className="text-xs" />}
                                onClick={() => handleStartEditNote(note)}
                                aria-label="Edit note"
                                className="lf-note-action-btn"
                              />
                            </Tooltip>
                            <Popconfirm
                              title="Delete this note?"
                              description="Are you sure you want to delete this internal note?"
                              okText="Delete"
                              cancelText="Cancel"
                              okButtonProps={{ danger: true }}
                              onConfirm={() => handleDeleteNote(note.id)}
                            >
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined className="text-xs" />}
                                aria-label="Delete note"
                                className="lf-note-action-btn"
                              />
                            </Popconfirm>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Activity & History Timeline */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="lf-drawer-section-title m-0">Activity & History</h3>
                {totalActivities > 0 && (
                  <span className="lf-drawer-count-badge">{totalActivities}</span>
                )}
              </div>
            </div>

            {activitiesError ? (
              <div className="py-2.5 px-3 border border-red-500/20 bg-red-500/5 rounded-md text-xs flex items-center justify-between text-red-400">
                <span>Failed to load activity history.</span>
                <Button size="small" type="link" onClick={() => void refetchActivities()} className="p-0 h-auto text-xs">
                  Retry
                </Button>
              </div>
            ) : isLoadingActivities && activities.length === 0 ? (
              <div className="py-3">
                <Skeleton active paragraph={{ rows: 2 }} />
              </div>
            ) : activities.length === 0 ? (
              <div className="lf-activity-empty text-xs text-[var(--lf-text-muted)] italic py-3 text-center border border-dashed border-[var(--lf-border)] rounded-md">
                No activity recorded yet for this lead.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="lf-activity-timeline">
                  {activities.map((activity) => (
                    <div key={activity.id} className="lf-activity-item">
                      <div className="lf-activity-icon-container" aria-hidden>
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="lf-activity-content">
                        <div className="lf-activity-header">
                          <span className="lf-activity-title">{activity.title}</span>
                          <Tooltip title={formatAbsoluteTime(activity.created_at)}>
                            <span className="lf-activity-time">
                              {formatRelativeTime(activity.created_at) || "Recently"}
                            </span>
                          </Tooltip>
                        </div>
                        {activity.description && (
                          <div className="lf-activity-desc">{activity.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {hasMoreActivities && (
                  <Button
                    size="small"
                    type="dashed"
                    block
                    onClick={loadMoreActivities}
                    loading={isFetchingNextPage}
                    disabled={isFetchingNextPage}
                    className="text-xs text-[var(--lf-text-muted)] mt-1"
                  >
                    {isFetchingNextPage ? "Loading older activity..." : "Load older activity"}
                  </Button>
                )}
              </div>
            )}
          </section>

          <section>
            <h3 className="lf-drawer-section-title">Contact</h3>
            <div className="lf-detail-list">
              {phoneNumbers.length === 0 ? (
                <DetailRow icon={<PhoneOutlined />} label="Phone" value={null} />
              ) : (
                phoneNumbers.map((number, index) => (
                  <DetailRow
                    key={number}
                    icon={<PhoneOutlined />}
                    label={phoneNumbers.length > 1 ? `Phone ${index + 1}` : "Phone"}
                    value={number}
                    href={toTelHref(number)}
                    onCopy={() => void copy("Phone", number)}
                  />
                ))
              )}
              <DetailRow
                icon={<MailOutlined />}
                label="Email"
                value={business.email}
                href={isPresent(business.email) ? `mailto:${business.email}` : null}
                onCopy={() => void copy("Email", business.email)}
              />
              <DetailRow
                icon={<GlobalOutlined />}
                label="Website"
                value={online ? toDisplayUrl(business.website) : null}
                href={websiteHref}
                external
                onCopy={() => void copy("Website", websiteHref)}
              />
            </div>
          </section>

          {/* Website Scraping Data Card */}
          <section>
            <WebsiteDataCard
              businessId={business.id}
              websiteUrl={business.website}
              onScrapeSingle={onScrapeSingle}
              isScrapingSingle={isScrapingSingle}
            />
          </section>

          <section>
            <h3 className="lf-drawer-section-title">Location</h3>
            <div className="lf-detail-list">
              <DetailRow
                icon={<EnvironmentOutlined />}
                label="Address"
                value={business.address}
                onCopy={() => void copy("Address", business.address)}
              />
              <DetailRow
                icon={<EnvironmentOutlined />}
                label="City"
                value={business.city}
              />
            </div>

            <Button
              block
              className="mt-3"
              icon={<EnvironmentOutlined aria-hidden />}
              href={toMapsUrl(business)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps
            </Button>
          </section>

          <section>
            <h3 className="lf-drawer-section-title">Danger zone</h3>
            <Button
              block
              danger
              icon={<DeleteOutlined aria-hidden />}
              loading={isDeleting}
              disabled={isDeleting}
              onClick={() => onDelete(business)}
            >
              Delete this business
            </Button>
          </section>
        </div>
      )}
    </Drawer>
  );
}
