require('dotenv').config();
const mysql = require('mysql2/promise');
const db = mysql.createPool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});
(async () => {
  try {
    const imgUrl = 'https://6990ab01681c79fa0bccfe99.imgix.net/pic-banner.png';
    const designData = JSON.stringify({
      title: "خدمة Samsung FRP",
      subtitle: "فتح حساب جوجل لأجهزة سامسونج",
      description: "خدمة فتح قفل FRP لجميع أجهزة سامسونج - سريع وآمن ومضمون بأفضل الأسعار",
      icon: "",
      image_url: imgUrl,
      link: "/services",
      badges: ["جميع الموديلات", "سريع ومضمون", "أفضل سعر"],
      gradient: "linear-gradient(135deg, #1428a0 0%, #0b1a5e 40%, #000000 100%)",
      imagePosition: "bottom",
      bg_image: imgUrl
    });

    await db.query(
      'UPDATE banner_templates SET design_data = ?, preview_image = ? WHERE id = 5',
      [designData, imgUrl]
    );

    console.log('Updated Samsung FRP banner with new image');

    const [check] = await db.query('SELECT id, name, preview_image FROM banner_templates WHERE id = 5');
    console.log('Verified:', check[0].name, '| image:', check[0].preview_image);

    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
