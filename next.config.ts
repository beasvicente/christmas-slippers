import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.1.115"],
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    const privacyHeaders = [
      {key: "Cache-Control", value: "private, no-cache, no-store, max-age=0, must-revalidate"},
      {key: "Referrer-Policy", value: "no-referrer"},
      {key: "X-Robots-Tag", value: "noindex, nofollow"},
    ];
    return [
      {source: "/invitation-preview", headers: privacyHeaders},
      {source: "/en/invitation-preview", headers: privacyHeaders},
      {source: "/invite/:token", headers: privacyHeaders},
      {source: "/en/invite/:token", headers: privacyHeaders},
    ];
  },
};

export default withNextIntl(nextConfig);
