# ANews Backend

Backend REST API untuk aplikasi **ANews** — platform berita digital yang menyajikan informasi seputar bencana alam dan isu lingkungan di Indonesia.

---

## Deskripsi

ANews Backend dibangun menggunakan **Express.js**, **TypeScript**, dan **MySQL** dengan **Drizzle ORM** sebagai query builder. Backend ini menyediakan REST API untuk menangani autentikasi pengguna, pengelolaan berita, kategori, dan upload gambar ke Cloudinary.

---

## Teknologi yang Digunakan

| Teknologi | Fungsi |
|-----------|--------|
| Node.js | Runtime JavaScript |
| Express.js | Framework web server |
| TypeScript | Bahasa pemrograman |
| MySQL | Database utama |
| Drizzle ORM | Query builder & ORM |
| Zod | Validasi input |
| JWT | Autentikasi |
| Bcrypt | Hash password |
| Multer | Upload file |
| Cloudinary | Penyimpanan gambar |

---

## Persyaratan Sistem

- Node.js versi 18 atau lebih baru
- MySQL versi 8 atau lebih baru
- Akun Cloudinary (gratis)
- npm atau yarn

---

## Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/RizkyChairi/ANews-Backend.git
cd ANews-Backend