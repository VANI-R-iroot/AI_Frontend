import { useState } from "react";
import adminImage from "../../assets/image/admin/allImage";
import CustomTextEditor from "../../components/userTextEditor/textEditor";
import ShortLink from "../../common/ShortLinkDashboard";
import CommonTrailBar from "../../common/CommonTrailBar";
import PayChatData from "../../components/userDashboard/dashboardMain/payData";

const CreateImagePage = () => {
  const [activeTab, setActiveTab] = useState("Templates");
  const [selectedFile, setSelectedFile] = useState(null);

  const files = [
    {
      id: 1,
      content:
        "Duis aute irure dolor I Duis a... dolore eu fugiat nulla pariatur. dolore...",
    },
    {
      id: 2,
      content:
        "Duis aute irure dolor I Duis a... dolore eu fugiat nulla pariatur. dolore...",
    },
    {
      id: 3,
      content:
        "Duis aute irure dolor I Duis a... dolore eu fugiat nulla pariatur. dolore...",
    },
    {
      id: 4,
      content:
        "Duis aute irure dolor I Duis a... dolore eu fugiat nulla pariatur. dolore...",
    },
    {
      id: 5,
      content:
        "Duis aute irure dolor I Duis a... dolore eu fugiat nulla pariatur. dolore...",
    },
    {
      id: 6,
      content:
        "Duis aute irure dolor I Duis a... dolore eu fugiat nulla pariatur. dolore...",
    },
    {
      id: 7,
      content:
        "Duis aute irure dolor I Duis a... dolore eu fugiat nulla pariatur. dolore...",
    },
    {
      id: 8,
      content:
        "Duis aute irure dolor I Duis a... dolore eu fugiat nulla pariatur. dolore...",
    },
  ];

  const stats = {
    totalLimit: 200,
    availableLimit: 100,
  };
  const handleFileSelect = (fileId: any) => {
    setSelectedFile(fileId);
  };

  return (
    <>
      <div className="main-content-common">
        <CommonTrailBar />
        <div className="container-flute">
          <div className="global-link-limit-section">
            <div className="short-link-text">
              <ShortLink />
            </div>
            <div>
              <PayChatData stats={stats} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="left-panel-image">
                <div className="content-wrapper-image-generate">
                  <div className="text-to-image-item">
                    <div className="smart-ai-prompt-are">
                      <label>Description</label>
                      <textarea />
                    </div>
                  </div>
                  <div className="text-to-image-item">
                    <label>Language</label>
                    <div className="select-item-data">
                      <div>
                        <img src={adminImage.LanguageIcon} alt="smart ai" />
                      </div>
                      <select
                        className="form-select"
                        aria-label="Default select example"
                      >
                        <option selected>Select Quality</option>
                        <option>Stander</option>
                        <option value="1">HD</option>
                      </select>
                    </div>
                  </div>
                  <div className="input-container mt-4">
                    <button className="generate-btn btn-image">
                      <span className="btn-icon">✨</span>
                      Generate Text
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-12 col-md-8  col-lg-8 col-xl-8">
              <div className="right-panel">
                <div className="tabs-global generate-file-header">
                  <div className="tabs-button-section">
                    <div
                      className={`tab-chatbot ${
                        activeTab === "Templates" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("Templates")}
                    >
                      Templates
                    </div>
                    <div
                      className={`tab-chatbot ${
                        activeTab === "Files" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("Files")}
                    >
                      Files
                    </div>
                  </div>

                  <div className="button-group-download">
                    <button className="btn download">
                      <img src={adminImage.PdfLogo} />
                    </button>
                    <button className="btn copy">
                      <img src={adminImage.CopyIcon} />
                    </button>
                  </div>
                </div>

                {activeTab === "Templates" ? (
                  <div className="templates-list">
                    <CustomTextEditor
                      value={""}
                      onChange={function (_html: string): void {
                        throw new Error("Function not implemented.");
                      }}
                    />
                  </div>
                ) : (
                  <div className="files-list">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className={`file-item ${
                          selectedFile === file.id ? "selected" : ""
                        }`}
                        onClick={() => handleFileSelect(file.id)}
                      >
                        <div className="file-icon">
                          <span>📄</span>
                        </div>
                        <div className="file-content">{file.content}</div>
                        {selectedFile === file.id && (
                          <div className="file-check-mark">✓</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateImagePage;
