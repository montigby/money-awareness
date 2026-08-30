type AnalyticsEvent = {
  event: string;
  distinctId: string;
  properties?: Record<string, string | number | boolean | null | undefined>;
};

export async function captureAnalyticsEvent({
  event,
  distinctId,
  properties = {},
}: AnalyticsEvent) {
  const apiKey = process.env.POSTHOG_KEY;
  const host = (process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com").replace(/\/$/, "");

  if (!apiKey) return;

  try {
    await fetch(`${host}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        event,
        properties: {
          distinct_id: distinctId,
          ...properties,
        },
      }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Analytics capture failed", error);
  }
}
