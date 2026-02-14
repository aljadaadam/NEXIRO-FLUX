import Link from "next/link";
import Image from "next/image";

export default function ProfileNavCard(props: {
  href: string;
  title: string;
  description?: string;
  icon?: string;
  iconSrc?: string;
}) {
  return (
    <Link className="profileNavCard" href={props.href}>
      <div className="profileNavCard-icon" aria-hidden="true">
        {props.iconSrc ? (
          <Image
            src={props.iconSrc}
            alt=""
            width={26}
            height={26}
            style={{ objectFit: "contain" }}
          />
        ) : (
          (props.icon ?? "→")
        )}
      </div>
      <div className="profileNavCard-body">
        <div className="profileNavCard-title">{props.title}</div>
        {props.description ? (
          <div className="profileNavCard-description">{props.description}</div>
        ) : null}
      </div>
      <div className="profileNavCard-chevron" aria-hidden="true">
        ‹
      </div>
    </Link>
  );
}
