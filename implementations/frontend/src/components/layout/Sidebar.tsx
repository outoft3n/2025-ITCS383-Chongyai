'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Search, FileText, Bookmark, CalendarDays,
  User, Briefcase, Plus, Users, BarChart3, CreditCard, MessageCircle,
  UserSearch, Send, Mail,
} from 'lucide-react';
import type { Role } from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const applicantNav: NavItem[] = [
  { href: '/dashboard/applicant', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/applicant/jobs', label: 'Find Jobs', icon: Search },
  { href: '/dashboard/applicant/applications', label: 'My Applications', icon: FileText },
  { href: '/dashboard/applicant/invitations', label: 'Invitations', icon: Mail },
  { href: '/dashboard/applicant/bookmarks', label: 'Saved Jobs', icon: Bookmark },
  { href: '/dashboard/applicant/interviews', label: 'Interviews', icon: CalendarDays },
  { href: '/dashboard/applicant/profile', label: 'Profile', icon: User },
  { href: '/dashboard/chat', label: 'Support Chat', icon: MessageCircle },
];

const recruiterNav: NavItem[] = [
  { href: '/dashboard/recruiter', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/recruiter/jobs', label: 'My Jobs', icon: Briefcase },
  { href: '/dashboard/recruiter/jobs/new', label: 'Post a Job', icon: Plus },
  { href: '/dashboard/recruiter/search', label: 'Search Applicants', icon: UserSearch },
  { href: '/dashboard/recruiter/invitations', label: 'Sent Invitations', icon: Send },
  { href: '/dashboard/recruiter/interviews', label: 'Interviews', icon: CalendarDays },
  { href: '/dashboard/recruiter/profile', label: 'Profile', icon: User },
  { href: '/dashboard/chat', label: 'Support Chat', icon: MessageCircle },
];

const adminNav: NavItem[] = [
  { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/dashboard/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/admin/payments', label: 'Payments', icon: CreditCard },
];

const navByRole: Record<Role, NavItem[]> = {
  APPLICANT: applicantNav,
  RECRUITER: recruiterNav,
  ADMIN: adminNav,
};

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = navByRole[role];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      <nav className="flex-1 px-3 py-6 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== `/dashboard/${role.toLowerCase()}` && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white shadow-sm shadow-orange-200'
                  : 'text-gray-600 hover:bg-orange-50 hover:text-primary',
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
