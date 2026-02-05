import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { approveLoan, getFlat } from "@/api/projects";
import { getInvoiceData } from "@/api/bookings";
import type { ICancellationData, IInvoiceData } from "@/types/bookingTypes";
import type { IFlat } from "@/types/projectTypes";
import { addInvoice, removeInvoice } from "@/api/invoice";
import { addCancellation, getCancellationData } from "@/api/cancellation";
import { upsertSchedule, getScheduleByPhone } from "@/api/schedule";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, XCircle, CheckCircle2, RotateCcw } from "lucide-react";

// export interface Apartment {
//   projectId: string;
//   block: string;
//   bhk: number;
//   status: "free" | "booked" | "sold";
//   createdAt: string;
//   sqft: number;
//   flatno: string;
//   floor: number;
//   flatId: string;
// }

const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

const minus7 = (dateStr: string) => addDays(dateStr, -7);
const plus7 = (dateStr: string) => addDays(dateStr, 7);

export default function ApartmentDetailsPage({
  flat,
  projectName,
  onBack,
}: {
  flat: IFlat;
  projectName: string;
  onBack: () => void;
  onPay?: () => void;
}) {
  const statusColor = {
    free: "bg-emerald-600",
    booked: "bg-yellow-600",
    sold: "bg-red-600",
  };

  const [currentFlat, setCurrentFlat] = useState<IFlat>(flat);

  const [loading, setLoading] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<IInvoiceData | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationId, setCancellationId] = useState("");

  const [nextPaymentDate, setNextPaymentDate] = useState<string | null>(null);
  const [editingNextPayment, setEditingNextPayment] = useState(false);
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);

  const formatDate = (date?: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const [cancellationData, setCancellationData] =
    useState<ICancellationData | null>(null);

  const cancellationRegex = /^CAN-\d{6}-[A-Z0-9]{4}$/;
  const isValidCancellationId = cancellationRegex.test(cancellationId);

  const fetchCancellationDetails = async () => {
    if (!currentFlat.latestCancellationId) return;

    try {
      const res = await getCancellationData(
        currentFlat.projectId,
        currentFlat.flatId,
      );
      setCancellationData(res.data);
    } catch (err) {
      console.warn("No cancellation details found");
      setCancellationData(null);
    }
  };

  useEffect(() => {
    const loadSchedule = async () => {
      if (!customerPhone) return;

      try {
        const res = await getScheduleByPhone(customerPhone);

        if (res?.data?.date) {
          // ADD 7 DAYS FOR DISPLAY
          setNextPaymentDate(plus7(res.data.date));
        }
      } catch (err) {
        console.log("No schedule found");
      }
    };

    loadSchedule();
  }, [customerPhone]);

  const fetchFlat = async () => {
    const data: IFlat = await getFlat(
      currentFlat.projectId,
      currentFlat.flatId,
    );
    setCurrentFlat(data);
  };

  const fetchInvoiceData = async () => {
    try {
      const res = await getInvoiceData(
        currentFlat.projectId,
        currentFlat.flatId,
      );
      setInvoiceData(res.data);
      setCustomerPhone(res.data?.customerPhone || null);
    } catch {
      console.warn("Flat not booked");
    }
  };

  useEffect(() => {
    if (currentFlat.status != "free") {
      fetchInvoiceData();
    }
  }, [currentFlat.status]);

  const handleInvoiceSubmit = async () => {
    try {
      await addInvoice(invoiceId, currentFlat.projectId, currentFlat.flatId);
      fetchFlat();
    } catch (err) {
      console.error("Failed to add invoice", err);
    } finally {
    }
  };

  const handleCancelBooking = async () => {
    if (!isValidCancellationId) return;

    try {
      setLoading(true);
      await addCancellation(
        cancellationId,
        currentFlat.projectId,
        currentFlat.flatId,
        customerPhone || "",
      );

      setCancelDialogOpen(false);
      setCancellationId("");
      setCustomerPhone(null);

      await fetchFlat();
    } catch (err) {
      console.error("Cancellation failed", err);
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLoan = async () => {
    try {
      setLoading(true);

      await approveLoan(currentFlat.projectId, currentFlat.flatId);

      // 🔥 Instant UI update — only status changes
      setCurrentFlat((prev) => ({
        ...prev,
        status: "sold",
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to approve loan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentFlat.latestCancellationId) {
      fetchCancellationDetails();
    } else {
      setCancellationData(null); // cleanup when cancellation is removed
    }
  }, [currentFlat.latestCancellationId]);

  const handleDeleteFlatBooking = async () => {
    try {
      setLoading(true);

      await removeInvoice(
        currentFlat.projectId,
        currentFlat.flatId,
        customerPhone || "",
      );

      fetchFlat();
    } catch (err) {
      console.error("Failed to reset flat", err);
      alert("Failed to reset flat");
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async (selectedDate: string) => {
    if (!customerPhone || !selectedDate) return;

    try {
      // store minus 7 days in backend
      const dateToStore = minus7(selectedDate);

      await upsertSchedule({
        phone: customerPhone,
        date: dateToStore,
      });

      setNextPaymentDate(selectedDate); // show actual picked date
    } catch (e) {
      console.error("Failed to save schedule", e);
    }
  };

  const invoiceRegex = /^INV-\d{6}-[A-Z0-9]{4}$/;
  const isValidInvoice = invoiceRegex.test(invoiceId);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Apartments
      </Button>

      {/* HEADER CARD */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl">
              {currentFlat.flatId}
              <p className="text-xs text-muted-foreground">{projectName}</p>
            </CardTitle>
            <AlertDialog
              open={statusDialogOpen}
              onOpenChange={setStatusDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Badge
                  className={`${statusColor[currentFlat.status]} uppercase cursor-pointer`}
                  onClick={() => {
                    if (currentFlat.status === "booked") {
                      setStatusDialogOpen(true);
                    }
                  }}
                >
                  {currentFlat.status}
                </Badge>
              </AlertDialogTrigger>
            </AlertDialog>
          </div>

          {(currentFlat.status === "booked" ||
            currentFlat.status === "sold") && (
            <div className="flex items-center gap-4">
              {/* NEXT PAYMENT */}
              <div
                className="text-sm cursor-pointer select-none"
                onDoubleClick={() => {
                  if (currentFlat.status !== "free") {
                    setEditingNextPayment(true);
                  }
                }}
              >
                <span className="text-muted-foreground">Next Payment:</span>{" "}
                {!editingNextPayment ? (
                  <span className="font-medium">
                    {formatDate(nextPaymentDate)}
                  </span>
                ) : (
                  <Input
                    type="date"
                    autoFocus
                    className="h-8 inline-block w-[150px]"
                    value={nextPaymentDate ?? ""}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setNextPaymentDate(newDate);

                      // 🔥 CALL API IMMEDIATELY
                      if (newDate) saveSchedule(newDate);
                    }}
                    onBlur={() => setEditingNextPayment(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setEditingNextPayment(false);
                      }
                    }}
                  />
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  {/* CANCEL BOOKING */}
                  <AlertDialog
                    open={cancelDialogOpen}
                    onOpenChange={setCancelDialogOpen}
                  >
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="text-red-600"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Booking
                      </DropdownMenuItem>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Flat Booking</AlertDialogTitle>
                        <AlertDialogDescription>
                          Enter the <b>Cancellation Invoice ID</b>. This will
                          free the flat and cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="space-y-2 mt-2">
                        <Label>Cancellation Invoice ID</Label>
                        <Input
                          placeholder="CAN-264515-OYLP"
                          value={cancellationId}
                          onChange={(e) =>
                            setCancellationId(e.target.value.toUpperCase())
                          }
                        />
                      </div>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          disabled={!isValidCancellationId || loading}
                          onClick={handleCancelBooking}
                        >
                          {loading ? "Cancelling..." : "Confirm Cancellation"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* APPROVE LOAN */}
                  {currentFlat.status === "booked" && (
                    <>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" />
                            Approve Loan
                          </DropdownMenuItem>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Approve Loan?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will mark the flat as <b>SOLD</b>. This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleApproveLoan}>
                              Yes, Approve
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}

                  {/* RESET FLAT */}
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="text-destructive"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset Flat
                      </DropdownMenuItem>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset Flat to FREE?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove invoice & cancellation data and mark
                          the flat as <b>FREE</b>. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={handleDeleteFlatBooking}
                        >
                          Yes, Reset Flat
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </CardHeader>

        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <InfoCompact label="Block" value={currentFlat.block} />
          <InfoCompact label="Floor" value={String(currentFlat.floor)} />
          <InfoCompact label="BHK" value={`${currentFlat.bhk} BHK`} />
          <InfoCompact
            label="Carpet Area"
            value={`${currentFlat.sqft} sq.ft`}
          />
          {currentFlat.status !== "free" && (
            <InfoCompact
              label="Customer Name"
              value={invoiceData?.customerName || "N/A"}
            />
          )}
          {currentFlat.status !== "free" && (
            <InfoCompact label="PAN" value={invoiceData?.pan || "N/A"} />
          )}
          {currentFlat.status !== "free" && (
            <InfoCompact
              label="Total Amount"
              value={String(invoiceData?.totalAmount) || "N/A"}
            />
          )}
          {currentFlat.status !== "free" && (
            <InfoCompact
              label="Total Paid"
              value={String(invoiceData?.advance) || "N/A"}
            />
          )}
        </CardContent>
      </Card>
      {currentFlat.status === "free" && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Add Invoice</CardTitle>
            <CardDescription>
              Invoice ID must follow the format <b>INV-XXXXXX-ABCD</b>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full space-y-1">
                <Label htmlFor="invoiceId">Invoice ID</Label>
                <Input
                  id="invoiceId"
                  placeholder="INV-264515-OYLP"
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value.toUpperCase())}
                />

                {!isValidInvoice && invoiceId && (
                  <p className="text-xs text-destructive">
                    Invalid format. Example: INV-264515-OYLP
                  </p>
                )}
              </div>

              <Button
                className="w-full md:w-auto md:px-8"
                disabled={loading || !isValidInvoice}
                onClick={handleInvoiceSubmit}
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {currentFlat.latestCancellationId && (
        <Card className="border border-border bg-background">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Cancellation Summary</CardTitle>
                <CardDescription>
                  Financial breakdown after booking cancellation
                </CardDescription>
              </div>

              <Badge variant="outline" className="text-xs">
                CANCELLED
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <tbody>
                  <Row
                    label="Total to be paid"
                    value={
                      typeof cancellationData?.net_return === "number"
                        ? cancellationData.net_return
                        : undefined
                    }
                  />

                  <Row
                    label="Amount Paid"
                    value={
                      typeof cancellationData?.already_returned === "number"
                        ? cancellationData.already_returned
                        : undefined
                    }
                    positive
                  />

                  {/* Divider */}
                  <tr>
                    <td colSpan={2}>
                      <div className="my-1 h-px bg-border" />
                    </td>
                  </tr>

                  {/* Net Due / Refund */}
                  {(() => {
                    const netReturn =
                      typeof cancellationData?.yetTB_returned === "number"
                        ? cancellationData.yetTB_returned
                        : null;

                    return (
                      <tr className="bg-muted/40">
                        <td className="px-4 py-3 font-semibold">
                          Net Due / Refund
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${
                            netReturn === null
                              ? "text-muted-foreground"
                              : netReturn >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                          }`}
                        >
                          {netReturn === null
                            ? "—"
                            : `₹ ${netReturn.toLocaleString()}`}
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              * Cancellation charges are applied as per company policy.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ============ UI Helpers ============ */

function InfoCompact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 p-2.5 rounded-lg border text-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold truncate">{value}</p>
    </div>
  );
}

function Row({
  label,
  value,
  positive,
  negative,
}: {
  label: string;
  value?: number;
  positive?: boolean;
  negative?: boolean;
}) {
  const isNumber = typeof value === "number";

  return (
    <tr className="border-b last:border-none">
      <td className="px-4 py-3 text-muted-foreground">{label}</td>
      <td
        className={`px-4 py-3 text-right font-medium ${
          !isNumber
            ? "text-muted-foreground"
            : positive
              ? "text-emerald-600"
              : negative
                ? "text-red-600"
                : ""
        }`}
      >
        {isNumber ? `₹ ${value.toLocaleString()}` : "—"}
      </td>
    </tr>
  );
}
