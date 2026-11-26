# Generator Rekomendasi Hotel (Traveloka)

Versi bookmarklet: data hotel diambil di browser Anda sendiri dari halaman Traveloka yang sedang dibuka,
jadi tidak diblokir anti-bot Traveloka (pengambilan lewat server selalu kena HTTP 403).

## Isi
- index.html      — halaman generator (bisa di Vercel, atau dibuka langsung dari komputer)
- bookmarklet.js  — kode sumber tombol bookmark "📌 Ambil Data Hotel" (sudah tertanam di index.html)
- package.json

## Deploy
Upload isi folder ini ke GitHub (index.html di root), lalu import di Vercel → Deploy.
Tidak ada fungsi server lagi; folder api/ boleh dihapus dari repository lama.

## Pakai
1. Seret tombol 📌 Ambil Data Hotel ke bar bookmark (sekali saja).
2. Tempel link trv.lk di slot hotel → klik "Buka".
3. Di halaman hotel Traveloka, klik bookmark → data tersalin.
4. Tempel di kolom "Data hotel". Ulangi untuk hotel 2 → Salin kode → tempel di CMS lewat tombol <>.
