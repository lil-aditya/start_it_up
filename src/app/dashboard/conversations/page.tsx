"use client";

import { useEffect, useState } from "react";
import { useBusinessContext } from "../layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getInitials, timeAgo, getStatusColor } from "@/lib/utils";
import type { Conversation, Message, Lead } from "@/types";
import {
  Search,
  MessageSquare,
  Bot,
  User as UserIcon,
  Phone,
  ArrowLeft,
  Send,
} from "lucide-react";

interface ConversationWithLead extends Conversation {
  lead: Pick<Lead, "id" | "name" | "phone" | "email" | "status" | "source">;
  messages: Message[];
  _count: { messages: number };
}

function SenderIcon({ type }: { type: string }) {
  switch (type) {
    case "AI":
      return (
        <div className="p-1 rounded-md bg-primary/15">
          <Bot className="w-3 h-3 text-primary" />
        </div>
      );
    case "HUMAN":
      return (
        <div className="p-1 rounded-md bg-emerald-500/15">
          <UserIcon className="w-3 h-3 text-emerald-400" />
        </div>
      );
    default:
      return (
        <div className="p-1 rounded-md bg-secondary">
          <Phone className="w-3 h-3 text-muted-foreground" />
        </div>
      );
  }
}

export default function ConversationsPage() {
  const { currentBusiness } = useBusinessContext();
  const [conversations, setConversations] = useState<ConversationWithLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<ConversationWithLead | null>(null);
  const [fullMessages, setFullMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!currentBusiness?.id) return;
    setLoading(true);
    fetch(`/api/conversations?businessId=${currentBusiness.id}`)
      .then((r) => r.json())
      .then((res) => {
        setConversations(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentBusiness?.id]);

  // Load full conversation when selected
  useEffect(() => {
    if (!selectedConv) return;
    setLoadingMessages(true);
    fetch(`/api/leads/${selectedConv.leadId}`)
      .then((r) => r.json())
      .then((res) => {
        const conv = res.data?.conversations?.find(
          (c: Conversation) => c.id === selectedConv.id
        );
        setFullMessages(conv?.messages || []);
        setLoadingMessages(false);
      })
      .catch(() => setLoadingMessages(false));
  }, [selectedConv?.id, selectedConv?.leadId, selectedConv]);

  const filtered = conversations.filter((c) =>
    search
      ? c.lead.name.toLowerCase().includes(search.toLowerCase()) ||
        c.lead.phone?.includes(search)
      : true
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Conversations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex h-[calc(100vh-200px)] rounded-xl overflow-hidden border border-border/50">
        {/* Conversation List */}
        <div
          className={`w-full md:w-80 shrink-0 border-r border-border/50 bg-card/50 flex flex-col ${
            selectedConv ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="p-3 border-b border-border/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-secondary/30"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-3 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 animate-shimmer rounded-lg" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              <div className="p-1.5 space-y-0.5">
                {filtered.map((conv) => {
                  const lastMsg = conv.messages?.[0];
                  const isSelected = selectedConv?.id === conv.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConv(conv)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 ${
                        isSelected
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-secondary/50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <Avatar className="w-8 h-8 shrink-0 mt-0.5">
                          <AvatarFallback className="bg-primary/15 text-primary text-[10px] font-semibold">
                            {getInitials(conv.lead.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">{conv.lead.name}</p>
                            <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                              {timeAgo(conv.updatedAt)}
                            </span>
                          </div>
                          {lastMsg && (
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {lastMsg.senderType === "AI" && "🤖 "}
                              {lastMsg.senderType === "HUMAN" && "👤 "}
                              {lastMsg.content.slice(0, 60)}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 mt-1">
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(conv.lead.status)} text-[9px] h-4 px-1`}
                            >
                              {conv.lead.status}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {conv._count.messages} msgs
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat View */}
        <div
          className={`flex-1 flex flex-col bg-background ${
            selectedConv ? "flex" : "hidden md:flex"
          }`}
        >
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-border/30 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 md:hidden"
                  onClick={() => setSelectedConv(null)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/15 text-primary text-[10px] font-semibold">
                    {getInitials(selectedConv.lead.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{selectedConv.lead.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedConv.channel} · {selectedConv.lead.phone || selectedConv.lead.email}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {loadingMessages ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 animate-shimmer rounded-lg max-w-[70%]" />
                    ))}
                  </div>
                ) : fullMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    No messages in this conversation
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fullMessages.map((msg, i) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${
                          msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"
                        } animate-fade-in-up`}
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        {msg.direction === "INBOUND" && (
                          <SenderIcon type={msg.senderType} />
                        )}
                        <div
                          className={`max-w-[75%] rounded-xl px-3.5 py-2.5 ${
                            msg.direction === "OUTBOUND"
                              ? msg.senderType === "AI"
                                ? "bg-primary/12 border border-primary/15"
                                : "bg-emerald-500/12 border border-emerald-500/15"
                              : "bg-secondary/80 border border-border/30"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge variant="outline" className="text-[9px] h-4 px-1 border-border/40">
                              {msg.senderType}
                            </Badge>
                          </div>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1 text-right">
                            {timeAgo(msg.sentAt)}
                          </p>
                        </div>
                        {msg.direction === "OUTBOUND" && (
                          <SenderIcon type={msg.senderType} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Message Input (placeholder for future) */}
              <div className="px-4 py-3 border-t border-border/30">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message... (AI integration coming soon)"
                    className="h-9 text-sm bg-secondary/30"
                    disabled
                  />
                  <Button size="icon" className="h-9 w-9 shrink-0" disabled>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="p-4 rounded-2xl bg-secondary/30 mb-4">
                <MessageSquare className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-base font-semibold">Select a conversation</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Choose a conversation from the sidebar to view the full message history
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
