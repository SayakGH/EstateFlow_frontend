import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import type { KycCustomer, KycResponse } from "@/types/kycTypes";
import { approveKyc, deleteKyc } from "@/api/kyc";
import { useState } from "react";

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
import { Loader2, Trash2 } from "lucide-react";

const CLOUDFRONT_URL = "http://d1ct2g1ctzkyn2.cloudfront.net";

export default function CustomerDetails({
  customer,
  setSelectedCustomer,
  onBack,
  onStatusChange,
}: {
  customer: KycCustomer;
  setSelectedCustomer: React.Dispatch<React.SetStateAction<KycCustomer | null>>;
  onBack: () => void;
  onStatusChange?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const buildUrl = (key?: string) => (key ? `${CLOUDFRONT_URL}/${key}` : "");

  const handleApprove = async () => {
    try {
      setLoading(true);

      const data: KycResponse = await approveKyc(customer._id);

      if (data.customer) {
        setSelectedCustomer(data.customer); // ✅ update UI instantly
      }

      onStatusChange?.(); // optional: refresh list
    } catch (err) {
      alert("Failed to approve KYC");
    } finally {
      setLoading(false);
    }
  };
  const handleReject = async () => {
    try {
      setLoading(true);

      await deleteKyc(customer._id);
      onBack();
    } catch (err) {
      alert("Failed to approve KYC");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Customers
      </Button>

      {/* CUSTOMER INFO */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center gap-2">
            <CardTitle className="text-xl">{customer.name}</CardTitle>
            <Badge className="uppercase">{customer.status}</Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* <Badge className="uppercase">{customer.status}</Badge> */}

            {customer.status === "pending" && (
              <div className="flex items-center gap-2">
                {/* Approve */}
                <Button
                  size="sm"
                  onClick={() => setApproveOpen(true)}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>

                {/* Reject */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRejectOpen(true)}
                  className="gap-2 border-destructive text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Info label="Address" value={customer.address} />
          <Info label="Phone" value={customer.phone} />
          <Info label="Aadhaar" value={customer.aadhaar} />
          <Info label="PAN" value={customer.pan} />
          <Info label="Voter ID" value={customer.voter_id || "Not provided"} />
          <Info label="Other ID" value={customer.other_id || "Not provided"} />
        </CardContent>
      </Card>

      {/* DOCUMENTS */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Doc label="Aadhaar" url={buildUrl(customer.aadhaar_key)} />
          <Doc label="PAN" url={buildUrl(customer.pan_key)} />
          {customer.voter_key && (
            <Doc label="Voter ID" url={buildUrl(customer.voter_key)} />
          )}
          {customer.other_key && (
            <Doc label="Other ID" url={buildUrl(customer.other_key)} />
          )}
        </CardContent>
      </Card>
      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle>Approve KYC</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to approve KYC for{" "}
              <span className="font-medium text-foreground">
                {customer.name}
              </span>
              . This confirms the customer’s identity.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Approving
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle>Reject & Delete KYC</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {customer.name}
              </span>
              ’s profile and all uploaded KYC documents.
              <span className="text-muted-foreground">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Reject
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ================= UI Blocks ================= */

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/40 p-4 rounded-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function Doc({ label, url }: { label: string; url: string }) {
  return (
    <div className="border rounded-xl overflow-hidden shadow-sm">
      <div className="p-2 font-semibold bg-muted">{label}</div>
      <img src={url} className="w-full h-72 object-contain bg-black/5" />
      <Button
        variant="outline"
        className="w-full rounded-none"
        onClick={() => window.open(url, "_blank")}
      >
        Open Full
      </Button>
    </div>
  );
}
