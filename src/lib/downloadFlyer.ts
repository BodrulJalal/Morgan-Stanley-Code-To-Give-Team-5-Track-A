const FLYER_API_BASE =
  "https://platform.foodhelpline.org/api/resources.pdf";

export type DownloadFlyerResult =
  | { ok: true; filename: string }
  | { ok: false; error: string };

/**
 * Fetches a print-ready PDF flyer for the given location and triggers a
 * browser download. The API returns application/pdf (stream), not JSON.
 */
export async function downloadAreaFlyer(
  lat: number,
  lng: number,
  locationName: string
): Promise<DownloadFlyerResult> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    locationName: locationName.trim() || "Event",
  });
  const url = `${FLYER_API_BASE}?${params.toString()}`;

  try {
    const res = await fetch(url, { method: "GET" });

    if (res.status === 400) {
      return {
        ok: false,
        error: "Invalid request. Please check the location and try again.",
      };
    }
    if (res.status === 422) {
      return {
        ok: false,
        error: "This location isn't supported for flyer generation yet.",
      };
    }
    if (!res.ok) {
      return {
        ok: false,
        error: `Could not generate flyer (${res.status}). Please try again later.`,
      };
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/pdf")) {
      return {
        ok: false,
        error: "Server did not return a PDF. Please try again later.",
      };
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const safeName = locationName.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "flyer";
    const filename = `${safeName}-flyer.pdf`;

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);

    return { ok: true, filename };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network or unknown error";
    return {
      ok: false,
      error: `Failed to download flyer: ${message}`,
    };
  }
}
