import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
});

function BlogPage() {
  return (
    <div className="pt-32 pb-24 text-charcoal max-w-5xl mx-auto px-6">
      <div className="text-center mb-16">
        <h1 className="font-display text-4xl text-forest mb-6 tracking-widest uppercase">The Luxa Naturals Journal</h1>
        <p className="max-w-2xl mx-auto text-charcoal/70">
          Explore useful information, product knowledge, beauty insights, nutrition topics, and natural lifestyle ideas through the Luxa Naturals Blog.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
        <div>
          <h2 className="font-display text-2xl text-olive mb-6 border-b border-gold/30 pb-4">Honey & Natural Foods</h2>
          <ul className="space-y-3 font-light">
            <li>• How to Choose Quality Honey</li>
            <li>• Different Types of Honey and Their Characteristics</li>
            <li>• Ways to Enjoy Honey in Everyday Life</li>
            <li>• Honey Storage: Simple Tips</li>
          </ul>
        </div>
        
        <div>
          <h2 className="font-display text-2xl text-olive mb-6 border-b border-gold/30 pb-4">Nutrition & Wellness</h2>
          <ul className="space-y-3 font-light">
            <li>• Building Better Everyday Nutrition Habits</li>
            <li>• Understanding Nutritional Ingredients</li>
            <li>• Simple Ideas for a Balanced Lifestyle</li>
            <li>• Reading Nutrition Labels: A Beginner's Guide</li>
          </ul>
        </div>
        
        <div>
          <h2 className="font-display text-2xl text-olive mb-6 border-b border-gold/30 pb-4">Beauty & Skin Care</h2>
          <ul className="space-y-3 font-light">
            <li>• Building a Simple Skin-Care Routine</li>
            <li>• Understanding Cosmetic Ingredients</li>
            <li>• Natural Ingredients Commonly Used in Skin Care</li>
            <li>• Everyday Tips for Healthy-Looking Skin</li>
          </ul>
        </div>
        
        <div>
          <h2 className="font-display text-2xl text-olive mb-6 border-b border-gold/30 pb-4">Hair & Personal Care</h2>
          <ul className="space-y-3 font-light">
            <li>• Simple Hair-Care Habits</li>
            <li>• Choosing the Right Personal-Care Products</li>
            <li>• Understanding Botanical Ingredients in Cosmetics</li>
          </ul>
        </div>
      </div>
      
      <p className="max-w-2xl mx-auto text-center text-xs text-charcoal/50 mt-20 pt-8 border-t border-gold/20">
        Our blog provides general educational information and is not intended to replace professional medical or nutritional advice.
      </p>
    </div>
  );
}
