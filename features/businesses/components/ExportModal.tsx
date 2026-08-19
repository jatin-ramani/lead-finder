"use client";

import { DownloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Checkbox, Modal, Radio, Typography } from "antd";
import { useMemo, useState } from "react";
import { businessesApi, queryKeys } from "@/services";
import { isApiError } from "@/services/errors";
import type { BusinessQuery, ContactQualification, ExportPreviewRequest } from "@/types/api";

const { Text } = Typography;
type Scope = "filtered" | "selected";
interface Props { open: boolean; onClose: () => void; query: BusinessQuery; matchingTotal?: number; selectedIds: number[]; initialScope?: Scope; onExportFiltered: (query: BusinessQuery) => void; onExportSelected: (ids: number[], qualification?: ContactQualification) => void; isExporting: boolean; }

function filtersOf(query: BusinessQuery) {
  const { search, city, category, has_website, has_email, has_phone } = query;
  return { search, city, category, has_website, has_email, has_phone };
}

function Body({ query, selectedIds, initialScope, onExportFiltered, onExportSelected, onClose, isExporting }: Omit<Props, "open" | "matchingTotal">) {
  const [scope, setScope] = useState<Scope>(() => initialScope === "selected" && selectedIds.length ? "selected" : "filtered");
  const [qualify, setQualify] = useState(false);
  const [websiteRequirement, setWebsiteRequirement] = useState<boolean | undefined>();
  const [hasEmail, setHasEmail] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const qualification = useMemo(() => qualify ? { has_email: hasEmail, has_phone: hasPhone } : {}, [qualify, hasEmail, hasPhone]);
  const filteredQuery = useMemo(() => ({ ...filtersOf(query), ...(websiteRequirement !== undefined ? { has_website: websiteRequirement } : {}) }), [query, websiteRequirement]);
  const request: ExportPreviewRequest = useMemo(() => ({ scope, ...(scope === "selected" ? { business_ids: selectedIds } : { filters: filteredQuery }), qualification }), [scope, selectedIds, filteredQuery, qualification]);
  const preview = useQuery({ queryKey: queryKeys.businesses.exportPreview(request), queryFn: ({ signal }) => businessesApi.previewBusinessesExport(request, signal) });
  const count = preview.data?.export_count;
  const effectiveWebsite = scope === "filtered" ? websiteRequirement ?? query.has_website : undefined;
  const summary = [effectiveWebsite === true ? "Has website" : effectiveWebsite === false ? "No website" : null, query.has_email || hasEmail ? "Has email" : null, query.has_phone || hasPhone ? "Has phone" : null].filter(Boolean).join(" + ") || "All businesses";
  const errorMessage = preview.error && isApiError(preview.error)
    ? preview.error.message
    : "Could not calculate the export count. Please try again.";
  const countMessage = count === undefined
    ? null
    : scope === "selected"
      ? `${count.toLocaleString()} of ${selectedIds.length.toLocaleString()} selected businesses match your criteria.`
      : qualify
        ? `${count.toLocaleString()} businesses will be exported.`
        : `${count.toLocaleString()} businesses match your current filters.`;
  const submit = () => { if (scope === "selected") onExportSelected(selectedIds, qualification); else onExportFiltered({ ...query, ...(websiteRequirement !== undefined ? { has_website: websiteRequirement } : {}), ...(qualify && hasEmail ? { has_email: true } : {}), ...(qualify && hasPhone ? { has_phone: true } : {}) }); onClose(); };

  return <div className="flex flex-col gap-4 py-2">
    <Text strong>Export scope</Text>
    <Radio.Group value={scope} onChange={(e) => setScope(e.target.value)} className="flex flex-col gap-2"><Radio value="filtered">Current filtered results</Radio><Radio value="selected" disabled={!selectedIds.length}>Selected businesses ({selectedIds.length})</Radio></Radio.Group>
    {scope === "filtered" && <div className="lf-export-requirement" role="group" aria-label="Website requirement"><Text strong>Website requirement</Text><div className="flex gap-3"><Checkbox checked={websiteRequirement === true} onChange={(e) => setWebsiteRequirement(e.target.checked ? true : undefined)}>Has website</Checkbox><Checkbox checked={websiteRequirement === false} onChange={(e) => setWebsiteRequirement(e.target.checked ? false : undefined)}>No website</Checkbox></div></div>}
    <Checkbox checked={qualify} onChange={(e) => setQualify(e.target.checked)}>Only export businesses with contact information</Checkbox>
    {qualify && <div className="flex gap-3" role="group" aria-label="Contact requirements"><Checkbox checked={hasEmail} onChange={(e) => setHasEmail(e.target.checked)}>Has email</Checkbox><Checkbox checked={hasPhone} onChange={(e) => setHasPhone(e.target.checked)}>Has phone</Checkbox></div>}
    <Text type="secondary">Exporting businesses matching: {summary}</Text>
    {preview.isError
      ? <Alert type="error" showIcon title="Failed to calculate export count" description={errorMessage} />
      : <Text>{preview.isLoading ? "Calculating…" : countMessage}</Text>}
    <div className="flex justify-end gap-2"><Button onClick={onClose}>Cancel</Button><Button type="primary" icon={<DownloadOutlined />} loading={isExporting} disabled={preview.isLoading || preview.isError || !count || (qualify && !hasEmail && !hasPhone)} onClick={submit}>Export</Button></div>
  </div>;
}

export default function ExportModal({ open, ...props }: Props) { return <Modal title="Export businesses" open={open} onCancel={props.onClose} footer={null} destroyOnHidden>{open && <Body {...props} />}</Modal>; }
