import React from 'react';
import fs from 'fs';
import path from 'path';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import BrandLogos from '@/components/BrandLogos';
import PromoBannerSlider from '@/components/PromoBannerSlider';
import CategoryCircles from '@/components/CategoryCircles';
import TodaySuperDeals from '@/components/TodaySuperDeals';
import BestSelling from '@/components/BestSelling';
import BentoPromo from '@/components/BentoPromo';
import FeaturedProducts from '@/components/FeaturedProducts';
import CategoryShowcase from '@/components/CategoryShowcase';
import FindFavoriteProducts from '@/components/FindFavoriteProducts';
import GoogleReviewsSlider from '@/components/GoogleReviewsSlider';
import StoreVideoBanner from '@/components/StoreVideoBanner';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getHomepageConfig() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'homepage.json');
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading homepage.json in page.tsx:', err);
  }
  return null;
}

export default function HomePage() {
  const config = getHomepageConfig();
  const isBrandsEnabled = config?.brandsBar?.enabled !== false;
  const isPromoEnabled = Boolean(
    config?.promoBanners?.enabled === true && 
    (config?.promoBanners?.banners?.length || 0) > 0
  );
  const isCategoriesEnabled = config?.shopByCategories?.enabled !== false;
  const isSuperDealsEnabled = Boolean(
    config?.superDeals?.enabled !== false && 
    ((config?.superDeals?.productIds?.length || config?.superDeals?.items?.length || 0) > 0)
  );
  const isBentoEnabled = config?.bentoGrid?.enabled !== false;

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* 1. Header with Top Announcement Bar, Main Navigation & Sub-nav */}
      <Header />

      {/* 2. Hero Section (Customizable 3 Boxes) */}
      <HeroSection initialData={config?.hero} />

      {/* 3. Brand Logos Bar */}
      {isBrandsEnabled && <BrandLogos initialConfig={config?.brandsBar} />}

      {/* 4. Promotional Banners Slider (Below Brand Logos - 11.11 & Seasonal Promo) */}
      {isPromoEnabled && <PromoBannerSlider initialConfig={config?.promoBanners} />}

      {/* 5. Shop by Categories */}
      {isCategoriesEnabled && <CategoryCircles initialConfig={config?.shopByCategories} />}

      {/* 6. Today's Super Deals Slider (Between Categories & Best Selling) */}
      {isSuperDealsEnabled && <TodaySuperDeals initialConfig={config?.superDeals} />}

      {/* 7. Best Selling Products */}
      <BestSelling />

      {/* 8. Bento Promotional Grid */}
      {isBentoEnabled && <BentoPromo initialConfig={config?.bentoGrid} />}

      {/* 9. Featured Products */}
      <FeaturedProducts />

      {/* 10. Category Showcase Rows (Smartwatches & Power Banks) */}
      <CategoryShowcase />

      {/* 11. Find Your Favorite Products */}
      <FindFavoriteProducts />

      {/* 12. Google Reviews Carousel (4.9 Rating / 111 Reviews) */}
      <GoogleReviewsSlider />

      {/* 13. Flagship Store Video Loop Banner */}
      <StoreVideoBanner />

      {/* 14. Global Footer */}
      <Footer />
    </main>
  );
}
