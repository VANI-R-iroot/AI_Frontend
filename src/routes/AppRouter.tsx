import { Routes, Route } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout"; 
import Home from "../pages/landingPages/HomePages02";
import Login from "../pages/landingPages/authPage/userAuth/loginPage";
import RegisterPage from "../pages/landingPages/authPage/userAuth/resisterPage";
import ForgatPasswordPage from "../pages/landingPages/authPage/forgetPassword";
import OtpPage from "../pages/landingPages/authPage/verifyOtp";
import NewPasswordPage from "../pages/landingPages/authPage/setNewPassword";
import ContactPage from "../pages/landingPages/contactPage/contactPage";
import TermsConditions from "../pages/landingPages/TermsConditions.tsx";
import { PrivateRoute,AdminRoute,  SuperAdminRoute } from "./RouteGuards";
import BlogPublicPages from "../pages/landingPages/blogPage/blogPages";
import BlogDetailsPage from "../pages/landingPages/blogPage/blogDetails";
import PrivacyPolicy from "../pages/landingPages/PrivacyPolicy.tsx";


{/* 🔒 Private Pages */ }
import DashboardPage from "../pages/dashboardPages/DashboardMain";
import SettingsPage from "../pages/dashboardPages/SettingsPage";
import AiAssistantPage from "../pages/dashboardPages/AiAssistantPage";
import MyFilePage from "../pages/dashboardPages/myFilePage";
import ChatAssistant from "../pages/dashboardPages/chatAssitantpage";
import ImageGenerate from "../pages/dashboardPages/imageGeneratePage";
import CodeGenerate from "../pages/dashboardPages/codeGenerate";
import AiViceOver from "../pages/dashboardPages/aiVoiceOver";
import AudioEdit from "../pages/dashboardPages/editAudio";
import SpeechToText from "../pages/dashboardPages/speachToText";
import AiVision from "../pages/dashboardPages/aiVision";
import CompanyOnboarding from "../pages/dashboardPages/companyOnboarding";
import WebScripting from "../pages/dashboardPages/webScripting";
import AiRewriter from "../pages/dashboardPages/aiRewriter";
import ImageCaption from "../pages/dashboardPages/imageCaption";
import PlagiarismCheck from "../pages/dashboardPages/plagrisiomCheker";
import VideoToText from "../pages/dashboardPages/videoToText";
import PricingPlan from "../pages/dashboardPages/paymentPage/pricingPlan.tsx"
import AffiliatePage from "../pages/dashboardPages/affiliate"
import SupportPage from "../pages/dashboardPages/supportPage"
import SupportAgent from "../pages/dashboardPages/openTicketPage"
import CoelenterateAgent from "../pages/dashboardPages/codeGenerateChat"
import McpServerSetting from "../pages/dashboardPages/MCPwidgetPages/mcpSetting.tsx";
import VisitorTracking from "../pages/dashboardPages/MCPwidgetPages/visitorTracking.js";
import DesignToCode from "../pages/dashboardPages/DesignToCode"
import AICanvas from "../pages/dashboardPages/AICanvasPage"
import DownloadWidgetPage from "../pages/dashboardPages/MCPwidgetPages/DownloadWidget.js"
import WidgetsCustomPage from "../pages/dashboardPages/MCPwidgetPages/CustomDesign.js"
import WidgetGuidelinePage from "../pages/dashboardPages/MCPwidgetPages/WidgetGuideline.js"
import WidgetDownloadListPage from "../pages/dashboardPages/MCPwidgetPages/widgetDownloadList.js"
import AnalyzeUserTablePage from "../pages/dashboardPages/MCPwidgetPages/AnalyzeUserTable.js"
import PayPalSuccussPage from "../pages/dashboardPages/paymentPage/PaymentSucessPage";
import PlatformConnectPage from "../pages/dashboardPages/PlatformConnect";  

