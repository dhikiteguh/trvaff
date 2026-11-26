# Generator Rekomendasi Hotel (Traveloka)

Tempel link Traveloka (termasuk link pendek trv.lk). Nama hotel, gambar, dan harga diambil otomatis,
lalu dibuat kode HTML kartu rekomendasi untuk ditempel di CMS.

## Isi folder
- `index.html` — halaman generator
- `api/hotel.js` — fungsi server: membuka link dan mengambil nama, gambar, harga
- `package.json` — pengaturan Node (tanpa library tambahan)

## Deploy ke Vercel
Cara A — lewat GitHub:
1. Upload folder ini ke repository GitHub baru.
2. Di vercel.com: Add New → Project → pilih repository → Deploy (tanpa ubah pengaturan apa pun).

Cara B — lewat terminal:
1. `npm i -g vercel`
2. Masuk ke folder ini, jalankan `vercel` lalu `vercel --prod`.

## Uji fungsi server
Buka di browser (ganti dengan domain Vercel Anda):
`https://NAMA-PROJECT.vercel.app/api/hotel?url=https://trv.lk/7ccc0b61`

Hasil yang benar berisi `name` dan `image`. Kolom `debug` menunjukkan status HTTP dari Traveloka.
Jika status 403 atau `name` kosong, berarti Traveloka menolak permintaan dari server Vercel —
nama dan gambar tetap bisa diisi manual di bagian "Ubah hasil".
