#!/bin/bash

# ============================================
# DEPLOY TO VERCEL - WAYFINDERS
# ============================================
# Script ini akan membantu deploy ke Vercel
# ============================================

echo "🚀 Wayfinders - Deploy to Vercel"
echo "================================="
echo ""

# 1. Cek apakah sudah login GitHub
echo "📝 Step 1: Setup GitHub"
echo "-----------------------"
echo ""
echo "Buka browser dan lakukan ini:"
echo "1. Login ke https://github.com"
echo "2. Klik '+' di pojok kanan atas → 'New repository'"
echo "3. Nama repository: wayfinders"
echo "4. Pilih Private atau Public"
echo "5. JANGAN centang 'Add README'"
echo "6. Klik 'Create repository'"
echo ""
read -p "Sudah buat repository? (y/n): " sudah_buat

if [ "$sudah_buat" != "y" ]; then
    echo "❌ Buat repository dulu, lalu jalankan script ini lagi"
    exit 1
fi

echo ""
echo "📝 Step 2: Masukkan GitHub Repository URL"
echo "------------------------------------------"
echo "Contoh: https://github.com/username/wayfinders.git"
read -p "GitHub Repository URL: " repo_url

if [ -z "$repo_url" ]; then
    echo "❌ URL tidak boleh kosong"
    exit 1
fi

# Set remote
git remote remove origin 2>/dev/null
git remote add origin "$repo_url"

echo ""
echo "📤 Step 3: Push ke GitHub..."
git push -u origin main

if [ $? -ne 0 ]; then
    echo "❌ Push gagal. Pastikan:"
    echo "   - URL repository benar"
    echo "   - Anda sudah login GitHub"
    echo "   - Punya akses ke repository"
    exit 1
fi

echo ""
echo "✅ Push berhasil!"
echo ""
echo "========================================="
echo "📝 Step 4: Deploy ke Vercel"
echo "========================================="
echo ""
echo "1. Buka https://vercel.com/new"
echo "2. Login dengan GitHub"
echo "3. Klik 'Import Project'"
echo "4. Pilih repository 'wayfinders'"
echo "5. Klik 'Import'"
echo ""
echo "6. Isi Environment Variables berikut:"
echo "   DATABASE_URL=postgresql://..."
echo "   NEXTAUTH_URL=https://your-app.vercel.app"
echo "   NEXTAUTH_SECRET=generate-random-string"
echo "   (lihat file .env.example untuk lengkapnya)"
echo ""
echo "7. Klik 'Deploy'"
echo ""
echo "🎉 Selesai!"
echo ""
