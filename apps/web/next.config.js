/** @type {import('next').NextConfig} */
export const config = {
    reactStrictMode: true,
    transpilePackages: ["@repo/ui"],
    output: "standalone",
}

export default config
