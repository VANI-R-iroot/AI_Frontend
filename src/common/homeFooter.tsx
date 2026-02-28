import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaGithub,
  FaInstagram,
  FaFacebookF,
  FaXTwitter,
} from "react-icons/fa6";
import { SlLocationPin } from "react-icons/sl";
import { LuMail } from "react-icons/lu";
import { LiaPhoneSolid } from "react-icons/lia";

const Footer: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (email) {
      console.log("Newsletter signup:", email);
      setEmail("");
      alert("Thank you for subscribing!");
    }
  };

  return (
    <footer className="footer-area">
      <div className="row">
        <div className="col-sm-12 col-md-12 col-lg-5 col-xl-5">
          <div className="home-02-footer-footer-section">
            <h2>AiProd</h2>
            <p>
              Smart AI is an AI-powered platform delivering digital solutions to
              help businesses elevate and empower their brands.
            </p>
            <div className="home-02-footer-newsletter-container">
              <h2 className="home-02-footer-newsletter-title">
                Join a Newsletter
              </h2>
              <div className="home-02-footer-newsletter-form">
                <input
                  type="email"
                  placeholder="Enter Your Email Here"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="home-02-footer-newsletter-input"
                  required
                />
                <button
                  type="button"
                  className="home-02-footer-newsletter-button"
                  onClick={handleSubmit}
                >
                  <span className="home-02-footer-arrow">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

   
        <div className="col-sm-12 col-md-4 col-lg-2 col-xl-2">
          <div className="footer-section">
            <h5>Quick Links</h5>
            <ul>
              <li>
                <Link to="#">About</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <Link to="/blogs">Blogs</Link>
              </li>
              <li>
                <Link to="/terms-conditions">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy-policy">Privacy Policy</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="col-sm-12 col-md-4 col-lg-2 col-xl-2">
          <div className="footer-section">
            <h5>Services</h5>
            <ul>
              <li>
                <a href="#">AI Chat Widget</a>
              </li>
              <li>
                <a href="#">Text To imgs</a>
              </li>
              <li>
                <a href="#">Customize Ai Assistant</a>
              </li>
              <li>
                <a href="#">AI Plugin</a>
              </li>
              <li>
                <a href="#">Text To Audio</a>
              </li>
              <li>
                <a href="#">AI Assistant</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="col-sm-12 col-md-4 col-lg-2  col-xl-3">
          <div className="footer-section">
            <h5>Contact</h5>
            <ul>
              <li className="footer-contact-item">
                <SlLocationPin />
                <a href="#">
                  100 avenue of the moon, 12 New York, NY 10018 US.
                </a>
              </li>
              <li className="footer-contact-item">
                <LuMail />
                <a href="#">example@gmail.com</a>
              </li>
              <li className="footer-contact-item">
                <LiaPhoneSolid />
                <a href="#">+1 486-588-3295</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="copyright-row">
        <div className="copyright-divider"></div>

        <div className="copyright-inner">
          <div className="col-md-6">
            <p className="copyright">© Copyright 2021, All Rights Reserved</p>
          </div>
          <div className="col-md-6">
            <div className="home-02-social-icons">
              <a href="#">
                <FaXTwitter />
              </a>
              <a href="#">
                <FaFacebookF />
              </a>
              <a href="#">
                <FaInstagram />
              </a>
              <a href="#">
                <FaGithub />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
