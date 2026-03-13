'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { storeApi } from '@/lib/api';

const quickLinks = [
  { label: 'الرئيسية', href: '/' },
  { label: 'التصنيفات', href: '/services' },
  { label: 'ستارلينك', href: '/services?cat=starlink' },
  { label: 'beIN Sports', href: '/services?cat=bein' },
  { label: 'حسابي', href: '/profile' },
  { label: 'عروض خاصة', href: '/services?cat=offers' },
  { label: 'من نحن', href: '/about' },
  { label: 'آراء العملاء', href: '/reviews' },
];

interface StoreSettings {
  whatsapp_number?: string;
  telegram_link?: string;
  facebook_link?: string;
  instagram_link?: string;
  support_email?: string;
}

export default function Footer() {
  const [settings, setSettings] = useState<StoreSettings>({});

  useEffect(() => {
    storeApi.getStoreSettings()
      .then((res: Record<string, unknown>) => setSettings((res?.customization || {}) as StoreSettings))
      .catch(() => {});
  }, []);

  const whatsappUrl = settings.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`
    : '';

  const socialLinks = [
    settings.facebook_link ? { icon: '📘', href: settings.facebook_link, label: 'Facebook' } : null,
    settings.telegram_link ? { icon: '✈️', href: settings.telegram_link, label: 'Telegram' } : null,
    settings.instagram_link ? { icon: '📸', href: settings.instagram_link, label: 'Instagram' } : null,
  ].filter(Boolean) as { icon: string; href: string; label: string }[];
  return (
    <footer className="bg-navy-900/80 border-t border-navy-700/40 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              عن <span className="text-gold-gradient">Stellar Store</span>
            </h3>
            <p className="text-navy-400 text-sm leading-relaxed">
              Stellar Store هو متجر رقمي متخصص في توفير التفعيلات الأصلية، الاشتراكات، وحلول الشحن الإلكتروني لعملاء السودان والمنطقة بمستوى خدمة فائق.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-navy-400 text-sm hover:text-gold-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">تواصل معنا</h3>
            <div className="space-y-3 text-navy-400 text-sm">
              {settings.whatsapp_number && <p>واتساب: {settings.whatsapp_number}</p>}
              {settings.telegram_link && <p>تيليجرام: <a href={settings.telegram_link} target="_blank" rel="noopener noreferrer" className="hover:text-gold-500">{settings.telegram_link.replace('https://t.me/', '@')}</a></p>}
              {settings.support_email && <p>البريد: {settings.support_email}</p>}
              <p>الموقع: السودان</p>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">تابعنا</h3>
            <div className="flex gap-3">
              {socialLinks.length > 0 ? socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-navy-800 border border-navy-700/50 hover:border-gold-500/40 flex items-center justify-center text-lg transition-all hover:-translate-y-0.5"
                >
                  {social.icon}
                </a>
              )) : (
                <p className="text-navy-500 text-sm">لا توجد روابط بعد</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-navy-700/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <p className="text-navy-500 text-xs">
            © متجر ستيلار. جميع الحقوق محفوظة {new Date().getFullYear()}.
          </p>
          <p className="text-navy-600 text-xs hidden sm:block">
            تصميم فاخر لتجارب رقمية مميزة.
          </p>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 text-white flex items-center justify-center shadow-lg shadow-green-500/30 hover:-translate-y-1 transition-all"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.325 0-4.47-.745-6.221-2.01l-.435-.326-3.278 1.098 1.098-3.278-.326-.435A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
        </svg>
      </a>
      )}
    </footer>
  );
}
