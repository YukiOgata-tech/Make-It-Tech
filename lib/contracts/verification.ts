import "server-only";

import type { VerificationMethod } from "@/lib/contracts/constants";

export type VerificationResult = {
  method: VerificationMethod;
  status: "succeeded" | "failed";
  transactionId: string | null;
  verifiedAt: Date | null;
};

export interface VerificationProvider {
  readonly method: VerificationMethod;
  verify(input: { expectedEmail: string; tokenValidated: boolean }): Promise<VerificationResult>;
}
export class CompanyEmailLinkVerificationProvider implements VerificationProvider {
  readonly method = "company_email_link" as const;

  async verify(input: { expectedEmail: string; tokenValidated: boolean }) {
    const succeeded = Boolean(input.expectedEmail) && input.tokenValidated;
    return {
      method: this.method,
      status: succeeded ? ("succeeded" as const) : ("failed" as const),
      transactionId: null,
      verifiedAt: succeeded ? new Date() : null,
    };
  }
}

export function getVerificationProvider(method: VerificationMethod): VerificationProvider {
  if (method === "company_email_link") {
    return new CompanyEmailLinkVerificationProvider();
  }
  throw new Error("JPKI verification is not configured.");
}
