'use client';

import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, ExternalLink, CheckCircle2 } from 'lucide-react';
import initialReviewsData from '@/data/reviews.json';

interface GoogleReviewItem {
  id: string;
  name: string;
  time: string;
  rating: number;
  text: string;
  verified?: boolean;
  location?: string;
  avatarBg?: string;
}

export default function GoogleReviewsSlider() {
  const [reviewsData, setReviewsData] = useState<GoogleReviewItem[]>(
    (initialReviewsData as any).reviews || []
  );
  const [stats, setStats] = useState(
    (initialReviewsData as any).stats || {
      storeName: 'DWStore',
      rating: 4.9,
      totalReviews: 111,
      mapsUrl: 'https://maps.google.com/?q=DWStore+No.55/1/2+Borella+Rd+Pannipitiya',
    }
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  // Fetch updated reviews dynamically from API
  useEffect(() => {
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.reviews)) {
          setReviewsData(data.reviews);
          if (data.stats) setStats(data.stats);
        }
      })
      .catch((err) => console.log('Using static reviews fallback:', err));
  }, []);

  // Responsive items count (1 on mobile, 2 on tablet, 3 on laptop, 4 on desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else if (window.innerWidth < 1280) {
        setItemsPerPage(3);
      } else {
        setItemsPerPage(4);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, reviewsData.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (reviewsData.length <= itemsPerPage) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, [maxIndex, itemsPerPage, reviewsData.length]);

  const getInitials = (name: string) => {
    if (!name) return 'DW';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <section className="w-full bg-slate-50/60 py-12 border-t border-slate-100">
      <div className="page-container">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            What our customers say
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real customer feedback from our Google Business Profile
          </p>
        </div>

        {/* Top Google Header Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Google Logo */}
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#4285F4]">g</span>
                <span className="text-[#34A853]">l</span>
                <span className="text-[#EA4335]">e</span>
              </span>
              <span className="text-xl sm:text-2xl font-bold text-slate-800 ml-1">Reviews</span>
            </div>

            {/* Rating Stars */}
            <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
              <span className="text-lg font-black text-slate-900">{stats.rating}</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs text-slate-500 font-medium">({stats.totalReviews})</span>
            </div>
          </div>

          <a
            href={stats.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            <span>Review us on Google</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Slider Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            type="button"
            className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white border border-slate-300 hover:border-blue-600 rounded-full flex items-center justify-center text-slate-700 hover:text-blue-600 shadow-md transition cursor-pointer"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            type="button"
            className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white border border-slate-300 hover:border-blue-600 rounded-full flex items-center justify-center text-slate-700 hover:text-blue-600 shadow-md transition cursor-pointer"
            aria-label="Next review"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Cards Track */}
          <div className="overflow-hidden px-1 py-1">
            <div
              className="flex transition-transform duration-500 ease-out gap-4"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              }}
            >
              {reviewsData.map((rev) => (
                <div
                  key={rev.id}
                  className="flex-shrink-0 bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  style={{
                    width: `calc(${100 / itemsPerPage}% - ${(16 * (itemsPerPage - 1)) / itemsPerPage}px)`,
                    minHeight: '210px',
                  }}
                >
                  <div>
                    {/* Header: Avatar, Name, Time, Google Logo */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full ${rev.avatarBg || 'bg-blue-600'} text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0`}
                        >
                          {getInitials(rev.name)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {rev.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{rev.time}</span>
                        </div>
                      </div>

                      {/* Small Google icon */}
                      <div className="w-5 h-5 flex-shrink-0">
                        <svg viewBox="0 0 24 24" className="w-full h-full">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            fill="#EA4335"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Stars + Verified checkmark */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      {rev.verified !== false && (
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    {/* Review Text */}
                    <p className="text-xs text-slate-700 leading-relaxed font-normal line-clamp-4">
                      {rev.text}
                    </p>
                  </div>

                  {/* Bottom Store Location Tag */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>{rev.location || 'Borella Rd Store'}</span>
                    <span className="text-emerald-600 font-semibold">Google Review</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
