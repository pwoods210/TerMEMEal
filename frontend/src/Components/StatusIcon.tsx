import type {
  GroupStatus,
  ServiceHealthMap,
  ServiceStatus,
} from "../Common/types";

interface SystemStatusIconProps {
  services: ServiceHealthMap;
}

function getGroupStatus(
  services: ServiceHealthMap,
): GroupStatus {
  const items = Object.values(services);

  if (
    items.some(
      (service) => service.status === "unknown",
    )
  ) {
    return "checking";
  }

  if (
    services.api.status === "down" ||
    services.database.status === "down"
  ) {
    return "critical";
  }

  if (
    items.some(
      (service) =>
        service.status === "down" ||
        service.status === "inactive",
    )
  ) {
    return "degraded";
  }

  return "healthy";
}

function getStatusLabel(status: ServiceStatus): string {
  switch (status) {
    case "up":
      return "Online";

    case "down":
      return "Offline";

    case "degraded":
      return "Degraded";

    case "inactive":
      return "Inactive";

    case "unknown":
    default:
      return "Checking";
  }
}

export function SystemStatusIcon({
  services,
}: SystemStatusIconProps) {
  const groupStatus = getGroupStatus(services);

  return (
    <div className="system-status">
      <button
        type="button"
        className="system-status__trigger"
        data-group-status={groupStatus}
        aria-label={`System status: ${groupStatus}`}
      >
        <span className="system-status__glow" />
        <span className="system-status__ring" />

        <span
          className="system-status__indicator system-status__indicator--discovery"
          data-status={services.discovery.status}
          title={`Discovery: ${getStatusLabel(
            services.discovery.status,
          )}`}
        />
        <span
          className="system-status__indicator system-status__indicator--trade"
          data-status={services.trade.status}
          title={`Trade: ${getStatusLabel(
            services.trade.status,
          )}`}
        />
        <span
          className="system-status__indicator system-status__indicator--database"
          data-status={services.database.status}
          title={`Database: ${getStatusLabel(
            services.database.status,
          )}`}
        />
        <span
          className="system-status__indicator system-status__indicator--api"
          data-status={services.api.status}
          title={`API: ${getStatusLabel(
            services.api.status,
          )}`}
        />
      </button>

      <div
        className="system-status__tooltip"
        role="tooltip"
      >
        <div className="system-status__tooltip-title">
          System Status
        </div>

        <div className="system-status__tooltip-group">
          Overall:
          <span
            className="system-status__tooltip-pill"
            data-group-status={groupStatus}
          >
            {groupStatus}
          </span>
        </div>

        <div className="system-status__service-list">
          {Object.entries(services).map(
            ([key, service]) => (
              <div
                key={key}
                className="system-status__service-row"
              >
                <div className="system-status__service-left">
                  <span
                    className="system-status__service-dot"
                    data-status={service.status}
                  />
                  <span>{service.label}</span>
                </div>

                <div className="system-status__service-right">
                  <span className="system-status__service-state">
                    {getStatusLabel(service.status)}
                  </span>

                  {service.detail ? (
                    <span className="system-status__service-detail">
                      {service.detail}
                    </span>
                  ) : null}
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
