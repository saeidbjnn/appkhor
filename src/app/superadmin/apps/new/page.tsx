import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";

import { getSuperadminSession } from "@/lib/auth/get-superadmin-session";
import SuperadminAppForm from "@/app/superadmin/apps/superadmin-app-form";

export type AppCategoryOption = {
  id: string;
  slug: string;
  name: string;
};

export type AppPlatformOption = {
  id: string;
  slug: string;
  name: string;
};

type CategoryRow = {
  id: string;
  slug: string;
  name_fa: string;
};

type PlatformRow = {
  id: string;
  slug: string;
  name_fa: string;
};

export default async function NewSuperadminAppPage() {
  const session = await getSuperadminSession();

  if (!session) {
    redirect("/superadmin");
  }

  const { env } = getCloudflareContext();

  const [categoriesResult, platformsResult] = await Promise.all([
    env.appkhor_db
      .prepare(
        `SELECT
          id,
          slug,
          name_fa
        FROM categories
        ORDER BY sort_order ASC, name_fa ASC`,
      )
      .all<CategoryRow>(),

    env.appkhor_db
      .prepare(
        `SELECT
          id,
          slug,
          name_fa
        FROM platforms
        ORDER BY sort_order ASC, name_fa ASC`,
      )
      .all<PlatformRow>(),
  ]);

  const categories: AppCategoryOption[] = (
    categoriesResult.results ?? []
  ).map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name_fa,
  }));

  const platforms: AppPlatformOption[] = (
    platformsResult.results ?? []
  ).map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name_fa,
  }));

  return (
    <SuperadminAppForm
      mode="create"
      email={session.email}
      categories={categories}
      platforms={platforms}
    />
  );
}
