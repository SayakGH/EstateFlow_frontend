import { useEffect, useState } from "react";
import { getAllPayments } from "@/api/bookings";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Payments() {
  const [payments, setPayments] = useState<FlatPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res: IGetAllPaymentsResponse = await getAllPayments();
        setPayments(res.payments || []);
      } catch (err) {
        console.error("Failed to load payments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Search filter
  const filteredPayments = payments.filter((p) => {
    const query = search.toLowerCase();

    return (
      p.customer?.name?.toLowerCase().includes(query) ||
      p.projectName?.toLowerCase().includes(query) ||
      p.projectId?.toLowerCase().includes(query) ||
      p.flatId?.toLowerCase().includes(query) ||
      p.summary?.mode?.toLowerCase().includes(query) ||
      p.paymentId?.toLowerCase().includes(query)
    );
  });

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

  return (
    <Card className="max-w-7xl mx-auto shadow-sm">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b">
        <CardTitle className="text-xl font-semibold tracking-tight">
          Payments History
        </CardTitle>

        <Input
          placeholder="Search by customer, flat, project, mode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-96"
        />
      </CardHeader>

      <CardContent className="pt-4">
        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filteredPayments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">
            No payments found.
          </p>
        )}

        {/* Table */}
        {!loading && filteredPayments.length > 0 && (
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
                  {filteredPayments.map((p, index) => (
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

                      {/* Mode */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${getModeColor(
                                p.summary?.mode,
                              )}`}
                            >
                              {p.summary?.mode || "N/A"}
                            </span>

                            {/* Small notch ONLY for cheque */}
                            {p.summary?.mode === "Cheque" && (
                              <button
                                onClick={() =>
                                  setExpandedPayment(
                                    expandedPayment === p.paymentId
                                      ? null
                                      : p.paymentId,
                                  )
                                }
                                className="text-muted-foreground hover:text-foreground transition"
                              >
                                <span
                                  className={`inline-block transition-transform duration-200 ${
                                    expandedPayment === p.paymentId
                                      ? "rotate-90"
                                      : ""
                                  }`}
                                >
                                  ▸
                                </span>
                              </button>
                            )}
                          </div>

                          {/* Expand cheque info */}
                          {expandedPayment === p.paymentId &&
                            p.summary?.mode === "Cheque" && (
                              <div className="text-xs text-muted-foreground pl-1 space-y-0.5">
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
      </CardContent>
    </Card>
  );
}
