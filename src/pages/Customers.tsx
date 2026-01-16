import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, User, Eye, Trash2 } from "lucide-react";
import { deleteKyc, getAllCustomers } from "@/api/kyc";
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
import { Loader2 } from "lucide-react";

const calculateKycProgress = (c: KycCustomer) => {
  let total = 0;

  if (c.aadhaar_key) total++;
  if (c.pan_key) total++;
  if (c.voter_key) total++;
  if (c.other_key) total++;

  return Math.round((total / 4) * 100);
};

export default function Customers() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [customers, setCustomers] = useState<KycCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<KycCustomer | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [deleteCustomer, setDeleteCustomer] = useState<KycCustomer | null>(
    null
  );

  const fetchCustomers = async () => {
    try {
      const response = await getAllCustomers();
      return setCustomers(response.customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };
  useEffect(() => {
    fetchCustomers();
  }, []);
  useEffect(() => {
    fetchCustomers();
  }, [setCustomers]);

  const handleDelete = async () => {
    if (!deleteCustomer) return;

    try {
      setLoading(true);

      await deleteKyc(deleteCustomer._id);

      toast.success("Customer deleted", {
        description:
          "Customer profile and KYC documents were removed successfully.",
      });

      setDeleteCustomer(null);
      fetchCustomers();
    } catch (err) {
      toast.error("Delete failed", {
        description: "Unable to delete customer. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* Render switch */
  if (selectedCustomer) {
    return (
      <div className="p-6">
        <CustomerDetails
          customer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          onBack={() => setSelectedCustomer(null)}
        />
      </div>
    );
  }

  const filtered = customers.filter((c) => {
    const matchName = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === "all" || c.status === filter;
    return matchName && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Filters */}
      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList className="w-full sm:w-auto grid grid-cols-3">
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
          {filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              No customers found
            </div>
          )}

          {filtered.map((c) => (
            <div
              key={c._id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition"
            >
              {/* Left */}
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.phone}</p>
                </div>
              </div>

              {/* KYC Circle */}
              <div className="flex items-center gap-3">
                <Badge
                  variant={c.status === "approved" ? "default" : "secondary"}
                >
                  {c.status.toUpperCase()}
                </Badge>
                <CircularProgress value={calculateKycProgress(c)} />
              </div>

              {/* Action */}
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
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      <AlertDialog
        open={!!deleteCustomer}
        onOpenChange={() => setDeleteCustomer(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed">
              You are about to permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleteCustomer?.name}
              </span>{" "}
              and all associated KYC documents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
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

      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-gray-700">
        {value}%
      </div>
    </div>
  );
}