// MCP server Pages 
import McpServer from "../pages/dashboardPages/MCPPersonal/mcpDataAnalyze.js"
import McpServerSetup from "../pages/dashboardPages/MCPPersonal/mcpServerSetup.js"
import MCPSmartMailer from "../pages/dashboardPages/MCPSmartMailer/MCPSmartMailer.tsx"
import MCPSmartMailerSetting from "../pages/dashboardPages/MCPSmartMailer/MCPSmartMailerSetting.tsx"
import MCPSmartMailerHistory from "../pages/dashboardPages/MCPSmartMailer/HistoryMailer.tsx"
import MCPSmartMailerDraftSchedule from "../pages/dashboardPages/MCPSmartMailer/DraftSchedule.tsx";
import MCPEmailSetting from "../pages/dashboardPages/MCPSmartMailer/EmailSetting.tsx"
import NewTaskGenerate from "../pages/dashboardPages/AiToolsConnection/newTaskGenerate.tsx";
import AiToolsPage from "../pages/dashboardPages/AiToolsConnection/AiTools.tsx";
import GeneratedResult from "../pages/dashboardPages/AiToolsConnection/generatePage.tsx";


import TeamSettings from "../pages/dashboardPages/TeamSettings.tsx";

// Demo page 
import ChatPage from "../pages/ChatLayoutPage.tsx"

{/* 🛠️ Admin Only */ }
import AdminLogin from "../pages/landingPages/authPage/adminAuth/AdminLoginPage.tsx";
import AdminLiveChatPage from "../pages/adminPage/liveChat"
import Affiliate from "../pages/adminPage/AffiliatePage"
import Settings from "../pages/adminPage/SettingsPage"
import TicketTokenPage from "../pages/adminPage/TicketTokenPage"
import AdminDashboardPage from "../pages/adminPage/adminDashboardPage"
import BlogPages from "../pages/adminPage/blogPages"
import DefaultChatAssistant from "../pages/adminPage/chatBotSettingPages/DefaultChatAssistantPages"
import CreateAssistantPages from "../pages/adminPage/chatBotSettingPages/createChatAssistant"
import CustomAssistantPages from "../pages/adminPage/chatBotSettingPages/customChatBotPage"
import FaqPages from "../pages/adminPage/faqPages"
import FreeUserPages from "../pages/adminPage/freeUserPages"
import MediaPage from "../pages/adminPage/mediaPage"
import OrderPages from "../pages/adminPage/orderPages"
import PaidUserPage from "../pages/adminPage/paidUserPage"
import AdminUsersPage from "../pages/adminPage/adminUsersPage"
import PlanPages from "../pages/adminPage/planPages"
import ProjectSettingPages from "../pages/adminPage/projectSettingPages"
import SmtpPage from "../pages/adminPage/smtpPage"
import PromptsPage from "../pages/adminPage/promptsPage"
import TemplatePages from "../pages/adminPage/templateSettingPages/DefaultTemplatePages"
import CustomTemplatePages from "../pages/adminPage/templateSettingPages/customTemplatePage"
import CrateTemplatePages from "../pages/adminPage/templateSettingPages/createTemplate"
import CreateBlogPage from "../pages/adminPage/createBlogPage"
import BlogDemoPreviewPage from "../pages/adminPage/BlogDemoView";
import CreatePlanPage from "../pages/adminPage/createPlanPage";
import CreateFaqPage from "../pages/adminPage/createFaqPage"
import DeepSeekPage from "../pages/adminPage/APISettingPages/deepSeekSetting.tsx"
import MetaSettingPage from "../pages/adminPage/APISettingPages/metaSetting.tsx"
import OpenAISettingPage from "../pages/adminPage/APISettingPages/openAiSetting.tsx"
import PaypalSettingPage from "../pages/adminPage/payment/paypalSetting.tsx"
import StripeSettingPage from "../pages/adminPage/payment/StripeSetting.tsx";
import RazorpaySettingPage from "../pages/adminPage/payment/RazorpaySetting.tsx";
import PaystackSettingPage from "../pages/adminPage/payment/PaystackSetting.tsx";
import PluginSettingPage from "../pages/adminPage/pluginPage/setUpPlugin";
import PluginListPage from "../pages/adminPage/pluginPage/pluginList";
import AnnouncementForm from "../pages/adminPage/Announcements";
import PaymentSettingPage from "../pages/adminPage/payment/PaymentSettingPages.tsx";
import AdminAiToolsPage from "../pages/adminPage/AiToolsConnection/adminTools.tsx";
import DataTrainingPage from "../pages/adminPage/dataTrainingPage.tsx"
import AccessControlPage from "../pages/adminPage/AccessControlPage.tsx";
import AnalyticsAndLogsPage from "../pages/adminPage/AnalyticsAndLogsPage";

