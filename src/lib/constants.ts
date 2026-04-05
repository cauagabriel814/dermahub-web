import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BellRing,
  Zap,
  MessageSquare,
  FileText,
  Settings,
  TrendingUp,
  UserCheck,
  UserCog,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roi", label: "ROI", icon: TrendingUp, adminOnly: true },
  { href: "/leads", label: "Leads", icon: UserCheck },
  { href: "/patients", label: "Pacientes", icon: Users },
  { href: "/procedures/new", label: "Registrar Procedimento", icon: ClipboardList },
  { href: "/recalls", label: "Recalls", icon: BellRing },
  { href: "/automations", label: "Automacoes", icon: Zap },
  { href: "/messages", label: "Mensagens", icon: MessageSquare },
  { href: "/settings/message-templates", label: "Modelos", icon: FileText },
  { href: "/settings/procedure-types", label: "Procedimentos", icon: Settings },
  { href: "/settings/users", label: "Usuarios", icon: UserCog, adminOnly: true },
];

export const APP_NAME = "DermaHub";
