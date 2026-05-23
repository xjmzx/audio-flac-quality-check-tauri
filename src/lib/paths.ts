import type { MirrorPair, ScanRow } from "./tauri";

/** Split a full track path relative to the library root into
 *  [artist, release/album, track filename]. Mirrors the Python splitter
 *  in flac_library_browser.py. */
export function splitPath(fp: string, root: string): [string, string, string] {
  let rel = fp;
  if (root && rel.startsWith(root)) rel = rel.slice(root.length);
  rel = rel.replace(/^\/+/, "");
  const parts = rel.split("/");
  if (parts.length >= 3) {
    return [parts[0], parts.slice(1, -1).join("/"), parts[parts.length - 1]];
  }
  if (parts.length === 2) return [parts[0], "(no album)", parts[1]];
  return ["(unknown)", "(no album)", parts[0] ?? rel];
}

/** Distinct (artist, release) pairs across a set of scan rows. */
export function uniquePairs(rows: ScanRow[], libRoot: string): MirrorPair[] {
  const seen = new Set<string>();
  const pairs: MirrorPair[] = [];
  for (const r of rows) {
    const [artist, release] = splitPath(r.path, libRoot);
    const key = `${artist}//${release}`;
    if (seen.has(key)) continue;
    seen.add(key);
    pairs.push({ artist, release });
  }
  return pairs;
}
