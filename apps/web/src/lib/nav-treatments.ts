export interface NavTreatmentItem {
  name: string;
  href: string;
}

export interface NavDepartmentMenu {
  id: "hair" | "skin-cosmetic" | "dermatology" | "std";
  label: string;
  departmentHref: string;
  tab: string;
  treatments: NavTreatmentItem[];
}

/**
 * Strips location suffixes (e.g. "in Kondapur, Hyderabad", "in Kondapur", "in Hyderabad")
 * so navigation menus and footer lists display only the clean treatment name.
 */
export function cleanTreatmentName(title: string): string {
  if (!title) return "";
  const cleaned = title
    .replace(/[\s,–|-]+(?:(?:in|at|near)\s+)?(?:konda[a-z]*|hyderabad)[\s\S]*$/i, "")
    .replace(/[\s,–|-]+in\s*$/i, "")
    .trim();
  return cleaned || title.trim();
}

/** Base department definitions with zero static treatments - all populated directly from DynamoDB */
export const NAV_DEPARTMENTS: NavDepartmentMenu[] = [
  {
    id: "hair",
    label: "Hair",
    departmentHref: "/hair",
    tab: "Hair",
    treatments: [],
  },
  {
    id: "skin-cosmetic",
    label: "Skin & Cosmetic",
    departmentHref: "/skin-cosmetic",
    tab: "Skin",
    treatments: [],
  },
  {
    id: "dermatology",
    label: "Dermatology",
    departmentHref: "/dermatology",
    tab: "Skin",
    treatments: [],
  },
  {
    id: "std",
    label: "STD",
    departmentHref: "/std",
    tab: "Sti Care",
    treatments: [],
  },
];
