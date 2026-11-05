import type { enDictionary } from "@/locales/en/index.constant";
import type { DeepString } from "@/types/deep-string.type";

export type Dictionary = DeepString<typeof enDictionary>;
