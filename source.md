KALI INI TUJUANNYA:
Memahami Message Broker, Mengimplementasikan RabbitMQ sebagai Message Broker ke Proyek Back-End, Menulis dan Membaca Berkas pada Storage Lokal, Melayani Permintaan Menggunakan Berkas Statis di Hapi, Memahami Konsep Cache, Mengetahui Cara Memasang Redis secara Lokal dan Menggunakan Redis untuk Caching Pada RESTful Api.

Studi Kasus Proyek OpenMusic API versi 3:
Semenjak dirilisnya OpenMusic versi 2, pengguna OpenMusic semakin membludak. Mereka sangat antusias akan kehadiran platform pemutar musik gratis. Kehadiran fitur playlist membuat mereka nyaman menggunakan OpenMusic. Bahkan, mereka tidak segan untuk membagikan dan merekomendasikan OpenMusic hingga akhirnya melejit!
Karena pengguna OpenMusic semakin banyak, server kita seringkali mengalami down. Terutama pada server database yang selalu bekerja keras dalam menangani permintaan kueri playlist dari ribuan pengguna. Hingga akhirnya tim TSC memutuskan untuk menerapkan server-side caching pada OpenMusic API untuk mengurangi pekerjaan database.
Pengembangan OpenMusic versi 3 segera tiba dan ini adalah kontribusi terakhir Anda pada platform OpenMusic. Tim TSC kembali melakukan survey fitur apa yang hendak dibawa pada versi ke-3 ini. Hasilnya menunjukkan pengguna menginginkan fitur ekspor daftar lagu yang berada di playlist. Selain itu, mereka juga menginginkan hadirnya fitur upload gambar untuk sampul album.
Tugas terakhir Anda adalah mengembangkan OpenMusic API versi 3 dengan menerapkan server-side caching, fitur ekspor serta upload gambar sesuai spesifikasi yang dijelaskan di materi selanjutnya.


kita harus tau terlebih dahulu, kreteria yang harus kita penuhi. berikut 5 kreteria WAJIB yang harus kita penuhi!!
Kriteria 1 : Ekspor Lagu Pada Playlist
API yang Anda buat harus tersedia fitur ekspor lagu pada playlist melalui route:

Method : POST
URL : /export/playlists/{playlistId}
Body Request:

{
    "targetEmail": string
}
Ketentuan:

Wajib menggunakan message broker dengan menggunakan RabbitMQ.
Nilai host server RabbitMQ wajib menggunakan environment variable RABBITMQ_SERVER
Hanya pemilik Playlist yang boleh mengekspor lagu.
Data yang dikirimkan dari program producer ke program consumer hanya PlaylistId dan targetEmail.
Wajib mengirimkan program consumer.
Hasil ekspor berupa data json.
Dikirimkan melalui email menggunakan nodemailer.
Kredensial user dan password email pengirim wajib menggunakan environment variable SMTP_USER dan SMTP_PASSWORD.
Serta, nilai host dan port dari server SMTP juga wajib menggunakan environment variable SMTP_HOST dan SMTP_PORT.
Response yang harus dikembalikan:

Status Code: 201
Response Body:

{
    "status": "success",
    "message": "Permintaan Anda sedang kami proses",
}
Struktur data JSON yang diekspor adalah seperti ini:

{
  "playlist": {
    "id": "playlist-Mk8AnmCp210PwT6B",
    "name": "My Favorite Coldplay Song",
    "songs": [
      {
        "id": "song-Qbax5Oy7L8WKf74l",
        "title": "Life in Technicolor",
        "performer": "Coldplay"
      },
      {
        "id": "song-poax5Oy7L8WKllqw",
        "title": "Centimeteries of London",
        "performer": "Coldplay"
      },
      {
        "id": "song-Qalokam7L8WKf74l",
        "title": "Lost!",
        "performer": "Coldplay"
      }
    ]
  }
}


Kriteria 2 : Mengunggah Sampul Album
API yang Anda buat harus dapat mengunggah sampul album melalui route:

Method : POST
URL : /albums/{id}/covers
Body Request (Form data):
{
    "cover": file
}
Ketentuan:

