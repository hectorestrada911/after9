import type { QRCodeToDataURLOptions } from "qrcode";

/** High-contrast, larger modules for easier scanning with phone cameras and door scanners. */
export const TICKET_QR_TO_PNG_OPTIONS: QRCodeToDataURLOptions = {
  type: "image/png",
  width: 480,
  margin: 2,
  errorCorrectionLevel: "H",
  color: { dark: "#000000", light: "#ffffff" },
};
