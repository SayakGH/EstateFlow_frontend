// src/pages/Dashboard.tsx
import { useGlobal } from "@/context/GlobalContext";

import Analytics from "./Analytics";
import Projects from "./Projects";
import Apartments from "./Appartments";
import Payments from "./Payments";
import Customers from "./Customers";
import KYC from "./KYC";
import Manage from "./Manage";

export default function Dashboard() {
  const { page } = useGlobal();
  const role = localStorage.getItem("role"); // "admin" | "staff" | "sales"

  return (
    <div className="p-4 space-y-4">
      {page === "analytics" && role === "admin" && <Analytics />}

      {page === "projects" && <Projects />}

      {page === "apartments" && <Apartments />}

      {page === "payments" && <Payments />}

      {page === "customers" && <Customers />}

      {page === "kyc" && <KYC />}

      {page === "users" && role === "admin" && <Manage />}
    </div>
  );
}
