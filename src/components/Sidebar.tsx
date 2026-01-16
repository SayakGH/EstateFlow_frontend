// src/components/Sidebar.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/context/GlobalContext";
import {
  LayoutDashboard,
  Building2,
  Home,
  Users,
  CreditCard,
  FileCheck,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const { setPage } = useGlobal();
  const role = localStorage.getItem("role");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`hidden md:flex flex-col h-screen bg-gray-900 text-white p-4 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        {!collapsed && <h1 className="text-xl font-bold">Real Estate ERP</h1>}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      <div className="space-y-2">
        {role === "admin" && (
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Analytics"
            collapsed={collapsed}
            onClick={() => setPage("analytics")}
          />
        )}

        <NavItem
          icon={<Building2 size={20} />}
          label="Projects"
          collapsed={collapsed}
          onClick={() => setPage("projects")}
        />

        <NavItem
          icon={<Home size={20} />}
          label="Apartments"
          collapsed={collapsed}
          onClick={() => setPage("apartments")}
        />

        <NavItem
          icon={<Users size={20} />}
          label="Customers"
          collapsed={collapsed}
          onClick={() => setPage("customers")}
        />

        {(role === "admin" || role === "accounts") && (
          <NavItem
            icon={<CreditCard size={20} />}
            label="Payments"
            collapsed={collapsed}
            onClick={() => setPage("payments")}
          />
        )}

        {(role === "admin" || role === "kyc") && (
          <NavItem
            icon={<FileCheck size={20} />}
            label="KYC"
            collapsed={collapsed}
            onClick={() => setPage("kyc")}
          />
        )}

        {role === "admin" && (
          <NavItem
            icon={<Shield size={20} />}
            label="Manage Users"
            collapsed={collapsed}
            onClick={() => setPage("users")}
          />
        )}
      </div>
    </div>
  );
}

/* ===== Sidebar Item ===== */

function NavItem({
  icon,
  label,
  collapsed,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`w-full flex items-center ${
        collapsed ? "justify-center" : "justify-start gap-3"
      } text-gray-300 hover:text-white hover:bg-gray-800`}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </Button>
  );
}
