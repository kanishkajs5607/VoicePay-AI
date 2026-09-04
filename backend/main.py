from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import uuid
import re
import sqlite3


app = FastAPI(title="VoicePay AI Backend")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# DATABASE
# --------------------------------------------------

DATABASE = "voicepay.db"


def get_db_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def create_tables():
    connection = get_db_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS invoices (
            invoice_id TEXT PRIMARY KEY,
            customer TEXT NOT NULL,
            product TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            gst REAL NOT NULL,
            total REAL NOT NULL,
            created_at TEXT NOT NULL,
            payment_status TEXT NOT NULL
        )
        """
    )

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS payment_links (
            payment_link_id TEXT PRIMARY KEY,
            invoice_id TEXT NOT NULL,
            customer TEXT NOT NULL,
            amount REAL NOT NULL,
            payment_status TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

    connection.commit()
    connection.close()


create_tables()


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


class BusinessQuery(BaseModel):
    text: str


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "VoicePay AI backend is running"
    }


# --------------------------------------------------
# VALIDATION
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
        return {"error": error}

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
# CREATE AND SAVE INVOICE
# --------------------------------------------------

@app.post("/invoice/create")
def create_invoice(invoice: InvoiceData):

    error = validate_invoice(invoice)

    if error:
        return {"error": error}

    subtotal = invoice.quantity * invoice.price
    gst_amount = subtotal * (invoice.gst / 100)
    total = subtotal + gst_amount

    invoice_id = "INV-" + str(uuid.uuid4())[:8].upper()
    created_at = datetime.now().isoformat()

    connection = get_db_connection()

    connection.execute(
        """
        INSERT INTO invoices (
            invoice_id,
            customer,
            product,
            quantity,
            price,
            gst,
            total,
            created_at,
            payment_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            invoice_id,
            invoice.customer,
            invoice.product,
            invoice.quantity,
            invoice.price,
            invoice.gst,
            total,
            created_at,
            "pending"
        )
    )

    connection.commit()
    connection.close()

    return {
        "invoice_id": invoice_id,
        "customer": invoice.customer,
        "product": invoice.product,
        "quantity": invoice.quantity,
        "price": invoice.price,
        "gst": invoice.gst,
        "total": total,
        "created_at": created_at,
        "payment_status": "pending",
        "status": "invoice_created"
    }


# --------------------------------------------------
# GET ALL INVOICES
# --------------------------------------------------

@app.get("/invoices")
def get_invoices():

    connection = get_db_connection()

    invoices = connection.execute(
        """
        SELECT *
        FROM invoices
        ORDER BY created_at DESC
        """
    ).fetchall()

    connection.close()

    return {
        "invoices": [dict(invoice) for invoice in invoices]
    }


# --------------------------------------------------
# DASHBOARD SUMMARY
# --------------------------------------------------

@app.get("/dashboard/summary")
def dashboard_summary():

    connection = get_db_connection()

    total_invoices = connection.execute(
        "SELECT COUNT(*) AS count FROM invoices"
    ).fetchone()["count"]

    paid_invoices = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM invoices
        WHERE payment_status = 'paid'
        """
    ).fetchone()["count"]

    pending_invoices = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM invoices
        WHERE payment_status = 'pending'
        """
    ).fetchone()["count"]

    total_collected = connection.execute(
        """
        SELECT COALESCE(SUM(total), 0) AS amount
        FROM invoices
        WHERE payment_status = 'paid'
        """
    ).fetchone()["amount"]

    pending_amount = connection.execute(
        """
        SELECT COALESCE(SUM(total), 0) AS amount
        FROM invoices
        WHERE payment_status = 'pending'
        """
    ).fetchone()["amount"]

    connection.close()

    return {
        "total_invoices": total_invoices,
        "paid_invoices": paid_invoices,
        "pending_invoices": pending_invoices,
        "total_collected": total_collected,
        "pending_amount": pending_amount
    }


# --------------------------------------------------
# BUSINESS QUERY
# --------------------------------------------------

