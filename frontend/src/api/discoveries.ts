import type { DiscoveredToken } from "../Common/types";

const DISCOVERIES_URL =
  "http://localhost:8000/api/discoveries";

export async function fetchDiscoveries(
  signal?: AbortSignal,
): Promise<DiscoveredToken[]> {
  const response = await fetch(DISCOVERIES_URL, {
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Discovery request failed with status ${response.status}`,
    );
  }

  return response.json();
}


export async function dismissDiscovery(
  discoveryId: number,
): Promise<void> {
  const response = await fetch(
    `${DISCOVERIES_URL}/${discoveryId}/dismiss`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Dismiss request failed with status ${response.status}`,
    );
  }
}
