import prisma from "../lib/prisma.js";

// In-memory cache for dynamic database synonyms with a 5-minute TTL
let cachedSynonymMap: Record<string, string[]> | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Generates algorithmic morphological and linguistic variations for any word
 * (singular/plural, hyphenation, compound words, -ed/-ing suffixes)
 */
export function generateMorphologicalVariations(rawToken: string): string[] {
  const token = rawToken.toLowerCase().trim();
  if (!token || token.length < 2) return [token];

  const variations = new Set<string>();
  variations.add(token);

  // 1. Hyphen & Spacing normalizations
  if (token.includes("-")) {
    variations.add(token.replace(/-/g, ""));
    variations.add(token.replace(/-/g, " "));
  }
  if (token.includes(" ")) {
    variations.add(token.replace(/\s+/g, ""));
    variations.add(token.replace(/\s+/g, "-"));
  }

  // 2. Plural <-> Singular dynamic normalization
  if (token.endsWith("ies") && token.length > 4) {
    variations.add(token.slice(0, -3) + "y"); // e.g. hoodies -> hoody
  } else if (token.endsWith("es") && token.length > 3) {
    variations.add(token.slice(0, -2)); // e.g. dresses -> dress
    variations.add(token.slice(0, -1)); // e.g. clothes -> clothe
  } else if (token.endsWith("s") && !token.endsWith("ss") && token.length > 3) {
    variations.add(token.slice(0, -1)); // e.g. tshirts -> tshirt, pants -> pant
  } else {
    // Singular to plural forms
    variations.add(token + "s");
    variations.add(token + "es");
  }

  // 3. Adjective / Verb suffix normalization (-ed, -ing, -ize)
  if (token.endsWith("ed") && token.length > 4) {
    variations.add(token.slice(0, -2)); // e.g. oversized -> oversize, pleated -> pleat
    variations.add(token.slice(0, -1)); // e.g. oversized -> oversize
  } else if (token.endsWith("ing") && token.length > 5) {
    variations.add(token.slice(0, -3)); // e.g. layering -> layer
  } else {
    variations.add(token + "ed");
    variations.add(token + "d");
  }

  return Array.from(variations).filter((v) => v.length >= 2);
}

/**
 * Fetches dynamic synonyms from database StoreSettings & live Taxonomies (Categories, Collections, Attributes)
 */
export async function getDynamicSearchSynonyms(): Promise<Record<string, string[]>> {
  const now = Date.now();
  if (cachedSynonymMap && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedSynonymMap;
  }

  const synonymMap: Record<string, string[]> = {};

  try {
    // 1. Fetch custom admin synonyms from StoreSetting
    const synonymSetting = await prisma.storeSetting.findUnique({
      where: { key: "search_synonyms" },
    });

    if (synonymSetting && typeof synonymSetting.value === "object" && synonymSetting.value !== null) {
      const customSynonyms = synonymSetting.value as Record<string, string[]>;
      Object.entries(customSynonyms).forEach(([key, values]) => {
        const lowerKey = key.toLowerCase().trim();
        const lowerValues = Array.isArray(values)
          ? values.map((v) => v.toLowerCase().trim())
          : [String(values).toLowerCase().trim()];

        synonymMap[lowerKey] = Array.from(new Set([...(synonymMap[lowerKey] || []), ...lowerValues]));
        // Bi-directional mapping for custom synonyms
        lowerValues.forEach((val) => {
          synonymMap[val] = Array.from(new Set([...(synonymMap[val] || []), lowerKey, ...lowerValues]));
        });
      });
    }

    // 2. Fetch live Categories from Database and build dynamic semantic relations
    const categories = await prisma.category.findMany({
      select: { name: true, slug: true },
    });

    categories.forEach((cat) => {
      const nameLower = cat.name.toLowerCase();
      const slugLower = cat.slug.toLowerCase();
      const nameVars = generateMorphologicalVariations(nameLower);
      const slugVars = generateMorphologicalVariations(slugLower);
      const allCatTerms = Array.from(new Set([nameLower, slugLower, ...nameVars, ...slugVars]));

      allCatTerms.forEach((term) => {
        synonymMap[term] = Array.from(new Set([...(synonymMap[term] || []), ...allCatTerms]));
      });
    });

    // 3. Fetch live Attributes & Attribute Values from Database
    const attributes = await prisma.attribute.findMany({
      include: { values: { select: { value: true, slug: true } } },
    });

    attributes.forEach((attr) => {
      attr.values.forEach((val) => {
        const valLower = val.value.toLowerCase();
        const slugLower = val.slug.toLowerCase();
        const valVars = generateMorphologicalVariations(valLower);
        const allValTerms = Array.from(new Set([valLower, slugLower, ...valVars]));

        allValTerms.forEach((term) => {
          synonymMap[term] = Array.from(new Set([...(synonymMap[term] || []), ...allValTerms]));
        });
      });
    });

    // 4. Common fashion industry equivalences (tees <-> t-shirts, bottoms <-> pants, etc.)
    const baseEquivalents: [string, string][] = [
      ["tee", "tshirt"],
      ["tees", "tshirts"],
      ["tshirt", "t-shirt"],
      ["pant", "trouser"],
      ["pants", "trousers"],
      ["cargo", "pants"],
      ["chino", "pants"],
      ["bottoms", "pants"],
      ["boxy", "oversized"],
      ["drop-shoulder", "oversized"],
      ["overshirt", "shirt"],
      ["button-down", "shirt"],
    ];

    baseEquivalents.forEach(([a, b]) => {
      const aVars = generateMorphologicalVariations(a);
      const bVars = generateMorphologicalVariations(b);
      const combined = Array.from(new Set([a, b, ...aVars, ...bVars]));
      combined.forEach((term) => {
        synonymMap[term] = Array.from(new Set([...(synonymMap[term] || []), ...combined]));
      });
    });

    cachedSynonymMap = synonymMap;
    lastCacheTime = now;
  } catch (error) {
    console.warn("Could not load dynamic database synonyms, falling back to morphological variations:", error);
  }

  return synonymMap;
}

/**
 * Given a raw search query, dynamically extracts, stems, and expands all search tokens
 */
export async function getExpandedSearchTokens(rawSearch: string): Promise<string[][]> {
  const cleanSearch = rawSearch.trim().toLowerCase();
  const rawTokens = cleanSearch.split(/\s+/).filter((t) => t.length > 0);
  const dbSynonymMap = await getDynamicSearchSynonyms();

  return rawTokens.map((token) => {
    // 1. Linguistic morphological variations
    const morphVars = generateMorphologicalVariations(token);

    // 2. Database and taxonomy synonym expansions
    const dbSynonyms = dbSynonymMap[token] || [];

    // 3. Sub-synonyms for morphological variations
    const subDbSynonyms = morphVars.flatMap((mv) => dbSynonymMap[mv] || []);

    const allExpansions = Array.from(
      new Set([token, ...morphVars, ...dbSynonyms, ...subDbSynonyms])
    ).filter((t) => t.length >= 2);

    return allExpansions;
  });
}
