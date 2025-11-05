# 🚀 HƯỚNG DẪN DEPLOY MUSEMAP

Hướng dẫn deploy MuseMap/DreamLens lên production với:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Render PostgreSQL

---

## 📋 BƯỚC 1: TẠO GIT REPOSITORY

### 1.1 Khởi tạo Git (nếu chưa có)

```bash
cd D:\Musemap
git init
git add .
git commit -m "Initial commit - Ready for deployment"
```

### 1.2 Tạo GitHub Repository

1. Vào https://github.com/new
2. Tạo repo mới: `musemap` (hoặc tên bạn muốn)
3. **Chọn Private** (vì có sensitive data)
4. **KHÔNG** tạo README, .gitignore (đã có sẵn)

### 1.3 Push code lên GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/musemap.git
git branch -M main
git push -u origin main
```

---

## 🗄️ BƯỚC 2: SETUP DATABASE TRÊN RENDER

### 2.1 Tạo PostgreSQL Database

1. Vào https://dashboard.render.com/
2. Click **"New +"** → **"PostgreSQL"**
3. Cấu hình:
   - **Name**: `musemap-db`
   - **Database**: `musemap`
   - **User**: `musemap_user` (auto-generated)
   - **Region**: Singapore (gần Việt Nam nhất)
   - **Plan**: Free
4. Click **"Create Database"**
5. ⏳ Đợi ~2-3 phút để database được tạo

### 2.2 Lấy Database Credentials

Sau khi tạo xong, copy các thông tin:
- **Internal Database URL**: `postgresql://...` (dùng cho backend trên Render)
- **External Database URL**: `postgresql://...` (dùng cho local development)
- **Host**: `dpg-xxxxx.singapore-postgres.render.com`
- **Port**: `5432`
- **Database**: `musemap`
- **Username**: `musemap_user`
- **Password**: `xxx...`

⚠️ **LƯU Ý:** Dùng **Internal Database URL** cho backend trên Render (nhanh hơn).

---

## 🔧 BƯỚC 3: DEPLOY BACKEND LÊN RENDER

### 3.1 Tạo Web Service

1. Vào https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub account nếu chưa
4. Chọn repository: `musemap`

### 3.2 Cấu hình Backend

```
Name: musemap-api
Region: Singapore
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Instance Type: Free
```

### 3.3 Environment Variables (Render)

Click **"Advanced"** → **"Add Environment Variable"**:

```bash
# Database (dùng Internal Database URL từ bước 2.2)
DATABASE_URL=postgresql://musemap_user:PASSWORD@dpg-xxxxx-internal/musemap

# Security
SECRET_KEY=your-super-secret-key-here-min-32-chars
DEBUG=False

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://musemap-api.onrender.com/auth/google/callback

# Hugging Face
HUGGINGFACE_TOKEN=your-huggingface-token

# CORS (Frontend URL)
FRONTEND_URL=https://musemap.vercel.app
```

### 3.4 Deploy Backend

1. Click **"Create Web Service"**
2. ⏳ Đợi ~5-10 phút để build và deploy
3. ✅ Backend URL: `https://musemap-api.onrender.com`
4. Test: `https://musemap-api.onrender.com/api/health`

⚠️ **LƯU Ý:** Free plan Render sẽ spin down sau 15 phút không dùng. Lần đầu request sẽ chậm ~30s.

---

## ⚡ BƯỚC 4: DEPLOY FRONTEND LÊN VERCEL

### 4.1 Chuẩn bị Frontend

**Cập nhật `frontend/.env.production`:**

```bash
VITE_API_URL=https://musemap-api.onrender.com
```

**Tạo `frontend/vercel.json`:**

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

**Commit changes:**

```bash
git add .
git commit -m "Add Vercel config and production env"
git push
```

### 4.2 Deploy trên Vercel

1. Vào https://vercel.com/
2. Click **"Add New..."** → **"Project"**
3. Import GitHub repository: `musemap`
4. Cấu hình:

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

5. **Environment Variables:**

```bash
VITE_API_URL=https://musemap-api.onrender.com
```

6. Click **"Deploy"**
7. ⏳ Đợi ~2-3 phút
8. ✅ Frontend URL: `https://musemap.vercel.app`

---

## 🔐 BƯỚC 5: CẤU HÌNH GOOGLE OAUTH

### 5.1 Google Cloud Console

1. Vào https://console.cloud.google.com/
2. Chọn project của bạn
3. **APIs & Services** → **Credentials**
4. Click vào OAuth 2.0 Client ID của bạn
5. **Authorized JavaScript origins**:
   - Thêm: `https://musemap.vercel.app`
   - Thêm: `https://musemap-api.onrender.com`
6. **Authorized redirect URIs**:
   - Thêm: `https://musemap-api.onrender.com/auth/google/callback`
   - Giữ: `http://localhost:8000/auth/google/callback` (cho dev)
7. Click **"Save"**

### 5.2 Cập nhật Backend CORS

File: `backend/app/main.py`

