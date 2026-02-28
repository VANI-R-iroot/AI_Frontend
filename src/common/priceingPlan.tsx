import React, { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../utils/baseUrl";

/* ================= TYPES ================= */

interface PricingPlan {
  title: string;
  prices: {
    monthly: string;
    yearly: string;
    lifetime: string;
  };
  description: string;
  popular?: boolean;
  features: { title: string; value: string | number }[];
  packageType?: string;
  planId?: number | string;
  package_duration?: string;
  package_currency?: string;
  price?: string | number;
  is_custom?: boolean;
  assigned_to_user_id?: string;
}

interface ApiPlanData {
  [key: string]: any;
  id: number;
  title: string;
  price: string | number;
  package_type?: string;
  package_duration?: string;
  description?: string;
  popular?: boolean;
  isPopular?: boolean;
  active?: boolean;
  selected_vip?: any[];
  selected_premium?: any[];
  is_custom?: boolean;
  assigned_to_user_id?: string;
}

interface PaymentGateway {
  provider: string;
  mode: string;
  isActive: boolean;
  currency?: string;
}

interface PaymentSessionData {
  orderId: string;
  approvalUrl?: string;
  sessionData?: any;
  keyId?: string;
  amount: number;
  currency: string;
  subscriptionId?: number;
  session_id?: string;
  paymentId?: string;
  signature?: string;
}

interface UserSubscription {
  planId: number | string;
  packageType: string;
  status: string;
  ends_at?: string;
  isActive: boolean;
  isExpired?: boolean;
  current_package_id?: number | string;
  isCustomPlan?: boolean;
}

interface CustomPlanRequest {
  id?: number;
  request_type?: string;
  existing_package_id?: number | null;
  requestedLimits?: Record<string, number>;
  userNotes?: string;
  user_notes?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at?: string;
  existing_package_title?: string;
  admin_notes?: string;
  reviewed_at?: string;
  approved_package_id?: number | null;
}

interface UserCustomPlan {
  id: number;
  title: string;
  package_type: string;
  package_duration: string;
  package_currency: string;
  price: number;
  is_currently_active: boolean;
  assigned_at: string;
  expires_at?: string;
  subscription_end?: string;
  notes?: string;
  payment_link?: string | null;
}

/* ================= STYLES ================= */

const styles = `
  .pricing-section {
    padding: 60px 0;
    background: #121212;
    color: #e0e0e0;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .billing-toggle {
    display: flex;
    justify-content: center;
    margin-bottom: 40px;
    gap: 10px;
  }
  
  .billing-toggle button {
    padding: 10px 20px;
    border: 1px solid #444;
    background: #1e1e1e;
    color: #e0e0e0;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .billing-toggle button:hover {
    border-color: #666;
    background: #2a2a2a;
  }
  
  .billing-toggle button.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }
  
  .current-subscription-banner {
    background: linear-gradient(135deg, #1a2a3a 0%, #1e3a5f 100%);
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 30px;
    border: 1px solid #007bff;
    box-shadow: 0 5px 15px rgba(0, 123, 255, 0.2);
  }
  
  .current-subscription-banner h3 {
    color: #fff;
    margin: 0 0 10px 0;
    font-size: 1.2rem;
  }
  
  .current-subscription-banner p {
    color: #b0d4ff;
    margin: 5px 0;
    font-size: 0.9rem;
  }
  
  .current-subscription-banner .status-badge {
    display: inline-block;
    background: #28a745;
    color: white;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.8rem;
    margin-left: 10px;
    font-weight: bold;
  }
  
  .current-subscription-banner .custom-badge {
    display: inline-block;
    background: #ff9800;
    color: white;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.8rem;
    margin-left: 10px;
    font-weight: bold;
  }
  
  .current-subscription-banner .warning-badge {
    display: inline-block;
    background: #ff9800;
    color: white;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.8rem;
    margin-left: 10px;
    font-weight: bold;
  }
  
  .pricing-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
  }
  
  .pricing-card {
    background: #1e1e1e;
    border-radius: 10px;
    padding: 30px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    position: relative;
    transition: transform 0.3s, box-shadow 0.3s;
    border: 1px solid #333;
  }
  
  .pricing-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    border-color: #555;
  }
  
  .pricing-card.popular {
    border: 2px solid #007bff;
    background: #1a2a3a;
  }
  
  .pricing-card.current-plan {
    border: 2px solid #28a745;
    background: rgba(40, 167, 69, 0.05);
  }
  
  .pricing-card.custom-plan-card {
    border: 2px solid #ff9800;
    background: rgba(255, 152, 0, 0.05);
  }
  
  .pricing-card.disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .popular-badge {
    position: absolute;
    top: -10px;
    right: 20px;
    background: #007bff;
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    box-shadow: 0 2px 10px rgba(0, 123, 255, 0.3);
  }
  
  .current-plan-badge {
    position: absolute;
    top: -10px;
    left: 20px;
    background: #28a745;
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    box-shadow: 0 2px 10px rgba(40, 167, 69, 0.3);
  }
  
  .custom-plan-badge {
    position: absolute;
    top: -10px;
    right: 20px;
    background: #ff9800;
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    box-shadow: 0 2px 10px rgba(255, 152, 0, 0.3);
  }
  
  .cannot-subscribe-badge {
    position: absolute;
    top: -10px;
    left: 20px;
    background: #dc3545;
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    box-shadow: 0 2px 10px rgba(220, 53, 69, 0.3);
  }
  
  .pricing-card h3 {
    margin: 0 0 10px 0;
    color: #fff;
  }
  
  .description {
    color: #aaa;
    margin-bottom: 20px;
    font-size: 14px;
  }
  
  .price-container {
    margin: 20px 0;
    font-size: 36px;
    font-weight: bold;
    color: #fff;
  }
  
  .currency {
    font-size: 24px;
    vertical-align: top;
    color: #ccc;
  }
  
  .price {
    margin: 0 5px;
  }
  
  .duration {
    font-size: 16px;
    color: #aaa;
    font-weight: normal;
  }
  
  .subscribe-btn {
    width: 100%;
    padding: 12px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    margin: 20px 0;
    transition: background 0.3s, transform 0.2s;
  }
  
  .subscribe-btn:hover {
    background: #0056b3;
    transform: translateY(-2px);
  }
  
  .subscribe-btn:disabled {
    background: #444;
    color: #777;
    cursor: not-allowed;
    transform: none;
  }
  
  .subscribe-btn.current-plan {
    background: #28a745;
    cursor: default;
  }
  
  .subscribe-btn.current-plan:hover {
    background: #28a745;
    transform: none;
  }
  
  .subscribe-btn.cannot-subscribe {
    background: #dc3545;
    cursor: not-allowed;
  }
  
  .subscribe-btn.cannot-subscribe:hover {
    background: #dc3545;
    transform: none;
  }
  
  .subscribe-btn.custom-plan {
    background: #ff9800;
  }
  
  .subscribe-btn.custom-plan:hover {
    background: #f57c00;
  }
  
  .plan-status {
    font-size: 12px;
    color: #28a745;
    margin-top: 5px;
    font-weight: bold;
    text-align: center;
  }
  
  .cannot-subscribe-message {
    font-size: 12px;
    color: #dc3545;
    margin-top: 5px;
    text-align: center;
    padding: 5px;
    background: rgba(220, 53, 69, 0.1);
    border-radius: 5px;
  }
  
  .features-list {
    margin-top: 20px;
    border-top: 1px solid #333;
    padding-top: 20px;
  }
  
  .feature-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    font-size: 14px;
    color: #ccc;
  }
  
  .checkmark-icon {
    color: #28a745;
    margin-right: 10px;
    font-size: 16px;
    font-weight: bold;
  }
  
  /* Custom Plan Request Section - ENHANCED */
  .custom-plan-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
    border-bottom: 1px solid #444;
    padding-bottom: 10px;
  }
  
  .custom-plan-tab {
    padding: 12px 24px;
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 8px 8px 0 0;
    color: #ccc;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;
  }
  
  .custom-plan-tab:hover {
    background: #333;
    border-color: #666;
  }
  
  .custom-plan-tab.active {
    background: #ff9800;
    color: white;
    border-color: #ff9800;
  }
  
  .custom-request-section {
    margin-top: 60px;
    padding: 40px;
    background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
    border-radius: 20px;
    border: 1px solid #444;
    position: relative;
    overflow: hidden;
  }
  
  .custom-request-section::before {
    content: "*";
    position: absolute;
    top: -20px;
    right: -20px;
    font-size: 120px;
    opacity: 0.1;
    transform: rotate(15deg);
  }
  
  .custom-request-title {
    font-size: 28px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 15px;
  }
  
  .custom-request-subtitle {
    color: #ccc;
    margin-bottom: 30px;
    font-size: 16px;
  }
  
  .custom-request-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }
  
  .custom-request-features {
    background: rgba(255, 152, 0, 0.1);
    padding: 25px;
    border-radius: 15px;
    border: 1px solid rgba(255, 152, 0, 0.3);
  }
  
  .custom-request-features h4 {
    color: #ff9800;
    margin: 0 0 20px 0;
    font-size: 18px;
  }
  
  .custom-request-feature-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    color: #e0e0e0;
  }
  
  .custom-request-feature-icon {
    color: #ff9800;
    margin-right: 10px;
    font-size: 18px;
  }
  
  .custom-request-form {
    background: #1e1e1e;
    padding: 25px;
    border-radius: 15px;
    border: 1px solid #444;
  }
  
  .custom-request-form h4 {
    color: #fff;
    margin: 0 0 20px 0;
    font-size: 18px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    color: #ccc;
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  .form-group input,
  .form-group textarea,
  .form-group select {
    width: 100%;
    padding: 12px;
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    transition: border-color 0.3s;
  }
  
  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    border-color: #ff9800;
  }
  
  .form-group input:hover,
  .form-group textarea:hover,
  .form-group select:hover {
    border-color: #666;
  }
  
  .existing-plan-selector {
    margin-bottom: 20px;
  }
  
  .existing-plan-selector select {
    width: 100%;
    padding: 12px;
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
  }
  
  .selected-plan-details {
    background: #2a2a2a;
    padding: 15px;
    border-radius: 8px;
    margin-top: 10px;
    border-left: 4px solid #ff9800;
  }
  
  .selected-plan-details h5 {
    color: #ff9800;
    margin: 0 0 10px 0;
    font-size: 14px;
  }
  
  .selected-plan-details p {
    color: #ccc;
    margin: 5px 0;
    font-size: 13px;
  }
  
  .feature-limits-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .feature-limit-item {
    display: flex;
    flex-direction: column;
  }
  
  .feature-limit-item label {
    font-size: 12px;
    color: #aaa;
    margin-bottom: 4px;
  }
  
  .feature-limit-item input {
    padding: 8px;
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 5px;
    color: #fff;
    font-size: 13px;
  }
  
  .request-btn {
    background: #ff9800;
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    width: 100%;
  }
  
  .request-btn:hover {
    background: #f57c00;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 152, 0, 0.3);
  }
  
  .request-btn:disabled {
    background: #444;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .request-btn.secondary {
    background: #444;
    color: #ccc;
  }
  
  .request-btn.secondary:hover {
    background: #555;
  }
  
  .my-custom-plans-section {
    margin-top: 40px;
    padding: 30px;
    background: #1e1e1e;
    border-radius: 15px;
    border: 1px solid #444;
  }
  
  .my-custom-plans-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .my-custom-plans-title h3 {
    color: #fff;
    margin: 0;
    font-size: 20px;
  }
  
  .my-custom-plans-title span {
    background: #ff9800;
    color: white;
    padding: 3px 10px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: bold;
  }
  
  .custom-plan-item {
    padding: 20px;
    background: #2a2a2a;
    border-radius: 10px;
    margin-bottom: 15px;
    border-left: 4px solid #ff9800;
    transition: all 0.3s;
  }
  
  .custom-plan-item:hover {
    background: #333;
    transform: translateX(5px);
  }
  
  .custom-plan-item.active {
    border-left-color: #28a745;
    background: rgba(40, 167, 69, 0.1);
  }
  
  .custom-plan-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .custom-plan-header h4 {
    color: #fff;
    margin: 0;
    font-size: 16px;
  }
  
  .custom-plan-badge-active {
    background: #28a745;
    color: white;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: bold;
  }
  
  .custom-plan-badge-expired {
    background: #dc3545;
    color: white;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: bold;
  }

  .custom-plan-badge-pending {
    background: #ff9800;
    color: white;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: bold;
  }
  
  .custom-plan-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    color: #ccc;
    font-size: 13px;
  }
  
  .custom-plan-details div {
    display: flex;
    align-items: center;
  }
  
  .custom-plan-details strong {
    color: #fff;
    margin-right: 5px;
  }
  
  .custom-plan-notes {
    margin-top: 10px;
    padding: 10px;
    background: #1e1e1e;
    border-radius: 5px;
    color: #aaa;
    font-size: 12px;
    border-left: 2px solid #ff9800;
  }
  
  .request-status {
    margin-top: 20px;
    padding: 15px;
    border-radius: 8px;
    font-size: 14px;
  }
  
  .request-status.pending {
    background: rgba(255, 152, 0, 0.1);
    border: 1px solid #ff9800;
    color: #ff9800;
  }
  
  .request-status.approved {
    background: rgba(40, 167, 69, 0.1);
    border: 1px solid #28a745;
    color: #28a745;
  }
  
  .request-status.rejected {
    background: rgba(220, 53, 69, 0.1);
    border: 1px solid #dc3545;
    color: #dc3545;
  }
  
  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: #1e1e1e;
    border-radius: 10px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    border: 1px solid #444;
    color: #e0e0e0;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #333;
  }
  
  .modal-header h3 {
    margin: 0;
    color: #fff;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #aaa;
    transition: color 0.3s;
  }
  
  .close-btn:hover {
    color: #fff;
  }
  
  .plan-summary {
    padding: 20px;
    background: #2a2a2a;
    margin: 20px;
    border-radius: 5px;
    border: 1px solid #333;
  }
  
  .plan-summary h4 {
    color: #fff;
    margin: 0 0 10px 0;
  }
  
  .plan-summary p {
    color: #ccc;
    margin: 5px 0;
  }
  
  .gateway-options {
    padding: 20px;
  }
  
  .gateway-btn {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 15px;
    margin-bottom: 10px;
    border: 1px solid #444;
    background: #2a2a2a;
    color: #e0e0e0;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .gateway-btn:hover {
    border-color: #666;
    background: #333;
  }
  
  .gateway-btn.selected {
    border-color: #007bff;
    background: rgba(0, 123, 255, 0.1);
  }
  
  .gateway-btn img {
    width: 30px;
    height: 30px;
    margin-right: 10px;
  }
  
  .gateway-btn span {
    flex: 1;
    text-align: left;
    text-transform: capitalize;
  }
  
  .gateway-icon {
    margin-right: 10px;
    font-size: 20px;
  }
  
  .mode-badge {
    background: #28a745;
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 20px;
    border-top: 1px solid #333;
  }
  
  .cancel-btn {
    padding: 10px 20px;
    border: 1px solid #444;
    background: #2a2a2a;
    color: #e0e0e0;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .cancel-btn:hover {
    background: #333;
    border-color: #666;
  }
  
  .pay-btn {
    padding: 10px 20px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
  }
  
  .pay-btn:hover {
    background: #218838;
  }
  
  .pay-btn:disabled {
    background: #444;
    cursor: not-allowed;
  }
  
  .no-packages {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px;
    background: #1e1e1e;
    border-radius: 10px;
    border: 1px solid #333;
    color: #ccc;
  }
  
  .loading-spinner {
    display: inline-block;
    width: 2rem;
    height: 2rem;
    vertical-align: text-bottom;
    border: 0.25em solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spinner-border .75s linear infinite;
  }
  
  @keyframes spinner-border {
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .pricing-cards {
      grid-template-columns: 1fr;
    }
    
    .modal-content {
      width: 95%;
    }
    
    .current-plan-badge, .popular-badge, .cannot-subscribe-badge {
      font-size: 10px;
      padding: 3px 10px;
    }
    
    .custom-request-grid {
      grid-template-columns: 1fr;
    }
    
    .feature-limits-grid {
      grid-template-columns: 1fr;
    }
  }
`;

/* ================= HELPER FUNCTIONS ================= */

const featureLabelMap: Record<string, string> = {
  prompt_count: "Prompts Available",
  team_member_limit: "Team Members",
  text_to_image_limit: "Text to Image",
  image_limit: "Image Generation",
  image_caption_limit: "Image Caption",
  ai_chat_limit: "AI Chat",
  image_to_audio_limit: "Image to Audio",
  scratch_to_code_limit: "Scratch to Code",
  grammar_checking_limit: "Grammar Check",
  text_to_paraphraser_limit: "Text Paraphraser",
  ai_chat_assistant_limit: "Chat Assistant",
  ai_template_limit: "AI Templates",
  tts_audio_limit: "Text to Speech",
  video_to_text_limit: "Video to Text",
  ai_vision_limit: "AI Vision",
  web_scripting_limit: "Web Scripting",
  ai_rewriter_limit: "AI Rewriter",
  speech_to_text_limit: "Speech to Text",
  ai_voiceover_limit: "AI Voiceover",
  ai_code_generate_limit: "Code Generator",
  ai_mcp_smart_mailer_limit: "Smart Mailer",
  personal_data_analyze_limit: "Data Analyzer",
};

const formatTitle = (key: string) =>
  featureLabelMap[key] ||
  key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

const isTruthyFlag = (value: any) =>
  value === true || value === 1 || value === "1";

const mapApiSubscription = (subscription: any): UserSubscription => {
  const endsAt = subscription?.ends_at ? new Date(subscription.ends_at).getTime() : null;
  const now = Date.now();
  const status = (subscription?.subscription_status || subscription?.stripe_status || "inactive").toLowerCase();
  const hasExplicitIsActive =
    subscription?.is_active !== undefined || subscription?.isActive !== undefined;
  const activeStatus = status === "active" || status === "trialing";
  const notExpiredByDate = !endsAt || endsAt > now;

  let isActive = false;
  if (hasExplicitIsActive) {
    // Keep explicit true, but also recover from stale/incorrect explicit false.
    isActive =
      isTruthyFlag(subscription?.is_active) ||
      isTruthyFlag(subscription?.isActive) ||
      (activeStatus && notExpiredByDate);
  } else {
    isActive = activeStatus && notExpiredByDate;
  }

  const isExpired = Boolean(!isActive && endsAt && endsAt <= now);

  return {
    planId: subscription?.current_package_id || subscription?.package_id || subscription?.id,
    packageType: subscription?.package_type || subscription?.title || "Plan",
    status: (subscription?.subscription_status || subscription?.stripe_status || "inactive").toString(),
    ends_at: subscription?.ends_at,
    isActive,
    isExpired,
    current_package_id: subscription?.current_package_id || subscription?.package_id,
    isCustomPlan: Boolean(subscription?.isCustomPlan || subscription?.package_is_custom),
  };
};

/* ================= COMPONENT ================= */

const PricingTable: React.FC = () => {
  const hasSignedInRole = () =>
    !!localStorage.getItem("role") || !!sessionStorage.getItem("role");

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly" | "lifetime">("monthly");
  const [monthlyData, setMonthlyData] = useState<ApiPlanData[]>([]);
  const [yearlyData, setYearlyData] = useState<ApiPlanData[]>([]);
  const [lifetimeData, setLifetimeData] = useState<ApiPlanData[]>([]);
  const [dynamicPricingPlans, setDynamicPricingPlans] = useState<PricingPlan[]>([]);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [loadingGateways, setLoadingGateways] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState<string>("stripe");
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [canSubscribeMap, setCanSubscribeMap] = useState<Record<string, { canSubscribe: boolean, reason: string }>>({});
  
  // Custom plan request / payment-link flow
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [customPlanRequests, setCustomPlanRequests] = useState<CustomPlanRequest[]>([]);
  const [showRequestHistory, setShowRequestHistory] = useState(false);
  const [showCustomPlanHistory, setShowCustomPlanHistory] = useState(false);
  const [userCustomPlans, setUserCustomPlans] = useState<UserCustomPlan[]>([]);
  const [loadingCustomPlans, setLoadingCustomPlans] = useState(false);
  const autoPayHandledRef = useRef(false);

  /* ================= LOAD USER'S CURRENT SUBSCRIPTION ================= */
  useEffect(() => {
    const fetchUserSubscription = async () => {
      if (!hasSignedInRole()) {
        setUserSubscription(null);
        return;
      }

      try {
        console.log("[subscription] Fetching user's current subscription...");
        
        const res = await axiosInstance.get("/subscription/current");
        console.log("User subscription response:", res.data);
        
        if (res.data?.success && res.data.data) {
          const subscription = res.data.data;
          setUserSubscription(mapApiSubscription(subscription));
        } else {
          console.log("No active subscription found");
          setUserSubscription(null);
        }
      } catch (error: any) {
        console.error("Error fetching user subscription:", error);
        if (error.response?.status === 404) {
          setUserSubscription(null);
        }
      } finally {
      }
    };
    
    fetchUserSubscription();
  }, []);

  /* ================= LOAD USER'S CUSTOM PLANS ================= */
  useEffect(() => {
    const fetchUserCustomPlans = async () => {
      if (!hasSignedInRole()) {
        setUserCustomPlans([]);
        setLoadingCustomPlans(false);
        return;
      }

      try {
        setLoadingCustomPlans(true);
        const res = await axiosInstance.get("/user/custom-plans/my");
        if (res.data.success) {
          setUserCustomPlans(res.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching user custom plans:", error);
      } finally {
        setLoadingCustomPlans(false);
      }
    };

    fetchUserCustomPlans();
  }, []);

  /* ================= LOAD USER'S CUSTOM PLAN REQUESTS ================= */
  useEffect(() => {
    const fetchCustomPlanRequests = async () => {
      if (!hasSignedInRole()) {
        setCustomPlanRequests([]);
        return;
      }

      try {
        const res = await axiosInstance.get("/user/custom-plans/requests");
        if (res.data.success) {
          setCustomPlanRequests(res.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching custom plan requests:", error);
      } finally {
      }
    };

    fetchCustomPlanRequests();
  }, []);

  /* ================= VERIFY SUBSCRIPTION BEFORE PROCEEDING ================= */
  const verifyAndSubscribe = async (plan: PricingPlan) => {
    if (!plan.planId) {
      toast.error("Invalid plan ID");
      return;
    }
    
    if (processingPayment || checkingSubscription) {
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      const checkRes = await axiosInstance.get(`/subscription/check-can-subscribe/${plan.planId}`);
      
      if (!checkRes.data.success || !checkRes.data.data.canSubscribe) {
        toast.error(checkRes.data.data.reason || "Cannot subscribe to this plan");
        setProcessingPayment(false);
        return;
      }
      
      if (plan.price === 0 || plan.price === "0") {
        await handleFreeSubscription(plan);
        return;
      }
      
      setSelectedPlan(plan);
      setShowGatewayModal(true);
      
    } catch (error: any) {
      console.error("Verification error:", error);
      const errorMessage = error.response?.data?.message || "Failed to verify subscription";
      
      if (errorMessage.includes("already have an active subscription")) {
        toast.error("You already have an active subscription to this plan!");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  /* ================= CHECK SUBSCRIPTION FOR EACH PLAN ================= */
  const checkSubscriptionForPlan = async (plan: PricingPlan): Promise<boolean> => {
    try {
      setCheckingSubscription(true);
      
      const res = await axiosInstance.get(`/subscription/check-can-subscribe/${plan.planId}`);
      
      const canSubscribe = res.data.success && res.data.data.canSubscribe;
      
      setCanSubscribeMap(prev => ({
        ...prev,
        [plan.planId?.toString() || '']: {
          canSubscribe,
          reason: res.data.data.reason || ""
        }
      }));
      
      return canSubscribe;
    } catch (error: any) {
      const statusCode = error?.response?.status;
      const apiMessage = error?.response?.data?.message;
      const fallbackReason =
        statusCode === 401 || statusCode === 403
          ? "Session expired. Please login again."
          : apiMessage || "Unable to verify subscription status";

      setCanSubscribeMap(prev => ({
        ...prev,
        [plan.planId?.toString() || '']: {
          canSubscribe: false,
          reason: fallbackReason
        }
      }));
      return false;
    } finally {
      setCheckingSubscription(false);
    }
  };

  /* ================= LOAD PAYMENT GATEWAYS ================= */
  useEffect(() => {
    const fetchGateways = async () => {
      try {
        setLoadingGateways(true);
        const res = await axiosInstance.get("/payments/active-payment-providers");

        if (res.data?.success) {
          const gateways = res.data.data || [];
          const activeGateways = gateways.filter((g: any) => 
            g.isActive === true || g.isActive === 1 || g.status === "active"
          );
          
          setPaymentGateways(activeGateways);
          
          if (activeGateways.length > 0) {
            setSelectedGateway(activeGateways[0].provider);
          } else {
            const fallbackGateways: PaymentGateway[] = [
              { provider: "stripe", mode: "test", isActive: true, currency: "USD" },
            ];
            setPaymentGateways(fallbackGateways);
            setSelectedGateway("stripe");
          }
        } else {
          const fallbackGateways: PaymentGateway[] = [
            { provider: "stripe", mode: "test", isActive: true, currency: "USD" },
          ];
          setPaymentGateways(fallbackGateways);
          setSelectedGateway("stripe");
        }
      } catch (e: any) {
        const fallbackGateways: PaymentGateway[] = [
          { provider: "stripe", mode: "test", isActive: true, currency: "USD" },
        ];
        setPaymentGateways(fallbackGateways);
        setSelectedGateway("stripe");
      } finally {
        setLoadingGateways(false);
      }
    };
    
    fetchGateways();
  }, []);

  /* ================= LOAD PACKAGES ================= */
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoadingPackages(true);
        const res = await axiosInstance.get("/user/packages");

        if (res.data?.status === true || res.data?.success === true) {
          const all = res.data.data || [];
          
          // Filter out custom plans assigned to other users
          const publicPlans = all.filter((p: ApiPlanData) => 
            !p.is_custom || (p.assigned_to_user_id === userSubscription?.planId?.toString())
          );

          setMonthlyData(
            publicPlans.filter((p: ApiPlanData) =>
              p.package_duration?.toLowerCase().includes("month")
            )
          );

          setYearlyData(
            publicPlans.filter((p: ApiPlanData) =>
              p.package_duration?.toLowerCase().includes("year")
            )
          );

          setLifetimeData(
            publicPlans.filter((p: ApiPlanData) =>
              p.package_duration?.toLowerCase().includes("life") ||
              p.package_duration?.toLowerCase().includes("day")
            )
          );
        }
      } catch (e: any) {
        console.error("Package fetch failed", e);
        toast.error(`Failed to load packages: ${e.message}`);
      } finally {
        setLoadingPackages(false);
      }
    };

    if (!loadingCustomPlans) {
      fetchPackages();
    }
  }, [userCustomPlans, loadingCustomPlans, userSubscription]);

  /* ================= TRANSFORM DATA ================= */
  useEffect(() => {
    let source: ApiPlanData[] = [];

    if (billingCycle === "monthly") source = monthlyData;
    if (billingCycle === "yearly") source = yearlyData;
    if (billingCycle === "lifetime") source = lifetimeData;

    const plans: PricingPlan[] = source.map((plan) => {
      const features = Object.entries(plan)
        .filter(
          ([key, val]) =>
            ![              "id", "title", "price", "package_type", "package_duration",
              "package_currency", "description", "active", "popular",
              "isPopular", "created_at", "updated_at", "create_date",
              "update_date", "is_deleted", "selected_vip", "selected_premium",
              "is_custom", "assigned_to_user_id"
            ].includes(key) &&
            typeof val !== "object" &&
            val !== null &&
            !key.includes("_at") &&
            !key.includes("_date")
        )
        .map(([key, val]) => {
          const numeric = Number(val);
          const displayValue = Number.isFinite(numeric) && numeric === -1 ? "Unlimited" : val;
          return {
            title: formatTitle(key),
            value: displayValue,
          };
        });

      const price = plan.price
        ? Number(plan.price).toFixed(0)
        : "0";

      return {
        planId: plan.id,
        title: plan.title,
        packageType: plan.package_type || plan.title,
        description: plan.description || "AI-powered features included",
        popular: plan.popular || plan.isPopular || false,
        package_duration: plan.package_duration,
        package_currency: plan.package_currency || "USD",
        price: plan.price,
        prices: {
          monthly: billingCycle === "monthly" ? price : "0",
          yearly: billingCycle === "yearly" ? price : "0",
          lifetime: billingCycle === "lifetime" ? price : "0",
        },
        features,
        is_custom: plan.is_custom,
        assigned_to_user_id: plan.assigned_to_user_id,
      };
    });

    setDynamicPricingPlans(plans);

    if (!hasSignedInRole()) {
      setCanSubscribeMap({});
      return;
    }

    plans.forEach(plan => {
      checkSubscriptionForPlan(plan);
    });
  }, [billingCycle, monthlyData, yearlyData, lifetimeData]);

  /* ================= CHECK IF PLAN IS CURRENT ================= */
  const isCurrentPlan = (plan: PricingPlan): boolean => {
    if (!userSubscription || !plan.planId) return false;
    const userPlanId = userSubscription.current_package_id || userSubscription.planId;
    const idsMatch =
      userPlanId !== undefined &&
      userPlanId !== null &&
      userPlanId.toString() === plan.planId.toString();

    if (idsMatch && userSubscription.isActive) {
      return true;
    }

    // Fallback for environments where API returns inconsistent package IDs.
    const normalize = (val: any) =>
      String(val || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
    const planLabel = normalize(plan.packageType || plan.title);
    const currentLabel = normalize(userSubscription.packageType);

    return Boolean(
      userSubscription.isActive &&
      planLabel &&
      currentLabel &&
      planLabel === currentLabel
    );
  };

  /* ================= CHECK IF CAN SUBSCRIBE TO PLAN ================= */
  const canSubscribeToPlan = (plan: PricingPlan): boolean => {
    if (!plan.planId) return false;
    
    // Custom plans cannot be subscribed to directly
    if (plan.is_custom) {
      return false;
    }
    
    const planCheck = canSubscribeMap[plan.planId.toString()];
    
    if (planCheck) {
      return planCheck.canSubscribe;
    }
    
    if (isCurrentPlan(plan)) {
      return false;
    }
    
    if (userSubscription?.isActive && (plan.price === 0 || plan.price === "0")) {
      return false;
    }
    
    return true;
  };

  /* ================= CHECK IF PLAN IS PENDING ================= */
  const isPendingPlan = (plan: PricingPlan): boolean => {
    if (!plan.planId) return false;
    const reason = canSubscribeMap[plan.planId.toString()]?.reason || "";
    return reason.toLowerCase().includes("pending subscription");
  };

  /* ================= GET BUTTON TEXT ================= */
  const getButtonText = (plan: PricingPlan): string => {
    if (isCurrentPlan(plan)) {
      return "Current Active Plan \u2713";
    }

    if (isPendingPlan(plan)) {
      return "Current Plan (Pending)";
    }

    if (!canSubscribeToPlan(plan)) {
      return "Cannot Subscribe";
    }

    if (plan.price === 0 || plan.price === "0") {
      return "Get Started Free";
    }

    return "Subscribe Now";
  };

  /* ================= GET BUTTON CLASS ================= */
  const getButtonClass = (plan: PricingPlan): string => {
    if (isCurrentPlan(plan)) {
      return "subscribe-btn current-plan";
    }

    if (isPendingPlan(plan)) {
      return "subscribe-btn current-plan";
    }

    if (!canSubscribeToPlan(plan)) {
      return "subscribe-btn cannot-subscribe";
    }

    if (plan.is_custom) {
      return "subscribe-btn custom-plan";
    }

    return "subscribe-btn";
  };

  /* ================= FREE SUBSCRIPTION HANDLER ================= */
  const handleFreeSubscription = async (plan: PricingPlan) => {
    try {
      setProcessingPayment(true);
      toast.info("Activating free subscription...", { autoClose: 2000 });
      
      const res = await axiosInstance.post("/subscription/free", {
        packageId: plan.planId
      });
      
      if (res.data.success) {
        toast.success("Free subscription activated successfully!");
        try {
          await axiosInstance.post("/refresh-token");
        } catch (tokenError) {
          console.error("Token refresh failed:", tokenError);
        }
        
        const subRes = await axiosInstance.get("/subscription/current");
        if (subRes.data?.success && subRes.data.data) {
          const subscription = subRes.data.data;
          setUserSubscription(mapApiSubscription(subscription));
        }
        
        setCanSubscribeMap({});
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(res.data.message || "Failed to activate free subscription");
      }
    } catch (error: any) {
      console.error("Free subscription error:", error);
      const errorMessage = error.response?.data?.message || "Failed to activate free subscription";
      
      if (errorMessage.includes("already have an active subscription")) {
        toast.error("You already have an active subscription. Cancel it first.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  /* ================= CUSTOM PLAN REQUEST + PAYMENT LINK ================= */
  const buildPricingPlanFromCustom = (plan: UserCustomPlan): PricingPlan => {
    const priceString = Number(plan.price || 0).toFixed(0);
    return {
      planId: plan.id,
      title: plan.title,
      packageType: plan.package_type || plan.title,
      description: "Private custom plan assigned by administrator",
      package_duration: plan.package_duration,
      package_currency: plan.package_currency || "USD",
      price: plan.price || 0,
      prices: {
        monthly: priceString,
        yearly: priceString,
        lifetime: priceString,
      },
      features: [],
      is_custom: true,
      assigned_to_user_id: userSubscription?.planId?.toString(),
    };
  };

  const handlePayCustomPlan = async (plan: UserCustomPlan) => {
    if (plan.is_currently_active) {
      toast.info("This custom plan is already active.");
      return;
    }
    await verifyAndSubscribe(buildPricingPlanFromCustom(plan));
  };

  const handleSubmitCustomRequest = async () => {
    const hasPendingRequest = customPlanRequests.some((req) => req.status === "pending");
    if (hasPendingRequest) {
      toast.info("You already have a pending custom plan request.");
      return;
    }

    try {
      setSubmittingRequest(true);
      const res = await axiosInstance.post("/user/custom-plans/request", {});

      if (res.data.success) {
        toast.success("Custom plan request submitted successfully!");
        const requestsRes = await axiosInstance.get("/user/custom-plans/requests");
        if (requestsRes.data.success) {
          setCustomPlanRequests(requestsRes.data.data || []);
        }
      }
    } catch (error: any) {
      console.error("Error submitting custom plan request:", error);
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmittingRequest(false);
    }
  };

  useEffect(() => {
    if (autoPayHandledRef.current) return;
    if (loadingCustomPlans) return;

    const params = new URLSearchParams(window.location.search);
    const customPlanId = params.get("payCustomPlan");
    if (!customPlanId) return;

    const targetPlan = userCustomPlans.find((plan) => plan.id.toString() === customPlanId);
    if (!targetPlan) return;

    autoPayHandledRef.current = true;
    handlePayCustomPlan(targetPlan);
  }, [loadingCustomPlans, userCustomPlans]);

  const getCustomPlanDisplayStatus = (plan: UserCustomPlan): "active" | "pending" | "expired" => {
    if (plan.is_currently_active) return "active";

    const now = Date.now();
    const hasPastPlanExpiry = plan.expires_at ? new Date(plan.expires_at).getTime() < now : false;
    const hasPastSubscriptionEnd = plan.subscription_end ? new Date(plan.subscription_end).getTime() < now : false;

    if (hasPastPlanExpiry || hasPastSubscriptionEnd) {
      return "expired";
    }

    return "pending";
  };

  const activeUserCustomPlans = userCustomPlans.filter((plan) => getCustomPlanDisplayStatus(plan) !== "expired");
  const displayedUserCustomPlans = showCustomPlanHistory ? userCustomPlans : activeUserCustomPlans;
  const hiddenCustomPlanCount = Math.max(userCustomPlans.length - activeUserCustomPlans.length, 0);

  const activeCustomPlanRequests = customPlanRequests.filter((req) => {
    const isPending = req.status === "pending";
    const isApprovedAwaitingAssignment = req.status === "approved" && !req.approved_package_id;
    return isPending || isApprovedAwaitingAssignment;
  });
  const displayedCustomPlanRequests = showRequestHistory
    ? customPlanRequests
    : activeCustomPlanRequests;
  const hiddenRequestCount = Math.max(customPlanRequests.length - activeCustomPlanRequests.length, 0);

  const handleGatewayClose = () => {
    setShowGatewayModal(false);
    setSelectedPlan(null);
    setProcessingPayment(false);
  };

  const handlePayment = async (gateway: string) => {
    if (!selectedPlan) {
      toast.error("No plan selected");
      return;
    }

    try {
      setProcessingPayment(true);
      toast.info(`Processing payment with ${gateway.toUpperCase()}...`, {
        autoClose: 3000
      });

      let paymentRes;
      
      try {
        paymentRes = await axiosInstance.post("/payments/create-payment", {
          packageId: selectedPlan.planId,
          gateway: gateway,
        });
      } catch (error: any) {
        const endpoints = [
          "/create-payment",
          "/payments/create-payment",
          "/payment/create-payment",
          "/v3/create-payment",
          "/api/create-payment"
        ];
        
        for (const endpoint of endpoints) {
          try {
            paymentRes = await axiosInstance.post(endpoint, {
              packageId: selectedPlan.planId,
              gateway: gateway
            });
            break;
          } catch (err: any) {
            continue;
          }
        }
        
        if (!paymentRes) {
          throw new Error("All payment endpoints failed");
        }
      }

      if (paymentRes.data.success) {
        const paymentData: PaymentSessionData = paymentRes.data.data;
        
        switch (gateway.toLowerCase()) {
          case "stripe":
            handleStripePayment(paymentData);
            break;
          case "paypal":
            handlePayPalPayment(paymentData);
            break;
          case "razorpay":
            handleRazorpayPayment(paymentData);
            break;
          case "paystack":
            handlePaystackPayment(paymentData);
            break;
          default:
            toast.error(`Payment gateway ${gateway} not implemented`);
        }
      } else {
        toast.error(paymentRes.data.message || "Failed to create payment session");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      
      if (error.response?.status === 401) {
        toast.error("Please login again to continue.");
        window.location.href = "/login";
      } else if (error.response?.data?.message?.includes("already have an active subscription")) {
        toast.error("You already have an active subscription to this plan. Please cancel it first.");
      } else {
        toast.error(
          error.response?.data?.message || 
          error.response?.data?.error || 
          error.message || 
          "Payment failed. Please try again."
        );
      }
    } finally {
      setProcessingPayment(false);
      handleGatewayClose();
    }
  };

  const handleStripePayment = (paymentData: PaymentSessionData) => {
    if (!paymentData.approvalUrl) {
      toast.error("No approval URL from Stripe");
      return;
    }
    
    let redirectUrl = paymentData.approvalUrl;
    if (!redirectUrl.includes('session_id=') && paymentData.session_id) {
      redirectUrl += redirectUrl.includes('?') 
        ? `&session_id=${paymentData.session_id}`
        : `?session_id=${paymentData.session_id}`;
    }
    
    window.location.href = redirectUrl;
  };

  const handlePayPalPayment = (paymentData: PaymentSessionData) => {
    if (!paymentData.approvalUrl) {
      toast.error("No approval URL from PayPal");
      return;
    }
    
    const redirectUrl = paymentData.approvalUrl.includes('?') 
      ? `${paymentData.approvalUrl}&gateway=paypal`
      : `${paymentData.approvalUrl}?gateway=paypal`;
    
    window.location.href = redirectUrl;
  };

  const handleRazorpayPayment = (paymentData: PaymentSessionData) => {
    if (!(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        openRazorpayModal(paymentData);
      };
      script.onerror = () => {
        toast.error("Failed to load Razorpay. Please refresh the page.");
        setProcessingPayment(false);
      };
      document.body.appendChild(script);
    } else {
      openRazorpayModal(paymentData);
    }
  };

  const openRazorpayModal = (paymentData: PaymentSessionData) => {
    if (!paymentData.keyId) {
      toast.error("Razorpay key not configured");
      return;
    }

    const options = {
      key: paymentData.keyId,
      amount: paymentData.amount * 100,
      currency: paymentData.currency || "INR",
      name: "AI Platform",
      description: selectedPlan?.title || "Subscription",
      order_id: paymentData.orderId,
      handler: async (response: any) => {
        window.location.href = `/payment-success?gateway=razorpay&razorpay_order_id=${response.razorpay_order_id}&razorpay_payment_id=${response.razorpay_payment_id}&razorpay_signature=${response.razorpay_signature}`;
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "9999999999"
      },
      theme: {
        color: "#3399cc"
      },
      modal: {
        ondismiss: () => {
          toast.info("Payment cancelled");
          setProcessingPayment(false);
        }
      }
    };

    try {
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      toast.error("Failed to open payment window");
      setProcessingPayment(false);
    }
  };

  const handlePaystackPayment = (paymentData: PaymentSessionData) => {
    if (!(window as any).PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => {
        openPaystackModal(paymentData);
      };
      script.onerror = () => {
        toast.error("Failed to load Paystack. Please refresh the page.");
        setProcessingPayment(false);
      };
      document.body.appendChild(script);
    } else {
      openPaystackModal(paymentData);
    }
  };

  const openPaystackModal = (paymentData: PaymentSessionData) => {
    if (!paymentData.keyId) {
      toast.error("Paystack key not configured");
      return;
    }

    const handler = (window as any).PaystackPop.setup({
      key: paymentData.keyId,
      email: "customer@example.com",
      amount: paymentData.amount * 100,
      currency: paymentData.currency || "NGN",
      ref: paymentData.orderId,
      callback: async (response: any) => {
        window.location.href = `/payment-success?gateway=paystack&reference=${response.reference}&paymentId=${response.transaction}`;
      },
      onClose: () => {
        toast.info("Payment cancelled");
        setProcessingPayment(false);
      }
    });

    handler.openIframe();
  };

  /* ================= RENDER ================= */
  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      <div className="pricing-section">
        <style>{styles}</style>
        
        <div className="container">
          {/* Billing Cycle Toggle */}
          <div className="billing-toggle">
            {["monthly", "yearly", "lifetime"].map((b) => (
              <button
                key={b}
                className={billingCycle === b ? "active" : ""}
                onClick={() => setBillingCycle(b as any)}
              >
                {b.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Current Subscription Info */}
          {userSubscription && (userSubscription.isActive || userSubscription.isExpired) && (
            <div className="current-subscription-banner">
              <h3>
                Your Current Plan: {userSubscription.packageType}
                {userSubscription.isExpired ? (
                  <span className="warning-badge">EXPIRED</span>
                ) : userSubscription.isCustomPlan ? (
                  <span className="custom-badge">CUSTOM PLAN</span>
                ) : (
                  <span className="status-badge">ACTIVE</span>
                )}
              </h3>
              <p>
                Status: <strong>{userSubscription.isExpired ? "EXPIRED" : userSubscription.status.toUpperCase()}</strong>
                {userSubscription.ends_at && (
                  <> - {userSubscription.isCustomPlan ? "Expires" : "Renews"}: {new Date(userSubscription.ends_at).toLocaleDateString()}</>
                )}
              </p>
              {userSubscription.isExpired && (
                <p style={{ fontSize: "0.9rem", color: "#ffd0a6", marginTop: "10px" }}>
                  Your plan has expired. Subscribe to another plan to continue without interruption.
                </p>
              )}
              {userSubscription.isCustomPlan && userSubscription.isActive && (
                <p style={{ fontSize: "0.85rem", color: "#ffb74d", marginTop: "10px" }}>
                  <span className="warning-badge">CUSTOM PLAN</span> This is a private plan assigned by your administrator.
                  Contact support for any changes to this plan.
                </p>
              )}
            </div>
          )}

          {/* My Custom Plans Section */}
          {(displayedUserCustomPlans.length > 0 || hiddenCustomPlanCount > 0) && (
            <div className="my-custom-plans-section">
              <div
                className="my-custom-plans-title"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}
              >
                <h3>My Custom Plans</h3>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <span>{displayedUserCustomPlans.length} {displayedUserCustomPlans.length === 1 ? "Plan" : "Plans"}</span>
                  {hiddenCustomPlanCount > 0 && (
                    <button
                      type="button"
                      className="cancel-btn"
                      style={{ width: "auto", margin: 0, padding: "8px 12px" }}
                      onClick={() => setShowCustomPlanHistory((prev) => !prev)}
                    >
                      {showCustomPlanHistory ? "Hide History" : `Show History (${hiddenCustomPlanCount})`}
                    </button>
                  )}
                </div>
              </div>
              {displayedUserCustomPlans.length === 0 ? (
                <div className="custom-plan-item">
                  <div className="custom-plan-details">
                    <div>No active custom plans right now.</div>
                  </div>
                </div>
              ) : (
                displayedUserCustomPlans.map((plan) => {
                  const planStatus = getCustomPlanDisplayStatus(plan);
                  return (
                    <div key={plan.id} className={`custom-plan-item ${planStatus === "active" ? "active" : ""}`}>
                      <div className="custom-plan-header">
                        <h4>{plan.title}</h4>
                        {planStatus === "active" ? (
                          <span className="custom-plan-badge-active">ACTIVE</span>
                        ) : planStatus === "pending" ? (
                          <span className="custom-plan-badge-pending">PAYMENT PENDING</span>
                        ) : (
                          <span className="custom-plan-badge-expired">EXPIRED</span>
                        )}
                      </div>
                      <div className="custom-plan-details">
                        <div><strong>Price:</strong> {plan.package_currency} {plan.price}</div>
                        <div><strong>Duration:</strong> {plan.package_duration}</div>
                        <div><strong>Assigned:</strong> {new Date(plan.assigned_at).toLocaleDateString()}</div>
                        {plan.expires_at && (
                          <div><strong>Expires:</strong> {new Date(plan.expires_at).toLocaleDateString()}</div>
                        )}
                      </div>
                      {plan.notes && (
                        <div className="custom-plan-notes">
                          <strong>Notes:</strong> {plan.notes}
                        </div>
                      )}
                      {planStatus !== "active" && (
                        <div style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <button
                            className="request-btn"
                            onClick={() => handlePayCustomPlan(plan)}
                            disabled={processingPayment}
                            style={{ width: "auto" }}
                          >
                            {processingPayment ? "Processing..." : "Pay & Activate Plan"}
                          </button>
                          {plan.payment_link && (
                            <button
                              className="cancel-btn"
                              onClick={() => {
                                navigator.clipboard.writeText(plan.payment_link || "");
                                toast.success("Payment link copied");
                              }}
                              style={{ width: "auto" }}
                            >
                              Copy Payment Link
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Custom Plan Requests Status */}
          {(displayedCustomPlanRequests.length > 0 || hiddenRequestCount > 0) && (
            <div className="my-custom-plans-section" style={{ marginTop: "20px" }}>
              <div
                className="my-custom-plans-title"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}
              >
                <h3>My Custom Plan Requests</h3>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <span>
                    {displayedCustomPlanRequests.length} Request{displayedCustomPlanRequests.length !== 1 ? "s" : ""}
                  </span>
                  {hiddenRequestCount > 0 && (
                    <button
                      type="button"
                      className="cancel-btn"
                      style={{ width: "auto", margin: 0, padding: "8px 12px" }}
                      onClick={() => setShowRequestHistory((prev) => !prev)}
                    >
                      {showRequestHistory ? "Hide History" : `Show History (${hiddenRequestCount})`}
                    </button>
                  )}
                </div>
              </div>
              {displayedCustomPlanRequests.length === 0 ? (
                <div className="custom-plan-item">
                  <div className="custom-plan-details">
                    <div>No active custom plan requests right now.</div>
                  </div>
                </div>
              ) : (
                displayedCustomPlanRequests.map((req, index) => (
                  <div key={index} className={`custom-plan-item`}>
                    <div className="custom-plan-header">
                      <h4>Custom Plan Request</h4>
                      <span className={`custom-plan-badge-${req.status}`}>{req.status?.toUpperCase()}</span>
                    </div>
                    <div className="custom-plan-details">
                      <div><strong>Submitted:</strong> {req.created_at ? new Date(req.created_at).toLocaleDateString() : "-"}</div>
                      {req.reviewed_at && (
                        <div><strong>Reviewed:</strong> {new Date(req.reviewed_at).toLocaleDateString()}</div>
                      )}
                    </div>
                    {req.user_notes && (
                      <div className="custom-plan-notes">
                        <strong>Your notes:</strong> {req.user_notes}
                      </div>
                    )}
                    {req.admin_notes && (
                      <div className="custom-plan-notes" style={{ borderLeftColor: req.status === 'approved' ? '#28a745' : '#dc3545' }}>
                        <strong>Admin response:</strong> {req.admin_notes}
                      </div>
                    )}
                    <div className={`request-status ${req.status}`}>
                      {req.status === 'pending' && 'Your request is pending review by an administrator.'}
                      {req.status === 'approved' && 'Your request was accepted. Admin will now assign your custom plan.'}
                      {req.status === 'rejected' && 'Your request was rejected. Please contact support for details.'}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pricing Cards */}
          <div className="pricing-cards">
            {loadingPackages ? (
              <div className="no-packages">
                <div className="loading-spinner text-primary"></div>
                <p className="mt-3">Loading pricing plans...</p>
              </div>
            ) : dynamicPricingPlans.length > 0 ? (
              dynamicPricingPlans.map((plan, i) => {
                const isCurrent = isCurrentPlan(plan);
                const isPending = isPendingPlan(plan);
                const canSubscribe = canSubscribeToPlan(plan);
                const cannotSubscribeReason = canSubscribeMap[plan.planId?.toString() || '']?.reason;
                const isCustom = plan.is_custom === true;
                const isUserCustomPlan = plan.assigned_to_user_id === userSubscription?.planId?.toString();
                
                return (
                  <div 
                    key={i} 
                    className={`pricing-card 
                      ${plan.popular ? 'popular' : ''} 
                      ${isCurrent || isPending ? 'current-plan' : ''} 
                      ${isCustom ? 'custom-plan-card' : ''}
                      ${!canSubscribe ? 'disabled' : ''}
                    `}
                    style={isCustom ? { border: '2px solid #ff9800' } : {}}
                  >
                    {isCurrent && <div className="current-plan-badge">Current Plan</div>}
                    {isPending && !isCurrent && <div className="current-plan-badge">Current Plan</div>}
                    {isCustom && !isCurrent && !isPending && (
                      <div className="custom-plan-badge">
                        {isUserCustomPlan ? 'YOUR CUSTOM PLAN' : 'CUSTOM PLAN'}
                      </div>
                    )}
                    {!canSubscribe && !isCurrent && !isPending && !isCustom && (
                      <div className="cannot-subscribe-badge">Cannot Subscribe</div>
                    )}
                    {plan.popular && canSubscribe && !isCurrent && !isCustom && (
                      <div className="popular-badge">Most Popular</div>
                    )}
                    
                    <h3>
                      {plan.packageType}
                      {isCustom && (
                        <span style={{
                          fontSize: "12px",
                          background: "#ff9800",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          marginLeft: "10px"
                        }}>
                          PRIVATE
                        </span>
                      )}
                    </h3>
                    <p className="description">
                      {isCustom 
                        ? "Private custom plan assigned by administrator" 
                        : plan.description
                      }
                    </p>

                    <div className="price-container">
                      <span className="currency">{plan.package_currency || "USD"} </span>
                      <span className="price">{plan.prices[billingCycle]}</span>
                      {plan.package_duration && (
                        <span className="duration">/{plan.package_duration}</span>
                      )}
                    </div>

                    <button 
                      className={getButtonClass(plan)}
                      onClick={() => !isCustom && verifyAndSubscribe(plan)}
                      disabled={processingPayment || isCurrent || !canSubscribe || checkingSubscription || isCustom}
                      title={
                        isCustom 
                          ? "This is a private custom plan assigned by your administrator" 
                          : isCurrent 
                          ? "This is your current active plan" 
                          : !canSubscribe 
                          ? cannotSubscribeReason || "Cannot subscribe to this plan" 
                          : ""
                      }
                    >
                      {processingPayment ? "Processing..." : 
                       isCustom ? "Private Custom Plan" : 
                       getButtonText(plan)}
                    </button>

                    {isCurrent && (
                      <div className="plan-status">
                        {"\u2713"} Active until {userSubscription?.ends_at ? 
                          new Date(userSubscription.ends_at).toLocaleDateString() : 'renewal date'}
                      </div>
                    )}

                    {!canSubscribe && !isCurrent && !isPending && cannotSubscribeReason && !isCustom && (
                      <div className="cannot-subscribe-message">
                        {cannotSubscribeReason}
                      </div>
                    )}

                    {isPending && cannotSubscribeReason && (
                      <div className="plan-status">
                        {cannotSubscribeReason}
                      </div>
                    )}

                    <div className="features-list">
                      {plan.features.map((f, j) => (
                        <div key={j} className="feature-item">
                          <span className="checkmark-icon">{"\u2713"}</span>
                          <span>{f.title}: {f.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-packages">
                <p>No pricing plans available at the moment.</p>
                <p>Please check back later or contact support.</p>
              </div>
            )}
          </div>

                    {/* Simplified Custom Plan Request Section */}
          <div className="custom-request-section">
            <div className="custom-request-title">
              Need a Custom Plan?
            </div>
            <div className="custom-request-subtitle">
              Click request once. Admin will review your request in user management, accept or reject it, and assign your custom plan.
            </div>

            <button
              className="request-btn"
              onClick={handleSubmitCustomRequest}
              disabled={submittingRequest || customPlanRequests.some((req) => req.status === "pending")}
            >
              {submittingRequest
                ? "Submitting..."
                : customPlanRequests.some((req) => req.status === "pending")
                ? "Request Pending"
                : "Request Custom Plan"}
            </button>
          </div>

          {/* Payment Gateway Modal */}
          {showGatewayModal && selectedPlan && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Select Payment Method</h3>
                  <button 
                    onClick={handleGatewayClose} 
                    className="close-btn"
                    disabled={processingPayment}
                  >
                    &times;
                  </button>
                </div>
                
                <div className="plan-summary">
                  <h4>{selectedPlan.packageType}</h4>
                  <p>
                    <strong>Price:</strong> {selectedPlan.package_currency} {selectedPlan.prices[billingCycle]} / {selectedPlan.package_duration}
                  </p>
                  {userSubscription && !userSubscription.isCustomPlan && (
                    <p style={{ color: "#ffa726", marginTop: "10px" }}>
                      <strong>Note:</strong> Your current "{userSubscription.packageType}" plan will be cancelled.
                    </p>
                  )}
                </div>

                <div className="gateway-options">
                  {loadingGateways ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                      <p className="mt-2">Loading payment options...</p>
                    </div>
                  ) : paymentGateways.length > 0 ? (
                    paymentGateways.map((gateway) => (
                      <button
                        key={gateway.provider}
                        className={`gateway-btn ${selectedGateway === gateway.provider ? 'selected' : ''}`}
                        onClick={() => setSelectedGateway(gateway.provider)}
                        disabled={processingPayment}
                      >
                        <div className="gateway-icon">
                          {gateway.provider === 'stripe' && 'CARD'}
                          {gateway.provider === 'paypal' && 'WALLET'}
                          {gateway.provider === 'razorpay' && 'RZP'}
                          {gateway.provider === 'paystack' && 'PSTK'}
                        </div>
                        <span>{gateway.provider.toUpperCase()}</span>
                        <span className="mode-badge">{gateway.mode || 'test'}</span>
                      </button>
                    ))
                  ) : (
                    <div className="alert alert-warning text-center">
                      <p>Warning: No payment gateways configured.</p>
                      <p className="text-sm mt-1">
                        Please contact your administrator to set up payment gateways.
                      </p>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button 
                    className="cancel-btn" 
                    onClick={handleGatewayClose}
                    disabled={processingPayment}
                  >
                    Cancel
                  </button>
                  <button 
                    className="pay-btn"
                    onClick={() => handlePayment(selectedGateway)}
                    disabled={processingPayment || paymentGateways.length === 0}
                  >
                    {processingPayment ? (
                      <>
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                        Processing...
                      </>
                    ) : `Pay with ${selectedGateway.toUpperCase()}`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PricingTable;



