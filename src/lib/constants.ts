import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BellRing,
  Bell,
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
  { href: "/automations", label: "Automações", icon: Zap },
  { href: "/messages", label: "Mensagens", icon: MessageSquare },
  { href: "/settings/message-templates", label: "Modelos", icon: FileText },
  { href: "/settings/procedure-types", label: "Procedimentos", icon: Settings },
  { href: "/settings/notifications", label: "Notificações", icon: Bell, adminOnly: true },
  { href: "/settings/users", label: "Usuários", icon: UserCog, adminOnly: true },
];

export const APP_NAME = "DermaHub";
