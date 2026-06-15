import React from 'react';
import { ShoppingBag, Share2 } from 'lucide-react';

export default function ProductCard({ product, onOrder, onShare, isLoading }) {
  const description = (product.product_description || '').trim();

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col my-4">
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden group">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Modern gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {/* Red Accent Top border line */}
        <div className="absolute top-0 left-0 w-full h-[6px] bg-red-600"></div>
      </div>

      {/* Compact 2x2 Action Buttons under image (centered, minimal space) */}
      <div className="w-full flex items-center justify-center mt-3">
        <div className="grid grid-cols-2 gap-2 w-40">
          <a
            href="tel:+919324595111"
            className="text-xs flex items-center justify-center px-2 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 shadow-sm hover:shadow-md transition-colors"
            title="Contact"
          >
            Contact
          </a>

          <a
            href="upi://pay?pa=sarafsantosha@okaxis&pn=Hashita%20Saraf&aid=uGICAgICr7qLbNg"
            className="text-xs flex items-center justify-center px-2 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 shadow-sm hover:shadow-md transition-colors"
            title="Pay with GPay"
          >
            GPay
          </a>

          <button
            onClick={() => onShare(null)}
            className="text-xs flex items-center justify-center px-2 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-800 shadow-sm hover:bg-gray-200 transition-colors"
            title="Share website"
          >
            Share
          </button>

          <a
            href="https://jai-hanuman-printers.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="text-xs flex items-center justify-center px-2 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-800 shadow-sm hover:bg-gray-200 transition-colors"
            title="Open Website"
          >
            Website
          </a>
        </div>
      </div>

      {/* Product Information & Action Area */}
      <div className="p-6 flex flex-col items-center flex-grow bg-white">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-3 min-h-[3.5rem] flex items-center justify-center line-clamp-2">
          {product.name}
        </h2>

        {description ? (
          <p className="w-full text-sm text-gray-600 text-center mt-0 mb-4 whitespace-pre-wrap">
            {description}
          </p>
        ) : null}

        {/* Buttons Block */}
        <div className="flex w-full items-center gap-3 mt-auto">
          {/* Order Now (WhatsApp) Button */}
          <button
            onClick={() => onOrder(product)}
            disabled={isLoading}
            className="flex-grow flex items-center justify-center gap-2 px-5 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-2xl shadow-md shadow-red-200 hover:shadow-lg hover:shadow-red-300 transition-all duration-200 text-base active:scale-98 cursor-pointer"
          >
            <ShoppingBag size={18} />
            <span>Order Now</span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => onShare(product)}
            className="flex items-center justify-center p-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Share product"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

