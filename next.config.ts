import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

// Resolve .ldo/solid.shapeTypes.js: use project-local re-export so Turbopack gets a relative path
const projectLdoPath = path.join(process.cwd(), ".ldo", "solid.shapeTypes.js");
const hasProjectLdo = fs.existsSync(projectLdoPath);

// Fallback for webpack when project .ldo exists: alias to project file (npm layout)
const webpackAliasPath = hasProjectLdo
  ? projectLdoPath
  : path.join(process.cwd(), "node_modules/@ldo/connected-solid/dist/.ldo/solid.shapeTypes.js");

const nextConfig: NextConfig = {
  transpilePackages: ["solid-react-component"],
  turbopack: {
    resolveAlias: {
      ".ldo/solid.shapeTypes.js": "./.ldo/solid.shapeTypes.js",
    },
  },
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      ".ldo/solid.shapeTypes.js": webpackAliasPath,
    };
    return config;
  },
};

export default nextConfig;
