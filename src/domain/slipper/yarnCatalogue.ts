export type YarnType = "uni" | "mix" | "print";

export type RetailerStockStatus = "in-stock" | "out-of-stock";

export type PreviewHexColor = `#${string}`;

interface YarnColorDefinition {
  /** Stable manufacturer colour number, including any leading zero. */
  id: string;
  manufacturer: "DROPS";
  productLine: "Snow";
  name: string;
  yarnType: YarnType;
  /** Selection eligibility is independent from the retailer's stock snapshot. */
  selectable: boolean;
  /** Hand-tuned screen preview only; it is not a dye-lot colour specification. */
  approximateHex: PreviewHexColor;
  /** Optional palette for future richer previews of mix and print yarns. */
  representativeHexes?: readonly [PreviewHexColor, ...PreviewHexColor[]];
  availability: {
    retailer: "Laral Crafts";
    retailerListed: true;
    stockStatus: RetailerStockStatus;
    checkedOn: "2026-10-28";
  };
}

export const DROPS_SNOW_CATALOGUE_METADATA = {
  manufacturerSourceUrl:
    "https://www.garnstudio.com/yarn.php?cid=26&show=drops-snow",
  retailerSourceUrl: "https://www.laralcrafts.com/products/drops-snow",
  verifiedOn: "2026-10-28",
  previewColourNote:
    "Primary and representative HEX values are hand-tuned visual approximations for digital previews. They are not sampled product colours and may not match physical yarn or dye lots.",
  stockNote:
    "Stock statuses are a dated retailer snapshot, not live inventory. Every retailer-listed colour remains selectable for gift requests when temporarily out of stock.",
} as const;

/**
 * Current DROPS colours that were not variants on the Laral Crafts product page
 * when this catalogue was verified. They are documented, but intentionally not
 * selectable until the retailer lists them.
 */
export const RETAILER_UNLISTED_DROPS_SNOW_COLORS = [
  { id: "144", name: "brick red", yarnType: "mix" },
  { id: "145", name: "burnt orange", yarnType: "mix" },
] as const;

function defineYarnColor<const Id extends string>(
  id: Id,
  name: string,
  yarnType: YarnType,
  approximateHex: PreviewHexColor,
  stockStatus: RetailerStockStatus = "in-stock",
  representativeHexes?: readonly [PreviewHexColor, ...PreviewHexColor[]],
): YarnColorDefinition & { id: Id } {
  return {
    id,
    manufacturer: "DROPS",
    productLine: "Snow",
    name,
    yarnType,
    selectable: true,
    approximateHex,
    ...(representativeHexes ? { representativeHexes } : {}),
    availability: {
      retailer: "Laral Crafts",
      retailerListed: true,
      stockStatus,
      checkedOn: "2026-10-28",
    },
  };
}

/**
 * The 87 DROPS Snow colours listed by Laral Crafts on 2026-10-28.
 * Names and yarn types use the manufacturer's English catalogue terminology.
 */
