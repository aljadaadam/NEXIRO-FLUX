var puppeteer = require('puppeteer');
(async () => {
  var browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']});
  var page = await browser.newPage();
  await page.setViewport({width: 1200, height: 630});
  var html = [
    '<html><body style="margin:0;padding:0;width:1200px;height:630px;',
    'background:linear-gradient(135deg,#0a0a1a 0%,#1a1a3e 50%,#0a0a1a 100%);',
    'display:flex;align-items:center;justify-content:center;font-family:sans-serif">',
    '<div style="text-align:center;color:white">',
    '<div style="font-size:72px;font-weight:900;letter-spacing:-2px;margin-bottom:20px;',
    'background:linear-gradient(to right,#6366f1,#8b5cf6,#a855f7);',
    '-webkit-background-clip:text;-webkit-text-fill-color:transparent">NEXIRO-FLUX</div>',
    '<div style="font-size:28px;color:#94a3b8;margin-bottom:30px" dir="rtl">',
    '\u0623\u0637\u0644\u0642 \u0645\u0648\u0642\u0639\u0643 \u0627\u0644\u0627\u062d\u062a\u0631\u0627\u0641\u064a \u0641\u064a \u062f\u0642\u0627\u0626\u0642</div>',
    '<div style="font-size:20px;color:#6366f1">Professional Website Builder Platform</div>',
    '</div></body></html>'
  ].join('');
  await page.setContent(html);
  await page.screenshot({path: '/var/www/nexiro-flux/website/public/og-image.png', type: 'png'});
  await browser.close();
  console.log('OG image created successfully');
})();
