import { MdOutlineWidgets } from "react-icons/md";
import { IoIosImages } from "react-icons/io";
import { RiImageEditFill } from "react-icons/ri";
import { BiServer } from "react-icons/bi";
import { LuServerCog } from "react-icons/lu";
import { LuDot } from "react-icons/lu";
import { RxDashboard } from "react-icons/rx";
import { FiFileText } from "react-icons/fi";
import { TbMessage2Code } from "react-icons/tb";
import { FaLaptopCode } from "react-icons/fa6";
import { TbPhotoSearch } from "react-icons/tb";
import { TbFileTextSpark } from "react-icons/tb";
import { MdOutlineAssistant } from "react-icons/md";
import { CgImage } from "react-icons/cg";
import { GrDocumentImage } from "react-icons/gr";
import { PiFileAudioDuotone } from "react-icons/pi";
import { MdKeyboardVoice } from "react-icons/md";
import { FaFileSignature } from "react-icons/fa6";
import { PiFileVideoLight } from "react-icons/pi";
import { TbDeviceDesktopSearch } from "react-icons/tb";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { RiUserSettingsLine } from "react-icons/ri";
import { PiCurrencyDollarSimpleBold } from "react-icons/pi";
import { CgSupport } from "react-icons/cg";
import { MdOutlinePlagiarism, MdOutlineMarkEmailRead } from "react-icons/md";
import { MdAddTask } from "react-icons/md";
import { FaTools } from "react-icons/fa";
import { FaUsersGear } from "react-icons/fa6";
import React from "react";

export interface SidebarSection {
  title: string;
  items: {
    path: string;
    label: string;
    icon: string | React.JSX.Element;
    isNew?: boolean;
    subItems?: {
      path: string;
      label: string;
      icon?: React.JSX.Element;
      isNew?: boolean;
    }[];
  }[];
}

export const SidebarUserItems: SidebarSection[] = [
  {
    title: "User Panel",
    items: [
      {
        path: "/dashboard",
        label: "Dashboard",
        icon: <RxDashboard />,
      },
      {
        path: "/myfilePage",
        label: "My Files",
        icon: <FiFileText />,
      },
    ],
  },

  {
    title: "Content Automation",
    items: [
      {
        path: "/mcp-server-setting",
        label: "MCP Server Setting",
        icon: <LuServerCog />,
        isNew: true, // Example: Mark this as new
      },

      {
        path: "",
        label: "AI Widget",
        icon: <MdOutlineWidgets />,
        subItems: [
          {
            path: "/widget-guideline-page",
            label: "Widget Guid Line",
            icon: <LuDot />,
          },
          {
            path: "/download-widget-page",
            label: "Download Widget",
            icon: <LuDot />,
          },
          {
            path: "/widget-download-list-page",
            label: "Active Widget List",
            icon: <LuDot />,
          },
          {
            path: "/widgets-custom-page",
            label: "Widget Customize",
            icon: <LuDot />,
          },
          {
            path: "/visitor-analyzer",
            label: "Analyze Report",
            icon: <LuDot />,
            isNew: true, // Example: Mark this sub-item as new
          },
          {
            path: "/widget-user-table",
            label: "Widget User Info",
            icon: <LuDot />,
          },
        ],
      },
      {
        path: "",
        label: "Data Analyser",
        icon: <BiServer />,
        subItems: [
          {
            path: "/mcp-server-setup",
            label: "Setup Your Server",
            icon: <LuDot />,
          },
          { path: "/mcp-server", label: "Analyze Document", icon: <LuDot /> },
        ],
      },
      {
        path: "",
        label: "Email Marketing",
        icon: <MdOutlineMarkEmailRead />,
        subItems: [
          {
            path: "/mcp-smart-mailer-setting",
            label: "Integration",
            icon: <LuDot />,
          },
          {
            path: "/mcp-email-setting",
            label: "Email server",
            icon: <LuDot />,
          },
          {
            path: "/mcp-smart-mailer",
            label: "Send Bulk Email",
            icon: <LuDot />,
          },
          {
            path: "/mcp-smart-mailer-draft-schedule",
            label: "Draft schedules",
            icon: <LuDot />,
          },
          {
            path: "/mcp-smart-mailer-history",
            label: "History",
            icon: <LuDot />,
          },
        ],
      },
    ],
  },
  {
    title: "Context Feature",
    items: [
      {
        path: "/new-task-generate",
        label: "New Task",
        icon: <MdAddTask />,
        isNew: true,
      },
      {
        path: "/ai-tools-page",
        label: "Integration",
        icon: <FaTools />,
        isNew: true,
      },
      {
  path: "/platform-connect",
  label: "Platform Connect",
  icon: <BiServer />,
  isNew: true,
},

    ],
    
  },
   
  {
    title: "Chat & Code Tools",
    items: [
      {
        path: "/code-generate-Agent",
        label: "Code Chat",
        icon: <TbMessage2Code />,
      },
      {
        path: "/codegenerate",
        label: "Coding",
        icon: <FaLaptopCode />,
      },
    ],
  },

  {
    title: "AI Tools",
    items: [
      {
        path: "/assistant",
        label: "AI Assistant",

        icon: <MdOutlineAssistant />,
      },
      {
        path: "/airewriter",
        label: "AI Rewriter",
        icon: <TbFileTextSpark />,
      },
      {
        path: "/aivision",
        label: "Product Analyser",
        icon: <TbPhotoSearch />,
      },
    ],
  },

  {
    title: "Image Tools",
    items: [
      {
        path: "/imagegenerate",
        label: "Create Image",
        icon: <CgImage />,
      },
      {
        path: "/ai-canvas",
        label: "AI Canvas",
        icon: <IoIosImages />,
      },

      {
        path: "/imagecaption",
        label: "Image Describer",
        icon: <GrDocumentImage />,
      },

      {
        path: "/design-to-code",
        label: "UI-UX to Code",
        icon: <RiImageEditFill />,
      },
    ],
  },
  {
    title: "Text & Audio Tools",
    items: [
      {
        path: "/plagiarismcheck",
        label: "Plagiarism Check",
        icon: <MdOutlinePlagiarism />,
      },
      {
        path: "/speachtotext",
        label: "Speech to Text",
        icon: <PiFileAudioDuotone />,
      },
      {
        path: "/aiviceover",
        label: "AI Voice Over",
        icon: <MdKeyboardVoice />,
      },
      {
        path: "/audioedit",
        label: "Edit Audio",
        icon: <FaFileSignature />,
      },
    ],
  },

  {
    title: "Video & Web Tools",
    items: [
      {
        path: "/videototext",
        label: "Video to Text",
        icon: <PiFileVideoLight />,
      },
      {
        path: "/webscripting",
        label: "Web Scraping",
        icon: <TbDeviceDesktopSearch />,
      },
    ],
  },

  {
    title: "Setting",
    items: [
      {
        path: "/pricingplan",
        label: "Price Plan",
        icon: <HiOutlineClipboardDocumentList />,
      },
      {
        path: "/settings",
        label: "Profiles",
        icon: <RiUserSettingsLine />,
      },
      {
        path: "/team-settings",
        label: "Team Settings",
        icon: <FaUsersGear />,
      },
      {
        path: "/affiliate",
        label: "Affiliate",
        icon: <PiCurrencyDollarSimpleBold />,
      },
      {
        path: "/supports",
        label: "Support",
        icon: <CgSupport />,
      },
    ],
  },
 
];
