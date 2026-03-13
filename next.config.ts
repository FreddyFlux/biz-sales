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
              "frame-ancestors https://*.teams.microsoft.com https://*.teams.live.com https://*.skype.com https://*.teams.microsoft.us https://*.gov.teams.microsoft.us 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
