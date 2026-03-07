INSERT INTO banners (site_key, title, subtitle, description, icon, image_url, link, extra_data, is_active, sort_order, template_id)
VALUES (
  'none-st-a306ee-mlqlv4ye',
  'اشتراكات UnlockTool',
  'افضل اداة فتح الاجهزة',
  'اشتراك سنة كاملة بافضل سعر - تفعيل فوري',
  'star',
  'https://file.unlocktool.net/uploads/logo/logo_1766854141_69500dfd06f2b.png',
  '/services',
  '{"badges":["تفعيل فوري","دعم 24/7","ضمان"],"gradient":"linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)","bg_image":"","imagePosition":""}',
  1,
  0,
  2
);

SELECT id, site_key, template_id, title, is_active FROM banners WHERE site_key = 'none-st-a306ee-mlqlv4ye' ORDER BY id;
