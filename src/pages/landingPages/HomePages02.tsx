import React, { lazy, useEffect, useState, ReactNode, JSX } from "react";
import { Suspense } from "react";
import images from "../../assets/image/Home-02/AllIamge.tsx";
import NewsletterSubscription from "../../common/NewsletterSubscription.tsx";

const HomeNavbar = lazy(() => import("../../common/HomeNavbar.tsx"));
const Slider = lazy(() => import("../../components/homePage02/Slider.tsx"));
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

// TypeScript Interfaces
interface Slide {
  id: number;
  image: string;
  title: string;
}

interface Testimonial {
  id: number;
  text: string;
  author: string;
  position: string;
  rating: number;
}

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

interface IntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
}

// Smooth loading component
const SmoothLoader: React.FC = () => (
  <div className="smooth-loader">
    <div className="loader-spinner"></div>
  </div>
);

// Intersection Observer Hook for animations
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

// Animated Section Component
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
    // Preload critical images
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

    // Add smooth scroll behavior
    if (document.documentElement) {
      document.documentElement.style.scrollBehavior = "smooth";
    }

    return () => {
      if (document.documentElement) {
        document.documentElement.style.scrollBehavior = "auto";
      }
    };
  }, []);

  const slides: Slide[] = [
    { id: 1, image: `${images.Logo01}`, title: "Image 1" },
    { id: 2, image: `${images.Logo02}`, title: "Image 2" },
    { id: 3, image: `${images.Logo03}`, title: "Image 3" },
    { id: 4, image: `${images.Logo04}`, title: "Image 4" },
    { id: 5, image: `${images.Logo05}`, title: "Image 5" },
    { id: 6, image: `${images.Logo06}`, title: "Image 6" },
    { id: 7, image: `${images.Logo07}`, title: "Image 7" },
    { id: 8, image: `${images.Logo08}`, title: "Image 8" },
    { id: 9, image: `${images.Logo09}`, title: "Image 9" },
    { id: 10, image: `${images.Logo01}`, title: "Image 10" },
  ];

  const testimonials: Testimonial[] = [
    {
      id: 1,
      text: "You made it so simple. My new site is so much faster and easier to work with than my old site. I just choose the page, make the change.",
      author: "Leslie Alexander",
      position: "Freelance Head Developer",
      rating: 5,
    },
    {
      id: 2,
      text: "Simply the best. Better than all the rest. I'd recommend this product to beginners and advanced users.",
      author: "Jacob Jones",
      position: "Digital Marketer",
      rating: 5,
    },
    {
      id: 3,
      text: "I cannot believe that I have got a brand-new landing page after getting Omega. It was super easy to edit and publish.",
      author: "Jenny Wilson",
      position: "Graphic Designer",
      rating: 5,
    },
  ];

  const renderStars = (count: number): JSX.Element[] => {
    return Array(count)
      .fill(null)
      .map((_, index: number) => (
        <span key={index} className="star">
          ★
        </span>
      ));
  };

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

          <img
            src={images.overlayImage}
            alt="Overlay"
            className="overlay-image"
            loading="eager"
          />

          <div className="home-main-banner-section">
            <div className="row">
              <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3 col-xxl-3 banner-icon-top-section">
                <img
                  src={images.bannerIcon01}
                  alt="Banner"
                  className="banner-icon01"
                  loading="eager"
                />
              </div>
              <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6 title-section-smart-ai">
                <div>
                  <h2>Transforming Ideas into</h2>
                  <h3>Exceptional Content</h3>
                </div>

                <div className="banner-text-section">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore
                  </p>
                </div>
              </div>
              <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3 col-xxl-3 banner-icon-top-section">
                <img
                  src={images.bannerIcon03}
                  alt="Banner"
                  width="100%"
                  className="banner-icon03"
                  loading="eager"
                />
              </div>
            </div>
          </div>

          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-3 col-md-3 col-lg-4 col-xl-4 col-xxl-4 banner-icon-top-section-02">
                <img
                  src={images.bannerIcon02}
                  alt="Banner"
                  className="banner-icon02"
                  loading="eager"
                />
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
                  <button className="button-b-02" type="button">
                    How to works
                  </button>
                </div>
                <div className="ReviewDownload-icon">
                  <div className="d-flex">
                    <div>
                      <img
                        src={images.VectorStar}
                        alt="Banner"
                        className="star-icon"
                      />
                    </div>
                    <div className="five-star-icon-section">
                      <img
                        src={images.bannerStar}
                        alt="Banner"
                        className="five-star-icon"
                      />
                      <p>Rated 4.9 by 100k+ Users</p>
                    </div>
                  </div>

                  <div className="d-flex">
                    <div>
                      <img
                        src={images.downloadIconBanner}
                        alt="Banner"
                        className="star-icon"
                      />
                    </div>
                    <div className="five-star-icon-section">
                      <h2>2.5k</h2>
                      <p>Rated 4.9 by 100k+ Users</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-sm-3 col-md-3 col-lg-4 col-xl4 col-xxl-4 banner-icon-top-section-04">
                <img
                  src={images.bannerIcon04}
                  alt="Banner"
                  width="100%"
                  className="banner-icon04"
                />
              </div>
            </div>
          </div>

          <div className="container-fluid home-banner-part-03">
            <div className="row">
              <div className="col-sm-12 col-lg-4 col-md-4 col-xl-4 col-xxl-4 banner-icon-top-section"></div>
              <div className="col-sm-12 col-lg-4 col-md-4 col-xl4 col-xxl-4 banner-icon-top-section-05-06">
                <img
                  src={images.bannerIcon06}
                  alt="Banner"
                  width="100%"
                  className="banner-icon06"
                />
                <img
                  src={images.bannerIcon05}
                  alt="Banner"
                  width="100%"
                  className="banner-icon05"
                />
              </div>
              <div className="col-sm-12 col-lg-4 col-md-4 col-xl4 col-xxl-4 banner-icon-top-section"></div>
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
                  Make your data invisible by generating unlimited identities.
                  The next-level in privacy protection for online and travel.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Service section */}
        <AnimatedSection delay={100}>
          <Suspense fallback={<SmoothLoader />}>
            <ServiceSection />
          </Suspense>
        </AnimatedSection>

        {/* How to works section */}
        <AnimatedSection delay={200}>
          <Suspense fallback={<SmoothLoader />}>
            <HowToWorksSection />
          </Suspense>
        </AnimatedSection>

        {/* Integration */}
        <AnimatedSection delay={300}>
          <section className="">
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
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore
                  </p>
                </div>
              </div>
            </div>
            <div className="container">
              <img
                src={images.Integrate}
                alt="Integrate"
                width="100%"
                loading="lazy"
              />
            </div>
          </section>
        </AnimatedSection>

        {/* Slider section */}
        <AnimatedSection delay={400}>
          <section>
            <div className="container">
              <div className="row">
                <div className="col-12">
                  <h1 className="Multi-Image-Carousel-title">
                    Multi-Image Carousel
                  </h1>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <Suspense fallback={<SmoothLoader />}>
                    <Slider slides={slides} speed={3} />
                  </Suspense>
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Review section */}
        <AnimatedSection delay={500} className="review-section">
          <section className="review-section">
            <div className="container-fluid">
              <div className="banner-service-section-button">
                <button type="button">Feedbacks</button>
              </div>

              <div className="common-title-section-smart-ai">
                <div>
                  <div className="feedback-top-title-text">
                    <p>2,157 people have said how good Rareblocks</p>
                  </div>
                  <h3>Our happy clients say about us</h3>
                </div>
              </div>
            </div>
            <div className="container">
              <div className="row">
                {testimonials.map((testimonial: Testimonial, index: number) => (
                  <div
                    key={testimonial.id}
                    className="col-sm-12 col-md-6 col-lg-4 col-xl-4"
                  >
                    <div
                      className="testimonial-card"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="rating">
                        {renderStars(testimonial.rating)}
                      </div>
                      <p className="testimonial-text">"{testimonial.text}"</p>
                      <div className="testimonial-author">
                        <div className="author-avatar"></div>
                        <div className="author-info">
                          <h4>{testimonial.author}</h4>
                          <p>{testimonial.position}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="testimonial-footer">
                <p>Check all 2,157 reviews</p>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Price and newsletter */}
        <AnimatedSection delay={600} className="news-latter-plan-section">
          <section className="news-latter-plan-section">
            <div className="container-fluid">
              <div className="container-fluid">
                <div className="banner-service-section-button">
                  <button type="button">Newsletter</button>
                </div>

                <div className="common-title-section-smart-ai">
                  <div>
                    <h2>More than a Newsletter,</h2>
                    <h3>Access to milestone</h3>
                  </div>

                  <div className="banner-text-section">
                    <p className="service-text">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                      sed do eiusmod tempor incididunt ut labore
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="">
              <NewsletterSubscription />

              <div className="newsletter-image-icon-image">
                <img
                  src={images.Deepseek}
                  alt="Overlay"
                  className="newsletter-logo-img"
                  loading="lazy"
                />
                <img
                  src={images.OpenAI}
                  alt="Overlay"
                  className="newsletter-logo-img"
                  loading="lazy"
                />
                <img
                  src={images.Gemeni}
                  alt="Overlay"
                  className="newsletter-logo-img"
                  loading="lazy"
                />
                <img
                  src={images.GoogleBard}
                  alt="Overlay"
                  className="newsletter-logo-img"
                  loading="lazy"
                />
              </div>
            </div>
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
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore
                  </p>
                </div>
              </div>
            </div>
            <div className="container">
              <Suspense fallback={<SmoothLoader />}>
                <PricingTable />
              </Suspense>
            </div>
          </section>
        </AnimatedSection>

        {/* FAQ section */}
        <AnimatedSection delay={700}>
          <Suspense fallback={<SmoothLoader />}>
            <FaqSection />
          </Suspense>
        </AnimatedSection>

        {/* Blogs section */}
        <AnimatedSection delay={800}>
          <Suspense fallback={<SmoothLoader />}>
            <BlogSection />
          </Suspense>
        </AnimatedSection>

        {/* Footer section */}
        <AnimatedSection delay={900}>
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
