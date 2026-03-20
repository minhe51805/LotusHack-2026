export type AdminNavItem = {
  key: string;
  label: string;
  href: string;
  description: string;
};

export type AdminMetric = {
  label: string;
  value: string;
  delta: string;
  tone: "positive" | "neutral" | "warning";
};

export type AdminContentItem = {
  title: string;
  type: string;
  owner: string;
  status: "Published" | "In Review" | "Draft" | "Scheduled";
  updatedAt: string;
};

export type AdminLeadItem = {
  name: string;
  source: string;
  stage: string;
  updatedAt: string;
};

export type AdminActivityItem = {
  title: string;
  detail: string;
  time: string;
};

export type AdminHealthItem = {
  label: string;
  value: string;
  detail: string;
};

export const adminNavigation: AdminNavItem[] = [
  {
    key: "overview",
    label: "Overview",
    href: "/dashboard",
    description: "Main control center for the CMS workspace.",
  },
  {
    key: "content",
    label: "Content",
    href: "/dashboard/content",
    description: "Pages, posts, landing blocks, and editorial queue.",
  },
  {
    key: "leads",
    label: "Leads",
    href: "/dashboard/leads",
    description: "Lead pipeline, source tracking, and assignments.",
  },
  {
    key: "media",
    label: "Media",
    href: "/dashboard/media",
    description: "Asset library, folders, and upload monitoring.",
  },
  {
    key: "automation",
    label: "Automation",
    href: "/dashboard/automation",
    description: "Forms, sync jobs, delivery rules, and alerts.",
  },
  {
    key: "team",
    label: "Team",
    href: "/dashboard/team",
    description: "Editors, reviewers, and permission groups.",
  },
  {
    key: "settings",
    label: "Settings",
    href: "/dashboard/settings",
    description: "Workspace configuration and system preferences.",
  },
];

export const adminMetrics: AdminMetric[] = [
  { label: "Published entries", value: "248", delta: "+12 this week", tone: "positive" },
  { label: "Pending review", value: "19", delta: "5 need approval today", tone: "warning" },
  { label: "Leads captured", value: "86", delta: "+24 since yesterday", tone: "positive" },
  { label: "Sync health", value: "99.2%", delta: "All channels stable", tone: "neutral" },
];

export const adminContentQueue: AdminContentItem[] = [
  {
    title: "Homepage hero and workshop banner",
    type: "Landing block",
    owner: "Linh Tran",
    status: "In Review",
    updatedAt: "8 minutes ago",
  },
  {
    title: "Digital SAT spring campaign",
    type: "Campaign page",
    owner: "Bao Nguyen",
    status: "Scheduled",
    updatedAt: "40 minutes ago",
  },
  {
    title: "IELTS 1-1 premium package",
    type: "Course page",
    owner: "Quynh Le",
    status: "Published",
    updatedAt: "2 hours ago",
  },
  {
    title: "Teacher profile refresh batch",
    type: "Collection",
    owner: "Nhi Pham",
    status: "Draft",
    updatedAt: "Today, 09:20",
  },
];

export const adminLeadQueue: AdminLeadItem[] = [
  {
    name: "Nguyen Minh Anh",
    source: "Homepage form",
    stage: "Assigned to admissions",
    updatedAt: "Now",
  },
  {
    name: "Tran Hoang Nam",
    source: "SAT workshop",
    stage: "Awaiting callback",
    updatedAt: "12 minutes ago",
  },
  {
    name: "Le Gia Han",
    source: "IELTS consultation",
    stage: "Qualified lead",
    updatedAt: "37 minutes ago",
  },
];

export const adminActivityFeed: AdminActivityItem[] = [
  {
    title: "Homepage banner published",
    detail: "A new Harvard workshop hero was deployed to production.",
    time: "6 minutes ago",
  },
  {
    title: "Lead webhook re-synced",
    detail: "Form delivery recovered after one failed retry from Resend.",
    time: "28 minutes ago",
  },
  {
    title: "Media approval completed",
    detail: "12 new course thumbnails were approved for the marketing team.",
    time: "1 hour ago",
  },
  {
    title: "Editor role updated",
    detail: "Permissions for the content reviewer group were tightened.",
    time: "Today, 08:15",
  },
];

export const adminHealthCards: AdminHealthItem[] = [
  {
    label: "Forms API",
    value: "Healthy",
    detail: "Supabase and lead persistence are responding normally.",
  },
  {
    label: "Media storage",
    value: "82% used",
    detail: "Asset cleanup is recommended before the next campaign upload.",
  },
  {
    label: "Editorial SLA",
    value: "2.4 hrs",
    detail: "Average approval time across content review queues.",
  },
];

export function getAdminSection(slug?: string[] | undefined) {
  const key = slug?.[0] ?? "overview";
  return adminNavigation.find((item) => item.key === key) ?? adminNavigation[0];
}
