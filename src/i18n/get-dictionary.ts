import "server-only";
import type { Language } from "@/types";

const dictionaries = {
  en: () => import("../../public/locales/en/common.json").then((m) => m.default),
  bn: () => import("../../public/locales/bn/common.json").then((m) => m.default),
};

/**
 * Minimal server-side dictionary loader — avoids pulling in a full i18n
 * framework for a two-language site. For client components needing
 * translations, fetch `/locales/{lang}/common.json` directly or lift
 * the dictionary down as a prop from a Server Component parent.
 */
export async function getDictionary(lang: Language) {
  return dictionaries[lang]?.() ?? dictionaries.en();
}
