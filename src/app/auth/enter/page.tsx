"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function AuthEnterPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/");
      router.refresh();
    }, 1800);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main
      dir="rtl"
      className="flex h-dvh items-center justify-center overflow-hidden bg-[#03110c]"
    >
      <div className="flex flex-col items-center">
        <DotLottieReact
          src="/animations/login-loading.lottie"
          autoplay
          loop
          className="h-33 w-33"
        />

        <p className="-mt-2 text-sm font-black text-emerald-50">
          در حال ورود...
        </p>
      </div>
    </main>
  );
}