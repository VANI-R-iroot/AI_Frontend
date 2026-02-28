import { RxDashboard } from "react-icons/rx";
import React from 'react';

export interface SidebarSection {
  title: string;
  items: {
    path: string;
    label: string;
    icon: string | React.ReactNode;
    subItems?: { path: string; label: string; icon?: React.ReactNode }[];
  }[];
}

export const SidebarSuperAdminItems: SidebarSection[] = [
  {
    title: "Admin",
    items: [
      {
        path: "/super-admin-dashboard",
        label: "Dashboard",
        icon: <RxDashboard />,
      },
    ],
  },
];
