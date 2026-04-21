import type { QRCodeToDataURLOptions } from "qrcode";

/** High-contrast, larger modules — easier for phone cameras + door scanners. */
export const TICKET_QR_TO_PNG_OPTIONS: QRCodeToDataURLOptions = {
  type: "image/png",
  width: 480,
  margin: 2,
  errorCorrectionLevel: "H",
  color: { dark: "#000000", light: "#ffffff" },
};
