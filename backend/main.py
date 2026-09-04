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


# -------------------------
# DATA MODELS
# -------------------------

class InvoiceData(BaseModel):
    customer: str
    product: str
    quantity: int
    price: float
    gst: float


class VoiceCommand(BaseModel):
    text: str


# -------------------------
# HOME
# -------------------------

@app.get("/")
def home():
    return {
        "message": "VoicePay AI backend is running"
    }


# -------------------------
# VALIDATION
# -------------------------

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


# -------------------------
# INVOICE PREVIEW
# -------------------------

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


# -------------------------
# CREATE INVOICE
# -------------------------

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


# -------------------------
# NATURAL LANGUAGE COMMAND
# -------------------------

@app.post("/voice/parse")
def parse_voice_command(command: VoiceCommand):

    text = command.text.strip()

    if not text:
        return {
            "error": "Voice command is empty"
        }

    pattern = (
        r"(?:create invoice for|invoice for)\s+"
        r"([A-Za-z]+).*?"
        r"(\d+)\s+([A-Za-z]+).*?"
        r"(?:at|for)\s+(\d+(?:\.\d+)?)"
        r".*?(?:gst)\s*(\d+(?:\.\d+)?)"
    )

    match = re.search(
        pattern,
        text,
        re.IGNORECASE
    )

    if not match:
        return {
            "error": "Could not understand the command",
            "example": (
                "Create invoice for Arun, "
                "2 notebooks at 100 rupees GST 18"
            )
        }

    customer = match.group(1)

    quantity = int(
        match.group(2)
    )

    product = match.group(3)

    price = float(
        match.group(4)
    )

    gst = float(
        match.group(5)
    )

    return {
        "intent": "create_invoice",
        "customer": customer,
        "product": product,
        "quantity": quantity,
        "price": price,
        "gst": gst,
        "status": "parsed"
    }