import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard",
    liveDemo: "LIVE DEMO",

    welcomeTitle1: "Welcome to",
    welcomeTitle2: "VoicePay.",
    welcomeTagline: "From voice to invoice in one command.",
    startVoicePay: "Start VoicePay",

    voiceInvoice: "VOICE INVOICE",
    generateHeading1: "Generate an invoice",
    generateHeading2: "with your voice.",
    generateDescription:
      "Speak naturally or type the transaction. VoicePay will prepare the invoice for you.",

    message: "MESSAGE",
    whatSold: "What did you sell?",
    english: "English",
    tamil: "Tamil",

    example:
      "Example: Create invoice for Arun Kumar 2 water bottles at 50 rupees GST 18 percent",

    speak: "Speak",
    stop: "Stop",
    generateInvoice: "Generate invoice",

    step1: "Speak naturally",
    step2: "Review details",
    step3: "Send payment link",

    invoicePreview: "INVOICE PREVIEW",
    previewHeading1: "Your generated invoice",
    previewHeading2: "appears here.",
    previewDescription:
      "Speak or type a transaction and VoicePay will place the generated invoice here.",

    generatedInvoice: "GENERATED INVOICE",
    ready: "Ready",

    invoiceId: "INVOICE ID",

    customer: "Customer",
    productService: "Product / Service",
    quantity: "Quantity",
    price: "Price",
    gst: "GST %",

    editInvoice: "Edit / Update Invoice",

    subtotal: "Subtotal",
    total: "Total",

    confirmCreate: "Confirm & create invoice",
    generatePaymentLink: "Generate payment link",

    paymentLinkReady: "PAYMENT LINK READY",
    openPayment: "Open payment",

    startAnotherInvoice: "Start another invoice",

    merchantDashboard: "MERCHANT DASHBOARD",
    overview: "Overview",
    queries: "Queries",
    history: "History",

    totalCollected: "Total collected",
    pendingAmount: "Pending amount",
    paidInvoices: "Paid invoices",
    pending: "Pending",

    pendingPayments: "Pending payments",
    pendingLabel: "pending",
    noPendingPayments: "No pending payments",
    remind: "Remind",

    reminderReady: "REMINDER READY",
    copyMessage: "Copy message",

    askVoicePay: "ASK VOICEPAY",
    askBusiness1: "Ask about your",
    askBusiness2: "business.",
    queryDescription:
      "Search collections and pending payments using natural language.",

    queryPlaceholder: "Who hasn't paid me?",
    searchBusiness: "Search business",
    voicePayAnswer: "VOICEPAY ANSWER",

    activityHistory: "Activity history",
    latestActions: "Latest actions",
    noActivity: "No activity yet",

    secureDemoPayment: "Secure demo payment",
    loadingPayment: "Loading payment request...",
    paymentRequest: "PAYMENT REQUEST",
    from: "From",
    invoice: "Invoice",
    status: "Status",
    pendingStatus: "Pending",
    paySecurely: "Pay securely",
    demoMode: "Demo mode · No real money will be charged",

    paymentComplete: "PAYMENT COMPLETE",
    paymentSuccessful: "Payment successful",
    paymentRecorded:
      "This payment has been recorded in VoicePay.",
    backToVoicePay: "Back to VoicePay",

    refreshTitle: "Refresh dashboard data",
  },

  ta: {
    dashboard: "முகப்பலகை",
    liveDemo: "நேரடி டெமோ",

    welcomeTitle1: "VoicePay-க்கு",
    welcomeTitle2: "வரவேற்கிறோம்.",
    welcomeTagline: "ஒரே கட்டளையில் குரலிலிருந்து இன்வாய்ஸ் வரை.",
    startVoicePay: "VoicePay தொடங்கு",

    voiceInvoice: "குரல் இன்வாய்ஸ்",
    generateHeading1: "உங்கள் குரலில்",
    generateHeading2: "இன்வாய்ஸ் உருவாக்குங்கள்.",
    generateDescription:
      "இயல்பாகப் பேசுங்கள் அல்லது பரிவர்த்தனையை தட்டச்சு செய்யுங்கள். VoicePay உங்களுக்காக இன்வாய்ஸை தயார் செய்யும்.",

    message: "செய்தி",
    whatSold: "நீங்கள் என்ன விற்றீர்கள்?",
    english: "ஆங்கிலம்",
    tamil: "தமிழ்",

    example:
      "உதாரணம்: கணேஷுக்கு நாலு பாட்டில் ₹40 ஜிஎஸ்டி 12%",

    speak: "பேசுங்கள்",
    stop: "நிறுத்து",
    generateInvoice: "இன்வாய்ஸ் உருவாக்கு",

    step1: "இயல்பாகப் பேசுங்கள்",
    step2: "விவரங்களை சரிபார்க்கவும்",
    step3: "பணம் செலுத்தும் இணைப்பை அனுப்பவும்",

    invoicePreview: "இன்வாய்ஸ் முன்னோட்டம்",
    previewHeading1: "உருவாக்கப்பட்ட இன்வாய்ஸ்",
    previewHeading2: "இங்கே தோன்றும்.",
    previewDescription:
      "பரிவர்த்தனையை பேசுங்கள் அல்லது தட்டச்சு செய்யுங்கள். VoicePay உருவாக்கிய இன்வாய்ஸ் இங்கே காட்டப்படும்.",

    generatedInvoice: "உருவாக்கப்பட்ட இன்வாய்ஸ்",
    ready: "தயார்",

    invoiceId: "இன்வாய்ஸ் எண்",

    customer: "வாடிக்கையாளர்",
    productService: "பொருள் / சேவை",
    quantity: "அளவு",
    price: "விலை",
    gst: "GST %",

    editInvoice: "இன்வாய்ஸை திருத்து / புதுப்பி",

    subtotal: "இடைமொத்தம்",
    total: "மொத்தம்",

    confirmCreate: "உறுதிசெய்து இன்வாய்ஸ் உருவாக்கு",
    generatePaymentLink: "பணம் செலுத்தும் இணைப்பை உருவாக்கு",

    paymentLinkReady: "பணம் செலுத்தும் இணைப்பு தயார்",
    openPayment: "பணம் செலுத்து",

    startAnotherInvoice: "புதிய இன்வாய்ஸ் தொடங்கு",

    merchantDashboard: "வணிக முகப்பலகை",
    overview: "மேலோட்டம்",
    queries: "கேள்விகள்",
    history: "வரலாறு",

    totalCollected: "மொத்த வசூல்",
    pendingAmount: "நிலுவை தொகை",
    paidInvoices: "செலுத்தப்பட்ட இன்வாய்ஸ்கள்",
    pending: "நிலுவை",

    pendingPayments: "நிலுவை பணங்கள்",
    pendingLabel: "நிலுவை",
    noPendingPayments: "நிலுவை பணங்கள் இல்லை",
    remind: "நினைவூட்டு",

    reminderReady: "நினைவூட்டல் தயார்",
    copyMessage: "செய்தியை நகலெடு",

    askVoicePay: "VOICEPAY-யிடம் கேளுங்கள்",
    askBusiness1: "உங்கள் வணிகத்தைப்",
    askBusiness2: "பற்றி கேளுங்கள்.",
    queryDescription:
      "வசூல் மற்றும் நிலுவை பணங்களை இயல்பான மொழியில் கேட்டு அறியுங்கள்.",

    queryPlaceholder: "யார் இன்னும் பணம் கொடுக்கவில்லை?",
    searchBusiness: "வணிகத்தை தேடு",
    voicePayAnswer: "VOICEPAY பதில்",

    activityHistory: "செயல்பாட்டு வரலாறு",
    latestActions: "சமீபத்திய செயல்கள்",
    noActivity: "செயல்பாடுகள் எதுவும் இல்லை",

    secureDemoPayment: "பாதுகாப்பான டெமோ கட்டணம்",
    loadingPayment: "கட்டண விவரங்கள் ஏற்றப்படுகின்றன...",
    paymentRequest: "கட்டண கோரிக்கை",
    from: "வாடிக்கையாளர்",
    invoice: "இன்வாய்ஸ்",
    status: "நிலை",
    pendingStatus: "நிலுவை",
    paySecurely: "பாதுகாப்பாக செலுத்து",
    demoMode: "டெமோ முறை · உண்மையான பணம் வசூலிக்கப்படாது",

    paymentComplete: "கட்டணம் முடிந்தது",
    paymentSuccessful: "கட்டணம் வெற்றிகரமாக முடிந்தது",
    paymentRecorded:
      "இந்த கட்டணம் VoicePay-ல் பதிவு செய்யப்பட்டுள்ளது.",
    backToVoicePay: "VoicePay-க்கு திரும்பு",

    refreshTitle: "முகப்பலகையை புதுப்பிக்கவும்",
  },
};

