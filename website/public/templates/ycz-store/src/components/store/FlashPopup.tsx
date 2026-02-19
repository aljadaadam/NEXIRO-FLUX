'use client';

import { useState, useEffect } from 'react';
import { storeApi } from '@/lib/api';

export default function FlashPopup() {
  const [show, setShow] = useState(false);
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    // فحص إذا المستخدم شافها قبل
    const loadFlash = async () => {
      try {
        const res = await storeApi.getFlashPopup();
        if (!res || !res.flash_enabled) return;

        // تحقق من آخر وقت عرض
        const lastSeen = localStorage.getItem('flash_seen_at');
        const now = Date.now();
        // نعرض مرة كل 24 ساعة
        if (lastSeen && now - parseInt(lastSeen) < 24 * 60 * 60 * 1000) return;

        setData(res);
        setTimeout(() => setShow(true), 800); // تأخير خفيف بعد تحميل الصفحة
      } catch { /* silent */ }
    };
    loadFlash();
  }, []);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('flash_seen_at', Date.now().toString());
  };

  const handleBtnClick = () => {
    const url = data?.flash_btn_url as string;
    if (url) {
      window.open(url, '_blank');
    }
    handleClose();
  };

  if (!show || !data) return null;

  const bgColor = (data.flash_bg_color as string) || '#7c5cff';
  const textColor = (data.flash_text_color as string) || '#ffffff';
  const title = (data.flash_title as string) || '';
  const body = (data.flash_body as string) || '';
  const image = (data.flash_image as string) || '';
  const btnText = (data.flash_btn_text as string) || 'حسناً';

  return (
    <>
      <style>{`
        .nxr-flash-overlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);backdrop-filter:blur(5px);display:grid;place-items:center;padding:16px;animation:nxrFlashFade .3s ease-out;font-family:Tajawal,sans-serif}
        @keyframes nxrFlashFade{from{opacity:0}to{opacity:1}}
        .nxr-flash-card{width:100%;max-width:420px;border-radius:22px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.35);animation:nxrFlashIn .4s cubic-bezier(.16,1,.3,1);position:relative}
        @keyframes nxrFlashIn{from{opacity:0;transform:translateY(40px) scale(.9)}to{opacity:1;transform:translateY(0) scale(1)}}
        .nxr-flash-close{position:absolute;top:12px;right:12px;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,.2);backdrop-filter:blur(4px);border:none;color:#fff;cursor:pointer;display:grid;place-items:center;transition:background .15s;z-index:2;-webkit-tap-highlight-color:transparent}
        .nxr-flash-close:hover,.nxr-flash-close:active{background:rgba(0,0,0,.4)}
        .nxr-flash-img{width:100%;max-height:220px;object-fit:cover;display:block}
        .nxr-flash-body{padding:28px 24px;text-align:center}
        .nxr-flash-title{font-size:1.3rem;font-weight:800;margin:0 0 10px;line-height:1.4}
        .nxr-flash-text{font-size:.9rem;line-height:1.75;margin:0 0 22px;opacity:.9;white-space:pre-wrap}
        .nxr-flash-btn{padding:12px 40px;border-radius:14px;font-size:.92rem;font-weight:700;cursor:pointer;font-family:Tajawal,sans-serif;transition:transform .15s,box-shadow .15s;border:none;-webkit-tap-highlight-color:transparent}
        .nxr-flash-btn:hover{transform:scale(1.03)}
        .nxr-flash-btn:active{transform:scale(.98)}
        @media(max-width:480px){.nxr-flash-card{max-width:calc(100vw - 32px);border-radius:18px}.nxr-flash-body{padding:22px 18px}.nxr-flash-title{font-size:1.15rem}.nxr-flash-text{font-size:.84rem}}
      `}</style>

      <div className="nxr-flash-overlay" onClick={handleClose} dir="rtl">
        <div className="nxr-flash-card" onClick={e => e.stopPropagation()}>
          {/* Close button */}
          <button className="nxr-flash-close" onClick={handleClose} aria-label="إغلاق">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Image */}
          {image && <img className="nxr-flash-img" src={image} alt="" />}

          {/* Content */}
          <div className="nxr-flash-body" style={{ background: bgColor, color: textColor }}>
            {title && <h3 className="nxr-flash-title" style={{ color: textColor }}>{title}</h3>}
            {body && <p className="nxr-flash-text" style={{ color: textColor }}>{body}</p>}
            <button className="nxr-flash-btn" onClick={handleBtnClick}
              style={{
                background: `${textColor}20`,
                color: textColor,
                border: `2px solid ${textColor}35`,
                boxShadow: `0 4px 16px ${textColor}15`,
              }}>
              {btnText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
