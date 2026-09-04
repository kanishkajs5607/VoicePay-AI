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


DATABASE = "voicepay.db"


# --------------------------------------------------
# DATABASE
# --------------------------------------------------

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

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            details TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

    connection.commit()
    connection.close()


def add_audit_log(action, details):
    connection = get_db_connection()

    connection.execute(
        """
        INSERT INTO audit_logs (
            action,
            details,
            created_at
        )
        VALUES (?, ?, ?)
        """,
        (
            action,
            details,
            datetime.now().isoformat()
        )
    )

    connection.commit()
    connection.close()


create_tables()


# --------------------------------------------------
# MODELS
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


class BusinessQuery(BaseModel):
    text: str


class ReminderRequest(BaseModel):
    invoice_id: str


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
# CREATE INVOICE
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

    add_audit_log(
        "invoice_created",
        (
            f"Invoice {invoice_id} created for "
            f"{invoice.customer} for ₹{total:.2f}"
        )
    )

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
# GET INVOICES
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
# DASHBOARD
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

    original_text = query.text.strip()

    if not original_text:
        return {"error": "Query cannot be empty"}

    text = original_text.lower()

    text = (
        text
        .replace("?", "")
        .replace(".", "")
        .replace(",", "")
        .strip()
    )

    is_tamil = bool(
        re.search(r"[\u0B80-\u0BFF]", original_text)
    )

    connection = get_db_connection()

    english_pending_phrases = [
        "who hasn't paid",
        "who has not paid",
        "who havent paid",
        "who hasn't paid me",
        "pending invoices",
        "show pending invoices",
        "unpaid invoices",
        "who owes me"
    ]

    tamil_pending_phrases = [
        "யார் இன்னும் பணம் கொடுக்கவில்லை",
        "யார் பணம் கொடுக்கவில்லை",
        "யார் இன்னும் பணம் தரவில்லை",
        "யார் பணம் தரவில்லை",
        "யார் இன்னும் கட்டவில்லை",
        "யார் பணம் செலுத்தவில்லை"
    ]

    pending_query = (
        any(
            phrase in text
            for phrase in english_pending_phrases
        )
        or
        any(
            phrase in text
            for phrase in tamil_pending_phrases
        )
    )

    if pending_query:

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

        pending_list = [
            dict(invoice)
            for invoice in invoices
        ]

        total_pending = sum(
            invoice["total"]
            for invoice in pending_list
        )

        if not pending_list:

            if is_tamil:
                answer = "நிலுவையில் எந்த இன்வாய்ஸும் இல்லை."
            else:
                answer = "You have no pending invoices."

        else:

            customers = ", ".join(
                invoice["customer"]
                for invoice in pending_list
            )

            if is_tamil:
                answer = (
                    f"{len(pending_list)} இன்வாய்ஸ் நிலுவையில் உள்ளது. "
                    f"வாடிக்கையாளர்கள்: {customers}. "
                    f"மொத்த நிலுவை தொகை ₹{total_pending:.2f}."
                )
            else:
                answer = (
                    f"{len(pending_list)} invoice(s) are pending "
                    f"from {customers}. "
                    f"Total pending amount is ₹{total_pending:.2f}."
                )

        add_audit_log(
            "business_query",
            f'Asked: "{query.text}"'
        )

        return {
            "intent": "pending_invoices",
            "language": "ta" if is_tamil else "en",
            "answer": answer,
            "invoices": pending_list
        }

    english_collection_phrases = [
        "how much did i collect",
        "how much have i collected",
        "total collected",
        "money collected",
        "how much money did i collect",
        "how much money have i collected",
        "what did i collect"
    ]

    tamil_collection_phrases = [
        "நான் எவ்வளவு பணம் வசூல் செய்தேன்",
        "எவ்வளவு பணம் வசூல் செய்தேன்",
        "நான் எவ்வளவு வசூல் செய்தேன்",
        "எவ்வளவு வசூல் செய்தேன்",
        "மொத்தம் எவ்வளவு வசூல் செய்தேன்",
        "மொத்த வசூல் எவ்வளவு"
    ]

    collection_query = (
        any(
            phrase in text
            for phrase in english_collection_phrases
        )
        or
        any(
            phrase in text
            for phrase in tamil_collection_phrases
        )
    )

    if collection_query:

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

        if is_tamil:
            answer = (
                f"நீங்கள் ₹{collected:.2f} வசூல் செய்துள்ளீர்கள். "
                f"{paid_count} இன்வாய்ஸ் செலுத்தப்பட்டுள்ளது."
            )
        else:
            answer = (
                f"You have collected ₹{collected:.2f} "
                f"from {paid_count} paid invoice(s)."
            )

        add_audit_log(
            "business_query",
            f'Asked: "{query.text}"'
        )

        return {
            "intent": "total_collected",
            "language": "ta" if is_tamil else "en",
            "answer": answer,
            "total_collected": collected,
            "paid_invoices": paid_count
        }

    connection.close()

    if is_tamil:
        return {
            "error": "இந்த கேள்வியை இன்னும் புரிந்துகொள்ள முடியவில்லை.",
            "examples": [
                "யார் இன்னும் பணம் கொடுக்கவில்லை?",
                "நான் எவ்வளவு பணம் வசூல் செய்தேன்?"
            ]
        }

    return {
        "error": "I don't understand that business query yet.",
        "examples": [
            "Who hasn't paid me?",
            "How much did I collect?"
        ]
    }