function App() {
  const [started, setStarted] = useState(
    sessionStorage.getItem("voicepay_started") === "true"
  );

  const [dashboardOpen, setDashboardOpen] = useState(false);

  const [activeDashboardTab, setActiveDashboardTab] =
    useState("overview");

  const [voiceLanguage, setVoiceLanguage] = useState(
    localStorage.getItem("voicepay_language") || "en-IN"
  );

  const [voiceText, setVoiceText] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);

  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [gst, setGst] = useState("");

  const [preview, setPreview] = useState(null);

  const [createdInvoice, setCreatedInvoice] =
    useState(null);

  const [paymentLink, setPaymentLink] =
    useState(null);

  const [dashboard, setDashboard] =
    useState(null);

  const [invoices, setInvoices] =
    useState([]);

  const [auditLogs, setAuditLogs] =
    useState([]);

  const [businessQuery, setBusinessQuery] =
    useState("");

  const [businessAnswer, setBusinessAnswer] =
    useState(null);

  const [
    isBusinessListening,
    setIsBusinessListening,
  ] = useState(false);

  const businessRecognitionRef =
    useRef(null);

  const [reminder, setReminder] =
    useState(null);

  const [
    paymentPageData,
    setPaymentPageData,
  ] = useState(null);

  const [
    paymentPageLoading,
    setPaymentPageLoading,
  ] = useState(false);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const isTamil =
    voiceLanguage === "ta-IN";

  const t = isTamil
    ? TRANSLATIONS.ta
    : TRANSLATIONS.en;

  const currentPath =
    window.location.pathname;

  const isPaymentPage =
    currentPath.startsWith("/pay/");

  const paymentLinkId = isPaymentPage
    ? currentPath.split("/pay/")[1]
    : null;

  const invoiceData = {
    customer,
    product,
    quantity: Number(quantity),
    price: Number(price),
    gst: Number(gst),
  };

  const handleLanguageChange = (event) => {
    const newLanguage =
      event.target.value;

    setVoiceLanguage(newLanguage);

    localStorage.setItem(
      "voicepay_language",
      newLanguage
    );
  };

  const enterVoicePay = () => {
    sessionStorage.setItem(
      "voicepay_started",
      "true"
    );

    setStarted(true);
  };

  const goToMainWorkspace = () => {
    sessionStorage.setItem(
      "voicepay_started",
      "true"
    );

    window.location.href = "/";
  };

  const loadDashboard = async () => {
    try {
      const response = await fetch(
        `${API_URL}/dashboard/summary`
      );

      const data =
        await response.json();

      setDashboard(data);
    } catch {
      setError(
        "Unable to load dashboard."
      );
    }
  };

  const loadInvoices = async () => {
    try {
      const response = await fetch(
        `${API_URL}/invoices`
      );

      const data =
        await response.json();

      setInvoices(
        data.invoices || []
      );
    } catch {
      setError(
        "Unable to load invoices."
      );
    }
  };

  const loadAuditLogs = async () => {
    try {
      const response = await fetch(
        `${API_URL}/audit`
      );

      const data =
        await response.json();

      setAuditLogs(
        data.audit_logs || []
      );
    } catch {
      setError(
        "Unable to load history."
      );
    }
  };

  const refreshAll = async () => {
    setIsRefreshing(true);

    setError("");

    setBusinessAnswer(null);

    setReminder(null);

    try {
      await Promise.all([
        loadDashboard(),
        loadInvoices(),
        loadAuditLogs(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (
      started &&
      !isPaymentPage
    ) {
      refreshAll();
    }
  }, [
    started,
    isPaymentPage,
  ]);

  useEffect(() => {
    if (!paymentLinkId) {
      return;
    }

    const loadPaymentDetails =
      async () => {
        setPaymentPageLoading(
          true
        );

        setError("");

        try {
          const response =
            await fetch(
              `${API_URL}/payment-link/${paymentLinkId}`
            );

          const data =
            await response.json();

          if (data.error) {
            setError(
              data.error
            );

            return;
          }

          setPaymentPageData(
            data
          );
        } catch {
          setError(
            "Unable to load payment details."
          );
        } finally {
          setPaymentPageLoading(
            false
          );
        }
      };

    loadPaymentDetails();
  }, [paymentLinkId]);

  const startListening = () => {
    setError("");

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser."
      );

      return;
    }

    if (
      recognitionRef.current
    ) {
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognitionRef.current =
      recognition;

    recognition.lang =
      voiceLanguage;

    recognition.interimResults =
      false;

    recognition.continuous =
      true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (
      event
    ) => {
      let transcript = "";

      for (
        let i = 0;
        i < event.results.length;
        i++
      ) {
        transcript +=
          event.results[i][0]
            .transcript + " ";
      }

      setVoiceText(
        transcript.trim()
      );
    };

    recognition.onerror = () => {
      setError(
        isTamil
          ? "உங்கள் குரலை அடையாளம் காண முடியவில்லை."
          : "Could not recognize your voice."
      );

      setIsListening(false);

      recognitionRef.current =
        null;
    };

    recognition.onend = () => {
      setIsListening(false);

      recognitionRef.current =
        null;
    };

    recognition.start();
  };

  const stopListening = () => {
    if (
      recognitionRef.current
    ) {
      recognitionRef.current.stop();
    }

    recognitionRef.current =
      null;

    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startBusinessListening =
    () => {
      setError("");

      const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setError(
          isTamil
            ? "இந்த உலாவியில் குரல் அடையாளம் காணும் வசதி இல்லை."
            : "Speech recognition is not supported in this browser."
        );

        return;
      }

      if (
        businessRecognitionRef.current
      ) {
        return;
      }

      const recognition =
        new SpeechRecognition();

      businessRecognitionRef.current =
        recognition;

      recognition.lang =
        voiceLanguage;

      recognition.interimResults =
        false;

      recognition.continuous =
        false;

      recognition.onstart =
        () => {
          setIsBusinessListening(
            true
          );
        };

      recognition.onresult = (
        event
      ) => {
        setBusinessQuery(
          event.results[0][0]
            .transcript
        );
      };

      recognition.onerror =
        () => {
          setIsBusinessListening(
            false
          );

          businessRecognitionRef.current =
            null;
        };

      recognition.onend =
        () => {
          setIsBusinessListening(
            false
          );

          businessRecognitionRef.current =
            null;
        };

      recognition.start();
    };

  const processVoiceCommand =
    async () => {
      stopListening();

      setError("");

      setPreview(null);

      setCreatedInvoice(null);

      setPaymentLink(null);

      if (!voiceText.trim()) {
        setError(
          isTamil
            ? "முதலில் பேசுங்கள் அல்லது இன்வாய்ஸ் கட்டளையை தட்டச்சு செய்யுங்கள்."
            : "Speak or type an invoice command first."
        );

        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/voice/parse`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                text: voiceText,
              }),
            }
          );

        const data =
          await response.json();

        if (data.error) {
          setError(
            data.error
          );

          return;
        }

        setCustomer(
          data.customer
        );

        setProduct(
          data.product
        );

        setQuantity(
          data.quantity.toString()
        );

        setPrice(
          data.price.toString()
        );

        setGst(
          data.gst.toString()
        );

        const previewResponse =
          await fetch(
            `${API_URL}/invoice/preview`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                customer:
                  data.customer,

                product:
                  data.product,

                quantity:
                  Number(
                    data.quantity
                  ),

                price:
                  Number(
                    data.price
                  ),

                gst:
                  Number(
                    data.gst
                  ),
              }),
            }
          );

        const previewData =
          await previewResponse.json();

        if (
          previewData.error
        ) {
          setError(
            previewData.error
          );

          return;
        }

        setPreview(
          previewData
        );
      } catch {
        setError(
          isTamil
            ? "இன்வாய்ஸ் கட்டளையை செயலாக்க முடியவில்லை."
            : "Unable to process invoice command."
        );
      }
    };

  const updatePreview =
    async () => {
      setError("");

      try {
        const response =
          await fetch(
            `${API_URL}/invoice/preview`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  invoiceData
                ),
            }
          );

        const data =
          await response.json();

        if (data.error) {
          setError(
            data.error
          );

          return;
        }

        setPreview(data);

        setCreatedInvoice(
          null
        );

        setPaymentLink(
          null
        );
      } catch {
        setError(
          isTamil
            ? "இன்வாய்ஸை புதுப்பிக்க முடியவில்லை."
            : "Unable to update invoice."
        );
      }
    };

  const createInvoice =
    async () => {
      setError("");

      try {
        const response =
          await fetch(
            `${API_URL}/invoice/create`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  invoiceData
                ),
            }
          );

        const data =
          await response.json();

        if (data.error) {
          setError(
            data.error
          );

          return;
        }

        setCreatedInvoice(
          data
        );

        await refreshAll();
      } catch {
        setError(
          isTamil
            ? "இன்வாய்ஸ் உருவாக்க முடியவில்லை."
            : "Unable to create invoice."
        );
      }
    };

  const generatePaymentLink =
    async () => {
      setError("");

      if (!createdInvoice) {
        setError(
          isTamil
            ? "முதலில் இன்வாய்ஸை உருவாக்குங்கள்."
            : "Create an invoice first."
        );

        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/payment-link/create`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                invoice_id:
                  createdInvoice.invoice_id,
              }),
            }
          );

        const data =
          await response.json();

        if (data.error) {
          setError(
            data.error
          );

          return;
        }

        setPaymentLink(
          data
        );

        await loadAuditLogs();
      } catch {
        setError(
          isTamil
            ? "பணம் செலுத்தும் இணைப்பை உருவாக்க முடியவில்லை."
            : "Unable to generate payment link."
        );
      }
    };

  const completePayment =
    async () => {
      setError("");

      try {
        const response =
          await fetch(
            `${API_URL}/payment-link/${paymentLinkId}/pay`,
            {
              method: "POST",
            }
          );

        const data =
          await response.json();

        if (data.error) {
          setError(
            data.error
          );

          return;
        }

        setPaymentPageData(
          (previous) => ({
            ...previous,

            payment_status:
              "paid",
          })
        );
      } catch {
        setError(
          isTamil
            ? "கட்டணத்தை முடிக்க முடியவில்லை."
            : "Unable to complete payment."
        );
      }
    };

  const askBusinessQuery =
    async () => {
      setError("");

      setBusinessAnswer(null);

      if (
        !businessQuery.trim()
      ) {
        setError(
          isTamil
            ? "VoicePay-யிடம் ஒரு கேள்வி கேளுங்கள்."
            : "Ask VoicePay a question."
        );

        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/business/query`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                text:
                  businessQuery,
              }),
            }
          );

        const data =
          await response.json();

        if (data.error) {
          setError(
            data.error
          );

          return;
        }

        setBusinessAnswer(
          data
        );

        await loadAuditLogs();
      } catch {
        setError(
          isTamil
            ? "வணிகக் கேள்வியை செயலாக்க முடியவில்லை."
            : "Unable to process business query."
        );
      }
    };

  const createReminder =
    async (invoiceId) => {
      setError("");

      setReminder(null);

      try {
        const response =
          await fetch(
            `${API_URL}/reminder/create`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                invoice_id:
                  invoiceId,
              }),
            }
          );

        const data =
          await response.json();

        if (data.error) {
          setError(
            data.error
          );

          return;
        }

        setReminder(data);

        await loadAuditLogs();
      } catch {
        setError(
          isTamil
            ? "நினைவூட்டலை தயார் செய்ய முடியவில்லை."
            : "Unable to prepare reminder."
        );
      }
    };

  const resetInvoice = () => {
    stopListening();

    setVoiceText("");

    setCustomer("");

    setProduct("");

    setQuantity("");

    setPrice("");

    setGst("");

    setPreview(null);

    setCreatedInvoice(null);

    setPaymentLink(null);

    setError("");
  };

  if (isPaymentPage) {
    return (
      <div className="glass-background payment-background">
        <div className="orb orb-one"></div>

        <div className="orb orb-two"></div>

        <div className="glass-card payment-card">
          <div className="payment-brand">
            <div className="logo-mark">
              V
            </div>

            <div>
              <strong>
                VoicePay
              </strong>

              <span>
                {t.secureDemoPayment}
              </span>
            </div>
          </div>

          {paymentPageLoading && (
            <p className="loading-text">
              {t.loadingPayment}
            </p>
          )}

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {paymentPageData &&
            paymentPageData.payment_status ===
              "pending" && (
              <>
                <div className="payment-amount">
                  <span>
                    {t.paymentRequest}
                  </span>

                  <h1>
                    ₹
                    {Number(
                      paymentPageData.amount
                    ).toFixed(2)}
                  </h1>

                  <p>
                    {t.from}{" "}

                    <strong>
                      {
                        paymentPageData.customer
                      }
                    </strong>
                  </p>
                </div>

                <div className="payment-meta">
                  <div>
                    <span>
                      {t.invoice}
                    </span>

                    <strong>
                      {
                        paymentPageData.invoice_id
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      {t.status}
                    </span>

                    <strong>
                      {t.pendingStatus}
                    </strong>
                  </div>
                </div>

                <button
                  className="gradient-button full-button"
                  onClick={
                    completePayment
                  }
                >
                  {t.paySecurely}

                  <span>
                    →
                  </span>
                </button>

                <p className="demo-text">
                  {t.demoMode}
                </p>
              </>
            )}

          {paymentPageData &&
            paymentPageData.payment_status ===
              "paid" && (
              <div className="payment-success">
                <div className="success-icon">
                  ✓
                </div>

                <span>
                  {t.paymentComplete}
                </span>

                <h1>
                  {t.paymentSuccessful}
                </h1>

                <p>
                  {t.paymentRecorded}
                </p>

                <div className="paid-amount">
                  ₹
                  {Number(
                    paymentPageData.amount
                  ).toFixed(2)}
                </div>

                <button
                  className="gradient-button full-button back-home-button"
                  onClick={
                    goToMainWorkspace
                  }
                >
                  {t.backToVoicePay}

                  <span>
                    →
                  </span>
                </button>
              </div>
            )}
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="glass-background welcome-screen">
        <div className="orb orb-one"></div>

        <div className="orb orb-two"></div>

        <div className="orb orb-three"></div>

        <div className="welcome-nav">
          <div className="welcome-brand">
            <div className="logo-mark">
              V
            </div>

            <div>
              <strong>
                VoicePay
              </strong>

              <span>
                AI
              </span>
            </div>
          </div>

          <div className="welcome-demo">
            <span></span>

            {t.liveDemo}
          </div>
        </div>

        <div className="welcome-content welcome-simple">
          <h1>
            {t.welcomeTitle1}
            <br />

            <span>
              {t.welcomeTitle2}
            </span>
          </h1>

          <p className="welcome-tagline">
            {t.welcomeTagline}
          </p>

          <button
            className="start-button"
            onClick={enterVoicePay}
          >
            {t.startVoicePay}

            <span>
              →
            </span>
          </button>
        </div>
      </div>
    );
  }

  const pendingInvoices =
    invoices.filter(
      (invoice) =>
        invoice.payment_status ===
        "pending"
    );

  return (
    <div className="glass-background app-screen">
      <div className="orb orb-one"></div>

      <div className="orb orb-two"></div>

      <div className="orb orb-three"></div>

      <header className="app-topbar">
        <button
          className="topbar-button dashboard-button"
          onClick={() =>
            setDashboardOpen(true)
          }
        >
          <span className="menu-icon">
            ☰
          </span>

          {t.dashboard}
        </button>

        <div className="topbar-brand">
          <div className="logo-mark small-logo">
            V
          </div>

          <div>
            <strong>
              VoicePay
            </strong>

            <span>
              AI
            </span>
          </div>
        </div>

        <div className="topbar-actions">
          <button
            className="topbar-button icon-button"
            onClick={refreshAll}
            disabled={isRefreshing}
            title={t.refreshTitle}
          >
            {isRefreshing
              ? "…"
              : "↻"}
          </button>

          <select
            className="language-toggle"
            value={voiceLanguage}
            onChange={
              handleLanguageChange
            }
          >
            <option value="en-IN">
              EN
            </option>

            <option value="ta-IN">
              தமிழ்
            </option>
          </select>
        </div>
      </header>

      <main className="workspace">
        <section className="workspace-heading">
          <span>
            {t.voiceInvoice}
          </span>

          <h1>
            {t.generateHeading1}
            <br />
            {t.generateHeading2}
          </h1>

          <p>
            {t.generateDescription}
          </p>
        </section>

        <section className="workspace-grid">
          <div className="glass-card command-panel">
            <div className="card-heading">
              <div>
                <span className="section-tag">
                  {t.message}
                </span>

                <h2>
                  {t.whatSold}
                </h2>
              </div>

              <div className="language-status">
                <span></span>

                {isTamil
                  ? t.tamil
                  : t.english}
              </div>
            </div>

            <div className="message-box">
              <textarea
                value={voiceText}
                onChange={(event) =>
                  setVoiceText(
                    event.target.value
                  )
                }
                placeholder={
                  t.example
                }
              />

              <button
                className={
                  isListening
                    ? "speak-button listening"
                    : "speak-button"
                }
                onClick={
                  toggleListening
                }
              >
                <span>
                  {isListening
                    ? "■"
                    : "🎙"}
                </span>

                {isListening
                  ? t.stop
                  : t.speak}
              </button>
            </div>

            <div className="command-actions">
              <button
                className="gradient-button"
                onClick={
                  processVoiceCommand
                }
              >
                {t.generateInvoice}

                <span>
                  →
                </span>
              </button>
            </div>

            {error && (
              <div className="error-banner">
                {error}
              </div>
            )}

            <div className="helper-strip">
              <div>
                <span>
                  01
                </span>

                <p>
                  {t.step1}
                </p>
              </div>

              <div>
                <span>
                  02
                </span>

                <p>
                  {t.step2}
                </p>
              </div>

              <div>
                <span>
                  03
                </span>

                <p>
                  {t.step3}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card invoice-panel">
            {!preview ? (
              <div className="invoice-placeholder">
                <div className="preview-icon">
                  ✦
                </div>

                <span className="section-tag">
                  {t.invoicePreview}
                </span>

                <h2>
                  {t.previewHeading1}
                  <br />
                  {t.previewHeading2}
                </h2>

                <p>
                  {t.previewDescription}
                </p>

                <div className="placeholder-lines">
                  <span></span>

                  <span></span>

                  <span></span>
                </div>
              </div>
            ) : (
              <div className="invoice-content">
                <div className="invoice-top">
                  <div>
                    <span className="section-tag">
                      {t.generatedInvoice}
                    </span>

                    <h2>
                      {customer}
                    </h2>
                  </div>

                  <div className="success-pill">
                    ✓ {t.ready}
                  </div>
                </div>

                {createdInvoice && (
                  <div className="invoice-id-card">
                    <span>
                      {t.invoiceId}
                    </span>

                    <strong>
                      {
                        createdInvoice.invoice_id
                      }
                    </strong>
                  </div>
                )}

                <div className="invoice-form-grid">
                  <label className="wide-field">
                    <span>
                      {t.customer}
                    </span>

                    <input
                      value={customer}
                      onChange={(event) =>
                        setCustomer(
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label className="wide-field">
                    <span>
                      {t.productService}
                    </span>

                    <input
                      value={product}
                      onChange={(event) =>
                        setProduct(
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>
                      {t.quantity}
                    </span>

                    <input
                      type="number"
                      value={quantity}
                      onChange={(event) =>
                        setQuantity(
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>
                      {t.price}
                    </span>

                    <input
                      type="number"
                      value={price}
                      onChange={(event) =>
                        setPrice(
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>
                      {t.gst}
                    </span>

                    <input
                      type="number"
                      value={gst}
                      onChange={(event) =>
                        setGst(
                          event.target.value
                        )
                      }
                    />
                  </label>
                </div>

                <button
                  className="edit-button"
                  onClick={updatePreview}
                >
                  ✎ {t.editInvoice}
                </button>

                <div className="invoice-totals">
                  <div>
                    <span>
                      {t.subtotal}
                    </span>

                    <strong>
                      ₹
                      {Number(
                        preview.subtotal
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>
                      GST
                    </span>

                    <strong>
                      ₹
                      {Number(
                        preview.gst_amount
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div className="grand-total">
                    <span>
                      {t.total}
                    </span>

                    <strong>
                      ₹
                      {Number(
                        preview.total
                      ).toFixed(2)}
                    </strong>
                  </div>
                </div>

                {!createdInvoice && (
                  <button
                    className="gradient-button full-button"
                    onClick={
                      createInvoice
                    }
                  >
                    {t.confirmCreate}

                    <span>
                      →
                    </span>
                  </button>
                )}

                {createdInvoice &&
                  !paymentLink && (
                    <button
                      className="gradient-button full-button"
                      onClick={
                        generatePaymentLink
                      }
                    >
                      {
                        t.generatePaymentLink
                      }

                      <span>
                        →
                      </span>
                    </button>
                  )}

                {paymentLink && (
                  <div className="payment-link-box">
                    <div>
                      <span>
                        {
                          t.paymentLinkReady
                        }
                      </span>

                      <strong>
                        ₹
                        {Number(
                          paymentLink.amount
                        ).toFixed(2)}
                      </strong>
                    </div>

                    <a
                      href={
                        paymentLink.payment_url
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t.openPayment}

                      <span>
                        ↗
                      </span>
                    </a>
                  </div>
                )}

                <button
                  className="new-invoice-link"
                  onClick={
                    resetInvoice
                  }
                >
                  +{" "}
                  {
                    t.startAnotherInvoice
                  }
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {dashboardOpen && (
        <div className="dashboard-overlay">
          <div
            className="dashboard-backdrop"
            onClick={() =>
              setDashboardOpen(
                false
              )
            }
          ></div>

          <aside className="dashboard-drawer glass-card">
            <div className="drawer-header">
              <div>
                <span className="section-tag">
                  {
                    t.merchantDashboard
                  }
                </span>

                <h2>
                  VoicePay
                </h2>
              </div>

              <button
                className="close-button"
                onClick={() =>
                  setDashboardOpen(
                    false
                  )
                }
              >
                ×
              </button>
            </div>

            <div className="dashboard-tabs">
              <button
                className={
                  activeDashboardTab ===
                  "overview"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveDashboardTab(
                    "overview"
                  )
                }
              >
                {t.overview}
              </button>

              <button
                className={
                  activeDashboardTab ===
                  "queries"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveDashboardTab(
                    "queries"
                  )
                }
              >
                {t.queries}
              </button>

              <button
                className={
                  activeDashboardTab ===
                  "history"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveDashboardTab(
                    "history"
                  )
                }
              >
                {t.history}
              </button>
            </div>

            {activeDashboardTab ===
              "overview" && (
              <div className="drawer-content">
                <div className="dashboard-stat-grid">
                  <div className="glass-stat">
                    <span>
                      {
                        t.totalCollected
                      }
                    </span>

                    <strong>
                      ₹
                      {Number(
                        dashboard?.total_collected ||
                          0
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div className="glass-stat">
                    <span>
                      {
                        t.pendingAmount
                      }
                    </span>

                    <strong>
                      ₹
                      {Number(
                        dashboard?.pending_amount ||
                          0
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div className="glass-stat">
                    <span>
                      {
                        t.paidInvoices
                      }
                    </span>

                    <strong>
                      {
                        dashboard?.paid_invoices ||
                        0
                      }
                    </strong>
                  </div>

                  <div className="glass-stat">
                    <span>
                      {t.pending}
                    </span>

                    <strong>
                      {
                        dashboard?.pending_invoices ||
                        0
                      }
                    </strong>
                  </div>
                </div>

                <div className="drawer-section">
                  <div className="drawer-section-title">
                    <h3>
                      {
                        t.pendingPayments
                      }
                    </h3>

                    <span>
                      {
                        pendingInvoices.length
                      }{" "}
                      {t.pendingLabel}
                    </span>
                  </div>

                  <div className="pending-list">
                    {pendingInvoices.length ===
                    0 ? (
                      <div className="empty-dashboard">
                        ✓{" "}
                        {
                          t.noPendingPayments
                        }
                      </div>
                    ) : (
                      pendingInvoices
                        .slice(0, 5)
                        .map(
                          (invoice) => (
                            <div
                              className="pending-item"
                              key={
                                invoice.invoice_id
                              }
                            >
                              <div className="customer-letter">
                                {invoice.customer
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <strong>
                                  {
                                    invoice.customer
                                  }
                                </strong>

                                <span>
                                  {
                                    invoice.invoice_id
                                  }
                                </span>
                              </div>

                              <strong className="pending-amount">
                                ₹
                                {Number(
                                  invoice.total
                                ).toFixed(
                                  2
                                )}
                              </strong>

                              <button
                                onClick={() =>
                                  createReminder(
                                    invoice.invoice_id
                                  )
                                }
                              >
                                {t.remind}
                              </button>
                            </div>
                          )
                        )
                    )}
                  </div>
                </div>

                {reminder && (
                  <div className="reminder-box">
                    <span>
                      {
                        t.reminderReady
                      }
                    </span>

                    <p>
                      {
                        reminder.message
                      }
                    </p>

                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          reminder.message
                        )
                      }
                    >
                      {
                        t.copyMessage
                      }
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeDashboardTab ===
              "queries" && (
              <div className="drawer-content">
                <div className="query-hero">
                  <span className="section-tag">
                    {t.askVoicePay}
                  </span>

                  <h3>
                    {
                      t.askBusiness1
                    }
                    <br />
                    {
                      t.askBusiness2
                    }
                  </h3>

                  <p>
                    {
                      t.queryDescription
                    }
                  </p>
                </div>

                <div className="query-input">
                  <input
                    value={
                      businessQuery
                    }
                    onChange={(event) =>
                      setBusinessQuery(
                        event.target.value
                      )
                    }
                    placeholder={
                      t.queryPlaceholder
                    }
                  />

                  <button
                    onClick={
                      startBusinessListening
                    }
                  >
                    {isBusinessListening
                      ? "●"
                      : "🎙"}
                  </button>
                </div>

                <button
                  className="gradient-button full-button query-search-button"
                  onClick={
                    askBusinessQuery
                  }
                >
                  {t.searchBusiness}

                  <span>
                    →
                  </span>
                </button>

                {businessAnswer && (
                  <div className="query-answer">
                    <span>
                      {
                        t.voicePayAnswer
                      }
                    </span>

                    <p>
                      {
                        businessAnswer.answer
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeDashboardTab ===
              "history" && (
              <div className="drawer-content">
                <div className="drawer-section-title">
                  <h3>
                    {
                      t.activityHistory
                    }
                  </h3>

                  <span>
                    {
                      t.latestActions
                    }
                  </span>
                </div>

                <div className="history-list">
                  {auditLogs.length ===
                  0 ? (
                    <div className="empty-dashboard">
                      {t.noActivity}
                    </div>
                  ) : (
                    auditLogs
                      .slice(0, 12)
                      .map((log) => (
                        <div
                          className="history-item"
                          key={log.id}
                        >
                          <div className="history-dot"></div>

                          <div>
                            <strong>
                              {log.action.replaceAll(
                                "_",
                                " "
                              )}
                            </strong>

                            <p>
                              {
                                log.details
                              }
                            </p>
                          </div>

                          <small>
                            {new Date(
                              log.created_at
                            ).toLocaleTimeString(
                              [],
                              {
                                hour:
                                  "2-digit",

                                minute:
                                  "2-digit",
                              }
                            )}
                          </small>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;