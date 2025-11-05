# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MuseMap/DreamLens** - AI-powered text-to-image generation platform with user authentication. Users can register/login (local or Google OAuth), generate images from text prompts using Stable Diffusion via Hugging Face API, and view their generation history.

**Architecture**: Separated frontend/backend monorepo
- Frontend: React + Vite SPA
- Backend: FastAPI (async Python)
- Database: PostgreSQL with async SQLAlchemy

## Essential Commands

### Backend Development

```bash
# Setup
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Run development server
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# API documentation (when server is running)
# http://localhost:8000/docs (Swagger UI)
# http://localhost:8000/redoc (ReDoc)
```

**Database Setup**: See `backend/DATABASE_SETUP.md` for PostgreSQL configuration. Copy `.env.example` to `.env` and configure database credentials, SECRET_KEY, Google OAuth credentials, and HUGGINGFACE_TOKEN.

### Frontend Development

```bash
# Setup
cd frontend
npm install

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Lint
npm run lint

# Preview production build
npm run preview
```

## Architecture & Key Patterns

### Backend: Layered Architecture

**Request Flow**: `Client → Route → Service → Database`

```
app/
├── routes/          # FastAPI endpoints (thin controllers)
├── services/        # Business logic layer
├── models/          # SQLAlchemy ORM models
├── schemas/         # Pydantic validation/serialization
├── utils/           # Security, dependencies (JWT, auth)
├── config.py        # Environment settings (Pydantic Settings)
├── database.py      # Async DB engine + session management
└── main.py          # FastAPI app, middleware, startup
```

**Key Conventions**:
- All database operations are async (`asyncpg` driver)
- Dependency injection for DB sessions: `db: AsyncSession = Depends(get_db)`
- Service layer pattern: business logic separated from routes
- Authentication via JWT Bearer tokens (30min expiry, no refresh)
- Passwords hashed with bcrypt via passlib

**Database Models**:
- `User` (users table): email, username, hashed_password (nullable for OAuth), google_id, auth_provider, is_active, is_verified
- `GeneratedImage` (generated_images table): user_id (FK), prompt, image_url (base64 data URL), model_name

**Authentication Flow**:
- Local: POST `/api/auth/register` or `/api/auth/login` → JWT token
- Google OAuth: GET `/api/auth/google/login` → redirect → callback → JWT token
- Protected routes use `Depends(get_current_active_user)` dependency

**Important**: Database tables auto-created on startup via `metadata.create_all()`. Alembic is installed but not currently used for migrations.

### Frontend: Component-Based with Context API

```
src/
├── components/      # UI components (Auth/, common/, Header/, Hero/, ImageGenerator/)
├── pages/           # Route pages (Home/, Generate/)
├── contexts/        # AuthContext (global auth state)
├── services/        # API clients (authService, imageService)
├── utils/api/       # Axios config with JWT interceptor
└── App.jsx          # Router + AuthProvider wrapper
```

**Key Conventions**:
- AuthContext provides: `user`, `loading`, `isAuthenticated`, `login()`, `register()`, `logout()`
- JWT stored in localStorage (`access_token`)
- Axios interceptor auto-adds Bearer token to requests
- Protected routes check `isAuthenticated` in useEffect, redirect to home if false
- Toast notifications (react-toastify) for user feedback
- Google OAuth callback handled by extracting `?token=` from URL on mount

**API Communication**:
- Base URL: `http://localhost:8000` (configured via `VITE_API_URL`)
- All requests use axios instance with interceptors
- 401 responses auto-clear token and redirect to home

## Critical Implementation Details

### Image Generation
- Backend uses Hugging Face Inference API (text-to-image)
- Current model: `stabilityai/stable-diffusion-xl-base-1.0` (Stable Diffusion XL)
- Provider: Nscale (free tier with monthly credits)
- Images returned as base64 data URLs and stored directly in database
- **Note**: This approach is not scalable for production (consider cloud storage like S3)
- **Alternative model**: `black-forest-labs/FLUX.1-dev` (higher quality but non-commercial license)

### OAuth Integration
- SessionMiddleware required for OAuth state management
- Session cookie: `musemap_session`, 30min timeout
- Only Google OAuth implemented (no Facebook, GitHub, etc.)

### Security
- Passwords never returned in API responses (UserResponse schema excludes them)
- `hashed_password` is nullable for OAuth users
- No rate limiting implemented
- No refresh token mechanism
- Token expiry: 30 minutes (hardcoded)

### CORS Configuration
- Allowed origins: `http://localhost:5173`, `http://localhost:3000`
- Credentials enabled for OAuth cookies

## Project State & Limitations

**Current Stage**: Development/MVP
- No Docker setup
- No CI/CD pipeline
- Base64 image storage (not production-ready)
- Auto-table creation (should use Alembic for production)
- No email verification flow (flag exists but unused)
- No real-time features (WebSockets)
- No rate limiting on API endpoints

## Environment Configuration

**Backend** (.env):
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=musemap
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
SECRET_KEY=your-secret-key
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
HUGGINGFACE_TOKEN=...
DEBUG=True
```

**Frontend** (.env):
```
VITE_API_URL=http://localhost:8000
```

## Testing

No test files currently exist in the codebase. To add tests:
- Backend: Use pytest with pytest-asyncio for async tests
- Frontend: Use Vitest (already configured with Vite)
