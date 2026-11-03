export default function robots() { return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/cart", "/admin"] }, sitemap: "https://seiszn.in/sitemap.xml" }; }
