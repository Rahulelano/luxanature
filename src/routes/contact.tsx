import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="bg-background pt-32 pb-24">
      {/* Header Section */}
      <div className="mx-auto max-w-7xl px-6 mb-20 text-center">
        <p className="text-eyebrow text-olive mb-4">Connect</p>
        <h1 className="font-display text-5xl lg:text-6xl text-forest leading-tight mb-6">
          We'd love to <span className="gold-text italic">hear from you.</span>
        </h1>
        <p className="max-w-xl mx-auto text-charcoal/70 leading-relaxed font-light">
          Have a question about our products, partnerships, distribution, or business opportunities? Our team is here to help you get the most out of nature's finest.
        </p>
      </div>
      
      {/* Main Content Grid */}
      <div className="mx-auto max-w-6xl px-6 relative">
        <div className="absolute inset-0 bg-gradient-forest rounded-[3rem] -z-10 translate-y-12"></div>
        
        <div className="grid lg:grid-cols-5 gap-0 bg-cream rounded-[3rem] shadow-luxe overflow-hidden border border-sand">
          
          {/* Left: Contact Info */}
          <div className="lg:col-span-2 bg-gradient-forest text-cream p-12 lg:p-16 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 size-64 bg-gold/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 flex-1">
              <h3 className="font-display text-3xl mb-12">Get in Touch</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4 hover:-translate-y-1 transition-transform duration-300">
                  <div className="glass-dark p-3 rounded-full mt-1">
                    <Mail className="size-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs tracking-widest uppercase text-cream/50 mb-1">Email</p>
                    <p className="text-lg font-medium text-cream">care@luxanaturals.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 hover:-translate-y-1 transition-transform duration-300">
                  <div className="glass-dark p-3 rounded-full mt-1">
                    <Phone className="size-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs tracking-widest uppercase text-cream/50 mb-1">Phone</p>
                    <p className="text-lg font-medium text-cream">+91 72001 10078</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 hover:-translate-y-1 transition-transform duration-300">
                  <div className="glass-dark p-3 rounded-full mt-1">
                    <MapPin className="size-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs tracking-widest uppercase text-cream/50 mb-1">Office</p>
                    <p className="text-lg font-medium text-cream leading-relaxed">
                      Bengaluru, India<br/>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-16 pt-8 border-t border-white/10">
              <p className="font-display text-2xl mb-1">Luxa Naturals</p>
              <p className="text-[0.65rem] tracking-[0.3em] text-gold uppercase">Nature. Quality. Wellness.</p>
            </div>
          </div>
          
          {/* Right: Contact Form */}
          <div className="lg:col-span-3 p-12 lg:p-16 flex flex-col justify-center bg-white/50">
            <h3 className="font-display text-3xl text-forest mb-2">Send a Message</h3>
            <p className="text-charcoal/60 mb-10 text-sm">Fill out the form below and we'll get back to you shortly.</p>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Thank you! Your message has been sent.");
                (e.target as HTMLFormElement).reset();
              }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-widest uppercase text-olive font-semibold">Your Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    required
                    className="w-full px-4 py-3 bg-transparent border-b border-olive/20 focus:border-olive focus:outline-none transition-colors text-charcoal placeholder:text-charcoal/30 pb-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-widest uppercase text-olive font-semibold">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com" 
                    required
                    className="w-full px-4 py-3 bg-transparent border-b border-olive/20 focus:border-olive focus:outline-none transition-colors text-charcoal placeholder:text-charcoal/30 pb-2"
                  />
                </div>
              </div>
              
              <div className="space-y-2 pt-4">
                <label className="text-[0.65rem] tracking-widest uppercase text-olive font-semibold">Your Message</label>
                <textarea 
                  placeholder="How can we help you?" 
                  rows={4}
                  required
                  className="w-full px-4 py-3 bg-transparent border-b border-olive/20 focus:border-olive focus:outline-none transition-colors text-charcoal placeholder:text-charcoal/30 pb-2 resize-none"
                />
              </div>
              
              <button 
                type="submit"
                className="mt-8 group inline-flex items-center justify-center gap-3 bg-charcoal text-cream px-8 py-4 rounded-full text-[0.65rem] tracking-[0.24em] uppercase hover:bg-olive transition-colors w-full sm:w-auto"
              >
                Send Message
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
          
        </div>
      </div>
      
      {/* Enquiries info */}
      <div className="mx-auto max-w-5xl px-6 mt-32 grid md:grid-cols-2 gap-12">
        <div className="border border-sand bg-cream p-8 rounded-3xl hover:border-olive/30 transition-colors">
          <h3 className="font-display text-2xl text-forest mb-4">Business Enquiries</h3>
          <p className="text-charcoal/70 text-sm leading-relaxed">
            For distributor enquiries, wholesale opportunities, private-label partnerships, 
            retail enquiries, and business collaborations, please contact our team directly via email.
          </p>
        </div>
        <div className="border border-sand bg-cream p-8 rounded-3xl hover:border-olive/30 transition-colors">
          <h3 className="font-display text-2xl text-forest mb-4">Customer Support</h3>
          <p className="text-charcoal/70 text-sm leading-relaxed">
            For product-related questions, feedback, tracking orders, or assistance with our online store, 
            please reach out to our dedicated support team using the form above.
          </p>
        </div>
      </div>
    </div>
  );
}
