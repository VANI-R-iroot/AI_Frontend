import React from "react";
import "../../assets/css/TermsConditions.css";
import HomeNavbar from "../../common/HomeNavbar.tsx";

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <HomeNavbar />

      <div className="terms-condition">
        <div className="terms-condition__container">
          <header className="terms-condition__header">
            <h1 className="terms-condition__title">Privacy Policy</h1>
            <p className="terms-condition__subtitle">
              Last updated: July 17, 2025
            </p>
          </header>

          <main className="terms-condition__content">
            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">
                1. Information We Collect
              </h2>
              <p className="terms-condition__text">
                We collect information you provide directly to us, such as when
                you create an account, make a purchase, or contact us for
                support. This may include:
              </p>
              <ul className="terms-condition__list">
                <li className="terms-condition__list-item">
                  Personal information (name, email address, phone number)
                </li>
                <li className="terms-condition__list-item">
                  Account credentials and preferences
                </li>
                <li className="terms-condition__list-item">
                  Payment information and billing details
                </li>
                <li className="terms-condition__list-item">
                  Communication history and support requests
                </li>
              </ul>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">
                2. How We Use Your Information
              </h2>
              <p className="terms-condition__text">
                We use the information we collect to provide, maintain, and
                improve our services. Specifically, we may use your information
                to:
              </p>
              <ul className="terms-condition__list">
                <li className="terms-condition__list-item">
                  Process transactions and send related information
                </li>
                <li className="terms-condition__list-item">
                  Provide customer support and respond to inquiries
                </li>
                <li className="terms-condition__list-item">
                  Send promotional communications and updates
                </li>
                <li className="terms-condition__list-item">
                  Analyze usage patterns to improve our services
                </li>
                <li className="terms-condition__list-item">
                  Comply with legal obligations and protect our rights
                </li>
              </ul>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">
                3. Information Sharing
              </h2>
              <p className="terms-condition__text">
                We do not sell, trade, or otherwise transfer your personal
                information to third parties without your consent, except in the
                following circumstances:
              </p>
              <ul className="terms-condition__list">
                <li className="terms-condition__list-item">
                  With service providers who assist us in operating our website
                </li>
                <li className="terms-condition__list-item">
                  When required by law or to protect our legal rights
                </li>
                <li className="terms-condition__list-item">
                  In connection with a merger, acquisition, or sale of assets
                </li>
                <li className="terms-condition__list-item">
                  With your explicit consent for specific purposes
                </li>
              </ul>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">
                4. Data Security
              </h2>
              <p className="terms-condition__text">
                We implement appropriate technical and organizational security
                measures to protect your personal information against
                unauthorized access, alteration, disclosure, or destruction.
                These measures include:
              </p>
              <ul className="terms-condition__list">
                <li className="terms-condition__list-item">
                  Encryption of sensitive data in transit and at rest
                </li>
                <li className="terms-condition__list-item">
                  Regular security assessments and vulnerability testing
                </li>
                <li className="terms-condition__list-item">
                  Access controls and authentication mechanisms
                </li>
                <li className="terms-condition__list-item">
                  Staff training on data protection best practices
                </li>
              </ul>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">
                5. Cookies and Tracking
              </h2>
              <p className="terms-condition__text">
                We use cookies and similar technologies to enhance your
                experience on our website. Cookies help us remember your
                preferences and understand how you use our services.
              </p>
              <p className="terms-condition__text">
                You can control cookie settings through your browser
                preferences. However, disabling cookies may limit your ability
                to use certain features of our website.
              </p>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">
                6. Data Retention
              </h2>
              <p className="terms-condition__text">
                We retain your personal information for as long as necessary to
                provide our services and fulfill the purposes outlined in this
                policy. When determining retention periods, we consider:
              </p>
              <ul className="terms-condition__list">
                <li className="terms-condition__list-item">
                  The nature and sensitivity of the information
                </li>
                <li className="terms-condition__list-item">
                  Legal and regulatory requirements
                </li>
                <li className="terms-condition__list-item">
                  The purposes for which we process the information
                </li>
                <li className="terms-condition__list-item">
                  Your preferences and consent
                </li>
              </ul>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">7. Your Rights</h2>
              <p className="terms-condition__text">
                You have certain rights regarding your personal information,
                including:
              </p>
              <ul className="terms-condition__list">
                <li className="terms-condition__list-item">
                  Access: Request a copy of your personal information
                </li>
                <li className="terms-condition__list-item">
                  Correction: Update or correct inaccurate information
                </li>
                <li className="terms-condition__list-item">
                  Deletion: Request deletion of your personal information
                </li>
                <li className="terms-condition__list-item">
                  Portability: Request your data in a portable format
                </li>
                <li className="terms-condition__list-item">
                  Objection: Object to processing of your information
                </li>
              </ul>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">
                8. Third-Party Links
              </h2>
              <p className="terms-condition__text">
                Our website may contain links to third-party websites. We are
                not responsible for the privacy practices or content of these
                external sites. We encourage you to review the privacy policies
                of any third-party websites you visit.
              </p>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">
                9. Children's Privacy
              </h2>
              <p className="terms-condition__text">
                Our services are not intended for children under the age of 13.
                We do not knowingly collect personal information from children
                under 13. If we become aware that we have collected such
                information, we will take steps to delete it promptly.
              </p>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">
                10. International Transfers
              </h2>
              <p className="terms-condition__text">
                Your information may be transferred to and processed in
                countries other than your own. We ensure that such transfers are
                conducted in accordance with applicable data protection laws and
                that appropriate safeguards are in place.
              </p>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">
                11. Changes to This Policy
              </h2>
              <p className="terms-condition__text">
                We may update this Privacy Policy from time to time to reflect
                changes in our practices or legal requirements. We will notify
                you of any material changes by posting the updated policy on our
                website and updating the "Last updated" date.
              </p>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">12. Contact Us</h2>
              <p className="terms-condition__text">
                If you have any questions about this Privacy Policy or our
                privacy practices, please contact us:
              </p>
              <div className="terms-condition__contact">
                <p className="terms-condition__contact-item">
                  Email: privacy@example.com
                </p>
                <p className="terms-condition__contact-item">
                  Phone: +1 (555) 123-4567
                </p>
                <p className="terms-condition__contact-item">
                  Address: 123 Main Street, City, State 12345
                </p>
                <p className="terms-condition__contact-item">
                  Data Protection Officer: dpo@example.com
                </p>
              </div>
            </section>
          </main>

          <footer className="terms-condition__footer">
            <p className="terms-condition__footer-text">
              © 2025 Your Company Name. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
