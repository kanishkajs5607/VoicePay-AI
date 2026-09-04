from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import uuid
import re


app = FastAPI(title="VoicePay AI Backend")


# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# DATA MODELS
# --------------------------------------------------

class InvoiceData(BaseModel):
    customer: str
    product: str
    quantity: int
    price: float
    gst: float


class VoiceCommand(BaseModel):
    text: str


class PaymentLinkRequest(BaseModel):
    invoice_id: str
    customer: str
    amount: float


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "VoicePay AI backend is running"
    }


# --------------------------------------------------
# INVOICE VALIDATION
# --------------------------------------------------

def validate_invoice(invoice: InvoiceData):

    if not invoice.customer.strip():
        return "Customer name is required"

    if not invoice.product.strip():
        return "Product name is required"

    if invoice.quantity <= 0:
        return "Quantity must be greater than 0"

    if invoice.price <= 0:
        return "Price must be greater than 0"

    if invoice.gst < 0:
        return "GST cannot be negative"

    return None


# --------------------------------------------------
# INVOICE PREVIEW
# --------------------------------------------------

@app.post("/invoice/preview")
def preview_invoice(invoice: InvoiceData):

    error = validate_invoice(invoice)

    if error:
        return {
            "error": error
        }

    subtotal = invoice.quantity * invoice.price
    gst_amount = subtotal * (invoice.gst / 100)
    total = subtotal + gst_amount

    return {
        "customer": invoice.customer,
        "product": invoice.product,
        "quantity": invoice.quantity,
        "price": invoice.price,
        "gst": invoice.gst,
        "subtotal": subtotal,
        "gst_amount": gst_amount,
        "total": total,
        "status": "ready_for_confirmation"
    }


# --------------------------------------------------
# CREATE INVOICE
# --------------------------------------------------

@app.post("/invoice/create")
def create_invoice(invoice: InvoiceData):

    error = validate_invoice(invoice)

    if error:
        return {
            "error": error
        }

    subtotal = invoice.quantity * invoice.price
    gst_amount = subtotal * (invoice.gst / 100)
    total = subtotal + gst_amount

    invoice_id = "INV-" + str(uuid.uuid4())[:8].upper()

    return {
        "invoice_id": invoice_id,
        "customer": invoice.customer,
        "product": invoice.product,
        "quantity": invoice.quantity,
        "price": invoice.price,
        "gst": invoice.gst,
        "total": total,
        "created_at": datetime.now().isoformat(),
        "payment_status": "pending",
        "status": "invoice_created"
    }


# --------------------------------------------------
# NATURAL LANGUAGE / VOICE COMMAND PARSER
# --------------------------------------------------

@app.post("/voice/parse")
def parse_voice_command(command: VoiceCommand):

    text = command.text.strip()

    if not text:
        return {
            "error": "Voice command is empty"
        }

    cleaned_text = (
        text.lower()
        .replace(",", " ")
        .replace(".", " ")
        .replace("₹", "")
        .replace("rupees", "")
        .replace("rupee", "")
        .replace("rs.", "")
        .replace("rs", "")
        .replace("percentage", "")
        .replace("percent", "")
    )

    cleaned_text = re.sub(
        r"\s+",
        " ",
        cleaned_text
    ).strip()

    pattern = (
        r"(?:create\s+invoice\s+for|invoice\s+for)\s+"
        r"([a-z]+).*?"
        r"(\d+)\s+([a-z]+).*?"
        r"(?:at|for)\s+(\d+(?:\.\d+)?)"
        r".*?gst\s*(\d+(?:\.\d+)?)"
    )

    match = re.search(
        pattern,
        cleaned_text,
        re.IGNORECASE
    )

    if not match:
        return {
            "error": "Could not understand the voice command",
            "heard": text,
            "example": (
                "Create invoice for Arun, "
                "2 notebooks at 100 rupees GST 18"
            )
        }

    customer = match.group(1).title()
    quantity = int(match.group(2))
    product = match.group(3)
    price = float(match.group(4))
    gst = float(match.group(5))

    return {
        "intent": "create_invoice",
        "customer": customer,
        "product": product,
        "quantity": quantity,
        "price": price,
        "gst": gst,
        "status": "parsed"
    }


# --------------------------------------------------
# MOCK RAZORPAY PAYMENT LINK
# --------------------------------------------------

@app.post("/payment-link/create")
def create_payment_link(request: PaymentLinkRequest):

    if not request.invoice_id.strip():
        return {
            "error": "Invoice ID is required"
        }

    if not request.customer.strip():
        return {
            "error": "Customer name is required"
        }

    if request.amount <= 0:
        return {
            "error": "Payment amount must be greater than 0"
        }

    payment_link_id = (
        "plink_" + str(uuid.uuid4())[:10]
    )

    mock_payment_url = (
        f"http://localhost:5173/pay/{payment_link_id}"
    )

    return {
        "payment_link_id": payment_link_id,
        "invoice_id": request.invoice_id,
        "customer": request.customer,
        "amount": request.amount,
        "payment_url": mock_payment_url,
        "payment_status": "pending",
        "provider": "razorpay_mock",
        "mock_mode": True,
        "status": "payment_link_created"
    }