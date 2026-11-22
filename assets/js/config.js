/* =========================================================
   ROOTED BOTANICA — SHOP SETTINGS
   This is the one file to edit for contact details, socials,
   delivery prices and payments. Anything left as "" is hidden
   on the website automatically.
   ========================================================= */
window.SHOP_CONFIG = {
  shopName: "Rooted Botanica",
  tagline: "Carnivorous plants, grown with love",
  currency: "R", // South African Rand

  // --- How orders reach you -------------------------------
  // WhatsApp number in international format, digits only (e.g. "27821234567").
  // Use a PARENT-managed number. Leave "" to hide the WhatsApp button.
  whatsappNumber: "",
  // Email address that receives orders. Use a parent-managed address.
  orderEmail: "",

  // --- Online payment (optional) ---------------------------
  // Paste a Yoco / PayFast / SnapScan payment-page link here once a
  // parent has opened the account. Leave "" and customers will be told
  // you'll send payment details after confirming their order.
  paymentLink: "",
  paymentNote: "We'll confirm your plants are ready and send payment details (EFT or card link). Plants ship once payment clears.",

  // --- Socials (leave "" to hide) ---------------------------
  socials: {
    instagram: "", // e.g. "https://instagram.com/rootedbotanica"
    tiktok: "",
    facebook: "",
    youtube: "",
  },

  // --- Delivery options -------------------------------------
  delivery: [
    { id: "collect", label: "Collection (by arrangement)", price: 0 },
    { id: "pudo", label: "PUDO locker-to-locker", price: 70 },
    { id: "courier", label: "Door-to-door courier", price: 120 },
  ],

  // --- Care cards -------------------------------------------
  // "included" = every plant comes with a free printed care card.
  // "addon"    = customers can tick a box to add one for careCardAddonPrice.
  careCardWithPlant: "included",
  careCardAddonPrice: 10,

  // Popular searches shown under the search bar
  popularSearches: ["Venus flytrap", "Pitcher plant", "Sundew", "Beginner friendly", "Care cards"],
};
