import { useState } from "react";

function App() {
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [gst, setGst] = useState("");

  const subtotal = Number(quantity || 0) * Number(price || 0);
  const gstAmount = subtotal * (Number(gst || 0) / 100);
  const total = subtotal + gstAmount;

  return (
    <div>
      <h1>VoicePay AI</h1>
      <p>Multilingual voice assistant for invoices and payments.</p>

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

      <h3>Invoice Preview</h3>
      <p>Customer: {customer || "-"}</p>
      <p>Product: {product || "-"}</p>
      <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
      <p>GST: ₹{gstAmount.toFixed(2)}</p>
      <p><strong>Total: ₹{total.toFixed(2)}</strong></p>

      <button>Create Invoice</button>
    </div>
  );
}

export default App;