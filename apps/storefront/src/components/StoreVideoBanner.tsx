'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Play, Volume2, VolumeX } from 'lucide-react';

export default function StoreVideoBanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force muted and playsinline directly on DOM node to overcome React's muted attribute bug
    video.defaultMuted = true;
    video.muted = true;
    (video as any).playsInline = true;

    const attemptPlay = () => {
      if (!video) return;
      video.defaultMuted = true;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Browser policy deferred autoplay (e.g. strict policy, Low Power Mode)
            setIsPlaying(false);
          });
      }
    };

    attemptPlay();

    // 1. IntersectionObserver: Play when scrolled into viewport (crucial for footer-adjacent videos)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && video.paused) {
            attemptPlay();
          }
        });
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // 2. User Gesture Listeners: Play as soon as user touches, scrolls, or clicks anywhere on the page
    const handleUserGesture = () => {
      if (video.paused) {
        attemptPlay();
      }
    };

    window.addEventListener('scroll', handleUserGesture, { once: true, passive: true });
    window.addEventListener('touchstart', handleUserGesture, { once: true, passive: true });
    window.addEventListener('click', handleUserGesture, { once: true, passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
      window.removeEventListener('click', handleUserGesture);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <section className="w-full bg-white py-8">
      <div className="page-container">
        {/* Video Container (No native player options, auto loop play with fallback controls) */}
        <div
          ref={containerRef}
          onClick={togglePlay}
          className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-slate-900 group cursor-pointer"
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            controls={false}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-auto max-h-[520px] object-cover block"
          >
            <source src="/Shop-Video-Edited.mp4" type="video/mp4" />
            <source src="/videos/Shop-Video-Edited.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Sound Toggle (Top Right) */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-950/60 hover:bg-slate-950/80 backdrop-blur-md text-white transition border border-white/20 shadow-lg"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fallback Play Button Overlay if Autoplay was blocked by browser / low power mode */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-950/20 backdrop-blur-[2px] transition pointer-events-none">
              <button
                type="button"
                onClick={togglePlay}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600/95 hover:bg-blue-600 text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition transform hover:scale-110 active:scale-95 pointer-events-auto"
                aria-label="Play video"
              >
                <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-current translate-x-0.5" />
              </button>
            </div>
          )}

          {/* Subtle bottom info bar */}
          <div className="bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-6 sm:p-8 absolute inset-x-0 bottom-0 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4 pointer-events-none z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                <span>Physical Store Location</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                DWStore — Flagship Store
              </h3>
              <p className="text-xs text-slate-300 max-w-lg mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>No.55/1/2 Borella Rd, Pannipitiya 10230, Sri Lanka</span>
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs pointer-events-auto">
              <a
                href="https://maps.google.com/?q=DWStore+No.55/1/2+Borella+Rd+Pannipitiya"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-sm"
              >
                Get Directions
              </a>
              <a
                href="https://wa.me/94756693358"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-bold transition border border-white/30"
              >
                Contact Store
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
