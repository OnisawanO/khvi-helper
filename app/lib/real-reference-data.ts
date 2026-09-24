import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import {
  EMPTY_REFERENCE_CATALOG,
  type ReferenceCatalog,
  type ReferenceOption,
} from "./reference-catalog";

type LanguageRow = {
  language_code: string;
  language_name: string;
  language_name_th: string | null;
  language_name_zh: string | null;
};

type CategoryRow = {
  category_code: string;
  category_name: string;
  category_name_th: string | null;
  category_name_zh: string | null;
  icon: string | null;
};

function languageOption(row: LanguageRow): ReferenceOption {
  return {
    id: row.language_code,
    name: row.language_name,
    nameTh: row.language_name_th ?? row.language_name,
    nameZh: row.language_name_zh ?? row.language_name,
  };
}

function categoryOption(row: CategoryRow): ReferenceOption {
  return {
    id: row.category_code,
    name: row.category_name,
    nameTh: row.category_name_th ?? row.category_name,
    nameZh: row.category_name_zh ?? row.category_name,
    icon: row.icon ?? undefined,
  };
}

/** Load active request references from Supabase for server-rendered forms and workspaces. */
export async function loadReferenceCatalog(
  supabase?: SupabaseClient,
): Promise<ReferenceCatalog> {
  try {
    const client = supabase ?? await createClient();
    const { data: userData } = await client.auth.getUser();
    if (!userData.user) return EMPTY_REFERENCE_CATALOG;

    const [{ data: languages, error: languageError }, { data: categories, error: categoryError }] = await Promise.all([
      client
        .from("languages")
        .select("language_code, language_name, language_name_th, language_name_zh")
        .eq("is_active", true)
        .order("language_name"),
      client
        .from("categories")
        .select("category_code, category_name, category_name_th, category_name_zh, icon")
        .eq("is_active", true)
        .order("category_name"),
    ]);

    if (languageError) throw languageError;
    if (categoryError) throw categoryError;

    return {
      languages: ((languages ?? []) as LanguageRow[]).map(languageOption),
      categories: ((categories ?? []) as CategoryRow[]).map(categoryOption),
    };
  } catch (error) {
    console.error("[real-reference-data] loadReferenceCatalog error:", error);
    return EMPTY_REFERENCE_CATALOG;
  }
}
