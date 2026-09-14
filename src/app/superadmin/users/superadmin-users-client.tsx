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
  Input,
  Layout,
  Menu,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  theme,
} from "antd";

import type {
  MenuProps,
  TableColumnsType,
} from "antd";

import type { SuperadminUserRow } from "./page";

import SuperadminLogoutButton from "@/app/superadmin/superadmin-logout-button";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

type Props = {
  email: string;
  users: SuperadminUserRow[];
};

export default function SuperadminUsersClient({
  email,
  users,
}: Props) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] =
    useState("ALL");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [editing, setEditing] =
    useState<SuperadminUserRow | null>(null);

  const [role, setRole] =
    useState<"USER" | "ADMIN">("USER");

  const [status, setStatus] =
    useState<"ACTIVE" | "SUSPENDED">("ACTIVE");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        !q ||
        user.email.toLowerCase().includes(q) ||
        user.displayName
          ?.toLowerCase()
          .includes(q);

      const matchesRole =
        roleFilter === "ALL" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        user.status === statusFilter;

      return (
        matchesQuery &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    query,
    roleFilter,
    statusFilter,
  ]);

  function openEdit(user: SuperadminUserRow) {
    if (user.role === "SUPER_ADMIN") {
      return;
    }

    setEditing(user);
    setRole(
      user.role === "ADMIN"
        ? "ADMIN"
        : "USER",
    );
    setStatus(
      user.status === "SUSPENDED"
        ? "SUSPENDED"
        : "ACTIVE",
    );
    setError("");
  }

  async function saveUser() {
    if (!editing) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/superadmin/users/${editing.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
            status,
          }),
        },
      );

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "\u0630\u062e\u06cc\u0631\u0647 \u0627\u0646\u062c\u0627\u0645 \u0646\u0634\u062f.",
        );
        return;
      }

      setEditing(null);
      router.refresh();
    } catch {
      setError(
        "\u062f\u0631 \u0627\u0631\u062a\u0628\u0627\u0637 \u0628\u0627 \u0633\u0631\u0648\u0631 \u0645\u0634\u06a9\u0644\u06cc \u067e\u06cc\u0634 \u0622\u0645\u062f.",
      );
    } finally {
      setSaving(false);
    }
  }

  const columns: TableColumnsType<SuperadminUserRow> = [
    {
      title: "\u06a9\u0627\u0631\u0628\u0631",
      key: "user",
      render: (_, user) => (
        <div>
          <div className="font-bold text-zinc-100">
            {user.displayName ||
              "\u0628\u062f\u0648\u0646 \u0646\u0627\u0645"}
          </div>

          <div
            dir="ltr"
            className="mt-1 text-left text-xs text-zinc-500"
          >
            {user.email}
          </div>
        </div>
      ),
    },
    {
      title: "\u0646\u0642\u0634",
      dataIndex: "role",
      key: "role",
      width: 130,
      render: (value) => (
        <Tag
          color={
            value === "SUPER_ADMIN"
              ? "purple"
              : value === "ADMIN"
                ? "blue"
                : undefined
          }
        >
          {value}
        </Tag>
      ),
    },
    {
      title: "\u0648\u0636\u0639\u06cc\u062a",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value) =>
        value === "ACTIVE" ? (
          <Tag color="success">
            {"\u0641\u0639\u0627\u0644"}
          </Tag>
        ) : (
          <Tag color="warning">
            {"\u0645\u0639\u0644\u0642"}
          </Tag>
        ),
    },
    {
      title: "\u0631\u0648\u0634\u200c\u0647\u0627\u06cc \u0648\u0631\u0648\u062f",
      dataIndex: "identityCount",
      key: "identityCount",
      width: 120,
      align: "center",
    },
    {
      title: "\u0646\u0634\u0633\u062a \u0641\u0639\u0627\u0644",
      dataIndex: "activeSessionCount",
      key: "activeSessionCount",
      width: 120,
      align: "center",
    },
    {
      title: "\u0639\u0645\u0644\u06cc\u0627\u062a",
      key: "actions",
      width: 110,
      render: (_, user) => (
        <Button
          size="small"
          type="primary"
          disabled={
            user.role === "SUPER_ADMIN"
          }
          onClick={() => openEdit(user)}
        >
          {"\u0648\u06cc\u0631\u0627\u06cc\u0634"}
        </Button>
      ),
    },
  ];

  const menuItems: MenuProps["items"] = [
    {
      key: "dashboard",
      label:
        "\u062f\u0627\u0634\u0628\u0648\u0631\u062f",
    },
    {
      key: "apps",
      label:
        "\u0627\u067e\u200c\u0647\u0627",
    },
    {
      key: "categories",
      label:
        "\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc\u200c\u0647\u0627",
    },
    {
      key: "platforms",
      label:
        "\u067e\u0644\u062a\u0641\u0631\u0645\u200c\u0647\u0627",
    },
    {
      key: "links",
      label:
        "\u0644\u06cc\u0646\u06a9\u200c\u0647\u0627\u06cc \u0631\u0633\u0645\u06cc",
    },
    {
      key: "users",
      label:
        "\u06a9\u0627\u0631\u0628\u0631\u0627\u0646",
    },
  {
    key: "audit",
    label: "\u06af\u0632\u0627\u0631\u0634 \u062a\u063a\u06cc\u06cc\u0631\u0627\u062a",
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
          colorBorder:
            "rgba(255,255,255,0.08)",
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
                <div className="text-[15px] font-black text-white">
                  {"\u0627\u067e\u200c\u062e\u0648\u0631"}
                </div>
                <div className="text-[11px] text-zinc-500">
                  {"\u067e\u0646\u0644 \u0645\u062f\u06cc\u0631\u06cc\u062a \u0645\u062d\u062a\u0648\u0627"}
                </div>
              </div>

              <Divider className="my-2" />

              <Menu
                mode="inline"
                theme="dark"
                selectedKeys={["users"]}
                items={menuItems}
                className="flex-1 border-none bg-transparent"
                onClick={({ key }) => {
                  const routes: Record<string, string> = {
                    dashboard: "/superadmin",
                    apps: "/superadmin/apps",
                    categories:
                      "/superadmin/categories",
                    platforms:
                      "/superadmin/platforms",
                    links: "/superadmin/links",
                    users: "/superadmin/users",
                  };

                  const route = routes[key];

                  if (route) {
                    router.push(route);
                  }

                  if (key === "audit") {
                    router.push("/superadmin/audit");
                  }
                }}
              />

              <div className="p-4">
                <div className="rounded-2xl border border-white/[0.06] p-4">
                  <div className="flex items-center justify-between">
                    <Text className="text-xs">
                      {"\u0648\u0636\u0639\u06cc\u062a"}
                    </Text>
                    <Badge status="success" />
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
            <Header className="flex h-[72px] items-center border-b border-white/[0.06] px-7">
              <Title level={4} style={{ margin: 0 }}>
                {"\u06a9\u0627\u0631\u0628\u0631\u0627\u0646"}
              </Title>
            </Header>

            <Content className="p-4 sm:p-7">
              <div className="mx-auto max-w-7xl">
                <div className="mb-5">
                  <Title level={3} style={{ margin: 0 }}>
                    {"\u0645\u062f\u06cc\u0631\u06cc\u062a \u06a9\u0627\u0631\u0628\u0631\u0627\u0646"}
                  </Title>

                  <Text type="secondary">
                    {"\u0646\u0642\u0634\u060c \u0648\u0636\u0639\u06cc\u062a \u062d\u0633\u0627\u0628 \u0648 \u0646\u0634\u0633\u062a\u200c\u0647\u0627"}
                  </Text>
                </div>

                <Card variant="outlined">
                  <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
                    <Input.Search
                      allowClear
                      value={query}
                      onChange={(e) =>
                        setQuery(e.target.value)
                      }
                      placeholder={
                        "\u062c\u0633\u062a\u062c\u0648\u06cc \u0627\u06cc\u0645\u06cc\u0644 \u06cc\u0627 \u0646\u0627\u0645..."
                      }
                    />

                    <Select
                      value={roleFilter}
                      onChange={setRoleFilter}
                      options={[
                        {
                          value: "ALL",
                          label:
                            "\u0647\u0645\u0647 \u0646\u0642\u0634\u200c\u0647\u0627",
                        },
                        {
                          value: "USER",
                          label: "USER",
                        },
                        {
                          value: "ADMIN",
                          label: "ADMIN",
                        },
                        {
                          value: "SUPER_ADMIN",
                          label: "SUPER_ADMIN",
                        },
                      ]}
                    />

                    <Select
                      value={statusFilter}
                      onChange={setStatusFilter}
                      options={[
                        {
                          value: "ALL",
                          label:
                            "\u0647\u0645\u0647 \u0648\u0636\u0639\u06cc\u062a\u200c\u0647\u0627",
                        },
                        {
                          value: "ACTIVE",
                          label:
                            "\u0641\u0639\u0627\u0644",
                        },
                        {
                          value: "SUSPENDED",
                          label:
                            "\u0645\u0639\u0644\u0642",
                        },
                        {
                          value: "DELETED",
                          label:
                            "\u062d\u0630\u0641\u200c\u0634\u062f\u0647",
                        },
                      ]}
                    />
                  </div>

                  <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredUsers}
                    pagination={{
                      pageSize: 20,
                      showSizeChanger: true,
                    }}
                    scroll={{ x: 900 }}
                  />
                </Card>
              </div>
            </Content>
          </Layout>
        </Layout>

        <Modal
          open={Boolean(editing)}
          title={
            "\u0648\u06cc\u0631\u0627\u06cc\u0634 \u06a9\u0627\u0631\u0628\u0631"
          }
          onCancel={() =>
            !saving && setEditing(null)
          }
          onOk={saveUser}
          okText={"\u0630\u062e\u06cc\u0631\u0647"}
          cancelText={"\u0627\u0646\u0635\u0631\u0627\u0641"}
          confirmLoading={saving}
        >
          {editing && (
            <div className="space-y-5 pt-3">
              <div
                dir="ltr"
                className="text-left text-sm text-zinc-400"
              >
                {editing.email}
              </div>

              <div>
                <Text className="mb-2 block">
                  {"\u0646\u0642\u0634"}
                </Text>

                <Select
                  className="w-full"
                  value={role}
                  onChange={setRole}
                  options={[
                    {
                      value: "USER",
                      label: "USER",
                    },
                    {
                      value: "ADMIN",
                      label: "ADMIN",
                    },
                  ]}
                />
              </div>

              <div>
                <Text className="mb-2 block">
                  {"\u0648\u0636\u0639\u06cc\u062a"}
                </Text>

                <Select
                  className="w-full"
                  value={status}
                  onChange={setStatus}
                  options={[
                    {
                      value: "ACTIVE",
                      label:
                        "\u0641\u0639\u0627\u0644",
                    },
                    {
                      value: "SUSPENDED",
                      label:
                        "\u0645\u0639\u0644\u0642",
                    },
                  ]}
                />
              </div>

              {status === "SUSPENDED" && (
                <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-amber-300">
                  {"\u0628\u0627 \u062a\u0639\u0644\u06cc\u0642 \u06a9\u0627\u0631\u0628\u0631\u060c \u0646\u0634\u0633\u062a\u200c\u0647\u0627\u06cc \u0641\u0639\u0627\u0644 \u0627\u0648 \u0647\u0645 \u0628\u0633\u062a\u0647 \u0645\u06cc\u200c\u0634\u0648\u062f."}
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-900/40 bg-red-950/30 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}
            </div>
          )}
        </Modal>
      </App>
    </ConfigProvider>
  );
}
