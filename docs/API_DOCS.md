# 📡 Dokumentasi API

**Base URL:**
- Local: `http://localhost:3000/api`
- Production: `https://domain-kalian.vercel.app/api`

## 1. Autentikasi (`/auth`)

### Register User
Mendaftarkan pengguna baru ke database.

- **URL:** `/auth/register`
- **Method:** `POST`
- **Body (JSON):**
  ```json
  {
    "name": "Yohanan",
    "email": "yohanan@mail.com",
    "password": "password123"
  }