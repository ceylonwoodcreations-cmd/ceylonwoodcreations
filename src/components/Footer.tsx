'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, MapPin, Heart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-wood-950 text-amber-100 py-14 border-t-2 border-wood-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-lg flex-shrink-0 bg-wood-900 ring-1 ring-amber-500/30">
              <Image
                src="/logo.jpg"
                alt="Ceylon Wood Creations"
                width={56}
                height={56}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <span className="text-xl font-bold brand-font text-amber-300 block">
                Ceylon Wood Creations
              </span>
              <span className="text-[10px] uppercase tracking-widest text-amber-200/80 block">
                Sri Lankan Craftsmanship
              </span>
            </div>
          </div>
          <p className="text-xs text-amber-100/80 leading-relaxed">
            දේශීය අභිමානය සහ පාරම්පරික දැව කැටයම් ශිල්පය රැකගනිමින්, උසස්ම තත්ත්වයේ දැව නිර්මාණ ඔබේ නිවසට හෝ කාර්යාලයට සපයන්නෙමු.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
            පිටු (Quick Navigation)
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="#hero" className="text-amber-100/80 hover:text-amber-300 transition">
                {t.navHome}
              </Link>
            </li>
            <li>
              <Link href="#catalog" className="text-amber-100/80 hover:text-amber-300 transition">
                {t.navCatalog}
              </Link>
            </li>
            <li>
              <Link href="#custom-order" className="text-amber-100/80 hover:text-amber-300 transition">
                {t.navCustom}
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="text-amber-100/80 hover:text-amber-300 transition">
                {t.navAdmin} (Staff Login)
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
            සම්බන්ධ වන්න (Contact)
          </h4>
          <div className="space-y-2.5 text-xs text-amber-100/90">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>+94 70 000 0000 (WhatsApp / Voice)</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{t.footerAddress}</span>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-wood-800 flex flex-col sm:flex-row items-center justify-between text-xs text-amber-200/70 gap-2">
        <p>{t.footerCopyright}</p>
        <p className="flex items-center space-x-1">
          <span>Handcrafted with</span>
          <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>in Sri Lanka</span>
        </p>
      </div>
    </footer>
  );
}
