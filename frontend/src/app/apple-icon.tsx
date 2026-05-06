import { rageTabFaviconImageResponse } from "@/lib/rage-tab-favicon";

export const contentType = "image/png";

export const size = {
  width: 180,
  height: 180,
};

export default function AppleIcon() {
  return rageTabFaviconImageResponse(180);
}
