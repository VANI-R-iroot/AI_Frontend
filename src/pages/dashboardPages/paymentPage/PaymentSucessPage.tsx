import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaHome,
  FaDownload,
  FaEnvelope,
  FaSpinner,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../../utils/baseUrl";
import "../../../assets/css/userDashboard/paymentSuccess.css";

interface PaymentResult {
  success: boolean;
  error?: string;
  transactionId?: string;
  amount?: string;
  currency?: string;
  email?: string;
  paymentId?: string;
}

const PaymentSuccess: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [countdown, setCountdown] = useState<number>(30);

  useEffect(() => {
    console.log("🔄 PaymentSuccess component mounted");
    
    const verifyPayment = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);

        const detectGateway = (): string => {
          const explicitGateway = urlParams.get("gateway");
          if (explicitGateway) return explicitGateway;
          if (urlParams.get("razorpay_order_id")) return "razorpay";
          if (urlParams.get("reference")) return "paystack";
          if (urlParams.get("token") || urlParams.get("PayerID")) return "paypal";
          if (urlParams.get("session_id")) return "stripe";
          return "stripe";
        };

        const gateway = detectGateway();
        const session_id = urlParams.get("session_id");
        const orderIdParam =
          urlParams.get("orderId") ||
          urlParams.get("order_id") ||
          urlParams.get("razorpay_order_id") ||
          urlParams.get("reference") ||
          urlParams.get("token");
        const orderId = session_id || orderIdParam;
        const paymentId =
          urlParams.get("paymentId") ||
          urlParams.get("payment_id") ||
          urlParams.get("razorpay_payment_id") ||
          urlParams.get("payment_intent");
        const razorpaySignature = urlParams.get("razorpay_signature");

        console.log("📋 URL Parameters:", { gateway, session_id, orderId, paymentId });

        if (!orderId) {
          throw new Error("Missing order/session ID");
        }

        let res;
        try {
          res = await axiosInstance.post("/payments/verify-payment", {
            gateway,
            orderId,
            paymentId,
            razorpay_signature: razorpaySignature,
            token: urlParams.get("token"),
          });
        } catch (primaryError) {
          res = await axiosInstance.post("/v3/payments/verify-payment", {
            gateway,
            orderId,
            paymentId,
            razorpay_signature: razorpaySignature,
            token: urlParams.get("token"),
          });
        }

        if (!res.data?.success) {
          throw new Error(res.data?.message || "Payment verification failed");
        }

        const details = res.data?.data?.paymentDetails;
        setStatus("success");
        setPaymentResult({
          success: true,
          transactionId: details?.transactionId || orderId,
          paymentId: details?.paymentId || paymentId || orderId,
          amount: details?.amount,
          currency: details?.currency,
          email: details?.email,
        });
        try {
          await axiosInstance.post("/refresh-token");
        } catch (tokenError) {
          console.error("Token refresh failed after payment verification:", tokenError);
        }
        window.dispatchEvent(new Event("subscription-updated"));
        toast.success("Payment verified successfully!");
        console.log("✅ Payment verified");

      } catch (error) {
        console.error("❌ Error:", error);
        const err = error as any;
        setStatus("error");
        setPaymentResult({
          success: false,
          error: err?.response?.data?.message || err?.message || "Payment verification failed. Please contact support."
        });
        toast.error("Payment verification failed");
      }
    };

    verifyPayment();
  }, []);

  // Auto redirect countdown
  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && status === "success") {
      window.location.href = "/dashboard";
    }
  }, [countdown, status]);

  const handleDownloadReceipt = (): void => {
    if (paymentResult?.transactionId) {
      const receiptData = `
        Payment Receipt
        Transaction ID: ${paymentResult.transactionId}
        Amount: ${paymentResult.currency}${paymentResult.amount}
        Date: ${new Date().toLocaleString()}
        Email: ${paymentResult.email}
        Status: Completed
      `;

      const blob = new Blob([receiptData], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${paymentResult.transactionId}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Receipt downloaded!");
    }
  };

  const handleGoToDashboard = (): void => {
    window.location.href = "/dashboard";
  };

  const handleContactSupport = (): void => {
    window.location.href = "/contact";
  };

  const handleTryAgain = (): void => {
    window.location.href = "/pricing";
  };

  // Show loading state
  if (status === "loading") {
    return (
      <>
        <ToastContainer />
        <div className="payment-success-bg">
          <div className="payment-card">
            <div className="loading-spinner">
              <FaSpinner className="animate-spin" />
            </div>
            <h1 className="main-title">Processing Payment...</h1>
            <p className="subtitle">
              Please wait while we verify your payment and activate your subscription.
            </p>
          </div>
        </div>
      </>
    );
  }

  if (status === "success") {
    return (
      <>
        <ToastContainer />
        <div className="payment-success-bg">
          <div className="floating-elements">
            <div className="floating-circle"></div>
            <div className="floating-circle"></div>
            <div className="floating-circle"></div>
          </div>

          <div className="payment-card">
            <div className="icon-container success-icon">
              <FaCheckCircle />
            </div>

            <h1 className="main-title">Payment Successful!</h1>
            <p className="subtitle">
              🎉 Thank you! Your subscription is now active.
            </p>

            {paymentResult && (
              <div className="transaction-details">
                <div className="detail-row">
                  <span className="detail-label">Transaction ID:</span>
                  <span className="detail-value">
                    {paymentResult.transactionId}
                  </span>
                </div>
                {paymentResult.paymentId && (
                  <div className="detail-row">
                    <span className="detail-label">Payment ID:</span>
                    <span className="detail-value">
                      {paymentResult.paymentId}
                    </span>
                  </div>
                )}
                {paymentResult.amount && (
                  <div className="detail-row">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value amount-value">
                      {paymentResult.currency}
                      {paymentResult.amount}
                    </span>
                  </div>
                )}
                {paymentResult.email && (
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{paymentResult.email}</span>
                  </div>
                )}
              </div>
            )}

            <div className="button-container">
              <button
                onClick={handleGoToDashboard}
                className="btn-payment-dashboard btn-primary"
              >
                <FaHome />
                Go to Dashboard
              </button>

              <button
                onClick={handleDownloadReceipt}
                className="btn-payment-dashboard btn-secondary"
              >
                <FaDownload />
                Download Receipt
              </button>
            </div>

            <div className="countdown">
              Redirecting to dashboard in {countdown} seconds...
            </div>

            <div className="alert alert-success">
              <FaEnvelope />
              Confirmation email sent to your registered address.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="payment-error-bg">
        <div className="floating-elements">
          <div className="floating-circle"></div>
          <div className="floating-circle"></div>
          <div className="floating-circle"></div>
        </div>

        <div className="payment-card">
          <div className="icon-container payment-error-icon">
            <FaExclamationTriangle />
          </div>

          <h1 className="main-title">Payment Failed</h1>
          <p className="subtitle">
            We encountered an issue processing your payment.
          </p>

          {paymentResult?.error && (
            <div className="alert alert-error">
              <strong>Error:</strong> {paymentResult.error}
            </div>
          )}

          <div className="button-container">
            <button
              onClick={handleTryAgain}
              className="btn-payment-dashboard btn-primary"
            >
              Try Again
            </button>

            <button
              onClick={handleContactSupport}
              className="btn-payment-dashboard btn-secondary"
            >
              <FaEnvelope />
              Contact Support
            </button>
          </div>

          <div className="alert alert-warning">
            Need help? Our support team is available 24/7 to assist you.
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;

