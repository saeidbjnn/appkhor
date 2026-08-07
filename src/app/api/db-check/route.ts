import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { env } = getCloudflareContext();

    const result = await env.appkhor_db
      .prepare("SELECT COUNT(*) AS count FROM users")
      .first<{ count: number }>();

    return Response.json({
      success: true,
      message: "اتصال به دیتابیس اپ‌خور برقرار است.",
      usersCount: Number(result?.count ?? 0),
    });
  } catch (error) {
    console.error("D1 connection error:", error);

    return Response.json(
      {
        success: false,
        message: "اتصال به دیتابیس ناموفق بود.",
      },
      { status: 500 },
    );
  }
}