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

import type { SuperadminLinkRow } from "./page";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

type Props = {
  email: string;
  links: SuperadminLinkRow[];
};

function linkTypeLabel(
  type: SuperadminLinkRow["linkType"],
): string {
  switch (type) {
    case "DOWNLOAD":
      return "\u062f\u0627\u0646\u0644\u0648\u062f";
    case "RUN":
      return "\u0627\u062c\u0631\u0627";
    case "WEBSITE":
      return "\u0648\u0628\u200c\u0633\u0627\u06cc\u062a";
    case "SOURCE":
      return "\u0633\u0648\u0631\u0633";
    case "DOCS":
      return "\u0645\u0633\u062a\u0646\u062f\u0627\u062a";
    case "STORE":
      return "\u0627\u0633\u062a\u0648\u0631";
    default:
      return "\u0633\u0627\u06cc\u0631";
  }
}

export default function SuperadminLinksClient({
  email,
  links,
}: Props) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] =
    useState<string>("ALL");
  const [statusFilter, setStatusFilter] =
    useState<string>("ALL");

  const menuItems: MenuProps["items"] = [
    {
      key: "dashboard",
      label: "\u062f\u0627\u0634\u0628\u0648\u0631\u062f",
    },
    {
      key: "apps",
      label: "\u0627\u067e\u200c\u0647\u0627",
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
  ];

  const filteredLinks = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return links.filter((link) => {
      const matchesQuery =
        !normalized ||
        [
          link.labelFa,
          link.url,
          link.appName,
          link.appNameFa,
          link.appSlug,
          link.platformNameFa,
          link.platformSlug,
        ].some((value) =>
          value?.toLowerCase().includes(normalized),
        );

      const matchesType =
        typeFilter === "ALL" ||
        link.linkType === typeFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          link.isActive) ||
        (statusFilter === "INACTIVE" &&
          !link.isActive);

      return (
        matchesQuery &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    links,
    query,
    typeFilter,
    statusFilter,
  ]);

  const columns: TableColumnsType<SuperadminLinkRow> = [
    {
      title: "\u0627\u067e",
      key: "app",
      render: (_, record) => (
        <div>
          <div className="font-black text-zinc-100">
            {record.appNameFa || record.appName}
          </div>

          <div
            dir="ltr"
            className="mt-1 text-left text-xs text-zinc-500"
          >
            /{record.appSlug}
          </div>
        </div>
      ),
    },
    {
      title: "\u0644\u06cc\u0646\u06a9",
      key: "link",
      render: (_, record) => (
        <div className="min-w-[220px]">
          <div className="font-bold text-zinc-200">
            {record.labelFa}
          </div>

          <div
            dir="ltr"
            className="mt-1 max-w-[360px] truncate text-left text-xs text-zinc-500"
            title={record.url}
          >
            {record.url}
          </div>
        </div>
      ),
    },
    {
      title: "\u0646\u0648\u0639",
      dataIndex: "linkType",
      key: "linkType",
      width: 110,
      render: (
        value: SuperadminLinkRow["linkType"],
      ) => (
        <Tag className="m-0">
          {linkTypeLabel(value)}
        </Tag>
      ),
    },
    {
      title: "\u067e\u0644\u062a\u0641\u0631\u0645",
      key: "platform",
      width: 130,
      render: (_, record) => (
        <span className="text-zinc-300">
          {record.platformNameFa ||
            "\u0639\u0645\u0648\u0645\u06cc"}
        </span>
      ),
    },
    {
      title: "\u0648\u0636\u0639\u06cc\u062a",
      key: "status",
      width: 140,
      render: (_, record) => (
        <Space size={6} wrap>
          {record.isActive ? (
            <Tag color="success">
              {"\u0641\u0639\u0627\u0644"}
            </Tag>
          ) : (
            <Tag>
              {"\u063a\u06cc\u0631\u0641\u0639\u0627\u0644"}
            </Tag>
          )}

          {record.isPrimary && (
            <Tag color="blue">
              {"\u0627\u0635\u0644\u06cc"}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "\u0639\u0645\u0644\u06cc\u0627\u062a",
      key: "actions",
      width: 190,
      fixed: "right",
      render: (_, record) => (
        <Space size={8}>
          <Button
            size="small"
            onClick={() =>
              window.open(
                record.url,
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            {"\u062a\u0633\u062a \u0644\u06cc\u0646\u06a9"}
          </Button>

          <Button
            size="small"
            type="primary"
            onClick={() =>
              router.push(
                `/superadmin/apps/${record.appId}/edit`,
              )
            }
          >
            {"\u0648\u06cc\u0631\u0627\u06cc\u0634 \u0627\u067e"}
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
          colorBorder:
            "rgba(255,255,255,0.08)",
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
            headerBg:
              "rgba(7,17,12,0.86)",
            siderBg: "#08130d",
          },
          Menu: {
            darkItemBg: "#08130d",
            darkItemSelectedBg:
              "rgba(34,197,94,0.14)",
            darkItemSelectedColor:
              "#86efac",
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
                selectedKeys={["links"]}
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
                    router.push(
                      "/superadmin/categories",
                    );
                    return;
                  }

                  if (key === "platforms") {
                    router.push(
                      "/superadmin/platforms",
                    );
                    return;
                  }

                  if (key === "links") {
                    router.push(
                      "/superadmin/links",
                    );
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
            </div>
          </Sider>

          <Layout>
            <Header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-white/[0.06] px-5 backdrop-blur-xl sm:px-7">
              <div>
                <Text className="block text-[11px] text-zinc-500">
                  {"\u0645\u062f\u06cc\u0631\u06cc\u062a \u0627\u067e\u200c\u062e\u0648\u0631"}
                </Text>

                <Title
                  level={4}
                  style={{
                    margin: 0,
                    marginTop: 2,
                  }}
                >
                  {"\u0644\u06cc\u0646\u06a9\u200c\u0647\u0627\u06cc \u0631\u0633\u0645\u06cc"}
                </Title>
              </div>

              <Button
                href="/"
                target="_blank"
              >
                {"\u0645\u0634\u0627\u0647\u062f\u0647 \u0633\u0627\u06cc\u062a"}
              </Button>
            </Header>

            <Content className="p-4 sm:p-7">
              <div className="mx-auto max-w-7xl">
                <div className="mb-5">
                  <Title
                    level={3}
                    style={{ margin: 0 }}
                  >
                    {"\u0645\u0631\u06a9\u0632 \u0644\u06cc\u0646\u06a9\u200c\u0647\u0627\u06cc \u0631\u0633\u0645\u06cc"}
                  </Title>

                  <Text type="secondary">
                    {"\u0628\u0631\u0631\u0633\u06cc \u0644\u06cc\u0646\u06a9\u200c\u0647\u0627\u06cc \u062e\u0631\u0648\u062c\u06cc \u062a\u0645\u0627\u0645 \u0627\u067e\u200c\u0647\u0627"}
                  </Text>
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
                        "\u062c\u0633\u062a\u062c\u0648 \u062f\u0631 \u0627\u067e\u060c \u0639\u0646\u0648\u0627\u0646 \u06cc\u0627 URL..."
                      }
                    />

                    <Select
                      value={typeFilter}
                      onChange={setTypeFilter}
                      options={[
                        {
                          value: "ALL",
                          label:
                            "\u0647\u0645\u0647 \u0646\u0648\u0639\u200c\u0647\u0627",
                        },
                        {
                          value: "DOWNLOAD",
                          label:
                            "\u062f\u0627\u0646\u0644\u0648\u062f",
                        },
                        {
                          value: "RUN",
                          label:
                            "\u0627\u062c\u0631\u0627",
                        },
                        {
                          value: "WEBSITE",
                          label:
                            "\u0648\u0628\u200c\u0633\u0627\u06cc\u062a",
                        },
                        {
                          value: "SOURCE",
                          label:
                            "\u0633\u0648\u0631\u0633",
                        },
                        {
                          value: "DOCS",
                          label:
                            "\u0645\u0633\u062a\u0646\u062f\u0627\u062a",
                        },
                        {
                          value: "STORE",
                          label:
                            "\u0627\u0633\u062a\u0648\u0631",
                        },
                        {
                          value: "OTHER",
                          label:
                            "\u0633\u0627\u06cc\u0631",
                        },
                      ]}
                    />

                    <Select
                      value={statusFilter}
                      onChange={
                        setStatusFilter
                      }
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
                          value: "INACTIVE",
                          label:
                            "\u063a\u06cc\u0631\u0641\u0639\u0627\u0644",
                        },
                      ]}
                    />
                  </div>

                  <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={
                      filteredLinks
                    }
                    pagination={{
                      pageSize: 20,
                      showSizeChanger: true,
                    }}
                    scroll={{ x: 1050 }}
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
