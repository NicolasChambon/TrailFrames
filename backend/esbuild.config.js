import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outfile: "dist/index.js",
  external: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
    ".prisma/client",
  ],
  sourcemap: true,
  minify: false,
  banner: {
    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
  },
});

console.log("✅ Build completed successfully");
