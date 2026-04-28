import { notFound } from "next/navigation";
import StorefrontPublicClient from "@/components/storefront-public-client";
import { getStripe } from "@/lib/stripe";

// NOTE: This demo uses accountId in URL for simplicity.
// In production, map this to a public slug/username instead.
export default async function StorefrontPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  if (!accountId?.startsWith("acct_")) return notFound();

  try {
    const stripe = getStripe();
    const listed = await stripe.products.list(
      {
        limit: 20,
        active: true,
        expand: ["data.default_price"],
      },
      { stripeAccount: accountId },
    );

    const products = listed.data.map((p) => {
      const price = typeof p.default_price === "object" && p.default_price ? p.default_price : null;
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        defaultPrice: price
          ? {
              id: price.id,
              unit_amount: price.unit_amount,
              currency: price.currency,
            }
          : null,
      };
    });

    return <StorefrontPublicClient accountId={accountId} products={products} />;
  } catch {
    return notFound();
  }
}
