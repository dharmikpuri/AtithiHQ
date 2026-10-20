const plural = (count: number, one: string, other: string) => `${count} ${count === 1 ? one : other}`;

/** Receipts and tax invoices: the booking's Receipt card, the create sheet and the document itself. */
export const invoices = {
  kinds: {
    receipt: { title: "Receipt", issue: "Issue receipt" },
    tax_invoice: { title: "Tax invoice", issue: "Issue tax invoice" },
    payment_receipt: { title: "Payment receipt", issue: "Issue payment receipt" },
  },

  card: {
    title: "Receipt",
    titleGst: "Tax invoice / receipt",
    empty: "Give your guest a receipt for this stay, with the amounts and payments received so far.",
    emptyGst: "Give your guest a tax invoice or receipt for this stay, with the amounts and payments received so far.",
    create: "Create receipt",
    createGst: "Create tax invoice / receipt",
    noTotal: "Add the total amount to create a receipt",
    number: "Number",
    issuedOn: "Issued",
    total: "Total",
    preview: "Preview",
    cancelled: "Cancelled",
    cancelledBody: "This booking was cancelled, so no new receipt can be issued.",
    staleTitle: "This booking changed after the receipt was issued",
    staleBody: "The receipt above still shows the details from when it was issued.",
    issueUpdated: "Issue updated receipt",
    /** Fixing a mistake on a document that is up to date; it is never edited, a new version is issued. */
    correct: {
      receipt: "Correct this receipt",
      tax_invoice: "Correct this invoice",
      payment_receipt: "Correct this receipt",
    },
    /** Internal note under a revised document, e.g. "Revised on 19 Oct · Wrong GST rate". */
    revisedLine: (date: string, reason: string) => `Revised on ${date} · ${reason}`,
    loadError: "We couldn't load the receipt.",
  },

  sheet: {
    title: "Create receipt",
    titleGst: "Create tax invoice or receipt",
    updateTitle: "Issue a new version",
    issueRevision: "Issue new version",
    description: "Check the amounts, then issue it. Once issued, it can't be edited.",
    updateDescription:
      "Issued documents can't be edited. This issues a new version; the earlier one stays in your records, marked as replaced.",
    revisionNotice:
      "This replaces the current version. Links you already sent still open the earlier one, with a note that it was updated, so send your guest the new version on WhatsApp.",
    newSeriesNotice:
      "Switching between a tax invoice and a payment receipt gives it a new number. The old number is retired.",
    reasonLabel: "Why are you correcting it?",
    reasonOtherLabel: "What needs correcting?",
    reasonOtherPlaceholder: "A few words, for your own records",
    reasonOtherHint: "Only you see this. It isn't printed on the document.",
    plainIntro:
      "This property isn't registered for GST, so the receipt shows the total, what you've received and what's left.",
    kindLabel: "What do you want to issue?",
    taxInvoice: {
      label: "Tax invoice (with GST)",
      description: "Shows your GSTIN and the GST on the stay.",
    },
    paymentReceipt: {
      label: "Payment receipt (without GST)",
      description: "Shows the amounts only, with no GST.",
    },
    paymentReceiptWarning:
      "GST registered businesses usually need to issue a tax invoice for each stay. Check with your accountant if unsure.",
    modeLabel: "Is GST included in the total, or added on top?",
    included: {
      label: "Included in the total",
      description: (total: string) => `The ${total} already has GST in it.`,
    },
    added: {
      label: "Added on top",
      description: (total: string) => `GST is charged on top of ${total}.`,
    },
    /** Updating a tax invoice whose GST was added on top and raised the booking total. */
    carriedIncluded: (total: string) =>
      `${total} already includes the GST added by the last invoice, so it's set to "Included in the total".`,
    doubleGst: (gst: string, total: string) =>
      `The last invoice already added GST to this booking's total. Adding it on top again charges GST twice: another ${gst}, making ${total}.`,
    rateLabel: "GST rate",
    rateOption: (rate: number) => `${rate}%`,
    updateTotal: (total: string) => `Also update the booking total to ${total}`,
    preview: "Preview",
    issued: (number: string) => `Issued ${number}`,
  },

  /** Why a document was replaced. Labels for the owner's records only. */
  revisionReasons: {
    booking_changed: "Booking changed",
    wrong_gst_rate: "Wrong GST rate",
    wrong_gst_treatment: "Wrong GST treatment",
    wrong_document_type: "Wrong document type",
    other: "Other",
  },

  document: {
    draft: "Draft",
    revised: (version: number) => `Revised · v${version}`,
    numberPending: "Number assigned when issued",
    numberLabel: "No.",
    issuedOn: "Issued",
    gstin: (gstin: string) => `GSTIN ${gstin}`,
    cancelledStamp: "Cancelled",
    owner: "Host",
    billedTo: "Billed to",
    stay: "Stay",
    checkIn: "Check-in",
    checkOut: "Check-out",
    nights: "Nights",
    guests: "Guests",
    rooms: "Rooms",
    amounts: "Amounts",
    accommodation: (nights: number) => `Accommodation · ${plural(nights, "night", "nights")}`,
    taxable: "Taxable value",
    /** Tax invoices: the accommodation line is the taxable value, before GST. */
    accommodationTaxable: (nights: number) => `Accommodation · ${plural(nights, "night", "nights")} (taxable value)`,
    gst: (rate: number) => `GST ${rate}%`,
    total: "Total",
    payments: "Payments received",
    noPayments: "No payments received yet",
    received: "Received",
    balanceDue: "Balance due",
    paidInFull: "Paid in full",
    thanks: "Thank you for staying with us.",
  },

  /** Sending a document on WhatsApp, and downloading it as a PDF. */
  share: {
    button: "Send on WhatsApp",
    error: "We couldn't make the link. Please try again.",
    /** Lower case, to sit inside a sentence. */
    kindInMessage: { receipt: "receipt", tax_invoice: "tax invoice", payment_receipt: "payment receipt" },
    message: (firstName: string, kind: string, property: string, link: string, hours: number) =>
      `Namaste${firstName ? ` ${firstName}` : ""}, here is your ${kind} from ${property}: ${link}\nPlease download it. This link expires in ${hours} hours.`,
    /** Only means the owner opened WhatsApp; never "delivered". */
    shared: (sharedAt: string, until: string) => `Shared on WhatsApp · ${sharedAt}. The link works until ${until}.`,
    lastExpired: (expiredAt: string) => `The last link expired on ${expiredAt}. Send again to share a fresh one.`,
  },

  pdf: {
    download: "Download PDF",
    downloading: "Preparing PDF…",
    error: "We couldn't make the PDF. Please try again.",
  },

  /** The public page behind a shared link. It carries no AtithiHQ branding. */
  publicPage: {
    metaTitle: "Your receipt",
    expiresOn: (when: string) => `This link expires on ${when}`,
    superseded: (property: string, kind: string) =>
      `${property} has issued an updated version of this ${kind}. Ask them for the latest one.`,
    expiredTitle: "This link has expired",
    expiredBody: (property: string) => `Please ask ${property} for a new one.`,
    invalidTitle: "This link isn't valid",
    invalidBody: "Please check the link, or ask the person who sent it to share it again.",
  },

  /** Small line in the Payments list. */
  receiptLine: (number: string, shared = false) => `Receipt ${number}${shared ? " · Shared" : ""}`,
};
