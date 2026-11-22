'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, doc, onSnapshot, setDoc } from '@/lib/firebase';

export interface BusinessSettings {
  whatsappNumber: string; // Digits only formatted for wa.me, e.g. "94700000000"
  displayPhone: string;   // Display text, e.g. "+94 70 000 0000 (WhatsApp / Voice)"
  addressSi: string;      // Address in Sinhala
  addressEn: string;      // Address in English
}

export function formatWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '94700000000';
  if (digits.startsWith('94')) return digits;
  if (digits.startsWith('0')) return `94${digits.slice(1)}`;
  if (digits.length === 9) return `94${digits}`;
  return digits;
}

export const defaultSettings: BusinessSettings = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94700000000',
  displayPhone: '+94 70 000 0000 (WhatsApp / Voice)',
  addressSi: 'නුවර පාර, මොරටුව / ගාල්ල, ශ්‍රී ලංකාව',
  addressEn: 'Kandy Road, Moratuwa / Galle, Sri Lanka',
};

interface SettingsContextType {
  settings: BusinessSettings;
  updateSettings: (newSettings: Partial<BusinessSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Initial local load
    try {
      const saved = localStorage.getItem('ceylon_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({
          ...prev,
          ...parsed,
          whatsappNumber: formatWhatsAppNumber(parsed.whatsappNumber || prev.whatsappNumber),
        }));
      }
    } catch (e) {
      console.error('Error loading local settings:', e);
    }

    // 2. Real-time Firebase Firestore listener
    try {
      const unsub = onSnapshot(
        doc(db, 'settings', 'general'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<BusinessSettings>;
            const merged: BusinessSettings = {
              whatsappNumber: formatWhatsAppNumber(data.whatsappNumber || defaultSettings.whatsappNumber),
              displayPhone: data.displayPhone || defaultSettings.displayPhone,
              addressSi: data.addressSi || defaultSettings.addressSi,
              addressEn: data.addressEn || defaultSettings.addressEn,
            };
            setSettings(merged);
            try {
              localStorage.setItem('ceylon_settings', JSON.stringify(merged));
            } catch (_) {}
          } else {
            // First time setup in Firestore
            setDoc(doc(db, 'settings', 'general'), defaultSettings).catch((err) =>
              console.warn('Could not initialize firestore settings doc:', err)
            );
          }
          setIsLoaded(true);
        },
        (error) => {
          console.warn('Firestore settings listener error (falling back to local):', error);
          setIsLoaded(true);
        }
      );

      return () => unsub();
    } catch (err) {
      console.warn('Firebase init error for settings:', err);
      setIsLoaded(true);
    }
  }, []);

  const updateSettings = async (newSettings: Partial<BusinessSettings>) => {
    const updated: BusinessSettings = {
      ...settings,
      ...newSettings,
      whatsappNumber: newSettings.whatsappNumber
        ? formatWhatsAppNumber(newSettings.whatsappNumber)
        : settings.whatsappNumber,
    };

    setSettings(updated);

    try {
      localStorage.setItem('ceylon_settings', JSON.stringify(updated));
      window.dispatchEvent(new Event('ceylon_settings_updated'));
    } catch (_) {}

    try {
      await setDoc(doc(db, 'settings', 'general'), updated, { merge: true });
    } catch (err) {
      console.error('Failed to sync settings to Firestore:', err);
    }
  };

  const resetSettings = async () => {
    setSettings(defaultSettings);
    try {
      localStorage.setItem('ceylon_settings', JSON.stringify(defaultSettings));
      window.dispatchEvent(new Event('ceylon_settings_updated'));
    } catch (_) {}

    try {
      await setDoc(doc(db, 'settings', 'general'), defaultSettings);
    } catch (err) {
      console.error('Failed to reset settings in Firestore:', err);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, isLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