@app.post("/business/query")
def business_query(query: BusinessQuery):

    text = query.text.strip().lower()

    if not text:
        return {
            "error": "Query cannot be empty"
        }

    connection = get_db_connection()

    pending_phrases = [
        "who hasn't paid",
        "who has not paid",
        "who havent paid",
        "who hasn't paid me",
        "pending invoices",
        "show pending invoices",
        "unpaid invoices",
        "who owes me"
    ]

    if any(phrase in text for phrase in pending_phrases):

        invoices = connection.execute(
            """
            SELECT
                invoice_id,
                customer,
                product,
                total,
                payment_status
            FROM invoices
            WHERE payment_status = 'pending'
            ORDER BY created_at DESC
            """
        ).fetchall()

        connection.close()

        pending_list = [dict(invoice) for invoice in invoices]

        if not pending_list:
            return {
                "intent": "pending_invoices",
                "answer": "You have no pending invoices.",
                "invoices": []
            }

        total_pending = sum(
            invoice["total"]
            for invoice in pending_list
        )

        customers = ", ".join(
            invoice["customer"]
            for invoice in pending_list
        )

        return {
            "intent": "pending_invoices",
            "answer": (
                f"{len(pending_list)} invoice(s) are pending "
                f"from {customers}. "
                f"Total pending amount is ₹{total_pending:.2f}."
            ),
            "invoices": pending_list
        }

    collection_phrases = [
        "how much did i collect",
        "how much have i collected",
        "total collected",
        "money collected",
        "how much money did i collect",
        "how much money have i collected",
        "what did i collect"
    ]

    if any(phrase in text for phrase in collection_phrases):

        result = connection.execute(
            """
            SELECT
                COUNT(*) AS paid_count,
                COALESCE(SUM(total), 0) AS collected
            FROM invoices
            WHERE payment_status = 'paid'
            """
        ).fetchone()

        connection.close()

        paid_count = result["paid_count"]
        collected = result["collected"]

        return {
            "intent": "total_collected",
            "answer": (
                f"You have collected ₹{collected:.2f} "
                f"from {paid_count} paid invoice(s)."
            ),
            "total_collected": collected,
            "paid_invoices": paid_count
        }

    connection.close()

    return {
        "error": "I don't understand that business query yet.",
        "examples": [
            "Who hasn't paid me?",
            "How much did I collect?"
        ]
    }


# --------------------------------------------------
# VOICE COMMAND PARSER
# --------------------------------------------------

@app.post("/voice/parse")
def parse_voice_command(command: VoiceCommand):

    original_text = command.text.strip()

    if not original_text:
        return {
            "error": "Voice command is empty"
        }

    text = original_text.lower()

    text = (
        text
        .replace(",", " ")
        .replace("₹", " ")
        .replace("%", " ")
        .replace("rupees", " ")
        .replace("rupee", " ")
        .replace("rs.", " ")
        .replace("rs", " ")
        .replace("percentage", " ")
        .replace("percent", " ")
    )

    text = re.sub(r"\s+", " ", text).strip()

    text = re.sub(
        r"^(please\s+)?(create\s+)?(?:an?\s+)?invoice\s+for\s+",
        "",
        text,
        flags=re.IGNORECASE
    )

    customer_match = re.match(
        r"([a-z]+)",
        text,
        re.IGNORECASE
    )

    if not customer_match:
        return {
            "error": "Could not identify customer name",
            "heard": original_text
        }

    customer = customer_match.group(1).title()

    remaining = text[customer_match.end():].strip()

    item_match = re.search(
        r"(\d+)\s+([a-z]+)",
        remaining,
        re.IGNORECASE
    )

    if not item_match:
        return {
            "error": "Could not identify quantity and product",
            "heard": original_text
        }

    quantity = int(item_match.group(1))
    product = item_match.group(2)

    remaining_after_item = remaining[item_match.end():].strip()

    gst_match = re.search(
        r"gst\s*(?:of\s*)?(\d+(?:\.\d+)?)",
        remaining_after_item,
        re.IGNORECASE
    )

    if gst_match:
        gst = float(gst_match.group(1))
        price_section = remaining_after_item[:gst_match.start()]

    else:
        gst_reverse_match = re.search(
            r"(\d+(?:\.\d+)?)\s*gst",
            remaining_after_item,
            re.IGNORECASE
        )

        if not gst_reverse_match:
            return {
                "error": "Could not identify GST",
                "heard": original_text
            }

        gst = float(gst_reverse_match.group(1))
        price_section = remaining_after_item[
            :gst_reverse_match.start()
        ]

    price_section = re.sub(
        r"\b(at|for|each|price|cost|costing)\b",
        " ",
        price_section,
        flags=re.IGNORECASE
    )

    price_numbers = re.findall(
        r"\d+(?:\.\d+)?",
        price_section
    )

    if not price_numbers:
        return {
            "error": "Could not identify product price",
            "heard": original_text
        }

    price = float(price_numbers[-1])

    return {
        "intent": "create_invoice",
        "customer": customer,
        "product": product,
        "quantity": quantity,
        "price": price,
        "gst": gst,
        "heard": original_text,
        "status": "parsed"
    }


