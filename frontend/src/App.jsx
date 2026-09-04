import { useState } from "react";

function App() {
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [gst, setGst] = useState("");
  const [result, setResult] = useState(null);

  const handleConfirm = async () => {
    const response = await fetch("http://127.0.0.1:8000/invoice/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer,
        product,
        quantity: Number(quantity),
        price: Number(price),
        gst: Number(gst),
      }),
    });

    const data = await response.json();
    setResult(data);
  };

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

      <button onClick={handleConfirm}>
        Confirm Invoice
      </button>

      {result && (
        <div>
          <h3>Invoice Preview</h3>
          <p>Customer: {result.customer}</p>
          <p>Product: {result.product}</p>
          <p>Subtotal: ₹{result.subtotal}</p>
          <p>GST: ₹{result.gst_amount}</p>
          <p><strong>Total: ₹{result.total}</strong></p>
          <p>✅ Backend status: {result.status}</p>
        </div>
      )}
    </div>
  );
}

export default App;