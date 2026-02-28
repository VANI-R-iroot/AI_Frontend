import { JSX, useState } from "react";
import adminImage from "../../assets/image/admin/allImage";
import ShortLink from "../../common/ShortLinkDashboard";
import CommonTrailBar from "../../common/CommonTrailBar";
import PayChatData from "../../components/userDashboard/dashboardMain/payData";
import axiosInstance from "../../utils/baseUrl";
import jsPDF from "jspdf";
import "../../assets/css/userDashboard/plagiarismPage.css";

interface PlagiarismSource {
  text: string;
  similarity: number;
}

interface PlagiarismResults {
  isPlagiarized: boolean;
  plagiarismScore: number;
  sources: PlagiarismSource[];
}

interface Stats {
  totalLimit: number;
  availableLimit: number;
}

const PlagiarismChecker: React.FC = () => {
  const [textInput, setTextInput] = useState<string>("");
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [results, setResults] = useState<PlagiarismResults | null>(null);
  const [percentage, setPercentage] = useState<number>(0);
  const [animatePercentage, setAnimatePercentage] = useState<boolean>(false);

  const stats: Stats = {
    totalLimit: 200,
    availableLimit: 100,
  };

  const handlePlagiarismCheck = async (): Promise<void> => {
    if (!textInput.trim()) {
      alert("Please enter text to check for plagiarism");
      return; 
    }

    setIsChecking(true);
    setResults(null);
    setPercentage(0);
    setAnimatePercentage(false);

    try {
      const response = await axiosInstance.post("/check", {
        text: textInput}, { withCredentials: true
      });

      const data = response.data;

setResults({
  isPlagiarized: data.isPlagiarized,
  plagiarismScore: data.plagiarismScore,
  sources: data.sources || []
});

setTimeout(() => {
  setAnimatePercentage(true);
  setPercentage(Math.round(data.plagiarismScore));
}, 500);

    } catch (error) {
      console.error("Plagiarism check failed:", error);
      alert("Error checking plagiarism. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const getPlagiarismStatus = (): { text: string; color: string } => {
    if (!results) return { text: "Not Checked", color: "#6c757d" };
    if (results.plagiarismScore === 0) return { text: "Original", color: "#28a745" };
    if (results.isPlagiarized) return { text: "Plagiarized", color: "#dc3545" };
    if (percentage > 50) return { text: "High Similarity", color: "#fd7e14" };
    if (percentage > 20) return { text: "Medium Similarity", color: "#ffc107" };
    return { text: "Original", color: "#28a745" };
  };

  const downloadPDF = (): void => {
    if (!results) {
      alert("No results to download. Please check plagiarism first.");
      return;
    }

    const doc = new jsPDF();
    const status = getPlagiarismStatus();
    let yPos: number = 110;

    doc.setFontSize(20);
    doc.text("Plagiarism Check Report", 20, 30);

    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);

    doc.line(20, 50, 190, 50);

    doc.setFontSize(16);
    doc.text("Results Summary", 20, 65);

    doc.setFontSize(12);
    doc.text(`Similarity Percentage: ${percentage}%`, 20, 80);
    doc.text(`Status: ${status.text}`, 20, 90);
    doc.text(
      `Is Plagiarized: ${results.isPlagiarized ? "Yes" : "No"}`,
      20,
      100
    );

    if (results.sources && results.sources.length > 0) {
      doc.setFontSize(16);
      doc.text("Similar Sources Found:", 20, 120);

      yPos = 135;
      results.sources.forEach((source: PlagiarismSource, index: number) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.text(
          `${index + 1}. Similarity: ${Math.round(source.similarity)}%`,
          20,
          yPos
        );
        yPos += 10;

        const urlLines = doc.splitTextToSize(source.text, 170);
        doc.text(urlLines, 25, yPos);
        yPos += urlLines.length * 7 + 5;
      });
    }
    const maxTextLength: number = 500;
    const truncatedText: string =
      textInput.length > maxTextLength
        ? textInput.substring(0, maxTextLength) + "..."
        : textInput;

    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.text("Checked Text:", 20, yPos + 20);
    doc.setFontSize(10);
    const textLines = doc.splitTextToSize(truncatedText, 170);
    doc.text(textLines, 20, yPos + 35);
    doc.save("plagiarism-report.pdf");
  };

  const copyResults = (): void => {
    if (!results) {
      alert("No results to copy. Please check plagiarism first.");
      return;
    }

    const status = getPlagiarismStatus();
    let copyText = `Plagiarism Check Report\n`;
    copyText += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    copyText += `Results Summary:\n`;
    copyText += `Similarity Percentage: ${percentage}%\n`;
    copyText += `Status: ${status.text}\n`;
    copyText += `Is Plagiarized: ${results.isPlagiarized ? "Yes" : "No"}\n\n`;

    if (results.sources && results.sources.length > 0) {
      copyText += `Similar Sources Found:\n`;
      results.sources.forEach((source: PlagiarismSource, index: number) => {
        copyText += `${index + 1}. Similarity: ${Math.round(
          source.similarity * 100
        )}% - ${source.text}\n`;
      });
      copyText += `\n`;
    }

    copyText += `Checked Text:\n${textInput}`;

    navigator.clipboard
      .writeText(copyText)
      .then(() => {
        alert("Results copied to clipboard!");
      })
      .catch((err: Error) => {
        console.error("Failed to copy: ", err);
        alert("Failed to copy results. Please try again.");
      });
  };

  const renderCircularProgress = (): JSX.Element => {
    const radius = 85;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    const status = getPlagiarismStatus();

    return (
      <div className="plagiarism-progress-container">
        <div className="plagiarism-circular-progress">
          <svg className="plagiarism-progress-ring" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="plagiarism-progress-ring-background"
            />
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="plagiarism-progress-ring-progress"
              strokeDasharray={circumference}
              strokeDashoffset={animatePercentage ? offset : circumference}
              style={{
                stroke: status.color,
                transition: "stroke-dashoffset 2s ease-in-out",
              }}
            />
          </svg>
          <div className="plagiarism-progress-content">
            <div className="plagiarism-percentage">{percentage}%</div>
            <div className="plagiarism-status" style={{ color: status.color }}>
              {status.text}
            </div>
          </div>
        </div>

        {results && results.sources && results.sources.length > 0 && (
          <div className="plagiarism-sources">
            <h4>Similar Sources Found:</h4>
            {results.sources.map((source: PlagiarismSource, index: number) => (
              <div key={index} className="plagiarism-source-item">
                <div className="plagiarism-source-similarity">
                  {Math.round(source.similarity)}%
                </div>
                <div className="plagiarism-source-url">
                   {source.text.length > 50 ? source.text.substring(0, 50) + "..." : source.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
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

        <div className="plagiarism-main-container">
          <div className="row">
            <div className="col-12  col-sm-12 col-md-12 col-lg-12 col-xl-6 col-xxl-6">
              <div className="plagiarism-left-panel">
                <div className="plagiarism-input-section">
                  <div className="plagiarism-header">
                    <h3>📝 Plagiarism Checker</h3>
                    <p>Check your content for originality</p>
                  </div>

                  <div className="plagiarism-textarea-container">
                    <label className="plagiarism-label">
                      Enter Text to Check
                    </label>
                    <textarea
                      className="plagiarism-textarea"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste your text here to check for plagiarism..."
                      rows={12}
                    />
                    <div className="plagiarism-char-count">
                      {textInput.length} characters
                    </div>
                  </div>

                  <div className="plagiarism-actions">
                    <button
                      className={`plagiarism-check-btn ${
                        isChecking ? "checking" : ""
                      }`}
                      onClick={handlePlagiarismCheck}
                      disabled={isChecking || !textInput.trim()}
                    >
                      {isChecking ? (
                        <>
                          <span className="plagiarism-spinner"></span>
                          Checking...
                        </>
                      ) : (
                        <>
                          <span className="plagiarism-btn-icon">🔍</span>
                          Check Plagiarism
                        </>
                      )}
                    </button>
                    <button
                      className="plagiarism-clear-btn"
                      onClick={() => {
                        setTextInput("");
                        setResults(null);
                        setPercentage(0);
                        setAnimatePercentage(false);
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12  col-sm-12 col-md-12 col-lg-12 col-xl-6 col-xxl-6">
              <div className="plagiarism-right-panel">
                <div className="plagiarism-tabs">
                  <div className="plagiarism-tab-buttons">
                    <button className="plagiarism-tab-btn active">
                      Results
                    </button>
                  </div>

                  <div className="plagiarism-tab-actions">
                    <button
                      className="plagiarism-action-btn"
                      title="Download Report"
                      onClick={downloadPDF}
                      disabled={!results}
                    >
                      <img src={adminImage.PdfLogo} alt="PDF" />
                    </button>
                    <button
                      className="plagiarism-action-btn"
                      title="Copy Results"
                      onClick={copyResults}
                      disabled={!results}
                    >
                      <img src={adminImage.CopyIcon} alt="Copy" />
                    </button>
                  </div>
                </div>

                <div className="plagiarism-tab-content">
                  <div className="plagiarism-results-panel">
                    {!results && !isChecking && (
                      <div className="plagiarism-placeholder">
                        <div className="plagiarism-placeholder-icon">🔍</div>
                        <h4>Ready to Check</h4>
                        <p>
                          Enter your text and click "Check Plagiarism" to
                          analyze originality
                        </p>
                      </div>
                    )}

                    {isChecking && (
                      <div className="plagiarism-loading">
                        <div className="plagiarism-loading-spinner"></div>
                        <h4>Analyzing Content...</h4>
                        <p>Comparing with millions of sources</p>
                      </div>
                    )}

                    {results && renderCircularProgress()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlagiarismChecker;
