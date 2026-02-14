export default function ProfileBanner(props: {
  imageSrc?: string;
  alt?: string;
}) {
  const src = props.imageSrc ?? "/images/ProfileScreen/banner/bankak.png";

  return (
    <section className="profileBanner" aria-label="Banner">
      {src ? (
        <img
          className="profileBanner-media"
          src={src}
          alt={props.alt ?? ""}
          style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }}
        />
      ) : null}
    </section>
  );
}
