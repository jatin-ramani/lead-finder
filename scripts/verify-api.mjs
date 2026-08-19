/** Read-only release contract verification against a running Lead Finder API. */
const BASE = (process.argv[2] ?? process.env.VERIFY_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
const SECRET = process.env.VERIFY_API_ADMIN_SECRET ?? process.env.PLAYWRIGHT_ADMIN_SECRET;
let cookie = "";
let passed = 0;
const failures = [];

function check(name, condition, detail = "") {
  if (condition) { passed += 1; console.log(`  ✓ ${name}`); return; }
  failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
  console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
}
function hasKeys(value, keys) { return value !== null && typeof value === "object" && keys.every((key) => key in value); }
function query(params) { const value = new URLSearchParams(); for (const [key, item] of Object.entries(params)) if (item !== undefined) value.set(key, String(item)); return value.toString(); }
function satisfies(row, filters) {
  if (filters.has_website === true && !String(row.website ?? "").trim()) return false;
  if (filters.has_website === false && String(row.website ?? "").trim()) return false;
  if (filters.has_email === true && !String(row.email ?? "").trim()) return false;
  if (filters.has_phone === true && !String(row.phone ?? "").trim()) return false;
  return true;
}
async function request(path, options = {}, authenticated = true) {
  const headers = new Headers(options.headers);
  if (authenticated && cookie) headers.set("Cookie", cookie);
  const response = await fetch(`${BASE}${path}`, { ...options, headers, signal: AbortSignal.timeout(15000) });
  const type = response.headers.get("content-type") ?? "";
  const bytes = Buffer.from(await response.arrayBuffer());
  let body = bytes;
  if (type.includes("application/json")) body = JSON.parse(bytes.toString("utf8"));
  else if (type.includes("text/")) body = bytes.toString("utf8").replace(/^\uFEFF/, "");
  return { status: response.status, type, body, bytes, requestId: response.headers.get("x-request-id") ?? "", disposition: response.headers.get("content-disposition") ?? "" };
}
function csvRows(bytes) {
  const text = bytes.toString("utf8").replace(/^\uFEFF/, "");
  const rows = []; let row = []; let field = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') { field += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(field); field = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field); if (row.some((value) => value !== "")) rows.push(row); row = []; field = "";
    } else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}