```python
# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://musemap.vercel.app",  # ← Thêm frontend URL
    "https://*.vercel.app",  # ← Cho preview deployments
]
```

Commit và push:

```bash
cd backend
git add app/main.py
git commit -m "Update CORS for production"
git push
```

Render sẽ tự động redeploy.

---

## 🧪 BƯỚC 6: KIỂM TRA SAU KHI DEPLOY

### 6.1 Backend Health Check

```bash
curl https://musemap-api.onrender.com/api/health
# Expected: {"status": "healthy"}
```

### 6.2 Frontend

1. Mở: `https://musemap.vercel.app`
2. ✅ Kiểm tra: Trang load bình thường
3. ✅ Kiểm tra: Theme đổi được
4. ✅ Kiểm tra: Đăng ký tài khoản mới
5. ✅ Kiểm tra: Đăng nhập
6. ✅ Kiểm tra: Google OAuth
7. ✅ Kiểm tra: Tạo giấc mơ
8. ✅ Kiểm tra: Generate ảnh
9. ✅ Kiểm tra: Xóa giấc mơ
10. ✅ Kiểm tra: Xóa tài khoản

### 6.3 Database

Vào Render Dashboard → Database → Query:

```sql
SELECT * FROM users LIMIT 5;
SELECT * FROM dreams LIMIT 5;
SELECT * FROM generated_images LIMIT 5;
```

---

## 🐛 TROUBLESHOOTING

### Lỗi: CORS Error

**Nguyên nhân:** Frontend URL chưa được thêm vào CORS origins

**Fix:**
1. Update `backend/app/main.py` với frontend URL
2. Push code → Render auto redeploy

### Lỗi: Database Connection Failed

**Nguyên nhân:** Sai DATABASE_URL hoặc database chưa sẵn sàng

**Fix:**
1. Kiểm tra DATABASE_URL trong Render environment variables
2. Dùng **Internal Database URL** (không phải External)
3. Restart backend service

### Lỗi: Google OAuth Redirect Mismatch

**Nguyên nhân:** Redirect URI chưa được thêm vào Google Console

**Fix:**
1. Vào Google Cloud Console
2. Thêm `https://musemap-api.onrender.com/auth/google/callback`
3. Đợi vài phút để apply

### Lỗi: 502 Bad Gateway (Render)

**Nguyên nhân:** Free plan spin down sau 15 phút không dùng

**Fix:**
- Đợi ~30s để service spin up lại
- Hoặc upgrade lên paid plan ($7/month)

### Lỗi: Environment Variables Not Loading

**Nguyên nhân:** Không commit `.env.production` hoặc chưa set trên Vercel

**Fix:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Thêm `VITE_API_URL`
3. Redeploy

---

## 🔄 UPDATE SAU KHI DEPLOY

### Frontend Update

```bash
# Local changes
git add .
git commit -m "Update frontend"
git push

# Vercel tự động redeploy (~1-2 phút)
```

### Backend Update

```bash
# Local changes
git add .
git commit -m "Update backend"
git push

# Render tự động redeploy (~5-8 phút)
```

---

## 💰 CHI PHÍ

### Free Tier (Current)

- **Vercel**: Free forever
  - 100GB bandwidth/month
  - Unlimited deployments
- **Render**: Free
  - PostgreSQL: 1GB storage, expires sau 90 ngày
  - Web Service: Spin down sau 15 phút
- **Google OAuth**: Free
- **Hugging Face**: Free (với rate limits)

**Tổng: $0/tháng** ✅

### Paid (Optional)

- **Render Paid**: $7/month
  - Database không expire
  - Web service luôn active (không spin down)
- **Vercel Pro**: $20/month (không cần thiết cho project nhỏ)

---

## 📝 CUSTOM DOMAIN (Optional)

### Setup Custom Domain

1. Mua domain (Namecheap, GoDaddy, etc.)
2. **Frontend (Vercel)**:
   - Vercel Dashboard → Domains → Add
   - Point A record: `76.76.21.21`
3. **Backend (Render)**:
   - Render Dashboard → Settings → Custom Domain
   - Point CNAME: `musemap-api.onrender.com`

---

## 🔒 BẢO MẬT PRODUCTION

### 1. Secret Key

Tạo secret key mạnh:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. Environment Variables

⚠️ **KHÔNG BAO GIỜ** commit `.env` files!
✅ Dùng environment variables trên Vercel/Render

### 3. Database Backups

Render Free tier không có auto backup. Nên:
- Export database thường xuyên
- Hoặc upgrade lên paid plan

---

## 🎉 HOÀN THÀNH!

Project của bạn đã được deploy thành công!

- 🌐 Frontend: https://musemap.vercel.app
- 🔧 Backend: https://musemap-api.onrender.com
- 🗄️ Database: Render PostgreSQL

**Lưu ý quan trọng:**
1. Lần đầu access backend có thể chậm 30s (spin up)
2. Database free sẽ expire sau 90 ngày (cần upgrade hoặc backup + tạo mới)
3. Monitor usage trên Render/Vercel dashboards

Good luck! 🚀
