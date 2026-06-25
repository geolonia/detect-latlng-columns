/**
 * CSV / Excel のヘッダーから緯度・経度カラムを推定する純粋関数。
 *
 * 地理空間データ連携基盤の app（クライアントのアップロード前検証・プレビュー）と
 * api（サーバー側 CSV→GeoJSON 変換）で同じ判定ロジックを共有するための単一実装。
 * エラー送出や UI 表示は呼び出し側に委ね、本パッケージは「どの列が緯度/経度か」を
 * 返すだけに徹する（依存ゼロ・副作用なし）。
 */
/** 緯度とみなすカラム名の別名（優先順） */
declare const LAT_ALIASES: readonly ["latitude", "lat", "緯度", "y"];
/** 経度とみなすカラム名の別名（優先順） */
declare const LNG_ALIASES: readonly ["longitude", "lng", "lon", "long", "経度", "x"];
type LatLngColumns = {
    /** 緯度カラム名。見つからなければ null */
    latColumn: string | null;
    /** 経度カラム名。見つからなければ null */
    lngColumn: string | null;
};
type ResolveOptions = {
    /** 明示指定する緯度カラム名（指定時は完全一致のみ・エイリアス推測しない） */
    latColumn?: string;
    /** 明示指定する経度カラム名（指定時は完全一致のみ・エイリアス推測しない） */
    lngColumn?: string;
};
/** ヘッダー文字列を区切り文字でトークン分割し、小文字化して返す */
declare function tokenize(header: string): string[];
/**
 * ヘッダーから緯度・経度カラム名を推定する。
 * 明示指定（latColumn / lngColumn）があれば完全一致で最優先採用し、省略時のみ
 * エイリアスから推測する（完全一致 → トークン境界一致の順）。
 *
 * 見つからない場合や緯度経度が同一カラムになる場合の扱い（エラー/警告）は呼び出し側で行う。
 */
declare function findLatLngColumns(headers: string[], opts?: ResolveOptions): LatLngColumns;

export { LAT_ALIASES, LNG_ALIASES, type LatLngColumns, type ResolveOptions, findLatLngColumns, tokenize };
