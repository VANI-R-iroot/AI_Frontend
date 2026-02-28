import { useState } from "react";

const NewsletterSubscription = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    setEmail("");
  };

  return (
    <div className="newsletter-container">
      <form onSubmit={handleSubmit} className="newsletter-form">
        <div className="input-button-wrapper">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your E-mail address"
            required
            className="email-input"
          />
          <button type="submit" className="subscribe-button">
            Subscribe Newsletter
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewsletterSubscription;
