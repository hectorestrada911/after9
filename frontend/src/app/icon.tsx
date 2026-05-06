import { rageTabFaviconImageResponse } from "@/lib/rage-tab-favicon";

export const contentType = "image/png";

export const size = {
  width: 32,
  height: 32,
};

export default function Icon() {
  return rageTabFaviconImageResponse(32);
}
