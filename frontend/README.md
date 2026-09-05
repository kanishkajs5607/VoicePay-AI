# 🎙️ VoicePay AI

**VoicePay AI** is a multilingual voice-powered payment assistant designed for small merchants.

It allows merchants to create invoices, generate payment requests, track collections, check pending payments, and query their transaction data using simple voice or text commands.

> **From voice to invoice in one command.**

---

## 🚀 Problem

Small merchants often spend time manually creating invoices, tracking customer payments, and checking pending collections.

Traditional payment dashboards can also be difficult to use quickly while managing customers.

VoicePay AI simplifies this workflow by allowing merchants to interact with their payment system using natural voice commands.

---

## 💡 Solution

A merchant can simply say:

> "Create invoice for Arun Kumar 2 water bottles at 50 rupees GST 18 percent"

or use Tamil:

> "கணேஷுக்கு நாலு பாட்டில் ₹40 ஜிஎஸ்டி 12%"

VoicePay processes the command, extracts the transaction details, prepares an invoice, and allows the merchant to generate a payment link.

---

## ✨ Features

- 🎙️ Voice-based invoice creation
- 🌐 English and Tamil voice support
- 🇮🇳 Complete English/Tamil UI switching
- 🧾 Automatic invoice generation
- ✏️ Invoice review and editing
- 💳 Payment link generation
- ✅ Demo payment simulation
- 📊 Merchant dashboard
- 💰 Collection and pending-payment tracking
- 🔍 Natural-language business queries
- 🔔 Customer payment reminders
- 📜 Activity and audit history

---

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

---

## 🧠 How It Works

```text
Merchant Voice / Text
        ↓
Browser Speech Recognition
        ↓
Transaction Command
        ↓
FastAPI Backend
        ↓
Rule-Based Entity Extraction
        ↓
Customer + Product + Quantity + Price + GST
        ↓
Invoice Preview
        ↓
Invoice Creation
        ↓
Payment Link
        ↓
Payment Status & Dashboard