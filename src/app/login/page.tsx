"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo auto login -> redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-linen text-espresso flex flex-col font-sans">
      {/* NAVBAR */}
      <header className="border-b border-espresso/10 bg-linen/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-espresso text-linen flex items-center justify-center font-serif font-bold text-base shadow-sm">
              J
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg tracking-tight text-espresso leading-none">
                JEPIN
              </span>
              <span className="text-[10px] text-espresso-light font-medium tracking-tight">
                Jejak Pintar
              </span>
            </div>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-espresso-light hover:text-espresso transition-colors"
          >
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* FORM CONTAINER */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md bg-ecru rounded-2xl p-8 shadow-sm border border-espresso/10">
          <div className="text-center mb-6">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-espresso mb-1.5">
              {authTab === "login" ? "Selamat Datang di JEPIN" : "Buat Ledger Pribadi"}
            </h1>
            <p className="text-xs sm:text-sm text-espresso-light">
              {authTab === "login"
                ? "Masuk untuk mengakses kurasi konsumsi & penghematanmu"
                : "Mulai kurasi belanja cerdas dan hentikan pembelian zonk"}
            </p>
          </div>

          <div className="flex bg-linen p-1 rounded-lg border border-espresso/10 mb-6">
            <button
              type="button"
              onClick={() => setAuthTab("login")}
              className={
                "flex-1 py-2 text-sm font-semibold rounded-md transition-all " +
                (authTab === "login"
                  ? "bg-espresso text-linen shadow-xs"
                  : "text-espresso-light hover:text-espresso")
              }
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => setAuthTab("register")}
              className={
                "flex-1 py-2 text-sm font-semibold rounded-md transition-all " +
                (authTab === "register"
                  ? "bg-espresso text-linen shadow-xs"
                  : "text-espresso-light hover:text-espresso")
              }
            >
              Daftar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authTab === "register" && (
              <div>
                <label className="block text-xs font-semibold text-espresso uppercase tracking-wider mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nara Andra"
                  className="w-full px-3.5 py-2.5 bg-linen border border-espresso/20 rounded-lg text-sm text-espresso placeholder:text-espresso-light/40 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-espresso uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3.5 py-2.5 bg-linen border border-espresso/20 rounded-lg text-sm text-espresso placeholder:text-espresso-light/40 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-espresso uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full px-3.5 py-2.5 bg-linen border border-espresso/20 rounded-lg text-sm text-espresso placeholder:text-espresso-light/40 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-sage hover:bg-sage-deep text-white font-semibold rounded-lg text-sm transition-colors shadow-xs"
            >
              {authTab === "login" ? "Masuk ke Dashboard" : "Daftar & Masuk"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-espresso-light">
            <Link
              href="/dashboard"
              className="underline hover:text-espresso font-medium"
            >
              Lanjutkan sebagai Tamu (Mode Demo) &rarr;
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-espresso/10 py-6 text-center text-xs text-espresso-light">
        &copy; 2024 JEPIN (Jejak Pintar). Semua data tersimpan aman secara personal.
      </footer>
    </div>
  );
}
