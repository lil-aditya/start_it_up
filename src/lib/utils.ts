export { cn } from "cn"

/**
 * Format currency in Indian Rupees
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number with Indian locale
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

/**
 * Calculate percentage
 */
export function percentage(part: number, total: number): string {
  if (total === 0) return "0%";
  return `${((part / total) * 100).toFixed(1)}%`;
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return then.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Status color mapping for leads
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    ENGAGED: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    QUALIFIED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    CONVERTED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    LOST: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

/**
 * Source icon/color mapping
 */
export function getSourceColor(source: string): string {
  const colors: Record<string, string> = {
    WHATSAPP: "text-green-400",
    WEB_FORM: "text-blue-400",
    INSTAGRAM: "text-pink-400",
    PHONE: "text-amber-400",
    WALK_IN: "text-purple-400",
    EMAIL: "text-cyan-400",
  };
  return colors[source] || "text-gray-400";
}

/**
 * Compact number formatting (e.g., 1.2L, 45K)
 */
export function compactNumber(num: number): string {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
