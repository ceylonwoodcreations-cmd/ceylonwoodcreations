'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Globe, Shield, Menu, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const { t, language, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-wood-900 text-amber-50 shadow-xl sticky top-0 z-40 border-b border-wood-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center space-x-3.5 group">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400/70 shadow-lg shadow-amber-950/50 group-hover:border-amber-300 group-hover:scale-105 transition-all duration-300 flex-shrink-0 bg-wood-950 ring-1 ring-amber-500/30">
            <Image
              src="/logo.jpg"
              alt="Ceylon Wood Creations"
              width={56}
              height={56}
              className="w-full h-full object-cover rounded-full"
              priority
            />
          </div>
          <div>
            <span className="text-2xl font-bold brand-font tracking-wider text-amber-400 block leading-tight">
              {t.brandName}
            </span>
            <span className="text-[11px] uppercase tracking-widest text-amber-200/80 block font-sans">
              {t.brandSubtitle}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="#hero" className="hover:text-amber-400 transition">
            {t.navHome}
          </Link>
          <Link href="#catalog" className="hover:text-amber-400 transition">
            {t.navCatalog}
          </Link>
          <Link href="#custom-order" className="hover:text-amber-400 transition">
            {t.navCustom}
          </Link>
        </div>

        {/* Actions (Language Toggle + Admin Portal Button) */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={toggleLanguage}
            className="bg-wood-800 hover:bg-wood-700 border border-amber-500/40 text-amber-200 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.langBtn}</span>
          </button>

          <Link
            href="/admin/login"
            className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-2 shadow-md hover:shadow-amber-600/20"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t.navAdmin}</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={toggleLanguage}
            className="bg-wood-800 border border-amber-500/40 text-amber-200 px-2.5 py-1.5 rounded-lg text-xs font-bold"
          >
            {t.langBtn}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-amber-100 hover:text-amber-400 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-wood-900 border-t border-wood-800 px-4 pt-3 pb-5 space-y-3">
          <Link
            href="#hero"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-amber-100 hover:text-amber-400 py-2 text-base font-medium"
          >
            {t.navHome}
          </Link>
          <Link
            href="#catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-amber-100 hover:text-amber-400 py-2 text-base font-medium"
          >
            {t.navCatalog}
          </Link>
          <Link
            href="#custom-order"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-amber-100 hover:text-amber-400 py-2 text-base font-medium"
          >
            {t.navCustom}
          </Link>
          <div className="pt-2 border-t border-wood-800">
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold w-full justify-center"
            >
              <Shield className="w-4 h-4" />
              <span>{t.navAdmin}</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
