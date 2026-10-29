import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-and-conditions")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="bg-background pt-32 pb-24 min-h-screen">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="font-display text-4xl text-forest mb-12 tracking-widest uppercase text-center border-b border-sand pb-8">
          Terms & Conditions
        </h1>
        <div className="space-y-6 text-charcoal/80 leading-relaxed font-light">
          <p><strong>Last Updated: August 2026</strong></p>
          
          <h2 className="text-2xl font-display text-forest mt-10 mb-4">1. Agreement to Terms</h2>
          <p>These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Luxa Naturals ("we", "us", or "our"), concerning your access to and use of our website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.</p>
          
          <h2 className="text-2xl font-display text-forest mt-10 mb-4">2. Intellectual Property Rights</h2>
          <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us.</p>

          <h2 className="text-2xl font-display text-forest mt-10 mb-4">3. User Representations</h2>
          <p>By using the Site, you represent and warrant that:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>All registration information you submit will be true, accurate, current, and complete.</li>
            <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
            <li>You have the legal capacity and you agree to comply with these Terms and Conditions.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

