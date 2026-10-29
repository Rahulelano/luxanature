import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="bg-background pt-32 pb-24 min-h-screen">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="font-display text-4xl text-forest mb-12 tracking-widest uppercase text-center border-b border-sand pb-8">
          Privacy Policy
        </h1>
        <div className="space-y-6 text-charcoal/80 leading-relaxed font-light">
          <p><strong>Last Updated: August 2026</strong></p>
          
          <h2 className="text-2xl font-display text-forest mt-10 mb-4">1. Introduction</h2>
          <p>Welcome to Luxa Naturals. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>
          
          <h2 className="text-2xl font-display text-forest mt-10 mb-4">2. The Data We Collect About You</h2>
          <p>Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
            <li><strong>Financial Data</strong> includes bank account and payment card details (processed securely by our payment gateways).</li>
          </ul>

          <h2 className="text-2xl font-display text-forest mt-10 mb-4">3. How We Use Your Personal Data</h2>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal or regulatory obligation.</li>
          </ul>

          <p className="mt-12 text-sm italic">If you have any questions about this privacy policy, please contact us at care@luxanaturals.com</p>
        </div>
      </div>
    </div>
  );
}
