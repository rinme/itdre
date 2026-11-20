import { writable } from 'svelte/store';
import { languageState } from '$lib/state/language.svelte';

export type Language = 'th' | 'en';

export const languageStore = writable<Language>(languageState.language);

// Keep store synchronized with languageState
export function setLanguage(lang: Language) {
  languageState.setLanguage(lang);
  languageStore.set(lang);
}
