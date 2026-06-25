/**
 * CSV / Excel のヘッダーから緯度・経度カラムを推定する純粋関数。
 *
 * 地理空間データ連携基盤の app（クライアントのアップロード前検証・プレビュー）と
 * api（サーバー側 CSV→GeoJSON 変換）で同じ判定ロジックを共有するための単一実装。
 * エラー送出や UI 表示は呼び出し側に委ね、本パッケージは「どの列が緯度/経度か」を
 * 返すだけに徹する（依存ゼロ・副作用なし）。
 */

/** 緯度とみなすカラム名の別名（優先順） */
export const LAT_ALIASES = ["latitude", "lat", "緯度", "y"] as const;
/** 経度とみなすカラム名の別名（優先順） */
export const LNG_ALIASES = ["longitude", "lng", "lon", "long", "経度", "x"] as const;

export type LatLngColumns = {
  /** 緯度カラム名。見つからなければ null */
  latColumn: string | null;
  /** 経度カラム名。見つからなければ null */
  lngColumn: string | null;
};

export type ResolveOptions = {
  /** 明示指定する緯度カラム名（指定時は完全一致のみ・エイリアス推測しない） */
  latColumn?: string;
  /** 明示指定する経度カラム名（指定時は完全一致のみ・エイリアス推測しない） */
  lngColumn?: string;
};

/** ヘッダから大文字小文字を無視して完全一致するカラム名を探す */
function findExact(headers: string[], name: string): string | null {
  const target = name.trim().toLowerCase();
  return headers.find((h) => h.trim().toLowerCase() === target) ?? null;
}

// 英数字・日本語（ひらがな/カタカナ/漢字）以外を区切り文字とみなしてトークン分割する。
// 「公営駐輪場_緯度」→["公営駐輪場","緯度"]、「世界_10進_X」→["世界","10進","x"] のように
// サフィックス付き列名でもトークン単位で alias と照合できる。`box` は ["box"] のままなので
// `x` には一致しない（部分文字列一致による誤検出を避ける）。
const SEPARATOR = /[^0-9a-z぀-ヿ㐀-鿿]+/i;

/** ヘッダー文字列を区切り文字でトークン分割し、小文字化して返す */
export function tokenize(header: string): string[] {
  return header
    .trim()
    .toLowerCase()
    .split(SEPARATOR)
    .filter((t) => t.length > 0);
}

/** ヘッダをトークン分割し、いずれかのトークンが alias と一致するカラム名を探す */
function findByToken(headers: string[], alias: string): string | null {
  return headers.find((h) => tokenize(h).includes(alias)) ?? null;
}

/**
 * エイリアス候補を優先順に走査して一致するカラム名を返す。
 * まず全 alias を完全一致で探し、無ければ全 alias をトークン境界一致で探す。
 */
function findByAlias(headers: string[], aliases: readonly string[]): string | null {
  for (const alias of aliases) {
    const found = findExact(headers, alias);
    if (found) return found;
  }
  for (const alias of aliases) {
    const found = findByToken(headers, alias);
    if (found) return found;
  }
  return null;
}

/**
 * ヘッダーから緯度・経度カラム名を推定する。
 * 明示指定（latColumn / lngColumn）があれば完全一致で最優先採用し、省略時のみ
 * エイリアスから推測する（完全一致 → トークン境界一致の順）。
 *
 * 見つからない場合や緯度経度が同一カラムになる場合の扱い（エラー/警告）は呼び出し側で行う。
 */
export function findLatLngColumns(headers: string[], opts: ResolveOptions = {}): LatLngColumns {
  const latOverride = opts.latColumn?.trim();
  const lngOverride = opts.lngColumn?.trim();

  const latColumn = latOverride
    ? findExact(headers, latOverride)
    : findByAlias(headers, LAT_ALIASES);
  const lngColumn = lngOverride
    ? findExact(headers, lngOverride)
    : findByAlias(headers, LNG_ALIASES);

  return { latColumn, lngColumn };
}
