import { site } from "@/config/site";
import type { BookingSource, ISODate } from "@/domain/types";

/** A booking row on the home page's app preview. */
interface SampleBooking {
  name: string;
  dates: string;
  checkIn: ISODate;
  guests: number;
  source: BookingSource;
  details: "complete" | "waiting" | "not_sent";
  payment: string;
}

const SAMPLE_BOOKINGS: SampleBooking[] = [
  {
    name: "Emma Wilson",
    dates: "3–6 Oct",
    checkIn: "2026-10-03",
    guests: 4,
    source: "airbnb",
    details: "complete",
    payment: "₹5,000 due",
  },
  {
    name: "Lucas Martin",
    dates: "4–6 Oct",
    checkIn: "2026-10-04",
    guests: 2,
    source: "direct",
    details: "waiting",
    payment: "Paid",
  },
  {
    name: "Mateo Garcia",
    dates: "7–10 Oct",
    checkIn: "2026-10-07",
    guests: 3,
    source: "booking_com",
    details: "not_sent",
    payment: "₹9,000 due",
  },
  {
    name: "Hannah Schmidt",
    dates: "9–11 Oct",
    checkIn: "2026-10-09",
    guests: 2,
    source: "makemytrip",
    details: "complete",
    payment: "Paid",
  },
];

/**
 * Copy for the public home page. The same text feeds the page, its search snippet,
 * the structured data (FAQ, how-to) and /llms.txt, so answers stay consistent everywhere.
 */
