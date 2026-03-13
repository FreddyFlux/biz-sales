import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors https://teams.microsoft.com https://*.teams.microsoft.com https://teams.cloud.microsoft https://*.teams.cloud.microsoft https://*.cloud.microsoft https://*.teams.live.com https://*.skype.com https://*.teams.microsoft.us https://*.gov.teams.microsoft.us https://local.teams.office.com 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
