"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Clock,
  Settings,
  Menu,
  Zap,
  Bell,
  ChevronRight,
  Building2,
} from "lucide-react";

// ─── Business Context ───────────────────────────────────────────

interface BusinessInfo {
  id: string;
  name: string;
  slug: string;
  industryType: string;
}

interface BusinessContextValue {
  currentBusiness: BusinessInfo | null;
  businesses: BusinessInfo[];
  setCurrentBusiness: (b: BusinessInfo) => void;
}

const BusinessContext = createContext<BusinessContextValue>({
  currentBusiness: null,
  businesses: [],
  setCurrentBusiness: () => {},
});

export function useBusinessContext() {
  return useContext(BusinessContext);
}

// ─── Nav Items ──────────────────────────────────────────────────

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Leads",
    href: "/dashboard/leads",
    icon: Users,
  },
  {
    label: "Conversations",
    href: "/dashboard/conversations",
    icon: MessageSquare,
  },
  {
    label: "Follow-ups",
    href: "/dashboard/followups",
    icon: Clock,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

// ─── Sidebar Content ────────────────────────────────────────────

function SidebarContent({
  currentBusiness,
  businesses,
  onBusinessChange,
  pathname,
}: {
  currentBusiness: BusinessInfo | null;
  businesses: BusinessInfo[];
  onBusinessChange: (id: string) => void;
  pathname: string;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center animate-glow">
          <Zap className="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-bold gradient-text tracking-tight">LeadFlow AI</h1>
          <p className="text-[10px] text-muted-foreground -mt-0.5">Revenue Engine</p>
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Business Selector */}
      <div className="px-3 py-3">
        <Select
          value={currentBusiness?.id || ""}
          onValueChange={onBusinessChange}
        >
          <SelectTrigger className="w-full h-9 text-xs bg-secondary/50 border-border/50">
            <SelectValue placeholder="Select business" />
          </SelectTrigger>
          <SelectContent>
            {businesses.map((b) => (
              <SelectItem key={b.id} value={b.id} className="text-xs">
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="opacity-50" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary/15 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                <item.icon
                  className={cn(
                    "w-4.5 h-4.5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary/60" />
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="opacity-50" />

      {/* User */}
      <div className="px-4 py-4 flex items-center gap-3">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
            RS
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">Rajesh Sharma</p>
          <p className="text-[11px] text-muted-foreground truncate">Owner</p>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Layout ───────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [businesses, setBusinesses] = useState<BusinessInfo[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<BusinessInfo | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/businesses")
      .then((r) => r.json())
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setBusinesses(res.data);
          setCurrentBusiness(res.data[0]);
        }
      })
      .catch(console.error);
  }, []);

  function handleBusinessChange(id: string) {
    const biz = businesses.find((b) => b.id === id);
    if (biz) setCurrentBusiness(biz);
  }

  return (
    <BusinessContext value={{
      currentBusiness,
      businesses,
      setCurrentBusiness,
    }}>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-[240px] shrink-0 flex-col border-r border-border/50 bg-sidebar">
          <SidebarContent
            currentBusiness={currentBusiness}
            businesses={businesses}
            onBusinessChange={handleBusinessChange}
            pathname={pathname}
          />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[260px] p-0">
            <SidebarContent
              currentBusiness={currentBusiness}
              businesses={businesses}
              onBusinessChange={handleBusinessChange}
              pathname={pathname}
            />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar */}
          <header className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-border/50 bg-background/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-4.5 h-4.5" />
              </Button>

              <div>
                <h2 className="text-sm font-semibold">
                  {currentBusiness?.name || "Loading..."}
                </h2>
                <p className="text-[11px] text-muted-foreground capitalize">
                  {currentBusiness?.industryType || ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse-soft" />
              </Button>
              <Avatar className="w-8 h-8 lg:hidden">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                  RS
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 lg:p-6">{children}</div>
          </main>
        </div>
      </div>
    </BusinessContext>
  );
}
