/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production"
const basePath = isProd ? "/latex-playground" : ""

export default {
    output: "export",
    images: { unoptimized: true },
    basePath: basePath,
    env: { NEXT_PUBLIC_BASE_PATH: basePath },
}
