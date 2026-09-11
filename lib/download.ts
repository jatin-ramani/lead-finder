/**
 * Saves a Blob the browser already holds to the user's disk.
 *
 * Used by the CSV exports. A plain `<a href={url} download>` would be simpler
 * but cannot work here: the export endpoints need the current filter query or a
 * POST body, so the file has to be fetched through the API client and arrives
 * as a Blob rather than a URL.
 *
 * `revokeObjectURL` is not optional — every object URL pins its Blob in memory
 * for the life of the document, so a user exporting repeatedly would leak the
 * whole set.
 */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.rel = "noopener";

  // Firefox requires the anchor to be in the document for a synthetic click.
  document.body.appendChild(link);
  link.click();
  link.remove();

  // On Android Chrome and mobile WebViews, revoking the object URL immediately
  // can abort the underlying download stream before the system download manager
  // begins saving the file. Delay cleanup to ensure the download completes cleanly.
  setTimeout(() => {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore cleanup error if already revoked or window closed
    }
  }, 3_000);
}

