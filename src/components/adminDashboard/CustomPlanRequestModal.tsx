import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface CustomPlanRequestModalProps {
  request: any;
  onClose: () => void;
  onApprove: (request: any, planData?: any) => void;
  onReject: (request: any, adminNotes: string) => void;
  processing: boolean;
}

const CustomPlanRequestModal: React.FC<CustomPlanRequestModalProps> = ({
  request,
  onClose,
  onApprove,
  onReject,
  processing
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'customize'>('details');
  const [adminNotes, setAdminNotes] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [customPlanData, setCustomPlanData] = useState<any>({
    title: "",
    package_type: "Custom",
    package_duration: "Monthly",
    package_currency: "USD",
    price: 0,
    text_to_image_limit: 0,
    image_limit: 0,
    image_caption_limit: 0,
    ai_chat_limit: 0,
    image_to_audio_limit: 0,
    scratch_to_code_limit: 0,
    grammar_checking_limit: 0,
    text_to_paraphraser_limit: 0,
    ai_chat_assistant_limit: 0,
    ai_template_limit: 0,
    edit_audio_limit: 0,
    tts_audio_limit: 0,
    video_to_text_limit: 0,
    ai_vision_limit: 0,
    web_scripting_limit: 0,
    ai_rewriter_limit: 0,
    speech_to_text_limit: 0,
    ai_voiceover_limit: 0,
    ai_code_generate_limit: 0,
    ai_mcp_smart_mailer_limit: 0,
    personal_data_analyze_limit: 0,
    team_member_limit: 0,
  });

  useEffect(() => {
    if (request.request_type === 'custom' && request.requested_limits) {
      setCustomPlanData({
        ...customPlanData,
        ...request.requested_limits,
        title: `Custom Plan - ${request.user_name || 'User'}`,
      });
    } else if (request.request_type === 'existing_plan' && request.existing_package_id) {
      setCustomPlanData({
        ...customPlanData,
        title: `${request.existing_package_title} (Assigned)`,
      });
    }
  }, [request]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomPlanData({
      ...customPlanData,
      [name]: name.includes('limit') || name === 'price' ? parseFloat(value) || 0 : value,
    });
  };

  const handleApprove = () => {
    if (request.request_type === 'custom') {
      onApprove(request, customPlanData);
    } else {
      onApprove(request);
    }
  };

  const featureLabels: Record<string, string> = {
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
    edit_audio_limit: "Edit Audio",
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
    team_member_limit: "Team Members",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Custom Plan Request Details</h3>
          <button onClick={onClose} className="close-btn" disabled={processing}>
            &times;
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Request Info */}
          <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <strong>User:</strong> {request.user_name} ({request.user_email})
              </div>
              <div>
                <strong>Request Type:</strong> {request.request_type === 'existing_plan' ? 'Existing Plan' : 'Custom Plan'}
              </div>
              <div>
                <strong>Status:</strong> 
                <span style={{
                  marginLeft: '8px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: request.status === 'pending' ? '#ffc107' :
                              request.status === 'approved' ? '#28a745' : '#dc3545',
                  color: 'white'
                }}>
                  {request.status}
                </span>
              </div>
              <div>
                <strong>Requested On:</strong> {new Date(request.created_at).toLocaleString()}
              </div>
            </div>
            
            {request.user_notes && (
              <div style={{ marginTop: '15px' }}>
                <strong>User Notes:</strong>
                <p style={{ background: '#1e1e1e', padding: '10px', borderRadius: '5px', marginTop: '5px' }}>
                  {request.user_notes}
                </p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
            <button
              onClick={() => setActiveTab('details')}
              style={{
                padding: '8px 16px',
                background: activeTab === 'details' ? '#007bff' : '#2a2a2a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Request Details
            </button>
            {request.status === 'pending' && (
              <button
                onClick={() => setActiveTab('customize')}
                style={{
                  padding: '8px 16px',
                  background: activeTab === 'customize' ? '#007bff' : '#2a2a2a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Customize Plan
              </button>
            )}
          </div>

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div>
              {request.request_type === 'existing_plan' ? (
                <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#ff9800' }}>Requested Plan: {request.existing_package_title}</h4>
                  <p>This user has requested the above plan to be assigned to them as a custom plan.</p>
                  {request.requested_limits && (
                    <pre style={{ background: '#1e1e1e', padding: '10px', borderRadius: '5px', overflowX: 'auto' }}>
                      {JSON.stringify(request.requested_limits, null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <div>
                  <h4 style={{ margin: '0 0 15px 0', color: '#ff9800' }}>Requested Feature Limits:</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {Object.entries(request.requested_limits || {}).map(([key, value]: [string, any]) => (
                      value > 0 && (
                        <div key={key} style={{ background: '#2a2a2a', padding: '10px', borderRadius: '5px' }}>
                          <strong>{featureLabels[key] || key.replace(/_/g, ' ')}:</strong> {value}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {request.status !== 'pending' && request.admin_notes && (
                <div style={{ marginTop: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '8px' }}>
                  <strong>Admin Response:</strong>
                  <p style={{ marginTop: '10px', color: '#e0e0e0' }}>{request.admin_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Customize Tab */}
          {activeTab === 'customize' && request.status === 'pending' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Plan Title</label>
                <input
                  type="text"
                  name="title"
                  value={customPlanData.title}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', color: 'white', borderRadius: '5px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Package Type</label>
                  <select
                    name="package_type"
                    value={customPlanData.package_type}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', color: 'white', borderRadius: '5px' }}
                  >
                    <option value="Basic">Basic</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Custom">Custom</option>
                    <option value="Free">Free</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Duration</label>
                  <select
                    name="package_duration"
                    value={customPlanData.package_duration}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', color: 'white', borderRadius: '5px' }}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Lifetime">Lifetime</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Currency</label>
                  <select
                    name="package_currency"
                    value={customPlanData.package_currency}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', color: 'white', borderRadius: '5px' }}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Price</label>
                  <input
                    type="number"
                    name="price"
                    value={customPlanData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', color: 'white', borderRadius: '5px' }}
                  />
                </div>
              </div>

              <h4 style={{ margin: '20px 0 15px 0', color: '#fff' }}>Feature Limits</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                {Object.keys(featureLabels).map((key) => (
                  <div key={key}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>{featureLabels[key]}</label>
                    <input
                      type="number"
                      name={key}
                      value={customPlanData[key] || 0}
                      onChange={handleInputChange}
                      min="0"
                      style={{ width: '100%', padding: '8px', background: '#2a2a2a', border: '1px solid #444', color: 'white', borderRadius: '5px' }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>
                  Expires At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', color: 'white', borderRadius: '5px' }}
                />
              </div>

              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes about this approval..."
                  style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', color: 'white', borderRadius: '5px' }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #444', paddingTop: '20px' }}>
            {request.status === 'pending' && (
              <>
                <button
                  onClick={() => onReject(request, adminNotes || "Request rejected by admin")}
                  disabled={processing}
                  style={{
                    padding: '10px 20px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: processing ? 'not-allowed' : 'pointer',
                    opacity: processing ? 0.5 : 1
                  }}
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  style={{
                    padding: '10px 20px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: processing ? 'not-allowed' : 'pointer',
                    opacity: processing ? 0.5 : 1
                  }}
                >
                  {processing ? 'Processing...' : 'Approve & Assign'}
                </button>
              </>
            )}
            <button
              onClick={onClose}
              disabled={processing}
              style={{
                padding: '10px 20px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: processing ? 'not-allowed' : 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomPlanRequestModal;