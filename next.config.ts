import type { NextConfig } from "next";
import path from "path";

const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
    // Ensure @composio/core is only used on the server (uses node:crypto)
    serverExternalPackages: ['@composio/core'],
    turbopack: {},
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "media.licdn.com",
                pathname: "/**",
            },
        ],
    },
    webpack: (config) => {
        config.resolve.modules = [
            path.join(projectRoot, "node_modules"),
            ...(config.resolve.modules || []),
        ];
        config.context = projectRoot;
        return config;
    },
};

export default nextConfig;
