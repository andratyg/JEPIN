"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState("Menghubungkan akun ke ledger JEPIN...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function handleAuth() {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");
        const urlError = searchParams.get("error");
        const errorDesc = searchParams.get("error_description");

        // 1. Cek bila ada error dari OAuth provider
        if (urlError || errorDesc) {
          const msg = errorDesc || urlError || "Otentikasi dibatalkan atau ditolak.";
          if (isMounted) {
            setIsError(true);
            setStatusMessage(`Gagal login: ${msg}`);
          }
          setTimeout(() => {
            router.replace("/login?error=" + encodeURIComponent(msg));
          }, 1800);
          return;
        }

        // 2. PKCE code exchange
        if (code) {
          if (isMounted) {
            setStatusMessage("Memvalidasi kode autentikasi dari Google...");
          }
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("exchangeCodeForSession error:", error);
            if (isMounted) {
              setIsError(true);
              setStatusMessage(`Verifikasi gagal: ${error.message}`);
            }
            setTimeout(() => {
              router.replace("/login?error=" + encodeURIComponent(error.message));
            }, 1800);
            return;
          }

          if (data?.session) {
            if (isMounted) {
              setStatusMessage("Berhasil masuk! Mengarahkan ke dashboard...");
            }
            window.location.href = "/dashboard";
            return;
          }
        }

        // 3. Fallback jika sesi sudah aktif atau hash token
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          if (isMounted) {
            setIsError(true);
            setStatusMessage(`Sesi error: ${sessionError.message}`);
          }
          setTimeout(() => {
            router.replace("/login?error=" + encodeURIComponent(sessionError.message));
          }, 1800);
          return;
        }

        if (session) {
          window.location.href = "/dashboard";
        } else {
          router.replace("/login");
        }
      } catch (err: any) {
        console.error("Auth callback exception:", err);
        const msg = err.message || "Gagal memproses otentikasi.";
        if (isMounted) {
          setIsError(true);
          setStatusMessage(`Terjadi kesalahan: ${msg}`);
        }
        setTimeout(() => {
          router.replace("/login?error=" + encodeURIComponent(msg));
        }, 1800);
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-linen flex items-center justify-center text-espresso selection:bg-sage/20 selection:text-sage-deep">
      <div className="text-center space-y-4 p-8 bg-ecru rounded-2xl border border-espresso/10 max-w-sm w-full mx-4 shadow-sm">
        <div
          className={
            "w-10 h-10 border-3 rounded-full mx-auto " +
            (isError
              ? "border-terracotta border-t-transparent"
              : "border-sage border-t-transparent animate-spin")
          }
        />
        <div>
          <h2 className="font-serif font-bold text-base text-espresso">
            {isError ? "Kendala Otentikasi" : "Memverifikasi Otentikasi"}
          </h2>
          <p className="text-xs text-espresso-light mt-1.5 leading-relaxed">
            {statusMessage}
          </p>
        </div>
      </div>
    </div>
  );
}