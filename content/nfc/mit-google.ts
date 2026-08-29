export const mitGoogleExperience = {
  id: "mit-google",
  reviewUrl: "https://g.page/r/CQnhiKlLGc5IEBM/review",
  couponCode: "SYUSEI",
  unlockDelaySeconds: 60,
  cookie: {
    name: "mit_google_device",
    maxAgeSeconds: 60 * 60 * 24 * 180,
  },
} as const;

export type MitGoogleScanResponse =
  | {
      state: "review";
      scanCount: number;
      reviewUrl: string;
    }
  | {
      state: "waiting";
      scanCount: number;
      remainingSeconds: number;
      couponCode: string;
    }
  | {
      state: "coupon";
      scanCount: number;
      couponCode: string;
    };
