import React from 'react';
import { GrAnnounce } from "react-icons/gr";
import { SiLivechat } from "react-icons/si";
import { PiPlugsConnectedFill } from "react-icons/pi";
import { MdOutlineSupportAgent } from "react-icons/md";
import { SiMinutemailer } from "react-icons/si";
import { TbWorldWww } from "react-icons/tb";
import { FaUsersGear } from "react-icons/fa6";
import { TbWallet } from "react-icons/tb";
import { LuDot } from "react-icons/lu";
import { RxDashboard } from "react-icons/rx";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { RiUserSettingsLine } from "react-icons/ri";
import { PiCurrencyDollarSimpleBold } from "react-icons/pi";
import { IoChatbubbleOutline } from "react-icons/io5";
import { TbListDetails } from "react-icons/tb";
import { TbUserDollar } from "react-icons/tb";
import { MdModeEdit } from "react-icons/md";
import { TbApi } from "react-icons/tb";
import { VscCommentUnresolved } from "react-icons/vsc";
import { AiOutlineProduct } from "react-icons/ai";
import { BiAnalyse } from "react-icons/bi";
export interface SidebarSection {
  title: string;
  items: {
    path: string;
    label: string;
    icon: string | React.ReactNode;
    permissions?: string[];
    subItems?: {
      path: string;
      label: string;
      icon?: React.ReactNode;
      permissions?: string[];
    }[];
  }[];
}

export const SidebarAdminItems: SidebarSection[] = [
  {
    title: "Admin",
    items: [
      {
        path: "/admin",
        label: "Dashboard",
        icon: <RxDashboard />,
      },
      {
        path: "/admin-users",
        label: "Users Management",
        icon: <FaUsersGear />,
        permissions: ["admin_users.view"],
      },
      {
        path: "/admin-access-control",
        label: "Access Control",
        icon: <FaUsersGear />,
        permissions: ["admin_access.members.manage", "admin_access.roles.manage"],
      },

      {
        path: "",
        label: "AI Toolkit",

        icon: <AiOutlineProduct />,
        subItems: [
          {
            path: "/admin-ai-tools-page",
            label: "Available AI Toolkit",
            icon: <LuDot />,
          },
        ],
      },

      {
        path: "/plugin-list",
        label: "Widget Setting",
        icon: <PiPlugsConnectedFill />,
      },
      {
        path: "/data-training-page",
        label: "Trained Chat Assistant",
        icon: <SiLivechat />,
      },

      {
        path: "/announcement",
        label: "Announcement",
        icon: <GrAnnounce />,
        permissions: ["announcement.view"],
      },
      {
        path: "/admin-ticket-token",
        label: "Support Ticket",
        icon: <MdOutlineSupportAgent />,
      },
      {
        path: "/admin-affiliate",
        label: "Affiliate",
        icon: <PiCurrencyDollarSimpleBold />,
      },
      {
        path: "",
        label: "AI Chat Setting",

        icon: <IoChatbubbleOutline />,
        subItems: [
          {
            path: "/default-chat-assistants",
            label: "Default AI ChatBot",
            icon: <LuDot />,
          },
          {
            path: "/custom-chatbot-assistant",
            label: "Custom AI ChatBot",
            icon: <LuDot />,
          },
        ],
      },
      {
        path: "",
        label: "Templates",
        icon: <TbListDetails />,
        subItems: [
          {
            path: "/default-templates",
            label: "Default Template",
            icon: <LuDot />,
          },
          {
            path: "/custom-template",
            label: "Custom Template",
            icon: <LuDot />,
          },
        ],
      },
      {
        path: "/admin-prompts",
        label: "Prompts",
        icon: <MdModeEdit />,
        permissions: ["prompt.view"],
      },

      {
        path: "/admin-faqs",
        label: "FAQs",
        icon: <VscCommentUnresolved />,
        permissions: ["faq.view"],
      },
      {
        path: "/admin-free-users",
        label: "Users Analytic",
        icon: <FaUsersGear />,
        permissions: ["admin_users.view"],
      },

      {
        path: "/admin-paid-users",
        label: "Paid Users",

        icon: <TbUserDollar />,
        permissions: ["admin_users.view"],
      },
      {
        path: "",
        label: "Finance",
        icon: <TbWallet />,
        subItems: [
          { path: "/admin-orders", label: "Order list", icon: <LuDot /> },
          {
            path: "/payment-setting",
            label: "Payment Setting",
            icon: <LuDot />,
          },
        ],
      },

      {
        path: "/admin-plans",
        label: "Plans",
        icon: <HiOutlineClipboardDocumentList />,
        permissions: ["subscription_package.manage"],
      },
      {
        path: "/admin-blogs",
        label: "Blogs",

        icon: <MdModeEdit />,
        permissions: ["blog.view"],
      },
      { path: "/admin-media", label: "Social Media ", icon: <TbWorldWww /> },
      {
        path: "/admin-project-settings",
        label: "API Integration",
        icon: <TbApi />,
      },
      { path: "/admin-smtp", label: "SMTP Setting", icon: <SiMinutemailer /> },
      {
        path: "/admin-analytics-logs",
        label: "Analytics & Logs",
        icon: <BiAnalyse />,
      },
      {
        path: "/admin-settings",
        label: "Profiles Setting",
        icon: <RiUserSettingsLine />,
      },
    ],
  },
];
