'use client';

import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';

export default function StoreVideoBanner() {
  return (
    <section className="w-full bg-white py-8">
      <div className="page-container">
        {/* Video Container (No player options, no progress bar, auto loop play) */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-slate-900 group">
          <video
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            className="w-full h-auto max-h-[520px] object-cover block"
          >
            <source src="/Shop-Video-Edited.mp4" type="video/mp4" />
            <source src="/videos/Shop-Video-Edited.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Subtle bottom info bar */}
          <div className="bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-6 sm:p-8 absolute inset-x-0 bottom-0 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4 pointer-events-none">
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
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-sm"
              >
                Get Directions
              </a>
              <a
                href="https://wa.me/94756693358"
                target="_blank"
                rel="noopener noreferrer"
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
