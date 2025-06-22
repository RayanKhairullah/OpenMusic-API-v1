````markdown
# 🎵 OpenMusic API - Versi 1

---

## 📚 Daftar Isi

- [Fitur](#fitur)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Prasyarat](#prasyarat)
- [Persiapan Proyek](#persiapan-proyek)
  - [Kloning Repositori](#kloning-repositori)
  - [Instalasi Dependensi](#instalasi-dependensi)
  - [Konfigurasi Environment Variables](#konfigurasi-environment-variables)
  - [Penyiapan Database PostgreSQL](#penyiapan-database-postgresql)
  - [Menjalankan Migrasi Database](#menjalankan-migrasi-database)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Proyek](#struktur-proyek)
- [Dokumentasi API Endpoints](#dokumentasi-api-endpoints)
- [Penanganan Error](#penanganan-error)
- [Linter dan Konsistensi Kode](#linter-dan-konsistensi-kode)
- [Tips Pengembangan](#tips-pengembangan)

---

## ✨ Fitur

- **Album**
  - Tambah, lihat, ubah, dan hapus album.
  - Lihat daftar lagu dalam album.
- **Lagu**
  - Tambah, lihat semua, cari, ubah, dan hapus lagu.
- **Validasi dan Penanganan Error**
  - Validasi skema dengan Joi.
  - Global error handling.
- **Persistent Storage**
  - PostgreSQL dengan migrasi menggunakan `node-pg-migrate`.

---

## 🛠 Teknologi yang Digunakan

- `Node.js`
- `Hapi.js`
- `PostgreSQL`
- `pg`
- `node-pg-migrate`
- `dotenv`
- `joi`
- `nanoid`
- `auto-bind`
- `eslint` (`airbnb-base`)

---

## ⚙️ Prasyarat

- Node.js ≥ v16
- npm
- PostgreSQL

---

## 🚀 Persiapan Proyek

### 🔁 Kloning Repositori

```bash
git clone https://github.com/RayanKhairullah/OpenMusic-API-v1.git
cd OpenMusic-API-v1
````

### 📦 Instalasi Dependensi

```bash
npm install
```

### ⚙️ Konfigurasi Environment Variables

Buat file `.env`:

```env
HOST=localhost
PORT=5000

PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=openmusic
PGHOST=localhost
PGPORT=5432

ACCESS_TOKEN_KEY=your_super_secret_access_key_here_make_it_long_and_random
REFRESH_TOKEN_KEY=your_another_super_secret_refresh_key_here_also_long_and_random
ACCESS_TOKEN_AGE=1800
REFRESH_TOKEN_AGE=2592000
```

> 🛑 Jangan upload file `.env` ke GitHub. Tambahkan `.env` ke `.gitignore`.

### 🧱 Penyiapan Database PostgreSQL

```sql
CREATE DATABASE openmusic;
```

### 🧬 Menjalankan Migrasi Database

```bash
npm run migrate up
```

---

## ▶️ Menjalankan Aplikasi

### Mode Produksi

```bash
npm run start
```

### (Opsional) Mode Development

```bash
npm run start:dev
```

API tersedia di `http://localhost:5000`

---

## 🧱 Struktur Proyek

```
OpenMusic-API-v1/
├── src/
│   ├── api/                # Berisi modul Hapi untuk setiap fitur (albums, songs)
│   │   ├── albums/
│   │   │   ├── handler.js  # Logika bisnis untuk setiap endpoint
│   │   │   ├── index.js    # Plugin Hapi untuk modul albums
│   │   │   ├── routes.js   # Definisi rute Hapi
│   │   └── songs/          # Struktur serupa untuk fitur songs
│   │   └── authentications/          # Struktur serupa untuk fitur songs
│   │   └── users/          # Struktur serupa untuk fitur songs
│   │   └── colaborations/          # Struktur serupa untuk fitur songs
│   │   └── playlists/          # Struktur serupa untuk fitur songs
│   ├── services/           # Logika interaksi dengan database
│   │   ├── postgres/
│   │   │   ├── AlbumsService.js # Kelas service untuk Albums
│   │   │   └── SongsService.js  # Kelas service untuk Songs
│   │   │   ├── AuthenticationsService.js # Kelas service untuk authentications
│   │   │   └── CollaborationsService.js  # Kelas service untuk collborations
│   │   │   ├── UsersService.js # Kelas service untuk users
│   │   │   └── PlaylistsService.js  # Kelas service untuk playlists
│   ├── utils/              # Fungsi-fungsi utility, seperti mapping data dari DB ke model
│   │   └── index.js
│   ├── exceptions/         # Custom error classes (ClientError, NotFoundError, dll.)
│   │   ├── ClientError.js
│   │   ├── InvariantError.js
│   │   ├── NotFoundError.js
│   │   └── ValidationError.js
│   │   ├── AuthenticationError.js
│   │   └── AuthorizationError.js
│   ├── server.js           # Titik masuk utama aplikasi (setup server Hapi)
│   └── validator/          # Skema Joi untuk validasi
│       ├── albums/
│       │   └── schema.js
│       │   └── index.js
│       └── songs/
        │    └── schema.js
        │    └── index.js
        ├── users/
        │   └── schema.js
        │   └── index.js
        └── authentications/
        │   └── schema.js
        │   └── index.js
        ├── playlists/
        │   └── schema.js
        │   └── index.js
        └── collaborations/
            └── schema.js
            └── index.js
├── migrations/             # File migrasi database node-pg-migrate
├── .env                    # Environment variables (private)
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── .eslintignore              # Konfigurasi ESLint
└── eslint.config.mjs          # Konfigurasi ESLint
```

---

## 📡 Dokumentasi API Endpoints

### 📁 Gunakan file Collections dan Environtment postman untuk Test API
* ./OpenMusicAPIV1PostmanTest/Open.....json

---

## 🧹 Linter dan Konsistensi Kode

* Menggunakan ESLint (`airbnb-base`)
* Jalankan:

```bash
npm run lint
```

---