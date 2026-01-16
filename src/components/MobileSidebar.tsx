// src/components/MobileSidebar.tsx
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  LayoutDashboard,
  Building2,
  Home,
  Users,
  CreditCard,
  FileCheck,
  Shield,
} from "lucide-react";
import { useGlobal } from "@/context/GlobalContext";

export default function MobileSidebar() {
  const { setPage } = useGlobal();
  const [open, setOpen] = useState(false);
  const role = localStorage.getItem("role"); // admin | sales | accounts | kyc

  const handleSelect = (page: string) => {
    setPage(page);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Hamburger */}
      <SheetTrigger asChild>
        <Menu className="h-6 w-6 md:hidden cursor-pointer" />
      </SheetTrigger>

      {/* Drawer */}
      <SheetContent side="left" className="p-4">
        <h1 className="text-xl font-semibold mb-6">Dashboard</h1>

        <div className="space-y-2">
          {/* ADMIN */}
          {role === "admin" && (
            <SidebarBtn
              icon={<LayoutDashboard size={18} />}
              label="Analytics"
              onClick={() => handleSelect("analytics")}
            />
          )}

          {/* CORE */}
          <SidebarBtn
            icon={<Building2 size={18} />}
            label="Projects"
            onClick={() => handleSelect("projects")}
          />

          <SidebarBtn
            icon={<Home size={18} />}
            label="Apartments"
            onClick={() => handleSelect("apartments")}
          />

          <SidebarBtn
            icon={<Users size={18} />}
            label="Customers"
            onClick={() => handleSelect("customers")}
          />

          {/* KYC */}
          {(role === "admin" || role === "kyc") && (
            <SidebarBtn
              icon={<FileCheck size={18} />}
              label="KYC"
              onClick={() => handleSelect("kyc")}
            />
          )}

          {/* PAYMENTS */}
          {(role === "admin" || role === "accounts") && (
            <SidebarBtn
              icon={<CreditCard size={18} />}
              label="Payments"
              onClick={() => handleSelect("payments")}
            />
          )}

          {/* ADMIN */}
          {role === "admin" && (
            <SidebarBtn
              icon={<Shield size={18} />}
              label="Manage Users"
              onClick={() => handleSelect("users")}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ========== Reusable Button ========== */

function SidebarBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="w-full justify-start gap-3"
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}
