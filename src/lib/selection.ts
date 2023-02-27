import { writable } from "svelte/store";

export type SelectedEntry = {
  id: string;
};

export const selection = writable<SelectedEntry[]>([]);