Tipe konten yang diunggah harus merupakan MIME types dari images.
Ukuran file cover maksimal 512000 Bytes.
Anda bisa menggunakan File System (lokal) atau S3 Bucket dalam menampung object.
Ketika menggunakan S3 Bucket, nama bucket wajib menggunakan variable environment AWS_BUCKET_NAME dan nama variable environment untuk region adalah AWS_REGION.
Selain itu, untuk kredensial AWS wajib menggunakan variable environment AWS_ACCESS_KEY_ID dan AWS_SECRET_ACCESS_KEY.
Response yang harus dikembalikan:

Status Code: 201
Response Body:
{
    "status": "success",
    "message": "Sampul berhasil diunggah"
}
Respons dari endpoint GET /albums/{id} harus menampilkan properti coverUrl. Itu berarti, alamat atau nama sampul album harus disimpan di dalam database. Berikut respons yang harus dikembalikan oleh endpoint GET /albums/{id}:

{
  "status": "success",
  "data": {
    "album": {
      "id": "album-Mk8AnmCp210PwT6B",
      "name": "Viva la Vida",
      "coverUrl": "http://...."
    }
  }
}
Ketentuan:

URL gambar harus dapat diakses dengan baik.
Bila album belum memiliki sampul, maka coverUrl bernilai null.
Bila menambahkan sampul pada album yang sudah memiliki sampul, maka sampul lama akan tergantikan.



Kriteria 3 : Menyukai Album
API harus memiliki fitur menyukai, batal menyukai, serta melihat jumlah yang menyukai album. Berikut spesifikasinya:

Endpoint
POST /albums/{id}/likes
DELETE /albums/{id}/likes
GET /albums/{id}/likes
Body Request
Response
status code: 201
body:
status: "success"
message: *any
status code: 200
body:
status: "success"
message: *any
status code: 200
body:
data:
status: "success"
likes: number
Keterangan
Menyukai album.
Batal menyukai album.
Melihat jumlah yang menyukai album. 
*any merupakan nilai string apa pun selama nilainya tidak kosong

Keterangan:

Menyukai atau batal menyukai album merupakan resource strict sehingga dibutuhkan autentikasi untuk mengaksesnya. Hal ini bertujuan untuk mengetahui apakah pengguna sudah menyukai album.
Pastikan pengguna hanya bisa menyukai album yang sama sebanyak 1 kali. Kembalikan dengan response code 400 jika pengguna mencoba menyukai album yang sama.

Kriteria 4 : Menerapkan Server-Side Cache
Menerapkan server-side cache pada jumlah yang menyukai sebuah album (GET /albums/{id}/likes).
Cache harus bertahan selama 30 menit.
Respons yang dihasilkan dari cache harus memiliki custom header properti X-Data-Source bernilai “cache”.
Cache harus dihapus setiap kali ada perubahan jumlah like pada album dengan id tertentu.
Memory caching engine wajib menggunakan Redis atau Memurai (Windows).
Nilai host server Redis wajib menggunakan environment variable REDIS_SERVER

Kriteria 5 : Pertahankan Fitur OpenMusic API versi 2 dan 1
Pastikan fitur dan kriteria OpenMusic API versi 2 dan 1 tetap dipertahankan seperti:

Pengelolaan Data Album
Pengelolaan Data Song
Fitur Registrasi dan Autentikasi Pengguna
Pengelolaan Data Playlist 
Menerapkan Foreign Key
Menerapkan Data Validation
Penanganan Eror (Error Handling)


