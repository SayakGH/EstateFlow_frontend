import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, User, Eye, Trash2, Loader2 } from "lucide-react";
import {
  deleteKyc,
  getAllCustomers,
  getApprovedCustomers,
  getPendingCustomers,
  searchAllCustomers,
  searchApprovedCustomers,
  searchPendingCustomers,
} from "@/api/kyc";
import type { KycCustomer } from "@/types/kycTypes";
import CustomerDetails from "./CustomerDetails";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { toast } from "sonner";

/* ================= Helpers ================= */

const calculateKycProgress = (c: KycCustomer) => {
  let total = 0;
  if (c.aadhaar_key) total++;
  if (c.pan_key) total++;
  if (c.voter_key) total++;
  if (c.other_key) total++;
  return Math.round((total / 4) * 100);
};

export default function Customers() {
  /* ================= State ================= */

  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState<string | null>(null);

  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");
  const [customers, setCustomers] = useState<KycCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<KycCustomer | null>(null);

  const [loading, setLoading] = useState(false);
  const [deleteCustomer, setDeleteCustomer] =
    useState<KycCustomer | null>(null);
  const [confirmText, setConfirmText] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* ================= Fetch Logic ================= */

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      let response;

      // 🔍 SEARCH MODE (TAB-AWARE)
      if (activeSearch) {
        if (filter === "approved") {
          response = await searchApprovedCustomers(activeSearch, page);
        } else if (filter === "pending") {
          response = await searchPendingCustomers(activeSearch, page);
        } else {
          response = await searchAllCustomers(activeSearch, page);
        }
      }
      // 📄 LIST MODE
      else {
        if (filter === "approved") {
          response = await getApprovedCustomers(page);
        } else if (filter === "pending") {
          response = await getPendingCustomers(page);
        } else {
          response = await getAllCustomers(page);
        }
      }

      setCustomers(response.customers);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch when page / filter / search mode changes
  useEffect(() => {
    fetchCustomers();
  }, [page, filter, activeSearch]);

  // Reset page on filter or new search
  useEffect(() => {
    setPage(1);
  }, [filter, activeSearch]);

  /* ================= Search ================= */

  const handleSearch = () => {
    if (!searchInput.trim()) {
      setActiveSearch(null);
    } else {
      setActiveSearch(searchInput.trim());
    }
  };

  /* ================= Delete ================= */

  const handleDelete = async () => {
    if (!deleteCustomer) return;

    try {
      setLoading(true);
      await deleteKyc(deleteCustomer._id);

      toast.success("Customer deleted", {
        description:
          "Customer profile and KYC documents were removed successfully.",
        className: "bg-black text-white border-none",
      });

      setDeleteCustomer(null);
      setConfirmText("");
      fetchCustomers();
    } catch {
      toast.error("Delete failed", {
        description: "Unable to delete customer. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= Details View ================= */

  if (selectedCustomer) {
    return (
      <div className="p-6">
        <CustomerDetails
          customer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          onBack={() => setSelectedCustomer(null)}
          onStatusChange={fetchCustomers}
        />
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Filters */}
      <Tabs
        value={filter}
        onValueChange={(v) =>
          setFilter(v as "all" | "approved" | "pending")
        }
      >
        <TabsList className="grid grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {loading && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {!loading && customers.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              No customers found
            </div>
          )}

          {customers.map((c) => (
            <div
              key={c._id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border bg-white shadow-sm"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  className={
                    c.status === "approved"
                      ? "bg-green-600 text-white"
                      : "bg-yellow-400 text-black"
                  }
                >
                  {c.status.toUpperCase()}
                </Badge>

                <CircularProgress value={calculateKycProgress(c)} />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCustomer(c)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteCustomer(c)}
                className="border-destructive text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          disabled={page === 1 || loading}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            size="sm"
            variant={p === page ? "default" : "outline"}
            onClick={() => setPage(p)}
            disabled={loading}
          >
            {p}
          </Button>
        ))}

        <Button
          size="sm"
          variant="outline"
          disabled={page === totalPages || loading}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>

      {/* DELETE DIALOG */}
      <AlertDialog
        open={!!deleteCustomer}
        onOpenChange={() => {
          setDeleteCustomer(null);
          setConfirmText("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete{" "}
              <span className="font-semibold">{deleteCustomer?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteCustomer?.status === "approved" && (
            <Input
              placeholder='Type "confirm"'
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={
                loading ||
                (deleteCustomer?.status === "approved" &&
                  confirmText !== "confirm")
              }
              className="bg-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ================= Circular Progress ================= */

function CircularProgress({ value }: { value: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-10 h-10">
      <svg className="w-full h-full">
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="4"
          fill="transparent"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="#6366F1"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 20 20)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold">
        {value}%
      </div>
    </div>
  );
}
