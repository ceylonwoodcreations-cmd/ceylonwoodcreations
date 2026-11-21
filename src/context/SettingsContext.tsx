'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);

  const loadSettingsFromStorage = () => {
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
      console.error('Failed to load ceylon_settings from localStorage:', e);
    }
  };

  useEffect(() => {
    loadSettingsFromStorage();

    // Listen to storage events across tabs or components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ceylon_settings') {
        loadSettingsFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => {
      const updated: BusinessSettings = {
        ...prev,
        ...newSettings,
        whatsappNumber: newSettings.whatsappNumber 
          ? formatWhatsAppNumber(newSettings.whatsappNumber) 
          : prev.whatsappNumber,
      };

      try {
        localStorage.setItem('ceylon_settings', JSON.stringify(updated));
        // Dispatch custom event for same-window updates
        window.dispatchEvent(new Event('ceylon_settings_updated'));
      } catch (e) {
        console.error('Failed to save ceylon_settings to localStorage:', e);
      }
      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem('ceylon_settings');
      window.dispatchEvent(new Event('ceylon_settings_updated'));
    } catch (e) {
      console.error('Failed to reset ceylon_settings in localStorage:', e);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
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
