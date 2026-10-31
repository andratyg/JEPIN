import Link from "next/link";

function ClipboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-sage">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-sage">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function PiggyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-sage">
      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2" />
      <path d="M2 9.5a1 1 0 0 0 1 1 5 5 0 0 0 4-2 1 1 0 0 0-1-1 5 5 0 0 0-4 2" />
      <circle cx="14.5" cy="10.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linen text-espresso flex flex-col font-sans">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-linen/90 backdrop-blur-md border-b border-espresso/10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-espresso text-linen flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              J
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl tracking-tight text-espresso leading-none">
                JEPIN
              </span>
              <span className="text-[11px] text-espresso-light font-medium tracking-tight">
                Jejak Pintar
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-espresso-light">
            <a href="#fitur" className="hover:text-espresso transition-colors">
              Fitur
            </a>
            <a href="#pilar" className="hover:text-espresso transition-colors">
              Metodologi
            </a>
            <Link
              href="/dashboard"
              className="hover:text-espresso transition-colors flex items-center gap-1.5"
            >
              <span>Katalog Pribadi</span>
              <span className="text-[10px] bg-sage/15 text-sage-deep px-1.5 py-0.5 rounded font-bold">
                App
              </span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-espresso hover:text-espresso-light transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-sage hover:bg-sage-deep text-white font-medium text-sm transition-colors shadow-xs"
            >
              Mulai Kurasi
            </Link>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="pt-20 pb-16 px-6 max-w-4xl mx-auto text-center">
        <p className="text-xs uppercase tracking-[0.25em] font-semibold text-espresso-light mb-4">
          Anti Zonk. Anti Impulsif. Anti Boros.
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-espresso leading-tight">
          JEPIN (Jejak Pintar)
        </h1>
        <p className="mt-4 font-serif italic text-base sm:text-lg text-sage-deep font-semibold">
          Smart Consumption &amp; Repurchase Tracker
        </p>
        <p className="mt-4 text-lg sm:text-xl text-espresso-light max-w-2xl mx-auto leading-relaxed">
          Kurasi konsumsi pribadi. Catat barang zonk, verifikasi yang layak beli ulang, dan selamatkan anggaran belanja mikro yang sia-sia.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-sage hover:bg-sage-deep text-white font-medium text-base transition-colors shadow-sm text-center"
          >
            Buka Aplikasi JEPIN ↗
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-7 py-3.5 rounded-lg border-2 border-espresso text-espresso hover:bg-espresso hover:text-linen font-medium text-base transition-colors text-center"
          >
            Masuk / Daftar Akun
          </Link>
        </div>
      </section>

      {/* 2. THREE SHOWCASE CARDS */}
      <section id="fitur" className="py-12 px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-ecru rounded-xl p-6 transition-transform duration-200 hover:-translate-y-1 shadow-sm border border-espresso/5 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-linen flex items-center justify-center mb-5 border border-espresso/10">
                <ClipboardIcon />
              </div>
              <h3 className="font-serif text-xl font-bold text-espresso mb-2.5">
                Catat &amp; Evaluasi Sensoris
              </h3>
              <p className="text-sm text-espresso-light leading-relaxed">
                Log setiap transaksi belanja harian dengan catatan sensoris terperinci — rasa, aroma, ketahanan pakai, pH, dan tekstur untuk evaluasi objektif.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-espresso/10 text-xs font-semibold uppercase tracking-wider text-sage-deep">
              Sensory Journal
            </div>
          </div>

          <div className="bg-ecru rounded-xl p-6 transition-transform duration-200 hover:-translate-y-1 shadow-sm border border-espresso/5 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-linen flex items-center justify-center mb-5 border border-espresso/10">
                <LayersIcon />
              </div>
              <h3 className="font-serif text-xl font-bold text-espresso mb-2.5">
                4 Siklus Konsumsi
              </h3>
              <p className="text-sm text-espresso-light leading-relaxed">
                Wajib Beli Lagi (Approved), Terbukti Zonk (Blacklist), Wishlist Terencana (Cooling-off), dan Sedang Diuji (Observasi 14 hari).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-espresso/10 text-xs font-semibold uppercase tracking-wider text-sage-deep">
              Lifecycle Ledger
            </div>
          </div>

          <div className="bg-ecru rounded-xl p-6 transition-transform duration-200 hover:-translate-y-1 shadow-sm border border-espresso/5 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-linen flex items-center justify-center mb-5 border border-espresso/10">
                <PiggyIcon />
              </div>
              <h3 className="font-serif text-xl font-bold text-espresso mb-2.5">
                Zonk Counter Otomatis
              </h3>
              <p className="text-sm text-espresso-light leading-relaxed">
                Kalkulasi otomatis dana yang berhasil diselamatkan dari pembelian berulang barang zonk yang terlupakan.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-espresso/10 text-xs font-semibold uppercase tracking-wider text-sage-deep">
              Audit Penghematan
            </div>
          </div>
        </div>
      </section>

      {/* 3. THREE PILLARS */}
      <section id="pilar" className="py-16 px-6 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-espresso">
            Solusi Pemborosan Mikro
          </h2>
          <p className="mt-3 text-base text-espresso-light">
            Metodologi rasional untuk memutus rantai konsumerisme reaktif.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-ecru/60 rounded-xl p-6 border border-espresso/10 flex items-start gap-5">
            <span className="num-badge bg-linen text-espresso">01</span>
            <div>
              <h3 className="font-serif text-lg font-bold text-espresso mb-1">
                Jeda Perenungan (Cooling-off Period)
              </h3>
              <p className="text-sm text-espresso-light leading-relaxed">
                Tahan keinginan impulsif dengan masa jeda wajib 7–14 hari sebelum eksekusi checkout. Wishlist terencana memisahkan kebutuhan riil dari dopamin sesaat.
              </p>
            </div>
          </div>

          <div className="bg-ecru/60 rounded-xl p-6 border border-espresso/10 flex items-start gap-5">
            <span className="num-badge bg-linen text-espresso">02</span>
            <div>
              <h3 className="font-serif text-lg font-bold text-espresso mb-1">
                Audit Sensoris &amp; Bukti Nyata
              </h3>
              <p className="text-sm text-espresso-light leading-relaxed">
                Tasting notes kopi, SPL parfum, atau reaktivitas skincare. Data spesifik menggantikan ingatan samar agar kamu tidak tertipu packaging yang sama dua kali.
              </p>
            </div>
          </div>

          <div className="bg-ecru/60 rounded-xl p-6 border border-espresso/10 flex items-start gap-5">
            <span className="num-badge bg-linen text-espresso">03</span>
            <div>
              <h3 className="font-serif text-lg font-bold text-espresso mb-1">
                Verifikasi Worth to Buy
              </h3>
              <p className="text-sm text-espresso-light leading-relaxed">
                Konversi status dari masa observasi ke Wajib Beli Lagi dengan kepuasan ≥ 9/10, atau blacklist ke status Terbukti Zonk untuk selamanya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-16 px-6 max-w-4xl mx-auto w-full">
        <div className="bg-espresso text-linen rounded-2xl p-8 sm:p-12 text-center border border-espresso/20 shadow-lg">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
            Hentikan Pembelian Berulang yang Mengecewakan
          </h2>
          <p className="text-linen/80 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Gunakan JEPIN untuk melacak barang yang terbukti bernilai tinggi dan simpan riwayat belanja dengan tenang.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-sage hover:bg-sage-deep text-white font-medium text-sm transition-colors"
            >
              Buka Katalog Ledger
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-linen/30 text-linen hover:bg-linen/10 font-medium text-sm transition-colors"
            >
              Masuk / Buat Akun
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-espresso/10 py-8 px-6 text-center text-xs text-espresso-light">
        <p className="font-serif font-bold text-sm text-espresso mb-1">
          JEPIN (Jejak Pintar) — Smart Consumption &amp; Repurchase Ledger
        </p>
        <p>&copy; 2024 JEPIN. Hak cipta dilindungi. Desain Warm Editorial Craft.</p>
      </footer>
    </div>
  );
}
