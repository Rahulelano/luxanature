import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/refund-and-cancellation")({
  component: RefundPage,
});

function RefundPage() {
  return (
    <div className="bg-background pt-32 pb-24 min-h-screen">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="font-display text-4xl text-forest mb-12 tracking-widest uppercase text-center border-b border-sand pb-8">
          Refund & Cancellation Policy
        </h1>
        <div className="space-y-6 text-charcoal/80 leading-relaxed font-light">
          <p>Thank you for shopping at Luxa Naturals. We want to ensure you have a rewarding experience while exploring, evaluating, and purchasing our products.</p>
          
          <h2 className="text-2xl font-display text-forest mt-10 mb-4">1. Cancellations</h2>
          <p>You may cancel your order at any time before it has been processed and shipped. Once an order has been dispatched from our facility, we are unable to accept cancellations. To request a cancellation, please contact us immediately at care@luxanaturals.com with your order number.</p>
          
          <h2 className="text-2xl font-display text-forest mt-10 mb-4">2. Returns & Refunds</h2>
          <p>Due to the consumable nature of our products (honey, nutritional products) and hygiene considerations (cosmetics), we generally do not accept returns. However, your satisfaction is our priority.</p>
          <p>If you receive a product that is defective, damaged in transit, or incorrect based on your order, please contact us within 48 hours of delivery. We will evaluate the issue and make it right by issuing a replacement or a refund.</p>

          <h2 className="text-2xl font-display text-forest mt-10 mb-4">3. Refund Processing</h2>
          <p>If your refund request is approved, we will initiate a refund to your original method of payment. You will receive the credit within a certain amount of days, depending on your card issuer's policies (typically 5-7 business days).</p>

          <h2 className="text-2xl font-display text-forest mt-10 mb-4">4. Contact Us</h2>
          <p>If you have any questions about our Returns and Cancellations Policy, please contact us:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>By email: care@luxanaturals.com</li>
            <li>By phone: +91 72001 10078</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
