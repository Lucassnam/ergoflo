import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // There's a stray package-lock.json in the home directory on this machine,
  // which makes Turbopack infer the wrong workspace root. Pin it.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
