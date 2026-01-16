import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle, XCircle, FileText } from "lucide-react";
import { getPresignedUrls, submitKyc } from "@/api/kyc";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

export default function KYC() {
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    aadhaar: "",
    pan: "",
    voter: "",
    otherId: "",
  });

  type KycFiles = {
    aadhaar: File | null;
    pan: File | null;
    voter: File | null;
    other: File | null;
  };

  const [files, setFiles] = useState<KycFiles>({
    aadhaar: null,
    pan: null,
    voter: null,
    other: null,
  });

  const handleFile = async (key: keyof KycFiles, file: File | null) => {
    if (!file) return;

    const compressed = await imageCompression(file, {
      maxSizeMB: 0.6,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
    });

    setFiles((prev) => ({ ...prev, [key]: compressed }));
  };

  const isValid =
    form.name &&
    form.phone &&
    form.address &&
    form.aadhaar &&
    form.pan &&
    files.aadhaar &&
    files.pan;

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      if (!files.aadhaar || !files.pan) {
        toast.error("Aadhaar and PAN are required");
        return;
      }

      setSubmitting(true);

      const presign = await getPresignedUrls({
        aadhaarType: files.aadhaar.type,
        panType: files.pan.type,
        voterType: files.voter?.type,
        otherType: files.other?.type,
      });

      const { customerId, aadhaar, pan, voter, other } = presign;

      await fetch(aadhaar.url, {
        method: "PUT",
        body: files.aadhaar,
        headers: { "Content-Type": files.aadhaar.type },
      });

      await fetch(pan.url, {
        method: "PUT",
        body: files.pan,
        headers: { "Content-Type": files.pan.type },
      });

      if (files.voter && voter) {
        await fetch(voter.url, {
          method: "PUT",
          body: files.voter,
          headers: { "Content-Type": files.voter.type },
        });
      }

      if (files.other && other) {
        await fetch(other.url, {
          method: "PUT",
          body: files.other,
          headers: { "Content-Type": files.other.type },
        });
      }

      // 🔹 NORMALIZED NAME (frontend responsibility)
      const normalizedName = form.name
        .toLowerCase()
        .replace(/\s+/g, "");

      await submitKyc({
        customerId,
        name: form.name,
        normalized_name: normalizedName, // ✅ BACKEND SYNC
        phone: form.phone,
        address: form.address,
        aadhaar: form.aadhaar,
        pan: form.pan,
        voter: form.voter,
        other: form.otherId,
        aadhaarKey: aadhaar.key,
        panKey: pan.key,
        voterKey: voter?.key || "",
        otherKey: other?.key || "",
      });

      toast.success("KYC submitted successfully");

      setForm({
        name: "",
        phone: "",
        address: "",
        aadhaar: "",
        pan: "",
        voter: "",
        otherId: "",
      });

      setFiles({
        aadhaar: null,
        pan: null,
        voter: null,
        other: null,
      });
    } catch (err: any) {
      console.error(err);

      if (err?.response?.status === 409) {
        toast.error("KYC creation failed : Duplicate exists");
      } else {
        toast.error("KYC submission failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer KYC Verification</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* PERSONAL DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              placeholder="Full Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          {/* GOVERNMENT IDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KycField
              label="Aadhaar Number"
              required
              value={form.aadhaar}
              onChange={(v) => setForm({ ...form, aadhaar: v })}
              onFile={(f) => handleFile("aadhaar", f)}
              file={files.aadhaar}
            />

            <KycField
              label="PAN Number"
              required
              value={form.pan}
              onChange={(v) => setForm({ ...form, pan: v })}
              onFile={(f) => handleFile("pan", f)}
              file={files.pan}
            />

            <KycField
              label="Voter ID"
              value={form.voter}
              onChange={(v) => setForm({ ...form, voter: v })}
              onFile={(f) => handleFile("voter", f)}
              file={files.voter}
            />

            <KycField
              label="Other Govt ID"
              value={form.otherId}
              onChange={(v) => setForm({ ...form, otherId: v })}
              onFile={(f) => handleFile("other", f)}
              file={files.other}
            />
          </div>

          {/* STATUS + ACTION */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isValid ? (
                <Badge className="bg-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" /> Ready for Approval
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-4 w-4 mr-1" /> Missing Required Documents
                </Badge>
              )}
            </div>

            <Button disabled={!isValid || submitting} onClick={handleSubmit}>
              {submitting ? "Submitting..." : "Submit KYC"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ========================= KYC Field ========================= */

function KycField({
  label,
  required,
  value,
  onChange,
  onFile,
  file,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  onFile: (f: File | null) => void;
  file: File | null;
}) {
  return (
    <div className="border rounded-xl p-4 space-y-3 bg-white shadow-sm">
      <div className="flex justify-between">
        <p className="font-semibold text-sm">
          {label} {required && <span className="text-red-500">*</span>}
        </p>
        {file && <CheckCircle className="text-green-600 h-4 w-4" />}
      </div>

      <Input
        placeholder={`Enter ${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <label className="flex items-center gap-2 cursor-pointer text-sm text-indigo-600">
        <Upload className="h-4 w-4" />
        Upload Document
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
      </label>

      {file && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <FileText className="h-3 w-3" /> {file.name}
        </p>
      )}
    </div>
  );
}
