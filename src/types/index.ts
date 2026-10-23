// ─── Enum-like types ─────────────────────────────────────────────

export type LeadStatus = "NEW" | "ENGAGED" | "QUALIFIED" | "CONVERTED" | "LOST";
export type LeadSource = "WHATSAPP" | "WEB_FORM" | "INSTAGRAM" | "PHONE" | "WALK_IN" | "EMAIL";
export type Channel = "WHATSAPP" | "WEB" | "INSTAGRAM" | "SMS" | "EMAIL";
export type UserRole = "OWNER" | "STAFF";
export type MessageDirection = "INBOUND" | "OUTBOUND";
export type SenderType = "LEAD" | "AI" | "HUMAN";
export type FollowUpStatus = "PENDING" | "SENT" | "FAILED" | "CANCELLED";
export type ConversionEventType = "PAYMENT" | "ENROLLMENT" | "BOOKING" | "CUSTOM";

// ─── Business ────────────────────────────────────────────────────

export interface Business {
  id: string;
  name: string;
  slug: string;
  industryType: string;
  logo: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  aiPersona: string;
  faqDocument: string | null;
  escalationKeywords: string;
  followUpSequence: string;
  supportedLanguages: string;
  subscriptionStatus: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
}

// ─── User ────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
  businessId: string;
}

// ─── Lead ────────────────────────────────────────────────────────

export interface Lead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: LeadSource;
  status: LeadStatus;
  estimatedValue: number;
  notes: string | null;
  tags: string | null;
  businessId: string;
  assignedToId: string | null;
  assignedTo?: User | null;
  lastInteractionAt: string;
  createdAt: string;
  updatedAt: string;
  conversations?: Conversation[];
  followUps?: FollowUp[];
  conversionEvents?: ConversionEvent[];
  _count?: {
    conversations: number;
    messages: number;
  };
}

// ─── Conversation ────────────────────────────────────────────────

export interface Conversation {
  id: string;
  channel: Channel;
  leadId: string;
  lead?: Lead;
  businessId: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  _count?: {
    messages: number;
  };
}

// ─── Message ─────────────────────────────────────────────────────

export interface Message {
  id: string;
  direction: MessageDirection;
  senderType: SenderType;
  content: string;
  messageType: string;
  whatsappMessageId: string | null;
  conversationId: string;
  sentByUserId: string | null;
  sentByUser?: User | null;
  sentAt: string;
}

// ─── FollowUp ────────────────────────────────────────────────────

export interface FollowUp {
  id: string;
  scheduledAt: string;
  sentAt: string | null;
  templateKey: string | null;
  messageContent: string;
  status: FollowUpStatus;
  attemptCount: number;
  leadId: string;
  lead?: Lead;
  businessId: string;
  createdAt: string;
}

// ─── ConversionEvent ─────────────────────────────────────────────

export interface ConversionEvent {
  id: string;
  eventType: ConversionEventType;
  revenueAmount: number;
  description: string | null;
  leadId: string;
  lead?: Lead;
  businessId: string;
  convertedAt: string;
}

// ─── Dashboard Stats ─────────────────────────────────────────────

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  engagedLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  totalRevenue: number;
  activeFollowUps: number;
  averageDealValue: number;
  leadsBySource: { source: string; count: number }[];
  revenueByDay: { date: string; revenue: number }[];
  leadsByDay: { date: string; count: number }[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: "lead_created" | "status_changed" | "message_received" | "conversion" | "followup_sent";
  title: string;
  description: string;
  timestamp: string;
  leadId?: string;
  leadName?: string;
}

// ─── API Response ────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
