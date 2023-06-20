import { writable } from "svelte/store";

export type SelectionType = "static" | "transient";

export type SelectedEntry = {
  id: string;
  type: SelectionType;
};

export const selection = writable<SelectedEntry[]>([]);