export const DROPS_SNOW_YARN_COLORS = [
  defineYarnColor("01", "off white", "uni", "#F3EFE1", "out-of-stock"),
  defineYarnColor(
    "141",
    "electric sprinkles",
    "print",
    "#B56A9B",
    "out-of-stock",
    ["#B56A9B", "#3C7C91", "#E2B64B"],
  ),
  defineYarnColor("102", "marshmallow", "uni", "#FFF7ED"),
  defineYarnColor("123", "cacao bits", "print", "#A58B73"),
  defineYarnColor("124", "ink spots", "print", "#86858A"),
  defineYarnColor("88", "chalk", "uni", "#E5DED0"),
  defineYarnColor("135", "grey whisper", "mix", "#A9A29B", "in-stock", [
    "#A9A29B",
    "#D1CBC1",
    "#77736F",
  ]),
  defineYarnColor("134", "moonlight", "mix", "#D7CFC4"),
  defineYarnColor("53", "light grey", "uni", "#C7C7C5"),
  defineYarnColor("46", "medium grey", "uni", "#8F9291", "out-of-stock"),
  defineYarnColor("14", "dark grey", "uni", "#4A4B4D"),
  defineYarnColor("03", "dark brown", "uni", "#4B3027"),
  defineYarnColor("90", "toffee", "uni", "#B87B51"),
  defineYarnColor("23", "bark", "mix", "#8A6D59"),
  defineYarnColor("131", "dusty brown", "mix", "#856D61"),
  defineYarnColor("48", "nougat", "mix", "#B99A83"),
  defineYarnColor("117", "almond", "uni", "#D9BFA4"),
  defineYarnColor("129", "rust oak", "mix", "#9A5C44"),
  defineYarnColor("47", "light beige", "mix", "#CBB69C"),
  defineYarnColor("13", "powder", "uni", "#D9C4B8"),
  defineYarnColor("128", "oat milk", "mix", "#DCCDB7"),
  defineYarnColor("133", "marble", "mix", "#B8AEA5"),
  defineYarnColor("130", "marzipan", "mix", "#E7D4B1"),
  defineYarnColor("138", "winter carnival", "print", "#8D6E78"),
  defineYarnColor("106", "lemonade", "uni", "#F2DB72"),
  defineYarnColor("109", "dandelion", "uni", "#E6B72F"),
  defineYarnColor("24", "yellow", "uni", "#F2C229"),
  defineYarnColor("85", "curry", "mix", "#B58B2B"),
  defineYarnColor("101", "tangerine", "uni", "#E97935"),
  defineYarnColor("86", "copper", "mix", "#A9603C"),
  defineYarnColor("07", "orange", "uni", "#E56D26"),
  defineYarnColor("120", "red", "uni", "#C52B34"),
  defineYarnColor("56", "christmas red", "uni", "#B51F2E", "out-of-stock"),
  defineYarnColor("08", "crimson red", "uni", "#9E2334"),
  defineYarnColor("111", "coral", "uni", "#E8786F"),
  defineYarnColor("112", "sweet apricot", "uni", "#F3A878"),
  defineYarnColor("110", "light peach", "uni", "#F6C2A7"),
  defineYarnColor("139", "rainbow sprinkles", "print", "#C8849E"),
  defineYarnColor("107", "peach pink", "uni", "#ECA29B"),
  defineYarnColor("51", "powder pink", "uni", "#E9B9C3"),
  defineYarnColor("127", "baby pink", "uni", "#F2C8D1"),
  defineYarnColor("30", "pastel pink", "uni", "#E8A9B6"),
  defineYarnColor("113", "rose petal", "uni", "#D47B8E", "out-of-stock"),
  defineYarnColor("105", "magenta", "uni", "#B51E68"),
  defineYarnColor("26", "hot pink", "uni", "#E83E8C"),
  defineYarnColor("09", "old pink", "uni", "#C47782"),
  defineYarnColor("95", "maroon", "uni", "#7A3038"),
  defineYarnColor("121", "ruby red", "uni", "#9E1833"),
  defineYarnColor("119", "plum wine", "uni", "#6B2D4B"),
  defineYarnColor("118", "dark grape", "uni", "#44253F"),
  defineYarnColor("10", "mulberry purple", "uni", "#5C2C58"),
  defineYarnColor("91", "grape", "uni", "#704069"),
  defineYarnColor("142", "autumn spice", "print", "#A35B3F"),
  defineYarnColor("36", "peony pink", "mix", "#C9849C"),
  defineYarnColor("143", "fairytale", "print", "#9F7AA5"),
  defineYarnColor("54", "lavender", "uni", "#A88DB8"),
  defineYarnColor("114", "lavender frost", "uni", "#C7B8D4"),
  defineYarnColor("12", "light blue", "uni", "#90B9D8"),
  defineYarnColor("21", "blue shadow", "mix", "#6D829C"),
  defineYarnColor("116", "midnight shadow", "uni", "#27374F"),
  defineYarnColor("122", "dark navy", "uni", "#162944"),
  defineYarnColor("57", "navy blue", "uni", "#203C63"),
  defineYarnColor("15", "dark blue", "uni", "#244A78"),
  defineYarnColor("104", "cobalt blue", "uni", "#1E5FB5"),
  defineYarnColor("100", "dark petrol", "mix", "#1F5661"),
  defineYarnColor("05", "petrol", "uni", "#1D8391"),
  defineYarnColor("84", "peacock blue", "mix", "#237A8A"),
  defineYarnColor("87", "fog", "mix", "#8DA4A6"),
  defineYarnColor("137", "washed denim", "print", "#66839B"),
  defineYarnColor("132", "winter fog", "mix", "#AAB5B5"),
  defineYarnColor("125", "morning mist", "uni", "#B8CCCD"),
  defineYarnColor("31", "pastel blue", "uni", "#98C4D8"),
  defineYarnColor("37", "aquamarine", "mix", "#69B5B4"),
  defineYarnColor("66", "sea green", "uni", "#2F8C79"),
  defineYarnColor("140", "colour carnival", "print", "#6C8E70"),
  defineYarnColor("103", "parrot green", "uni", "#38A74E"),
  defineYarnColor("25", "hot green", "uni", "#4DBB3F"),
  defineYarnColor("136", "garden party", "print", "#6F9B60"),
  defineYarnColor("99", "north sea", "uni", "#3D716B"),
  defineYarnColor("97", "dark ivy", "uni", "#234A36"),
  defineYarnColor("98", "sage green", "uni", "#7D9B7A"),
  defineYarnColor("108", "pistachio ice cream", "uni", "#B9CF8E"),
  defineYarnColor("126", "green haze", "uni", "#9CB9A0"),
  defineYarnColor("29", "apple green", "uni", "#83BC42"),
  defineYarnColor("115", "bright olive", "uni", "#839334"),
  defineYarnColor("92", "dark moss", "uni", "#3E5634"),
  defineYarnColor("02", "black", "uni", "#1D1D1F"),
] as const;

export type YarnColorId = (typeof DROPS_SNOW_YARN_COLORS)[number]["id"];

export type YarnColor = Omit<YarnColorDefinition, "id"> & { id: YarnColorId };

const yarnColorIds = new Set<string>(
  DROPS_SNOW_YARN_COLORS.map(({ id }) => id),
);

export function isYarnColorId(value: unknown): value is YarnColorId {
  return typeof value === "string" && yarnColorIds.has(value);
}

export function getYarnColorById(id: YarnColorId): YarnColor {
  const color = DROPS_SNOW_YARN_COLORS.find((entry) => entry.id === id);

  // The YarnColorId union is derived from this catalogue, so this is invariant.
  if (!color) {
    throw new Error(`Unknown DROPS Snow colour: ${id}`);
  }

  return color;
}
