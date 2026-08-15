import Link from "next/link";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AppRow = {
  id: string;
  slug: string;
  name: string;
  name_fa: string | null;
  short_description_fa: string;
  description_fa: string | null;
  logo_url: string | null;
  website_url: string | null;
  repository_url: string | null;
  developer_name: string | null;
  license_name: string | null;
  published_at: string | null;
};

type CategoryRow = {
  slug: string;
  name_fa: string;
};

type PlatformRow = {
  slug: string;
  name_fa: string;
};

type AppLinkRow = {
  id: string;
  label_fa: string;
  link_type: string;
  is_primary: number;
  platform_name_fa: string | null;
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatLinkType(type: string): string {
  switch (type) {
    case "DOWNLOAD":
      return "دانلود";
    case "RUN":
      return "اجرا";
    case "WEBSITE":
      return "وب‌سایت";
    case "SOURCE":
      return "کد منبع";
    case "DOCS":
      return "مستندات";
    case "STORE":
      return "فروشگاه";
    default:
      return "لینک رسمی";
  }
}

export default async function AppDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const { env } = getCloudflareContext();

  const app = await env.appkhor_db
    .prepare(
      `SELECT
        id,
        slug,
        name,
        name_fa,
        short_description_fa,
        description_fa,
        logo_url,
        website_url,
        repository_url,
        developer_name,
        license_name,
        published_at
      FROM apps
      WHERE slug = ?
        AND status = 'PUBLISHED'
      LIMIT 1`,
    )
    .bind(slug)
    .first<AppRow>();

  if (!app) {
    notFound();
  }

  const [categoriesResult, platformsResult, linksResult] =
    await Promise.all([
      env.appkhor_db
        .prepare(
          `SELECT
            categories.slug,
            categories.name_fa
          FROM app_categories
          INNER JOIN categories
            ON categories.id = app_categories.category_id
          WHERE app_categories.app_id = ?
            AND categories.is_active = 1
          ORDER BY categories.sort_order, categories.name_fa`,
        )
        .bind(app.id)
        .all<CategoryRow>(),

      env.appkhor_db
        .prepare(
          `SELECT
            platforms.slug,
            platforms.name_fa
          FROM app_platforms
          INNER JOIN platforms
            ON platforms.id = app_platforms.platform_id
          WHERE app_platforms.app_id = ?
            AND platforms.is_active = 1
          ORDER BY platforms.sort_order, platforms.name_fa`,
        )
        .bind(app.id)
        .all<PlatformRow>(),

      env.appkhor_db
        .prepare(
          `SELECT
            app_links.id,
            app_links.label_fa,
            app_links.link_type,
            app_links.is_primary,
            platforms.name_fa AS platform_name_fa
          FROM app_links
          LEFT JOIN platforms
            ON platforms.id = app_links.platform_id
          WHERE app_links.app_id = ?
            AND app_links.is_active = 1
          ORDER BY
            app_links.is_primary DESC,
            app_links.sort_order,
            app_links.created_at`,
        )
        .bind(app.id)
        .all<AppLinkRow>(),
    ]);

  const categories = categoriesResult.results ?? [];
  const platforms = platformsResult.results ?? [];
  const links = linksResult.results ?? [];

  const primaryLink =
    links.find((item) => item.is_primary === 1) ?? links[0];

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f4f7f5] text-zinc-900"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Reveal>
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-zinc-500">
            <Link
              href="/"
              className="transition hover:text-emerald-800"
            >
              اپ‌خور
            </Link>

            <span>/</span>

            <Link
              href="/apps"
              className="transition hover:text-emerald-800"
            >
              اپ‌ها
            </Link>

            <span>/</span>

            <span className="text-zinc-800">
              {app.name_fa || app.name}
            </span>
          </nav>
        </Reveal>

        <section className="relative overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-[#dcebe0] p-6 shadow-[0_24px_70px_-35px_rgba(15,107,79,0.35)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-emerald-700/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
            <Reveal>
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  {categories.map((category) => (
                    <span
                      key={category.slug}
                      className="rounded-full border border-emerald-900/10 bg-white/55 px-3 py-1.5 text-xs font-bold text-emerald-900"
                    >
                      {category.name_fa}
                    </span>
                  ))}
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/50 bg-white/70 text-xl font-black text-emerald-900 shadow-sm">
                    {app.logo_url ? (
                      <img
                        src={app.logo_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (app.name_fa || app.name)
                        .trim()
                        .slice(0, 1)
                    )}
                  </div>

                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-[#14251b] sm:text-4xl">
                      {app.name_fa || app.name}
                    </h1>

                    {app.name_fa && app.name_fa !== app.name && (
                      <p
                        dir="ltr"
                        className="mt-1 text-left text-sm font-semibold text-zinc-500"
                      >
                        {app.name}
                      </p>
                    )}
                  </div>
                </div>

                <p className="mt-6 max-w-3xl text-[15px] font-medium leading-8 text-zinc-700 sm:text-base">
                  {app.short_description_fa}
                </p>

                {primaryLink && (
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href={`/go/${primaryLink.id}`}
                      className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0f6b4f] px-6 text-sm font-black text-white shadow-[0_14px_30px_-16px_rgba(15,107,79,0.75)] transition hover:-translate-y-0.5 hover:bg-[#0b5b43]"
                    >
                      {primaryLink.label_fa}
                    </Link>

                    {app.repository_url && (
                      <a
                        href={app.repository_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-12 items-center justify-center rounded-xl border border-emerald-950/10 bg-white/60 px-5 text-sm font-black text-zinc-700 transition hover:-translate-y-0.5 hover:bg-white hover:text-emerald-900"
                      >
                        مشاهده مخزن
                      </a>
                    )}
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal >
              <aside className="rounded-2xl border border-emerald-950/10 bg-white/55 p-5 backdrop-blur-sm">
                <h2 className="text-sm font-black text-emerald-950">
                  اطلاعات اپ
                </h2>

                <dl className="mt-4 space-y-4 text-sm">
                  {app.developer_name && (
                    <div>
                      <dt className="text-zinc-500">توسعه‌دهنده</dt>
                      <dd className="mt-1 font-bold text-zinc-800">
                        {app.developer_name}
                      </dd>
                    </div>
                  )}

                  {app.license_name && (
                    <div>
                      <dt className="text-zinc-500">مجوز</dt>
                      <dd
                        dir="ltr"
                        className="mt-1 text-right font-bold text-zinc-800"
                      >
                        {app.license_name}
                      </dd>
                    </div>
                  )}

                  <div>
                    <dt className="text-zinc-500">پلتفرم‌ها</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {platforms.map((platform) => (
                        <span
                          key={platform.slug}
                          className="rounded-lg bg-emerald-950/[0.06] px-2.5 py-1.5 text-xs font-bold text-emerald-950"
                        >
                          {platform.name_fa}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
              </aside>
            </Reveal>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <Reveal>
            <section className="rounded-[1.75rem] border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-black text-zinc-900">
                درباره {app.name_fa || app.name}
              </h2>

              <p className="mt-4 whitespace-pre-line text-[15px] font-medium leading-8 text-zinc-700">
                {app.description_fa ||
                  app.short_description_fa}
              </p>

              <div className="mt-7 rounded-2xl border border-amber-200/70 bg-amber-50/80 p-4 text-sm font-medium leading-7 text-amber-950">
                اپ‌خور فایل نصب این برنامه را میزبانی نمی‌کند.
                لینک‌های دریافت شما را به منبع رسمی برنامه هدایت
                می‌کنند.
              </div>
            </section>
          </Reveal>

          <Reveal >
            <section className="rounded-[1.75rem] border border-zinc-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-zinc-900">
                لینک‌های رسمی
              </h2>

              <Stagger className="mt-4 space-y-3">
                {links.map((link) => (
                  <StaggerItem key={link.id}>
                    <Link
                      href={`/go/${link.id}`}
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 transition hover:-translate-y-0.5 hover:border-emerald-700/20 hover:bg-emerald-50/60"
                    >
                      <div>
                        <p className="font-black text-zinc-800 transition group-hover:text-emerald-900">
                          {link.label_fa}
                        </p>

                        <p className="mt-1 text-xs font-medium text-zinc-500">
                          {formatLinkType(link.link_type)}
                          {link.platform_name_fa
                            ? ` · ${link.platform_name_fa}`
                            : ""}
                        </p>
                      </div>

                      <span
                        aria-hidden="true"
                        className="text-lg font-black text-emerald-800 transition group-hover:-translate-x-1"
                      >
                        ←
                      </span>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          </Reveal>
        </div>
      </div>
    </main>
  );
}