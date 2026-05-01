require('dotenv').config();
const mongoose = require('mongoose');
const Note = require('./models/Note');

const dummyNotes = [
  {
    title: "Visi Strategis 2026: Transformasi Digital",
    content: "Rencana jangka panjang untuk mengintegrasikan AI ke dalam seluruh alur kerja tim. Fokus utama ada pada otomatisasi entri data dan analisis sentimen pelanggan secara real-time. Kita perlu memastikan bahwa infrastruktur cloud kita siap menangani lonjakan data yang signifikan. Selain itu, pelatihan internal bagi staf sangat krusial agar mereka tidak merasa terancam oleh teknologi baru ini, melainkan melihatnya sebagai alat bantu yang meningkatkan produktivitas mereka hingga 300%. Evaluasi akan dilakukan setiap kuartal dengan metrik KPI yang ketat.",
    isPinned: true
  },
  {
    title: "Review Buku: Atomic Habits - James Clear",
    content: "James Clear menekankan bahwa perubahan besar berawal dari kebiasaan kecil yang konsisten. Konsep 1% lebih baik setiap hari jika dilakukan selama satu tahun akan menghasilkan pertumbuhan 37 kali lipat. Buku ini sangat relevan untuk pengembangan diri di dunia kerja yang kompetitif. Saya harus mulai menerapkan 'Habit Stacking' untuk rutinitas pagi saya, seperti membaca 10 halaman buku segera setelah minum kopi pertama. Fokus pada sistem, bukan hanya tujuan akhir, adalah kunci keberlanjutan motivasi jangka panjang.",
    isPinned: false
  },
  {
    title: "Catatan Kuliah: Normalisasi Database (1NF - 3NF)",
    content: "Pelajaran hari ini membahas tentang pentingnya struktur data yang efisien. 1NF mengharuskan setiap kolom berisi nilai atomik. 2NF menghilangkan redundansi parsial dengan memastikan semua atribut non-key bergantung penuh pada primary key. 3NF melangkah lebih jauh dengan menghilangkan dependensi transitif. Tanpa normalisasi, kita berisiko menghadapi anomali insert, update, dan delete yang bisa merusak integritas data di level produksi. Contoh kasus: tabel pesanan pelanggan yang dipisahkan dari detail produk untuk efisiensi penyimpanan.",
    isPinned: true
  },
  {
    title: "Ide Startup: Eco-Track Mobile App",
    content: "Aplikasi yang membantu pengguna melacak jejak karbon harian mereka melalui integrasi API transportasi umum dan belanja online. Fitur unggulan: tantangan mingguan 'Zero Waste' dengan sistem reward berbasis poin yang bisa ditukar dengan diskon di toko ramah lingkungan. Target pasar utama adalah Gen Z dan Milenial yang peduli pada isu perubahan iklim. Model bisnis menggunakan sistem freemium dengan fitur analitik mendalam bagi pengguna berlangganan. Potensi kemitraan dengan pemerintah kota untuk promosi penggunaan sepeda dan jalan kaki.",
    isPinned: false
  },
  {
    title: "Resep Rahasia: Nasi Goreng Gila Level 10",
    content: "Bahan-bahan: Nasi putih dingin (penting agar tidak lembek), bumbu halus (bawang merah, bawang putih, cabai rawit setan, kemiri), kecap manis premium, saus tiram, minyak wijen, dan topping melimpah (bakso, sosis, telur orek, ayam suwir). Rahasianya ada pada api besar (wok hei) saat menumis bumbu agar aromanya keluar maksimal. Tambahkan sedikit kaldu jamur untuk rasa gurih yang mendalam. Sajikan dengan kerupuk udang dan acar timun segar. Jangan lupa taburan bawang goreng yang banyak di atasnya untuk tekstur crunchy.",
    isPinned: false
  },
  {
    title: "Analisis Pasar Saham: Sektor Teknologi Q4",
    content: "Sektor teknologi menunjukkan tren bullish berkat inovasi di bidang semikonduktor. Perusahaan besar mulai melaporkan pertumbuhan pendapatan di atas ekspektasi analis. Namun, perlu waspada terhadap kebijakan suku bunga bank sentral yang mungkin berubah di awal tahun depan. Rekomendasi: 'Hold' untuk saham blue chip dan 'Buy on Weakness' untuk perusahaan growth yang memiliki fundamental kuat. Diversifikasi ke sektor energi terbarukan juga disarankan sebagai lindung nilai terhadap volatilitas pasar global yang dipicu oleh ketegangan geopolitik.",
    isPinned: false
  },
  {
    title: "Daftar Keinginan Perjalanan (Bucket List)",
    content: "1. Melihat Northern Lights di Islandia saat musim dingin. 2. Trekking ke Machu Picchu di Peru untuk mempelajari sejarah suku Inca. 3. Menikmati sushi segar di pasar Tsukiji, Tokyo. 4. Menjelajahi keindahan arsitektur di Florence, Italia. 5. Safari di Taman Nasional Serengeti untuk melihat migrasi besar hewan liar. Setiap perjalanan harus didokumentasikan dengan kamera mirrorless dan jurnal fisik. Anggaran harus disiapkan minimal satu tahun sebelumnya dengan menabung secara otomatis tiap bulan.",
    isPinned: false
  },
  {
    title: "Protokol Keamanan Data Perusahaan",
    content: "Setiap karyawan wajib menggunakan autentikasi dua faktor (2FA) di semua akun kerja. Password harus diganti setiap 90 hari dengan kombinasi minimal 12 karakter (huruf besar, angka, simbol). Jangan pernah mengunduh lampiran dari email yang tidak dikenal. Akses fisik ke ruang server hanya diberikan kepada tim IT senior. Enkripsi data harus aktif baik saat data disimpan (at rest) maupun saat dikirim (in transit). Audit keamanan akan dilakukan secara berkala oleh pihak ketiga untuk memastikan kepatuhan terhadap standar internasional ISO 27001.",
    isPinned: false
  },
  {
    title: "Refleksi Akhir Tahun: Pelajaran Berharga",
    content: "Tahun ini mengajarkan saya bahwa kesehatan mental sama pentingnya dengan pencapaian karier. Terlalu sering saya mengabaikan waktu istirahat demi mengejar deadline. Tahun depan, saya berkomitmen untuk memiliki batasan yang lebih jelas antara pekerjaan dan kehidupan pribadi. Belajar berkata 'tidak' pada proyek yang melebihi kapasitas saya adalah langkah pertama yang besar. Saya juga bersyukur atas dukungan keluarga dan teman-teman yang selalu ada di saat-saat sulit. Fokus saya selanjutnya adalah keseimbangan dan pertumbuhan yang berkelanjutan.",
    isPinned: false
  },
  {
    title: "Tips Produktivitas: Teknik Pomodoro",
    content: "Bekerja selama 25 menit dengan fokus penuh, diikuti istirahat singkat selama 5 menit. Setelah empat sesi, ambil istirahat panjang sekitar 15-30 menit. Teknik ini sangat efektif untuk melawan prokrastinasi dan menjaga kesegaran otak. Selama sesi fokus, jauhkan smartphone dan tutup tab browser yang tidak relevan. Gunakan aplikasi timer atau ekstensi browser untuk melacak waktu. Saya mendapati bahwa teknik ini membantu saya menyelesaikan tugas-tugas administratif yang membosankan jauh lebih cepat daripada metode kerja maraton tradisional.",
    isPinned: false
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");
    
    await Note.deleteMany({});
    console.log("Existing notes cleared.");
    
    await Note.insertMany(dummyNotes);
    console.log("10 Premium Long Notes added successfully!");
    
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

seedDB();
