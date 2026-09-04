function App() {
  return (
    <div>
      <h1>VoicePay AI</h1>
      <p>Multilingual voice assistant for invoices and payments.</p>

      <button>🎤 Start Voice Command</button>

      <h2>Create Invoice</h2>

      <input type="text" placeholder="Customer Name" />
      <br /><br />

      <input type="text" placeholder="Product Name" />
      <br /><br />

      <input type="number" placeholder="Quantity" />
      <br /><br />

      <input type="number" placeholder="Price per item" />
      <br /><br />

      <input type="number" placeholder="GST %" />
      <br /><br />

      <button>Create Invoice</button>
    </div>
  );
}

export default App;