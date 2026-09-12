export interface NavLinkItem {
  label: string;
  href: string;
  description?: string;
  badge?: "NEW" | "SALE";
}

export interface NavMegaColumn {
  title: string;
  links: NavLinkItem[];
}

export interface FutureNavItem {
  label: string;
  enabled: boolean;
  description: string;
}

/** Top navbar — home link (left of Collection) */
export const HOME_NAV_LINK: NavLinkItem = { label: "Home", href: "/" };

/** Top-level mega menu trigger — personal brand catalog */
export const COLLECTION_NAV_LABEL = "Collection";

/** Top navbar links — brand & support (not shop catalog) */
export const PRIMARY_NAV_LINKS: NavLinkItem[] = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/faq" },
];

export const COLLECTION_FALLBACK_CATEGORIES: NavLinkItem[] = [
  { label: "Shirts", href: "/product?category=shirts", description: "Tailored & casual" },
  { label: "T-Shirts", href: "/product?category=t-shirts", description: "Essential cotton" },
  { label: "Pants", href: "/product?category=pants", description: "Structured bottoms" },
];

export const FUTURE_NAV_ITEMS: FutureNavItem[] = [
  { label: "Women", enabled: false, description: "Coming soon" },
  { label: "Perfume", enabled: false, description: "Coming soon" },
];

export const SEARCH_SUGGESTIONS = [
  "Oxford shirts",
  "Linen shirts",
  "New arrivals",
  "Sale picks",
  "Premium cotton",
];

/** Collection dropdown — shop discovery links (not in top navbar) */
export const COLLECTION_BROWSE_LINKS: NavLinkItem[] = [
  { label: "New Arrivals", href: "/product?sort=newest", badge: "NEW", description: "Latest drops from AIRAVÉ" },
  { label: "Sale", href: "/product?onSale=true", badge: "SALE", description: "Limited-time offers" },
  { label: "Best Sellers", href: "/product?sort=popular", description: "Most loved pieces" },
  { label: "View All Collection", href: "/product", description: "Explore the full catalog" },
];

export function buildCollectionMegaColumns(
  categories: Array<{ name: string; slug: string; itemCount?: number }>,
): NavMegaColumn[] {
  const categoryLinks: NavLinkItem[] =
    categories.length > 0
      ? categories.map((cat) => ({
          label: cat.name,
          href: `/product?category=${cat.slug}`,
          description: cat.itemCount ? `${cat.itemCount} pieces` : undefined,
        }))
      : COLLECTION_FALLBACK_CATEGORIES;

  return [
    {
      title: "Shop by Category",
      links: categoryLinks,
    },
    {
      title: "Browse",
      links: COLLECTION_BROWSE_LINKS,
    },
  ];
}

/** Mobile collection drawer links (categories passed in separately) */
export const COLLECTION_MOBILE_BROWSE_LINKS = COLLECTION_BROWSE_LINKS;