jangan sampai lupa, ini struktur OpenMusic sekarang:
```
OpenMusic-API/
├── src/
│   ├── api/                # Berisi modul Hapi untuk setiap fitur
│   │   ├── albums/
│   │   │   ├── handler.js  # Logika bisnis untuk setiap endpoint
│   │   │   ├── index.js    # Plugin Hapi untuk modul albums
│   │   │   ├── routes.js   # Definisi rute Hapi
│   │   │   ├── likes/
│   │   │       ├── handler.js  # Logika bisnis untuk setiap endpoint
│   │   │       ├── index.js    # Plugin Hapi untuk modul albums
│   │   │       ├── routes.js   # Definisi rute Hapi
│   │   ├── songs/
│   │   │   ├── handler.js  # Logika bisnis untuk setiap endpoint
│   │   │   ├── index.js    # Plugin Hapi untuk modul albums
│   │   │   ├── routes.js   # Definisi rute Hapi
│   │   └── authentications/          # Struktur serupa dengan fitur songs
│   │   └── users/          # Struktur serupa dengan fitur songs
│   │   └── colaborations/          # Struktur serupa dengan fitur songs
│   │   └── playlists/          # Struktur serupa dengan fitur songs
│   │   └── exports/          # Struktur serupa dengan fitur songs
│   ├── services/           # Logika interaksi dengan database
│   │   ├── postgres/
│   │   │   ├── AlbumsLikesService.js # Kelas service untuk Likes Albums
│   │   │   ├── AlbumsService.js # Kelas service untuk Albums
│   │   │   └── SongsService.js  # Kelas service untuk Songs
│   │   │   ├── AuthenticationsService.js # Kelas service untuk authentications
│   │   │   └── CollaborationsService.js  # Kelas service untuk collborations
│   │   │   ├── UsersService.js # Kelas service untuk users
│   │   │   └── PlaylistsService.js  # Kelas service untuk playlists
│   │   ├── queue/
│   │   │   ├── consumer.js
│   │   ├── mailer/
│   │   │   ├── MailSender.js
│   │   ├── rabbitmq/
│   │   │   ├── producer.js
│   │   ├── redis/
│   │   │   ├── CahceService.js
│   ├── utils/              # Fungsi-fungsi utility, seperti mapping data dari DB ke model
│   │   └── index.js
│   │   └── config.js
│   ├── public/              # Fungsi-fungsi utility, seperti mapping data dari DB ke model
│   │   └── images/
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
        │   └── schema.js
        │   └── index.js
        └── exports/
            └── schema.js
            └── index.js
├── migrations/             # File migrasi database node-pg-migrate
├── .env                    # Environment variables (private)
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── .eslintignore              # Konfigurasi ESLint
└── .eslintrc.cjs          # Konfigurasi ESLint
```


Struktur TABLE DATABASE DAN RELASINYA, mungkin kamu lupa:
table songs:
id(PK), title, year, performer,genre, duration, album_id(FK).

table albums: 
id(PK), name, year, cover

table playlists:
id(PK), name, owner(FK)

table playlist_songs:
id (PK), playlist_id(FK), song_id (FK)

table playlist_song_activities:
id (PK), playlist_id(FK), song_id, user_id, action, time

table collaborations:
id (PK), playlist_id(FK), user_id(FK)

table users:
id (PK), username, password, fullname

table authentications:
id (PK), token

table user_album_likes:
id(PK), user_id(FK), album_id(FK) 


TIPS DAN TRIK:
Kerjakanlah proyek fitur demi fitur, agar Anda mudah dalam menjalankan pengujiannya.
Jika merasa seluruh fitur yang dibangun sudah benar namun pengujiannya selalu gagal, kemungkinan database Anda kotor dengan data pengujian yang Anda lakukan sebelum-sebelumnya, dan itu bisa menjadi salah satu penyebab pengujian selalu gagal. Solusinya, silakan hapus seluruh data pada tabel melalui psql dengan perintah:

truncate albums, songs, users, authentications, playlists, playlistsongs, playlist_song_activities, collaborations, user_album_likes;


Buat objek khusus untuk menampung seluruh konfigurasi yang digunakan oleh service eksternal
Di submission ke-3 Anda akan banyak menggunakan service eksternal seperti database, storage, message broker, dan redis. Kebanyakan service eksternal tersebut membutuhkan konfigurasi kredensial agar dapat diakses.

Alih-alih menuliskan langsung process.env pada berkas service terkait, kami merekomendasikan Anda untuk menyediakan objek khusus untuk menampung konfigurasi yang dibutuhkan oleh service external. Kami biasa sebut objek tersebut dengan nama config seperti ini.

// utils/config.js
 
const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  s3: {
    bucketName: process.env.AWS_BUCKET_NAME,
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER,
  },
  redis: {
    host: process.env.REDIS_SERVER,
  },
}
 
module.exports = config;
Lalu pada service, manfaatkan objek config untuk mendapatkan nilai konfigurasi yang Anda inginkan. Berikut contoh pada service redis.

const redis = require('redis');
const config = require('../../utils/config.js')
 
class CacheService {
  constructor() {
    this._client = redis.createClient({
      host: config.redis.host,
    });
 
    // … kode lain disembunyikan
  }
 
  // … kode lain disembunyikan
}
 
module.exports = CacheService;
Dengan menyimpan konfigurasi environment di dalam satu wadah khusus, ini akan memudahkan Anda untuk mengecek nilai variabel environment apa saja yang dibutuhkan untuk menjalankan aplikasi.


