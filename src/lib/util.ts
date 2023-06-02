import { error } from "@sveltejs/kit";

export const rnumber = (max: number) => Math.floor(Math.random() * max);

export const isNotVoid = <T>(v: T): v is Exclude<typeof v, void> => {
  return !(v instanceof Object);
};

export const intoQuery = (
  params: Record<string, string | number | boolean | string[] | number[] | boolean[]>,
): string => {
  const entries = Object.entries(params);

  const parts: string[] = [];

  for (const [k, v] of entries) {
    if (Array.isArray(v)) {
      if (v.length === 0) {
        continue;
      }

      parts.push(`${k}=${v.join(",")}`);
    } else {
      if (typeof v === "string" && v.length === 0) {
        continue;
      }

      parts.push(`${k}=${v}`);
    }
  }

  if (parts.length === 0) {
    return "";
  }

  const query = `?${parts.join("&")}`;

  return query;
};

export const findQuery = (url: URL, k: string): string | null => {
  const v = url.searchParams.get(k);

  return v;
};

export const findQueryArray = (url: URL, k: string): string[] | null => {
  const v = url.searchParams.get(k);

  if (v == null) {
    return v;
  }

  return v.split(",");
};

export const findQueryOrError = (url: URL, k: string): string => {
  const v = findQuery(url, k);

  if (v == null) {
    throw error(400, `could not find query param '${k}'`);
  }

  return v;
};

export const downloadFile = (name: string, content: string) => {
  const blob = new Blob([content], { type: "text/tsv" });

  const elem = window.document.createElement("a");
  elem.href = window.URL.createObjectURL(blob);
  elem.download = name;

  document.body.appendChild(elem);
  elem.click();

  document.body.removeChild(elem);
};
