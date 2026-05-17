// place files you want to import through the `$lib` alias in this folder.

import { writable } from 'svelte/store';
import { env } from '$env/dynamic/public';
export const root = env.PUBLIC_API_ROOT!;
export const token = writable<string | null>(null);
export const authorized = writable<boolean>(false);
