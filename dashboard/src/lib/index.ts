// place files you want to import through the `$lib` alias in this folder.

import { writable } from 'svelte/store';

export const root = process.env.APP_ROOT!;
export const token = writable<string | null>(null);
export const authorized = writable<boolean>(false);
