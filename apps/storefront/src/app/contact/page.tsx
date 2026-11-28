'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2, Navigation, Car, ShieldCheck, CreditCard } from 'lucide-react';

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
                  <span>Get Directions on Google Maps</span>
                </a>
              </div>
            </div>

            {/* In-Store Benefits Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                In-Store Shopping Experience
              </h4>
              <div className="space-y-2 text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Live sound testing for Sony, JBL &amp; Anker audio</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>EZVIZ &amp; Hikvision CCTV camera live demonstrations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>In-store Koko &amp; Payzy QR installment payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Customer parking available on Borella Road</span>
                </div>
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

        {/* Local SEO & Location Guide */}
        <div className="mt-12 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-xs space-y-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block mb-3">
              Visit DW Store Pannipitiya
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Electronics &amp; Gadgets Store Near Maharagama, Kottawa &amp; Pannipitiya
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
              Located conveniently on Borella Road in Pannipitiya, DW Store is easily accessible from High-Level Road (A4) and just minutes away from Pannipitiya Railway Station. We proudly serve tech enthusiasts, home owners, and professionals from Pannipitiya, Maharagama, Kottawa, Homagama, Thalawathugoda, Athurugiriya, Nugegoda, and the entire Colombo district.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-blue-600" /> From Maharagama &amp; Nugegoda
              </h4>
              <p className="text-slate-600">
                Drive along High-Level Road towards Pannipitiya flyover, turn onto Borella Road. Reach our store in under 7 minutes.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-emerald-600" /> From Kottawa &amp; Homagama
              </h4>
              <p className="text-slate-600">
                Accessible via High-Level Road or Kottawa Expressway interchange. Just 5 minutes driving distance with customer parking.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" /> From Thalawathugoda &amp; Battaramulla
              </h4>
              <p className="text-slate-600">
                Take the Pannipitiya-Borella Road directly. A quick 10-minute drive avoiding heavy Colombo traffic.
              </p>
            </div>
          </div>

          {/* Interactive Google Map Embed */}
          <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative bg-slate-100">
            <iframe
              title="DW Store Pannipitiya Google Map"
              src="https://maps.google.com/maps?q=DWStore+No.55/1/2+Borella+Rd+Pannipitiya&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
