# 🚀 Cara Deploy ke Vercel - Wayfinders

## Persiapan

### 1. Buat Repository GitHub

1. Buka https://github.com/new
2. Login ke GitHub
3. Isi:
   - **Repository name**: `wayfinders`
   - **Description**: Wayfinders Learning Platform
   - **Visibility**: Private atau Public (terserah)
   - **JANGAN** centang "Add a README file"
4. Klik **"Create repository"**

---

## Deploy Otomatis dengan Script

### 2. Jalankan Script Deploy

Buka **Terminal** dan jalankan:

```bash
cd /Users/macbookpro/Documents/CLI/wayfinders/fullstack-app
./deploy-vercel.sh
```

Script akan meminta:
- Konfirmasi sudah buat repository
- URL repository GitHub (contoh: `https://github.com/username/wayfinders.git`)

Script akan otomatis push code ke GitHub.

---

## Deploy Manual (Alternatif)

Jika script tidak berjalan, lakukan manual:

### 2a. Tambahkan Remote GitHub

```bash
cd /Users/macbookpro/Documents/CLI/wayfinders/fullstack-app
git remote add origin https://github.com/USERNAME/wayfinders.git
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub Anda.

---

### 3. Deploy ke Vercel

1. **Buka** https://vercel.com/new
2. **Login** dengan GitHub
3. **Klik** "Import Project"
4. **Pilih** repository `wayfinders` yang baru di-push
5. **Klik** "Import"

---

### 4. Setup Environment Variables

Di halaman deploy Vercel, klik **"Environment Variables"** dan tambahkan:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/dbname` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | `random-string-min-32-characters` |
| `XENDIT_SECRET_KEY` | `xnd_development_...` (jika pakai payment) |
| `GOOGLE_CLIENT_ID` | (jika pakai Google OAuth) |
| `GOOGLE_CLIENT_SECRET` | (jika pakai Google OAuth) |

**Klik "Save"**

---

### 5. Setup Database (Neon - Gratis)

Vercel tidak punya database built-in. Gunakan **Neon** (gratis):

1. **Buka** https://neon.tech
2. **Sign up** dengan GitHub
3. **Create new project**: `wayfinders`
4. **Copy Connection String** (yang `pooler`)
5. **Paste** ke Vercel Environment Variables sebagai `DATABASE_URL`
6. **Copy** yang `direct` untuk `DIRECT_URL`

---

### 6. Migrate Database

Setelah deploy selesai:

1. Buka **Vercel Dashboard** → Project Anda
2. Klik **"Settings"** → **"Deployments"**
3. Klik **"Redeploy"** pada deployment terbaru
4. Atau buka **Deployments** → klik 3 dots → **"Redeploy"**

Untuk migrate database, buka **Vercel AI Terminal** atau jalankan lokal:

```bash
npx prisma generate
npx prisma db push
```

---

## Selesai! 🎉

Website Anda sudah online di: `https://wayfinders-yourusername.vercel.app`

---

## Update Website

Setiap kali ada perubahan code:

```bash
git add .
git commit -m "Update feature"
git push
```

Vercel akan **auto-deploy** setiap push ke GitHub!

---

## Troubleshooting

### Build Error
- Cek log di Vercel Dashboard → Deployments → klik deployment → lihat log
- Pastikan semua dependencies terinstall

### Database Connection Error
- Pastikan `DATABASE_URL` benar
- Neon: pastikan IP whitelist termasuk Vercel (atau set ke `0.0.0.0/0`)

### 404 Error
- Pastikan routing Next.js sudah benar
- Cek `next.config.js` tidak ada `output: 'export'`

---

## Links Penting

- Vercel Dashboard: https://vercel.com/dashboard
- Neon Dashboard: https://console.neon.tech
- Prisma Docs: https://pris.ly/d/accelerate
