'use client';

import React, { useState, useMemo } from 'react';
import ProductCard, { ProductData } from './ProductCard';
import LightboxModal from './LightboxModal';
import { useLanguage } from '@/context/LanguageContext';
import { Search } from 'lucide-react';

interface ProductCatalogProps {
  initialProducts: ProductData[];
}

export default function ProductCatalog({ initialProducts }: ProductCatalogProps) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLightboxProduct, setActiveLightboxProduct] = useState<ProductData | null>(null);

  const categories = [
    { key: 'All', label: t.filterAll },
    { key: 'පිළිම සහ ප්‍රතිමා', label: t.filterStatues },
    { key: 'බිත්ති සැරසිලි', label: t.filterWall },
    { key: 'සිහිවටන (Souvenirs)', label: t.filterSouvenirs },
  ];

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.wood.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [initialProducts, selectedCategory, searchQuery]);

  return (
    <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      {/* Title & Subtitle */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <h2 className="text-3xl sm:text-4xl font-bold brand-font text-wood-900">
          {t.catTitle}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          {t.catSubtitle}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
        
        {/* Category Pills */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-2.5">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm ${
                  isActive
                    ? 'bg-wood-800 text-white shadow-md'
                    : 'bg-amber-100 hover:bg-amber-200 text-wood-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="සොයන්න (Search)..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-full border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          />
        </div>

      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-amber-50/50 rounded-2xl border border-amber-100 p-8">
          <p className="text-gray-500 text-base font-medium">{t.emptyMsg}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onZoom={setActiveLightboxProduct}
            />
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightboxProduct && (
        <LightboxModal
          product={activeLightboxProduct}
          onClose={() => setActiveLightboxProduct(null)}
        />
      )}
    </section>
  );
}
