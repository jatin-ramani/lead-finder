"use client";

import { DownloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Checkbox, Modal, Radio, Typography } from "antd";
import { useMemo, useState } from "react";
import { businessesApi, queryKeys } from "@/services";
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
  const [qualify, setQualify] = useState(false); const [hasEmail, setHasEmail] = useState(false); const [hasPhone, setHasPhone] = useState(false);
  const qualification = useMemo(() => qualify ? { has_email: hasEmail, has_phone: hasPhone } : {}, [qualify, hasEmail, hasPhone]);
  const request: ExportPreviewRequest = useMemo(() => ({ scope, ...(scope === "selected" ? { business_ids: selectedIds } : { filters: filtersOf(query) }), qualification }), [scope, selectedIds, query, qualification]);
  const preview = useQuery({ queryKey: queryKeys.businesses.exportPreview(request), queryFn: ({ signal }) => businessesApi.previewBusinessesExport(request, signal) });
  const count = preview.data?.export_count ?? 0;
  const summary = [query.has_website === true ? "Has website" : query.has_website === false ? "No website" : null, query.has_email || hasEmail ? "Has email" : null, query.has_phone || hasPhone ? "Has phone" : null].filter(Boolean).join(" + ") || "All businesses";
  const submit = () => { if (scope === "selected") onExportSelected(selectedIds, qualification); else onExportFiltered({ ...query, ...(qualify && hasEmail ? { has_email: true } : {}), ...(qualify && hasPhone ? { has_phone: true } : {}) }); onClose(); };
  return <div className="flex flex-col gap-4 py-2">
    <Text strong>Export scope</Text>
    <Radio.Group value={scope} onChange={(e) => setScope(e.target.value)} className="flex flex-col gap-2"><Radio value="filtered">Current filtered results</Radio><Radio value="selected" disabled={!selectedIds.length}>Selected businesses ({selectedIds.length})</Radio></Radio.Group>
    <Checkbox checked={qualify} onChange={(e) => setQualify(e.target.checked)}>Only export businesses with contact information</Checkbox>
    {qualify && <div className="flex gap-3" role="group" aria-label="Contact requirements"><Checkbox checked={hasEmail} onChange={(e) => setHasEmail(e.target.checked)}>Has email</Checkbox><Checkbox checked={hasPhone} onChange={(e) => setHasPhone(e.target.checked)}>Has phone</Checkbox></div>}
    <Text type="secondary">Exporting businesses matching: {summary}</Text>
    {preview.isError && <Alert type="error" showIcon message="Could not calculate export count." />}
    <Text>{preview.isLoading ? "Calculating?" : `${count.toLocaleString()} businesses will be exported.`}</Text>
    <div className="flex justify-end gap-2"><Button onClick={onClose}>Cancel</Button><Button type="primary" icon={<DownloadOutlined />} loading={isExporting} disabled={preview.isLoading || preview.isError || count === 0 || (qualify && !hasEmail && !hasPhone)} onClick={submit}>Export</Button></div>
  </div>;
}

export default function ExportModal({ open, ...props }: Props) { return <Modal title="Export businesses" open={open} onCancel={props.onClose} footer={null} destroyOnHidden>{open && <Body {...props} />}</Modal>; }
