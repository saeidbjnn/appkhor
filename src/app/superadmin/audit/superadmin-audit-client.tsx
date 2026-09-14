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

import type { SuperadminAuditRow } from "./page";

import SuperadminLogoutButton from "@/app/superadmin/superadmin-logout-button";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

type Props = {
  email: string;
  logs: SuperadminAuditRow[];
};

function prettyJson(value: string | null) {
  if (!value) {
    return "-";
  }

  try {
    return JSON.stringify(
      JSON.parse(value),
      null,
      2,
    );
  } catch {
    return value;
  }
}

export default function SuperadminAuditClient({
  email,
  logs,
}: Props) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [targetFilter, setTargetFilter] =
    useState("ALL");

  const [selectedLog, setSelectedLog] =
    useState<SuperadminAuditRow | null>(null);

  const targetOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        logs
          .map((log) => log.targetType)
          .filter(Boolean),
      ),
    ).sort();

    return [
      {
        value: "ALL",
        label:
          "\u0647\u0645\u0647 \u0646\u0648\u0639\u200c\u0647\u0627",
      },
      ...values.map((value) => ({
        value,
        label: value,
      })),
    ];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const normalized =
      query.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesQuery =
        !normalized ||
        [
          log.action,
          log.targetType,
          log.targetId,
          log.actorEmail,
          log.reason,
        ].some((value) =>
          value
            ?.toLowerCase()
            .includes(normalized),
        );

      const matchesTarget =
        targetFilter === "ALL" ||
        log.targetType === targetFilter;

      return matchesQuery && matchesTarget;
    });
  }, [
    logs,
    query,
    targetFilter,
  ]);

  const columns: TableColumnsType<SuperadminAuditRow> = [
    {
      title:
        "\u0632\u0645\u0627\u0646",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value: string) => (
        <span
          dir="ltr"
          className="text-xs text-zinc-400"
        >
          {value}
        </span>
      ),
    },
    {
      title:
        "\u0639\u0645\u0644\u06cc\u0627\u062a",
      dataIndex: "action",
      key: "action",
      width: 220,
      render: (value: string) => (
        <Tag color="blue">
          {value}
        </Tag>
      ),
    },
    {
      title:
        "\u0647\u062f\u0641",
      key: "target",
      render: (_, record) => (
        <div>
          <div className="font-bold text-zinc-200">
            {record.targetType}
          </div>

          {record.targetId && (
            <div
              dir="ltr"
              className="mt-1 max-w-[260px] truncate text-left text-xs text-zinc-500"
            >
              {record.targetId}
            </div>
          )}
        </div>
      ),
    },
    {
      title:
        "\u0627\u0646\u062c\u0627\u0645\u200c\u062f\u0647\u0646\u062f\u0647",
      key: "actor",
      width: 220,
      render: (_, record) => (
        <span
          dir="ltr"
          className="text-xs text-zinc-400"
        >
          {record.actorEmail ||
            "SUPERADMIN"}
        </span>
      ),
    },
    {
      title:
        "\u062c\u0632\u0626\u06cc\u0627\u062a",
      key: "details",
      width: 110,
      render: (_, record) => (
        <Button
          size="small"
          onClick={() =>
            setSelectedLog(record)
          }
        >
          {"\u0645\u0634\u0627\u0647\u062f\u0647"}
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
      label:
        "\u06af\u0632\u0627\u0631\u0634 \u062a\u063a\u06cc\u06cc\u0631\u0627\u062a",
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
                selectedKeys={["audit"]}
                items={menuItems}
                className="flex-1 border-none bg-transparent"
                onClick={({ key }) => {
                  const routes: Record<string, string> = {
                    dashboard:
                      "/superadmin",
                    apps:
                      "/superadmin/apps",
                    categories:
                      "/superadmin/categories",
                    platforms:
                      "/superadmin/platforms",
                    links:
                      "/superadmin/links",
                    users:
                      "/superadmin/users",
                    audit:
                      "/superadmin/audit",
                  };

                  const route = routes[key];

                  if (route) {
                    router.push(route);
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
              <Title
                level={4}
                style={{ margin: 0 }}
              >
                {"\u06af\u0632\u0627\u0631\u0634 \u062a\u063a\u06cc\u06cc\u0631\u0627\u062a"}
              </Title>
            </Header>

            <Content className="p-4 sm:p-7">
              <div className="mx-auto max-w-7xl">
                <div className="mb-5">
                  <Title
                    level={3}
                    style={{ margin: 0 }}
                  >
                    {"\u062a\u0627\u0631\u06cc\u062e\u0686\u0647 \u062a\u063a\u06cc\u06cc\u0631\u0627\u062a"}
                  </Title>

                  <Text type="secondary">
                    {"\u0631\u062f\u06cc\u0627\u0628\u06cc \u062a\u063a\u06cc\u06cc\u0631\u0627\u062a \u0645\u062f\u06cc\u0631\u06cc\u062a\u06cc \u0648 \u0631\u0648\u06cc\u062f\u0627\u062f\u0647\u0627\u06cc \u0645\u0647\u0645"}
                  </Text>
                </div>

                <Card variant="outlined">
                  <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_220px]">
                    <Input.Search
                      allowClear
                      value={query}
                      onChange={(event) =>
                        setQuery(
                          event.target.value,
                        )
                      }
                      placeholder={
                        "\u062c\u0633\u062a\u062c\u0648 \u062f\u0631 \u0639\u0645\u0644\u06cc\u0627\u062a\u060c \u0647\u062f\u0641 \u06cc\u0627 \u06a9\u0627\u0631\u0628\u0631..."
                      }
                    />

                    <Select
                      value={targetFilter}
                      onChange={
                        setTargetFilter
                      }
                      options={targetOptions}
                    />
                  </div>

                  <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredLogs}
                    pagination={{
                      pageSize: 25,
                      showSizeChanger: true,
                    }}
                    scroll={{ x: 950 }}
                  />
                </Card>
              </div>
            </Content>
          </Layout>
        </Layout>

        <Modal
          open={Boolean(selectedLog)}
          title={
            "\u062c\u0632\u0626\u06cc\u0627\u062a \u0631\u0648\u06cc\u062f\u0627\u062f"
          }
          onCancel={() =>
            setSelectedLog(null)
          }
          footer={[
            <Button
              key="close"
              onClick={() =>
                setSelectedLog(null)
              }
            >
              {"\u0628\u0633\u062a\u0646"}
            </Button>,
          ]}
          width={760}
        >
          {selectedLog && (
            <Space
              direction="vertical"
              size={16}
              className="w-full"
            >
              <div>
                <Text type="secondary">
                  Action
                </Text>
                <div className="mt-1">
                  <Tag color="blue">
                    {selectedLog.action}
                  </Tag>
                </div>
              </div>

              <div>
                <Text type="secondary">
                  Target
                </Text>
                <pre
                  dir="ltr"
                  className="mt-1 overflow-auto rounded-xl bg-black/30 p-3 text-left text-xs"
                >
                  {selectedLog.targetType}
                  {selectedLog.targetId
                    ? ` / ${selectedLog.targetId}`
                    : ""}
                </pre>
              </div>

              <div>
                <Text type="secondary">
                  Old value
                </Text>
                <pre
                  dir="ltr"
                  className="mt-1 max-h-52 overflow-auto rounded-xl bg-black/30 p-3 text-left text-xs"
                >
                  {prettyJson(
                    selectedLog.oldValue,
                  )}
                </pre>
              </div>

              <div>
                <Text type="secondary">
                  New value
                </Text>
                <pre
                  dir="ltr"
                  className="mt-1 max-h-52 overflow-auto rounded-xl bg-black/30 p-3 text-left text-xs"
                >
                  {prettyJson(
                    selectedLog.newValue,
                  )}
                </pre>
              </div>

              {selectedLog.metadata && (
                <div>
                  <Text type="secondary">
                    Metadata
                  </Text>
                  <pre
                    dir="ltr"
                    className="mt-1 max-h-52 overflow-auto rounded-xl bg-black/30 p-3 text-left text-xs"
                  >
                    {prettyJson(
                      selectedLog.metadata,
                    )}
                  </pre>
                </div>
              )}

              {selectedLog.reason && (
                <div>
                  <Text type="secondary">
                    {"\u062f\u0644\u06cc\u0644"}
                  </Text>

                  <div className="mt-1 rounded-xl bg-black/30 p-3 text-sm">
                    {selectedLog.reason}
                  </div>
                </div>
              )}
            </Space>
          )}
        </Modal>
      </App>
    </ConfigProvider>
  );
}
