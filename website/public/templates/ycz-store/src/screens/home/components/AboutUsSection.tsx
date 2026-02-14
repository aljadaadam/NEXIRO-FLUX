export default function AboutUsSection() {
  return (
    <section className="card about" style={{ marginTop: "1rem" }}>
      <div className="about-inner">
        <div className="about-text">
          <div className="about-title">لماذا نحن؟</div>
          <ul className="about-lines">
            <li>تنفيذ سريع وموثوق</li>
            <li>حماية كاملة لبياناتك</li>
            <li>أسعار مناسبة للجميع</li>
            <li>دعم فني مستمر</li>
          </ul>
        </div>

        <div className="about-imageWrap" aria-hidden>
          <img
            className="about-image"
            src="/images/About%20us/vecteezy.png"
            alt=""
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
