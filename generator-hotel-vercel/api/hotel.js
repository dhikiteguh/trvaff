// GET /api/hotel?url=https://trv.lk/xxxx
// Membuka link (mengikuti redirect), mengambil nama hotel, gambar, dan harga dari halaman Traveloka.

const UA_LIST = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'WhatsApp/2.23.20.0'
];

export default async function handler(req, res) {
  const url = String(req.query.url || '').trim();
  if (!/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'Link harus diawali https://' });
  }

  const hasil = { name: '', image: '', price: '', finalUrl: url, debug: [] };

  for (const ua of UA_LIST) {
    let page;
    try {
      page = await bukaHalaman(url, ua);
    } catch (e) {
      hasil.debug.push(`${ua.slice(0, 20)}: ${e.message}`);
      continue;
    }
    hasil.finalUrl = page.finalUrl || hasil.finalUrl;
    hasil.debug.push(`${ua.slice(0, 20)}: HTTP ${page.status}, ${page.html.length} byte`);
    const html = page.html;

    const title = meta(html, 'og:title') || meta(html, 'twitter:title') || jsonLd(html, 'name') || tagTitle(html);
    const image = meta(html, 'og:image') || meta(html, 'og:image:url') || meta(html, 'twitter:image') || jsonLd(html, 'image');
    const desc = meta(html, 'og:description') || meta(html, 'description') || '';

    if (!hasil.name && title && !/^traveloka$/i.test(title.trim())) hasil.name = rapikanNama(title);
    if (!hasil.image && image) hasil.image = absolut(image, hasil.finalUrl);
    if (!hasil.price) hasil.price = cariHarga(html, desc);
    if (hasil.name && hasil.image) break;
  }

  if (!hasil.name) hasil.name = namaDariSlug(hasil.finalUrl);

  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).json(hasil);
}

async function bukaHalaman(url, ua, depth = 0) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8'
      }
    });
    const html = await r.text();
    const finalUrl = r.url || url;
    // Redirect lewat <meta refresh> atau JavaScript di halaman pendek
    const m = html.match(/http-equiv=["']refresh["'][^>]*url=([^"'>\s]+)/i) ||
              html.match(/window\.location(?:\.href)?\s*=\s*["']([^"']+)["']/i);
    if (m && html.length < 5000 && depth < 3) {
      return bukaHalaman(absolut(decodeEntities(m[1]), finalUrl), ua, depth + 1);
    }
    return { finalUrl, html, status: r.status };
  } finally {
    clearTimeout(t);
  }
}

function meta(html, key) {
  const k = key.replace(/[:.]/g, '\\$&');
  const r1 = new RegExp(`<meta[^>]+(?:property|name)=["']${k}["'][^>]*content=["']([^"']*)["']`, 'i');
  const r2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${k}["']`, 'i');
  const m = html.match(r1) || html.match(r2);
  return m ? decodeEntities(m[1]).trim() : '';
}

function tagTitle(html) {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? decodeEntities(m[1]).trim() : '';
}

function jsonLd(html, field) {
  const re = /<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const data = JSON.parse(m[1]);
      const list = Array.isArray(data) ? data : (data['@graph'] || [data]);
      for (const item of list) {
        let v = item && item[field];
        if (Array.isArray(v)) v = v[0];
        if (v && typeof v === 'object') v = v.url || v.contentUrl || '';
        if (v) return String(v);
      }
    } catch (e) {}
  }
  return '';
}

function cariHarga(html, desc) {
  const pr = jsonLd(html, 'priceRange');
  const m = `${desc} ${pr}`.match(/(?:Rp|IDR)\s?([\d.,]{5,})/i);
  return m ? m[1].replace(/\D/g, '') : '';
}

function rapikanNama(t) {
  t = t.split(/\s+[|•]\s+/)[0];
  t = t.replace(/\s+[-–—]\s+(Traveloka|Harga|Promo|Booking|Pesan|Diskon|Update).*$/i, '');
  t = t.replace(/^(Promo|Harga|Booking|Pesan|Diskon|Hotel Murah)\s+(Kamar\s+)?(di\s+)?/i, '');
  t = t.replace(/\s*\((Harga|Promo|Update)[^)]*\)\s*$/i, '');
  return t.trim();
}

function namaDariSlug(u) {
  const parts = String(u).split('?')[0].split('/').filter(Boolean);
  const slug = (parts[parts.length - 1] || '').replace(/-?\d{6,}$/, '');
  if (!slug || /trv\.lk|detail/i.test(slug) || !slug.includes('-')) return '';
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function absolut(u, base) {
  try { return new URL(u, base).href; } catch (e) { return u; }
}

function decodeEntities(s) {
  return String(s)
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#039;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
}
