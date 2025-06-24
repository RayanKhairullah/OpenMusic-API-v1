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
  - [⚠️ Install Broker dan Cache Service](#️install-broker-dan-cache-service)
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
  - Upload cover album (gambar).
  - Suka/Batal suka album.
- **Lagu**
  - Tambah, lihat semua, cari, ubah, dan hapus lagu.
- **Autentikasi & Otorisasi**
  - JWT-based authentication
  - Role-based untuk fitur tertentu (seperti playlist & kolaborasi)
- **Ekspor**
  - Ekspor playlist ke email menggunakan RabbitMQ dan Mailer
- **Cache**
  - Jumlah like album disimpan di Redis cache
- **Validasi dan Penanganan Error**
  - Validasi skema dengan Joi.
  - Global error handling dengan Boom dan custom error class.

---

## 🛠 Teknologi yang Digunakan

- `Node.js`
- `Hapi.js`
- `PostgreSQL`
- `Redis`
- `RabbitMQ + Erlang`
- `pg`
- `node-pg-migrate`
- `dotenv`
- `joi`
- `nanoid`
- `amqplib`
- `nodemailer`
- `auto-bind`
- `eslint` (`airbnb-base`)

---

## ⚙️ Prasyarat

- Node.js ≥ v16
- npm
- PostgreSQL
- ✅ **Wajib Install:**
  - [Erlang](https://www.erlang.org/downloads)
  - [RabbitMQ](https://www.rabbitmq.com/download.html)
  - [Redis](https://redis.io/download/)

> 🛑 Tanpa Redis dan RabbitMQ, fitur **ekspor playlist** dan **like album caching** tidak akan berfungsi!

---

## 🚀 Persiapan Proyek

### 🔁 Kloning Repositori

```bash
git clone https://github.com/RayanKhairullah/OpenMusic-API-v1.git
cd OpenMusic-API-v1
```

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

REDIS_SERVER=redis://localhost:6379
```

> 🛑 Jangan upload file `.env` ke GitHub. Tambahkan `.env` ke `.gitignore`.

### 🧱 Penyiapan Database PostgreSQL

```sql
CREATE DATABASE openmusic;
```

### 🧬 Menjalankan Migrasi Database

```bash
npm run migrate:up
```

### ⚠️ Install Broker dan Cache Service

- ✅ Install **Erlang + RabbitMQ**:
  - [RabbitMQ Install Guide](https://www.rabbitmq.com/download.html)
  - Jalankan RabbitMQ service sebelum `consumer.js`
- ✅ Install **Redis**:
  - [Redis Install Guide](https://redis.io/docs/getting-started/installation/)
  - Redis harus running di `localhost:6379`

---

## ▶️ Menjalankan Aplikasi

### Mode Produksi

```bash
npm run start
```

### Mode Development

```bash
npm run start:dev
```

### Worker untuk Ekspor (RabbitMQ Consumer)

```bash
npm run consumer
```

API tersedia di `http://localhost:5000`

---

## 🧱 Struktur Proyek

_(struktur seperti sebelumnya tidak berubah, bagian ini bisa tetap)_

---

## 📡 Dokumentasi API Endpoints

### 📁 Gunakan file Collections dan Environment Postman untuk Test API
* ./OpenMusicAPIVPostmanTest/Open.....json

---

## 🧹 Linter dan Konsistensi Kode

* Menggunakan ESLint (`airbnb-base`)
* Jalankan:

```bash
npm run lint
```

---

## 🛠 Script Tambahan

```bash
npm run migrate:reset   # Drop semua tabel (migrate down all)
npm run migrate:up      # Buat ulang semua tabel (migrate up all)
npm run consumer        # Jalankan RabbitMQ consumer
```

---

## 💬 Keep

> Always test with Postman, monitor Redis & RabbitMQ services, and keep `.env` secrets **safe**.

---