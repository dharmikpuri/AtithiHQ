export const payments = {
  metaTitle: "Payments",
  title: "Payments",
  subtitle: "Who still owes you, across all bookings",

  summary: {
    label: "Still to collect",
    from: (bookings: string) => `from ${bookings}`,
    overdue: "Overdue",
    overdueBody: (count: number) => (count === 1 ? "1 guest has checked out" : `${count} guests have checked out`),
  },

  sections: {
    overdue: "Checked out — still owed",
    current: "Staying now",
    upcoming: "Upcoming",
    noAmount: "Amount not set",
    totalLabel: "Total due",
  },

  row: {
    paidOf: (paid: string, total: string) => `Paid ${paid} of ${total}`,
    due: "due",
    recordFor: (name: string) => `Record payment for ${name}`,
    left: (days: number) => (days === 1 ? "Left yesterday" : `Left ${days} days ago`),
    leaves: (days: number) => (days === 0 ? "Leaves today" : days === 1 ? "Leaves tomorrow" : `Leaves in ${days} days`),
  },

  filters: {
    source: "Booking source",
    method: "Payment method",
    overdue: "Overdue only",
    overdueHint: "Guests who have checked out with money still due",
    dates: "Check-in date",
  },

  export: {
    fileName: "payments",
    what: "payments",
    summary: (pending: number, received: number) => `${pending} pending · ${received} received`,
    pendingSheet: "Pending Payments",
    receivedSheet: "Received Payments",
    columns: {
      primaryGuest: "Primary guest",
      phone: "Phone",
      checkIn: "Check-in",
      checkOut: "Check-out",
      status: "Status",
      source: "Source",
      total: "Total (₹)",
      received: "Received (₹)",
      due: "Due (₹)",
      overdue: "Overdue",
      lastPayment: "Last payment",
      receivedOn: "Received on",
      amount: "Amount (₹)",
      method: "Method",
      note: "Note",
    },
  },

  noAmount: {
    hint: "Add the agreed total on these bookings to keep track of what's due.",
    action: "Add total",
  },

  empty: {
    title: "All settled",
    body: "Nobody owes you anything right now. Bookings with money due will show up here.",
  },
};
