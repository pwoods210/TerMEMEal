import { useQuery } from "@tanstack/react-query";

import { getServicesHealth } from "../api/health";
import { SystemStatusIcon } from "./StatusIcon";
import type { ServiceHealthMap } from "../Common/types";

import appLogo from "../assets/turmemeal_icon.svg";

function Header() {
  const {
    data: serviceHealth,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["service-health"],
    queryFn: getServicesHealth,
    refetchInterval: 5000,
  });

  const services: ServiceHealthMap = isError
    ? {
        discovery: {
          label: "Discovery",
          status: "unknown",
          detail: "Unable to retrieve service status",
        },

        trade: {
          label: "Trade",
          status: "inactive",
          detail: "Service not implemented yet",
        },

        database: {
          label: "Database",
          status: "unknown",
          detail: "Unable to retrieve service status",
        },

        api: {
          label: "API",
          status: "down",
          detail: "Health endpoint unavailable",
        },
      }

    : isLoading || !serviceHealth
      ? {
          discovery: {
            label: "Discovery",
            status: "unknown",
            detail: "Checking service",
          },

          trade: {
            label: "Trade",
            status: "inactive",
            detail: "Service not implemented yet",
          },

          database: {
            label: "Database",
            status: "unknown",
            detail: "Checking connection",
          },

          api: {
            label: "API",
            status: "unknown",
            detail: "Checking API",
          },
        }

      : {
          discovery: {
            label: "Discovery",
            status: serviceHealth.discovery.status,
            detail:
              serviceHealth.discovery.status === "up"
                ? "Receiving heartbeat"
                : "No recent heartbeat",
          },

          trade: {
            label: "Trade",
            status: "inactive",
            detail: "Service not implemented yet",
          },

          database: {
            label: "Database",
            status: serviceHealth.database.status,
            detail:
              serviceHealth.database.status === "up"
                ? "Database connection healthy"
                : "Database unavailable",
          },

          api: {
            label: "API",
            status: serviceHealth.api.status,
            detail:
              serviceHealth.api.status === "up"
                ? "API health check passed"
                : "API health check failed",
          },
        };

  return (
    <header className="app-header">
      <div className="container-fluid px-3 px-md-4 py-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">

          {/* Branding */}
          <div className="d-flex align-items-center gap-3">
            <div className="app-brand-mark">
              <img
                src={appLogo}
                alt=""
                aria-hidden="true"
                className="app-brand-logo"
              />
            </div>

            <div>
              <div className="app-title">
                TerMEMEal
              </div>

              <div className="app-subtitle fst-italic">
                Solana meme-pair trading dashboard
              </div>
            </div>
          </div>

          {/* Header Controls */}
          <div className="header-status d-flex align-items-center gap-3">

            <SystemStatusIcon
              services={services}
            />

            <div className="wallet-status">
              <span
                className="status-dot"
                aria-hidden="true"
              />

              <span>
                Wallet disconnected
              </span>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;
