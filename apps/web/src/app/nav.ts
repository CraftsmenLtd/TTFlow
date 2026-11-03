import {
  BookOpen,
  CalendarClock,
  House,
  ListOrdered,
  MessageSquare,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Shown in the phone bottom bar (max 5 items). Everything is in the desktop sidebar. */
  inBottomBar: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: House, inBottomBar: true },
  { to: '/today', label: 'Today', icon: CalendarClock, inBottomBar: true },
  { to: '/fixtures', label: 'Fixtures', icon: Trophy, inBottomBar: true },
  { to: '/standings', label: 'Standings', icon: ListOrdered, inBottomBar: true },
  { to: '/rules', label: 'Rules', icon: BookOpen, inBottomBar: true },
  { to: '/feedback', label: 'Feedback', icon: MessageSquare, inBottomBar: false },
];
