// Sumber bookmarklet "Ambil Data Hotel" (versi mudah dibaca).
// Dijalankan di halaman hotel Traveloka yang sedang Anda buka.
(() => {
  const q = s => { const e = document.querySelector(s); return e ? (e.getAttribute('content') || e.textContent || '').trim() : ''; };
  let name = q('h1') || q('meta[property="og:title"]') || document.title;
  name = name.split(/\s+[|•]\s+/)[0]
    .replace(/\s+[-–—]\s+(Traveloka|Harga|Promo|Booking|Pesan|Diskon|Update).*$/i, '')
    .replace(/^(Promo|Harga|Booking|Pesan|Diskon)\s+(Kamar\s+)?(di\s+)?/i, '')
    .trim();
  let image = q('meta[property="og:image"]') || q('meta[name="twitter:image"]');
  if (!image) {
    let best = 0;
    document.querySelectorAll('img').forEach(i => {
      const a = i.naturalWidth * i.naturalHeight;
      if (a > best && /^https?:/.test(i.currentSrc || i.src)) { best = a; image = i.currentSrc || i.src; }
    });
  }
  const nums = (document.body.innerText.match(/Rp\s?[\d.]{5,}/g) || [])
    .map(s => +s.replace(/\D/g, '')).filter(n => n >= 50000);
  const price = nums.length ? String(Math.min(...nums)) : '';
  const data = 'TVLK' + JSON.stringify({ name, image, price, url: location.href });

  const toast = msg => {
    const d = document.createElement('div');
    d.textContent = msg;
    d.style.cssText = 'position:fixed;z-index:2147483647;left:50%;top:20px;transform:translateX(-50%);background:#0194f3;color:#fff;font:600 15px/1.4 sans-serif;padding:12px 18px;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.25);max-width:90vw';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 3500);
  };
  if (!name || !image) { toast('Nama/gambar tidak terbaca. Pastikan ini halaman detail hotel.'); }
  navigator.clipboard.writeText(data).then(
    () => toast('✓ Data hotel tersalin: ' + name + ' — tempel di generator'),
    () => prompt('Salin teks ini lalu tempel di generator:', data)
  );
})();
