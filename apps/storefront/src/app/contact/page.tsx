'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-12">
        <div className="page-container text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 block mb-2">
            Customer Support &amp; Store Location
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Contact DWstore.lk
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Have questions about a product, warranty, or delivery? Reach out to our friendly team or visit our flagship store in Pannipitiya.
          </p>
        </div>
      </div>

      <div className="page-container py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Store Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
              <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
                Store Information
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-bold mb-0.5">Physical Store Address</strong>
                    <span className="text-slate-600">No.55/1/2, Borella road, Pannipitiya</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-bold mb-0.5">Phone &amp; WhatsApp</strong>
                    <a href="tel:+94756693358" className="text-blue-600 font-semibold block hover:underline">
                      +94 75 669 3358
                    </a>
                    <a href="https://wa.me/94756693358" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-semibold block hover:underline mt-0.5">
                      Chat on WhatsApp (Instant Reply)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-bold mb-0.5">Email Support</strong>
                    <span className="text-slate-600">support@dwstore.lk</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-bold mb-0.5">Opening Hours</strong>
                    <span className="text-slate-600 block">Monday – Saturday: 9:00 AM – 7:30 PM</span>
                    <span className="text-slate-600 block">Sunday: 10:00 AM – 4:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://maps.google.com/?q=DWStore+No.55/1/2+Borella+Rd+Pannipitiya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm text-center"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-black text-slate-900 mb-2">
                Send us a Message
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Fill in the form below and our customer support team will reply within 2 hours.
              </p>

              {submitted ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold">Message Sent Successfully!</h4>
                  <p className="text-xs text-emerald-700">
                    Thank you for reaching out. We will respond to {formData.email || 'your email'} shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="077 123 4567"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">Message / Inquiries *</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Ask about product availability, bulk orders, or warranty checking..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/30"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
