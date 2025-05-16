import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/latex-playground",
  assetPrefix: "/latex-playground/",
  trailingSlash: true
}

export default nextConfig
