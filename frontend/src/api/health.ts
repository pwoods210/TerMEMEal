import type {
  ServiceStatus,
  ServicesHealthResponse,
} from "../Common/types";

export async function getServicesHealth(): Promise<ServicesHealthResponse> {
  const [servicesResponse, apiResponse] = await Promise.all([
    fetch("http://localhost:8000/health/services"),
    fetch("http://localhost:8000/health/api"),
  ]);

  if (!servicesResponse.ok) {
    throw new Error("Failed to fetch service health");
  }

  const services = await servicesResponse.json();

  let apiStatus: ServiceStatus = "down";

  if (apiResponse.ok) {
    const apiHealthy = await apiResponse.json();

    if (apiHealthy === true) {
      apiStatus = "up";
    }
  }

  return {
    ...services,

    api: {
      status: apiStatus,
    },
  };
}
