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
  Select,
Table,
  Tag,
  Typography,
  theme,
} from "antd";

import type {
  MenuProps,
  TableColumnsType,
} from "antd";

import SuperadminLogoutButton from "@/app/superadmin/superadmin-logout-button";

import type {
  SuperadminMediaAsset,
  SuperadminMediaStats,
} from "./page";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

type Props = {
  email: string;
  stats: SuperadminMediaStats;
  assets: SuperadminMediaAsset[];
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) / Math.log(1024),
    ),
    units.length - 1,
  );

  const value =
    bytes / Math.pow(1024, index);

  return `${value.toFixed(
    index === 0 ? 0 : 2,
  )} ${units[index]}`;
}

export default function SuperadminMediaClient({
  email,
  stats,
  assets,
}: Props) {
  const router = useRouter();

  const [query, setQuery] =
    useState("");

  const [kindFilter, setKindFilter] =
    useState("ALL");

  const [
    referenceFilter,
    setReferenceFilter,
  ] = useState("ALL");

  const filteredAssets =
    useMemo(() => {
      const q =
        query.trim().toLowerCase();

      return assets.filter((asset) => {
        const matchesQuery =
          !q ||
          asset.id
            .toLowerCase()
            .includes(q) ||
          asset.originalFilename
            ?.toLowerCase()
            .includes(q) ||
          asset.contentType
            .toLowerCase()
            .includes(q);

        const matchesKind =
          kindFilter === "ALL" ||
          asset.kind === kindFilter;

        const matchesReference =
          referenceFilter === "ALL" ||
          (referenceFilter ===
            "USED" &&
            asset.isReferenced) ||
          (referenceFilter ===
            "ORPHAN" &&
            !asset.isReferenced);

        return (
          matchesQuery &&
          matchesKind &&
          matchesReference
        );
      });
    }, [
      assets,
      query,
      kindFilter,
      referenceFilter,
    ]);

  const columns:
    TableColumnsType<SuperadminMediaAsset> =
    [
      {
        title:
          "\u0641\u0627\u06cc\u0644",
        key: "file",
        render: (_, asset) => (
          <div>
            <div className="max-w-[280px] truncate font-bold text-zinc-100">
              {asset.originalFilename ||
                asset.id}
            </div>

            <div
              dir="ltr"
              className="mt-1 max-w-[280px] truncate text-left text-[11px] text-zinc-500"
            >
              {asset.id}
            </div>
          </div>
        ),
      },
      {
        title:
          "\u0646\u0648\u0639",
        dataIndex: "kind",
        key: "kind",
        width: 130,
        render: (value) => (
          <Tag
            color={
              value === "LOGO"
                ? "green"
                : "blue"
            }
          >
            {value}
          </Tag>
        ),
      },
      {
        title:
          "\u062d\u062c\u0645",
        dataIndex: "byteSize",
        key: "byteSize",
        width: 110,
        sorter: (a, b) =>
          a.byteSize - b.byteSize,
        render: (value) =>
          formatBytes(value),
      },
      {
        title:
          "\u0648\u0636\u0639\u06cc\u062a",
        key: "reference",
        width: 120,
        render: (_, asset) =>
          asset.isReferenced ? (
            <Tag color="success">
              {"\u062f\u0631 \u062d\u0627\u0644 \u0627\u0633\u062a\u0641\u0627\u062f\u0647"}
            </Tag>
          ) : (
            <Tag color="warning">
              {"\u0628\u062f\u0648\u0646 \u0645\u0631\u062c\u0639"}
            </Tag>
          ),
      },
      {
        title:
          "MIME",
        dataIndex: "contentType",
        key: "contentType",
        width: 160,
        render: (value) => (
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
          "\u062a\u0627\u0631\u06cc\u062e",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 175,
        render: (value) => (
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
        key: "actions",
        width: 110,
        render: (_, asset) => (
          <Button
            size="small"
            href={asset.url}
            target="_blank"
          >
            {"\u0645\u0634\u0627\u0647\u062f\u0647"}
          </Button>
        ),
      },
    ];

  const menuItems:
    MenuProps["items"] = [
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
      key: "media",
      label:
        "\u0631\u0633\u0627\u0646\u0647\u200c\u0647\u0627",
    },
    {
      key: "audit",
      label:
        "\u06af\u0632\u0627\u0631\u0634 \u062a\u063a\u06cc\u06cc\u0631\u0627\u062a",
    },
  ];

  const routes:
    Record<string, string> = {
    dashboard: "/superadmin",
    apps: "/superadmin/apps",
    categories:
      "/superadmin/categories",
    platforms:
      "/superadmin/platforms",
    links: "/superadmin/links",
    users: "/superadmin/users",
    media: "/superadmin/media",
    audit: "/superadmin/audit",
  };

  return (
    <ConfigProvider
      direction="rtl"
      theme={{
        algorithm:
          theme.darkAlgorithm,
        token: {
          colorPrimary: "#22c55e",
          colorBgBase: "#07110c",
          colorBgLayout: "#07110c",
          colorBgContainer: "#0b1710",
          colorBgElevated: "#0f1d15",
          colorBorder:
            "rgba(255,255,255,0.08)",
          colorText: "#f4f4f5",
          colorTextSecondary:
            "#a1a1aa",
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
                selectedKeys={["media"]}
                items={menuItems}
                className="flex-1 border-none bg-transparent"
                onClick={({ key }) => {
                  const route =
                    routes[key];

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
                {"\u0631\u0633\u0627\u0646\u0647\u200c\u0647\u0627"}
              </Title>
            </Header>

            <Content className="p-4 sm:p-7">
              <div className="mx-auto max-w-7xl">
                <div className="mb-5">
                  <Title
                    level={3}
                    style={{ margin: 0 }}
                  >
                    {"Media Health"}
                  </Title>

                  <Text type="secondary">
                    {"\u0648\u0636\u0639\u06cc\u062a \u0641\u0627\u06cc\u0644\u200c\u0647\u0627\u06cc \u0630\u062e\u06cc\u0631\u0647\u200c\u0634\u062f\u0647 \u062f\u0631 D1"}
                  </Text>
                </div>

                <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Card>
                    <Text type="secondary">
                      {"\u06a9\u0644 \u0641\u0627\u06cc\u0644\u200c\u0647\u0627"}
                    </Text>
                    <div className="mt-2 text-2xl font-black">
                      {stats.totalAssets}
                    </div>
                  </Card>

                  <Card>
                    <Text type="secondary">
                      {"\u062d\u062c\u0645 \u06a9\u0644"}
                    </Text>
                    <div className="mt-2 text-2xl font-black">
                      {formatBytes(
                        stats.totalBytes,
                      )}
                    </div>
                  </Card>

                  <Card>
                    <Text type="secondary">
                      Logo / Screenshot
                    </Text>
                    <div
                      dir="ltr"
                      className="mt-2 text-left text-xl font-black"
                    >
                      {stats.logos} /{" "}
                      {stats.screenshots}
                    </div>
                  </Card>

                  <Card>
                    <Text type="secondary">
                      {"\u0641\u0627\u06cc\u0644 \u0628\u062f\u0648\u0646 \u0645\u0631\u062c\u0639"}
                    </Text>
                    <div className="mt-2 text-2xl font-black text-amber-400">
                      {stats.orphanAssets}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {formatBytes(
                        stats.orphanBytes,
                      )}
                    </div>
                  </Card>
                </div>

                <Card variant="outlined">
                  <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
                    <Input.Search
                      allowClear
                      value={query}
                      onChange={(event) =>
                        setQuery(
                          event.target.value,
                        )
                      }
                      placeholder={
                        "\u062c\u0633\u062a\u062c\u0648\u06cc \u0641\u0627\u06cc\u0644\u060c ID \u06cc\u0627 MIME..."
                      }
                    />

                    <Select
                      value={kindFilter}
                      onChange={
                        setKindFilter
                      }
                      options={[
                        {
                          value: "ALL",
                          label:
                            "\u0647\u0645\u0647 \u0646\u0648\u0639\u200c\u0647\u0627",
                        },
                        {
                          value: "LOGO",
                          label: "LOGO",
                        },
                        {
                          value:
                            "SCREENSHOT",
                          label:
                            "SCREENSHOT",
                        },
                      ]}
                    />

                    <Select
                      value={
                        referenceFilter
                      }
                      onChange={
                        setReferenceFilter
                      }
                      options={[
                        {
                          value: "ALL",
                          label:
                            "\u0647\u0645\u0647 \u0648\u0636\u0639\u06cc\u062a\u200c\u0647\u0627",
                        },
                        {
                          value: "USED",
                          label:
                            "\u062f\u0631 \u062d\u0627\u0644 \u0627\u0633\u062a\u0641\u0627\u062f\u0647",
                        },
                        {
                          value:
                            "ORPHAN",
                          label:
                            "\u0628\u062f\u0648\u0646 \u0645\u0631\u062c\u0639",
                        },
                      ]}
                    />
                  </div>

                  <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={
                      filteredAssets
                    }
                    pagination={{
                      pageSize: 20,
                      showSizeChanger: true,
                    }}
                    scroll={{ x: 1000 }}
                  />
                </Card>
              </div>
            </Content>
          </Layout>
        </Layout>
      </App>
    </ConfigProvider>
  );
}