# --------------------------------------------------
# REMINDER
# --------------------------------------------------

@app.post("/reminder/create")
def create_reminder(request: ReminderRequest):

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

    if invoice["payment_status"] == "paid":
        connection.close()
        return {"error": "This invoice is already paid"}

    payment_link = connection.execute(
        """
        SELECT *
        FROM payment_links
        WHERE invoice_id = ?
        ORDER BY created_at DESC
        LIMIT 1
        """,
        (request.invoice_id,)
    ).fetchone()

    connection.close()

    if payment_link:
        payment_url = (
            f"http://localhost:5173/pay/"
            f"{payment_link['payment_link_id']}"
        )
    else:
        payment_url = "Payment link has not been generated yet."

    message = (
        f"Hi {invoice['customer']}, this is a friendly reminder "
        f"that ₹{invoice['total']:.2f} is pending for invoice "
        f"{invoice['invoice_id']}. "
        f"Payment link: {payment_url}"
    )

    add_audit_log(
        "reminder_created",
        (
            f"Reminder prepared for {invoice['customer']} "
            f"for invoice {invoice['invoice_id']}"
        )
    )

    return {
        "invoice_id": invoice["invoice_id"],
        "customer": invoice["customer"],
        "amount": invoice["total"],
        "message": message,
        "status": "reminder_ready"
    }


# --------------------------------------------------
# TAMIL HELPERS
# --------------------------------------------------

TAMIL_NUMBER_WORDS = {
    "ஒரு": 1,
    "ஒன்று": 1,
    "ஒன்னு": 1,
    "ரெண்டு": 2,
    "இரண்டு": 2,
    "மூன்று": 3,
    "மூணு": 3,
    "நான்கு": 4,
    "நாலு": 4,
    "ஐந்து": 5,
    "அஞ்சு": 5,
    "ஆறு": 6,
    "ஏழு": 7,
    "எட்டு": 8,
    "ஒன்பது": 9,
    "பத்து": 10
}


def contains_tamil(text):
    return bool(
        re.search(r"[\u0B80-\u0BFF]", text)
    )


def tamil_number_to_int(value):

    value = value.strip()

    if value.isdigit():
        return int(value)

    return TAMIL_NUMBER_WORDS.get(value)


def clean_tamil_customer(value):

    value = value.strip(" .,-")

    suffixes = [
        "க்கு",
        "ற்கு",
        "இற்கு"
    ]

    for suffix in suffixes:
        if value.endswith(suffix):
            value = value[:-len(suffix)]
            break

    return value.strip()


