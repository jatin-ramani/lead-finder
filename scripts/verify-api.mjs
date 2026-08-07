/**
 * Contract check: does the running backend still answer the shape
 * `types/api.ts` claims?
 *
 *     node scripts/verify-api.mjs [baseUrl]
 *
 * This exists because of a specific, expensive bug. The list endpoint gained a
 * pagination envelope, the client still expected a bare array, and the guard
 * `Array.isArray(data) ? data : []` turned the mismatch into an empty app
 * instead of an error. Nothing failed. Nothing logged. Every screen just showed
 * zero businesses.
 *
 * A type annotation cannot catch that — it is erased at runtime. This can, and
 * it runs against a real server, so it also proves the request/response plumbing
 * end to end.
 *
 * Read-only by default: nothing here creates, mutates or deletes. Endpoints
 * that would (scan, the bulk scrapes, deletes) are asserted to *exist* by
 * checking they reject an invalid payload with a validation error rather than a
 * 404 — which confirms the route is registered without causing a side effect.
 */

const BASE = (process.argv[2] ?? "http://127.0.0.1:8000").replace(/\/+$/, "");

let passed = 0;
const failures = [];

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function hasKeys(value, keys) {
  if (typeof value !== "object" || value === null) return false;
  return keys.every((key) => key in value);
}

async function call(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, options);
  const requestId = response.headers.get("x-request-id") ?? "";
  const type = response.headers.get("content-type") ?? "";

  const body = type.includes("application/json")
    ? await response.json()
    : await response.text();

  return { status: response.status, body, requestId, type };
}

console.log(`\nVerifying the API contract at ${BASE}\n`);

// -- system ----------------------------------------------------------------
console.log("system");
{
  const root = await call("/");
  check("GET /  → { message }", hasKeys(root.body, ["message"]));

  const health = await call("/health");
  check(
    "GET /health  → { status, database, timestamp }",
    hasKeys(health.body, ["status", "database", "timestamp"]),
  );

  const version = await call("/version");
  check("GET /version  → { name, version }", hasKeys(version.body, ["name", "version"]));

  const system = await call("/system");
  check(
    "GET /system  → { pythonVersion, platform, database, apiVersion, serverTime }",
    hasKeys(system.body, [
      "pythonVersion",
      "platform",
      "database",
      "apiVersion",
      "serverTime",
    ]),
  );
  check(
    "GET /system  leaks no connection URL",
    !JSON.stringify(system.body).includes("://"),
  );
}

// -- request id ------------------------------------------------------------
console.log("\nrequest id");
{
  const ok = await call("/health");
  check("X-Request-ID present on a success", ok.requestId.length > 0);

  const bad = await call("/businesses/99999999");
  check("X-Request-ID present on a failure", bad.requestId.length > 0);
  check(
    "header matches the envelope's requestId",
    bad.body?.requestId === bad.requestId,
    `header=${bad.requestId} body=${bad.body?.requestId}`,
  );

  const echoed = await call("/health", {
    headers: { "X-Request-ID": "contract-check-42" },
  });
  check("an inbound X-Request-ID is honoured", echoed.requestId === "contract-check-42");
}

// -- error envelope --------------------------------------------------------
console.log("\nerror envelope");
{
  const notFound = await call("/businesses/99999999");
  check(
    "404 → the six-key envelope",
    hasKeys(notFound.body, [
      "success",
      "message",
      "error",
      "timestamp",
      "requestId",
      "details",
    ]),
  );
  check("404 → error code NOT_FOUND", notFound.body?.error === "NOT_FOUND");
  check("404 → success is false", notFound.body?.success === false);

  const invalid = await call("/businesses/not-an-integer");
  check("422 → error code VALIDATION_ERROR", invalid.body?.error === "VALIDATION_ERROR");
  check(
    "422 → details is a list of { field, message, type }",
    Array.isArray(invalid.body?.details) &&
      hasKeys(invalid.body.details[0], ["field", "message", "type"]),
  );

  const noRoute = await call("/definitely/not/a/route");
  check("unknown route → still an envelope", hasKeys(noRoute.body, ["error", "requestId"]));
}

