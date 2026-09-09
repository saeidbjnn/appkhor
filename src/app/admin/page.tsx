import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <main dir="rtl" className="min-h-screen p-10">
      <h1 className="text-3xl font-black">
        پنل مدیریت اپ‌خور
      </h1>

      <p className="mt-4 text-zinc-600">
        خوش آمدی {user.displayName || user.email || "مدیر"}.
      </p>
    </main>
  );
}