def parse_tamil_invoice(original_text):

    text = original_text.strip()

    text = (
        text
        .replace(",", " ")
        .replace(".", " ")
        .replace("₹", " ₹")
        .replace("%", " %")
    )

    text = re.sub(r"\s+", " ", text).strip()

    gst_match = re.search(
        r"(?:ஜிஎஸ்டி|GST)\s*\.?\s*"
        r"(\d+(?:\.\d+)?)\s*%?",
        text,
        re.IGNORECASE
    )

    if not gst_match:
        gst_match = re.search(
            r"(\d+(?:\.\d+)?)\s*%?\s*"
            r"(?:ஜிஎஸ்டி|GST)",
            text,
            re.IGNORECASE
        )

    if not gst_match:
        return {
            "error": "Could not identify GST from Tamil command",
            "heard": original_text
        }

    gst = float(gst_match.group(1))

    before_gst = text[:gst_match.start()].strip()

    price_match = re.search(
        r"₹?\s*(\d+(?:\.\d+)?)\s*"
        r"(?:ரூபாய்|ரூ|rs|rupees?)?\s*$",
        before_gst,
        re.IGNORECASE
    )

    if not price_match:
        return {
            "error": "Could not identify price from Tamil command",
            "heard": original_text
        }

    price = float(price_match.group(1))

    before_price = before_gst[
        :price_match.start()
    ].strip()

    quantity_pattern = (
        r"(ஒரு|ஒன்று|ஒன்னு|ரெண்டு|இரண்டு|"
        r"மூன்று|மூணு|நான்கு|நாலு|ஐந்து|"
        r"அஞ்சு|ஆறு|ஏழு|எட்டு|ஒன்பது|"
        r"பத்து|\d+)"
    )

    item_match = re.search(
        quantity_pattern + r"\s+([^\s]+)",
        before_price
    )

    if not item_match:
        return {
            "error": (
                "Could not identify quantity and "
                "product from Tamil command"
            ),
            "heard": original_text
        }

    quantity_text = item_match.group(1)
    quantity = tamil_number_to_int(quantity_text)

    if quantity is None:
        return {
            "error": "Could not understand Tamil quantity",
            "heard": original_text
        }

    product = item_match.group(2).strip(" .,-")

    customer_section = before_price[
        :item_match.start()
    ].strip()

    customer_section = re.sub(
        r"^(?:இன்வாய்ஸ்|பில்)\s+",
        "",
        customer_section
    )

    customer = clean_tamil_customer(customer_section)

    if not customer:
        return {
            "error": "Could not identify customer from Tamil command",
            "heard": original_text
        }

    add_audit_log(
        "voice_command_parsed",
        f'Tamil voice command: "{original_text}"'
    )

    return {
        "intent": "create_invoice",
        "language": "ta",
        "customer": customer,
        "product": product,
        "quantity": quantity,
        "price": price,
        "gst": gst,
        "heard": original_text,
        "status": "parsed"
    }


# --------------------------------------------------
# VOICE PARSER
# --------------------------------------------------

