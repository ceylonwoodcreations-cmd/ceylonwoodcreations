'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, Trees } from 'lucide-react';
import { ProductData } from './ProductCard';
import { useLanguage } from '@/context/LanguageContext';

interface LightboxModalProps {
  product: ProductData;
  onClose: () => void;
}

export default function LightboxModal({ product, onClose }: LightboxModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-wood-800 flex flex-col"
      >
        {/* Large Image View */}
        <div className="relative w-full h-[60vh] max-h-[500px] bg-wood-950">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-contain"
            sizes="(max-width: 1200px) 100vw, 800px"
            priority
          />
        </div>

        {/* Modal Info Footer */}
        <div className="p-5 bg-wood-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h4 className="font-bold text-lg text-amber-300 brand-font">
              {product.title}
            </h4>
            <div className="flex items-center space-x-3 text-xs text-amber-100/70 mt-1">
              <span className="flex items-center space-x-1">
                <Trees className="w-3.5 h-3.5 text-amber-400" />
                <span>{product.wood}</span>
              </span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">
                {t.currency} {product.price.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition self-end sm:self-auto flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>{t.closeModal}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
