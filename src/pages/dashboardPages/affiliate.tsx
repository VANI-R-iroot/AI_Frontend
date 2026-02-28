import React, { useEffect, useState } from "react";

import { BiSend } from "react-icons/bi";
import adminImage from "../../assets/image/admin/allImage";
import {
  FaCopy,
  FaGithub,
  FaDiscord,
  FaReddit,
  FaTwitter,
} from "react-icons/fa";
import PageLoader from "../../common/loader";

const Affiliate: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageLoader isLoading={true} />;
  }

  return (
    <div className="main-content-common">
      <div className="row">
        <PageLoader isLoading={isLoading} />
        <div className="col-12 col-md-12 col-lg-6 col-xl-6">
          <div className="referral-card">
            <div className="affiliate-image-user-dashboard">
              <img src={adminImage.AffiliateImge}></img>
            </div>

            <div className="referral-content pt-5">
              <h3 className="referral-title">
                Invite your friends,
                <br />
                <span className="referral-subtitle">Earn Reward</span>
              </h3>
              <p className="referral-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore
              </p>
            </div>

            <div className="referral-link-container">
              <input
                type="text"
                className="referral-link"
                value="https://preview.codecanyon.net/item"
                readOnly
              />
              <button className="referral-copy-btn">
                <FaCopy />
              </button>
            </div>

            <div className="referral-share">
              <p className="share-text">Share to:</p>
              <div className="share-icons">
                <a href="#" className="share-icon">
                  <FaGithub />
                </a>
                <a href="#" className="share-icon">
                  <FaDiscord />
                </a>
                <a href="#" className="share-icon">
                  <FaReddit />
                </a>
                <a href="#" className="share-icon">
                  <FaTwitter />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-12 col-lg-6 col-xl-6">
          <div className="withdrawal-card">
            <div className="earnings-container">
              <p className="earnings-label">My Earnings</p>
              <h2 className="earnings-amount">$35.8450</h2>
            </div>

            <div className="withdrawal-form">
              <h4 className="withdrawal-title">Withdrawal request</h4>

              <div className="row">
                <div className="form-group col-md-6">
                  <label className="withdrawal-label">Card type</label>
                  <div className="custom-select">
                    <select className="withdrawal-select">
                      <option>VISA</option>
                      <option>MasterCard</option>
                      <option>American Express</option>
                    </select>
                  </div>
                </div>
                <div className="form-group col-md-6">
                  <label className="withdrawal-label">Account Number</label>
                  <input
                    type="text"
                    className="withdrawal-input"
                    placeholder="1234 xxxx xxxx 4321"
                  />
                </div>
              </div>

              <div className="row">
                <div className="form-group col-md-6">
                  <label className="withdrawal-label">Card Holder Name</label>
                  <input
                    type="text"
                    className="withdrawal-input"
                    placeholder="Akash Basak"
                  />
                </div>
                <div className="form-group col-md-6">
                  <label className="withdrawal-label">CVV</label>
                  <input
                    type="text"
                    className="withdrawal-input"
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="withdrawal-label">
                  Payout Amount (Minimum payout $5)
                </label>
                <div className="amount-input-wrapper">
                  <span className="currency-symbol">$</span>
                  <input
                    type="text"
                    className="withdrawal-input amount-input"
                    placeholder="123"
                  />
                </div>
              </div>

              <button className="withdrawal-submit-btn">
                <BiSend /> Send Request
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="how-it-works-card">
            <h3 className="how-it-works-title">How it Works?</h3>

            <p className="how-it-works-description">
              Quickly find answers to their questions without having to search
              through multiple sources. Lets users quickly find answers to their
              questions without having to
            </p>

            <ul className="how-it-works-list">
              <li className="how-it-works-item">
                search through multiple sources.
              </li>
              <li className="how-it-works-item">
                Lets users quickly find answers to their questions
              </li>
              <li className="how-it-works-item">
                without having to search through multiple sources.
              </li>
            </ul>

            <p className="how-it-works-description">
              Quickly find answers to their questions without having to search
              through multiple sources. Lets users quickly find answers to their
              questions without having to
            </p>

            <ul className="how-it-works-list">
              <li className="how-it-works-item">
                search through multiple sources.
              </li>
              <li className="how-it-works-item">
                Lets users quickly find answers to their questions
              </li>
              <li className="how-it-works-item">
                without having to search through multiple sources.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Affiliate;