@app.post("/voice/parse")
def parse_voice_command(command: VoiceCommand):

    original_text = command.text.strip()

    if not original_text:
        return {
            "error": "Voice command is empty"
        }

    if contains_tamil(original_text):
        return parse_tamil_invoice(original_text)

    text = original_text.lower()

    text = (
        text
        .replace(",", " ")
        .replace(".", " ")
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
        r"^(please\s+)?"
        r"(create\s+)?"
        r"(?:an?\s+)?"
        r"invoice\s+for\s+",
        "",
        text,
        flags=re.IGNORECASE
    )

    gst_match = re.search(
        r"\bgst\s*(?:of\s*)?(\d+(?:\.\d+)?)",
        text,
        re.IGNORECASE
    )

    if gst_match:
        gst = float(gst_match.group(1))
        before_gst = text[:gst_match.start()].strip()

    else:
        gst_reverse_match = re.search(
            r"(\d+(?:\.\d+)?)\s*gst\b",
            text,
            re.IGNORECASE
        )

        if not gst_reverse_match:
            return {
                "error": "Could not identify GST",
                "heard": original_text
            }

        gst = float(gst_reverse_match.group(1))

        before_gst = text[
            :gst_reverse_match.start()
        ].strip()

    price_match = re.search(
        r"\b(?:at|for|price|cost|costing)\s+"
        r"(\d+(?:\.\d+)?)\s*$",
        before_gst,
        re.IGNORECASE
    )

    if price_match:
        price = float(price_match.group(1))
        before_price = before_gst[
            :price_match.start()
        ].strip()

    else:
        price_match = re.search(
            r"(\d+(?:\.\d+)?)\s*$",
            before_gst
        )

        if not price_match:
            return {
                "error": "Could not identify product price",
                "heard": original_text
            }

        price = float(price_match.group(1))

        before_price = before_gst[
            :price_match.start()
        ].strip()

    quantity_match = re.search(
        r"\b(\d+)\b",
        before_price
    )

    if not quantity_match:
        return {
            "error": "Could not identify quantity",
            "heard": original_text
        }

    quantity = int(quantity_match.group(1))

    customer_text = before_price[
        :quantity_match.start()
    ].strip()

    product_text = before_price[
        quantity_match.end():
    ].strip()

    customer_text = re.sub(
        r"\b(for|to)\s*$",
        "",
        customer_text,
        flags=re.IGNORECASE
    ).strip()

    product_text = re.sub(
        r"^(of\s+)",
        "",
        product_text,
        flags=re.IGNORECASE
    ).strip()

    if not customer_text:
        return {
            "error": "Could not identify customer name",
            "heard": original_text
        }

    if not product_text:
        return {
            "error": "Could not identify product",
            "heard": original_text
        }

    customer = customer_text.title()
    product = product_text

    add_audit_log(
        "voice_command_parsed",
        f'Voice command: "{original_text}"'
    )

    return {
        "intent": "create_invoice",
        "language": "en",
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
        return {
            "error": "Invoice ID is required"
        }

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

        return {
            "error": "Invoice not found"
        }

    customer = invoice["customer"]
    amount = invoice["total"]

    payment_link_id = (
        "plink_"
        + str(uuid.uuid4())[:10]
    )

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
            customer,
            amount,
            "pending",
            created_at
        )
    )

    connection.commit()
    connection.close()

    mock_payment_url = (
        f"http://localhost:5173/pay/"
        f"{payment_link_id}"
    )

    add_audit_log(
        "payment_link_created",
        (
            f"Payment link {payment_link_id} created "
            f"for invoice {request.invoice_id} "
            f"for ₹{amount:.2f}"
        )
    )

    return {
        "payment_link_id": payment_link_id,
        "invoice_id": request.invoice_id,
        "customer": customer,
        "amount": amount,
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
        return {
            "error": "Payment link not found"
        }

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

        return {
            "error": "Payment link not found"
        }

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

    add_audit_log(
        "payment_completed",
        (
            f"Payment of ₹{payment['amount']:.2f} completed "
            f"for invoice {payment['invoice_id']}"
        )
    )

    return {
        "payment_link_id": payment_link_id,
        "invoice_id": payment["invoice_id"],
        "amount": payment["amount"],
        "payment_status": "paid",
        "status": "payment_successful",
        "mock_mode": True
    }


# --------------------------------------------------
# AUDIT HISTORY
# --------------------------------------------------

@app.get("/audit")
def get_audit_history():

    connection = get_db_connection()

    logs = connection.execute(
        """
        SELECT *
        FROM audit_logs
        ORDER BY id DESC
        LIMIT 100
        """
    ).fetchall()

    connection.close()

    return {
        "audit_logs": [
            dict(log)
            for log in logs
        ]
    }