export const home = {
  meta: {
    /** Search result title — leads with what people search for. */
    title: `${site.name}: the guest book for homestays in India`,
    description:
      "Add a booking, send one link on WhatsApp, and your guests fill in their own details before they arrive. Payments, guest history and optional photo ID, all from your phone.",
    keywords: [
      "homestay guest register",
      "guest book app",
      "homestay management India",
      "guest check-in form",
      "homestay software",
      "guest details WhatsApp link",
      "Airbnb host guest records",
      "bed and breakfast guest register",
    ],
    ogAlt: `${site.name}: your guest book that fills itself`,
    ogSubtitle: "Send one WhatsApp link with each booking. Guests add their own details before they arrive.",
  },

  nav: {
    label: "Home page sections",
    howItWorks: "How it works",
    guests: "For guests",
    privacy: "Privacy",
    faq: "FAQ",
    signIn: "Sign in",
    getStarted: "Get started",
    // Shown instead of "Sign in" / "Get started" to an owner who is already signed in.
    openDashboard: "Open dashboard",
    continueRegistration: "Continue registration",
    skipToContent: "Skip to content",
  },

  hero: {
    eyebrow: "For homestays in India",
    /** One heading over three lines; each `accent` part is set in the brand blue. */
    title: [
      { lead: "Get", accent: "every guest's details" },
      { lead: "and", accent: "every payment" },
      { lead: "in one place, not a paper register." },
    ],
    proof: "Made for homestays in the hills, by the sea and everywhere in between",
    /** One-sentence definition — what search engines and AI assistants quote. */
    lede: `${site.name} is a simple guest book for homestay owners. Send one WhatsApp link with each booking and your guests add their own details before they arrive.`,
    primaryCta: "Start your guest book",
    secondaryCta: "Watch it work",
    /** Quick links under the buttons, each to the part of the page that explains it. */
    links: {
      label: "What's inside",
      link: "WhatsApp guest link",
      form: "What guests see",
      payments: "Payments",
      privacy: "Photo ID, your rule",
      faq: "Questions",
    },
  },

  heroVisual: {
    label: "A guest's details arriving in AtithiHQ",
    chatName: "Emma Wilson",
    chatToday: "Today",
    chatIncoming: "Hi Oliver! We have booked Sunrise Villa for 3–6 Oct, four of us.",
    chatIncomingTime: "10:38",
    chatMessage: "Namaste Emma! Please add guest details for your stay at Sunrise Villa, 3–6 Oct.",
    chatLink: "atithihq.com/g/x8k2",
    chatLinkTitle: "Sunrise Villa · Your stay",
    chatReply: "Done! Added all four of us. Thank you!",
    chatTime: "10:41",
    chatReplyTime: "10:44",
    cardTitle: "Guests",
    cardProgress: (added: number, total: number) => `${added} of ${total} added`,
    guests: ["Emma Wilson", "James Wilson", "Olivia Wilson", "Noah Wilson"],
    allIn: "All details in",
    paidLabel: "Payment",
    paidValue: "₹12,000 paid",
    /** The big floating number on the app preview. */
    statValue: "4 of 4",
    statLabel: "guests added their own details",
    windowUrl: "atithihq.com/bookings",
    greeting: "Namaste, Oliver",
    property: "Sunrise Villa · Assagao, Goa",
    /** Sample rows on the app preview. */
    bookings: SAMPLE_BOOKINGS,
  },

  sources: {
    title: "Add bookings from wherever they come",
    note: "You add each booking yourself in under a minute, whatever the source.",
    direct: "Direct & walk-ins",
  },

  how: {
    eyebrow: "How it works",
    title: "Three steps. Then the details arrive by themselves.",
    lede: "No register to fill at the gate, no photos of IDs lost in your chats.",
    stepLabel: (n: number) => `Step ${n}`,
    steps: [
      {
        title: "Add the booking",
        body: "Dates, number of guests and where the booking came from. Amount is optional. It takes under a minute.",
        heading: { lead: "Add the booking,", accent: "in under a minute" },
        points: [
          "Airbnb, Booking.com or direct",
          "Dates and number of guests",
          "Amount is optional",
          "Walk-ins and phone bookings",
        ],
      },
      {
        title: "Send one link on WhatsApp",
        body: "From your own number, in your own chat. The person who booked fills in the details for everyone staying.",
        heading: { lead: "Send one link,", accent: "on WhatsApp" },
        points: [
          "From your own number",
          "One link for the whole group",
          "No app for your guests",
          "Opens on any phone",
        ],
      },
      {
        title: "Details arrive by themselves",
        body: "Names, phone numbers and photo ID if you ask for it. Check-in becomes a hello, not paperwork.",
        heading: { lead: "Details arrive", accent: "by themselves" },
        points: ["Every guest's name", "Phone numbers", "Photo ID, if you ask", "Returning guests recognised"],
      },
    ],
    /** Labels inside the step illustrations. */
    scene: {
      newBooking: "New booking",
      guestName: "Guest name",
      dates: "Dates",
      datesValue: "3–6 Oct · 3 nights",
      guests: "Guests",
      source: "Booking from",
      saved: "Booking saved",
      guestLink: "Guest link",
      opened: "Form opened",
      openedTime: "10:42",
      waiting: "Waiting for the form",
      filled: "Guest form",
      returning: "Returning · 2nd visit",
      idMasked: "Aadhaar •••• 4821",
    },
  },

  glance: {
    title: "AtithiHQ at a glance",
    items: [
      { value: "2 min", label: "for guests to fill in the form" },
      { value: "1 link", label: "per booking, for the whole group" },
      { value: "0 apps", label: "for your guests to install" },
      { value: "4 digits", label: "the most of any ID number we keep" },
    ],
  },

  guests: {
    eyebrow: "For your guests",
    heading: { lead: "Two minutes on their phone.", accent: "No app, no sign-up." },
    lede: "The link opens in any phone browser. Your guests see your property's name, their dates and a short, friendly form.",
    points: [
      { title: "Your name, not ours", body: "Guests see your property and you as their host." },
      {
        title: "One link for the whole group",
        body: "The person who booked adds everyone, even parents who don't use smartphones.",
      },
      { title: "Clear about privacy", body: "The form explains what is kept and when ID photos are deleted." },
    ],
    previewLabel: "What your guest sees",
    preview: {
      greeting: "Namaste, Emma",
      property: "Sunrise Villa",
      location: "Assagao, Goa",
      host: "Hosted by Oliver",
      body: "Please add the details of everyone staying before you arrive. It takes about 2 minutes.",
      checkIn: "Check-in",
      checkInValue: "Fri, 3 Oct",
      checkInTime: "from 2:00 PM",
      checkOut: "Check-out",
      checkOutValue: "Mon, 6 Oct",
      checkOutTime: "by 11:00 AM",
      guests: "Guests",
      guestsValue: "4",
      start: "Start",
      privacy: "Your details are private and encrypted.",
    },
  },

  features: {
    eyebrow: "Benefits",
    title: "Everything a small homestay needs. Nothing it doesn't.",
    items: [
      {
        title: "Every booking at a glance",
        body: "Who arrives today, who is staying and who leaves. Airbnb, Booking.com, MakeMyTrip, direct or walk-in.",
      },
      {
        title: "Payments without the maths",
        body: "Record UPI, cash or bank transfers as they come in. See what is still due, booking by booking.",
      },
      {
        title: "Remembers every guest",
        body: "Returning guests are recognised by their number, with every past stay in one place.",
      },
      {
        title: "Photo ID, your rule",
        body: "Don't ask, make it optional or make it required. You decide what your property needs.",
      },
      {
        title: "Manual entry, always",
        body: "Walk-ins and phone bookings work too. Add anyone's details yourself in seconds.",
      },
      {
        title: "Feels like an app",
        body: "Add it to your home screen. Big buttons, clear text, made for a phone first.",
      },
    ],
    /** Labels inside the benefit illustrations. */
    scene: {
      today: "Today",
      upcoming: "Upcoming",
      arriving: "Arriving",
      staying: "Staying",
      leaving: "Leaving",
      total: "Total",
      totalValue: "₹12,000",
      received: "Received",
      receivedValue: "₹7,000",
      due: "Due",
      dueValue: "₹5,000",
      upi: "UPI",
      cash: "Cash",
      upiValue: "₹5,000",
      cashValue: "₹2,000",
      visits: "Visits",
      returning: "Returning · 3rd visit",
      lastStay: "Last stay: March 2026",
    },
  },

  privacy: {
    eyebrow: "Private by design",
    heading: { lead: "Guest details deserve more care", accent: "than a photo in a chat." },
    lede: "Identity documents are the most sensitive thing a homestay handles. AtithiHQ keeps as little as possible, for as short a time as possible.",
    points: [
      {
        title: "Only the last 4 digits",
        body: "Full ID numbers are never stored. Aadhaar numbers are masked before anything leaves the guest's phone.",
      },
      {
        title: "Deleted on schedule",
        body: "ID photos are encrypted and deleted automatically after the period you choose, from 30 days to a year.",
      },
      {
        title: "Only you can see them",
        body: "Guest details stay in your account. Opening an ID photo creates a private link that expires in minutes.",
      },
      {
        title: "No messages to your guests",
        body: "We never contact your guests. Every message goes from your own WhatsApp, when you choose.",
      },
    ],
    card: {
      type: "Aadhaar",
      number: "•••• •••• 4821",
      masked: "Number masked on device",
      deletes: "Photo deletes in 90 days",
    },
  },

  faq: {
    eyebrow: "Questions",
    title: "Frequently asked questions",
    panel: {
      title: "Ready when you are",
      body: "All you need is your mobile number. You can send your first guest link the same day.",
      steps: ["Sign in with a one-time code", "Add your name and your property", "Send your first guest link"],
      cta: "Start your guest book",
    },
    items: [
      {
        question: `What is ${site.name}?`,
        answer: `${site.name} is a simple guest book for homestay owners in India. You add a booking, send one link on WhatsApp, and the guest who booked fills in the details of everyone staying before they arrive. It also keeps track of payments and remembers returning guests.`,
      },
      {
        question: "Do my guests need to download an app or create an account?",
        answer:
          "No. The link opens in any phone browser. There is no app to install and no password, and the form takes about two minutes.",
      },
      {
        question: "Can I still add guest details myself?",
        answer:
          "Yes. Manual entry is always available, for walk-ins, phone bookings or guests who prefer to share details at check-in.",
      },
      {
        question: "Do guests have to upload a photo ID?",
        answer:
          "You decide. For each property you can choose not to ask for ID, make it optional, or make it required. Guests can always submit their details and show ID at check-in.",
      },
      {
        question: "How is guest ID kept safe?",
        answer:
          "Only the last 4 digits of an ID number are kept. Aadhaar numbers are masked on the guest's phone before anything is sent. ID photos are encrypted, visible only to you through links that expire in minutes, and deleted automatically after the period you choose.",
      },
      {
        question: `Does ${site.name} collect payments from guests?`,
        answer: `No. Guests pay you the way they do today. ${site.name} records the payments you receive (UPI, cash, bank transfer, card or through a booking platform) and shows what is still due.`,
      },
      {
        question: "Does it work with Airbnb, Booking.com and MakeMyTrip bookings?",
        answer: `Yes. You can record bookings from any source, including direct bookings and walk-ins. ${site.name} doesn't connect to those platforms; you add each booking yourself in under a minute.`,
      },
      {
        question: "What do I need to get started?",
        answer:
          "Just your mobile number. Sign in with a one-time code, add your name and your property's name, and you can send your first guest link straight away.",
      },
    ],
  },

  finalCta: {
    title: "Let your next guest fill in their own details.",
    body: "Sign in with your mobile number. No password, and you are ready in two minutes.",
    cta: "Start your guest book",
    secondary: "See how it works",
  },

  footer: {
    tagline: "The guest book that fills itself, for homestays in India.",
    product: "Product",
    account: "Account",
    company: "Company",
    madeIn: "Made in India",
    badges: ["Made in India", "Private by design", "Works on any phone"],
    backToTop: "Back to top",
    builtFor: "Built for homestays, villas and B&Bs across India.",
  },
};
