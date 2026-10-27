'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowDown, MessageCircle, Award, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94700000000';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Ceylon Wood Creations! I would like to inquire about your handcrafted woodwork.')}`;

  return (
    <header id="hero" className="relative bg-wood-800 text-white py-20 md:py-28 px-4 text-center overflow-hidden border-b-4 border-wood-700 shadow-xl">
      {/* Authentic Wood Carving Craftsmanship Workshop Texture */}
      <div 
        className="absolute inset-0 opacity-30 bg-cover bg-center transform scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=1600&q=80')`,
        }}
      />
      {/* Warm Ambient Wood Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-wood-900/60 via-wood-800/40 to-wood-900/80" />

      {/* Hero Content */}
      <div className="relative max-w-4xl mx-auto z-10 space-y-6">
        
        {/* Quality Badge */}
        <div className="inline-flex items-center space-x-2 bg-amber-600/20 border border-amber-400/30 text-amber-300 text-xs px-4 py-1.5 rounded-full uppercase tracking-widest font-semibold backdrop-blur-sm shadow-inner">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.heroBadge}</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold brand-font tracking-wide text-amber-300 drop-shadow-sm leading-tight">
          {t.heroTitle}
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg md:text-xl text-amber-100/90 max-w-2xl mx-auto font-light leading-relaxed">
          {t.heroDesc}
        </p>

        {/* CTA Buttons */}
        <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
          <Link
            href="#catalog"
            className="inline-flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-amber-900/30 hover:shadow-amber-600/40 transition duration-200 transform hover:-translate-y-0.5"
          >
            <span>{t.btnExplore}</span>
            <ArrowDown className="w-4 h-4 ml-1" />
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-emerald-950/40 hover:shadow-emerald-600/30 transition duration-200 transform hover:-translate-y-0.5"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>{t.btnWhatsapp}</span>
          </a>
        </div>

        {/* Feature Highlights */}
        <div className="pt-10 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-amber-200/80 text-xs sm:text-sm">
          <div className="flex items-center justify-center space-x-2 bg-wood-800/40 border border-wood-700/50 p-2.5 rounded-lg">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>100% ස්වභාවික දැව</span>
          </div>
          <div className="flex items-center justify-center space-x-2 bg-wood-800/40 border border-wood-700/50 p-2.5 rounded-lg">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>ප්‍රවීණ කැටයම් ශිල්පීන්</span>
          </div>
          <div className="col-span-2 md:col-span-1 flex items-center justify-center space-x-2 bg-wood-800/40 border border-wood-700/50 p-2.5 rounded-lg">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>දිවයින පුරා බෙදාහැරීම</span>
          </div>
        </div>

      </div>
    </header>
  );
}
