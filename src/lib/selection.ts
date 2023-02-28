import { writable } from "svelte/store";

type SelectionType = "static" | "transient";

export type SelectedEntry = {
  id: string;
  type: SelectionType;
};

export const selection = writable<SelectedEntry[]>([]);
