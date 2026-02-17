'use client';

import { useTheme } from '@/providers/ThemeProvider';
import Link from 'next/link';
import { ArrowRight, Shield, Eye, Database, Lock, UserCheck, Mail } from 'lucide-react';

export default function PrivacyPage() {
  const { currentTheme, storeName } = useTheme();

  const sections = [
    {
      icon: <Database size={20} />,
      title: 'المعلومات التي نجمعها',
      content: 'نجمع المعلومات التالية عند استخدامك للمنصة: الاسم، البريد الإلكتروني، رقم الهاتف (اختياري)، معلومات الدفع اللازمة لإتمام المعاملات، وبيانات الاستخدام مثل الصفحات التي تزورها ووقت الزيارة.',
    },
    {
      icon: <Eye size={20} />,
      title: 'كيف نستخدم معلوماتك',
      content: 'نستخدم بياناتك لمعالجة الطلبات وإتمام المعاملات، تحسين تجربة المستخدم وتخصيص المحتوى، إرسال إشعارات مهمة حول حسابك وطلباتك، والتواصل معك بخصوص الدعم الفني إذا لزم الأمر.',
    },
    {
      icon: <Shield size={20} />,
      title: 'حماية البيانات',
      content: 'نلتزم بحماية بياناتك الشخصية باستخدام تقنيات تشفير متقدمة وبروتوكولات أمان صارمة. لا نشارك بياناتك مع أطراف ثالثة إلا في حالات الضرورة القانونية أو بموافقتك الصريحة.',
    },
    {
      icon: <Lock size={20} />,
      title: 'ملفات تعريف الارتباط (Cookies)',
      content: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك على الموقع، تذكر تفضيلاتك، وتحليل حركة المرور. يمكنك التحكم بإعدادات ملفات تعريف الارتباط من خلال متصفحك.',
    },
    {
      icon: <UserCheck size={20} />,
      title: 'حقوقك',
      content: 'يحق لك الوصول إلى بياناتك الشخصية وتعديلها أو حذفها. يمكنك أيضاً طلب نسخة من بياناتك أو الاعتراض على معالجتها في أي وقت عبر التواصل معنا.',
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      {/* Back */}
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', marginBottom: 16 }}>
        <ArrowRight size={16} /> العودة للرئيسية
      </Link>

      {/* Banner */}
      <div style={{ borderRadius: 20, background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`, padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
        <Shield size={32} color="#fff" style={{ marginBottom: 8 }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>سياسة الخصوصية</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>آخر تحديث: فبراير 2026</p>
      </div>

      {/* Intro */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', border: '1px solid #f1f5f9', marginBottom: 16 }}>
        <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.8 }}>
          نحن في {storeName} نلتزم بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات التي تقدمها لنا عند استخدام خدماتنا.
        </p>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sections.map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${currentTheme.primary}15`, color: currentTheme.primary, display: 'grid', placeItems: 'center' }}>{s.icon}</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0b1020' }}>{s.title}</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.8 }}>{s.content}</p>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', border: '1px solid #f1f5f9', marginTop: 16, textAlign: 'center' }}>
        <Mail size={20} color={currentTheme.primary} style={{ margin: '0 auto 8px' }} />
        <p style={{ fontSize: '0.82rem', color: '#64748b' }}>لأي استفسارات حول سياسة الخصوصية، تواصل معنا عبر صفحة الدعم.</p>
        <Link href="/support" style={{ color: currentTheme.primary, fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>مركز الدعم ←</Link>
      </div>
    </div>
  );
}
