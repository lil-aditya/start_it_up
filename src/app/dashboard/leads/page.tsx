"use client";

import { useEffect, useState, useCallback } from "react";
import { useBusinessContext } from "../layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatINR,
  timeAgo,
  getInitials,
  getStatusColor,
  getSourceColor,
} from "@/lib/utils";
import type { Lead, LeadStatus } from "@/types";
import {
  Search,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  IndianRupee,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  X,
  LayoutGrid,
  List,
  Plus,
} from "lucide-react";

const STATUS_OPTIONS: LeadStatus[] = ["NEW", "ENGAGED", "QUALIFIED", "CONVERTED", "LOST"];
const SOURCE_OPTIONS = ["WHATSAPP", "WEB_FORM", "INSTAGRAM", "PHONE", "WALK_IN", "EMAIL"];

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={`${getStatusColor(status)} text-[10px] font-semibold`}>
      {status}
    </Badge>
  );
}

function SourceIcon({ source }: { source: string }) {
  const sourceLabels: Record<string, string> = {
    WHATSAPP: "WhatsApp",
    WEB_FORM: "Web",
    INSTAGRAM: "Instagram",
    PHONE: "Phone",
    WALK_IN: "Walk-in",
    EMAIL: "Email",
  };
  return (
    <span className={`text-xs ${getSourceColor(source)} font-medium`}>
      {sourceLabels[source] || source}
    </span>
  );
}

// ─── Kanban Column ──────────────────────────────────────────────

function KanbanColumn({
  status,
  leads,
  onStatusChange,
  onLeadClick,
}: {
  status: LeadStatus;
  leads: Lead[];
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onLeadClick: (lead: Lead) => void;
}) {
  const statusColors: Record<string, string> = {
    NEW: "border-t-blue-500",
    ENGAGED: "border-t-amber-500",
    QUALIFIED: "border-t-purple-500",
    CONVERTED: "border-t-emerald-500",
    LOST: "border-t-red-500",
  };

  return (
    <div className="flex-1 min-w-[220px]">
      <div className={`rounded-t-lg border-t-2 ${statusColors[status]} bg-secondary/30 px-3 py-2`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider">{status}</span>
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
            {leads.length}
          </Badge>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-320px)]">
        <div className="space-y-2 p-2">
          {leads.map((lead) => (
            <Card
              key={lead.id}
              className="glass-card cursor-pointer hover:border-primary/30 transition-all duration-200 group"
              onClick={() => onLeadClick(lead)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-1.5">
                  <p className="text-sm font-medium truncate pr-2">{lead.name}</p>
                  <SourceIcon source={lead.source} />
                </div>
                {lead.phone && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {lead.phone}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-primary font-semibold">
                    {formatINR(lead.estimatedValue)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {timeAgo(lead.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {leads.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">No leads</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Lead Detail Panel ──────────────────────────────────────────

function LeadDetailPanel({
  lead,
  onClose,
  onStatusChange,
}: {
  lead: Lead;
  onClose: () => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
}) {
  const [detail, setDetail] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leads/${lead.id}`)
      .then((r) => r.json())
      .then((res) => {
        setDetail(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lead.id]);

  if (loading) {
    return (
      <DialogContent className="max-w-lg max-h-[85vh]">
        <div className="space-y-4">
          <div className="h-6 w-40 animate-shimmer rounded" />
          <div className="h-4 w-60 animate-shimmer rounded" />
          <div className="h-32 animate-shimmer rounded" />
        </div>
      </DialogContent>
    );
  }

  const d = detail || lead;

  return (
    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
              {getInitials(d.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <DialogTitle className="text-base">{d.name}</DialogTitle>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={d.status} />
              <SourceIcon source={d.source} />
            </div>
          </div>
        </div>
      </DialogHeader>

      <Separator />

      {/* Contact Info */}
      <div className="grid grid-cols-2 gap-3">
        {d.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{d.phone}</span>
          </div>
        )}
        {d.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="truncate">{d.email}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-primary font-semibold">{formatINR(d.estimatedValue)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{timeAgo(d.createdAt)}</span>
        </div>
      </div>

      {/* Status Change */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Change Status</p>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((s) => (
            <Button
              key={s}
              variant={d.status === s ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={() => onStatusChange(d.id, s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Notes */}
      {d.notes && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
          <p className="text-sm bg-secondary/50 rounded-lg p-3">{d.notes}</p>
        </div>
      )}

      {/* Conversation History */}
      {detail?.conversations && detail.conversations.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Conversation History
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {detail.conversations.map((conv) =>
              conv.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-2.5 text-xs ${
                      msg.direction === "OUTBOUND"
                        ? msg.senderType === "AI"
                          ? "bg-primary/15 text-foreground"
                          : "bg-emerald-500/15 text-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge variant="outline" className="text-[9px] h-4 px-1">
                        {msg.senderType}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(msg.sentAt)}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </DialogContent>
  );
}

// ─── Main Leads Page ────────────────────────────────────────────

export default function LeadsPage() {
  const { currentBusiness } = useBusinessContext();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<"table" | "kanban">("table");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = useCallback(() => {
    if (!currentBusiness?.id) return;
    setLoading(true);
    const params = new URLSearchParams({
      businessId: currentBusiness.id,
      page: page.toString(),
      pageSize: "50",
    });
    if (search) params.set("search", search);
    if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
    if (sourceFilter && sourceFilter !== "all") params.set("source", sourceFilter);

    fetch(`/api/leads?${params}`)
      .then((r) => r.json())
      .then((res) => {
        setLeads(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentBusiness?.id, page, search, statusFilter, sourceFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  async function handleStatusChange(leadId: string, newStatus: LeadStatus) {
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchLeads();
    if (selectedLead?.id === leadId) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} total leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-secondary/50 rounded-lg p-0.5">
            <Button
              variant={view === "table" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setView("table")}
            >
              <List className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant={view === "kanban" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setView("kanban")}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9 text-sm bg-secondary/30"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-36 h-9 text-xs bg-secondary/30">
            <Filter className="w-3 h-3 mr-1" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-36 h-9 text-xs bg-secondary/30">
            <Filter className="w-3 h-3 mr-1" />
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {SOURCE_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table View */}
      {view === "table" && (
        <Card className="glass-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Contact</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Source</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Value</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <div className="h-8 animate-shimmer rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-12">
                      No leads found
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className="border-border/30 cursor-pointer hover:bg-secondary/30 transition-colors"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className="bg-primary/15 text-primary text-[10px] font-semibold">
                              {getInitials(lead.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{lead.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="space-y-0.5">
                          {lead.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {lead.phone}
                            </p>
                          )}
                          {lead.email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate max-w-[180px]">
                              <Mail className="w-3 h-3" /> {lead.email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={lead.status} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <SourceIcon source={lead.source} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-primary font-semibold">
                          {formatINR(lead.estimatedValue)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(lead.lastInteractionAt)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/30">
                <p className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STATUS_OPTIONS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              leads={leads.filter((l) => l.status === status)}
              onStatusChange={handleStatusChange}
              onLeadClick={setSelectedLead}
            />
          ))}
        </div>
      )}

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        {selectedLead && (
          <LeadDetailPanel
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </Dialog>
    </div>
  );
}
