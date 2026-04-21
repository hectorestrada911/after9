const DEFAULT_PLATFORM_FEE_PERCENT = 10;

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_PLATFORM_FEE_PERCENT;
  return Math.min(90, Math.max(0, value));
}

export function resolvePlatformFeePercent(raw?: string | null) {
  const parsed = Number(raw ?? "");
  return clampPercent(parsed);
}

export function platformFeeFromGrossCents(grossCents: number, feePercent: number) {
  const safeGross = Math.max(0, Math.round(grossCents));
  const safePercent = clampPercent(feePercent);
  return Math.round((safeGross * safePercent) / 100);
}

export function hostNetFromGrossCents(grossCents: number, feePercent: number) {
  const safeGross = Math.max(0, Math.round(grossCents));
  return Math.max(0, safeGross - platformFeeFromGrossCents(safeGross, feePercent));
}

