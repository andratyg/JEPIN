"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto redirect if already logged in or handle errors in query
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get("error");
      const urlDesc = params.get("error_description");
      if (urlError || urlDesc) {
        setErrorMessage(decodeURIComponent(urlDesc || urlError || "Gagal otentikasi."));
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    try {
      setErrorMessage(null);
      setGoogleLoading(true);
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "https://japin.naraandratyaga.my.id";
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setGoogleLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menghubungi layanan otentikasi Google.");
      setGoogleLoading(false);
    }
  };

  // Email + Password Auth
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (authTab === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMessage(
            error.message === "Invalid login credentials"
              ? "Email atau kata sandi tidak cocok. Silakan periksa kembali."
              : error.message
          );
          setLoading(false);
          return;
        }

        if (data.session) {
          router.replace("/dashboard");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        if (data.session) {
          router.replace("/dashboard");
        } else {
          setSuccessMessage(
            "Pendaftaran akun berhasil! Silakan periksa email kamu untuk tautan verifikasi, atau coba masuk."
          );
          setLoading(false);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses otentikasi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linen text-espresso flex flex-col font-sans selection:bg-sage/20 selection:text-sage-deep">
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
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-ecru rounded-2xl p-7 sm:p-8 shadow-sm border border-espresso/10">
          <div className="text-center mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-sage-deep">
              Editorial Ledger &bull; Otentikasi
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-espresso mt-1 mb-1.5">
              {authTab === "login" ? "Selamat Datang di JEPIN" : "Buat Ledger Pribadi"}
            </h1>
            <p className="text-xs sm:text-sm text-espresso-light">
              {authTab === "login"
                ? "Masuk untuk mengakses kurasi konsumsi & penghematanmu"
                : "Mulai kurasi belanja cerdas dan hentikan pembelian zonk"}
            </p>
          </div>

          {/* GOOGLE SIGN IN BUTTON */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full py-3 px-4 rounded-xl bg-linen hover:bg-white text-espresso font-semibold text-sm border border-espresso/20 shadow-xs transition-all flex items-center justify-center gap-3 hover:border-espresso/40 hover:shadow-sm disabled:opacity-50"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-espresso border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>
              {googleLoading ? "Menghubungkan ke Google..." : "Lanjutkan dengan Google"}
            </span>
          </button>

          {/* DIVIDER */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-espresso/10" />
            </div>
            <span className="relative px-3 bg-ecru text-[11px] uppercase tracking-wider text-espresso-light font-semibold">
              atau dengan email
            </span>
          </div>

          {/* ERROR & SUCCESS MESSAGES */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-terracotta/10 border border-terracotta/20 text-terracotta text-xs font-medium">
              ✕ {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-sage/10 border border-sage/20 text-sage-deep text-xs font-medium">
              ✓ {successMessage}
            </div>
          )}

          {/* TAB MASUK / DAFTAR */}
          <div className="flex bg-linen p-1 rounded-xl border border-espresso/10 mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthTab("login");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all " +
                (authTab === "login"
                  ? "bg-espresso text-linen shadow-xs"
                  : "text-espresso-light hover:text-espresso")
              }
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab("register");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all " +
                (authTab === "register"
                  ? "bg-espresso text-linen shadow-xs"
                  : "text-espresso-light hover:text-espresso")
              }
            >
              Daftar
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authTab === "register" && (
              <div>
                <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nara Andra"
                  className="w-full px-3.5 py-2.5 bg-linen border border-espresso/20 rounded-xl text-sm text-espresso placeholder:text-espresso-light/40 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3.5 py-2.5 bg-linen border border-espresso/20 rounded-xl text-sm text-espresso placeholder:text-espresso-light/40 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full px-3.5 py-2.5 bg-linen border border-espresso/20 rounded-xl text-sm text-espresso placeholder:text-espresso-light/40 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full mt-2 py-3 bg-sage hover:bg-sage-deep text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>
                {authTab === "login"
                  ? loading
                    ? "Memverifikasi..."
                    : "Masuk ke Dashboard"
                  : loading
                  ? "Mendaftarkan..."
                  : "Daftar & Buat Akun"}
              </span>
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] text-espresso-light leading-relaxed">
            Data kurasi dan evaluasi pengeluaranmu terenkripsi dan terlindungi di Supabase.
          </p>
        </div>
      </main>

      <footer className="border-t border-espresso/10 py-6 text-center text-xs text-espresso-light">
        &copy; 2024 JEPIN (Jejak Pintar). Menghitung setiap rupiah dengan kurasi sadar.
      </footer>
    </div>
  );
}
