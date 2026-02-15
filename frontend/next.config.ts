import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      // Allow Stripe globally (required for iframe nesting)
      "default-src 'self' https://js.stripe.com https://hooks.stripe.com",

      // Scripts
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",

      // Frames (Stripe Elements)
      "frame-src https://js.stripe.com https://hooks.stripe.com",

      // Network calls
      `connect-src 'self' ${API_URL} https://api.stripe.com https://js.stripe.com https://m.stripe.network https://hooks.stripe.com https://tourhub.space https://api.tourhub.space https://firebasestorage.googleapis.com http://localhost:8080`,

      // Styles
      "style-src 'self' 'unsafe-inline'",

      // Images
      "img-src 'self' data: https://firebasestorage.googleapis.com https://ui-avatars.com https://*.stripe.com",

      // Fonts & hardening
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'none'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
