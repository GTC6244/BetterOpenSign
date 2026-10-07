import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "docsign",
    compatibilityDate: "2026-10-06",
    assets: {
      notFoundHandling: "single-page-application"
    },
    domains: ["docsign.bettersign.ing"]
  }
});
