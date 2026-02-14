import Image from "next/image";

export default function ProfileHero(props: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="profileHero">
      <div className="profileHero-text">
        <div className="profileHero-title">{props.title}</div>
        {props.subtitle ? <div className="profileHero-subtitle">{props.subtitle}</div> : null}
      </div>

      <div className="profileHero-media" aria-hidden="true">
        <div className="profileHero-mediaBox">
          <Image
            src="/images/servicesScreen/security.gif"
            alt=""
            fill
            sizes="140px"
            priority
            unoptimized
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>
    </div>
  );
}
