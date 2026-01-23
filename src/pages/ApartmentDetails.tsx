import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { searchApprovedCustomers } from "@/api/kyc";
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
import { approveLoan } from "@/api/projects";
import { getBookedFlat } from "@/api/bookings";
import type { BookedFlat } from "@/types/bookingTypes";
import { bookFlat, addPayment, getFlatPaymentHistory } from "@/api/bookings";

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
  onPay,
}: {
  flat: Apartment;
  projectName: string;
  onBack: () => void;
  onPay?: () => void;
}) {
  const statusColor = {
    free: "bg-emerald-600",
    booked: "bg-yellow-600",
    sold: "bg-red-600",
  };

  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentFlat, setCurrentFlat] = useState(flat);

  const [rate, setRate] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextPaymentDate, setNextPaymentDate] = useState("");
  const [bookedData, setBookedData] = useState<null | BookedFlat>(null);
  const [confirmText, setConfirmText] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const [paymentMode, setPaymentMode] = useState<
    "Bank Transfer" | "Cheque" | "UPI" | "Cash" | "Demand Draft" | "Others"
  >("UPI");

  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [chequeNumber, setChequeNumber] = useState("");
  const [bankName, setBankName] = useState("");

  const fetchCustomers = async (query: string) => {
    if (!query.trim()) {
      setCustomers([]);
      return;
    }

    try {
      setSearchLoading(true);
      const data = await searchApprovedCustomers(query, 1);
      setCustomers(data.customers || []);
    } catch (err) {
      console.error("Customer search failed:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchBookingData = async () => {
    getBookedFlat(currentFlat.projectId, currentFlat.flatId)
      .then((res) => {
        setBookedData(res.booked);
      })
      .catch(() => {
        console.warn("Flat not booked or missing data");
      });
  };

  useEffect(() => {
    if (currentFlat.status != "free") {
      fetchBookingData();
    }
  }, [currentFlat.status]);
  const fetchHistory = async () => {
    if (
      !currentFlat?.projectId ||
      !currentFlat?.flatId ||
      currentFlat.status === "free"
    ) {
      setPaymentHistory([]);
      return;
    }

    try {
      setHistoryLoading(true);

      const data = await getFlatPaymentHistory(
        currentFlat.projectId,
        currentFlat.flatId,
      );

      setPaymentHistory(data.payments || []);
    } catch (err) {
      console.error("Failed to load payment history", err);
    } finally {
      setHistoryLoading(false);
    }
  };
  useEffect(() => {
    fetchHistory();
  }, [currentFlat]);

  const handleAddPayment = async () => {
    if (!amountPaid) return alert("Enter payment amount");

    setLoading(true);

    try {
      const res = await addPayment(currentFlat.projectId, currentFlat.flatId, {
        amount: Number(amountPaid),
        summary: {
          mode: paymentMode,
          chequeNumber: chequeNumber || null,
          bankName: bankName || null,
        },
      });
      if (
        Number(amountPaid) + (bookedData?.paid || 0) >=
        Number(bookedData?.totalPayment) * 0.5
      ) {
        setCurrentFlat((prev) => ({
          ...prev,
          status: "sold",
        }));
      }
      fetchBookingData();
      fetchHistory();

      // Clear input
      setAmountPaid("");
      setChequeNumber("");
      setBankName("");
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };
  const handleChangeStatusToFree = async () => {
    try {
      //await updateFlatStatus(currentFlat.projectId, currentFlat.flatId, "free");

      // // Optimistic UI update
      // setCurrentFlat((prev) => ({
      //   ...prev,
      //   status: "free",
      // }));

      alert("Status changed to FREE");
    } catch (err) {
      console.error(err);
      alert("Failed to change status");
    }
  };

  const handleBookFlat = async () => {
    if (!selectedCustomer || !rate || !amountPaid) {
      return alert("Select customer, rate, and amount");
    }

    setLoading(true);

    try {
      await bookFlat(currentFlat.projectId, currentFlat.flatId, {
        customer: {
          id: selectedCustomer._id,
          name: selectedCustomer.name,
        },
        amount: Number(amountPaid),
        totalPayment: Number(rate),
        summary: {
          mode: paymentMode,
          chequeNumber: chequeNumber || null,
          bankName: bankName || null,
        },
      });
      if (Number(amountPaid) >= Number(rate) * 0.5) {
        setCurrentFlat((prev) => ({
          ...prev,
          status: "sold",
        }));
      } else {
        setCurrentFlat((prev) => ({
          ...prev,
          status: "booked",
        }));
      }

      // Reset fields
      setSelectedCustomer(null);
      setCustomerSearch("");
      setRate("");
      setAmountPaid("");
    } catch (err) {
      console.error(err);
      alert("Booking failed");
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
              {currentFlat.block}-{currentFlat.flatno}
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

              {currentFlat.status === "booked" && (
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Change Flat Status?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will change the flat status from{" "}
                      <span className="font-semibold text-yellow-600">
                        BOOKED
                      </span>{" "}
                      to{" "}
                      <span className="font-semibold text-green-600">FREE</span>
                      . This action may affect customer records.
                      <div className="mt-3 text-sm">
                        Type <span className="font-bold">confirm</span> to
                        continue.
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <Input
                    placeholder="Type confirm"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="mt-2"
                  />

                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmText("")}>
                      Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                      disabled={confirmText !== "confirm"}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                      onClick={() => {
                        // 🔥 Call your API here
                        handleChangeStatusToFree();

                        setConfirmText("");
                        setStatusDialogOpen(false);
                      }}
                    >
                      Yes, Change Status
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              )}
            </AlertDialog>
          </div>

          {currentFlat.status === "booked" && (
            <div className="flex gap-3 items-center">
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
                      Are you sure you want to approve the loan for
                      <span className="font-semibold">
                        {" "}
                        Flat {currentFlat.flatId}
                      </span>
                      ? This action cannot be undone.
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
              value={bookedData?.customer_name || "N/A"}
            />
          )}
          {currentFlat.status !== "free" && (
            <InfoCompact
              label="Total Amount"
              value={String(bookedData?.totalPayment) || "N/A"}
            />
          )}
          {currentFlat.status !== "free" && (
            <InfoCompact
              label="Total Paid"
              value={String(bookedData?.paid) || "N/A"}
            />
          )}
          {currentFlat.status !== "free" && (
            <InfoCompact label="Next Payment" value={"1-33-5003"} />
          )}
        </CardContent>
      </Card>

      {currentFlat.status === "free" && (
        <Card>
          <CardHeader>
            <CardTitle>Add Payments</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 relative">
            {/* ===== FLOATING SEARCH INPUT (YouTube style) ===== */}
            <div className="relative w-full">
              <label className="text-sm font-medium">Search Customer</label>

              <Input
                placeholder="Search customer name..."
                value={customerSearch}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomerSearch(value);
                  fetchCustomers(value);
                }}
                className="mt-1"
              />

              {/* ===== FLOATING RESULTS PANEL ===== */}
              {customerSearch && (
                <div className="absolute left-0 right-0 top-[72px] z-50 bg-white border rounded-xl shadow-lg p-2 space-y-1">
                  {searchLoading ? (
                    <p className="text-sm text-muted-foreground p-2">
                      Searching...
                    </p>
                  ) : customers.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-2">
                      No approved customers found
                    </p>
                  ) : (
                    customers.map((c) => (
                      <div
                        key={c.id}
                        className="flex justify-between items-center p-2 hover:bg-muted rounded-lg cursor-pointer"
                        onClick={() => {
                          setSelectedCustomer(c);
                          setCustomerSearch("");
                          setCustomers([]);
                        }}
                      >
                        <div>
                          <p className="font-semibold">{c.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.phone}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost">
                          Select
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* ===== SELECTED CUSTOMER PANEL ===== */}
            {selectedCustomer && (
              <div className="bg-muted/40 p-4 rounded-lg space-y-3">
                <p className="text-sm text-muted-foreground">
                  Selected Customer
                </p>
                <p className="font-semibold">{selectedCustomer.name}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Total Amount</label>
                    <Input
                      type="number"
                      placeholder="e.g. 5000"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm">Amount Paid</label>
                    <Input
                      type="number"
                      placeholder="e.g. 5,00,000"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm">Payment Mode</label>
                  <select
                    className="w-full mt-1 border rounded px-2 py-2 text-sm"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                  >
                    <option>UPI</option>
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                    <option>Demand Draft</option>
                    <option>Others</option>
                  </select>
                </div>

                {paymentMode === "Cheque" && (
                  <>
                    <div>
                      <label className="text-sm">Cheque Number</label>
                      <Input
                        placeholder="Cheque Number"
                        value={chequeNumber}
                        onChange={(e) => setChequeNumber(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm">Bank Name</label>
                      <Input
                        placeholder="Bank Name"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <Button
                  className="w-full mt-2"
                  onClick={handleBookFlat}
                  disabled={loading}
                >
                  {loading ? "Booking..." : "Book Flat"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentFlat.status !== "free" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ================= ADD PAYMENT CARD ================= */}
          <Card>
            <CardHeader>
              <CardTitle>Add Payments</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 relative">
              <div className="bg-muted/40 p-4 rounded-lg space-y-3">
                <p className="text-sm text-muted-foreground">
                  Selected Customer
                </p>
                <p className="font-semibold">
                  {bookedData?.customer_name || "N/A"}
                </p>

                <div>
                  <label className="text-sm">Amount Paid</label>
                  <Input
                    type="number"
                    placeholder="e.g. 5,00,000"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm">Payment Mode</label>
                  <select
                    className="w-full mt-1 border rounded px-2 py-2 text-sm"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                  >
                    <option>UPI</option>
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                    <option>Demand Draft</option>
                    <option>Others</option>
                  </select>
                </div>

                {paymentMode === "Cheque" && (
                  <>
                    <div>
                      <label className="text-sm">Cheque Number</label>
                      <Input
                        placeholder="Cheque Number"
                        value={chequeNumber}
                        onChange={(e) => setChequeNumber(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm">Bank Name</label>
                      <Input
                        placeholder="Bank Name"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <Button
                  className="w-full mt-2"
                  onClick={handleAddPayment}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Add Payment"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ================= PAYMENT HISTORY CARD ================= */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 max-h-[320px] overflow-y-auto">
              {historyLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading history...
                </p>
              ) : paymentHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No payments made yet
                </p>
              ) : (
                paymentHistory.map((p) => (
                  <div
                    key={p.paymentId}
                    className="border rounded-lg p-3 flex justify-between items-start"
                  >
                    <div>
                      <p className="font-semibold text-sm">
                        ₹ {p.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleString()}
                      </p>
                      <p className="text-xs">
                        Mode:{" "}
                        <span className="font-medium">{p.summary?.mode}</span>
                      </p>

                      {p.summary?.chequeNumber && (
                        <p className="text-xs">
                          Cheque: {p.summary.chequeNumber}
                        </p>
                      )}

                      {p.summary?.bank && (
                        <p className="text-xs">Bank: {p.summary.bank}</p>
                      )}
                    </div>

                    <Badge variant="outline" className="text-xs">
                      {p.customer?.name || "Customer"}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
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
