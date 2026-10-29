import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/shipping-and-delivery")({
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <div className="bg-background pt-32 pb-24 min-h-screen">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="font-display text-4xl text-forest mb-12 tracking-widest uppercase text-center border-b border-sand pb-8">
          Shipping & Delivery
        </h1>
        <div className="space-y-6 text-charcoal/80 leading-relaxed font-light">
          <p>At Luxa Naturals, we strive to deliver your products as quickly and safely as possible.</p>
          
          <h2 className="text-2xl font-display text-forest mt-10 mb-4">1. Processing Time</h2>
          <p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.</p>
          
          <h2 className="text-2xl font-display text-forest mt-10 mb-4">2. Shipping Rates & Delivery Estimates</h2>
          <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Standard Shipping:</strong> 3-5 business days</li>
            <li><strong>Express Shipping:</strong> 1-2 business days</li>
          </ul>
          <p className="italic">Delivery delays can occasionally occur due to unforeseen circumstances or location constraints.</p>

          <h2 className="text-2xl font-display text-forest mt-10 mb-4">3. Shipment Tracking</h2>
          <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.</p>

          <h2 className="text-2xl font-display text-forest mt-10 mb-4">4. Damages</h2>
          <p>Luxa Naturals is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.</p>
        </div>
      </div>
    </div>
  );
}
