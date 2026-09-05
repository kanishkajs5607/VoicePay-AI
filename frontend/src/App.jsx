import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [started, setStarted] = useState(
    sessionStorage.getItem("voicepay_started") === "true"
  );

  const [dashboardOpen, setDashboardOpen] = useState(false);

  const [activeDashboardTab, setActiveDashboardTab] =
    useState("overview");

  const [voiceLanguage, setVoiceLanguage] = useState("en-IN");

  const [voiceText, setVoiceText] = useState("");

  const [isListening, setIsListening] = useState(false);

  const [customer, setCustomer] = useState("");

  const [product, setProduct] = useState("");

  const [quantity, setQuantity] = useState("");

  const [price, setPrice] = useState("");

  const [gst, setGst] = useState("");

  const [preview, setPreview] = useState(null);

  const [createdInvoice, setCreatedInvoice] = useState(null);

  const [paymentLink, setPaymentLink] = useState(null);

  const [dashboard, setDashboard] = useState(null);

  const [invoices, setInvoices] = useState([]);

  const [auditLogs, setAuditLogs] = useState([]);

  const [businessQuery, setBusinessQuery] = useState("");

  const [businessAnswer, setBusinessAnswer] = useState(null);

  const [isBusinessListening, setIsBusinessListening] =
    useState(false);

  const [reminder, setReminder] = useState(null);

  const [paymentPageData, setPaymentPageData] = useState(null);

  const [paymentPageLoading, setPaymentPageLoading] =
    useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState("");

  const currentPath = window.location.pathname;

  const isPaymentPage = currentPath.startsWith("/pay/");

  const paymentLinkId = isPaymentPage
    ? currentPath.split("/pay/")[1]
    : null;

  const invoiceData = {
    customer,
    product,
    quantity: Number(quantity),
    price: Number(price),
    gst: Number(gst),
  };

  const enterVoicePay = () => {
    sessionStorage.setItem("voicepay_started", "true");

    setStarted(true);
  };

  const goToMainWorkspace = () => {
    sessionStorage.setItem("voicepay_started", "true");

    window.location.href = "/";
  };

  const loadDashboard = async () => {
    try {
      const response = await fetch(
        `${API_URL}/dashboard/summary`
      );

      const data = await response.json();

      setDashboard(data);
    } catch {
      setError("Unable to load dashboard.");
    }
  };

  const loadInvoices = async () => {
    try {
      const response = await fetch(
        `${API_URL}/invoices`
      );

      const data = await response.json();

      setInvoices(data.invoices || []);
    } catch {
      setError("Unable to load invoices.");
    }
  };

  const loadAuditLogs = async () => {
    try {
      const response = await fetch(
        `${API_URL}/audit`
      );

      const data = await response.json();

      setAuditLogs(data.audit_logs || []);
    } catch {
      setError("Unable to load history.");
    }
  };

  const refreshAll = async () => {
    setIsRefreshing(true);

    setError("");

    setBusinessAnswer(null);

    setReminder(null);

    try {
      await Promise.all([
        loadDashboard(),
        loadInvoices(),
        loadAuditLogs(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (started && !isPaymentPage) {
      refreshAll();
    }
  }, [started, isPaymentPage]);

  useEffect(() => {
    if (!paymentLinkId) {
      return;
    }

    const loadPaymentDetails = async () => {
      setPaymentPageLoading(true);

      setError("");

      try {
        const response = await fetch(
          `${API_URL}/payment-link/${paymentLinkId}`
        );

        const data = await response.json();

        if (data.error) {
          setError(data.error);

          return;
        }

        setPaymentPageData(data);
      } catch {
        setError("Unable to load payment details.");
      } finally {
        setPaymentPageLoading(false);
      }
    };

    loadPaymentDetails();
  }, [paymentLinkId]);

  const startListening = () => {
    setError("");

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser."
      );

      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = voiceLanguage;

    recognition.interimResults = false;

    recognition.continuous = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript +=
          event.results[i][0].transcript + " ";
      }

      setVoiceText(transcript.trim());
    };

    recognition.onerror = () => {
      setError(
        "Could not recognize your voice."
      );

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const startBusinessListening = () => {
    setError("");

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser."
      );

      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = voiceLanguage;

    recognition.interimResults = false;

    recognition.continuous = false;

    recognition.onstart = () => {
      setIsBusinessListening(true);
    };

    recognition.onresult = (event) => {
      setBusinessQuery(
        event.results[0][0].transcript
      );
    };

    recognition.onend = () => {
      setIsBusinessListening(false);
    };

    recognition.start();
  };

  const processVoiceCommand = async () => {
    setError("");

    setPreview(null);

    setCreatedInvoice(null);

    setPaymentLink(null);

    if (!voiceText.trim()) {
      setError(
        "Speak or type an invoice command first."
      );

      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/voice/parse`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            text: voiceText,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(data.error);

        return;
      }

      setCustomer(data.customer);

      setProduct(data.product);

      setQuantity(
        data.quantity.toString()
      );

      setPrice(
        data.price.toString()
      );

      setGst(
        data.gst.toString()
      );

      const previewResponse = await fetch(
        `${API_URL}/invoice/preview`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            customer: data.customer,

            product: data.product,

            quantity: Number(
              data.quantity
            ),

            price: Number(
              data.price
            ),

            gst: Number(
              data.gst
            ),
          }),
        }
      );

      const previewData =
        await previewResponse.json();

      if (previewData.error) {
        setError(
          previewData.error
        );

        return;
      }

      setPreview(
        previewData
      );
    } catch {
      setError(
        "Unable to process invoice command."
      );
    }
  };

  const updatePreview = async () => {
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/invoice/preview`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(
            invoiceData
          ),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(
          data.error
        );

        return;
      }

      setPreview(
        data
      );

      setCreatedInvoice(
        null
      );

      setPaymentLink(
        null
      );
    } catch {
      setError(
        "Unable to update invoice."
      );
    }
  };

  const createInvoice = async () => {
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/invoice/create`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(
            invoiceData
          ),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(
          data.error
        );

        return;
      }

      setCreatedInvoice(
        data
      );

      await refreshAll();
    } catch {
      setError(
        "Unable to create invoice."
      );
    }
  };

  const generatePaymentLink = async () => {
    setError("");

    if (!createdInvoice) {
      setError(
        "Create an invoice first."
      );

      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/payment-link/create`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            invoice_id:
              createdInvoice.invoice_id,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(
          data.error
        );

        return;
      }

      setPaymentLink(
        data
      );

      await loadAuditLogs();
    } catch {
      setError(
        "Unable to generate payment link."
      );
    }
  };

  const completePayment = async () => {
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/payment-link/${paymentLinkId}/pay`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(
          data.error
        );

        return;
      }

      setPaymentPageData(
        (previous) => ({
          ...previous,

          payment_status:
            "paid",
        })
      );
    } catch {
      setError(
        "Unable to complete payment."
      );
    }
  };

  const askBusinessQuery = async () => {
    setError("");

    setBusinessAnswer(
      null
    );

    if (!businessQuery.trim()) {
      setError(
        "Ask VoicePay a question."
      );

      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/business/query`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            text: businessQuery,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(
          data.error
        );

        return;
      }

      setBusinessAnswer(
        data
      );

      await loadAuditLogs();
    } catch {
      setError(
        "Unable to process business query."
      );
    }
  };

  const createReminder = async (
    invoiceId
  ) => {
    setError("");

    setReminder(
      null
    );

    try {
      const response = await fetch(
        `${API_URL}/reminder/create`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            invoice_id:
              invoiceId,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(
          data.error
        );

        return;
      }

      setReminder(
        data
      );

      await loadAuditLogs();
    } catch {
      setError(
        "Unable to prepare reminder."
      );
    }
  };

  const resetInvoice = () => {
    setVoiceText("");

    setCustomer("");

    setProduct("");

    setQuantity("");

    setPrice("");

    setGst("");

    setPreview(null);

    setCreatedInvoice(null);

    setPaymentLink(null);

    setError("");
  };

  if (isPaymentPage) {
    return (
      <div className="glass-background payment-background">
        <div className="orb orb-one"></div>

        <div className="orb orb-two"></div>

        <div className="glass-card payment-card">
          <div className="payment-brand">
            <div className="logo-mark">
              V
            </div>

            <div>
              <strong>
                VoicePay
              </strong>

              <span>
                Secure demo payment
              </span>
            </div>
          </div>

          {paymentPageLoading && (
            <p className="loading-text">
              Loading payment request...
            </p>
          )}

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {paymentPageData &&
            paymentPageData.payment_status ===
              "pending" && (
              <>
                <div className="payment-amount">
                  <span>
                    PAYMENT REQUEST
                  </span>

                  <h1>
                    ₹
                    {Number(
                      paymentPageData.amount
                    ).toFixed(2)}
                  </h1>

                  <p>
                    From{" "}
                    <strong>
                      {
                        paymentPageData.customer
                      }
                    </strong>
                  </p>
                </div>

                <div className="payment-meta">
                  <div>
                    <span>
                      Invoice
                    </span>

                    <strong>
                      {
                        paymentPageData.invoice_id
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Status
                    </span>

                    <strong>
                      Pending
                    </strong>
                  </div>
                </div>

                <button
                  className="gradient-button full-button"
                  onClick={completePayment}
                >
                  Pay securely

                  <span>
                    →
                  </span>
                </button>

                <p className="demo-text">
                  Demo mode · No real money will be charged
                </p>
              </>
            )}

          {paymentPageData &&
            paymentPageData.payment_status ===
              "paid" && (
              <div className="payment-success">
                <div className="success-icon">
                  ✓
                </div>

                <span>
                  PAYMENT COMPLETE
                </span>

                <h1>
                  Payment successful
                </h1>

                <p>
                  This payment has been recorded in VoicePay.
                </p>

                <div className="paid-amount">
                  ₹
                  {Number(
                    paymentPageData.amount
                  ).toFixed(2)}
                </div>

                <button
                  className="gradient-button full-button back-home-button"
                  onClick={goToMainWorkspace}
                >
                  Back to VoicePay

                  <span>
                    →
                  </span>
                </button>
              </div>
            )}
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="glass-background welcome-screen">
        <div className="orb orb-one"></div>

        <div className="orb orb-two"></div>

        <div className="orb orb-three"></div>

        <div className="welcome-nav">
          <div className="welcome-brand">
            <div className="logo-mark">
              V
            </div>

            <div>
              <strong>
                VoicePay
              </strong>

              <span>
                AI
              </span>
            </div>
          </div>

          <div className="welcome-demo">
            <span></span>

            LIVE DEMO
          </div>
        </div>

        <div className="welcome-content welcome-simple">
          <h1>
            Welcome to
            <br />

            <span>
              VoicePay.
            </span>
          </h1>

          <p className="welcome-tagline">
            From voice to invoice in one command.
          </p>

          <button
            className="start-button"
            onClick={enterVoicePay}
          >
            Start VoicePay

            <span>
              →
            </span>
          </button>
        </div>
      </div>
    );
  }

  const pendingInvoices =
    invoices.filter(
      (invoice) =>
        invoice.payment_status ===
        "pending"
    );

  return (
    <div className="glass-background app-screen">
      <div className="orb orb-one"></div>

      <div className="orb orb-two"></div>

      <div className="orb orb-three"></div>

      <header className="app-topbar">
        <button
          className="topbar-button dashboard-button"
          onClick={() =>
            setDashboardOpen(true)
          }
        >
          <span className="menu-icon">
            ☰
          </span>

          Dashboard
        </button>

        <div className="topbar-brand">
          <div className="logo-mark small-logo">
            V
          </div>

          <div>
            <strong>
              VoicePay
            </strong>

            <span>
              AI
            </span>
          </div>
        </div>

        <div className="topbar-actions">
          <button
            className="topbar-button icon-button"
            onClick={refreshAll}
            disabled={isRefreshing}
            title="Refresh dashboard data"
          >
            {isRefreshing
              ? "…"
              : "↻"}
          </button>

          <select
            className="language-toggle"
            value={voiceLanguage}
            onChange={(event) =>
              setVoiceLanguage(
                event.target.value
              )
            }
          >
            <option value="en-IN">
              EN
            </option>

            <option value="ta-IN">
              தமிழ்
            </option>
          </select>
        </div>
      </header>

      <main className="workspace">
        <section className="workspace-heading">
          <span>
            VOICE INVOICE
          </span>

          <h1>
            Generate an invoice
            <br />
            with your voice.
          </h1>

          <p>
            Speak naturally or type the transaction.
            VoicePay will prepare the invoice for you.
          </p>
        </section>

        <section className="workspace-grid">
          <div className="glass-card command-panel">
            <div className="card-heading">
              <div>
                <span className="section-tag">
                  MESSAGE
                </span>

                <h2>
                  What did you sell?
                </h2>
              </div>

              <div className="language-status">
                <span></span>

                {voiceLanguage ===
                "ta-IN"
                  ? "Tamil"
                  : "English"}
              </div>
            </div>

            <div className="message-box">
              <textarea
                value={voiceText}
                onChange={(event) =>
                  setVoiceText(
                    event.target.value
                  )
                }
                placeholder={
                  voiceLanguage ===
                  "ta-IN"
                    ? "Example: கணேஷுக்கு நாலு பாட்டில் ₹40 ஜிஎஸ்டி 12%"
                    : "Example: Create invoice for Arun Kumar 2 water bottles at 50 rupees GST 18 percent"
                }
              />

              <button
                className={
                  isListening
                    ? "speak-button listening"
                    : "speak-button"
                }
                onClick={startListening}
              >
                <span>
                  🎙
                </span>

                {isListening
                  ? "Listening..."
                  : "Speak"}
              </button>
            </div>

            <div className="command-actions">
              <button
                className="gradient-button"
                onClick={processVoiceCommand}
              >
                Generate invoice

                <span>
                  →
                </span>
              </button>
            </div>

            {error && (
              <div className="error-banner">
                {error}
              </div>
            )}

            <div className="helper-strip">
              <div>
                <span>
                  01
                </span>

                <p>
                  Speak naturally
                </p>
              </div>

              <div>
                <span>
                  02
                </span>

                <p>
                  Review details
                </p>
              </div>

              <div>
                <span>
                  03
                </span>

                <p>
                  Send payment link
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card invoice-panel">
            {!preview ? (
              <div className="invoice-placeholder">
                <div className="preview-icon">
                  ✦
                </div>

                <span className="section-tag">
                  INVOICE PREVIEW
                </span>

                <h2>
                  Your generated invoice
                  <br />
                  appears here.
                </h2>

                <p>
                  Speak or type a transaction and VoicePay
                  will place the generated invoice here.
                </p>

                <div className="placeholder-lines">
                  <span></span>

                  <span></span>

                  <span></span>
                </div>
              </div>
            ) : (
              <div className="invoice-content">
                <div className="invoice-top">
                  <div>
                    <span className="section-tag">
                      GENERATED INVOICE
                    </span>

                    <h2>
                      {customer}
                    </h2>
                  </div>

                  <div className="success-pill">
                    ✓ Ready
                  </div>
                </div>

                {createdInvoice && (
                  <div className="invoice-id-card">
                    <span>
                      INVOICE ID
                    </span>

                    <strong>
                      {
                        createdInvoice.invoice_id
                      }
                    </strong>
                  </div>
                )}

                <div className="invoice-form-grid">
                  <label className="wide-field">
                    <span>
                      Customer
                    </span>

                    <input
                      value={customer}
                      onChange={(event) =>
                        setCustomer(
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label className="wide-field">
                    <span>
                      Product / Service
                    </span>

                    <input
                      value={product}
                      onChange={(event) =>
                        setProduct(
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>
                      Quantity
                    </span>

                    <input
                      type="number"
                      value={quantity}
                      onChange={(event) =>
                        setQuantity(
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>
                      Price
                    </span>

                    <input
                      type="number"
                      value={price}
                      onChange={(event) =>
                        setPrice(
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>
                      GST %
                    </span>

                    <input
                      type="number"
                      value={gst}
                      onChange={(event) =>
                        setGst(
                          event.target.value
                        )
                      }
                    />
                  </label>
                </div>

                <button
                  className="edit-button"
                  onClick={updatePreview}
                >
                  ✎ Edit / Update Invoice
                </button>

                <div className="invoice-totals">
                  <div>
                    <span>
                      Subtotal
                    </span>

                    <strong>
                      ₹
                      {Number(
                        preview.subtotal
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>
                      GST
                    </span>

                    <strong>
                      ₹
                      {Number(
                        preview.gst_amount
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div className="grand-total">
                    <span>
                      Total
                    </span>

                    <strong>
                      ₹
                      {Number(
                        preview.total
                      ).toFixed(2)}
                    </strong>
                  </div>
                </div>

                {!createdInvoice && (
                  <button
                    className="gradient-button full-button"
                    onClick={createInvoice}
                  >
                    Confirm & create invoice

                    <span>
                      →
                    </span>
                  </button>
                )}

                {createdInvoice &&
                  !paymentLink && (
                    <button
                      className="gradient-button full-button"
                      onClick={generatePaymentLink}
                    >
                      Generate payment link

                      <span>
                        →
                      </span>
                    </button>
                  )}

                {paymentLink && (
                  <div className="payment-link-box">
                    <div>
                      <span>
                        PAYMENT LINK READY
                      </span>

                      <strong>
                        ₹
                        {Number(
                          paymentLink.amount
                        ).toFixed(2)}
                      </strong>
                    </div>

                    <a
                      href={
                        paymentLink.payment_url
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open payment

                      <span>
                        ↗
                      </span>
                    </a>
                  </div>
                )}

                <button
                  className="new-invoice-link"
                  onClick={resetInvoice}
                >
                  + Start another invoice
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {dashboardOpen && (
        <div className="dashboard-overlay">
          <div
            className="dashboard-backdrop"
            onClick={() =>
              setDashboardOpen(
                false
              )
            }
          ></div>

          <aside className="dashboard-drawer glass-card">
            <div className="drawer-header">
              <div>
                <span className="section-tag">
                  MERCHANT DASHBOARD
                </span>

                <h2>
                  VoicePay
                </h2>
              </div>

              <button
                className="close-button"
                onClick={() =>
                  setDashboardOpen(
                    false
                  )
                }
              >
                ×
              </button>
            </div>

            <div className="dashboard-tabs">
              <button
                className={
                  activeDashboardTab ===
                  "overview"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveDashboardTab(
                    "overview"
                  )
                }
              >
                Overview
              </button>

              <button
                className={
                  activeDashboardTab ===
                  "queries"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveDashboardTab(
                    "queries"
                  )
                }
              >
                Queries
              </button>

              <button
                className={
                  activeDashboardTab ===
                  "history"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveDashboardTab(
                    "history"
                  )
                }
              >
                History
              </button>
            </div>

            {activeDashboardTab ===
              "overview" && (
              <div className="drawer-content">
                <div className="dashboard-stat-grid">
                  <div className="glass-stat">
                    <span>
                      Total collected
                    </span>

                    <strong>
                      ₹
                      {Number(
                        dashboard?.total_collected ||
                          0
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div className="glass-stat">
                    <span>
                      Pending amount
                    </span>

                    <strong>
                      ₹
                      {Number(
                        dashboard?.pending_amount ||
                          0
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div className="glass-stat">
                    <span>
                      Paid invoices
                    </span>

                    <strong>
                      {
                        dashboard?.paid_invoices ||
                        0
                      }
                    </strong>
                  </div>

                  <div className="glass-stat">
                    <span>
                      Pending
                    </span>

                    <strong>
                      {
                        dashboard?.pending_invoices ||
                        0
                      }
                    </strong>
                  </div>
                </div>

                <div className="drawer-section">
                  <div className="drawer-section-title">
                    <h3>
                      Pending payments
                    </h3>

                    <span>
                      {
                        pendingInvoices.length
                      }{" "}
                      pending
                    </span>
                  </div>

                  <div className="pending-list">
                    {pendingInvoices.length ===
                    0 ? (
                      <div className="empty-dashboard">
                        ✓ No pending payments
                      </div>
                    ) : (
                      pendingInvoices
                        .slice(0, 5)
                        .map(
                          (invoice) => (
                            <div
                              className="pending-item"
                              key={
                                invoice.invoice_id
                              }
                            >
                              <div className="customer-letter">
                                {invoice.customer
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <strong>
                                  {
                                    invoice.customer
                                  }
                                </strong>

                                <span>
                                  {
                                    invoice.invoice_id
                                  }
                                </span>
                              </div>

                              <strong className="pending-amount">
                                ₹
                                {Number(
                                  invoice.total
                                ).toFixed(
                                  2
                                )}
                              </strong>

                              <button
                                onClick={() =>
                                  createReminder(
                                    invoice.invoice_id
                                  )
                                }
                              >
                                Remind
                              </button>
                            </div>
                          )
                        )
                    )}
                  </div>
                </div>

                {reminder && (
                  <div className="reminder-box">
                    <span>
                      REMINDER READY
                    </span>

                    <p>
                      {
                        reminder.message
                      }
                    </p>

                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          reminder.message
                        )
                      }
                    >
                      Copy message
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeDashboardTab ===
              "queries" && (
              <div className="drawer-content">
                <div className="query-hero">
                  <span className="section-tag">
                    ASK VOICEPAY
                  </span>

                  <h3>
                    Ask about your
                    <br />
                    business.
                  </h3>

                  <p>
                    Search collections and pending payments
                    using natural language.
                  </p>
                </div>

                <div className="query-input">
                  <input
                    value={
                      businessQuery
                    }
                    onChange={(event) =>
                      setBusinessQuery(
                        event.target.value
                      )
                    }
                    placeholder="Who hasn't paid me?"
                  />

                  <button
                    onClick={
                      startBusinessListening
                    }
                  >
                    {isBusinessListening
                      ? "●"
                      : "🎙"}
                  </button>
                </div>

                <div className="query-examples">
                  <button
                    onClick={() =>
                      setBusinessQuery(
                        "Who hasn't paid me?"
                      )
                    }
                  >
                    Who hasn't paid me?
                  </button>

                  <button
                    onClick={() =>
                      setBusinessQuery(
                        "How much did I collect?"
                      )
                    }
                  >
                    How much did I collect?
                  </button>
                </div>

                <button
                  className="gradient-button full-button"
                  onClick={askBusinessQuery}
                >
                  Search business

                  <span>
                    →
                  </span>
                </button>

                {businessAnswer && (
                  <div className="query-answer">
                    <span>
                      VOICEPAY ANSWER
                    </span>

                    <p>
                      {
                        businessAnswer.answer
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeDashboardTab ===
              "history" && (
              <div className="drawer-content">
                <div className="drawer-section-title">
                  <h3>
                    Activity history
                  </h3>

                  <span>
                    Latest actions
                  </span>
                </div>

                <div className="history-list">
                  {auditLogs.length ===
                  0 ? (
                    <div className="empty-dashboard">
                      No activity yet
                    </div>
                  ) : (
                    auditLogs
                      .slice(0, 12)
                      .map((log) => (
                        <div
                          className="history-item"
                          key={log.id}
                        >
                          <div className="history-dot"></div>

                          <div>
                            <strong>
                              {log.action.replaceAll(
                                "_",
                                " "
                              )}
                            </strong>

                            <p>
                              {
                                log.details
                              }
                            </p>
                          </div>

                          <small>
                            {new Date(
                              log.created_at
                            ).toLocaleTimeString(
                              [],
                              {
                                hour:
                                  "2-digit",

                                minute:
                                  "2-digit",
                              }
                            )}
                          </small>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;