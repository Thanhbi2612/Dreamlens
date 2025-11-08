# MuseMap - Dream Analysis AI Platform

Ứng dụng web phân tích và giải mã giấc mơ sử dụng AI, kết hợp với khả năng tạo hình ảnh minh họa cho giấc mơ của bạn.

## Giới thiệu

MuseMap là một nền tảng web hiện đại cho phép người dùng:
- Ghi lại và quản lý giấc mơ của họ
- Nhận phân tích và giải thích giấc mơ thông qua AI
- Tạo hình ảnh minh họa cho giấc mơ bằng AI
- Theo dõi lịch sử các giấc mơ đã ghi lại

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **React Toastify** - Toast notifications
- **TSParticles** - Particle effects

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Primary database
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations
- **Groq AI** - AI/LLM integration
- **Authlib** - OAuth implementation
- **Passlib & Bcrypt** - Password hashing
- **Python-Jose** - JWT tokens
- **Asyncpg** - Async PostgreSQL driver

## Tính năng chính

### Xác thực người dùng
- Đăng ký/Đăng nhập với email và mật khẩu
- Đăng nhập với Google OAuth
- JWT-based authentication
- Quản lý phiên đăng nhập

### Phân tích giấc mơ
- Ghi lại chi tiết giấc mơ
- Phân tích giấc mơ sử dụng AI
- Lưu trữ lịch sử giấc mơ
- Xem lại các giấc mơ đã phân tích

### Tạo hình ảnh
- Tạo hình ảnh minh họa cho giấc mơ
- Sử dụng AI để tạo hình ảnh từ mô tả
- Lưu trữ và quản lý hình ảnh

### Giao diện
- Responsive design cho mọi thiết bị
- Dark mode với hiệu ứng gradient đẹp mắt
- Animations và transitions mượt mà
- Particle effects trang trí

## Cài đặt

### Yêu cầu hệ thống
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+

### Backend Setup

1. Di chuyển vào thư mục backend:
```bash
cd backend
```

2. Tạo virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Cài đặt dependencies:
```bash
pip install -r requirements.txt
```

4. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

5. Cấu hình các biến môi trường trong `.env`:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/musemap

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Groq AI
GROQ_API_KEY=your-groq-api-key

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

6. Tạo database PostgreSQL:
```bash
createdb musemap
```

7. Chạy migrations (tables sẽ tự động tạo khi start app):
```bash
uvicorn main:app --reload
```

Backend sẽ chạy tại `http://localhost:8000`

### Frontend Setup

1. Di chuyển vào thư mục frontend:
```bash
cd frontend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` (nếu cần):
```env
VITE_API_URL=http://localhost:8000
```

4. Chạy development server:
```bash
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

## Cấu trúc thư mục

```
musemap/
├── backend/
│   ├── app/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   ├── config.py        # Configuration
│   │   ├── database.py      # Database setup
│   │   └── main.py          # FastAPI app
│   ├── venv/                # Virtual environment
│   ├── .env                 # Environment variables
│   ├── requirements.txt     # Python dependencies
│   └── main.py              # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── styles/          # Global styles
│   │   ├── utils/           # Utilities
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   ├── package.json         # NPM dependencies
│   └── vite.config.js       # Vite configuration
│
└── README.md                # This file
```

## API Documentation

Sau khi khởi động backend, truy cập:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Các API Endpoints chính

### Authentication
- `POST /api/auth/register` - Đăng ký người dùng mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/google/login` - Đăng nhập với Google
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Dreams
- `POST /api/dreams` - Tạo dream session mới
- `GET /api/dreams` - Lấy danh sách dreams
- `GET /api/dreams/{id}` - Lấy chi tiết dream
- `DELETE /api/dreams/{id}` - Xóa dream

### Images
- `POST /api/images/generate` - Tạo hình ảnh từ mô tả
- `GET /api/images/{id}` - Lấy hình ảnh

### Health
- `GET /api/health` - Kiểm tra trạng thái server

## Development

### Frontend Development
```bash
cd frontend
npm run dev
```

### Backend Development
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn main:app --reload
```

### Build Production

#### Frontend
```bash
cd frontend
npm run build
```

Build output sẽ ở trong thư mục `frontend/dist`

#### Backend
Backend sử dụng Python, không cần build. Chạy production:
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Testing

### Frontend
```bash
cd frontend
npm run lint
```

## Deployment

### Frontend (Vercel)
1. Push code lên GitHub
2. Import project vào Vercel
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Backend
Backend có thể deploy lên:
- Railway
- Render
- Google Cloud Run
- AWS EC2/ECS
- DigitalOcean

Đảm bảo cấu hình đúng biến môi trường trên nền tảng deployment.

## Troubleshooting

### Database Connection Error
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra DATABASE_URL trong .env
- Đảm bảo database đã được tạo

### CORS Error
- Kiểm tra CORS_ORIGINS trong backend/.env
- Đảm bảo frontend URL được thêm vào CORS_ORIGINS

### OAuth Error
- Kiểm tra Google Client ID và Secret
- Đảm bảo redirect URI đã được cấu hình trong Google Console

## Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

Project này được phát hành dưới MIT License.

## Liên hệ

Nếu có bất kỳ câu hỏi nào, vui lòng tạo issue trên GitHub repository.

---

Phát triển với ❤️ bởi Thanhbi2906 
