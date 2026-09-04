import { useState } from "react";

function App() {
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [gst, setGst] = useState("");

  const [result, setResult] = useState(null);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [error, setError] = useState("");

  const invoiceData = {
    customer,
    product,
    quantity: Number(quantity),
    price: Number(price),
    gst: Number(gst),
  };

  const handlePreview = async () => {
    setError("");
    setResult(null);
    setCreatedInvoice(null);

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

  return (
    <div>
      <h1>VoicePay AI</h1>

      <p>
        Multilingual voice assistant for invoices and payments.
      </p>

      <button>🎤 Start Voice Command</button>

      <h2>Create Invoice</h2>

      <input
        type="text"
        placeholder="Customer Name"
        value={customer}
        onChange={(e) => setCustomer(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Product Name"
        value={product}
        onChange={(e) => setProduct(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        placeholder="Price per item"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        placeholder="GST %"
        value={gst}
        onChange={(e) => setGst(e.target.value)}
      />

      <br /><br />

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
        </div>
      )}
    </div>
  );
}

export default App;