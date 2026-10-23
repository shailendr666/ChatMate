import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      typography: {
        invert: {
          css: {
            color: "#e5e7eb",
            lineHeight: "1.75",
            p: {
              marginTop: "0.75em",
              marginBottom: "0.75em",
            },
            li: {
              marginTop: "0.5em",
              marginBottom: "0.5em",
            },
            ul: {
              paddingLeft: "1.25em",
            },
            ol: {
              paddingLeft: "1.25em",
            },
            code: {
              backgroundColor: "#111827",
              padding: "0.25em 0.4em",
              borderRadius: "0.375rem",
              fontWeight: "500",
            },
            pre: {
              backgroundColor: "#020617",
              padding: "1rem",
              borderRadius: "0.75rem",
              marginTop: "1.25em",
              marginBottom: "1.25em",
              overflowX: "auto",
            },
          },
        },
      },
    },
  },
  plugins: [import "@tailwindcss/typography"],
};

export default config;
