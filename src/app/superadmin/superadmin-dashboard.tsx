"use client";

import {
  App,
  Badge,
  Button,
  Card,
  ConfigProvider,
  Divider,
  Flex,
  Layout,
  Menu,
  Space,
  Statistic,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import type { MenuProps } from "antd";

import type { SuperadminStats } from "./page";

import SuperadminLogoutButton from "@/app/superadmin/superadmin-logout-button";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

type SuperadminDashboardProps = {
  email: string;
  stats: SuperadminStats;
};

const menuItems: MenuProps["items"] = [
  {
    key: "dashboard",
    label: "داشبورد",
  },
  {
    key: "apps",
    label: "اپ‌ها",
  },
  {
    key: "categories",
    label: "دسته‌بندی‌ها",
  },
  {
    key: "platforms",
    label: "پلتفرم‌ها",
  },
  {
    key: "links",
    label: "لینک‌های رسمی",
  },
  {
    key: "users",
    label: "\u06a9\u0627\u0631\u0628\u0631\u0627\u0646",
  },
  {
    key: "media",
    label: "\u0631\u0633\u0627\u0646\u0647\u200c\u0647\u0627",
  },
  {
    key: "audit",
    label: "\u06af\u0632\u0627\u0631\u0634 \u062a\u063a\u06cc\u06cc\u0631\u0627\u062a",
  },
];

export default function SuperadminDashboard({
  email,
  stats,
}: SuperadminDashboardProps) {
  const statItems = [
    {
      title: "\u06a9\u0644 \u0627\u067e\u200c\u0647\u0627",
      value: stats.apps,
      hint: "\u0647\u0645\u0647 \u0648\u0636\u0639\u06cc\u062a\u200c\u0647\u0627",
    },
    {
      title: "\u0645\u0646\u062a\u0634\u0631\u0634\u062f\u0647",
      value: stats.publishedApps,
      hint: "\u0642\u0627\u0628\u0644 \u0646\u0645\u0627\u06cc\u0634 \u0639\u0645\u0648\u0645\u06cc",
    },
    {
      title: "\u067e\u06cc\u0634\u200c\u0646\u0648\u06cc\u0633",
      value: stats.draftApps,
      hint: "\u0647\u0646\u0648\u0632 \u0645\u0646\u062a\u0634\u0631 \u0646\u0634\u062f\u0647",
    },
    {
      title: "\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc\u200c\u0647\u0627",
      value: stats.categories,
      hint: "\u06a9\u0644 \u062f\u0633\u062a\u0647\u200c\u0647\u0627",
    },
    {
      title: "\u067e\u0644\u062a\u0641\u0631\u0645\u200c\u0647\u0627",
      value: stats.platforms,
      hint: "\u067e\u0644\u062a\u0641\u0631\u0645\u200c\u0647\u0627\u06cc \u062b\u0628\u062a\u200c\u0634\u062f\u0647",
    },
    {
      title: "\u06a9\u0627\u0631\u0628\u0631\u0627\u0646",
      value: stats.users,
      hint: "\u0628\u062f\u0648\u0646 \u062d\u0633\u0627\u0628\u200c\u0647\u0627\u06cc \u062d\u0630\u0641\u200c\u0634\u062f\u0647",
    },
    {
      title: "\u06a9\u0627\u0631\u0628\u0631\u0627\u0646 \u0641\u0639\u0627\u0644",
      value: stats.activeUsers,
      hint: "\u0648\u0636\u0639\u06cc\u062a ACTIVE",
    },
    {
      title: "\u0644\u06cc\u0646\u06a9\u200c\u0647\u0627\u06cc \u0641\u0639\u0627\u0644",
      value: stats.activeLinks,
      hint: "\u0645\u0642\u0635\u062f\u0647\u0627\u06cc \u0642\u0627\u0628\u0644 \u0627\u0633\u062a\u0641\u0627\u062f\u0647",
    },
    {
      title: "\u06a9\u0644 \u06a9\u0644\u06cc\u06a9\u200c\u0647\u0627",
      value: stats.outboundClicks,
      hint: "\u06a9\u0644 \u0627\u0631\u062c\u0627\u0639\u200c\u0647\u0627\u06cc \u062e\u0631\u0648\u062c\u06cc",
    },
    {
      title: "\u06a9\u0644\u06cc\u06a9 \u0627\u0645\u0631\u0648\u0632",
      value: stats.clicksToday,
      hint: "\u0627\u0632 \u0634\u0631\u0648\u0639 \u0631\u0648\u0632 UTC",
    },
    {
      title: "\u0631\u0633\u0627\u0646\u0647\u200c\u0647\u0627",
      value: stats.mediaAssets,
      hint: "\u06a9\u0644 \u0641\u0627\u06cc\u0644\u200c\u0647\u0627\u06cc D1",
    },
    {
      title: "\u0631\u0633\u0627\u0646\u0647 \u0628\u062f\u0648\u0646 \u0645\u0631\u062c\u0639",
      value: stats.orphanMediaAssets,
      hint: "\u0646\u06cc\u0627\u0632\u0645\u0646\u062f \u0628\u0631\u0631\u0633\u06cc",
    },
  ];

  return (
    <ConfigProvider
      direction="rtl"
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#22c55e",
          colorBgBase: "#07110c",
          colorBgLayout: "#07110c",
          colorBgContainer: "#0b1710",
          colorBgElevated: "#0f1d15",
          colorBorder: "rgba(255,255,255,0.08)",
          colorBorderSecondary: "rgba(255,255,255,0.06)",
          colorText: "#f4f4f5",
          colorTextSecondary: "#a1a1aa",
          borderRadius: 14,
          borderRadiusLG: 20,
          controlHeight: 42,
          fontFamily: "inherit",
        },
        components: {
          Layout: {
            bodyBg: "#07110c",
            headerBg: "rgba(7,17,12,0.86)",
            siderBg: "#08130d",
          },
          Menu: {
            darkItemBg: "#08130d",
            darkItemSelectedBg: "rgba(34,197,94,0.14)",
            darkItemSelectedColor: "#86efac",
            darkItemHoverBg: "rgba(255,255,255,0.05)",
            itemBorderRadius: 12,
            itemMarginInline: 12,
            itemHeight: 46,
          },
          Card: {
            colorBgContainer: "#0b1710",
          },
          Button: {
            primaryShadow: "none",
          },
        },
      }}
    >
      <App>
        <Layout className="min-h-screen bg-[#07110c]">
          <Sider
            width={240}
            breakpoint="lg"
            collapsedWidth="0"
            className="border-l border-white/[0.07]"
          >
            <div className="flex h-full flex-col">
              <div className="px-5 pb-4 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-black text-white shadow-lg shadow-emerald-950/30">
                    ا
                  </div>

                  <div>
                    <div className="text-[15px] font-black text-white">
                      اپ‌خور
                    </div>
                    <div className="mt-0.5 text-[11px] text-zinc-500">
                      پنل مدیریت محتوا
                    </div>
                  </div>
                </div>
              </div>

              <Divider className="my-2 border-white/[0.06]" />

              <Menu
                mode="inline"
                theme="dark"
                selectedKeys={["dashboard"]}
                items={menuItems}
                className="flex-1 border-none bg-transparent px-1"
                onClick={({ key }) => {
                  if (key === "media") {
                    window.location.href = "/superadmin/media";
                    return;
                  }

                  if (key === "dashboard") {
                    window.location.href = "/superadmin";
                    return;
                  }

                  if (key === "apps") {
                    window.location.href = "/superadmin/apps";
                  }

                  if (key === "users") {
                    window.location.href = "/superadmin/users";
                  }

                  if (key === "audit") {
                    window.location.href = "/superadmin/audit";
                  }
                }}
              />

              <div className="p-4">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Text className="text-xs text-zinc-400">
                      وضعیت
                    </Text>
                    <Badge status="success" />
                  </div>

                  <div className="text-xs font-bold text-zinc-200">
                    سیستم فعال
                  </div>

                  <div
                    dir="ltr"
                    className="mt-2 truncate text-left text-[11px] text-zinc-500"
                  >
                    {email}
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4">
                <SuperadminLogoutButton />
              </div>

            </div>
          </Sider>

          <Layout>
            <Header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-white/[0.06] px-5 backdrop-blur-xl sm:px-7">
              <div>
                <Text className="block text-[11px] text-zinc-500">
                  مدیریت اپ‌خور
                </Text>

                <Title
                  level={4}
                  style={{ margin: 0, marginTop: 2 }}
                >
                  داشبورد
                </Title>
              </div>

              <Space size={10}>
                <Tag
                  color="success"
                  className="m-0 rounded-full border-0 px-3 py-1"
                >
                  آنلاین
                </Tag>

                <Button href="/" target="_blank">
                  مشاهده سایت
                </Button>
              </Space>
            </Header>

            <Content className="p-4 sm:p-6 lg:p-8">
              <div className="mx-auto max-w-[1440px]">
                <section className="mb-8">
                  <Text className="text-sm text-zinc-500">
                    نمای کلی
                  </Text>

                  <Title
                    level={2}
                    style={{
                      marginTop: 6,
                      marginBottom: 8,
                      fontWeight: 900,
                    }}
                  >
                    مدیریت محتوای اپ‌خور
                  </Title>

                  <Text type="secondary">
                    اپ‌ها، دسته‌بندی‌ها، پلتفرم‌ها و لینک‌های رسمی را
                    از یک‌جا مدیریت کن.
                  </Text>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {statItems.map((item) => (
                    <Card
                      key={item.title}
                      variant="outlined"
                      className="overflow-hidden"
                      styles={{
                        body: {
                          padding: 20,
                        },
                      }}
                    >
                      <Flex vertical gap={12}>
                        <Text className="text-sm text-zinc-400">
                          {item.title}
                        </Text>

                        <Statistic
                          value={item.value}
                          valueStyle={{
                            fontSize: 30,
                            fontWeight: 900,
                            lineHeight: 1,
                          }}
                        />

                        <Text className="text-[11px] text-zinc-600">
                          {item.hint}
                        </Text>
                      </Flex>
                    </Card>
                  ))}
                </section>

                <section className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
                  <Card
                    variant="outlined"
                    title="مدیریت اپ‌ها"
                    extra={
                      <Tag
                        color="green"
                        className="m-0 border-0"
                      >
                        D1 متصل
                      </Tag>
                    }
                    styles={{
                      body: {
                        padding: 24,
                      },
                    }}
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <Title
                          level={4}
                          style={{ marginBottom: 8 }}
                        >
                          اپ‌های واقعی دیتابیس
                        </Title>

                        <Text type="secondary">
                          لیست اپ‌های ثبت‌شده در D1 را ببین و مدیریت کن.
                        </Text>
                      </div>

                      <Button
                        type="primary"
                        size="large"
                        href="/superadmin/apps"
                      >
                        مدیریت اپ‌ها
                      </Button>
                    </div>
                  </Card>

                  <Card
                    variant="outlined"
                    title="دسترسی سریع"
                    styles={{
                      body: {
                        padding: 20,
                      },
                    }}
                  >
                    <Space
                      direction="vertical"
                      size={10}
                      className="w-full"
                    >
                      <Tooltip title="فرم افزودن اپ را در مرحله بعد می‌سازیم">
                        <Button block disabled>
                          افزودن اپ جدید
                        </Button>
                      </Tooltip>

                      <Button block href="/superadmin/categories">
                        {"\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc\u200c\u0647\u0627"}
                      </Button>

                      <Button block href="/superadmin/platforms">
                        {"\u067e\u0644\u062a\u0641\u0631\u0645\u200c\u0647\u0627"}
                      </Button>
                    </Space>
                  </Card>
                </section>
              </div>
            </Content>
          </Layout>
        </Layout>
      </App>
    </ConfigProvider>
  );
}
