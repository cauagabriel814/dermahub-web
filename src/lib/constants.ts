import {
  LayoutDashboard,
  Users,
  Syringe,
  CalendarClock,
  Zap,
  MessageSquare,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Pacientes", href: "/patients", icon: Users },
  { label: "Procedimentos", href: "/procedures/new", icon: Syringe },
  { label: "Recalls", href: "/recalls", icon: CalendarClock },
  { label: "Automações", href: "/automations", icon: Zap },
  { label: "Mensagens", href: "/messages", icon: MessageSquare },
  { label: "Configurações", href: "/settings", icon: Settings },
] as const;
