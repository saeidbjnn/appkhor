"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Apple,
  CircleHelp,
  Code2,
  Folder,
  Globe2,
  Laptop,
  Monitor,
  Palette,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

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

import type { SuperadminCategoryRow } from "./page";

import SuperadminLogoutButton from "@/app/superadmin/superadmin-logout-button";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;


const catalogIconMap: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  code: Code2,
  globe: Globe2,
  shield: ShieldCheck,
  play: Play,
  palette: Palette,
  folder: Folder,
  windows: Monitor,
  apple: Apple,
  linux: Laptop,
  smartphone: Smartphone,
  android: Smartphone,
  ios: Smartphone,
};

function CatalogIcon({
  name,
}: {
  name?: string | null;
}) {
  const key = (name || "").trim().toLowerCase();
  const Icon = catalogIconMap[key] || CircleHelp;

  return <Icon size={20} strokeWidth={1.8} />;
}

type Props = {
  email: string;
  categories: SuperadminCategoryRow[];
};

type CategoryFormValues = {
  slug: string;
  nameFa: string;
  descriptionFa?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
};

export default function SuperadminCategoriesClient({
  email,
  categories,
}: Props) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] =
    useState<SuperadminCategoryRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [form] = Form.useForm<CategoryFormValues>();

  const menuItems: MenuProps["items"] = [
    { key: "dashboard", label: "\u062f\u0627\u0634\u0628\u0648\u0631\u062f" },
    { key: "apps", label: "\u0627\u067e\u200c\u0647\u0627" },
    { key: "categories", label: "\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc\u200c\u0647\u0627" },
    { key: "platforms", label: "\u067e\u0644\u062a\u0641\u0631\u0645\u200c\u0647\u0627" },
    { key: "links", label: "\u0644\u06cc\u0646\u06a9\u200c\u0647\u0627\u06cc \u0631\u0633\u0645\u06cc" },
  {
    key: "users",
    label: "\u06a9\u0627\u0631\u0628\u0631\u0627\u0646",
  },
  {
    key: "audit",
    label: "\u06af\u0632\u0627\u0631\u0634 \u062a\u063a\u06cc\u06cc\u0631\u0627\u062a",
  },
  ];

  const filteredCategories = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return categories;

    return categories.filter((category) =>
      [
        category.nameFa,
        category.slug,
        category.descriptionFa,
      ].some((value) =>
        value?.toLowerCase().includes(normalized),
      ),
    );
  }, [categories, query]);

  function openCreate() {
    setEditing(null);
    setSaveError("");

    form.setFieldsValue({
      slug: "",
      nameFa: "",
      descriptionFa: "",
      icon: "",
      sortOrder: categories.length * 10,
      isActive: true,
    });

    setModalOpen(true);
  }

  function openEdit(category: SuperadminCategoryRow) {
    setEditing(category);
    setSaveError("");

    form.setFieldsValue({
      slug: category.slug,
      nameFa: category.nameFa,
      descriptionFa: category.descriptionFa || "",
      icon: category.icon || "",
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });

    setModalOpen(true);
  }

  async function saveCategory(values: CategoryFormValues) {
    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch(
        editing
          ? `/api/superadmin/categories/${editing.id}`
          : "/api/superadmin/categories",
        {
          method: editing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
      );

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !data.success) {
        setSaveError(
          data.message ||
            "\u0630\u062e\u06cc\u0631\u0647 \u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc \u0627\u0646\u062c\u0627\u0645 \u0646\u0634\u062f.",
        );
        return;
      }

      setModalOpen(false);
      setEditing(null);
      form.resetFields();
      router.refresh();
    } catch {
      setSaveError(
        "\u062f\u0631 \u0627\u0631\u062a\u0628\u0627\u0637 \u0628\u0627 \u0633\u0631\u0648\u0631 \u0645\u0634\u06a9\u0644\u06cc \u067e\u06cc\u0634 \u0622\u0645\u062f.",
      );
    } finally {
      setSaving(false);
    }
  }

  const columns: TableColumnsType<SuperadminCategoryRow> = [
    {
      title: "\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc",
      key: "category",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-lg">
            <CatalogIcon name={record.icon} />
          </div>

          <div className="min-w-0">
            <div className="font-black text-zinc-100">
              {record.nameFa}
            </div>

            <div
              dir="ltr"
              className="mt-1 text-left text-xs text-zinc-500"
            >
              /{record.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "\u0627\u067e\u200c\u0647\u0627",
      dataIndex: "appCount",
      key: "appCount",
      width: 90,
      align: "center",
    },
    {
      title: "\u0648\u0636\u0639\u06cc\u062a",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (value: boolean) =>
        value ? (
          <Tag color="success">
            {"\u0641\u0639\u0627\u0644"}
          </Tag>
        ) : (
          <Tag>
            {"\u063a\u06cc\u0631\u0641\u0639\u0627\u0644"}
          </Tag>
        ),
    },
    {
      title: "\u062a\u0631\u062a\u06cc\u0628",
      dataIndex: "sortOrder",
      key: "sortOrder",
      width: 90,
      align: "center",
    },
    {
      title: "\u0639\u0645\u0644\u06cc\u0627\u062a",
      key: "actions",
      width: 110,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => openEdit(record)}
        >
          {"\u0648\u06cc\u0631\u0627\u06cc\u0634"}
        </Button>
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
                    {"\u0627"}
                  </div>

                  <div>
                    <div className="text-[15px] font-black text-white">
                      {"\u0627\u067e\u200c\u062e\u0648\u0631"}
                    </div>
                    <div className="mt-0.5 text-[11px] text-zinc-500">
                      {"\u067e\u0646\u0644 \u0645\u062f\u06cc\u0631\u06cc\u062a \u0645\u062d\u062a\u0648\u0627"}
                    </div>
                  </div>
                </div>
              </div>

              <Divider className="my-2 border-white/[0.06]" />

              <Menu
                mode="inline"
                theme="dark"
                selectedKeys={["categories"]}
                items={menuItems}
                className="flex-1 border-none bg-transparent px-1"
                onClick={({ key }) => {
                  if (key === "dashboard") {
                    router.push("/superadmin");
                    return;
                  }

                  if (key === "apps") {
                    router.push("/superadmin/apps");
                    return;
                  }

                  if (key === "categories") {
                    router.push("/superadmin/categories");
                    return;
                  }

                  if (key === "platforms") {
                    router.push("/superadmin/platforms");
                    return;
                  }

                  if (key === "links") {
                    router.push("/superadmin/links");
                  }

                  if (key === "users") {
                    router.push("/superadmin/users");
                  }

                  if (key === "audit") {
                    router.push("/superadmin/audit");
                  }
                }}
              />

              <div className="p-4">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Text className="text-xs text-zinc-400">
                      {"\u0648\u0636\u0639\u06cc\u062a"}
                    </Text>
                    <Badge status="success" />
                  </div>

                  <div className="text-xs font-bold text-zinc-200">
                    {"\u0633\u06cc\u0633\u062a\u0645 \u0641\u0639\u0627\u0644"}
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
                  {"\u0645\u062f\u06cc\u0631\u06cc\u062a \u0627\u067e\u200c\u062e\u0648\u0631"}
                </Text>

                <Title level={4} style={{ margin: 0, marginTop: 2 }}>
                  {"\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc\u200c\u0647\u0627"}
                </Title>
              </div>

              <Button href="/" target="_blank">
                {"\u0645\u0634\u0627\u0647\u062f\u0647 \u0633\u0627\u06cc\u062a"}
              </Button>
            </Header>

            <Content className="p-4 sm:p-7">
              <div className="mx-auto max-w-7xl">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Title level={3} style={{ margin: 0 }}>
                      {"\u0645\u062f\u06cc\u0631\u06cc\u062a \u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc\u200c\u0647\u0627"}
                    </Title>

                    <Text type="secondary">
                      {"\u0633\u0627\u062e\u062a\u060c \u0648\u06cc\u0631\u0627\u06cc\u0634 \u0648 \u06a9\u0646\u062a\u0631\u0644 \u0646\u0645\u0627\u06cc\u0634 \u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc\u200c\u0647\u0627"}
                    </Text>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    onClick={openCreate}
                  >
                    {" + \u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc \u062c\u062f\u06cc\u062f"}
                  </Button>
                </div>

                <Card variant="outlined">
                  <Input.Search
                    allowClear
                    value={query}
                    onChange={(event) =>
                      setQuery(event.target.value)
                    }
                    placeholder={"\u062c\u0633\u062a\u062c\u0648 \u062f\u0631 \u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc\u200c\u0647\u0627..."}
                    className="mb-5 max-w-md"
                  />

                  <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredCategories}
                    pagination={false}
                    scroll={{ x: 760 }}
                  />
                </Card>
              </div>
            </Content>
          </Layout>
        </Layout>

        <Modal
          title={
            editing
              ? "\u0648\u06cc\u0631\u0627\u06cc\u0634 \u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc"
              : "\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc \u062c\u062f\u06cc\u062f"
          }
          open={modalOpen}
          onCancel={() => {
            if (!saving) {
              setModalOpen(false);
              setEditing(null);
              setSaveError("");
            }
          }}
          footer={null}
          destroyOnHidden
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={saveCategory}
          >
            <Form.Item
              label={"\u0646\u0627\u0645 \u0641\u0627\u0631\u0633\u06cc"}
              name="nameFa"
              rules={[
                {
                  required: true,
                  message:
                    "\u0646\u0627\u0645 \u0641\u0627\u0631\u0633\u06cc \u0631\u0627 \u0648\u0627\u0631\u062f \u06a9\u0646.",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Slug"
              name="slug"
              rules={[
                {
                  required: true,
                  message: "Slug \u0631\u0627 \u0648\u0627\u0631\u062f \u06a9\u0646.",
                },
              ]}
            >
              <Input dir="ltr" />
            </Form.Item>

            <Form.Item
              label={"\u062a\u0648\u0636\u06cc\u062d"}
              name="descriptionFa"
            >
              <TextArea rows={3} maxLength={500} showCount />
            </Form.Item>

            <div className="grid gap-4 sm:grid-cols-2">
              <Form.Item
                label={"\u0622\u06cc\u06a9\u0646"}
                name="icon"
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={"\u062a\u0631\u062a\u06cc\u0628 \u0646\u0645\u0627\u06cc\u0634"}
                name="sortOrder"
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </div>

            <Form.Item
              label={"\u0648\u0636\u0639\u06cc\u062a"}
              name="isActive"
              valuePropName="checked"
            >
              <Switch
                checkedChildren={"\u0641\u0639\u0627\u0644"}
                unCheckedChildren={"\u063a\u06cc\u0631\u0641\u0639\u0627\u0644"}
              />
            </Form.Item>

            {saveError && (
              <div className="mb-4 rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                {saveError}
              </div>
            )}

            <Space className="w-full justify-end">
              <Button
                disabled={saving}
                onClick={() => setModalOpen(false)}
              >
                {"\u0627\u0646\u0635\u0631\u0627\u0641"}
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
              >
                {"\u0630\u062e\u06cc\u0631\u0647"}
              </Button>
            </Space>
          </Form>
        </Modal>
      </App>
    </ConfigProvider>
  );
}
