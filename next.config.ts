import type { NextConfig } from "next";
import path from "path";

const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
    turbopack: {},
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
