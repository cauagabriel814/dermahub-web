import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BellRing,
  Zap,
  MessageSquare,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Pacientes", icon: Users },
  { href: "/procedures/new", label: "Registrar Procedimento", icon: ClipboardList },
  { href: "/recalls", label: "Recalls", icon: BellRing },
  { href: "/automations", label: "Automações", icon: Zap },
  { href: "/messages", label: "Mensagens", icon: MessageSquare },
  { href: "/settings/procedure-types", label: "Configurações", icon: Settings },
];

export const APP_NAME = "DermaHub";
