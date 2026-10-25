import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  // Pengalihan rute alias lama ke rute kanonikal modular (/tenant/*)
  async redirects() {
    return [
      { source: "/dashboard", destination: "/tenant", permanent: true },
      { source: "/user", destination: "/tenant", permanent: true },
      { source: "/user/notifications", destination: "/tenant/notifications", permanent: true },
      { source: "/notifications", destination: "/tenant/notifications", permanent: true },
      { source: "/tagihan", destination: "/tenant/bills", permanent: true },
      { source: "/bayar", destination: "/tenant/pay", permanent: true },
      { source: "/kulkas", destination: "/tenant/food", permanent: true },
      { source: "/makanan", destination: "/tenant/food", permanent: true },
      { source: "/tambah-makanan", destination: "/tenant/food/new", permanent: true },
      { source: "/penyimpanan", destination: "/tenant/storage", permanent: true },
      { source: "/barang-saya", destination: "/tenant/storage/my-items", permanent: true },
      { source: "/tambah-barang", destination: "/tenant/storage/new", permanent: true },
      { source: "/laporan", destination: "/tenant/maintenance", permanent: true },
      { source: "/laporan/baru", destination: "/tenant/maintenance/new", permanent: true },
      { source: "/unggah-bukti", destination: "/tenant/upload-proof", permanent: true },
      { source: "/unggah-ulang-bukti", destination: "/tenant/reupload-proof", permanent: true },
      { source: "/tenant/laporan", destination: "/tenant/maintenance", permanent: true },
      { source: "/tenant/laporan/baru", destination: "/tenant/maintenance/new", permanent: true },
      { source: "/tenant/unggah-ulang-bukti", destination: "/tenant/reupload-proof", permanent: true },
    ];
  },
};

export default nextConfig;
