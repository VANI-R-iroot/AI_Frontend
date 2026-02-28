import { useState } from "react";
import { io } from "socket.io-client";
import ShortLink from "../../common/ShortLinkDashboard.tsx";
import { useUserStore } from "../../zustand/userDetailsStore";
import { GiThink } from "react-icons/gi";
import { AiFillBug } from "react-icons/ai";

import { apiConfig } from "../../utils/apiConfig.tsx";
const socket = io(apiConfig.webSocketUrl, {
  transports: ["websocket"],
  withCredentials: true,
});

interface UserData {
  email: string;
  name: string;
  _id: string;
}

const OpenTicketPage = () => {
  const userData = useUserStore((state) => state.userData || {}) as UserData;
  const userID = userData._id;
  const userEmail = userData.email;
  const userName = userData.name;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("");
  const [file, setFile] = useState<File | null>(null); // FIXED TYPE
  const [loading, setLoading] = useState(false);
  const [prioryType, setPriorityType] = useState("");

  const handleSubmit = async () => {
    if (!title || !description || !issueType) {
      alert("Please fill all required fields: Title, Description, Issue Type");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("issueType", issueType);
      if (file) formData.append("attachment", file);
      socket.emit("support-issue", {
        roomID: userID,
        title,
        userEmail,
        userName,
        description,
        issueType,
        prioryType,
        fileName: file?.name || null,
        createdAt: new Date().toISOString(),
      });

      alert("✅ Issue submitted successfully!");
      setTitle("");
      setDescription("");
      setIssueType("");
      setPriorityType("");
      setFile(null);
    } catch (err) {
      console.error("Submit Error", err);
      alert("❌ Failed to submit issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content-common">
      <div className="global-link-limit-section">
        <div className="short-link-text">
          <ShortLink />
        </div>
      </div>
      <div className="row justify-content-md-center">
        <div className="col-md-8 ">
          <div className="content-wrapper-image-generate left-panel-image">
            <h2>Create New Issue</h2>
            <p>Please describe your issue.</p>

            {/* Title */}
            <div className="text-to-image-item">
              <label>Title</label>
              <div className="input-filed-item-smart-ai">
                <input
                  type="text"
                  placeholder="Enter issue title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="text-to-image-item">
              <div className="smart-ai-prompt-are">
                <label>Description your Issue</label>
                <textarea
                  placeholder="Write your issue here..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Issue Type */}
            <div className="text-to-image-item">
              <label>Issue Type</label>
              <div className="select-item-data">
                <div className="icon-select-option-dashboard">
                  <GiThink />
                </div>
                <select
                  className="form-select"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                >
                  <option value="">Select issue type</option>
                  <option value="Plugin">Plugin</option>
                  <option value="Plugin">AI Widget</option>
                  <option value="Billing">Billing</option>
                  <option value="Bugs">Bugs</option>
                  <option value="Features">Features</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>

            {/* Priority Type */}
            <div className="text-to-image-item">
              <label>Priority Type</label>
              <div className="select-item-data">
                <div className="icon-select-option-dashboard">
                  <AiFillBug />
                </div>
                <select
                  className="form-select"
                  value={prioryType}
                  onChange={(e) => setPriorityType(e.target.value)}
                >
                  <option value="">Select Priority type</option>
                  <option value="Low">Low</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* File Upload */}
            <div className="text-to-image-item">
              <label>Attachment (optional)</label>
              <div className="input-filed-item-smart-ai">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="input-container mt-4">
              <button
                className="generate-btn btn-image"
                onClick={handleSubmit}
                disabled={loading}
              >
                <span className="btn-icon">📨</span>
                {loading ? "Submitting..." : "Submit Issue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenTicketPage;