async function authenticate() {
  if (!SECRET) throw new Error("VERIFY_API_ADMIN_SECRET must be set; the verifier never reads or stores a credential from source files.");
  const response = await fetch(`${BASE}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ secret: SECRET }), signal: AbortSignal.timeout(15000) });
  if (response.status !== 200) throw new Error(`Authentication failed with HTTP ${response.status}.`);
  const setCookie = response.headers.get("set-cookie") ?? "";
  cookie = setCookie.split(";", 1)[0];
  if (!cookie) throw new Error("Authentication succeeded but no session cookie was returned.");
}

async function main() {
  console.log(`\nVerifying current API contract at ${BASE}\n`);
  const health = await request("/health", {}, false);
  check("public GET /health contract", health.status === 200 && hasKeys(health.body, ["status", "database", "timestamp"]));
  const version = await request("/version", {}, false);
  check("public GET /version contract", version.status === 200 && hasKeys(version.body, ["name", "version"]));
  const root = await request("/", {}, false);
  check("public GET / contract", root.status === 200 && hasKeys(root.body, ["message"]));

  await authenticate();
  const me = await request("/auth/me");
  check("authenticated session accepted", me.status === 200 && me.body?.authenticated === true);
  const protectedWithoutCookie = await request("/businesses", {}, false);
  check("protected endpoint rejects anonymous requests", protectedWithoutCookie.status === 401);

  const unknown = await request("/businesses/999999999");
  check("standard error envelope", unknown.status === 404 && hasKeys(unknown.body, ["success", "message", "error", "timestamp", "requestId", "details"]));
  check("error requestId matches header", Boolean(unknown.requestId) && unknown.body?.requestId === unknown.requestId);
  const validation = await request("/businesses/not-an-integer");
  check("validation error envelope", validation.status === 422 && validation.body?.error === "VALIDATION_ERROR" && Array.isArray(validation.body?.details));

  const baseList = await request("/businesses?page=1&pageSize=100");
  check("business pagination contract", baseList.status === 200 && Array.isArray(baseList.body?.data) && hasKeys(baseList.body?.pagination, ["page", "pageSize", "totalItems", "totalPages"]));
  const combinations = [
    {}, { has_website: false }, { has_website: false, has_email: true }, { has_website: false, has_phone: true },
    { has_website: false, has_email: true, has_phone: true }, { has_website: true }, { has_website: true, has_email: true },
    { has_website: true, has_phone: true }, { has_website: true, has_email: true, has_phone: true },
    { has_email: true }, { has_phone: true }, { has_email: true, has_phone: true },
  ];
  for (const filters of combinations) {
    const label = Object.keys(filters).length ? query(filters) : "no qualification filters";
    const result = await request(`/businesses?${query({ ...filters, page: 1, pageSize: 100 })}`);
    check(`filter ${label}`, result.status === 200 && Array.isArray(result.body?.data) && result.body.data.every((row) => satisfies(row, filters)));
  }

  const exportFilters = { has_website: false, has_email: true, has_phone: true };
  const preview = await request("/businesses/export/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scope: "filtered", filters: exportFilters, qualification: {} }) });
  check("filtered export preview contract", preview.status === 200 && hasKeys(preview.body, ["total_selected", "matching_qualification", "export_count"]));
  const csv = await request(`/businesses/export/csv?${query(exportFilters)}`);
  const filteredRows = csvRows(csv.bytes);
  check("filtered CSV contract and UTF-8 BOM", csv.status === 200 && csv.type.includes("text/csv") && csv.bytes.subarray(0, 3).toString("hex") === "efbbbf");
  check("filtered preview equals exported row count", preview.body?.export_count === Math.max(0, filteredRows.length - 1), `preview=${preview.body?.export_count} rows=${Math.max(0, filteredRows.length - 1)}`);
  check("CSV filename is exposed", /attachment;\s*filename=/i.test(csv.disposition));

  const ids = (baseList.body?.data ?? []).slice(0, 2).map((row) => row.id);
  if (ids.length) {
    const selectedPreview = await request("/businesses/export/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scope: "selected", business_ids: ids, qualification: { has_email: true } }) });
    const selectedCsv = await request("/businesses/export/csv", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ business_ids: ids, has_email: true }) });
    check("selected export preview contract", selectedPreview.status === 200);
    check("selected preview equals exported row count", selectedPreview.body?.export_count === Math.max(0, csvRows(selectedCsv.bytes).length - 1));
  } else console.log("  – selected export row comparison skipped because the controlled database is empty");

  const dashboard = await request("/dashboard/stats");
  check("dashboard contract", dashboard.status === 200 && hasKeys(dashboard.body, ["business", "websiteData", "scrapeJobs", "scanJobs", "latestScanJob", "latestScrapeJob"]) && hasKeys(dashboard.body.business, ["totalBusinesses", "withWebsite", "withoutWebsite", "withEmail", "withPhone", "actionableLeads"]));
  const scans = await request("/scan/jobs");
  check("scan job read contract", scans.status === 200 && Array.isArray(scans.body));
  const scrapes = await request("/scrape/jobs");
  check("scrape job read contract", scrapes.status === 200 && Array.isArray(scrapes.body?.data) && !("pagination" in scrapes.body));
  for (const [path, method, body] of [["/scan", "POST", {}], ["/scrape/selected", "POST", {}]]) {
    const registered = await request(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    check(`${method} ${path} registered without launching work`, registered.status === 422, `HTTP ${registered.status}`);
  }

  console.log(`\n${failures.length ? "FAIL" : "PASS"} — ${passed} checks passed, ${failures.length} failed`);
  if (failures.length) { console.log("\nFailures:"); for (const failure of failures) console.log(`  - ${failure}`); process.exitCode = 1; }
}
main().catch((error) => { console.error(`\nFAIL — API verification could not run: ${error.message}`); process.exitCode = 1; });
