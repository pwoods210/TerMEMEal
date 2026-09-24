export type DiscoveryStatus =
  | "new"
  | "watching"
  | "graduated";

export interface DiscoveredToken {
  id: number;
  name: string;
  symbol: string;
  tokenAddress: string;
  pairAddress: string | null;
  source: string;
  exchange: string | null;
  discoveredAt: string;
  status: DiscoveryStatus;
  graduatedAt: string | null;
  tokenProfile: DexScreenerTokenProfile;
  pairs: DexScreenerPair[];
}

export interface DexScreenerLink {
  type?: string;
  label?: string;
  url: string;
}

export interface DexScreenerTokenProfile {
  url?: string;
  chainId?: string;
  tokenAddress?: string;
  icon?: string;
  header?: string | null;
  description?: string | null;
  links?: DexScreenerLink[] | null;
  [key: string]: unknown;
}

export interface DexScreenerTokenReference {
  address?: string;
  name?: string;
  symbol?: string;
  [key: string]: unknown;
}

export interface DexScreenerTransactions {
  buys?: number;
  sells?: number;
  [key: string]: unknown;
}

export interface DexScreenerLiquidity {
  usd?: number;
  base?: number;
  quote?: number;
  [key: string]: unknown;
}

export interface DexScreenerPairInfo {
  imageUrl?: string;
  websites?: Array<{ url: string; [key: string]: unknown }>;
  socials?: Array<{
    platform: string;
    handle: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface DexScreenerPair {
  chainId?: string;
  dexId?: string;
  url?: string;
  pairAddress?: string;
  labels?: string[] | null;
  baseToken?: DexScreenerTokenReference;
  quoteToken?: DexScreenerTokenReference;
  priceNative?: string;
  priceUsd?: string | null;
  txns?: Record<string, DexScreenerTransactions>;
  volume?: Record<string, number>;
  priceChange?: Record<string, number> | null;
  liquidity?: DexScreenerLiquidity | null;
  fdv?: number | null;
  marketCap?: number | null;
  pairCreatedAt?: number | null;
  info?: DexScreenerPairInfo;
  boosts?: { active?: number; [key: string]: unknown };
  [key: string]: unknown;
}

export type ServiceStatus =
  | "up"
  | "down"
  | "unknown"
  | "degraded"
  | "inactive";

export type GroupStatus =
  | "healthy"
  | "degraded"
  | "critical"
  | "checking";

export interface ServiceHealth {
  status: ServiceStatus;
}

export interface ServicesHealthResponse {
  discovery: ServiceHealth;
  trade: ServiceHealth;
  database: ServiceHealth;
  api: ServiceHealth;
}

export interface ServiceHealthItem {
  label: string;
  status: ServiceStatus;
  detail?: string;
}

export interface ServiceHealthMap {
  discovery: ServiceHealthItem;
  trade: ServiceHealthItem;
  database: ServiceHealthItem;
  api: ServiceHealthItem;
}
