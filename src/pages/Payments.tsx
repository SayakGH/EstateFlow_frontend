import { useEffect, useState } from "react";
import { getAllPayments, searchPayments } from "@/api/bookings";
import type {
  FlatPayment,
  IGetAllPaymentsResponse,
} from "@/types/bookingTypes";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";

export default function Payments() {
  const [payments, setPayments] = useState<FlatPayment[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= SEARCH STATE ================= */

  // Input box value
  const [searchInput, setSearchInput] = useState("");

  // Active search keyword (only after button click)
  const [activeSearch, setActiveSearch] = useState<string | null>(null);

  // ✅ Auto reset when search box is cleared
  useEffect(() => {
    if (searchInput.trim() === "") {
      setActiveSearch(null);
    }
  }, [searchInput]);

  /* ================= PAGINATION ================= */

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* ================= FETCH PAYMENTS ================= */

  const fetchPayments = async () => {
    try {
      setLoading(true);

      let res: IGetAllPaymentsResponse;

      // ✅ SEARCH MODE
      if (activeSearch) {
        res = await searchPayments(activeSearch, page);
      }

      // ✅ NORMAL MODE
      else {
        res = await getAllPayments(page);
      }

      setPayments(res.payments || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Failed to load payments", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when page or activeSearch changes
  useEffect(() => {
    fetchPayments();
  }, [page, activeSearch]);

  // Reset page when new search triggers
  useEffect(() => {
    setPage(1);
  }, [activeSearch]);

  /* ================= SEARCH BUTTON ================= */

  const handleSearch = () => {
    if (!searchInput.trim()) {
      setActiveSearch(null);
    } else {
      setActiveSearch(searchInput.trim());
    }
  };

  /* ================= CLEAR SEARCH ================= */

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSearch(null);
    setPage(1);
  };

  /* ================= MODE COLOR ================= */

  const getModeColor = (mode?: string) => {
    switch (mode) {
      case "UPI":
        return "bg-indigo-100 text-indigo-700";
      case "Cheque":
        return "bg-yellow-100 text-yellow-700";
      case "Cash":
        return "bg-emerald-100 text-emerald-700";
      case "Bank Transfer":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  /* ================= UI ================= */

  return (
    <Card className="max-w-7xl mx-auto shadow-sm">
      {/* Header */}
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b">
        <CardTitle className="text-xl font-semibold tracking-tight">
          Payments History
        </CardTitle>

        {/* Search Box + Button */}
        <div className="flex gap-2 w-full md:w-auto items-center">
          {/* Search Input with Cross */}
          <div className="relative w-full md:w-80">
            <Input
              placeholder="Search by customer, flat, project, paymentId..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pr-10"
            />

            {/* ❌ Clear Button */}
            {searchInput.length > 0 && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                ✕
              </button>
            )}
          </div>

          <Button onClick={handleSearch}>Search</Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-6">
        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && payments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">
            No payments found.
          </p>
        )}

        {/* Table */}
        {!loading && payments.length > 0 && (
          <div className="rounded-md border overflow-hidden">
            <div className="max-h-[520px] overflow-auto">
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Flat</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {payments.map((p, index) => (
                    <TableRow
                      key={p.paymentId}
                      className={`hover:bg-muted/50 ${
                        index % 2 === 0 ? "bg-white" : "bg-muted/20"
                      }`}
                    >
                      {/* Payment ID */}
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        <Tooltip>
                          <TooltipTrigger className="cursor-pointer">
                            {p.paymentId?.slice(0, 8)}...
                          </TooltipTrigger>
                          <TooltipContent>{p.paymentId}</TooltipContent>
                        </Tooltip>
                      </TableCell>

                      {/* Customer */}
                      <TableCell className="font-medium">
                        {p.customer?.name || "N/A"}
                      </TableCell>

                      {/* Project */}
                      <TableCell className="text-muted-foreground">
                        {p.projectName || p.projectId || "N/A"}
                      </TableCell>

                      {/* Flat */}
                      <TableCell className="font-mono">
                        {p.flatId || "N/A"}
                      </TableCell>

                      {/* Mode + Cheque Details */}
                      <TableCell>
                        <div className="space-y-1">
                          {/* Mode Badge */}
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getModeColor(
                              p.summary?.mode
                            )}`}
                          >
                            {p.summary?.mode || "N/A"}
                          </span>

                          {/* ✅ Extra Details if Cheque */}
                          {p.summary?.mode === "Cheque" && (
                            <div className="text-xs text-muted-foreground leading-snug">
                              {p.summary?.chequeNumber && (
                                <p>Cheque No: {p.summary.chequeNumber}</p>
                              )}
                              {p.summary?.bankName && (
                                <p>Bank: {p.summary.bankName}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right font-semibold text-emerald-700">
                        ₹ {p.amount?.toLocaleString()}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-sm text-muted-foreground">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
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
              >
                {p}
              </Button>
            ))}

            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
