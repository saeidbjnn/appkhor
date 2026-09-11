"use client";

import { useState } from "react";
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
  Select,
  Space,
  Switch,
  Typography,
  Upload,
  theme,
} from "antd";
import type { MenuProps } from "antd";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

export type CategoryOption = {
  id: string;
  slug: string;
  name: string;
};

export type PlatformOption = {
  id: string;
  slug: string;
  name: string;
};

export type LinkFormValue = {
  platformId?: string;
  labelFa: string;
  url: string;
  linkType:
    | "DOWNLOAD"
    | "RUN"
    | "WEBSITE"
    | "SOURCE"
    | "DOCS"
    | "STORE"
    | "OTHER";
  isPrimary?: boolean;
  sortOrder?: number;
};

export type ScreenshotFormValue = {
  imageUrl: string;
  titleFa?: string;
  altFa?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type AppFormValues = {
  name: string;
  nameFa?: string;
  slug: string;
  shortDescriptionFa: string;
  descriptionFa?: string;

  logoUrl?: string;
  websiteUrl?: string;
  repositoryUrl?: string;

  developerName?: string;
  licenseName?: string;
  searchKeywords?: string;

  categoryIds?: string[];
  platformIds?: string[];

  links?: LinkFormValue[];
  screenshots?: ScreenshotFormValue[];

  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured?: boolean;
  sortOrder?: number;
};

type SuperadminAppFormProps = {
  mode: "create" | "edit";
  email: string;
  categories: CategoryOption[];
  platforms: PlatformOption[];
  appId?: string;
  initialData?: Partial<AppFormValues>;
};

const menuItems: MenuProps["items"] = [
  { key: "dashboard", label: "داشبورد" },
  { key: "apps", label: "اپ‌ها" },
  { key: "categories", label: "دسته‌بندی‌ها", disabled: true },
  { key: "platforms", label: "پلتفرم‌ها", disabled: true },
  { key: "links", label: "لینک‌های رسمی", disabled: true },
];

const linkTypeOptions = [
  { value: "DOWNLOAD", label: "دانلود مستقیم" },
  { value: "RUN", label: "اجرا" },
  { value: "WEBSITE", label: "وب‌سایت رسمی" },
  { value: "SOURCE", label: "کد منبع" },
  { value: "DOCS", label: "مستندات" },
  { value: "STORE", label: "فروشگاه" },
  { value: "OTHER", label: "سایر" },
];

function validateHttpUrl(_: unknown, value?: string) {
  if (!value?.trim()) {
    return Promise.resolve();
  }

  try {
    const url = new URL(value.trim());

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return Promise.reject(new Error("URL ????? ???? ??."));
    }

    return Promise.resolve();
  } catch {
    return Promise.reject(new Error("URL ????? ???? ??."));
  }
}

