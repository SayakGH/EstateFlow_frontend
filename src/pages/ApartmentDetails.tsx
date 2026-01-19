import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

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

  const fakeCustomers = [
    { id: "C1", name: "Rahul Sharma", phone: "9876543210" },
    { id: "C2", name: "Amit Patel", phone: "9123456789" },
    { id: "C3", name: "Priya Singh", phone: "9000012345" },
  ];

  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [rate, setRate] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextPaymentDate, setNextPaymentDate] = useState("");

  const handleAddPayment = async () => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1200)); // fake API delay

    alert(
      `Payment Added!\nCustomer: ${selectedCustomer.name}\nRate: ₹${rate}/sq.ft\nAmount Paid: ₹${amountPaid}\nNext Payment: ${
        nextPaymentDate || "Not scheduled"
      }`,
    );

    // reset
    setCustomerSearch("");
    setSelectedCustomer(null);
    setRate("");
    setAmountPaid("");
    setNextPaymentDate("");
    setLoading(false);
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
              Flat {flat.block}-{flat.flatno}
            </CardTitle>
            <Badge className={`${statusColor[flat.status]} uppercase`}>
              {flat.status}
            </Badge>
          </div>

          {/* {flat.status === "free" && (
            <Button
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={onPay}
            >
              <CreditCard className="h-4 w-4" />
              Proceed to Payment
            </Button>
          )} */}
        </CardHeader>

        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <InfoCompact label="Project" value={projectName} />
          <InfoCompact label="Block" value={flat.block} />
          <InfoCompact label="Floor" value={String(flat.floor)} />
          <InfoCompact label="Flat No" value={flat.flatno} />
          <InfoCompact label="BHK" value={`${flat.bhk} BHK`} />
          <InfoCompact label="Carpet Area" value={`${flat.sqft} sq.ft`} />
          {flat.status !== "free" && (
            <InfoCompact label="Customer Name" value={"Rahul Sharma"} />
          )}
          {flat.status !== "free" && (
            <InfoCompact label="Total Paid" value={"10,00,00,000"} />
          )}
        </CardContent>
      </Card>

      {flat.status === "free" && (
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
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="mt-1"
              />

              {/* ===== FLOATING RESULTS PANEL ===== */}
              {customerSearch && (
                <div className="absolute left-0 right-0 top-[72px] z-50 bg-white border rounded-xl shadow-lg p-2 space-y-1">
                  {fakeCustomers
                    .filter((c) =>
                      c.name
                        .toLowerCase()
                        .includes(customerSearch.toLowerCase()),
                    )
                    .map((c) => (
                      <div
                        key={c.id}
                        className="flex justify-between items-center p-2 hover:bg-muted rounded-lg cursor-pointer"
                        onClick={() => {
                          setSelectedCustomer(c);
                          setCustomerSearch("");
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
                    ))}

                  {fakeCustomers.filter((c) =>
                    c.name.toLowerCase().includes(customerSearch.toLowerCase()),
                  ).length === 0 && (
                    <p className="text-sm text-muted-foreground p-2">
                      No customers found
                    </p>
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
                    <label className="text-sm">Rate per sq.ft</label>
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

                <Button
                  className="w-full mt-2"
                  onClick={handleAddPayment}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Add Payment"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {flat.status != "free" && (
        <Card>
          <CardHeader>
            <CardTitle>Add Payments</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 relative">
            <div className="bg-muted/40 p-4 rounded-lg space-y-3">
              <p className="text-sm text-muted-foreground">Selected Customer</p>
              <p className="font-semibold">{"Rahul sharma"}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <div>
                    <label className="text-sm">Rate per sq.ft</label>
                    <Input
                      type="number"
                      placeholder="e.g. 5000"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                    />
                  </div> */}

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
      )}
    </div>
  );
}

/* ============ UI Helpers ============ */

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-muted/30 p-4 rounded-xl text-center">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function InfoCompact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 p-2.5 rounded-lg border text-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold truncate">{value}</p>
    </div>
  );
}
