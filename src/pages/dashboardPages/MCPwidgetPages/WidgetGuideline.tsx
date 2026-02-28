import React from "react";

const AIAgentSetupGuide: React.FC = () => {
  return (
    <div className="ai-agent-setup-container">
      <h1 className="guide-title">🤖 AI Agent Chatbot – Installation & Usage Guide</h1>
      
      <div className="guide-step">
        <h2>✅ Step 1: Download the Agent</h2>
        <p>
          Download your personalized AI chatbot agent file from your dashboard or the plugin page.
        </p>
      </div>

      <div className="guide-step">
        <h2>✅ Step 2: Setup Google Authentication & Data Source</h2>
        <div className="sub-steps">
          <h3>🔹 Create Google Authentication:</h3>
          <ol>
            <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
            <li>Create a new project or select an existing one</li>
            <li>Enable Google Sheets API and Google Drive API</li>
            <li>Go to "Credentials" → "Create Credentials" → "Service Account"</li>
            <li>Download the JSON credentials file</li>
          </ol>
          
          <h3>🔹 Prepare Your Data:</h3>
          <ol>
            <li>Create a Google Doc or Google Sheet with your business data:</li>
            <ul>
              <li>✅ Services offered</li>
              <li>✅ Business hours</li>
              <li>✅ Contact info</li>
              <li>✅ Pricing/packages</li>
              <li>✅ Location & FAQs</li>
              <li>✅ Any specific instructions or policies</li>
            </ul>
            <li>Copy the Google Doc/Sheet ID from the URL</li>
            <li>Share the document with the service account email from your JSON file</li>
          </ol>

          <h3>🔹 Configure MCP Server:</h3>
          <ol>
            <li>Go to your MCP server settings page</li>
            <li>Upload the downloaded JSON credentials file</li>
            <li>Enter your Google Doc/Sheet ID</li>
            <li>Click "Save" - this is a one-time setup</li>
          </ol>
        </div>
        
        <div className="pro-tip">
          <p><strong>💡 Real-time Data Updates:</strong> Once configured, simply update your Google Doc or Sheet. Your MCP server will automatically read the updated data in real-time - no need to manually retrain!</p>
        </div>
      </div>

      <div className="guide-step">
        <h2>✅ Step 3: Domain Binding</h2>
        <p>
          Each chatbot is linked to a <strong>unique domain</strong>. One chatbot = one domain or subdomain. 
          If you have multiple domains, you can create and train multiple chatbots.
        </p>
      </div>

      <div className="guide-step">
        <h2>✅ Step 4: Platform Integration</h2>
        <h3>🔹 WordPress:</h3>
        <ol>
          <li>Go to WordPress → Plugins → Add New → Upload Plugin.</li>
          <li>Upload the downloaded `.zip` file.</li>
          <li>Click <strong>Activate</strong>.</li>
        </ol>

        <h3>🔹 Shopify / Wix / Custom JS Website:</h3>
        <ol>
          <li>After downloading, you'll get an embed item (script/snippet).</li>
          <li>Open your website's <code>index.html</code>.</li>
          <li>Paste the embed code before the closing <code>&lt;/body&gt;</code> tag.</li>
          <li>Save and publish your site.</li>
        </ol>
      </div>

      <div className="guide-step">
        <h2>🟡 No Coding Required</h2>
        <p>
          Just <strong>download → configure → paste → go live</strong>. No API key, no backend setup, no complicated configs.
        </p>
      </div>

      <div className="guide-step">
        <h2>🎉 Enjoy Your Smart AI Business Agent!</h2>
        <p>Your AI chatbot will:</p>
        <ul>
          <li>✅ Answer customer queries 24/7</li>
          <li>✅ Improve support experience</li>
          <li>✅ Boost engagement and sales</li>
          <li>✅ Automatically sync with your Google Docs/Sheets updates</li>
        </ul>
      </div>

      <div className="guide-step">
        <h2>❗ Pro Tip</h2>
        <p>
          Simply update your Google Doc or Sheet whenever you need to change business information. 
          Your chatbot will automatically have access to the latest data in real-time!
        </p>
      </div>
    </div>
  );
};

export default AIAgentSetupGuide;