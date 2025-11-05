# PostgreSQL Database Setup Guide

## 📋 Yêu cầu
- PostgreSQL 12+ đã được cài đặt
- Python 3.8+

## 🚀 Các bước thiết lập

### 1. Tạo Database trong PostgreSQL

Mở PostgreSQL command line hoặc pgAdmin và chạy:

```sql
CREATE DATABASE musemap;
```

Hoặc sử dụng command line:
```bash
psql -U postgres
CREATE DATABASE musemap;
\q
```

### 2. Cấu hình File .env

Mở file `backend/.env` và điền thông tin database của bạn:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=musemap
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password_here  # Điền password PostgreSQL của bạn

DEBUG=True
SECRET_KEY=your-secret-key-here
```

**Lưu ý:** Thay thế `your_password_here` bằng mật khẩu PostgreSQL thực tế của bạn.

### 3. Khởi động Backend

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Khi khởi động, backend sẽ tự động:
- Tạo các bảng trong database
- Kết nối đến PostgreSQL
- Sẵn sàng nhận requests

### 4. Kiểm tra kết nối

Mở trình duyệt và truy cập:

- **Root endpoint:** http://localhost:8000/
- **Health check:** http://localhost:8000/health (kiểm tra database connection)
- **API Docs:** http://localhost:8000/docs (Swagger UI)

## 📊 Database Models

Hiện tại chưa có models nào. Bạn có thể thêm models của mình vào file `backend/models.py`

### Ví dụ tạo một Model:

```python
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

class YourModel(Base):
    __tablename__ = "your_table"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<YourModel(id={self.id}, name='{self.name}')>"
```

## 🛠️ Các packages đã cài đặt

- **SQLAlchemy**: ORM framework
- **asyncpg**: PostgreSQL async driver
- **psycopg2-binary**: PostgreSQL sync driver (backup)
- **alembic**: Database migration tool

## 🔧 Troubleshooting

### Lỗi: "FATAL: password authentication failed"
- Kiểm tra lại DATABASE_PASSWORD trong file .env
- Đảm bảo user PostgreSQL có quyền truy cập

### Lỗi: "database does not exist"
- Đảm bảo đã tạo database `musemap` trong PostgreSQL
- Chạy: `CREATE DATABASE musemap;` trong psql

### Lỗi: "could not connect to server"
- Kiểm tra PostgreSQL service đang chạy
- Kiểm tra DATABASE_HOST và DATABASE_PORT trong .env

## 📝 Các bước tiếp theo

1. Tạo API endpoints cho CRUD operations
2. Implement authentication (JWT tokens)
3. Thêm các models khác nếu cần
4. Setup Alembic cho database migrations
5. Thêm data validation với Pydantic schemas

## 🔗 Liên kết hữu ích

- FastAPI Docs: https://fastapi.tiangolo.com/
- SQLAlchemy Docs: https://docs.sqlalchemy.org/
- PostgreSQL Docs: https://www.postgresql.org/docs/
