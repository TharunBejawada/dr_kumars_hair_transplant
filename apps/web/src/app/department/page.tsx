import { permanentRedirect } from "next/navigation";

export default function DepartmentIndexPage() {
  permanentRedirect("/services");
}
