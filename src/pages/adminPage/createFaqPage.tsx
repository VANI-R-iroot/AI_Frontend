import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/baseUrl";

const CreateFaqPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state || {};
  const [faqQuestion, setQuestion] = useState("");
  const [faqAnswer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData?.faqQuestion) setQuestion(editData.faqQuestion);
    if (editData?.faqAnswer) setAnswer(editData.faqAnswer);
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!faqQuestion || !faqAnswer) {
      toast.error("Please fill in both question and answer");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editData?.id) {
        await axiosInstance.post("/updateFaqAdmin", {
          id: editData.id,
          faqQuestion,
          faqAnswer,
        });
        toast.success("FAQ updated successfully");
      } else {
        await axiosInstance.post("/faqDataCreate", {
          faqQuestion,
          faqAnswer,
        });
        toast.success("FAQ created successfully");
      }

      navigate("/admin-faqs", { state: { refresh: true } });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-content-common">
      <form onSubmit={handleSubmit} className="row">
        <div className="col-lg-10 col-xl-8 smart-ai-admin-blog-create-page-section mx-auto">
          <div className="cancel-admin-dashboard-button-global">
            <button onClick={() => navigate("/admin-faqs")} type="button">
              Cancel
            </button>
          </div>
          <div className="text-to-image-item">
            <label>Add your question</label>
            <div className="input-filed-item-smart-ai">
              <input
                type="text"
                value={faqQuestion}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter question"
                className="form-control"
              />
            </div>
          </div>

          <div className="text-to-image-item">
            <label>Add your answer</label>
            <div className="input-filed-item-smart-ai">
              <input
                type="text"
                value={faqAnswer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter answer"
                className="form-control"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="admin-blog-publish-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? editData?.id
                ? "Updating..."
                : "Publishing..."
              : editData?.id
              ? "Update"
              : "Publish"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateFaqPage;
