import images from "../../../assets/image/Home-02/AllIamge.tsx";

const WorkSection = () => {
  const workflowSteps = [
    {
      icon: images.leftIcon01,
      title: "Upload Product Image",
      description: "Upload a single image, bulk file, or platform image URL.",
    },
    {
      icon: images.leftIcon02,
      title: "Select Prompt and Generate",
      description: "Pick your analyser prompt and generate structured product content.",
    },
    {
      icon: images.leftIcon03,
      title: "Review Confidence and Status",
      description: "Check score, approve the result, and refine where needed.",
    },
    {
      icon: images.leftIcon04,
      title: "Publish to Connected Platforms",
      description: "Send selected fields to platform connections from one workflow.",
    },
  ];

  return (
    <section className="section-03 section-03-home-smart-ai">
      <div className="container-fluid">
        <div className="banner-service-section-button">
          <button>How it works</button>
        </div>

        <div className="common-title-section-smart-ai">
          <div>
            <h2>From Image to Listing in Minutes</h2>
            <h3>Product Analyser Workflow</h3>
          </div>

          <div className="banner-text-section">
            <p className="service-text">
              Turn product visuals into clean titles, descriptions, and attributes,
              then push approved output to your connected platforms.
            </p>
          </div>
        </div>
      </div>

      <div className="container section-03-left-overlay">
        <div className="row">
          <div className="col-sm-12 col-md-12 col-lg-7 col-xl-7 col-xxl-7 first-column">
            <div className="section-03-left-text-box">
              <h2>Core Product Analyser Steps</h2>
              <p>Designed for teams handling catalog content at scale.</p>
            </div>
            <div className="row">
              {workflowSteps.map((step, index) => (
                <div
                  key={index}
                  className="col-sm-12 col-lg-6 col-md-6 col-xl-6 col-xxl-6"
                >
                  <div className="section-03-left-box">
                    <div>
                      <img
                        src={step.icon}
                        alt=""
                        className="section-03-icon"
                        loading="lazy"
                      />
                    </div>
                    <div className="section-03-left-icon-text">
                      <h2>{step.title}</h2>
                      <p>{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-sm-12 col-md-12 col-lg-5 col-xl-5 col-xxl-5">
            <div className="section-03-image-card-01">
              <div className="section-card-logo">
                <img src={images.LogoSection03} alt="" loading="lazy" />
              </div>
              <h2>Generated Product Output</h2>
              <div className="section-03-text-box">
                <p>
                  The analyser generates title, short description, long description,
                  and structured attributes with confidence score and status tracking.
                </p>
              </div>
              <div className="section-03-button">
                <button>Analyze Product</button>
              </div>

              <h2>Typical Output Fields</h2>
              <div className="section-03-card-image">
                <div className="row">
                  <div className="col-4 col-md-4">
                    <img src={images.Section03Img1} alt="" className="image-spacing" loading="lazy" />
                  </div>
                  <div className="col-4 col-md-4">
                    <img src={images.Section03Img2} alt="" className="image-spacing" loading="lazy" />
                  </div>
                  <div className="col-4 col-md-4">
                    <img src={images.Section03Img3} alt="" loading="lazy" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkSection;
