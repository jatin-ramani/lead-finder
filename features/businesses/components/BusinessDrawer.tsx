"use client";

import {
  CheckCircleFilled,
  CloseCircleFilled,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExportOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Avatar, Button, Drawer, Input, type InputRef, Popconfirm, Progress, Tag, Tooltip } from "antd";
import { type ReactNode, useEffect, useRef, useState } from "react";

import WebsiteDataCard from "@/features/scraping/components/WebsiteDataCard";
import {
  avatarColor,
  copyText,
  formatAbsoluteTime,
  initials,
  isPresent,
  splitPhones,
  toAbsoluteUrl,
  toDisplayUrl,
  toMapsUrl,
  toTelHref,
} from "@/lib/format";
import { businessesApi, notesApi, queryKeys, tagsApi } from "@/services";
import type { Business, BusinessNote } from "@/types/api";

const { TextArea } = Input;

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
  const inputRef = useRef<InputRef>(null);

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
    onClose();
  };

  const handleToggleFavorite = async () => {
    if (!business) return;
    const nextFav = !isFavorite;
    setFavoriteOverride({ id: business.id, is_favorite: nextFav });
    try {
      await businessesApi.favoriteBusiness(business.id, nextFav);
      message.success(nextFav ? "Added to favorites" : "Removed from favorites");
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
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
