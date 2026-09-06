"use client";

import { useEffect, useState } from "react";

export type DevicePlatform =
  | "android"
  | "ios"
  | "windows"
  | "macos"
  | "linux"
  | null;

function detectDevicePlatform(): DevicePlatform {
  if (typeof navigator === "undefined") {
    return null;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform?.toLowerCase() ?? "";

  if (userAgent.includes("android")) {
    return "android";
  }

  if (
    /iphone|ipad|ipod/.test(userAgent) ||
    (platform === "macintel" && navigator.maxTouchPoints > 1)
  ) {
    return "ios";
  }

  if (userAgent.includes("windows")) {
    return "windows";
  }

  if (userAgent.includes("mac os") || platform.includes("mac")) {
    return "macos";
  }

  if (userAgent.includes("linux")) {
    return "linux";
  }

  return null;
}

export function useDevicePlatform() {
  const [devicePlatform, setDevicePlatform] =
    useState<DevicePlatform>(null);

  useEffect(() => {
    setDevicePlatform(detectDevicePlatform());
  }, []);

  return devicePlatform;
}
