const plural = (count: number, one: string, other: string) => (count === 1 ? one : other);

export const guestForm = {
  metaTitle: "Your stay",
  preview: {
    label: "Preview",
    body: "This is what your guest sees. Anything you submit is saved to the booking.",
    back: "Back to booking",
  },
  progress: (step: number, total: number) => `Step ${step} of ${total}`,
  back: "Back",
  hostedBy: (name: string) => `Hosted by ${name}`,

  welcome: {
    greeting: (firstName: string) => (firstName ? `Namaste, ${firstName}` : "Namaste"),
    body: "Please add the details of everyone staying before you arrive. It takes about 2 minutes.",
    why: "Your host keeps a simple record of everyone who stays. Adding it now means a quicker check-in.",
    checkIn: "Check-in",
    checkOut: "Check-out",
    guests: "Guests",
    roomsBooked: "Rooms booked",
    wholeBooked: "Entire property",
    from: (time: string) => `from ${time}`,
    by: (time: string) => `by ${time}`,
    start: "Start",
    alreadyTitle: "Details already added — thank you!",
    alreadyBody: (count: number) =>
      `You've added ${count} ${plural(count, "guest", "guests")}. You can review or change anything before your stay.`,
    review: "Review or change details",
    privacy: (retention: string) =>
      `Your details are private and encrypted. ID photos are deleted ${retention} after your stay.`,
  },

  you: {
    title: "Your details",
    subtitle: "You're the person who booked.",
    phoneHint: "Your host will use this to reach you.",
  },

  others: {
    title: "Who else is staying?",
    subtitle: (others: number) =>
      others === 1
        ? "Your booking is for 2 guests. Add the other person — you can fill it in yourself."
        : `Your booking is for ${others + 1} guests. Add the other ${others} — you can fill everything in yourself.`,
    slot: (index: number) => `Guest ${index}`,
    slotHint: "Add details",
    addAnother: "Add another person",
    edit: "Edit",
    requiredNote: "Add a name for everyone staying. A mobile number is optional.",
    missing: (count: number) =>
      count === 1 ? "Add the last guest's name to continue." : `Add ${count} more names to continue.`,
    notComing: "Someone not coming? Message your host to update the booking.",
    sheetAddTitle: "Add guest",
    sheetEditTitle: "Edit guest",
    sheetDescription: "Name is enough. A mobile number is optional.",
    save: "Save guest",
    remove: "Remove",
    added: (count: number, total: number) => `${count} of ${total} added`,
  },

  id: {
    title: "Photo ID",
    subtitleOptional: "Optional. Your host would like a photo ID for each guest.",
    subtitleRequired: "Your host needs a photo ID for each guest.",
    add: "Add ID",
    change: "Change",
    sheetTitle: (name: string) => `Photo ID for ${name}`,
    sheetDescription: "Choose the ID, then take a photo of the front.",
    save: "Save ID",
    trust: (retention: string) =>
      `Only the last 4 digits are kept. Aadhaar numbers are hidden on your phone before anything is sent. Photos are deleted automatically ${retention} after your stay.`,
    skipOptional: "You can submit without ID and show it at check-in.",
    skipRequired: "No ID right now? You can still submit and show it at check-in.",
    summary: (added: number, total: number) => `${added} of ${total} added`,
  },

  submit: "Submit details",
  continue: "Continue",
  submitting: "Sending…",
  submitError: "We couldn't send your details. Please check your connection and try again.",

  done: {
    title: (firstName: string) => (firstName ? `All done, ${firstName}` : "All done"),
    subtitle: (host: string) => `${host} has your details. See you soon!`,
    guestsAdded: (count: number) => `${count} ${plural(count, "guest", "guests")} added`,
    idsAdded: (count: number) => `${count} ${plural(count, "ID", "IDs")} added`,
    change: "Need to change something? Open this link again any time before check-out.",
    message: (host: string) => `Message ${host} on WhatsApp`,
    edit: "Review my details",
  },

  unavailable: {
    notFoundTitle: "This link doesn't work",
    notFoundBody: "Please check the link with your host — it may have been typed or copied incorrectly.",
    expiredTitle: "This link has expired",
    expiredBody: (date: string) =>
      `It stopped working after check-out on ${date}. Contact your host if you need anything.`,
    cancelledTitle: "This booking was cancelled",
    cancelledBody: "Please contact your host if you think this is a mistake.",
    contactHost: (host: string) => `Message ${host}`,
  },

  retention: (days: number) =>
    days >= 365 && days % 365 === 0
      ? `${days / 365} ${plural(days / 365, "year", "years")}`
      : days >= 30 && days % 30 === 0
        ? `${days / 30} ${plural(days / 30, "month", "months")}`
        : `${days} ${plural(days, "day", "days")}`,
};
