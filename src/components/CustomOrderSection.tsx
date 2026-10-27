'use client';

import React, { useState } from 'react';
import { MessageCircle, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function CustomOrderSection() {
  const { t } = useLanguage();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94700000000';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wood, setWood] = useState('තේක්ක දැව (Teak Wood)');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      // 1. Submit lead to database via secure API
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, wood, description }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      // 2. Open WhatsApp with prefilled message
      const msg = `ආයුබෝවන් Ceylon Wood Creations! මම ${name} (${phone}). මට ${wood} වලින් විශේෂ කැටයමක් හදාගන්න අවශ්‍යයි.\n\nවිස්තර:\n${description}`;
      const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      setStatusMessage({
        type: 'success',
        text: 'ඔබගේ පණිවිඩය සාර්ථකව යොමු විය! අප ඔබ හා WhatsApp ඔස්සේ සම්බන්ධ වන්නෙමු.',
      });

      // Clear form
      setName('');
      setPhone('');
      setDescription('');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'දෝෂයක් සිදුවිය. කරුණාකර නැවත උත්සාහ කරන්න.';
      setStatusMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="custom-order" className="bg-amber-100/60 py-20 px-4 border-t border-amber-200">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-amber-100 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-amber-700 font-bold text-xs uppercase tracking-widest bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            Custom Design Request
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold brand-font text-wood-900">
            {t.customTitle}
          </h3>
          <p className="text-sm text-gray-600 max-w-lg mx-auto">
            {t.customSubtitle}
          </p>
        </div>

        {/* Feedback Message */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl flex items-center space-x-2 text-sm ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
              {t.custNamePh}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="උදා: කසුන් පෙරේරා"
              className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-wood-50/30 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
              {t.custPhonePh}
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="උදා: 0771234567"
              className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-wood-50/30 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
              {t.custWoodLabel}
            </label>
            <select
              value={wood}
              onChange={(e) => setWood(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-wood-50/30 text-sm"
            >
              <option value="තේක්ක දැව (Teak Wood)">තේක්ක දැව (Teak Wood)</option>
              <option value="මහෝගනී දැව (Mahogany Wood)">මහෝගනී දැව (Mahogany Wood)</option>
              <option value="කළුවර දැව (Ebony Style)">කළුවර දැව (Ebony Style)</option>
              <option value="නැදුන් දැව (Nedun Wood)">නැදුන් දැව (Nedun Wood)</option>
              <option value="වෙනත් දැව වර්ගයක් (Other Wood)">වෙනත් දැව වර්ගයක් (Other Wood)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
              {t.custDescPh}
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="කැටයමේ ප්‍රමාණය (උස, පළල), සුවිශේෂී මෝස්තර හෝ වෙනත් කරුණු මෙහි සඳහන් කරන්න..."
              className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-wood-50/30 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="md:col-span-2 bg-wood-800 hover:bg-wood-900 text-white font-bold py-3.5 px-6 rounded-xl transition duration-200 shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>යොමු වෙමින් පවතී...</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5 fill-current text-emerald-400" />
                <span>{t.btnCustomSubmit}</span>
              </>
            )}
          </button>
        </form>

      </div>
    </section>
  );
}
