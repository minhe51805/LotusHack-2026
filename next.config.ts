import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.36.75",
    "ixbgy-171-244-236-159.a.free.pinggy.link",
  ],
  async headers() {
    return [
      {
        // Allow /chat to be embedded in any iframe
        source: "/chat",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { key: "Content-Security-Policy", value: "frame-ancestors *;" },
        ],
      },
    ];
  },
};

export default nextConfig;