# --------------------------------------------------
# CREATE PAYMENT LINK
# --------------------------------------------------

@app.post("/payment-link/create")
def create_payment_link(request: PaymentLinkRequest):

    if not request.invoice_id.strip():
        return {"error": "Invoice ID is required"}

    if not request.customer.strip():
        return {"error": "Customer name is required"}

    if request.amount <= 0:
        return {"error": "Payment amount must be greater than 0"}

    connection = get_db_connection()

    invoice = connection.execute(
        """
        SELECT *
        FROM invoices
        WHERE invoice_id = ?
        """,
        (request.invoice_id,)
    ).fetchone()

    if not invoice:
        connection.close()
        return {"error": "Invoice not found"}

    payment_link_id = "plink_" + str(uuid.uuid4())[:10]
    created_at = datetime.now().isoformat()

    connection.execute(
        """
        INSERT INTO payment_links (
            payment_link_id,
            invoice_id,
            customer,
            amount,
            payment_status,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            payment_link_id,
            request.invoice_id,
            request.customer,
            request.amount,
            "pending",
            created_at
        )
    )

    connection.commit()
    connection.close()

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


# --------------------------------------------------
# GET PAYMENT LINK
# --------------------------------------------------

@app.get("/payment-link/{payment_link_id}")
def get_payment_link(payment_link_id: str):

    connection = get_db_connection()

    payment = connection.execute(
        """
        SELECT *
        FROM payment_links
        WHERE payment_link_id = ?
        """,
        (payment_link_id,)
    ).fetchone()

    connection.close()

    if not payment:
        return {"error": "Payment link not found"}

    return dict(payment)


# --------------------------------------------------
# COMPLETE MOCK PAYMENT
# --------------------------------------------------

@app.post("/payment-link/{payment_link_id}/pay")
def complete_mock_payment(payment_link_id: str):

    connection = get_db_connection()

    payment = connection.execute(
        """
        SELECT *
        FROM payment_links
        WHERE payment_link_id = ?
        """,
        (payment_link_id,)
    ).fetchone()

    if not payment:
        connection.close()
        return {"error": "Payment link not found"}

    connection.execute(
        """
        UPDATE payment_links
        SET payment_status = 'paid'
        WHERE payment_link_id = ?
        """,
        (payment_link_id,)
    )

    connection.execute(
        """
        UPDATE invoices
        SET payment_status = 'paid'
        WHERE invoice_id = ?
        """,
        (payment["invoice_id"],)
    )

    connection.commit()
    connection.close()

    return {
        "payment_link_id": payment_link_id,
        "invoice_id": payment["invoice_id"],
        "amount": payment["amount"],
        "payment_status": "paid",
        "status": "payment_successful",
        "mock_mode": True
    }