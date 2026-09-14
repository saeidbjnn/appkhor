"use client";

import { useState } from "react";
import { Button } from "antd";

export default function SuperadminLogoutButton() {
  const [loading, setLoading] =
    useState(false);

  async function logout() {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/superadmin/logout",
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(
          "Logout request failed.",
        );
      }

      window.location.href =
        "/superadmin";
    } catch (error) {
      console.error(
        "Superadmin logout failed:",
        error,
      );

      setLoading(false);
    }
  }

  return (
    <Button
      danger
      block
      loading={loading}
      onClick={logout}
    >
      {"\u062e\u0631\u0648\u062c"}
    </Button>
  );
}
