import { writable } from 'svelte/store';

export const theme = writable('dark'); // Default theme is 'light'
export const editorInstance = writable(null);