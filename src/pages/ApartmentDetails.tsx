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

export interface Apartment {
  projectId: string;
  block: string;
  bhk: number;
  status: "free" | "booked" | "sold";
  createdAt: string;
  sqft: number;
  flatno: string;
  floor: number;
  flatId: string;
}

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

  const fetchFlat = async () => {
    const data: IFlat = await getFlat(
      currentFlat.projectId,
      currentFlat.flatId,
    );
    setCurrentFlat(data);
  };

  const fetchInvoiceData = async () => {
    getInvoiceData(currentFlat.projectId, currentFlat.flatId)
      .then((res) => {
        setInvoiceData(res.data);
      })
      .catch(() => {
        console.warn("Flat not booked or missing data");
      });
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
      );

      setCancelDialogOpen(false);
      setCancellationId("");

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

      await removeInvoice(currentFlat.projectId, currentFlat.flatId);

      fetchFlat();
    } catch (err) {
      console.error("Failed to reset flat", err);
      alert("Failed to reset flat");
    } finally {
      setLoading(false);
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
            <div className="flex gap-3 items-center">
              <AlertDialog
                open={cancelDialogOpen}
                onOpenChange={setCancelDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 border-red-500 text-red-600 hover:bg-red-50"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                    Cancel Booking
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Flat Booking</AlertDialogTitle>
                    <AlertDialogDescription>
                      Enter the <b>Cancellation Invoice ID</b> to proceed. This
                      will free the flat and cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  {/* INPUT */}
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="cancellationId">
                      Cancellation Invoice ID
                    </Label>
                    <Input
                      id="cancellationId"
                      placeholder="CAN-264515-OYLP"
                      value={cancellationId}
                      onChange={(e) =>
                        setCancellationId(e.target.value.toUpperCase())
                      }
                    />

                    {!isValidCancellationId && cancellationId && (
                      <p className="text-xs text-destructive">
                        Invalid format. Example: CAN-264515-OYLP
                      </p>
                    )}
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
              {/* APPROVE LOAN (only for booked) */}
              {currentFlat.status === "booked" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="gap-2 bg-blue-600 hover:bg-blue-700"
                      disabled={loading}
                    >
                      <CreditCard className="h-4 w-4" />
                      {loading ? "Approving..." : "Approve Loan"}
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approve Loan?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will mark the flat as <b>SOLD</b>. This action
                        cannot be undone.
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
              )}

              {/* ❌ DELETE / RESET FLAT */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={loading}>
                    <Trash2 />
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Flat to FREE?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will:
                      <ul className="list-disc ml-5 mt-2 text-sm">
                        <li>Remove invoice linkage</li>
                        <li>Clear booking data</li>
                        <li>
                          Mark the flat as <b>FREE</b>
                        </li>
                      </ul>
                      <div className="mt-3 font-semibold text-red-600">
                        This action cannot be undone.
                      </div>
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
