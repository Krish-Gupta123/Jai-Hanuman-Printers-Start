import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { settingsService } from '../services/settingsService';
import ProductSlider from '../components/ProductSlider';
import { Printer, Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Website() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);

  // Load products
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const fetchedProducts = await productService.getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching storefront data:', error);
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp Redirect Handler
  const handleOrder = async (product) => {
    setIsOrdering(true);
    try {
      const settings = await settingsService.getSettings();
      // Clean number (ensure no spaces, hyphens, or '+' signs, although wa.me supports numeric format)
      const cleanNumber = settings.whatsapp_number.trim().replace(/[+\s-]/g, '');
      const template = settings.whatsapp_message_template;
      
      // Replace {productName} placeholder
      const generatedMessage = template.replace(/{productName}/g, product.name);
      
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(generatedMessage)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Order redirect error:', error);
      toast.error('Could not initiate order. Please try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  // Web Share / Clipboard Copy Handler
  const handleShare = async (product) => {
    // Generate deep-link to this product
    const shareUrl = `${window.location.origin}/?product=${product.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} at Jai Hanuman Printer!`,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share error:', err);
          toast.error('Could not share link.');
        }
      }
    } else {
      // Desktop fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link Copied');
      } catch (err) {
        console.error('Clipboard copy error:', err);
        toast.error('Failed to copy link.');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {/* Header Block */}
      <header className="w-full bg-white border-b border-gray-100 py-6 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-red-600 text-white rounded-lg">
              <Printer size={20} />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-950 uppercase">
              Jai Hanuman Printer
            </h1>
          </div>
          <span className="h-[2px] w-12 bg-red-600 rounded-full mt-1"></span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center py-6 px-4">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
            <p className="text-gray-400 font-medium">Loading catalog...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="w-full">
            {/* Swiper Slider Wrapper */}
            <ProductSlider
              products={products}
              onOrder={handleOrder}
              onShare={handleShare}
              isLoading={isOrdering}
            />
          </div>
        ) : (
          <div className="text-center py-20 px-6 max-w-sm bg-white rounded-3xl shadow-md border border-gray-100">
            <p className="text-gray-500 font-semibold text-lg">No Products Available</p>
            <p className="text-gray-400 text-sm mt-2">
              Our printing catalog is empty. Please contact administration.
            </p>
          </div>
        )}
      </main>

      {/* Footer Block */}
      <footer className="w-full bg-white border-t border-gray-100 py-6 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 font-medium">
            © {new Date().getFullYear()} Jai Hanuman Printer. All rights reserved.
          </p>
          <a
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600 transition-colors font-semibold"
          >
            <Shield size={12} />
            <span>Admin Console</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
