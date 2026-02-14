const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "كيف أعرف حالة طلبي؟",
    a: "اذهب إلى صفحة (طلباتي) وستجد الحالة والتفاصيل. إن لم يظهر الطلب تأكد من تسجيل الدخول بنفس البريد المستخدم أثناء الطلب.",
  },
  {
    q: "كم يستغرق تنفيذ الخدمة؟",
    a: "المدة تختلف حسب نوع الخدمة، وستجد الوقت المتوقع داخل تفاصيل الخدمة. بعض الخدمات فورية والبعض يحتاج ساعات/أيام.",
  },
  {
    q: "دفعت ولم يتم تحديث الرصيد/الطلب",
    a: "أرسل لنا رقم العملية/الإيصال + بريدك، وسنراجعها. في التحويل البنكي قد يستغرق التحقق بعض الوقت.",
  },
  {
    q: "هل يمكنني تعديل بيانات الطلب بعد الإرسال؟",
    a: "إذا كانت الخدمة لم تبدأ بعد، غالبًا يمكن التعديل. أرسل رقم الطلب والتفاصيل المطلوبة وسنحاول مساعدتك.",
  },
  {
    q: "كيف أسرّع حل المشكلة؟",
    a: "اكتب رقم الطلب، البريد، اسم الخدمة، ولقطات شاشة إن أمكن. كلما كانت المعلومات أوضح كان الحل أسرع.",
  },
];

export default function SupportFaq() {
  return (
    <section className="card" style={{ padding: "1.25rem" }}>
      <div className="support-sectionTitle">الأسئلة الشائعة</div>
      <div className="small" style={{ marginTop: ".25rem" }}>
        أكثر الأسئلة تكرارًا لمساعدتك بسرعة.
      </div>

      <div className="support-faq" style={{ marginTop: "0.85rem" }}>
        {FAQ.map((item) => (
          <details key={item.q} className="support-faqItem">
            <summary className="support-faqSummary">
              <span>{item.q}</span>
              <span className="support-faqChevron" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 10l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </summary>
            <div className="support-faqAnswer">{item.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
