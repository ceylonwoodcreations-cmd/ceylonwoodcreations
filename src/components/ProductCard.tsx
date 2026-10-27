'use client';

import React from 'react';
import Image from 'next/image';
import { Trees, ZoomIn, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { categoryEnMap } from '@/lib/translations';

export interface ProductData {
  id: number;
  title: string;
  category: string;
  wood: string;
  price: number;
  image: string;
  description?: string | null;
}

interface ProductCardProps {
  product: ProductData;
  onZoom: (product: ProductData) => void;
}

export default function ProductCard({ product, onZoom }: ProductCardProps) {
  const { t, language } = useLanguage();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94700000000';

  const displayCategory = language === 'en' 
    ? (categoryEnMap[product.category] || product.category) 
    : product.category;

  const waMessage = language === 'en'
    ? `Hello Ceylon Wood Creations, I would like to order "${product.title}" (LKR ${product.price.toLocaleString()}). Could you please share more details?`
    : `ආයුබෝවන් Ceylon Wood Creations, මම "${product.title}" (රු. ${product.price.toLocaleString()}) ඇණවුම් කිරීමට කැමැත්තෙමි. වැඩි විස්තර ලබා දෙන්න පුළුවන්ද?`;

  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-amber-100 flex flex-col group">
      
      {/* Image Container with Zoom Trigger */}
      <div 
        onClick={() => onZoom(product)}
        className="relative h-64 w-full bg-wood-100 cursor-pointer overflow-hidden"
      >
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Category Pill */}
        <span className="absolute top-3 left-3 bg-wood-900/80 backdrop-blur-md text-amber-300 text-xs px-3 py-1 rounded-full font-medium shadow-md">
          {displayCategory}
        </span>

        {/* Hover Zoom Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white/95 text-wood-900 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center space-x-1.5 transform translate-y-2 group-hover:translate-y-0 transition duration-300">
            <ZoomIn className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.zoomLabel}</span>
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
            <Trees className="w-3.5 h-3.5" />
            <span>{product.wood}</span>
          </div>
          <h3 className="text-lg font-bold text-wood-900 group-hover:text-amber-700 transition">
            {product.title}
          </h3>
          {product.description && (
            <p className="text-xs text-gray-500 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-medium">
              {t.priceLabel}
            </span>
            <span className="text-xl font-bold text-amber-800">
              {t.currency} {product.price.toLocaleString()}
            </span>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm hover:shadow-md flex items-center space-x-1.5"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>{t.orderBtn}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
