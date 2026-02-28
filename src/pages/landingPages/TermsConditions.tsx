import React from "react";
import "../../assets/css/TermsConditions.css";
import HomeNavbar  from  "../../common/HomeNavbar.tsx";

const TermsConditions: React.FC = () => {
  return (
    <>
      <HomeNavbar />

      <div className="terms-condition">
        <div className="terms-condition__container">
          <header className="terms-condition__header">
            <h1 className="terms-condition__title">Terms and Conditions</h1>
            <p className="terms-condition__subtitle">
              Last updated: July 17, 2025
            </p>
          </header>

          <main className="terms-condition__content">
            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">
                1. Acceptance of Terms
              </h2>
              <p className="terms-condition__text">
                By accessing and using our website, you accept and agree to be
                bound by the terms and provision of this agreement. If you do
                not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">2. Use License</h2>
              <p className="terms-condition__text">
                Permission is granted to temporarily download one copy of the
                materials on our website for personal, non-commercial transitory
                viewing only. This is the grant of a license, not a transfer of
                title, and under this license you may not:
              </p>
              <ul className="terms-condition__list">
                <li className="terms-condition__list-item">
                  modify or copy the materials
                </li>
                <li className="terms-condition__list-item">
                  use the materials for any commercial purpose or for any public
                  display
                </li>
                <li className="terms-condition__list-item">
                  attempt to reverse engineer any software contained on the
                  website
                </li>
                <li className="terms-condition__list-item">
                  remove any copyright or other proprietary notations from the
                  materials
                </li>
              </ul>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">3. Disclaimer</h2>
              <p className="terms-condition__text">
                The materials on our website are provided on an 'as is' basis.
                We make no warranties, expressed or implied, and hereby disclaim
                and negate all other warranties including without limitation,
                implied warranties or conditions of merchantability, fitness for
                a particular purpose, or non-infringement of intellectual
                property or other rights.
              </p>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">4. Limitations</h2>
              <p className="terms-condition__text">
                In no event shall our company or its suppliers be liable for any
                damages (including, without limitation, damages for loss of data
                or profit, or due to business interruption) arising out of the
                use or inability to use the materials on our website, even if we
                or our authorized representative has been notified orally or in
                writing of the possibility of such damage.
              </p>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">
                5. Privacy Policy
              </h2>
              <p className="terms-condition__text">
                Your privacy is important to us. Our Privacy Policy explains how
                we collect, use, and protect your information when you use our
                service. By using our service, you agree to the collection and
                use of information in accordance with our Privacy Policy.
              </p>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">
                6. User Accounts
              </h2>
              <p className="terms-condition__text">
                When you create an account with us, you must provide information
                that is accurate, complete, and current at all times. You are
                responsible for safeguarding the password and for all activities
                that occur under your account.
              </p>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">
                7. Prohibited Uses
              </h2>
              <p className="terms-condition__text">
                You may not use our service for any unlawful purpose or to
                solicit others to perform unlawful acts. You may not violate any
                international, federal, provincial, or state regulations, rules,
                or laws.
              </p>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">8. Termination</h2>
              <p className="terms-condition__text">
                We may terminate or suspend your account and bar access to the
                service immediately, without prior notice or liability, under
                our sole discretion, for any reason whatsoever and without
                limitation, including but not limited to a breach of the Terms.
              </p>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">
                9. Changes to Terms
              </h2>
              <p className="terms-condition__text">
                We reserve the right, at our sole discretion, to modify or
                replace these Terms at any time. If a revision is material, we
                will provide at least 30 days notice prior to any new terms
                taking effect.
              </p>
            </section>

            <section className="terms-condition__section">
              <h2 className="terms-condition__section-title">
                10. Contact Information
              </h2>
              <p className="terms-condition__text">
                If you have any questions about these Terms and Conditions,
                please contact us at:
              </p>
              <div className="terms-condition__contact">
                <p className="terms-condition__contact-item">
                  Email: support@example.com
                </p>
                <p className="terms-condition__contact-item">
                  Phone: +1 (555) 123-4567
                </p>
                <p className="terms-condition__contact-item">
                  Address: 123 Main Street, City, State 12345
                </p>
              </div>
            </section>
          </main>

          <footer className="terms-condition__footer">
            <p className="terms-condition__footer-text">
              © 2025 mernsolution. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default TermsConditions;
