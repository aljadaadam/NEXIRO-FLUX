type Step = {
  title: string;
  imageFile: string;
};

const steps: Step[] = [
  { title: "أنشئ حساب", imageFile: "Createaccount.png" },
  { title: "اختار الخدمة", imageFile: "Choose the service.png" },
  { title: "اشحن المحفظة", imageFile: "Top up your wallet.png" },
  { title: "اضف الي العربة", imageFile: "Add to cart.png" },
];

function getExplainImageSrc(fileName: string): string {
  return `/images/explain/${encodeURIComponent(fileName)}`;
}

export default function HowToOrderSteps() {
  return (
    <section className="card howto" style={{ marginTop: "1rem" }}>
      <div style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>طريقة تقديم الطلب</div>

      <div className="howto-steps" aria-label="How to order steps">
        {steps.map((step, index) => (
          <div key={step.title} className="howto-step">
            <div className="howto-stepCard">
              <div className="howto-stepImageWrap">
                <img
                  className="howto-stepImage"
                  src={getExplainImageSrc(step.imageFile)}
                  alt={step.title}
                  loading="lazy"
                />
              </div>
              <div className="howto-stepTitle">{step.title}</div>
            </div>

            {index < steps.length - 1 ? (
              <div className="howto-arrow" aria-hidden>
                <img
                  className="howto-arrowImg"
                  src="/images/explain/arrow-steps.svg"
                  alt=""
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
