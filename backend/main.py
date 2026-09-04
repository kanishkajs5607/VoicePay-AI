from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="VoicePay AI Backend")

# Allow React frontend to communicate with FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Invoice data structure
class InvoiceData(BaseModel):
    customer: str
    product: str
    quantity: int
    price: float
    gst: float


# Home route
@app.get("/")
def home():
    return {"message": "VoicePay AI backend is running"}


# Invoice preview route
@app.post("/invoice/preview")
def preview_invoice(invoice: InvoiceData):

    # Validation
    if not invoice.customer.strip():
        return {"error": "Customer name is required"}

    if not invoice.product.strip():
        return {"error": "Product name is required"}

    if invoice.quantity <= 0:
        return {"error": "Quantity must be greater than 0"}

    if invoice.price <= 0:
        return {"error": "Price must be greater than 0"}

    if invoice.gst < 0:
        return {"error": "GST cannot be negative"}

    # Invoice calculation
    subtotal = invoice.quantity * invoice.price
    gst_amount = subtotal * (invoice.gst / 100)
    total = subtotal + gst_amount

    # Send result back to frontend
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