// Super admin 
import SuperAdminLogin from "../pages/landingPages/authPage/superAdmin/loginPage.tsx";


const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
  
      <Route path="/" element={<PublicLayout><Home/></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><Login/></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><RegisterPage/></PublicLayout>} />
      
      {/* Admin Auth */}
      <Route path="/admin-login" element={<PublicLayout><AdminLogin/></PublicLayout>} />
 
      {/* Super Admin Auth */}
      <Route path="/super-admin-login" element={<PublicLayout><SuperAdminLogin/></PublicLayout>} />

      <Route path="/verify-Otp" element={<PublicLayout><OtpPage/></PublicLayout>} />
      <Route path="/set-password" element={<PublicLayout><NewPasswordPage/></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactPage/></PublicLayout>} />
      <Route path="/forgat-password" element={<PublicLayout><ForgatPasswordPage /></PublicLayout>} />
      <Route path="/admin-blog-demo-preview" element={<PublicLayout><BlogDemoPreviewPage /></PublicLayout>} />
      <Route path="/blogs" element={<PublicLayout><BlogPublicPages /></PublicLayout>} />
      <Route path="/blog-details" element={<PublicLayout><BlogDetailsPage /></PublicLayout>} />
      <Route path="/blog-details/:slug" element={<PublicLayout><BlogDetailsPage /></PublicLayout>} />
      <Route path="/terms-conditions" element={<PublicLayout><TermsConditions /></PublicLayout>} />
      <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />

      {/* Company Onboarding - Protected but with simple layout */}
      <Route element={<PrivateRoute />}>
        <Route path="/company-onboarding" element={<PublicLayout><CompanyOnboarding /></PublicLayout>} />
      </Route>

      {/* Private Routes - User Dashboard with User Sidebar */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
        <Route path="/myfilePage" element={<DashboardLayout><MyFilePage /></DashboardLayout>} />
        <Route path="/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
        <Route path="/assistant" element={<DashboardLayout><AiAssistantPage /></DashboardLayout>} />
        <Route path="/chatassistant" element={<DashboardLayout><ChatAssistant /></DashboardLayout>} />
        <Route path="/imagegenerate" element={<DashboardLayout><ImageGenerate /></DashboardLayout>} />
        <Route path="/codegenerate" element={<DashboardLayout><CodeGenerate /></DashboardLayout>} />
        <Route path="/aiviceover" element={<DashboardLayout><AiViceOver /></DashboardLayout>} />
        <Route path="/audioedit" element={<DashboardLayout><AudioEdit /></DashboardLayout>} />
        <Route path="/speachtotext" element={<DashboardLayout><SpeechToText /></DashboardLayout>} />
        <Route path="/aivision" element={<DashboardLayout><AiVision /></DashboardLayout>} />
        <Route path="/webscripting" element={<DashboardLayout><WebScripting /></DashboardLayout>} />
        <Route path="/airewriter" element={<DashboardLayout><AiRewriter /></DashboardLayout>} />
        <Route path="/imagecaption" element={<DashboardLayout><ImageCaption /></DashboardLayout>} />
        <Route path="/plagiarismcheck" element={<DashboardLayout><PlagiarismCheck /></DashboardLayout>} />
        <Route path="/videototext" element={<DashboardLayout><VideoToText /></DashboardLayout>} />
        <Route path="/pricingplan" element={<DashboardLayout><PricingPlan /></DashboardLayout>} />
        <Route path="/affiliate" element={<DashboardLayout><AffiliatePage /></DashboardLayout>} />
        <Route path="/supports" element={<DashboardLayout><SupportPage /></DashboardLayout>} />
        <Route path="/open-ticket" element={<DashboardLayout><SupportAgent /></DashboardLayout>} />
        <Route path="/code-generate-Agent" element={<DashboardLayout><CoelenterateAgent /></DashboardLayout>} />
        <Route path="/team-settings" element={<DashboardLayout><TeamSettings /></DashboardLayout>} />
        <Route path="/mcp-server-setting" element={<DashboardLayout><McpServerSetting /></DashboardLayout>} />
        <Route path="/visitor-analyzer" element={<DashboardLayout><VisitorTracking /></DashboardLayout>} />
        <Route path="/design-to-code" element={<DashboardLayout><DesignToCode /></DashboardLayout>} />
        <Route path="/ai-canvas" element={<DashboardLayout><AICanvas /></DashboardLayout>} />
        <Route path="/mcp-server" element={<DashboardLayout><McpServer /></DashboardLayout>} />
        <Route path="/mcp-server-setup" element={<DashboardLayout><McpServerSetup /></DashboardLayout>} />
        <Route path="/download-widget-page" element={<DashboardLayout><DownloadWidgetPage /></DashboardLayout>} />
        <Route path="/widgets-custom-page" element={<DashboardLayout><WidgetsCustomPage /></DashboardLayout>} />
        <Route path="/widget-guideline-page" element={<DashboardLayout><WidgetGuidelinePage /></DashboardLayout>} />
        <Route path="/widget-download-list-page" element={<DashboardLayout><WidgetDownloadListPage /></DashboardLayout>} />
        <Route path="/widget-user-table" element={<DashboardLayout><AnalyzeUserTablePage /></DashboardLayout>} />
        <Route path="/payment-success" element={<DashboardLayout><PayPalSuccussPage /></DashboardLayout>} />
        <Route path="/chat-page" element={<DashboardLayout><ChatPage/></DashboardLayout>} />
        <Route path="/mcp-smart-mailer" element={<DashboardLayout><MCPSmartMailer/></DashboardLayout>} />
        <Route path="/mcp-smart-mailer-setting" element={<DashboardLayout><MCPSmartMailerSetting/></DashboardLayout>} />
        <Route path="/mcp-smart-mailer-history" element={<DashboardLayout><MCPSmartMailerHistory/></DashboardLayout>} />
        <Route path="/mcp-smart-mailer-draft-schedule" element={<DashboardLayout><MCPSmartMailerDraftSchedule/></DashboardLayout>} />
        <Route path="/mcp-email-setting" element={<DashboardLayout><MCPEmailSetting/></DashboardLayout>} />
        <Route path="/ai-tools-page" element={<DashboardLayout><AiToolsPage /></DashboardLayout>} />
        <Route 
  path="/platform-connect" 
  element={<DashboardLayout><PlatformConnectPage /></DashboardLayout>} 
/>

        <Route path="/new-task-generate" element={<DashboardLayout><NewTaskGenerate /></DashboardLayout>} />
        <Route path="/generated-result" element={<GeneratedResult />} />
      </Route>

      {/* Admin Routes - Admin Dashboard with Admin Sidebar */}
      
      <Route element={<AdminRoute/>}>
        <Route path="/admin" element={<DashboardLayout forceRole="admin"><AdminDashboardPage /></DashboardLayout>} />
        <Route path="/admin-users" element={<DashboardLayout forceRole="admin"><AdminUsersPage /></DashboardLayout>} />
        <Route path="/admin-live-chat" element={<DashboardLayout forceRole="admin"><AdminLiveChatPage /></DashboardLayout>} />
        <Route path="/admin-settings" element={<DashboardLayout forceRole="admin"><Settings /></DashboardLayout>} />
        <Route path="/admin-affiliate" element={<DashboardLayout forceRole="admin"><Affiliate /></DashboardLayout>} />
        <Route path="/admin-ticket-token" element={<DashboardLayout forceRole="admin"><TicketTokenPage /></DashboardLayout>} />
        <Route path="/admin-blogs" element={<DashboardLayout forceRole="admin"><BlogPages /></DashboardLayout>} />
        <Route path="/default-chat-assistants" element={<DashboardLayout forceRole="admin"><DefaultChatAssistant /></DashboardLayout>} />
        <Route path="/admin-faqs" element={<DashboardLayout forceRole="admin"><FaqPages /></DashboardLayout>} />
        <Route path="/admin-free-users" element={<DashboardLayout forceRole="admin"><FreeUserPages /></DashboardLayout>} />
        <Route path="/admin-media" element={<DashboardLayout forceRole="admin"><MediaPage /></DashboardLayout>} />
        <Route path="/admin-orders" element={<DashboardLayout forceRole="admin"><OrderPages /></DashboardLayout>} />
        <Route path="/admin-paid-users" element={<DashboardLayout forceRole="admin"><PaidUserPage /></DashboardLayout>} />
        <Route path="/admin-plans" element={<DashboardLayout forceRole="admin"><PlanPages /></DashboardLayout>} />
        <Route path="/admin-prompts" element={<DashboardLayout forceRole="admin"><PromptsPage /></DashboardLayout>} />
        <Route path="/admin-analytics-logs" element={<DashboardLayout forceRole="admin"><AnalyticsAndLogsPage /></DashboardLayout>} />
        <Route path="/admin-project-settings" element={<DashboardLayout forceRole="admin"><ProjectSettingPages /></DashboardLayout>} />
        <Route path="/admin-smtp" element={<DashboardLayout forceRole="admin"><SmtpPage /></DashboardLayout>} />
        <Route path="/admin-create-blog" element={<DashboardLayout forceRole="admin"><CreateBlogPage/></DashboardLayout>} />
        <Route path="/admin-create-plan" element={<DashboardLayout forceRole="admin"><CreatePlanPage /></DashboardLayout>} />
        <Route path="/admin-create-faq" element={<DashboardLayout forceRole="admin"><CreateFaqPage /></DashboardLayout>} />
        <Route path="/deepSeek-setting" element={<DashboardLayout forceRole="admin"><DeepSeekPage /></DashboardLayout>} />
        <Route path="/meta-setting" element={<DashboardLayout forceRole="admin"><MetaSettingPage /></DashboardLayout>} />
        <Route path="/openai-setting" element={<DashboardLayout forceRole="admin"><OpenAISettingPage /></DashboardLayout>} />
        <Route path="/paypal-setting" element={<DashboardLayout forceRole="admin"><PaypalSettingPage /></DashboardLayout>} />
        <Route path="/Stripe-setting" element={<DashboardLayout forceRole="admin"><StripeSettingPage /></DashboardLayout>} />
        <Route path="/Razorpay-setting" element={<DashboardLayout forceRole="admin"><RazorpaySettingPage /></DashboardLayout>} />
        <Route path="/Paystack-setting" element={<DashboardLayout forceRole="admin"><PaystackSettingPage /></DashboardLayout>} />
        <Route path="/create-ai-chatbot" element={<DashboardLayout forceRole="admin"><CreateAssistantPages /></DashboardLayout>} />
        <Route path="/custom-chatbot-assistant" element={<DashboardLayout forceRole="admin"><CustomAssistantPages/></DashboardLayout>} />
        <Route path="/default-templates" element={<DashboardLayout forceRole="admin"><TemplatePages /></DashboardLayout>} />
        <Route path="/custom-template" element={<DashboardLayout forceRole="admin"><CustomTemplatePages /></DashboardLayout>} />
        <Route path="/create-template" element={<DashboardLayout forceRole="admin"><CrateTemplatePages /></DashboardLayout>} />
        <Route path="/plugin-setting" element={<DashboardLayout forceRole="admin"><PluginSettingPage /></DashboardLayout>} />
        <Route path="/plugin-list" element={<DashboardLayout forceRole="admin"><PluginListPage /></DashboardLayout>} />
        <Route path="/announcement" element={<DashboardLayout forceRole="admin"><AnnouncementForm /></DashboardLayout>} />
        <Route path="/payment-setting" element={<DashboardLayout forceRole="admin"><PaymentSettingPage /></DashboardLayout>} />
        <Route path="/admin-ai-tools-page" element={<DashboardLayout forceRole="admin"><AdminAiToolsPage /></DashboardLayout>} />
        <Route path="/data-training-page" element={<DashboardLayout forceRole="admin"><DataTrainingPage /></DashboardLayout>} />
        <Route path="/admin-access-control" element={<DashboardLayout forceRole="admin"><AccessControlPage /></DashboardLayout>} />
      </Route>

      {/* Super Admin Routes - Super Admin Dashboard with Super Admin Sidebar */}
      <Route element={<SuperAdminRoute />}>
      <Route path="/super-admin-dashboard" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
     
      </Route>
      
    </Routes>
  );
};

export default AppRouter;



