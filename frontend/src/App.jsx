import { useEffect, useState } from "react";

function App() {
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [gst, setGst] = useState("");

  const [voiceText, setVoiceText] = useState("");
  const [isListening, setIsListening] = useState(false);

  const [result, setResult] = useState(null);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [paymentLink, setPaymentLink] = useState(null);

  const [paymentPageData, setPaymentPageData] = useState(null);
  const [paymentPageLoading, setPaymentPageLoading] = useState(false);

  const [dashboard, setDashboard] = useState(null);

  const [businessQuery, setBusinessQuery] = useState("");
  const [businessAnswer, setBusinessAnswer] = useState(null);
  const [isBusinessListening, setIsBusinessListening] = useState(false);

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

  const loadDashboard = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/dashboard/summary"
      );

      const data = await response.json();

      setDashboard(data);
    } catch {
      setError("Unable to load dashboard.");
    }
  };

  useEffect(() => {
    if (!isPaymentPage) {
      loadDashboard();
    }
  }, [isPaymentPage]);

  useEffect(() => {
    if (!paymentLinkId) {
      return;
    }

    const loadPaymentDetails = async () => {
      setPaymentPageLoading(true);
      setError("");

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/payment-link/${paymentLinkId}`
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
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
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
      setError(
        "Could not recognize your voice. Please try again."
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
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsBusinessListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      setBusinessQuery(transcript);
    };

    recognition.onerror = () => {
      setError(
        "Could not recognize your business question."
      );
      setIsBusinessListening(false);
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
      const response = await fetch(
        "http://127.0.0.1:8000/voice/parse",
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
      setQuantity(data.quantity.toString());
      setPrice(data.price.toString());
      setGst(data.gst.toString());
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
      const response = await fetch(
        "http://127.0.0.1:8000/invoice/preview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoiceData),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setResult(data);
    } catch {
      setError("Unable to connect to backend.");
    }
  };

  const handleCreate = async () => {
    setError("");
    setPaymentLink(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/invoice/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoiceData),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setCreatedInvoice(data);

      await loadDashboard();
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
        "http://127.0.0.1:8000/payment-link/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invoice_id: createdInvoice.invoice_id,
            customer: createdInvoice.customer,
            amount: createdInvoice.total,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setPaymentLink(data);
    } catch {
      setError("Unable to generate payment link.");
    }
  };

  const handleMockPayment = async () => {
    setError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/payment-link/${paymentLinkId}/pay`,
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
      setError("Enter a business question.");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/business/query",
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
        setError(data.error);
        return;
      }

      setBusinessAnswer(data);
    } catch {
      setError("Unable to process business query.");
    }
  };

  if (isPaymentPage) {
    return (
      <div>
        <h1>VoicePay Payment</h1>

        <p>Demo payment page for Razorpay mock mode.</p>

        {paymentPageLoading && <p>Loading payment details...</p>}

        {error && (
          <p style={{ color: "red" }}>
            ❌ {error}
          </p>
        )}

        {paymentPageData && (
          <div>
            <h2>Payment Request</h2>

            <p>
              Payment Link ID:{" "}
              <strong>{paymentPageData.payment_link_id}</strong>
            </p>

            <p>
              Customer:{" "}
              <strong>{paymentPageData.customer}</strong>
            </p>

            <p>
              Amount:{" "}
              <strong>₹{paymentPageData.amount}</strong>
            </p>

            {paymentPageData.payment_status === "pending" ? (
              <>
                <p>
                  Status: <strong>Pending</strong>
                </p>

                <button onClick={handleMockPayment}>
                  💳 Pay Now
                </button>

                <p>
                  ⚠️ Demo mode — no real money will be charged.
                </p>
              </>
            ) : (
              <>
                <h2>✅ Payment Successful</h2>

                <p>
                  Status: <strong>Paid</strong>
                </p>

                <p>
                  Payment has been recorded in VoicePay AI.
                </p>

                <p>No real money was charged.</p>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1>VoicePay AI</h1>

      <p>
        Voice assistant for invoices, payments and business insights.
      </p>

      <hr />

      <h2>Business Dashboard</h2>

      {dashboard ? (
        <div>
          <p>
            Total Invoices:{" "}
            <strong>{dashboard.total_invoices}</strong>
          </p>

          <p>
            Paid Invoices:{" "}
            <strong>{dashboard.paid_invoices}</strong>
          </p>

          <p>
            Pending Invoices:{" "}
            <strong>{dashboard.pending_invoices}</strong>
          </p>

          <p>
            Total Collected:{" "}
            <strong>₹{dashboard.total_collected}</strong>
          </p>

          <p>
            Pending Amount:{" "}
            <strong>₹{dashboard.pending_amount}</strong>
          </p>
        </div>
      ) : (
        <p>Loading dashboard...</p>
      )}

      <hr />

      <h2>Ask About Your Business</h2>

      <button onClick={startBusinessListening}>
        {isBusinessListening
          ? "🎤 Listening..."
          : "🎤 Ask by Voice"}
      </button>

      <br />
      <br />

      <input
        type="text"
        placeholder="Try: Who hasn't paid me?"
        value={businessQuery}
        onChange={(e) => setBusinessQuery(e.target.value)}
        style={{ width: "500px" }}
      />

      <br />
      <br />

      <button onClick={handleBusinessQuery}>
        Ask VoicePay
      </button>

      {businessAnswer && (
        <div>
          <h3>VoicePay Answer</h3>

          <p>
            <strong>{businessAnswer.answer}</strong>
          </p>

          {businessAnswer.invoices &&
            businessAnswer.invoices.length > 0 && (
              <div>
                <h4>Pending Invoices</h4>

                {businessAnswer.invoices.map((invoice) => (
                  <div key={invoice.invoice_id}>
                    <p>
                      {invoice.customer} — ₹{invoice.total} —{" "}
                      {invoice.payment_status}
                    </p>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}

      <hr />

      <h2>Voice Invoice Command</h2>

      <button onClick={startListening}>
        {isListening
          ? "🎤 Listening..."
          : "🎤 Start Voice Command"}
      </button>

      <br />
      <br />

      <input
        type="text"
        placeholder="Try: Create invoice for Arun, 2 notebooks at 100 rupees GST 18"
        value={voiceText}
        onChange={(e) => setVoiceText(e.target.value)}
        style={{ width: "500px" }}
      />

      <br />
      <br />

      <button onClick={handleVoiceCommand}>
        ✨ Process Command
      </button>

      <hr />

      <h2>Create Invoice</h2>

      <input
        type="text"
        placeholder="Customer Name"
        value={customer}
        onChange={(e) => setCustomer(e.target.value)}
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="Product Name"
        value={product}
        onChange={(e) => setProduct(e.target.value)}
      />

      <br />
      <br />

      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      <br />
      <br />

      <input
        type="number"
        placeholder="Price per item"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <br />
      <br />

      <input
        type="number"
        placeholder="GST %"
        value={gst}
        onChange={(e) => setGst(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handlePreview}>
        Preview Invoice
      </button>

      {error && (
        <p style={{ color: "red" }}>
          ❌ {error}
        </p>
      )}

      {result && (
        <div>
          <h3>Invoice Preview</h3>

          <p>Customer: {result.customer}</p>
          <p>Product: {result.product}</p>
          <p>Quantity: {result.quantity}</p>
          <p>Price: ₹{result.price}</p>
          <p>Subtotal: ₹{result.subtotal}</p>
          <p>GST: ₹{result.gst_amount}</p>

          <p>
            <strong>Total: ₹{result.total}</strong>
          </p>

          <button onClick={handleCreate}>
            Confirm & Create Invoice
          </button>
        </div>
      )}

      {createdInvoice && (
        <div>
          <h3>✅ Invoice Created</h3>

          <p>Invoice ID: {createdInvoice.invoice_id}</p>
          <p>Customer: {createdInvoice.customer}</p>
          <p>Total: ₹{createdInvoice.total}</p>
          <p>Payment Status: {createdInvoice.payment_status}</p>

          <button onClick={handleGeneratePaymentLink}>
            Generate Payment Link
          </button>
        </div>
      )}

      {paymentLink && (
        <div>
          <h3>💳 Payment Link Created</h3>

          <p>
            Payment Link ID: {paymentLink.payment_link_id}
          </p>

          <p>Amount: ₹{paymentLink.amount}</p>
          <p>Status: {paymentLink.payment_status}</p>
          <p>Provider: {paymentLink.provider}</p>

          <a
            href={paymentLink.payment_url}
            target="_blank"
            rel="noreferrer"
          >
            Open Payment Link
          </a>
        </div>
      )}
    </div>
  );
}

export default App;