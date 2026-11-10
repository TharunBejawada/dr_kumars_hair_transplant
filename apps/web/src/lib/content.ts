export const clinic = {
  name: "Dr. Kumar's Hair Transplant",
  phone: "+91 99639 32050",
  phoneHref: "tel:+919963932050",
  whatsappHref: "https://wa.me/919963932050",
  email: "info@drkumarshairtransplant.com",
  address:
    "Dr. Kumar’s Skin and Hair Transplantation Center, Above Ratnadeep Super Market, 301, K1 Promo Building, Kondapur, Hyderabad, Telangana 500084",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Dr.+Kumar%27s+Skin+%26+Hair+Transplant+Center+Kondapur+Hyderabad",
  social: [
    { label: "X (Twitter)", href: "https://x.com", icon: "x" },
    { label: "Facebook", href: "https://facebook.com", icon: "facebook" },
    { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
    { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
  ],
} as const;

export const nav = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Hair", href: "#treatments", tab: "Hair" },
  { label: "Skin & Cosmetic", href: "#treatments", tab: "Skin" },
  { label: "Dermatology", href: "#dermatology" },
  { label: "STD", href: "#treatments", tab: "Sti Care" },
  { label: "Blog", href: "/blogs" },
  { label: "Gallery", href: "#results" },
  { label: "Contact Us", href: "#contact" },
] as const;

export type TreatmentTab = "Skin" | "Hair" | "Body" | "Sti Care";

export const treatmentTabs: Record<
  TreatmentTab,
  { intro: string; cta: string; items: { name: string; image?: string }[] }
> = {
  Skin: {
    intro:
      "From skin rejuvenation to cosmetic enhancements, our skin treatments focus on improving skin health, texture, and appearance through individualised care.",
    cta: "View All Skin Treatments",
    items: [
      { name: "HydraFacial", image: "/images/oval1.webp" },
      { name: "Chemical Peels", image: "/images/oval2.webp" },
      { name: "MNRF Treatment", image: "/images/oval3.webp" },
      { name: "Carbon Peel Treatment", image: "/images/oval4.webp" },
      { name: "Microdermabrasion", image: "/images/oval5.webp" },
    ],
  },
  // NOTE: the Figma file only designs the "Skin" tab. Content for the other tabs is taken from the
  // footer treatment lists and has no photography yet – swap in real images/copy when supplied.
  Hair: {
    intro:
      "From FUE and DHI hair transplantation to PRP and GFC therapies, our hair treatments are planned around your hair loss pattern and goals.",
    cta: "View All Hair Treatments",
    items: [
      { name: "FUE Hair Transplant" },
      { name: "DHI" },
      { name: "Beard HT" },
      { name: "PRP Treatment" },
      { name: "GFC Treatment" },
    ],
  },
  Body: {
    intro:
      "Body treatments for hair removal, pigmentation and skin blemishes, delivered with careful assessment and aftercare.",
    cta: "View All Body Treatments",
    items: [
      { name: "Laser Hair Removal" },
      { name: "Tattoo Removal" },
      { name: "Corn Removal" },
      { name: "Intra Dermal Injections" },
      { name: "Derma Planing" },
    ],
  },
  "Sti Care": {
    intro:
      "Confidential diagnosis and management of sexually transmitted infections in a respectful, private setting.",
    cta: "View All STI Care",
    items: [
      { name: "Herpes" },
      { name: "Syphilis" },
      { name: "Genital Warts" },
      { name: "Molluscum" },
      { name: "HIV" },
    ],
  },
};

export const conditions = [
  { title: "Hair Loss & Thinning", text: "Assessment of hair shedding, pattern hair loss, and scalp conditions." },
  { title: "Acne & Pimples", text: "Management of different types of acne and related skin concerns." },
  { title: "Pigmentation Disorders", text: "Evaluation of dark spots, uneven skin tone, and pigmentation changes." },
  { title: "Eczema", text: "Treatment for itchy, inflamed, and sensitive skin." },
  { title: "Psoriasis", text: "Management of chronic inflammatory skin symptoms." },
  { title: "Vitiligo", text: "Medical care for areas of skin depigmentation." },
] as const;

export const whyChoose = [
  { title: "Experienced Dermatologist:", text: "Consult with a dermatologist experienced in skin conditions, hair restoration, and aesthetic procedures." },
  { title: "Personalised Treatment Plans:", text: "Treatment recommendations based on your condition, medical history, and individual needs." },
  { title: "Surgical & Non-Surgical Options:", text: "Explore a range of dermatology, hair restoration, and aesthetic treatment approaches." },
  { title: "Patient Privacy & Comfort:", text: "Respectful consultations with attention to confidentiality and patient comfort." },
  { title: "Clear Treatment Guidance:", text: "Understand the expected benefits, limitations, possible risks, and recovery requirements." },
  { title: "Follow-Up Support:", text: "Receive appropriate aftercare instructions and follow-up recommendations." },
] as const;

export const results = [
  { title: "Hair Transplant Results", images: ["/images/ba1.webp", "/images/ba2.webp"] },
  { title: "Hair Restoration Results", images: ["/images/ba3.webp", "/images/ba4.webp"] },
  { title: "Skin Treatment Results", images: ["/images/ba5.webp", "/images/ba6.webp"] },
] as const;

export const footerColumns = {
  left: [
    { title: "Hair", items: ["FUE Hair Transplant", "DHI", "Moustache HT", "Beard HT", "Eyebrow HT", "PRP Treatment", "GFC Treatment"] },
    { title: "Cosmetic", items: ["Semi Permanent Eyebrows", "Lip Pigmentation", "Chemical Peels", "Ear Lobe Repair"] },
    { title: "STD", items: ["Herpes", "Syphilis", "Genital Warts", "Molluscum", "HIV"] },
  ],
  right: [
    { title: "Skin care", items: ["Chemical Peels", "Carbon Peel", "Laser Hair Removal", "Microdermabrasion", "MNRF", "Intra Dermal Injections", "Tattoo Removal", "Hydra Facial"] },
    { title: "Dermatology conditions", items: ["ILS", "Psoriasis", "Seborric Dermatitis", "Urticaria", "Eczema", "Viral Warts", "Melanosis", "Vitiligo", "Derma Planning", "Milia", "Xerosis", "Xanthlasma", "Corn Removal"] },
  ],
};
