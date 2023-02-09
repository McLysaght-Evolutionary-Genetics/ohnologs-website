import { writable } from "svelte/store";

interface Selected {
  geneId: string;
}

export default writable<Selected[]>([]);
