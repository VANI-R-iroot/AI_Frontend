import React, { useState, useEffect } from "react";

import { FaChevronUp } from "react-icons/fa";
import axiosInstance from "../../../utils/baseUrl.ts";

type FaqItem = {
  faqQuestion: string;
  faqAnswer: string;
};

const FaqSection: React.FC = () => {
  const [faqData, setAaqData] = useState<FaqItem[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchFaqgList = async () => {
      const storedData = sessionStorage.getItem("FaqListLanding");
      if (storedData) {
        setAaqData(JSON.parse(storedData));
        return;
      }

      try {
        const res = await axiosInstance.get("/getFaqDataUser");
        const faq = res.data.data;
        sessionStorage.setItem("FaqListLanding", JSON.stringify(faq));
        setAaqData(faq);
      } catch (error) {
        console.error("Fetch failed", error);
      }
    };

    fetchFaqgList();
  }, []);

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-12 col-lg-6">
            <div className="faq-section-highlight-button">
              <button>FAQ</button>
            </div>

            <div className="faq-section-highlight-smart-ai">
              <div>
                <h2>Got Questions?</h2>
                <h3>We're here to answer you!</h3>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-12 col-lg-6">
            <div className="accordion mt-3">
              {faqData.map((item, index) => (
                <div
                  key={index}
                  className={`accordion-item-smart-ai mb-3  ${
                    expandedIndex === index ? "active" : ""
                  }`}
                >
                  <div
                    className=" d-flex justify-content-between align-items-center p-3"
                    onClick={() => toggleAccordion(index)}
                  >
                    <h5 className="m-0 text-white">{item.faqQuestion}</h5>
                    <div
                      className={`accordion-icon rounded-circle d-flex align-items-center justify-content-center ${
                        expandedIndex === index ? "rotated" : ""
                      }`}
                    >
                      <FaChevronUp color="white" />
                    </div>
                  </div>
                  <div
                    className={`accordion-body-smart-ai ${
                      expandedIndex === index ? "show" : ""
                    }`}
                  >
                    <div className="p-3">
                      <p className="text-white-50">{item.faqAnswer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default FaqSection;

