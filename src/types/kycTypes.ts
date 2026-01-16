export interface PresignedUrl {
  key: string;
  url: string;
}

export interface PresignKycResponse {
  customerId: string;
  aadhaar: PresignedUrl;
  pan: PresignedUrl;
  voter?: PresignedUrl | null;
  other?: PresignedUrl | null;
}

export interface KycPayload {
  customerId: string;
  name: string;
  phone: string;
  address: string;
  aadhaar: string;
  pan: string;
  voter?: string;
  other?: string;
  aadhaarKey: string;
  panKey: string;
  voterKey?: string;
  otherKey?: string;
}

export interface KycResponse {
  success: boolean;
  message: string;
  customer?: KycCustomer;
}

export interface KycCustomer {
  _id: string;

  // Basic Info
  name: string;
  phone: string;
  address: string;

  // KYC Status
  status: "pending" | "approved" | "rejected";

  // KYC Document Storage Keys (S3 / CDN paths)
  aadhaar_key: string;
  pan_key: string;
  voter_key?: string;
  other_key?: string;

  // Optional Raw IDs (if you temporarily store them)
  aadhaar: string;
  pan: string;
  voter_id?: string;
  other_id?: string;

  // Metadata
  createdAt: string; // ISO string
}

export interface IGetCustomersResponse {
  success: boolean;
  count: number;
  customers: KycCustomer[];
}
