import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [gst, setGst] = useState("");

  const [voiceText, setVoiceText] = useState("");
  const [voiceLanguage, setVoiceLanguage] = useState("en-IN");
  const [isListening, setIsListening] = useState(false);

  const [result, setResult] = useState(null);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [paymentLink, setPaymentLink] = useState(null);

  const [dashboard, setDashboard] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [businessQuery, setBusinessQuery] = useState("");
  const [businessAnswer, setBusinessAnswer] = useState(null);
  const [isBusinessListening, setIsBusinessListening] = useState(false);

  const [reminder, setReminder] = useState(null);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [paymentPageData, setPaymentPageData] = useState(null);
  const [paymentPageLoading, setPaymentPageLoading] = useState(false);

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

  const loadDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/summary`);
      const data = await response.json();
      setDashboard(data);
    } catch {
      setError("Unable to load dashboard.");
    }
  };

  const loadInvoices = async () => {
    try {
      const response = await fetch(`${API_URL}/invoices`);
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch {
      setError("Unable to load invoices.");
    }
  };

  const loadAuditLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/audit`);
      const data = await response.json();
      setAuditLogs(data.audit_logs || []);
    } catch {
      setError("Unable to load activity history.");
    }
  };

  const refreshAll = async () => {
    setIsRefreshing(true);

    await Promise.all([
      loadDashboard(),
      loadInvoices(),
      loadAuditLogs(),
    ]);

    setIsRefreshing(false);
  };

  useEffect(() => {
    if (!isPaymentPage) {
      refreshAll();
    }
  }, [isPaymentPage]);

  useEffect(() => {
    if (!paymentLinkId) return;

    const loadPaymentDetails = async () => {
      setPaymentPageLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/payment-link/${paymentLinkId}`
        );

        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setPaymentPageData(data);
        }
      } catch {
        setError("Unable to load payment.");
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
      setError("Voice recognition is not supported in this browser.");
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
        transcript += event.results[i][0].transcript + " ";
      }

      setVoiceText(transcript.trim());
    };

    recognition.onerror = () => {
      setError("Could not recognize your voice.");
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
      setError("Voice recognition is not supported in this browser.");
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
      setBusinessQuery(event.results[0][0].transcript);
    };

    recognition.onend = () => {
      setIsBusinessListening(false);
    };

    recognition.start();
  };

  const handleVoiceCommand = async () => {
    setError("");
    setResult(null);
    setCreatedInvoice(null);
    setPaymentLink(null);

    try {
      const response = await fetch(`${API_URL}/voice/parse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: voiceText,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setCustomer(data.customer);
      setProduct(data.product);
      setQuantity(data.quantity.toString());
      setPrice(data.price.toString());
      setGst(data.gst.toString());

      await loadAuditLogs();
    } catch {
      setError("Unable to process voice command.");
    }
  };

  const handlePreview = async () => {
    setError("");
    setResult(null);
    setCreatedInvoice(null);
    setPaymentLink(null);

    try {
      const response = await fetch(`${API_URL}/invoice/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setResult(data);
    } catch {
      setError("Unable to preview invoice.");
    }
  };

  const handleCreate = async () => {
    setError("");

    try {
      const response = await fetch(`${API_URL}/invoice/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setCreatedInvoice(data);
      await refreshAll();
    } catch {
      setError("Unable to create invoice.");
    }
  };

  const handleGeneratePaymentLink = async () => {
    setError("");

    if (!createdInvoice) {
      setError("Create an invoice first.");
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
            invoice_id: createdInvoice.invoice_id,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setPaymentLink(data);
      await loadAuditLogs();
    } catch {
      setError("Unable to generate payment link.");
    }
  };

  const handleMockPayment = async () => {
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
        setError(data.error);
        return;
      }

      setPaymentPageData((previous) => ({
        ...previous,
        payment_status: "paid",
      }));
    } catch {
      setError("Unable to complete payment.");
    }
  };

  const handleBusinessQuery = async () => {
    setError("");
    setBusinessAnswer(null);

    if (!businessQuery.trim()) {
      setError("Ask VoicePay a question first.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/business/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: businessQuery,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setBusinessAnswer(data);
      await loadAuditLogs();
    } catch {
      setError("Unable to process business query.");
    }
  };

  const handleReminder = async (invoiceId) => {
    setReminder(null);
    setError("");

    try {
      const response = await fetch(`${API_URL}/reminder/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoice_id: invoiceId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setReminder(data);
      await loadAuditLogs();
    } catch {
      setError("Unable to prepare reminder.");
    }
  };

  if (isPaymentPage) {
    return (
      <div className="payment-page">
        <div className="payment-card">
          <div className="brand-mark">VP</div>

          <h1>VoicePay</h1>
          <p className="muted">Secure demo payment request</p>

          {paymentPageLoading && <p>Loading...</p>}

          {error && <div className="error-box">{error}</div>}

          {paymentPageData && (
            <>
              <div className="payment-details">
                <span>Customer</span>
                <strong>{paymentPageData.customer}</strong>

                <span>Amount</span>
                <strong className="payment-amount">
                  ₹{Number(paymentPageData.amount).toFixed(2)}
                </strong>
              </div>

              {paymentPageData.payment_status === "pending" ? (
                <>
                  <button
                    className="primary-button full-button"
                    onClick={handleMockPayment}
                  >
                    Pay ₹{Number(paymentPageData.amount).toFixed(2)}
                  </button>

                  <p className="demo-note">
                    Demo mode · No real money will be charged
                  </p>
                </>
              ) : (
                <div className="success-box">
                  <div className="success-icon">✓</div>
                  <h2>Payment Successful</h2>
                  <p>Your payment has been recorded.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  const pendingInvoices = invoices.filter(
    (invoice) => invoice.payment_status === "pending"
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="logo-area">
          <div className="logo-icon">VP</div>

          <div>
            <div className="logo-name">VoicePay AI</div>
            <div className="logo-subtitle">
              Voice-first payments for merchants
            </div>
          </div>
        </div>

        <div className="top-actions">
          <span className="demo-badge">● DEMO MODE</span>

          <select
            value={voiceLanguage}
            onChange={(e) => setVoiceLanguage(e.target.value)}
            className="language-select"
          >
            <option value="en-IN">English</option>
            <option value="ta-IN">தமிழ்</option>
          </select>
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">VOICE-FIRST COMMERCE</span>

            <h1>
              Payments should be as easy as
              <span> speaking.</span>
            </h1>

            <p>
              Create invoices, collect payments and understand your
              business using simple English or Tamil voice commands.
            </p>

            <div className="hero-tags">
              <span>🎙 Voice invoices</span>
              <span>🌐 Tamil + English</span>
              <span>💳 Payment links</span>
              <span>📊 Business insights</span>
            </div>
          </div>

          <div className="voice-card">
            <div className="voice-card-header">
              <div>
                <span className="section-label">QUICK ACTION</span>
                <h2>Create invoice by voice</h2>
              </div>

              <div
                className={
                  isListening
                    ? "mic-circle listening"
                    : "mic-circle"
                }
              >
                🎙
              </div>
            </div>

            <div className="voice-input-row">
              <input
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
                placeholder={
                  voiceLanguage === "ta-IN"
                    ? "உங்கள் invoice command..."
                    : "Create invoice for Arun Kumar 2 water bottles at 50 rupees GST 18 percent"
                }
              />
            </div>

            <div className="button-row">
              <button
                className="secondary-button"
                onClick={startListening}
              >
                {isListening ? "Listening..." : "🎙 Speak"}
              </button>

              <button
                className="primary-button"
                onClick={handleVoiceCommand}
              >
                Process Command →
              </button>
            </div>

            {customer && product && (
              <div className="parsed-banner">
                <span>✓ Voice understood</span>
                <strong>
                  {customer} · {quantity} {product} · ₹{price}
                </strong>
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className="error-box global-error">
            ⚠ {error}
          </div>
        )}

        <section className="section">
          <div className="section-heading">
            <div>
              <span className="section-label">LIVE OVERVIEW</span>
              <h2>Business Dashboard</h2>
            </div>

            <button
              className="ghost-button"
              onClick={refreshAll}
              disabled={isRefreshing}
            >
              {isRefreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">▣</div>
              <span>Total invoices</span>
              <strong>{dashboard?.total_invoices ?? 0}</strong>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✓</div>
              <span>Paid invoices</span>
              <strong>{dashboard?.paid_invoices ?? 0}</strong>
            </div>

            <div className="stat-card">
              <div className="stat-icon">◷</div>
              <span>Pending invoices</span>
              <strong>{dashboard?.pending_invoices ?? 0}</strong>
            </div>

            <div className="stat-card highlight-stat">
              <div className="stat-icon">₹</div>
              <span>Total collected</span>
              <strong>
                ₹{Number(dashboard?.total_collected || 0).toFixed(2)}
              </strong>
            </div>

            <div className="stat-card">
              <div className="stat-icon">↗</div>
              <span>Pending amount</span>
              <strong>
                ₹{Number(dashboard?.pending_amount || 0).toFixed(2)}
              </strong>
            </div>
          </div>
        </section>

        <div className="two-column">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="section-label">SMART ASSISTANT</span>
                <h2>Ask VoicePay</h2>
              </div>

              <span className="ai-badge">AI ASSISTANT</span>
            </div>

            <p className="muted">
              Ask simple business questions using your voice.
            </p>

            <div className="query-box">
              <input
                value={businessQuery}
                onChange={(e) => setBusinessQuery(e.target.value)}
                placeholder="Who hasn't paid me?"
              />

              <button
                className="mic-small"
                onClick={startBusinessListening}
              >
                {isBusinessListening ? "●" : "🎙"}
              </button>
            </div>

            <button
              className="primary-button full-button"
              onClick={handleBusinessQuery}
            >
              Ask VoicePay
            </button>

            <div className="suggestions">
              <button
                onClick={() =>
                  setBusinessQuery("Who hasn't paid me?")
                }
              >
                Who hasn't paid me?
              </button>

              <button
                onClick={() =>
                  setBusinessQuery("How much did I collect?")
                }
              >
                How much did I collect?
              </button>
            </div>

            {businessAnswer && (
              <div className="answer-card">
                <span>VOICEPAY INSIGHT</span>
                <p>{businessAnswer.answer}</p>
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="section-label">INVOICE BUILDER</span>
                <h2>Invoice details</h2>
              </div>
            </div>

            <div className="form-grid">
              <div className="field full-field">
                <label>Customer</label>
                <input
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="Customer name"
                />
              </div>

              <div className="field full-field">
                <label>Product / Service</label>
                <input
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="Product"
                />
              </div>

              <div className="field">
                <label>Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="field">
                <label>Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="₹"
                />
              </div>

              <div className="field full-field">
                <label>GST (%)</label>
                <input
                  type="number"
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                  placeholder="18"
                />
              </div>
            </div>

            <button
              className="secondary-button full-button"
              onClick={handlePreview}
            >
              Preview Invoice
            </button>

            {result && (
              <div className="invoice-preview">
                <div className="preview-header">
                  <div>
                    <span>INVOICE PREVIEW</span>
                    <h3>{result.customer}</h3>
                  </div>

                  <strong>
                    ₹{Number(result.total).toFixed(2)}
                  </strong>
                </div>

                <div className="preview-line">
                  <span>
                    {result.quantity} × {result.product}
                  </span>
                  <span>₹{Number(result.subtotal).toFixed(2)}</span>
                </div>

                <div className="preview-line">
                  <span>GST</span>
                  <span>₹{Number(result.gst_amount).toFixed(2)}</span>
                </div>

                <button
                  className="primary-button full-button"
                  onClick={handleCreate}
                >
                  Confirm & Create Invoice
                </button>
              </div>
            )}

            {createdInvoice && (
              <div className="success-card">
                <div className="success-check">✓</div>

                <div>
                  <span>Invoice created</span>
                  <strong>{createdInvoice.invoice_id}</strong>
                  <p>
                    ₹{Number(createdInvoice.total).toFixed(2)} ·{" "}
                    {createdInvoice.customer}
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={handleGeneratePaymentLink}
                >
                  Create Payment Link
                </button>
              </div>
            )}

            {paymentLink && (
              <div className="payment-link-card">
                <span>PAYMENT LINK READY</span>

                <strong>
                  ₹{Number(paymentLink.amount).toFixed(2)}
                </strong>

                <a
                  href={paymentLink.payment_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Demo Payment →
                </a>
              </div>
            )}
          </section>
        </div>

        <section className="section">
          <div className="section-heading">
            <div>
              <span className="section-label">COLLECTIONS</span>
              <h2>Pending Payments</h2>
            </div>

            <span className="pending-pill">
              {pendingInvoices.length} pending
            </span>
          </div>

          <div className="table-card">
            {pendingInvoices.length === 0 ? (
              <div className="empty-state">
                <div>✓</div>
                <h3>All caught up</h3>
                <p>No pending payments.</p>
              </div>
            ) : (
              <>
                <div className="table-row table-header">
                  <span>Customer</span>
                  <span>Invoice</span>
                  <span>Amount</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>

                {pendingInvoices.slice(0, 5).map((invoice) => (
                  <div
                    className="table-row"
                    key={invoice.invoice_id}
                  >
                    <strong>{invoice.customer}</strong>
                    <span>{invoice.invoice_id}</span>
                    <span>
                      ₹{Number(invoice.total).toFixed(2)}
                    </span>

                    <span>
                      <span className="status-pending">
                        Pending
                      </span>
                    </span>

                    <span>
                      <button
                        className="reminder-button"
                        onClick={() =>
                          handleReminder(invoice.invoice_id)
                        }
                      >
                        🔔 Reminder
                      </button>
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>

          {reminder && (
            <div className="reminder-card">
              <div>
                <span>REMINDER READY</span>
                <p>{reminder.message}</p>
              </div>

              <button
                className="secondary-button"
                onClick={() =>
                  navigator.clipboard.writeText(reminder.message)
                }
              >
                Copy Message
              </button>
            </div>
          )}
        </section>

        <section className="activity-section">
          <div>
            <span className="section-label">TRANSPARENT BY DESIGN</span>
            <h2>Recent Activity</h2>
          </div>

          <div className="activity-list">
            {auditLogs.slice(0, 4).map((log) => (
              <div className="activity-item" key={log.id}>
                <div className="activity-dot"></div>

                <div>
                  <strong>
                    {log.action.replaceAll("_", " ")}
                  </strong>

                  <p>{log.details}</p>
                </div>

                <small>
                  {new Date(log.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer>
        VoicePay AI · Built for Razorpay AI Buildathon 2026
      </footer>
    </div>
  );
}

export default App;