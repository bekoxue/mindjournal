import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

// Local dev: force-load .env.local to fix workspace root misdetection
// (not needed in production — Netlify/Vercel inject env vars directly)
if (process.env.NODE_ENV !== "production") {
  const envPath = path.resolve(__dirname, ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
    }
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
