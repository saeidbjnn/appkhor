"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  App,
  Badge,
  Button,
  Card,
  ConfigProvider,
  Divider,
  Form,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  theme,
} from "antd";
import type {
  MenuProps,
  TableColumnsType,
} from "antd";

import type { SuperadminAppRow } from "./page";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

type SuperadminAppsClientProps = {
  email: string;
  apps: SuperadminAppRow[];
};

type CreateAppFormValues = {
  name: string;
  nameFa?: string;
  slug: string;
  shortDescriptionFa: string;
  developerName?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  sortOrder: number;
};

function getStatusLabel(
  status: SuperadminAppRow["status"],
): string {
  switch (status) {
    case "PUBLISHED":
      return "منتشرشده";
    case "DRAFT":
      return "پیش‌نویس";
    case "ARCHIVED":
      return "آرشیوشده";
  }
}

function getStatusColor(
  status: SuperadminAppRow["status"],
): "success" | "warning" | "default" {
  switch (status) {
    case "PUBLISHED":
      return "success";
    case "DRAFT":
      return "warning";
    case "ARCHIVED":
      return "default";
  }
}

export default function SuperadminAppsClient({
  email,
  apps,
}: SuperadminAppsClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [form] = Form.useForm<CreateAppFormValues>();

  const menuItems: MenuProps["items"] = [
    { key: "dashboard", label: "داشبورد" },
    { key: "apps", label: "اپ‌ها" },
    {
      key: "categories",
      label: "دسته‌بندی‌ها",
      disabled: true,
    },
    {
      key: "platforms",
      label: "پلتفرم‌ها",
      disabled: true,
    },
    {
      key: "links",
      label: "لینک‌های رسمی",
      disabled: true,
    },
  ];

  const filteredApps = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return apps;
    }

    return apps.filter((app) => {
      const values = [
        app.name,
        app.nameFa,
        app.slug,
        app.developerName,
        app.shortDescriptionFa,
      ];

      return values.some((value) =>
        value?.toLowerCase().includes(normalized),
      );
    });
  }, [apps, query]);

  async function createApp(values: CreateAppFormValues) {
    setCreateLoading(true);
    setCreateError("");

    try {
      const response = await fetch("/api/superadmin/apps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !data.success) {
        setCreateError(
          data.message || "ساخت اپ انجام نشد.",
        );
        return;
      }

      form.resetFields();
      setCreateOpen(false);
      router.refresh();
    } catch {
      setCreateError(
        "در ارتباط با سرور مشکلی پیش آمد.",
      );
    } finally {
      setCreateLoading(false);
    }
  }

  const columns: TableColumnsType<SuperadminAppRow> = [
    {
      title: "اپ",
      key: "app",
      render: (
        _: unknown,
        record: SuperadminAppRow,
      ) => (
        <div>
          <div className="font-black text-zinc-100">
            {record.nameFa || record.name}
          </div>

          <div
            dir="ltr"
            className="mt-1 text-left text-xs text-zinc-500"
          >
            {record.name} · /{record.slug}
          </div>
        </div>
      ),
    },
    {
      title: "توسعه‌دهنده",
      dataIndex: "developerName",
      key: "developerName",
      render: (value: string | null) => (
        <span className="text-zinc-300">
          {value || "—"}
        </span>
      ),
      responsive: ["md"],
    },
    {
      title: "وضعیت",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (
        status: SuperadminAppRow["status"],
      ) => (
        <Tag
          color={getStatusColor(status)}
          className="m-0 rounded-full border-0 px-3"
        >
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: "ویژه",
      dataIndex: "isFeatured",
      key: "isFeatured",
      width: 90,
      align: "center",
      render: (value: boolean) =>
        value ? (
          <Badge status="success" text="بله" />
        ) : (
          <span className="text-zinc-600">—</span>
        ),
      responsive: ["lg"],
    },
    {
      title: "ترتیب",
      dataIndex: "sortOrder",
      key: "sortOrder",
      width: 90,
      align: "center",
      responsive: ["lg"],
    },
    {
      title: "عملیات",
      key: "actions",
      width: 190,
      render: (
        _: unknown,
        record: SuperadminAppRow,
      ) => (
        <Space size={8}>
          <Button
            size="small"
            onClick={() =>
              window.open(
                `/apps/${record.slug}`,
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            مشاهده
          </Button>

          <Button
  size="small"
  type="primary"
  onClick={() =>
    router.push(`/superadmin/apps/${record.id}/edit`)
  }
>
  ویرایش
</Button>
        </Space>
      ),
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
          colorBorderSecondary:
            "rgba(255,255,255,0.06)",
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
            darkItemSelectedBg:
              "rgba(34,197,94,0.14)",
            darkItemSelectedColor: "#86efac",
            darkItemHoverBg:
              "rgba(255,255,255,0.05)",
            itemBorderRadius: 12,
            itemMarginInline: 12,
            itemHeight: 46,
          },
          Table: {
            headerBg: "#0d1b13",
            headerColor: "#a1a1aa",
            rowHoverBg:
              "rgba(34,197,94,0.045)",
            borderColor:
              "rgba(255,255,255,0.06)",
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
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-black text-white">
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
                selectedKeys={["apps"]}
                items={menuItems}
                className="flex-1 border-none bg-transparent px-1"
                onClick={({ key }) => {
                  if (key === "dashboard") {
                    router.push("/superadmin");
                    return;
                  }

                  if (key === "apps") {
                    router.push("/superadmin/apps");
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
                  اپ‌ها
                </Title>
              </div>

              <Space size={10}>
                <Button href="/" target="_blank">
                  مشاهده سایت
                </Button>
              </Space>
            </Header>

            <Content className="p-4 sm:p-6 lg:p-8">
              <div className="mx-auto max-w-[1440px]">
                <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <Text className="text-sm text-zinc-500">
                      مدیریت محتوا
                    </Text>

                    <Title
                      level={2}
                      style={{
                        marginTop: 6,
                        marginBottom: 8,
                        fontWeight: 900,
                      }}
                    >
                      اپ‌ها
                    </Title>

                    <Text type="secondary">
                      اپ‌های ثبت‌شده در D1 را اینجا
                      ببین و مدیریت کن.
                    </Text>
                  </div>

                  <Button
  type="primary"
  size="large"
  onClick={() => router.push("/superadmin/apps/new")}
>
  افزودن اپ جدید
</Button>
                </div>

                <Card
                  variant="outlined"
                  styles={{
                    body: {
                      padding: 0,
                    },
                  }}
                >
                  <div className="flex flex-col gap-4 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <Input.Search
                      value={query}
                      onChange={(event) =>
                        setQuery(event.target.value)
                      }
                      allowClear
                      placeholder="جست‌وجو بین اپ‌ها..."
                      className="w-full sm:max-w-sm"
                    />

                    <Text className="text-xs text-zinc-500">
                      {filteredApps.length} اپ
                    </Text>
                  </div>

                  <Table<SuperadminAppRow>
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredApps}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: false,
                    }}
                    scroll={{ x: 820 }}
                    locale={{
                      emptyText:
                        "هنوز اپی ثبت نشده است.",
                    }}
                  />
                </Card>
              </div>
            </Content>
          </Layout>

          <Modal
            title="افزودن اپ جدید"
            open={createOpen}
            onCancel={() => {
              if (createLoading) {
                return;
              }

              setCreateOpen(false);
              setCreateError("");
              form.resetFields();
            }}
            onOk={() => form.submit()}
            okText="ساخت اپ"
            cancelText="انصراف"
            confirmLoading={createLoading}
            destroyOnHidden
            width={680}
          >
            <Form<CreateAppFormValues>
              form={form}
              layout="vertical"
              onFinish={createApp}
              initialValues={{
                status: "DRAFT",
                isFeatured: false,
                sortOrder: 0,
              }}
              className="mt-6"
            >
              <div className="grid gap-x-4 sm:grid-cols-2">
                <Form.Item
                  label="نام انگلیسی"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "نام انگلیسی را وارد کن.",
                    },
                  ]}
                >
                  <Input
                    dir="ltr"
                    placeholder="VLC media player"
                  />
                </Form.Item>

                <Form.Item
                  label="نام فارسی"
                  name="nameFa"
                >
                  <Input placeholder="VLC" />
                </Form.Item>

                <Form.Item
                  label="Slug"
                  name="slug"
                  extra="مثال: vlc-media-player"
                  rules={[
                    {
                      required: true,
                      message: "Slug را وارد کن.",
                    },
                    {
                      pattern:
                        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        "فقط حروف انگلیسی کوچک، عدد و خط تیره.",
                    },
                  ]}
                >
                  <Input
                    dir="ltr"
                    placeholder="vlc-media-player"
                  />
                </Form.Item>

                <Form.Item
                  label="توسعه‌دهنده"
                  name="developerName"
                >
                  <Input placeholder="VideoLAN" />
                </Form.Item>
              </div>

              <Form.Item
                label="توضیح کوتاه فارسی"
                name="shortDescriptionFa"
                rules={[
                  {
                    required: true,
                    message:
                      "توضیح کوتاه فارسی را وارد کن.",
                  },
                ]}
              >
                <TextArea
                  rows={3}
                  showCount
                  maxLength={300}
                  placeholder="یک توضیح کوتاه و واضح درباره اپ..."
                />
              </Form.Item>

              <div className="grid gap-x-4 sm:grid-cols-2">
                <Form.Item
                  label="وضعیت"
                  name="status"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Select
                    options={[
                      {
                        value: "DRAFT",
                        label: "پیش‌نویس",
                      },
                      {
                        value: "PUBLISHED",
                        label: "منتشرشده",
                      },
                      {
                        value: "ARCHIVED",
                        label: "آرشیوشده",
                      },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="ترتیب نمایش"
                  name="sortOrder"
                >
                  <InputNumber
                    min={0}
                    className="w-full"
                  />
                </Form.Item>
              </div>

              <Form.Item
                label="اپ ویژه"
                name="isFeatured"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              {createError && (
                <div className="rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm leading-7 text-red-300">
                  {createError}
                </div>
              )}
            </Form>
          </Modal>
        </Layout>
      </App>
    </ConfigProvider>
  );
}
