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
