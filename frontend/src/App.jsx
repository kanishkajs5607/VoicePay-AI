import { useState } from "react";

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
  const [error, setError] = useState("");

  const currentPath = window.location.pathname;

  const invoiceData = {
    customer,
    product,
    quantity: Number(quantity),
    price: Number(price),
    gst: Number(gst),
  };

  const startListening = () => {
    setError("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
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
      setError("Could not recognize your voice. Please try again.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      setError("Unable to generate payment link.");
    }
  };

  if (currentPath.startsWith("/pay/")) {
    const paymentLinkId = currentPath.split("/pay/")[1];

    return (
      <div>
        <h1>VoicePay Payment</h1>

        <p>
          Demo payment page for Razorpay mock mode.
        </p>

        <h2>Payment Request</h2>

        <p>
          Payment Link ID: {paymentLinkId}
        </p>

        <p>
          Status: Pending
        </p>

        <button>
          💳 Pay Now
        </button>

        <br />
        <br />

        <p>
          ⚠️ Demo mode — no real money will be charged.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1>VoicePay AI</h1>

      <p>
        Multilingual voice assistant for invoices and payments.
      </p>

      <h2>AI Voice Command</h2>

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

          <p>
            Invoice ID: {createdInvoice.invoice_id}
          </p>

          <p>
            Customer: {createdInvoice.customer}
          </p>

          <p>
            Total: ₹{createdInvoice.total}
          </p>

          <p>
            Payment Status: {createdInvoice.payment_status}
          </p>

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

          <p>
            Amount: ₹{paymentLink.amount}
          </p>

          <p>
            Status: {paymentLink.payment_status}
          </p>

          <p>
            Provider: {paymentLink.provider}
          </p>

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