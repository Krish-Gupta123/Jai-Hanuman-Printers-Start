import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCreative, Autoplay } from 'swiper/modules';
import ProductCard from './ProductCard';

export default function ProductSlider({ products, onOrder, onShare, isLoading }) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <p className="text-gray-500 text-lg">No products available at the moment.</p>
        <p className="text-gray-400 text-sm mt-1">Please check back later or login to admin to add products.</p>
      </div>
    );
  }

  // Find start slide index from deep link
  const queryParams = new URLSearchParams(window.location.search);
  const deepLinkProductId = queryParams.get('product');
  let startIndex = 0;

  if (deepLinkProductId && products.length > 0) {
    const index = products.findIndex((p) => p.id === deepLinkProductId);
    if (index !== -1) {
      startIndex = index;
    }
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 relative">
      {/* Custom Navigation Buttons OUTSIDE card/image area */}
      <button
        type="button"
        className="swiper-prev-nav absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow-sm hover:bg-gray-50"
        aria-label="Previous slide"
      >
        <span className="text-xl leading-none">{'<'}</span>
      </button>
      <button
        type="button"
        className="swiper-next-nav absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow-sm hover:bg-gray-50"
        aria-label="Next slide"
      >
        <span className="text-xl leading-none">{'>'}</span>
      </button>

      <Swiper
        modules={[Navigation, Pagination, EffectCreative, Autoplay]}
        grabCursor={true}

        effect={'creative'}
        creativeEffect={{
          prev: {
            shadow: true,
            translate: [0, 0, -400],
          },
          next: {
            translate: ['100%', 0, 0],
          },
        }}
        initialSlide={startIndex}
        slidesPerView={1}
        navigation={{ prevEl: '.swiper-prev-nav', nextEl: '.swiper-next-nav' }}
        pagination={{ clickable: true }}
        loop={products.length > 1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: true,
          pauseOnMouseEnter: true,
        }}
        className="w-full"
      >
        {/* Invisible buttons with proper class for Swiper */}
        <div className="hidden">
          <button type="button" className="swiper-button-prev-custom">{'<'}</button>
          <button type="button" className="swiper-button-next-custom">{'>'}</button>
        </div>


        {products.map((product) => (
          <SwiperSlide key={product.id} className="pt-2 pb-6">
            <ProductCard
              product={product}
              onOrder={onOrder}
              onShare={onShare}
              isLoading={isLoading}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
