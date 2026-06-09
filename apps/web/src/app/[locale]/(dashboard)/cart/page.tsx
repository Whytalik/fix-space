"use client";

import { ShoppingCart } from "lucide-react";

export function CartPage() {
  return (
    <div className="flex-1 flex flex-col p-6 md:p-8 lg:p-10 animate-fade-up">
      <h1 className="type-page-title">Shopping Cart</h1>
      <p className="mt-2 text-sm text-ink-secondary">This is a placeholder for your shopping cart.</p>

      <div className="mt-8 flex flex-col gap-6">
        <div className="p-12 border-2 border-dashed border-stroke rounded-2xl flex flex-col items-center justify-center text-ink-secondary bg-surface">
          <div className="w-16 h-16 bg-canvas rounded-full flex items-center justify-center mb-4">
            <ShoppingCart size={24} className="text-ink-muted" />
          </div>
          <p className="text-lg font-bold text-ink">Your cart is empty</p>
          <p className="text-sm text-ink-secondary">Start adding items to your workspace to see them here.</p>
          <button
            type="button"
            className="mt-6 px-6 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-canvas"
          >
            Browse Templates
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
