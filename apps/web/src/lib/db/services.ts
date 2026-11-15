import { DeleteCommand, GetCommand, PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import {
  isServicePageLive,
  type ServicePage,
  type ServicePageInput,
  type ServiceCategoryId,
  serviceCategories,
} from "@drkumar/shared";
import { db } from "../dynamo";

const T = () => process.env.SERVICES_TABLE;

export class SlugTakenError extends Error {}

export const DEFAULT_SERVICE_PAGES: ServicePage[] = [
  {
    id: "seed-service-hair",
    serviceCategory: "hair",
    title: "Advanced Hair Loss & Hair Restoration Treatments in Kondapur, Hyderabad",
    slug: "hair",
    subtitle: "Personalised Care for Hair Fall, Thinning Hair & Baldness",
    image: "/images/services-hero-sample.jpg",
    imageAlt: "Advanced Hair Loss & Hair Restoration Treatments - Dr. Kumar's",
    ctaText: "Book a Consultation",
    ctaLink: "#appointment",
    status: "published",
    order: 1,
    seoTitle: "Advanced Hair Loss & Hair Restoration Treatments in Kondapur, Hyderabad",
    metaDescription:
      "Personalised care for hair fall, thinning hair, baldness and advanced hair restoration procedures by Dr. Kumar in Kondapur, Hyderabad.",
    metaKeywords:
      "hair loss treatment kondapur, hair restoration hyderabad, hair transplant kondapur, dr ashok kumar, FUE hair transplant, DHI hair transplant, PRP hair treatment, GFC therapy, hair fall treatment hyderabad",
    concernsSection: {
      tagline: "Understanding Your Hair Concerns",
      heading: "Different Hair Problems Need Different Treatment Approaches",
      description:
        "Hair loss does not always begin with visible baldness. Some people notice excessive hair shedding, while others experience gradual thinning or changes in their hairline.",
      items: [
        { id: "c1", title: "Excessive hair fall", image: "/images/concerns/excessive-hair-fall.webp" },
        { id: "c2", title: "Receding hairline", image: "/images/concerns/receding-hairline.webp" },
        { id: "c3", title: "Male pattern baldness", image: "/images/concerns/male-pattern-baldness.webp" },
        { id: "c4", title: "Female pattern hair loss", image: "/images/concerns/female-pattern-hair-loss.webp" },
        { id: "c5", title: "Thinning hair at the crown", image: "/images/concerns/thinning-hair-crown.webp" },
        { id: "c6", title: "Bald patches", image: "/images/concerns/bald-patches.webp" },
        { id: "c7", title: "Widening hair parting", image: "/images/concerns/widening-hair-parting.webp" },
        { id: "c8", title: "Reduced hair density", image: "/images/concerns/reduced-hair-density.webp" },
      ],
      sideCard: {
        image: "/images/concerns/side-woman.webp",
        text1:
          "Early evaluation can help identify possible causes and determine whether medical treatment, supportive procedures, or hair transplantation may be appropriate.",
        text2:
          "At Dr. Kumar’s Skin & Hair Transplant Center, patients looking for a hair specialist in Kondapur, Hyderabad can receive individualised assessment and guidance for different hair loss concerns.",
        ctaText: "Consult Our Hair Specialist",
        ctaLink: "#appointment",
      },
    },
    treatmentsSection: {
      tagline: "Our Hair Treatments",
      heading: "Explore Our Range of Hair Restoration Services",
      description:
        "From medical hair loss management to specialised hair transplantation techniques, we offer treatment options for different hair and scalp concerns.",
      items: [
        {
          id: "ht1",
          title: "Stem Cell Hair Therapy",
          description:
            "An experimental regenerative approach being studied for hair restoration. Its safety and effectiveness are not yet established.",
          image: "/images/treatments/stem-cell-therapy.webp",
          ctaText: "Know More",
          ctaLink: "#appointment",
        },
        {
          id: "ht2",
          title: "Human-Derived Exosomes Hair Treatment",
          description:
            "An emerging approach being investigated for hair and scalp applications, with limited evidence of clinical effectiveness and long-term safety.",
          image: "/images/treatments/human-exosomes.webp",
          ctaText: "Know More",
          ctaLink: "#appointment",
        },
        {
          id: "ht3",
          title: "Dutasteride Mesotherapy",
          description:
            "An off-label treatment involving scalp injections of dutasteride for androgen-related hair loss, with limited clinical evidence.",
          image: "/images/treatments/dutasteride-mesotherapy.webp",
          ctaText: "Know More",
          ctaLink: "#appointment",
        },
        {
          id: "ht4",
          title: "Female Hair Transplant",
          description:
            "A surgical hair restoration procedure for suitable women experiencing stable hair thinning or hair loss in specific areas.",
          image: "/images/treatments/female-hair-transplant.webp",
          ctaText: "Know More",
          ctaLink: "#appointment",
        },
        {
          id: "ht5",
          title: "Hair Transplant",
          description:
            "A surgical procedure that transfers healthy hair follicles to areas affected by thinning hair or baldness.",
          image: "/images/treatments/hair-transplant.webp",
          ctaText: "Know More",
          ctaLink: "#appointment",
        },
        {
          id: "ht6",
          title: "GFC Hair Treatment",
          description:
            "A blood-derived growth factor treatment considered for selected hair thinning concerns, although evidence remains limited.",
          image: "/images/treatments/gfc-treatment.webp",
          ctaText: "Know More",
          ctaLink: "#appointment",
        },
        {
          id: "ht7",
          title: "Hair Loss Treatment",
          description:
            "Personalised medical evaluation and treatment to identify and manage different causes of excessive hair fall and thinning.",
          image: "/images/treatments/hair-loss-treatment.webp",
          ctaText: "Know More",
          ctaLink: "#appointment",
        },
        {
          id: "ht8",
          title: "Hair Transplant Clinic",
          description:
            "Specialist consultations, scalp assessments, and personalised planning for medical and surgical hair restoration.",
          image: "/images/treatments/hair-transplant-clinic.webp",
          ctaText: "Know More",
          ctaLink: "#appointment",
        },
      ],
      viewMoreText: "View More",
      viewMoreLink: "#appointment",
    },
    assessmentSection: {
      tagline: "Which Hair Treatment Is Right for You?",
      heading: "The Right Solution Begins With Understanding Your Hair Loss",
      description:
        "Not every hair concern requires the same treatment. Some conditions can be managed medically, while others may benefit from hair transplantation.",
      factorsLead: "Several factors influence treatment selection:",
      factors: [
        { id: "f1", text: "Type and severity of hair loss" },
        { id: "f2", text: "Age and medical history" },
        { id: "f3", text: "Hair and scalp condition" },
        { id: "f4", text: "Pattern of thinning or baldness" },
        { id: "f5", text: "Donor hair availability" },
        { id: "f6", text: "Previous treatment history" },
        { id: "f7", text: "Individual treatment expectations" },
      ],
      note:
        "At Dr. Kumar’s Skin & Hair Transplant Center, we assess these factors to recommend appropriate treatment options based on clinical findings and individual needs. Patients searching for the best doctor for hair loss treatment in Kondapur, Hyderabad can consult Dr. Ashok Kumar for a detailed hair and scalp evaluation and personalised treatment recommendations.",
      image: "/images/scalp-examination.webp",
      imageAlt: "Clinical scalp examination by hair specialist",
      ctaText: "",
      ctaLink: "#appointment",
    },
    doctorSection: {
      tagline: "Meet Your Hair Restoration Specialist",
      name: "Dr. Ashok Kumar",
      designation: "Dermatologist | Hair Transplant Specialist",
      experience: "13+ Years of Experience",
      bioParagraphs: [
        "Dr. Ashok Kumar is an experienced dermatologist specialising in hair loss management, hair transplantation, and scalp conditions.",
        "His expertise includes FUE and DHI hair transplantation, PRP and GFC treatments, and facial hair restoration. He focuses on accurate diagnosis, personalised treatment planning, patient safety, and natural-looking hair restoration.",
        "For individuals searching for a hair transplant specialist in Kondapur, Hyderabad, Dr. Ashok Kumar provides consultation and treatment planning based on hair loss patterns, donor hair availability, and individual restoration goals.",
      ],
      image: "/images/doctor-specialist.webp",
      imageAlt: "Dr. Ashok Kumar - Dermatologist and Hair Transplant Specialist",
      ctaText: "Book a Consultation With Dr. Ashok Kumar",
      ctaLink: "#appointment",
    },
    faqSection: {
      heading: "Frequently Asked Questions",
      items: [
        {
          id: "faq1",
          question: "What are the common causes of hair loss?",
          answer:
            "Hair loss can result from genetics, hormonal changes, nutritional deficiencies, medical conditions, medications, and scalp disorders. A dermatologist can help identify the possible cause through clinical evaluation.",
        },
        {
          id: "faq2",
          question: "How long does it take to see results after a hair transplant?",
          answer:
            "Transplanted hair typically sheds during the first month, begins new growth around 3 to 4 months, and reaches full density and natural maturation at 9 to 12 months post-procedure.",
        },
        {
          id: "faq3",
          question: "Can hair loss be treated without a hair transplant?",
          answer:
            "Yes, many causes of hair fall and early thinning can be managed effectively with topical medications, oral therapies, PRP/GFC treatments, and lifestyle or nutritional corrections without surgery.",
        },
        {
          id: "faq4",
          question: "Can a receding hairline be treated?",
          answer:
            "Yes, receding hairlines can be stabilized medically in early stages and cosmetically restored with precision FUE or DHI transplantation for advanced recession.",
        },
        {
          id: "faq5",
          question: "What is the difference between FUE and DHI hair transplantation?",
          answer:
            "FUE involves extracting donor follicles and creating recipient sites before implantation. DHI uses a specialized implanter pen to create sites and insert follicles simultaneously, offering precise depth and angle control.",
        },
        {
          id: "faq6",
          question: "Is hair transplantation a permanent solution?",
          answer:
            "Yes, hair follicles harvested from the permanent donor zone (back and sides of the scalp) are genetically resistant to DHT and continue to grow naturally for life.",
        },
        {
          id: "faq7",
          question: "Are PRP and GFC treatments effective for hair loss?",
          answer:
            "PRP and GFC utilize autologous growth factors from your blood to stimulate sluggish follicles and improve hair density, particularly effective for early-stage hair thinning.",
        },
        {
          id: "faq8",
          question: "Why choose Dr. Kumar's Skin & Hair Transplant Center for hair treatments?",
          answer:
            "Dr. Kumar brings over 13 years of specialized clinical dermatology and hair restoration expertise, providing physician-performed procedures, transparent evaluations, and personalized care plans.",
        },
        {
          id: "faq9",
          question: "Is hair transplantation suitable for women?",
          answer:
            "Yes, suitable women experiencing stable localized thinning, traction alopecia, or pattern hair loss with adequate donor density can achieve excellent, natural-looking results.",
        },
        {
          id: "faq10",
          question: "How can I book a hair consultation with Dr. Ashok Kumar?",
          answer:
            "You can book a consultation easily by clicking 'Book a Consultation' on this page, calling our clinic directly, or visiting our center in Kondapur, Hyderabad.",
        },
      ],
    },
    sections: {},
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
  {
    id: "seed-service-skin",
    serviceCategory: "skin-cosmetic",
    title: "Cosmetic & Skin Rejuvenation Treatments in Kondapur, Hyderabad",
    slug: "skin-cosmetic",
    subtitle: "Personalised Care for Glowing, Radiant & Healthy Skin",
    image: "/images/oval1.webp",
    imageAlt: "Cosmetic & Skin Rejuvenation Treatments",
    ctaText: "Book a Consultation",
    ctaLink: "#appointment",
    status: "published",
    order: 2,
    seoTitle: "Cosmetic & Skin Rejuvenation Treatments | Dr. Kumar's",
    metaDescription:
      "Comprehensive aesthetic treatments including HydraFacial, Chemical Peels, MNRF, and skin glow solutions tailored to your unique skin.",
    metaKeywords:
      "skin clinic kondapur, cosmetic dermatology hyderabad, chemical peel, hydrafacial hyderabad, anti aging treatment, acne scar removal, skin rejuvenation",
    concernsSection: {
      tagline: "Understanding Your Skin Concerns",
      heading: "Targeted Solutions for Healthier, Rejuvenated Skin",
      description:
        "Every skin type has unique requirements. We address dullness, uneven texture, acne marks, and age-related changes with medical precision.",
      items: [
        { id: "s1", title: "Acne & breakouts", image: "/images/oval1.webp" },
        { id: "s2", title: "Pigmentation & spots", image: "/images/oval2.webp" },
        { id: "s3", title: "Fine lines & wrinkles", image: "/images/oval3.webp" },
        { id: "s4", title: "Dull & tired skin", image: "/images/oval4.webp" },
      ],
      sideCard: {
        image: "/images/oval2.webp",
        text1: "Comprehensive dermatology consultations help create a personalised protocol matching your skin goals.",
        text2: "Consult with Dr. Kumar for clinical facials, peels, and advanced laser therapies in Kondapur, Hyderabad.",
        ctaText: "Consult Our Skin Specialist",
        ctaLink: "#appointment",
      },
    },
    treatmentsSection: {
      tagline: "Our Skin & Cosmetic Treatments",
      heading: "Comprehensive Aesthetic & Skin Rejuvenation Services",
      description:
        "From revitalising clinical facials to advanced laser and peel therapies, we provide medical-grade aesthetic procedures tailored to your skin type.",
      items: [
        {
          id: "st1",
          title: "HydraFacial Deep Cleanse",
          description: "Multi-step medical facial that exfoliates, extracts impurities, and infuses restorative antioxidant serums.",
          image: "/images/oval1.webp",
          ctaText: "Know More",
          ctaLink: "#appointment",
        },
        {
          id: "st2",
          title: "Chemical Peels",
          description: "Dermatological exfoliation for dark marks, superficial melasma, sun damage, and acne-prone skin.",
          image: "/images/oval2.webp",
          ctaText: "Know More",
          ctaLink: "#appointment",
        },
        {
          id: "st3",
          title: "Laser Skin Toning",
          description: "Q-Switched Nd:YAG laser treatments targeting deep pigmentation, tattoo removal, and photo-rejuvenation.",
          image: "/images/oval3.webp",
          ctaText: "Know More",
          ctaLink: "#appointment",
        },
        {
          id: "st4",
          title: "Carbon Laser Peel",
          description: "Hollywood peel protocol targeting enlarged pores, excess sebum production, and uneven skin tone.",
          image: "/images/oval4.webp",
          ctaText: "Know More",
          ctaLink: "#appointment",
        },
      ],
      viewMoreText: "View More",
      viewMoreLink: "#appointment",
    },
    assessmentSection: {
      tagline: "Which Hair Treatment Is Right for You?",
      heading: "The Right Solution Begins With Understanding Your Hair Loss",
      description:
        "Not every hair concern requires the same treatment. Some conditions can be managed medically, while others may benefit from hair transplantation.",
      factorsLead: "Several factors influence treatment selection:",
      factors: [
        { id: "f1", text: "Type and severity of hair loss" },
        { id: "f2", text: "Age and medical history" },
        { id: "f3", text: "Hair and scalp condition" },
        { id: "f4", text: "Pattern of thinning or baldness" },
        { id: "f5", text: "Donor hair availability" },
        { id: "f6", text: "Previous treatment history" },
        { id: "f7", text: "Individual treatment expectations" },
      ],
      note:
        "At Dr. Kumar’s Skin & Hair Transplant Center, we assess these factors to recommend appropriate treatment options based on clinical findings and individual needs. Patients searching for the best doctor for hair loss treatment in Kondapur, Hyderabad can consult Dr. Ashok Kumar for a detailed hair and scalp evaluation and personalised treatment recommendations.",
      image: "/images/scalp-examination.webp",
      imageAlt: "Clinical scalp examination by hair specialist",
      ctaText: "",
      ctaLink: "#appointment",
    },
    doctorSection: {
      tagline: "Meet Your Hair Restoration Specialist",
      name: "Dr. Ashok Kumar",
      designation: "Dermatologist | Hair Transplant Specialist",
      experience: "13+ Years of Experience",
      bioParagraphs: [
        "Dr. Ashok Kumar is an experienced dermatologist specialising in hair loss management, hair transplantation, and scalp conditions.",
        "His expertise includes FUE and DHI hair transplantation, PRP and GFC treatments, and facial hair restoration. He focuses on accurate diagnosis, personalised treatment planning, patient safety, and natural-looking hair restoration.",
        "For individuals searching for a hair transplant specialist in Kondapur, Hyderabad, Dr. Ashok Kumar provides consultation and treatment planning based on hair loss patterns, donor hair availability, and individual restoration goals.",
      ],
      image: "/images/doctor-specialist.webp",
      imageAlt: "Dr. Ashok Kumar - Dermatologist and Hair Transplant Specialist",
      ctaText: "Book a Consultation With Dr. Ashok Kumar",
      ctaLink: "#appointment",
    },
    faqSection: {
      heading: "Frequently Asked Questions",
      items: [
        {
          id: "faq1",
          question: "What are the common causes of hair loss?",
          answer:
            "Hair loss can result from genetics, hormonal changes, nutritional deficiencies, medical conditions, medications, and scalp disorders. A dermatologist can help identify the possible cause through clinical evaluation.",
        },
        {
          id: "faq2",
          question: "How long does it take to see results after a hair transplant?",
          answer:
            "Transplanted hair typically sheds during the first month, begins new growth around 3 to 4 months, and reaches full density and natural maturation at 9 to 12 months post-procedure.",
        },
        {
          id: "faq3",
          question: "Can hair loss be treated without a hair transplant?",
          answer:
            "Yes, many causes of hair fall and early thinning can be managed effectively with topical medications, oral therapies, PRP/GFC treatments, and lifestyle or nutritional corrections without surgery.",
        },
        {
          id: "faq4",
          question: "Can a receding hairline be treated?",
          answer:
            "Yes, receding hairlines can be stabilized medically in early stages and cosmetically restored with precision FUE or DHI transplantation for advanced recession.",
        },
        {
          id: "faq5",
          question: "What is the difference between FUE and DHI hair transplantation?",
          answer:
            "FUE involves extracting donor follicles and creating recipient sites before implantation. DHI uses a specialized implanter pen to create sites and insert follicles simultaneously, offering precise depth and angle control.",
        },
        {
          id: "faq6",
          question: "Is hair transplantation a permanent solution?",
          answer:
            "Yes, hair follicles harvested from the permanent donor zone (back and sides of the scalp) are genetically resistant to DHT and continue to grow naturally for life.",
        },
        {
          id: "faq7",
          question: "Are PRP and GFC treatments effective for hair loss?",
          answer:
            "PRP and GFC utilize autologous growth factors from your blood to stimulate sluggish follicles and improve hair density, particularly effective for early-stage hair thinning.",
        },
        {
          id: "faq8",
          question: "Why choose Dr. Kumar's Skin & Hair Transplant Center for hair treatments?",
          answer:
            "Dr. Kumar brings over 13 years of specialized clinical dermatology and hair restoration expertise, providing physician-performed procedures, transparent evaluations, and personalized care plans.",
        },
        {
          id: "faq9",
          question: "Is hair transplantation suitable for women?",
          answer:
            "Yes, suitable women experiencing stable localized thinning, traction alopecia, or pattern hair loss with adequate donor density can achieve excellent, natural-looking results.",
        },
        {
          id: "faq10",
          question: "How can I book a hair consultation with Dr. Ashok Kumar?",
          answer:
            "You can book a consultation easily by clicking 'Book a Consultation' on this page, calling our clinic directly, or visiting our center in Kondapur, Hyderabad.",
        },
      ],
    },
    sections: {},
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
  {
    id: "seed-service-dermatology",
    serviceCategory: "dermatology",
    title: "Expert Clinical Dermatology & Skin Care in Kondapur, Hyderabad",
    slug: "dermatology",
    subtitle: "Evidence-Based Solutions for Chronic & Complex Skin Conditions",
    image: "/images/oval3.webp",
    imageAlt: "Clinical Dermatology & Skin Care",
    ctaText: "Book a Consultation",
    ctaLink: "#appointment",
    status: "published",
    order: 3,
    seoTitle: "Clinical Dermatology & Skin Disease Management | Dr. Kumar's",
    metaDescription:
      "Expert medical diagnosis and management for psoriasis, eczema, acne, vitiligo, and various skin allergies and infections.",
    metaKeywords:
      "dermatologist kondapur, skin specialist hyderabad, psoriasis treatment, eczema care, fungal infection treatment, allergy testing, vitiligo specialist",
    treatmentsSection: {
      tagline: "Our Clinical Dermatology Care",
      heading: "Specialised Medical Management for Skin Diseases",
      description:
        "Comprehensive diagnostic evaluations and targeted therapies for inflammatory, autoimmune, allergic, and infectious skin disorders.",
      items: [
        {
          id: "dt1",
          title: "Acne & Acne Scar Management",
          description: "Customised medical treatment protocols combining systemic therapies, topical regimens, and subcision/MNRF.",
          image: "/images/oval1.webp",
          ctaText: "Know More",
          ctaLink: "#appointment",
        },
        {
          id: "dt2",
          title: "Psoriasis & Eczema Therapy",
          description: "Evidence-based management to calm inflammation, manage flare-ups, and restore epidermal barrier health.",
          image: "/images/oval3.webp",
          ctaText: "Know More",
          ctaLink: "#appointment",
        },
      ],
      viewMoreText: "View More",
      viewMoreLink: "#appointment",
    },
    assessmentSection: {
      tagline: "Which Hair Treatment Is Right for You?",
      heading: "The Right Solution Begins With Understanding Your Hair Loss",
      description:
        "Not every hair concern requires the same treatment. Some conditions can be managed medically, while others may benefit from hair transplantation.",
      factorsLead: "Several factors influence treatment selection:",
      factors: [
        { id: "f1", text: "Type and severity of hair loss" },
        { id: "f2", text: "Age and medical history" },
        { id: "f3", text: "Hair and scalp condition" },
        { id: "f4", text: "Pattern of thinning or baldness" },
        { id: "f5", text: "Donor hair availability" },
        { id: "f6", text: "Previous treatment history" },
        { id: "f7", text: "Individual treatment expectations" },
      ],
      note:
        "At Dr. Kumar’s Skin & Hair Transplant Center, we assess these factors to recommend appropriate treatment options based on clinical findings and individual needs. Patients searching for the best doctor for hair loss treatment in Kondapur, Hyderabad can consult Dr. Ashok Kumar for a detailed hair and scalp evaluation and personalised treatment recommendations.",
      image: "/images/scalp-examination.webp",
      imageAlt: "Clinical scalp examination by hair specialist",
      ctaText: "",
      ctaLink: "#appointment",
    },
    doctorSection: {
      tagline: "Meet Your Hair Restoration Specialist",
      name: "Dr. Ashok Kumar",
      designation: "Dermatologist | Hair Transplant Specialist",
      experience: "13+ Years of Experience",
      bioParagraphs: [
        "Dr. Ashok Kumar is an experienced dermatologist specialising in hair loss management, hair transplantation, and scalp conditions.",
        "His expertise includes FUE and DHI hair transplantation, PRP and GFC treatments, and facial hair restoration. He focuses on accurate diagnosis, personalised treatment planning, patient safety, and natural-looking hair restoration.",
        "For individuals searching for a hair transplant specialist in Kondapur, Hyderabad, Dr. Ashok Kumar provides consultation and treatment planning based on hair loss patterns, donor hair availability, and individual restoration goals.",
      ],
      image: "/images/doctor-specialist.webp",
      imageAlt: "Dr. Ashok Kumar - Dermatologist and Hair Transplant Specialist",
      ctaText: "Book a Consultation With Dr. Ashok Kumar",
      ctaLink: "#appointment",
    },
    faqSection: {
      heading: "Frequently Asked Questions",
      items: [
        {
          id: "faq1",
          question: "What are the common causes of hair loss?",
          answer:
            "Hair loss can result from genetics, hormonal changes, nutritional deficiencies, medical conditions, medications, and scalp disorders. A dermatologist can help identify the possible cause through clinical evaluation.",
        },
        {
          id: "faq2",
          question: "How long does it take to see results after a hair transplant?",
          answer:
            "Transplanted hair typically sheds during the first month, begins new growth around 3 to 4 months, and reaches full density and natural maturation at 9 to 12 months post-procedure.",
        },
        {
          id: "faq3",
          question: "Can hair loss be treated without a hair transplant?",
          answer:
            "Yes, many causes of hair fall and early thinning can be managed effectively with topical medications, oral therapies, PRP/GFC treatments, and lifestyle or nutritional corrections without surgery.",
        },
        {
          id: "faq4",
          question: "Can a receding hairline be treated?",
          answer:
            "Yes, receding hairlines can be stabilized medically in early stages and cosmetically restored with precision FUE or DHI transplantation for advanced recession.",
        },
        {
          id: "faq5",
          question: "What is the difference between FUE and DHI hair transplantation?",
          answer:
            "FUE involves extracting donor follicles and creating recipient sites before implantation. DHI uses a specialized implanter pen to create sites and insert follicles simultaneously, offering precise depth and angle control.",
        },
        {
          id: "faq6",
          question: "Is hair transplantation a permanent solution?",
          answer:
            "Yes, hair follicles harvested from the permanent donor zone (back and sides of the scalp) are genetically resistant to DHT and continue to grow naturally for life.",
        },
        {
          id: "faq7",
          question: "Are PRP and GFC treatments effective for hair loss?",
          answer:
            "PRP and GFC utilize autologous growth factors from your blood to stimulate sluggish follicles and improve hair density, particularly effective for early-stage hair thinning.",
        },
        {
          id: "faq8",
          question: "Why choose Dr. Kumar's Skin & Hair Transplant Center for hair treatments?",
          answer:
            "Dr. Kumar brings over 13 years of specialized clinical dermatology and hair restoration expertise, providing physician-performed procedures, transparent evaluations, and personalized care plans.",
        },
        {
          id: "faq9",
          question: "Is hair transplantation suitable for women?",
          answer:
            "Yes, suitable women experiencing stable localized thinning, traction alopecia, or pattern hair loss with adequate donor density can achieve excellent, natural-looking results.",
        },
        {
          id: "faq10",
          question: "How can I book a hair consultation with Dr. Ashok Kumar?",
          answer:
            "You can book a consultation easily by clicking 'Book a Consultation' on this page, calling our clinic directly, or visiting our center in Kondapur, Hyderabad.",
        },
      ],
    },
    sections: {},
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
  {
    id: "seed-service-std",
    serviceCategory: "std",
    title: "Confidential STI & Sexual Health Consultations in Kondapur, Hyderabad",
    slug: "std",
    subtitle: "Discreet, Compassionate & Non-Judgmental Medical Care",
    image: "/images/oval5.webp",
    imageAlt: "Confidential STI Care",
    ctaText: "Book a Consultation",
    ctaLink: "#appointment",
    status: "published",
    order: 4,
    seoTitle: "Confidential STI & Sexual Health Diagnosis & Care | Dr. Kumar's",
    metaDescription:
      "Private and respectful assessment, testing, and comprehensive medical management for sexually transmitted infections.",
    metaKeywords:
      "std clinic hyderabad, sti testing kondapur, confidential sexual health, dermatologist std treatment, confidential consultation hyderabad",
    treatmentsSection: {
      tagline: "Our Confidential Sexual Health Services",
      heading: "Private, Compassionate & Comprehensive STI Care",
      description:
        "Discreet doctor consultations, confidential diagnostic blood & swab panels, and evidence-based therapeutic care in a secure clinic environment.",
      items: [
        {
          id: "stt1",
          title: "Confidential STI Screening",
          description: "Complete laboratory testing panels for bacterial and viral infections with private results consultation.",
          image: "/images/oval5.webp",
          ctaText: "Know More",
          ctaLink: "#appointment",
        },
      ],
      viewMoreText: "View More",
      viewMoreLink: "#appointment",
    },
    assessmentSection: {
      tagline: "Which Hair Treatment Is Right for You?",
      heading: "The Right Solution Begins With Understanding Your Hair Loss",
      description:
        "Not every hair concern requires the same treatment. Some conditions can be managed medically, while others may benefit from hair transplantation.",
      factorsLead: "Several factors influence treatment selection:",
      factors: [
        { id: "f1", text: "Type and severity of hair loss" },
        { id: "f2", text: "Age and medical history" },
        { id: "f3", text: "Hair and scalp condition" },
        { id: "f4", text: "Pattern of thinning or baldness" },
        { id: "f5", text: "Donor hair availability" },
        { id: "f6", text: "Previous treatment history" },
        { id: "f7", text: "Individual treatment expectations" },
      ],
      note:
        "At Dr. Kumar’s Skin & Hair Transplant Center, we assess these factors to recommend appropriate treatment options based on clinical findings and individual needs. Patients searching for the best doctor for hair loss treatment in Kondapur, Hyderabad can consult Dr. Ashok Kumar for a detailed hair and scalp evaluation and personalised treatment recommendations.",
      image: "/images/scalp-examination.webp",
      imageAlt: "Clinical scalp examination by hair specialist",
      ctaText: "",
      ctaLink: "#appointment",
    },
    doctorSection: {
      tagline: "Meet Your Hair Restoration Specialist",
      name: "Dr. Ashok Kumar",
      designation: "Dermatologist | Hair Transplant Specialist",
      experience: "13+ Years of Experience",
      bioParagraphs: [
        "Dr. Ashok Kumar is an experienced dermatologist specialising in hair loss management, hair transplantation, and scalp conditions.",
        "His expertise includes FUE and DHI hair transplantation, PRP and GFC treatments, and facial hair restoration. He focuses on accurate diagnosis, personalised treatment planning, patient safety, and natural-looking hair restoration.",
        "For individuals searching for a hair transplant specialist in Kondapur, Hyderabad, Dr. Ashok Kumar provides consultation and treatment planning based on hair loss patterns, donor hair availability, and individual restoration goals.",
      ],
      image: "/images/doctor-specialist.webp",
      imageAlt: "Dr. Ashok Kumar - Dermatologist and Hair Transplant Specialist",
      ctaText: "Book a Consultation With Dr. Ashok Kumar",
      ctaLink: "#appointment",
    },
    faqSection: {
      heading: "Frequently Asked Questions",
      items: [
        {
          id: "faq1",
          question: "What are the common causes of hair loss?",
          answer:
            "Hair loss can result from genetics, hormonal changes, nutritional deficiencies, medical conditions, medications, and scalp disorders. A dermatologist can help identify the possible cause through clinical evaluation.",
        },
        {
          id: "faq2",
          question: "How long does it take to see results after a hair transplant?",
          answer:
            "Transplanted hair typically sheds during the first month, begins new growth around 3 to 4 months, and reaches full density and natural maturation at 9 to 12 months post-procedure.",
        },
        {
          id: "faq3",
          question: "Can hair loss be treated without a hair transplant?",
          answer:
            "Yes, many causes of hair fall and early thinning can be managed effectively with topical medications, oral therapies, PRP/GFC treatments, and lifestyle or nutritional corrections without surgery.",
        },
        {
          id: "faq4",
          question: "Can a receding hairline be treated?",
          answer:
            "Yes, receding hairlines can be stabilized medically in early stages and cosmetically restored with precision FUE or DHI transplantation for advanced recession.",
        },
        {
          id: "faq5",
          question: "What is the difference between FUE and DHI hair transplantation?",
          answer:
            "FUE involves extracting donor follicles and creating recipient sites before implantation. DHI uses a specialized implanter pen to create sites and insert follicles simultaneously, offering precise depth and angle control.",
        },
        {
          id: "faq6",
          question: "Is hair transplantation a permanent solution?",
          answer:
            "Yes, hair follicles harvested from the permanent donor zone (back and sides of the scalp) are genetically resistant to DHT and continue to grow naturally for life.",
        },
        {
          id: "faq7",
          question: "Are PRP and GFC treatments effective for hair loss?",
          answer:
            "PRP and GFC utilize autologous growth factors from your blood to stimulate sluggish follicles and improve hair density, particularly effective for early-stage hair thinning.",
        },
        {
          id: "faq8",
          question: "Why choose Dr. Kumar's Skin & Hair Transplant Center for hair treatments?",
          answer:
            "Dr. Kumar brings over 13 years of specialized clinical dermatology and hair restoration expertise, providing physician-performed procedures, transparent evaluations, and personalized care plans.",
        },
        {
          id: "faq9",
          question: "Is hair transplantation suitable for women?",
          answer:
            "Yes, suitable women experiencing stable localized thinning, traction alopecia, or pattern hair loss with adequate donor density can achieve excellent, natural-looking results.",
        },
        {
          id: "faq10",
          question: "How can I book a hair consultation with Dr. Ashok Kumar?",
          answer:
            "You can book a consultation easily by clicking 'Book a Consultation' on this page, calling our clinic directly, or visiting our center in Kondapur, Hyderabad.",
        },
      ],
    },
    sections: {},
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
];

// In-memory fallback if DynamoDB is unreachable or not yet populated in local environment
let memoryStore: ServicePage[] = [...DEFAULT_SERVICE_PAGES];

export async function getServicePageBySlug(slug: string): Promise<ServicePage | undefined> {
  const normSlug = slug.toLowerCase();
  const tbl = T();
  if (tbl) {
    try {
      const r = await db().send(
        new QueryCommand({
          TableName: tbl,
          IndexName: "slug-index",
          KeyConditionExpression: "#s = :s",
          ExpressionAttributeNames: { "#s": "slug" },
          ExpressionAttributeValues: { ":s": normSlug },
          Limit: 10,
        }),
      );
      const items = (r.Items ?? []) as (ServicePage & { itemType?: string })[];
      const item = items.find((p) => !p.id?.startsWith("trt-") && p.concernsSection);
      if (item) return item;
    } catch (err) {
      console.warn("DynamoDB getServicePageBySlug query failed, using fallback:", (err as Error).message);
    }
  }
  return memoryStore.find((p) => p.slug.toLowerCase() === normSlug);
}

export async function getServicePage(id: string): Promise<ServicePage | undefined> {
  const tbl = T();
  if (tbl) {
    try {
      const r = await db().send(new GetCommand({ TableName: tbl, Key: { id } }));
      const item = r.Item as (ServicePage & { itemType?: string }) | undefined;
      if (item && !item.id?.startsWith("trt-") && item.concernsSection) return item;
    } catch (err) {
      console.warn("DynamoDB getServicePage failed, using fallback:", (err as Error).message);
    }
  }
  return memoryStore.find((p) => p.id === id);
}

export async function listServicePages(category?: ServiceCategoryId | string): Promise<ServicePage[]> {
  const tbl = T();
  if (tbl) {
    try {
      const items: ServicePage[] = [];
      let key: Record<string, unknown> | undefined;
      do {
        const r = await db().send(new ScanCommand({ TableName: tbl, ExclusiveStartKey: key }));
        const scanned = (r.Items ?? []) as (ServicePage & { itemType?: string })[];
        const serviceOnly = scanned.filter((p) => !p.id?.startsWith("trt-") && p.concernsSection);
        items.push(...serviceOnly);
        key = r.LastEvaluatedKey;
      } while (key);

      if (items.length > 0) {
        // Sync memoryStore
        memoryStore = items;
      } else {
        // If table is completely empty, seed default pages into DB
        for (const p of DEFAULT_SERVICE_PAGES) {
          try {
            await db().send(new PutCommand({ TableName: tbl, Item: p }));
            items.push(p);
          } catch {
            // ignore seed errors
          }
        }
        if (items.length === 0) items.push(...DEFAULT_SERVICE_PAGES);
        memoryStore = items;
      }
    } catch (err) {
      console.warn("DynamoDB listServicePages scan failed, using fallback:", (err as Error).message);
    }
  }

  let result = [...memoryStore];
  if (category) {
    result = result.filter((p) => p.serviceCategory === category);
  }
  return result.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || b.modifiedAt.localeCompare(a.modifiedAt));
}

export async function listLiveServicePages(category?: ServiceCategoryId | string): Promise<ServicePage[]> {
  const all = await listServicePages(category);
  return all.filter((p) => isServicePageLive(p));
}

export async function createServicePage(input: ServicePageInput): Promise<ServicePage> {
  const normSlug = input.slug.toLowerCase();
  const existing = await getServicePageBySlug(normSlug);
  if (existing) throw new SlugTakenError("This URL slug is already taken by another service page");

  const now = new Date().toISOString();
  const page: ServicePage = {
    ...input,
    id: randomUUID(),
    slug: normSlug,
    createdAt: now,
    modifiedAt: now,
  };

  const tbl = T();
  if (tbl) {
    try {
      await db().send(
        new PutCommand({
          TableName: tbl,
          Item: page,
          ConditionExpression: "attribute_not_exists(id)",
        }),
      );
    } catch (err) {
      console.warn("DynamoDB createServicePage failed, saving to memory fallback:", (err as Error).message);
    }
  }

  // Update memoryStore
  const idx = memoryStore.findIndex((p) => p.slug === page.slug);
  if (idx >= 0) memoryStore[idx] = page;
  else memoryStore.push(page);

  return page;
}

export async function updateServicePage(id: string, input: ServicePageInput): Promise<ServicePage | null> {
  const current = await getServicePage(id);
  if (!current) return null;

  const normSlug = input.slug.toLowerCase();
  const clash = await getServicePageBySlug(normSlug);
  if (clash && clash.id !== id) {
    throw new SlugTakenError("This URL slug is already taken by another service page");
  }

  const now = new Date().toISOString();
  const page: ServicePage = {
    ...input,
    id,
    slug: normSlug,
    createdAt: current.createdAt || now,
    modifiedAt: now,
  };

  const tbl = T();
  if (tbl) {
    try {
      await db().send(new PutCommand({ TableName: tbl, Item: page }));
    } catch (err) {
      console.warn("DynamoDB updateServicePage failed, updating memory fallback:", (err as Error).message);
    }
  }

  const idx = memoryStore.findIndex((p) => p.id === id);
  if (idx >= 0) memoryStore[idx] = page;
  else memoryStore.push(page);

  return page;
}

export async function deleteServicePage(id: string): Promise<void> {
  const tbl = T();
  if (tbl) {
    try {
      await db().send(new DeleteCommand({ TableName: tbl, Key: { id } }));
    } catch (err) {
      console.warn("DynamoDB deleteServicePage failed:", (err as Error).message);
    }
  }
  memoryStore = memoryStore.filter((p) => p.id !== id);
}
