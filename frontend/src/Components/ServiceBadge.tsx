interface ServiceBadgeProps {
  name: string;
  status: "up" | "down" | "unknown";
}

export function ServiceBadge({
  name,
  status,
}: ServiceBadgeProps) {
  const badgeClass =
    status === "up"
      ? "text-bg-success"
      : status === "down"
        ? "text-bg-danger"
        : "text-bg-secondary";

  const label =
    status === "up"
      ? "Online"
      : status === "down"
        ? "Offline"
        : "Checking";

  return (
    <span
      className={`badge rounded-pill ${badgeClass} d-flex align-items-center gap-2`}
    >
      <span className="service-status-dot" />

      {name}

      <span className="service-status-label">
        {label}
      </span>
    </span>
  );
}
