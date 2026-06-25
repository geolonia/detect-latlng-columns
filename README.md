# @geolonia/csv-latlng

CSV / Excel のヘッダーから**緯度・経度カラムを推定する依存ゼロの純粋関数**。

地理空間データ連携基盤の以下 2 リポジトリで、緯度経度カラムの判定ロジックを単一実装として共有するためのパッケージ。

- `smartcity-geospatial-platform-app`（クライアント: アップロード前検証・プレビュー）
- `smartcity-geospatial-platform-api`（サーバー: CSV → GeoJSON 変換）

## インストール（git タグ依存）

npm registry には publish せず、GitHub のタグを直接参照する。

```jsonc
// package.json
{
  "dependencies": {
    "@geolonia/csv-latlng": "github:geolonia/smartcity-csv-latlng#v0.1.0"
  }
}
```

`dist` をリポジトリにコミットしているため、`npm install` 時にビルドは不要（CI でも追加の認証・ビルド工程なしで解決できる）。

## 使い方

```ts
import { findLatLngColumns } from "@geolonia/csv-latlng";

findLatLngColumns(["名称", "緯度", "経度"]);
// => { latColumn: "緯度", lngColumn: "経度" }

findLatLngColumns(["公営駐輪場_緯度", "公営駐輪場_経度"]);
// => { latColumn: "公営駐輪場_緯度", lngColumn: "公営駐輪場_経度" }

findLatLngColumns(["世界_10進_X", "世界_10進_Y"]);
// => { latColumn: "世界_10進_Y", lngColumn: "世界_10進_X" }  (X=経度, Y=緯度)

// 明示指定（完全一致のみ・エイリアス推測しない）
findLatLngColumns(headers, { latColumn: "lat", lngColumn: "lng" });
```

`null` の扱い（エラーにするか警告にするか）や同一カラム判定は**呼び出し側**で行う。本パッケージは「どの列が緯度/経度か」を返すことだけに徹する。

## 判定ルール

| 種別 | 別名（優先順） |
| --- | --- |
| 緯度 | `latitude`, `lat`, `緯度`, `y` |
| 経度 | `longitude`, `lng`, `lon`, `long`, `経度`, `x` |

1. 明示指定があれば完全一致のみで採用。
2. 省略時は別名で推測。**まず全別名を完全一致**で探し、無ければ**トークン境界一致**で探す。
3. トークン分割は「英数字・日本語以外」を区切りとするため、`公営駐輪場_緯度` → `[公営駐輪場, 緯度]` のようにサフィックス付き列名も拾える一方、`box` → `[box]` は `x` に一致せず誤検出を避ける。

## 開発

```bash
npm install
npm test         # vitest
npm run build    # tsup（esm + cjs + d.ts を dist/ へ）
```

変更時は `npm run build` で `dist` を更新してコミットし、`vX.Y.Z` タグを打つ。consumer 側は依存のタグを bump する。
