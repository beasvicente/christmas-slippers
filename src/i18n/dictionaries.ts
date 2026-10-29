import en from "./messages/en";
import ptPT from "./messages/pt-PT";
import type {AppLocale} from "./routing";

export const messages = {en, "pt-PT": ptPT};
export function getMessages(locale: AppLocale) { return messages[locale]; }
