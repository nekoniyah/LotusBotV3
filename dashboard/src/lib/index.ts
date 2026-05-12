// place files you want to import through the `$lib` alias in this folder.

import { writable } from 'svelte/store';

export const root = 'http://localhost:3000';
export const token = writable<string | null>(null);
export const authorized = writable<boolean>(false);
