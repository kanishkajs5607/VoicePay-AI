from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="VoicePay AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class InvoiceData(BaseModel):
    customer: str
    product: str
    quantity: int
    price: float
    gst: float


@app.get("/")
def home():
    return {"message": "VoicePay AI backend is running"}


@app.post("/invoice/preview")
def preview_invoice(invoice: InvoiceData):
    subtotal = invoice.quantity * invoice.price
    gst_amount = subtotal * (invoice.gst / 100)
    total = subtotal + gst_amount

    return {
        "customer": invoice.customer,
        "product": invoice.product,
        "subtotal": subtotal,
        "gst_amount": gst_amount,
        "total": total,
        "status": "ready_for_confirmation"
    }