Meminimalisir boilerplate code pada handler dengan memanfaatkan onPreResponse event extensions
Alih-alih melakukan eror handling berulang pada setiap method handler contohnya seperti ini.

class NotesHandler {
  constructor(service, validator) {
    // ... kode constructor disembunyikan
  }

  async postNoteHandler(request, h) {
    try {
      // ... do post note handling
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getNoteByIdHandler(request, h) {
    try {
      // ... do get note by id handling
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async putNoteByIdHandler(request, h) {
    try {
      // ... do edit note by id handling
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  // ... etc
}

module.exports = NotesHandler;
Anda bisa memanfaatkan event extensions onPreResponse yang disediakan oleh Hapi untuk mengintervensi response gagal sebelum ditampilkan ke user seperti ini. Anda bisa mengimplementasi event extensions tersebut ketika membuat HTTP server seperti ini.

const init = async () => {
  const notesService = new NotesService();
  const server = Hapi.server({
   // ... server configuration
  });

  // ... other configuration

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    if (response instanceof Error) {
 
      // penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue;
      }

      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });


  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};
Dengan begitu di dalam method handler, Anda bisa fokus terhadap alur logika kode tanpa perlu menuliskan eror handling yang berulang di sana.

class NotesHandler {
  constructor(service, validator) {
    // ... kode constructor disembunyikan
  }
 
  async postNoteHandler(request, h) {
    this._validator.validateNotePayload(request.payload);
    const { title = 'untitled', body, tags } = request.payload;
 
    const noteId = await this._service.addNote({ title, body, tags });
 
    const response = h.response({
      status: 'success',
      message: 'Catatan berhasil ditambahkan',
      data: {
        noteId,
      },
    });
 
    response.code(201);
    return response;
  }
 
  async getNoteByIdHandler(request, h) {
    const { id } = request.params;
    const note = await this._service.getNoteById(id);
    return {
      status: 'success',
      data: {
        note,
      },
    };
  }
 
  async putNoteByIdHandler(request, h) {
    this._validator.validateNotePayload(request.payload);
    const { id } = request.params;
 
    await this._service.editNoteById(id, request.payload);
 
    return {
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    };
  }
 
  async deleteNoteByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteNoteById(id);
 
    return {
      status: 'success',
      message: 'Catatan berhasil dihapus',
    };
  }
}
Simak penjelasan lebih lengkap mengenai function extensions dari dokumentasi yang disediakan Hapi: server extensions method options.


Hindari kesalahan lupa binding dengan arrow function atau package auto-bind
Mendapati eror yang disebabkan oleh lupa mem-binding nilai this pada method adalah hal yang menjengkelkan. Di sini kami memberi dua tips agar Anda terhindar dari kesalahan tersebut. Cara yang pertama adalah dengan memanfaatkan arrow function pada routes ketika mendefinisikan handler seperti ini.

const routes = (handler) => [
  {
    method: 'POST',
    path: '/notes',
    handler: (request, h) => handler.postNoteHandler(request, h),
  },
  {
    method: 'GET',
    path: '/notes',
    handler: () => handler.getNotesHandler(),
  },
  {
    method: 'GET',
    path: '/notes/{id}',
    handler: (request, h) => handler.getNoteByIdHandler(request, h),
  },
  {
    method: 'PUT',
    path: '/notes/{id}',
    handler: (request, h) => handler.putNoteByIdHandler(request, h),
  },
  {
    method: 'DELETE',
    path: '/notes/{id}',
    handler: (request, h) => handler.deleteNoteByIdHandler(request, h),
  },
];
Dengan memanfaatkan arrow function seperti di atas, konteks this pada objek handler akan terjaga. Sehingga pada constructor NotesHandler, Anda tidak perlu melakukan satu per satu pada untuk tiap methodnya.

Cara yang kedua adalah dengan memanfaatkan package auto-bind. Anda bisa memasang package tersebut dengan menggunakan NPM.

npm i auto-bind@4
Kemudian gunakan fungsi autoBind dari package auto-bind di dalam constructor NotesHandler untuk mem-binding seluruh method sekaligus. Contohnya seperti ini.

const autoBind = require('auto-bind');
 
class NotesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
 
    autoBind(this); // mem-bind nilai this untuk seluruh method sekaligus
  }
 
  // ... all method handler
}
Dengan begitu Anda tidak perlu repot mem-bind methodnya satu per satu atau lupa mem-bind bila ada method baru yang dibuat.
