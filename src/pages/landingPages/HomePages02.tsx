import React, { lazy, useEffect, useState, ReactNode } from "react";
import { Suspense } from "react";
import images from "../../assets/image/Home-02/AllIamge.tsx";

const HomeNavbar = lazy(() => import("../../common/HomeNavbar.tsx"));
const PricingTable = lazy(() => import("../../common/priceingPlan.tsx"));
const ServiceSection = lazy(
  () => import("../../components/homePage02/serviceSection/serviceSection.tsx")
);
const FaqSection = lazy(
  () => import("../../components/homePage02/faqSection/faqSection.tsx")
);
const BlogSection = lazy(
  () => import("../../components/homePage02/blogSection/blogSection.tsx")
);
const HowToWorksSection = lazy(
  () => import("../../components/homePage02/howToWorksSection/workSection.tsx")
);
const Footer = lazy(() => import("../../common/homeFooter.tsx"));

import { useNavigate } from "react-router-dom";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

interface IntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
}

const SmoothLoader: React.FC = () => (
  <div className="smooth-loader">
    <div className="loader-spinner"></div>
  </div>
);

const useIntersectionObserver = (
  options: IntersectionObserverOptions = {}
): [React.Dispatch<React.SetStateAction<Element | null>>, boolean] => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [element, setElement] = useState<Element | null>(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]: IntersectionObserverEntry[]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [element, options]);

  return [setElement, isVisible];
};

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = "",
  delay = 0,
}) => {
  const [setRef, isVisible] = useIntersectionObserver();

  return (
    <div
      ref={setRef as React.RefCallback<HTMLDivElement>}
      className={`animated-section ${isVisible ? "visible" : ""} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const NewHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const criticalImages: string[] = [
      images.overlayImage,
      images.bannerIcon01,
      images.bannerIcon02,
      images.bannerIcon03,
      images.bannerIcon04,
    ];

    const imagePromises: Promise<void>[] = criticalImages.map((src: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
      });
    });

    Promise.all(imagePromises).then(() => {
      setIsLoaded(true);
    });

    if (document.documentElement) {
      document.documentElement.style.scrollBehavior = "smooth";
    }

    return () => {
      if (document.documentElement) {
        document.documentElement.style.scrollBehavior = "auto";
      }
    };
  }, []);

  if (!isLoaded) {
    return <SmoothLoader />;
  }

  return (
    <>
      <section className="body-section-full-page">
        <AnimatedSection className="banner-top-section">
          <Suspense fallback={<SmoothLoader />}>
            <HomeNavbar />
          </Suspense>
          <div className="home02-top-hero-background-image"></div>

          <img src={images.overlayImage} alt="" className="overlay-image" loading="eager" />

          <div className="home-main-banner-section">
            <div className="row">
              <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3 col-xxl-3 banner-icon-top-section">
                <img src={images.bannerIcon01} alt="" className="banner-icon01" loading="eager" />
              </div>
              <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6 title-section-smart-ai">
                <div>
                  <h2>Transforming Ideas into</h2>
                  <h3>Exceptional Product Content</h3>
                </div>

                <div className="banner-text-section">
                  <p>
                    Use Product Analyser to generate titles, short descriptions,
                    long descriptions, and attributes from images in seconds.
                  </p>
                </div>
              </div>
              <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3 col-xxl-3 banner-icon-top-section">
                <img src={images.bannerIcon03} alt="" width="100%" className="banner-icon03" loading="eager" />
              </div>
            </div>
          </div>

          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-3 col-md-3 col-lg-4 col-xl-4 col-xxl-4 banner-icon-top-section-02">
                <img src={images.bannerIcon02} alt="" className="banner-icon02" loading="eager" />
              </div>
              <div className="col-sm-12 col-md-12 col-lg-4 col-xl4 col-xxl-4">
                <div className="banner-button-section">
                  <button
                    className="button-b-01"
                    onClick={() => navigate("/login")}
                    type="button"
                  >
                    Try For Free
                  </button>
                  <button
                    className="button-b-02"
                    type="button"
                    onClick={() =>
                      document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    See How It Works
                  </button>
                </div>
              </div>
              <div className="col-sm-3 col-md-3 col-lg-4 col-xl4 col-xxl-4 banner-icon-top-section-04">
                <img src={images.bannerIcon04} alt="" width="100%" className="banner-icon04" />
              </div>
            </div>
          </div>

          <div className="container-fluid">
            <div className="banner-service-section-button">
              <button>Service</button>
            </div>
            <div className="common-title-section-smart-ai">
              <div>
                <h2>Evaluate Your Business with</h2>
                <h3>AI Powered Innovations</h3>
              </div>

              <div className="banner-text-section">
                <p className="service-text">
                  Built for ecommerce and content teams that need accurate,
                  publish-ready product data at scale.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <Suspense fallback={<SmoothLoader />}>
            <ServiceSection />
          </Suspense>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <div id="how-it-works">
            <Suspense fallback={<SmoothLoader />}>
              <HowToWorksSection />
            </Suspense>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={300}>
          <section>
            <div className="container-fluid">
              <div className="banner-service-section-button">
                <button type="button">Integrations</button>
              </div>

              <div className="common-title-section-smart-ai">
                <div>
                  <h2>Integrate with Platforms,</h2>
                  <h3>Stay Uplifted</h3>
                </div>

                <div className="banner-text-section">
                  <p className="service-text">
                    Sync your generated product content directly to connected
                    platforms and streamline publishing.
                  </p>
                </div>
              </div>
            </div>
            <div className="container">
              <img src={images.Integrate} alt="Integrations" width="100%" loading="lazy" />
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection delay={400} className="news-latter-plan-section">
          <section className="news-latter-plan-section">
            <div className="container-fluid">
              <div className="banner-service-section-button">
                <button type="button">Pricing</button>
              </div>

              <div className="common-title-section-smart-ai">
                <div>
                  <h2>Simple & affordable pricing</h2>
                  <h3>Plans</h3>
                </div>

                <div className="banner-text-section">
                  <p className="service-text">
                    Choose a plan based on your usage volume and team size.
                  </p>
                </div>
              </div>
            </div>
            <div className="container">
              <Suspense fallback={<SmoothLoader />}>
                <PricingTable showCustomRequest={false} hideInternalFeatures={true} />
              </Suspense>
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection delay={500}>
          <Suspense fallback={<SmoothLoader />}>
            <FaqSection />
          </Suspense>
        </AnimatedSection>

        <AnimatedSection delay={600}>
          <Suspense fallback={<SmoothLoader />}>
            <BlogSection />
          </Suspense>
        </AnimatedSection>

        <AnimatedSection delay={700}>
          <section className="home02-footer">
            <div className="container footer-area-home-page">
              <Suspense fallback={<SmoothLoader />}>
                <Footer />
              </Suspense>
            </div>
          </section>
        </AnimatedSection>
      </section>
    </>
  );
};

export default NewHomePage;