export default function SuperadminAppForm({
  mode,
  email,
  categories,
  platforms,
  appId,
  initialData,
}: SuperadminAppFormProps) {
  const router = useRouter();
  const [form] = Form.useForm<AppFormValues>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] =
    useState<number | null>(null);

  async function uploadMedia(
    file: File,
    kind: "LOGO" | "SCREENSHOT",
  ): Promise<string> {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("kind", kind);

    const response = await fetch("/api/superadmin/media", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as {
      success?: boolean;
      message?: string;
      asset?: {
        url?: string;
      };
    };

    if (!response.ok || !data.success || !data.asset?.url) {
      throw new Error(
        data.message ||
          "\u0622\u067e\u0644\u0648\u062f \u062a\u0635\u0648\u06cc\u0631 \u0627\u0646\u062c\u0627\u0645 \u0646\u0634\u062f.",
      );
    }

    const uploadedUrl = data.asset.url;

    if (uploadedUrl.startsWith("/")) {
      return window.location.origin + uploadedUrl;
    }

    return uploadedUrl;
  }

  const isEdit = mode === "edit";

  async function submit(values: AppFormValues) {
    if (isEdit && !appId) {
      setSaveError("شناسه اپ برای ویرایش موجود نیست.");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch(
        isEdit
          ? `/api/superadmin/apps/${appId}`
          : "/api/superadmin/apps",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
      );

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
        app?: {
          id: string;
          slug: string;
        };
      };

      if (!response.ok || !data.success) {
        setSaveError(
          data.message ||
            (isEdit ? "ویرایش اپ انجام نشد." : "ساخت اپ انجام نشد."),
        );
        return;
      }

      router.push("/superadmin/apps");
      router.refresh();
    } catch {
      setSaveError("در ارتباط با سرور مشکلی پیش آمد.");
    } finally {
      setSaving(false);
    }
  }

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
                <Title level={4} style={{ margin: 0, marginTop: 2 }}>
                  {isEdit ? "ویرایش اپ" : "افزودن اپ"}
                </Title>
              </div>

              <Space>
                <Button onClick={() => router.push("/superadmin/apps")}>
                  بازگشت
                </Button>
                <Button href="/" target="_blank">
                  مشاهده سایت
                </Button>
              </Space>
            </Header>

            <Content className="p-4 sm:p-6 lg:p-8">
              <div className="mx-auto max-w-[1200px]">
                <div className="mb-7">
                  <Text className="text-sm text-zinc-500">
                    {isEdit ? "ویرایش اطلاعات" : "اپ جدید"}
                  </Text>
                  <Title
                    level={2}
                    style={{
                      marginTop: 6,
                      marginBottom: 8,
                      fontWeight: 900,
                    }}
                  >
                    {isEdit
                      ? "ویرایش کامل اپ"
                      : "ثبت اپ از GitHub یا سایت رسمی"}
                  </Title>
                  <Text type="secondary">
                    اطلاعات اصلی، منبع، پلتفرم‌ها، لینک‌های دانلود و تصاویر
                    را یک‌جا مدیریت کن.
                  </Text>
                </div>

                <Form<AppFormValues>
                  form={form}
                  layout="vertical"
                  onFinish={submit}
                  initialValues={{
                    status: "PUBLISHED",
                    isFeatured: false,
                    sortOrder: 0,
                    categoryIds: [],
                    platformIds: [],
                    links: [],
                    screenshots: [],
                    ...initialData,
                  }}
                >
                  <div className="space-y-5">
                    <Card
                      variant="outlined"
                      title="اطلاعات اصلی"
                      styles={{ body: { padding: 22 } }}
                    >
                      <div className="grid gap-x-4 md:grid-cols-2">
                        <Form.Item
                          label="نام انگلیسی"
                          name="name"
                          rules={[
                            {
                              required: true,
                              message: "نام انگلیسی اپ را وارد کن.",
                            },
                          ]}
                        >
                          <Input dir="ltr" placeholder="OBS Studio" />
                        </Form.Item>

                        <Form.Item label="نام فارسی" name="nameFa">
                          <Input placeholder="OBS Studio" />
                        </Form.Item>

                        <Form.Item
                          label="Slug"
                          name="slug"
                          rules={[
                            {
                              required: true,
                              message: "Slug را وارد کن.",
                            },
                            {
                              pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                              message:
                                "فقط حروف انگلیسی کوچک، عدد و خط تیره.",
                            },
                          ]}
                        >
                          <Input dir="ltr" placeholder="obs-studio" />
                        </Form.Item>

                        <Form.Item
                          label="توسعه‌دهنده / سازمان"
                          name="developerName"
                        >
                          <Input placeholder="OBS Project" />
                        </Form.Item>
                      </div>

                      <Form.Item
                        label="توضیح کوتاه فارسی"
                        name="shortDescriptionFa"
                        rules={[
                          {
                            required: true,
                            message: "توضیح کوتاه فارسی را وارد کن.",
                          },
                        ]}
                      >
                        <TextArea rows={3} showCount maxLength={300} />
                      </Form.Item>

                      <Form.Item
                        label="معرفی کامل فارسی"
                        name="descriptionFa"
                      >
                        <TextArea rows={8} />
                      </Form.Item>

                      <div className="grid gap-x-4 md:grid-cols-2">
                        <Form.Item label="مجوز" name="licenseName">
                          <Input dir="ltr" placeholder="GPL-2.0-or-later" />
                        </Form.Item>

                        <Form.Item
                          label="کلمات کلیدی جست‌وجو"
                          name="searchKeywords"
                        >
                          <Input placeholder="obs, استریم, ضبط صفحه..." />
                        </Form.Item>
                      </div>
                    </Card>

                    <Card
                      variant="outlined"
                      title="منبع، سایت و لوگو"
                      styles={{ body: { padding: 22 } }}
                    >
                      <div className="grid gap-x-4 md:grid-cols-2">
                        <Form.Item
                          label="Repository URL"
                          name="repositoryUrl"
                          rules={[{ type: "url", message: "URL معتبر وارد کن." }]}
                        >
                          <Input dir="ltr" />
                        </Form.Item>

                        <Form.Item
                          label="وب‌سایت رسمی"
                          name="websiteUrl"
                          rules={[{ type: "url", message: "URL معتبر وارد کن." }]}
                        >
                          <Input dir="ltr" />
                        </Form.Item>
                      </div>

                        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                          <Form.Item
                            label={"\u0622\u062f\u0631\u0633 \u0644\u0648\u06af\u0648"}
                            name="logoUrl"
                            rules={[
                              {
                                type: "url",
                                message:
                                  "\u0622\u062f\u0631\u0633 URL \u0645\u0639\u062a\u0628\u0631 \u0648\u0627\u0631\u062f \u06a9\u0646.",
                              },
                            ]}
                            className="mb-0"
                          >
                            <Input
                              dir="ltr"
                              placeholder="https://..."
                            />
                          </Form.Item>

                          <Upload
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            showUploadList={false}
                            customRequest={async ({
                              file,
                              onSuccess,
                              onError,
                            }) => {
                              setUploadingLogo(true);
                              setSaveError("");

                              try {
                                const url = await uploadMedia(
                                  file as File,
                                  "LOGO",
                                );

                                form.setFieldValue("logoUrl", url);
                                onSuccess?.({});
                              } catch (error) {
                                const uploadError =
                                  error instanceof Error
                                    ? error
                                    : new Error(
                                        "\u0622\u067e\u0644\u0648\u062f \u0644\u0648\u06af\u0648 \u0627\u0646\u062c\u0627\u0645 \u0646\u0634\u062f.",
                                      );

                                setSaveError(uploadError.message);
                                onError?.(uploadError);
                              } finally {
                                setUploadingLogo(false);
                              }
                            }}
                          >
                            <Button loading={uploadingLogo}>
                              {"\u0622\u067e\u0644\u0648\u062f \u0644\u0648\u06af\u0648"}
                            </Button>
                          </Upload>
                        </div>
                    </Card>

                    <Card
                      variant="outlined"
                      title="دسته‌بندی و پلتفرم‌ها"
                      styles={{ body: { padding: 22 } }}
                    >
                      <div className="grid gap-x-4 md:grid-cols-2">
                        <Form.Item label="دسته‌بندی‌ها" name="categoryIds">
                          <Select
                            mode="multiple"
                            allowClear
                            options={categories.map((item) => ({
                              value: item.id,
                              label: item.name,
                            }))}
                          />
                        </Form.Item>

                        <Form.Item label="پلتفرم‌ها" name="platformIds">
                          <Select
                            mode="multiple"
                            allowClear
                            options={platforms.map((item) => ({
                              value: item.id,
                              label: item.name,
                            }))}
                          />
                        </Form.Item>
                      </div>
                    </Card>

                    <Card
                      variant="outlined"
                      title="لینک‌های رسمی و دانلود"
                      styles={{ body: { padding: 22 } }}
                    >
                      <Form.List name="links">
                        {(fields, { add, remove }) => (
                          <div className="space-y-4">
                            {fields.map(({ key, name, ...restField }) => (
                              <div
                                key={key}
                                className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
                              >
                                <div className="grid gap-x-3 md:grid-cols-2 xl:grid-cols-4">
                                  <Form.Item
                                    {...restField}
                                    label="عنوان"
                                    name={[name, "labelFa"]}
                                    rules={[{ required: true }]}
                                  >
                                    <Input />
                                  </Form.Item>

                                  <Form.Item
                                    {...restField}
                                    label="نوع لینک"
                                    name={[name, "linkType"]}
                                  >
                                    <Select options={linkTypeOptions} />
                                  </Form.Item>

                                  <Form.Item
                                    {...restField}
                                    label="پلتفرم"
                                    name={[name, "platformId"]}
                                  >
                                    <Select
                                      allowClear
                                      options={platforms.map((item) => ({
                                        value: item.id,
                                        label: item.name,
                                      }))}
                                    />
                                  </Form.Item>

                                  <Form.Item
                                    {...restField}
                                    label="ترتیب"
                                    name={[name, "sortOrder"]}
                                  >
                                    <InputNumber min={0} className="w-full" />
                                  </Form.Item>
                                </div>

                                <Form.Item
                                  {...restField}
                                  label="URL رسمی"
                                  name={[name, "url"]}
                                  rules={[
                                    { required: true },
                                    {
                                      type: "url",
                                      message: "URL معتبر وارد کن.",
                                    },
                                  ]}
                                >
                                  <Input dir="ltr" />
                                </Form.Item>

                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <Form.Item
                                    {...restField}
                                    name={[name, "isPrimary"]}
                                    valuePropName="checked"
                                    className="mb-0"
                                  >
                                    <Switch
                                      checkedChildren="لینک اصلی"
                                      unCheckedChildren="معمولی"
                                    />
                                  </Form.Item>

                                  <Button danger onClick={() => remove(name)}>
                                    حذف لینک
                                  </Button>
                                </div>
                              </div>
                            ))}

                            <Button
                              type="dashed"
                              block
                              onClick={() =>
                                add({
                                  linkType: "DOWNLOAD",
                                  isPrimary: false,
                                  sortOrder: fields.length * 10,
                                })
                              }
                            >
                              + افزودن لینک رسمی / دانلود
                            </Button>
                          </div>
                        )}
                      </Form.List>
                    </Card>

                    <Card
                      variant="outlined"
                      title="تصاویر و Screenshotها"
                      styles={{ body: { padding: 22 } }}
                    >
                      <Form.List name="screenshots">
                        {(fields, { add, remove }) => (
                          <div className="space-y-4">
                            {fields.map(({ key, name, ...restField }) => (
                              <div
                                key={key}
                                className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
                              >
                                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                                  <Form.Item
                                    {...restField}
                                    label={"URL \u062a\u0635\u0648\u06cc\u0631"}
                                    name={[name, "imageUrl"]}
                                    rules={[
                                      { required: true },
                                      {
                                        type: "url",
                                        message:
                                          "\u0622\u062f\u0631\u0633 URL \u0645\u0639\u062a\u0628\u0631 \u0648\u0627\u0631\u062f \u06a9\u0646.",
                                      },
                                    ]}
                                    className="mb-0"
                                  >
                                    <Input
                                      dir="ltr"
                                      placeholder="https://..."
                                    />
                                  </Form.Item>

                                  <Upload
                                    accept="image/jpeg,image/png,image/webp,image/avif"
                                    showUploadList={false}
                                    customRequest={async ({
                                      file,
                                      onSuccess,
                                      onError,
                                    }) => {
                                      setUploadingScreenshot(name);
                                      setSaveError("");

                                      try {
                                        const url = await uploadMedia(
                                          file as File,
                                          "SCREENSHOT",
                                        );

                                        form.setFieldValue(
                                          [
                                            "screenshots",
                                            name,
                                            "imageUrl",
                                          ],
                                          url,
                                        );

                                        onSuccess?.({});
                                      } catch (error) {
                                        const uploadError =
                                          error instanceof Error
                                            ? error
                                            : new Error(
                                                "\u0622\u067e\u0644\u0648\u062f Screenshot \u0627\u0646\u062c\u0627\u0645 \u0646\u0634\u062f.",
                                              );

                                        setSaveError(
                                          uploadError.message,
                                        );
                                        onError?.(uploadError);
                                      } finally {
                                        setUploadingScreenshot(null);
                                      }
                                    }}
                                  >
                                    <Button
                                      loading={
                                        uploadingScreenshot === name
                                      }
                                    >
                                      {"\u0622\u067e\u0644\u0648\u062f \u062a\u0635\u0648\u06cc\u0631"}
                                    </Button>
                                  </Upload>
                                </div>

                                <div className="grid gap-x-3 md:grid-cols-2 xl:grid-cols-3">
                                  <Form.Item
                                    {...restField}
                                    label="عنوان فارسی"
                                    name={[name, "titleFa"]}
                                  >
                                    <Input />
                                  </Form.Item>

                                  <Form.Item
                                    {...restField}
                                    label="متن جایگزین"
                                    name={[name, "altFa"]}
                                  >
                                    <Input />
                                  </Form.Item>

                                  <Form.Item
                                    {...restField}
                                    label="ترتیب"
                                    name={[name, "sortOrder"]}
                                  >
                                    <InputNumber min={0} className="w-full" />
                                  </Form.Item>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <Form.Item
                                    {...restField}
                                    name={[name, "isActive"]}
                                    valuePropName="checked"
                                    className="mb-0"
                                  >
                                    <Switch
                                      checkedChildren="فعال"
                                      unCheckedChildren="غیرفعال"
                                    />
                                  </Form.Item>

                                  <Button danger onClick={() => remove(name)}>
                                    حذف تصویر
                                  </Button>
                                </div>
                              </div>
                            ))}

                            <Button
                              type="dashed"
                              block
                              onClick={() =>
                                add({
                                  sortOrder: fields.length * 10,
                                  isActive: true,
                                })
                              }
                            >
                              + افزودن Screenshot
                            </Button>
                          </div>
                        )}
                      </Form.List>
                    </Card>

                    <Card
                      variant="outlined"
                      title="انتشار"
                      styles={{ body: { padding: 22 } }}
                    >
                      <div className="grid gap-x-4 md:grid-cols-3">
                        <Form.Item label="وضعیت" name="status">
                          <Select
                            options={[
                              { value: "DRAFT", label: "پیش‌نویس" },
                              { value: "PUBLISHED", label: "منتشرشده" },
                              { value: "ARCHIVED", label: "آرشیوشده" },
                            ]}
                          />
                        </Form.Item>

                        <Form.Item label="ترتیب نمایش" name="sortOrder">
                          <InputNumber min={0} className="w-full" />
                        </Form.Item>

                        <Form.Item
                          label="اپ ویژه"
                          name="isFeatured"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </div>
                    </Card>

                    {saveError && (
                      <div className="rounded-2xl border border-red-900/40 bg-red-950/30 px-5 py-4 text-sm leading-7 text-red-300">
                        {saveError}
                      </div>
                    )}

                    <div className="sticky bottom-4 z-10 flex flex-wrap justify-end gap-3 rounded-2xl border border-white/[0.08] bg-[#0b1710]/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
                      <Button
                        size="large"
                        disabled={saving}
                        onClick={() => router.push("/superadmin/apps")}
                      >
                        انصراف
                      </Button>

                      <Button
                        type="primary"
                        size="large"
                        loading={saving}
                        onClick={() => form.submit()}
                      >
                        {isEdit ? "ذخیره تغییرات" : "ثبت اپ"}
                      </Button>
                    </div>
                  </div>
                </Form>
              </div>
            </Content>
          </Layout>
        </Layout>
      </App>
    </ConfigProvider>
  );
}
