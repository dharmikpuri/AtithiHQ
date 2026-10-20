import { site } from "@/config/site";

/**
 * Placeholder legal pages. These are NOT final legal text: replace them with documents
 * reviewed by a lawyer before launch, and bump `TERMS_VERSION` in `domain/registration.ts`.
 */
export const legal = {
  back: "Back to home",
  draftTitle: "Draft placeholder",
  draftBody:
    "This page is a placeholder while the final document is being prepared. It is not legal advice and is not the final text.",
  updated: "Draft version",
  terms: {
    metaTitle: "Terms & Conditions",
    title: "Terms & Conditions",
    points: [
      `${site.name} helps homestay owners keep their guest book: bookings, guest details and payments they record.`,
      "Owners are responsible for the information they add and for how they use their guests' details.",
      "The final terms will cover accounts, acceptable use, fees, liability and how disputes are handled.",
    ],
  },
  privacy: {
    metaTitle: "Privacy Policy",
    title: "Privacy Policy",
    points: [
      "We keep the details owners and guests enter only to run the guest book.",
      "Only the last 4 digits of an ID number are kept. ID photos are deleted on the owner's schedule.",
      "The final policy will cover what is collected, why, how long it is kept, and your rights over it.",
    ],
  },
};
