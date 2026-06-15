import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { settingsService } from '../services/settingsService';
import ProductSlider from '../components/ProductSlider';
import { Printer, Shield, Loader2 } from 'lucide-react';
import logoImg from '../../images/logo.jpeg';
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
      const cleanNumber = settings.whatsapp_number.trim().replace(/[+\s-]/g, '');

      const template = settings.whatsapp_message_template;
      const perProductMessage = (product.whatsapp_message || '').trim();

      // If admin set custom message for this product, use it.
      // Otherwise use global template with {productName}
      const generatedMessage = perProductMessage
        ? perProductMessage.replace(/{productName}/g, product.name)
        : template.replace(/{productName}/g, product.name);

      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(generatedMessage)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Order redirect error:', error);
      toast.error('Could not initiate order. Please try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  // Web Share (share website link / or product deep link)
  const handleShare = async (product) => {
    const shareUrl = product
      ? `${window.location.origin}/?product=${product.id}`
      : `${window.location.origin}/`;

    const shareTitle = product ? product.name : 'Jai Hanuman Printer';
    const shareText = product
      ? `Check out ${product.name} at Jai Hanuman Printer!`
      : 'Jai Hanuman Printer';

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share error:', err);
          toast.error('Could not share link.');
        }
      }
    } else {
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
            <div className="p-0.5 rounded-lg flex items-center justify-center">
              <img
                src={logoImg}
                alt="Jai Hanuman Logo"
                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                className="w-10 h-10 object-contain mr-2"
              />
              <div className="p-1.5 bg-red-600 text-white rounded-lg hidden" aria-hidden>
                <Printer size={20} />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-gray-950 uppercase">
                Jai Hanuman Printer
              </h1>
            </div>
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

      {/* Contact / CTA Block removed — CTAs are now in shared 2x2 block above footer */}

      {/* Shared compact 2x2 buttons (centered) placed after listing and before footer */}
      <section className="w-full max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white border border-gray-100 rounded-3xl py-6 px-6">
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-3">
              <a
                href="tel:+919324595111"
                className="flex items-center justify-center px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-xl shadow-sm text-sm"
              >
                Contact
              </a>

              <a
                href="upi://pay?pa=sarafsantosha@okaxis&pn=Hashita%20Saraf&aid=uGICAgICr7qLbNg"
                className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-900 rounded-xl shadow-sm text-sm"
              >
                GPay
              </a>

              <button
                onClick={() => handleShare(null)}
                className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-900 rounded-xl shadow-sm text-sm"
              >
                Share
              </button>

              <a
                href="https://jai-hanuman-printers.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-900 rounded-xl shadow-sm text-sm"
              >
                Website
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Block */}
      <footer className="w-full bg-white border-t border-gray-100 py-6 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-400 font-medium">
            © {new Date().getFullYear()} Jai Hanuman Printer. All rights reserved.
            <div className="mt-1">
              Made by{' '}
              <a
                href="https://wa.me/8080473728"
                target="_blank"
                rel="noreferrer"
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Krish Gupta
              </a>
            </div>
          </div>

          <a
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600 transition-colors font-semibold"
          >
            <Shield size={12} />
            <span>Admin Console</span>
          </a>
        </div>
      </footer>

      {/* Sticky WhatsApp Button (bottom-right) */}
      <a
        href="https://wa.me/9324595111"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-20 right-5 z-50 px-4 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 transition-all cursor-pointer text-sm flex items-center gap-2"
        aria-label="Chat on WhatsApp"
      >
        WhatsApp
      </a>

    </div>
  );
}

