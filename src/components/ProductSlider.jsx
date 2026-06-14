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
        navigation={true}
        pagination={{ clickable: true }}
        loop={products.length > 1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: true,
          pauseOnMouseEnter: true,
        }}
        className="w-full"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="pb-14 pt-2">
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
