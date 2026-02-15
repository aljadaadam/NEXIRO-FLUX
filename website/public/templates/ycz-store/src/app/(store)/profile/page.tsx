'use client';

import { useState } from 'react';
import { User, CreditCard, Shield, Edit, Eye, Wallet, ArrowLeft, Lock, Mail, Phone, CheckCircle, Copy, X } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { PAYMENT_METHODS } from '@/lib/mockData';

// ─── WalletChargeModal ───
function WalletChargeModal({ onClose }: { onClose: () => void }) {
  const { currentTheme, buttonRadius } = useTheme();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('binance');
  const radius = buttonRadius === 'sharp' ? '8px' : buttonRadius === 'pill' ? '50px' : '12px';

  const amounts = ['$5', '$10', '$25', '$50', '$100'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 20, padding: '2rem',
        width: '90%', maxWidth: 440, maxHeight: '85vh', overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1020' }}>
            {step === 1 && '💰 شحن المحفظة'}
            {step === 2 && '💳 تفاصيل الدفع'}
            {step === 3 && '🧾 إيصال الدفع'}
            {step === 4 && '✅ تم بنجاح!'}
          </h3>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8,
            border: 'none', background: '#f1f5f9',
            cursor: 'pointer', display: 'grid', placeItems: 'center',
          }}>
            <X size={16} color="#64748b" />
          </button>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: s <= step ? currentTheme.primary : '#e2e8f0',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {step === 1 && (
          <>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 14 }}>اختر المبلغ أو أدخل مبلغ مخصص:</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {amounts.map(a => (
                <button key={a} onClick={() => setAmount(a.replace('$', ''))} style={{
                  padding: '0.6rem 1.25rem', borderRadius: 10,
                  background: amount === a.replace('$', '') ? currentTheme.primary : '#f8fafc',
                  color: amount === a.replace('$', '') ? '#fff' : '#334155',
                  border: amount === a.replace('$', '') ? 'none' : '1px solid #e2e8f0',
                  fontSize: '0.88rem', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                }}>
                  {a}
                </button>
              ))}
            </div>
            <input
              value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="أو أدخل مبلغ مخصص ($)"
              type="number" min="1"
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                border: '1px solid #e2e8f0', fontSize: '0.85rem',
                fontFamily: 'Tajawal, sans-serif', outline: 'none',
                boxSizing: 'border-box', marginBottom: 20,
              }}
            />
            <button onClick={() => amount && setStep(2)} style={{
              width: '100%', padding: '0.8rem', borderRadius: radius,
              background: currentTheme.gradient, color: '#fff',
              border: 'none', fontSize: '0.88rem', fontWeight: 800,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              opacity: amount ? 1 : 0.5,
            }}>
              التالي
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 14 }}>اختر طريقة الدفع:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {PAYMENT_METHODS.map(pm => (
                <button key={pm.id} onClick={() => setMethod(pm.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '0.85rem 1rem', borderRadius: 12,
                  border: method === pm.id ? `2px solid ${currentTheme.primary}` : '1px solid #e2e8f0',
                  background: method === pm.id ? `${currentTheme.primary}08` : '#fff',
                  cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                  textAlign: 'right', width: '100%',
                }}>
                  <span style={{ fontSize: '1.25rem' }}>{pm.icon}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1020' }}>{pm.name}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep(1)} style={{
                flex: 1, padding: '0.75rem', borderRadius: radius,
                background: '#f1f5f9', color: '#64748b',
                border: 'none', fontSize: '0.82rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              }}>
                رجوع
              </button>
              <button onClick={() => setStep(3)} style={{
                flex: 2, padding: '0.75rem', borderRadius: radius,
                background: currentTheme.gradient, color: '#fff',
                border: 'none', fontSize: '0.82rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              }}>
                متابعة
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{
              background: '#f8fafc', borderRadius: 14, padding: '1.25rem', marginBottom: 20,
            }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1020', marginBottom: 12 }}>ملخص العملية</h4>
              {[
                { label: 'المبلغ', value: `$${amount}` },
                { label: 'طريقة الدفع', value: PAYMENT_METHODS.find(p => p.id === method)?.name },
                { label: 'رقم العملية', value: `#TXN-${Math.floor(Math.random() * 9000 + 1000)}` },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: i < 2 ? '1px solid #e2e8f0' : 'none',
                }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{row.label}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0b1020' }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep(2)} style={{
                flex: 1, padding: '0.75rem', borderRadius: radius,
                background: '#f1f5f9', color: '#64748b',
                border: 'none', fontSize: '0.82rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              }}>
                رجوع
              </button>
              <button onClick={() => setStep(4)} style={{
                flex: 2, padding: '0.75rem', borderRadius: radius,
                background: currentTheme.gradient, color: '#fff',
                border: 'none', fontSize: '0.82rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              }}>
                تأكيد الدفع
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#dcfce7', display: 'grid', placeItems: 'center',
              margin: '0 auto 16px',
            }}>
              <CheckCircle size={32} color="#22c55e" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1020', marginBottom: 8 }}>
              تم شحن المحفظة بنجاح!
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 20 }}>
              تمت إضافة <strong>${amount}</strong> إلى رصيدك
            </p>
            <button onClick={onClose} style={{
              padding: '0.7rem 2rem', borderRadius: radius,
              background: currentTheme.gradient, color: '#fff',
              border: 'none', fontSize: '0.85rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
            }}>
              تم
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── صفحة الملف الشخصي ───
export default function ProfilePage() {
  const { currentTheme, buttonRadius } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [profileView, setProfileView] = useState('menu');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const radius = buttonRadius === 'sharp' ? '8px' : buttonRadius === 'pill' ? '50px' : '12px';

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isLoggedIn) {
    return (
      <section style={{ maxWidth: 420, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: '2rem',
          border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: currentTheme.gradient,
              display: 'grid', placeItems: 'center',
              margin: '0 auto 14px',
            }}>
              <User size={28} color="#fff" />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0b1020', marginBottom: 4 }}>
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              {isLogin ? 'أدخل بياناتك للمتابعة' : 'أنشئ حسابك واستمتع بخدماتنا'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!isLogin && (
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="الاسم الكامل"
                style={{
                  padding: '0.75rem 1rem', borderRadius: 10,
                  border: '1px solid #e2e8f0', fontSize: '0.85rem',
                  fontFamily: 'Tajawal, sans-serif', outline: 'none',
                }}
              />
            )}
            <input value={email} onChange={e => setEmail(e.target.value)}
              type="email" placeholder="البريد الإلكتروني"
              style={{
                padding: '0.75rem 1rem', borderRadius: 10,
                border: '1px solid #e2e8f0', fontSize: '0.85rem',
                fontFamily: 'Tajawal, sans-serif', outline: 'none',
              }}
            />
            <input value={password} onChange={e => setPassword(e.target.value)}
              type="password" placeholder="كلمة المرور"
              style={{
                padding: '0.75rem 1rem', borderRadius: 10,
                border: '1px solid #e2e8f0', fontSize: '0.85rem',
                fontFamily: 'Tajawal, sans-serif', outline: 'none',
              }}
            />
            <button onClick={() => setIsLoggedIn(true)} style={{
              padding: '0.8rem', borderRadius: radius,
              background: currentTheme.gradient, color: '#fff',
              border: 'none', fontSize: '0.9rem', fontWeight: 800,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
            }}>
              {isLogin ? 'دخول' : 'إنشاء حساب'}
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.82rem', color: '#64748b' }}>
            {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
            <button onClick={() => setIsLogin(!isLogin)} style={{
              background: 'none', border: 'none',
              color: currentTheme.primary, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Tajawal, sans-serif', fontSize: '0.82rem',
            }}>
              {isLogin ? 'أنشئ حساب' : 'سجّل دخول'}
            </button>
          </p>
        </div>
      </section>
    );
  }

  const menuItems = [
    { id: 'personal', icon: User, label: 'المعلومات الشخصية', desc: 'الاسم والبريد والهاتف', color: '#7c5cff' },
    { id: 'wallet', icon: Wallet, label: 'المحفظة', desc: 'الرصيد والمعاملات', color: '#22c55e' },
    { id: 'security', icon: Shield, label: 'الأمان والتحقق', desc: 'كلمة المرور والتوثيق', color: '#f59e0b' },
  ];

  if (profileView === 'menu') {
    return (
      <section style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Profile Card */}
        <div style={{
          background: currentTheme.gradient, borderRadius: 20,
          padding: '2rem', textAlign: 'center', marginBottom: 20, color: '#fff',
        }}>
          <div style={{
            width: 70, height: 70, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center',
            margin: '0 auto 12px', border: '3px solid rgba(255,255,255,0.3)',
          }}>
            <User size={30} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 4 }}>أحمد محمد</h2>
          <p style={{ fontSize: '0.78rem', opacity: 0.85 }}>ahmed@email.com</p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '0.4rem 1rem', borderRadius: 50,
            background: 'rgba(255,255,255,0.15)',
            marginTop: 12, fontSize: '0.8rem', fontWeight: 700,
          }}>
            💰 الرصيد: $45.00
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setProfileView(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: '#fff', borderRadius: 14, padding: '1rem 1.25rem',
                border: '1px solid #f1f5f9', cursor: 'pointer', width: '100%',
                fontFamily: 'Tajawal, sans-serif', textAlign: 'right',
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: `${item.color}12`, display: 'grid', placeItems: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={20} color={item.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1020' }}>{item.label}</h4>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.desc}</p>
                </div>
                <ArrowLeft size={16} color="#94a3b8" />
              </button>
            );
          })}

          <button onClick={() => setIsLoggedIn(false)} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: '#fff', borderRadius: 14, padding: '1rem 1.25rem',
            border: '1px solid #fee2e2', cursor: 'pointer', width: '100%',
            fontFamily: 'Tajawal, sans-serif', textAlign: 'right',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: '#fee2e2', display: 'grid', placeItems: 'center',
              flexShrink: 0,
            }}>
              <Lock size={20} color="#dc2626" />
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#dc2626' }}>تسجيل الخروج</span>
          </button>
        </div>
      </section>
    );
  }

  // Sub-views
  return (
    <section style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <button onClick={() => setProfileView('menu')} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '0.85rem', fontWeight: 700, color: currentTheme.primary,
        fontFamily: 'Tajawal, sans-serif', marginBottom: 20,
      }}>
        رجوع ←
      </button>

      {profileView === 'personal' && (
        <div style={{
          background: '#fff', borderRadius: 16, padding: '1.5rem',
          border: '1px solid #f1f5f9',
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1020', marginBottom: 20 }}>
            👤 المعلومات الشخصية
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'الاسم', value: 'أحمد محمد', icon: User },
              { label: 'البريد', value: 'ahmed@email.com', icon: Mail },
              { label: 'الهاتف', value: '+966 50 123 4567', icon: Phone },
            ].map((field, i) => {
              const FieldIcon = field.icon;
              return (
                <div key={i}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>{field.label}</label>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '0.7rem 1rem', borderRadius: 10,
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                  }}>
                    <FieldIcon size={16} color="#94a3b8" />
                    <span style={{ flex: 1, fontSize: '0.85rem', color: '#0b1020' }}>{field.value}</span>
                    <button style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                    }}>
                      <Edit size={14} color={currentTheme.primary} />
                    </button>
                  </div>
                </div>
              );
            })}
            <button style={{
              padding: '0.7rem 1.5rem', borderRadius: radius,
              background: currentTheme.gradient, color: '#fff',
              border: 'none', fontSize: '0.85rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              alignSelf: 'flex-start',
            }}>
              حفظ التغييرات
            </button>
          </div>
        </div>
      )}

      {profileView === 'wallet' && (
        <>
          <div style={{
            background: currentTheme.gradient, borderRadius: 16,
            padding: '1.5rem', color: '#fff', marginBottom: 16,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <p style={{ fontSize: '0.78rem', opacity: 0.8, marginBottom: 4 }}>الرصيد الحالي</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 900 }}>$45.00</p>
            </div>
            <button onClick={() => setShowWalletModal(true)} style={{
              padding: '0.6rem 1.25rem', borderRadius: radius,
              background: 'rgba(255,255,255,0.2)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              fontSize: '0.82rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
            }}>
              💳 شحن
            </button>
          </div>

          <div style={{
            background: '#fff', borderRadius: 16, padding: '1.5rem',
            border: '1px solid #f1f5f9',
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0b1020', marginBottom: 14 }}>آخر المعاملات</h4>
            {[
              { desc: 'شحن محفظة', amount: '+$25.00', color: '#22c55e', date: '2025-01-15' },
              { desc: 'شراء Sigma Plus', amount: '-$15.00', color: '#ef4444', date: '2025-01-15' },
              { desc: 'شحن محفظة', amount: '+$50.00', color: '#22c55e', date: '2025-01-14' },
              { desc: 'شراء IMEI Check', amount: '-$2.00', color: '#ef4444', date: '2025-01-14' },
            ].map((tx, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.7rem 0',
                borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none',
              }}>
                <div>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0b1020' }}>{tx.desc}</p>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{tx.date}</p>
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: tx.color }}>{tx.amount}</span>
              </div>
            ))}
          </div>

          {showWalletModal && <WalletChargeModal onClose={() => setShowWalletModal(false)} />}
        </>
      )}

      {profileView === 'security' && (
        <div style={{
          background: '#fff', borderRadius: 16, padding: '1.5rem',
          border: '1px solid #f1f5f9',
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1020', marginBottom: 20 }}>
            🔒 الأمان والتحقق
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>كلمة المرور الحالية</label>
              <input type="password" placeholder="••••••••"
                style={{
                  width: '100%', padding: '0.7rem 1rem', borderRadius: 10,
                  border: '1px solid #e2e8f0', fontSize: '0.85rem',
                  fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>كلمة المرور الجديدة</label>
              <input type="password" placeholder="••••••••"
                style={{
                  width: '100%', padding: '0.7rem 1rem', borderRadius: 10,
                  border: '1px solid #e2e8f0', fontSize: '0.85rem',
                  fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Verification Status */}
            <div style={{
              padding: '1rem', borderRadius: 12, background: '#f0fdf4',
              border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <CheckCircle size={20} color="#22c55e" />
              <div>
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a' }}>البريد الإلكتروني مُوثّق</p>
                <p style={{ fontSize: '0.72rem', color: '#4ade80' }}>ahmed@email.com</p>
              </div>
            </div>

            <button style={{
              padding: '0.7rem 1.5rem', borderRadius: radius,
              background: currentTheme.gradient, color: '#fff',
              border: 'none', fontSize: '0.85rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              alignSelf: 'flex-start',
            }}>
              حفظ التغييرات
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
