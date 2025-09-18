export const siteConfig = {
  name: "AthenaCrypto",
  url: "",
  description:
    "Professional cryptocurrency tracking dashboard with real-time price updates.",
  baseLinks: {
    home: "/",
    dashboard: "/dashboard",
    overview: "/overview",
    details: "/details",
    settings: {
      general: "/settings/general",
      billing: "/settings/billing",
      users: "/settings/users",
    },
  },
}

export type siteConfig = typeof siteConfig
