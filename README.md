# 🎙️ VoicePay AI

> **From voice to invoice in one command.**

VoicePay AI is a multilingual voice-powered payment assistant designed for small merchants. It enables merchants to create invoices, generate payment requests, track collections, check pending payments, and query transaction information using simple voice or text commands.

## 🚀 Problem

Small merchants often spend significant time manually creating invoices, tracking customer payments, and checking pending collections.

VoicePay AI simplifies this process through a voice-first interface that allows merchants to manage basic payment workflows by simply speaking.

## 💡 How VoicePay Works

A merchant can say:

**English**
> "Create invoice for Arun Kumar 2 water bottles at 50 rupees GST 18 percent"

**Tamil**
> "கணேஷுக்கு நாலு பாட்டில் ₹40 ஜிஎஸ்டி 12%"

VoicePay extracts the transaction details and prepares an invoice for the merchant to review.

### Workflow

Voice / Text Command  
↓  
Speech Recognition  
↓  
Transaction Parsing  
↓  
Customer + Product + Quantity + Price + GST  
↓  
Invoice Preview  
↓  
Invoice Creation  
↓  
Payment Link  
↓  
Payment Tracking & Dashboard

## ✨ Key Features

- 🎙️ Voice-based invoice creation
- 🌐 English and Tamil voice support
- 🇮🇳 Complete English/Tamil interface switching
- 🧾 Automatic invoice generation
- ✏️ Invoice review and editing
- 💳 Payment-link generation
- ✅ Demo payment simulation
- 📊 Merchant dashboard
- 💰 Collection and pending-payment tracking
- 🔔 Customer payment reminders
- 🔍 Natural-language business queries
- 📜 Activity and audit history

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- Web Speech API

### Backend
- Python
- FastAPI
- SQLite
- REST API

### Deployment
- Netlify — Frontend
- Render — Backend

## 📊 Merchant Dashboard

The VoicePay merchant dashboard provides:

- Total amount collected
- Pending amount
- Number of paid invoices
- Number of pending invoices
- Pending customer payments
- Payment reminders
- Business queries
- Activity history

## 🔍 Business Queries

Merchants can ask questions about their payment data.

Example:

> "Who hasn't paid me?"

Tamil:

> "யார் இன்னும் பணம் கொடுக்கவில்லை?"

VoicePay checks the stored transaction information and provides the corresponding result.

## 💳 Payment Demo

The current prototype uses a **mock payment workflow** for demonstration purposes.

- No real money is charged.
- No real customer payment is processed.
- Payment status changes are simulated.
- Razorpay API integration can be added for production deployment.

## 📁 Project Structure

    VoicePay-AI/
    │
    ├── backend/
    │   └── main.py
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── App.jsx
    │   │   └── App.css
    │   └── ...
    │
    ├── .gitignore
    └── README.md

## ▶️ Run Locally

### Backend

    cd backend
    .\venv\Scripts\Activate.ps1
    uvicorn main:app --reload

Backend runs at:

    http://127.0.0.1:8000

### Frontend

Open another terminal:

    cd frontend
    npm run dev

Frontend normally runs at:

    http://localhost:5173

## 🌐 Multilingual Experience

VoicePay currently supports:

- **English**
- **Tamil**

Changing the language updates the interface and the speech-recognition language, providing a more accessible experience for Tamil-speaking merchants.

## 🏆 Razorpay AI Buildathon 2026

VoicePay AI was developed as a prototype for the **Razorpay AI Buildathon 2026 — Open Track**.

The project explores how voice-first interfaces can make digital payment workflows simpler and more accessible for small merchants.

## 🔮 Future Scope

- Full Razorpay API integration
- More Indian languages
- Advanced NLP-based command understanding
- WhatsApp/SMS payment reminders
- Sales analytics
- Cloud database integration
- Production authentication and security

## 👩‍💻 Developer

**Kanishka J S**  
B.E. Electronics and Communication Engineering

---

## 🎙️ VoicePay AI

### Speak. Invoice. Collect.