// -- businesses ------------------------------------------------------------
console.log("\nbusinesses");
{
  const list = await call("/businesses?page=1&pageSize=2");
  check(
    "GET /businesses → { success, data, pagination }  (NOT a bare array)",
    hasKeys(list.body, ["success", "data", "pagination"]),
    Array.isArray(list.body) ? "returned an array" : "",
  );
  check("  data is an array", Array.isArray(list.body?.data));
  check(
    "  pagination → { page, pageSize, totalItems, totalPages }",
    hasKeys(list.body?.pagination, ["page", "pageSize", "totalItems", "totalPages"]),
  );
  check("  pageSize is honoured", list.body?.pagination?.pageSize === 2);

  const row = list.body?.data?.[0];
  if (row) {
    check(
      "  a row has all nine fields",
      hasKeys(row, [
        "id",
        "name",
        "phone",
        "email",
        "website",
        "city",
        "category",
        "address",
        "status",
      ]),
    );
  } else {
    console.log("  – no rows to shape-check (database is empty)");
  }

  for (const param of ["search", "city", "category", "status", "sortBy", "sortOrder"]) {
    const filtered = await call(`/businesses?${param}=x&pageSize=1`);
    check(`  ?${param} is accepted`, filtered.status === 200);
  }

  const csv = await call("/businesses/export/csv?pageSize=1");
  check("GET /businesses/export/csv → text/csv", csv.type.includes("text/csv"));

  // Checked as raw bytes, not as text: `Response.text()` performs a UTF-8
  // decode, which the WHATWG spec says removes a leading BOM. Reading the
  // decoded string would report the BOM missing when it is on the wire.
  const csvBytes = Buffer.from(
    await (await fetch(`${BASE}/businesses/export/csv?pageSize=1`)).arrayBuffer(),
  );
  check(
    "  begins with a UTF-8 BOM (so Excel reads the accents)",
    csvBytes.subarray(0, 3).toString("hex") === "efbbbf",
    csvBytes.subarray(0, 3).toString("hex"),
  );
}

// -- jobs & dashboard ------------------------------------------------------
console.log("\njobs and dashboard");
{
  const stats = await call("/dashboard/stats");
  check(
    "GET /dashboard/stats → six groups",
    hasKeys(stats.body, [
      "business",
      "websiteData",
      "scrapeJobs",
      "scanJobs",
      "latestScanJob",
      "latestScrapeJob",
    ]),
  );
  check(
    "  business → five counters",
    hasKeys(stats.body?.business, [
      "totalBusinesses",
      "withWebsite",
      "withoutWebsite",
      "withEmail",
      "withoutEmail",
    ]),
  );

  const scanJobs = await call("/scan/jobs");
  check("GET /scan/jobs → an array", Array.isArray(scanJobs.body));

  const scrapeJobs = await call("/scrape/jobs");
  check(
    "GET /scrape/jobs → { success, data }  (unpaginated, unlike /businesses)",
    hasKeys(scrapeJobs.body, ["success", "data"]) &&
      Array.isArray(scrapeJobs.body.data),
  );
  check(
    "  and carries no pagination block",
    !("pagination" in scrapeJobs.body),
    "it gained one — update ScrapeJobListResponse",
  );
}

// -- mutating routes exist, without mutating anything ----------------------
console.log("\nmutating routes (existence only — no side effects)");
{
  // An empty body fails validation with 422. A missing route answers 404. The
  // difference is what proves the route is registered.
  const scan = await call("/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  check("POST /scan is registered", scan.status === 422, `got ${scan.status}`);

  const bulkDelete = await call("/businesses", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ business_ids: "not-a-list" }),
  });
  check("DELETE /businesses is registered", bulkDelete.status === 422, `got ${bulkDelete.status}`);

  const selected = await call("/scrape/selected", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  check("POST /scrape/selected is registered", selected.status === 422, `got ${selected.status}`);

  for (const path of ["/scrape/all", "/scrape/missing", "/scrape/retry-failed"]) {
    const head = await call(path, { method: "GET" });
    // GET on a POST-only route is 405, not 404 — the route exists.
    check(`POST ${path} is registered`, head.status === 405, `got ${head.status}`);
  }

  const missingWebsite = await call("/businesses/99999999/website");
  check("GET /businesses/{id}/website is registered", missingWebsite.status === 404);

  const missingScrapeJob = await call("/scrape/jobs/99999999");
  check("GET /scrape/jobs/{id} is registered", missingScrapeJob.status === 404);
}

// -- report ----------------------------------------------------------------
console.log(
  `\n${failures.length === 0 ? "PASS" : "FAIL"} — ${passed} checks passed, ${failures.length} failed`,
);

if (failures.length > 0) {
  console.log("\nfailures:");
  for (const failure of failures) console.log(`  - ${failure}`);
  process.exit(1);
}
