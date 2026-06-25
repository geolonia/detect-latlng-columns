import { describe, expect, it } from "vitest";
import { findLatLngColumns, tokenize } from "./index";

describe("findLatLngColumns", () => {
  it("標準的な緯度経度列を検出する", () => {
    expect(findLatLngColumns(["名称", "緯度", "経度"])).toEqual({
      latColumn: "緯度",
      lngColumn: "経度",
    });
    expect(findLatLngColumns(["name", "latitude", "longitude"])).toEqual({
      latColumn: "latitude",
      lngColumn: "longitude",
    });
  });

  it("大文字小文字・前後空白を無視する", () => {
    expect(findLatLngColumns([" LAT ", " LON "])).toEqual({
      latColumn: " LAT ",
      lngColumn: " LON ",
    });
  });

  it("サフィックス付きの列名をトークン境界一致で検出する", () => {
    expect(findLatLngColumns(["公営駐輪場_緯度", "公営駐輪場_経度"])).toEqual({
      latColumn: "公営駐輪場_緯度",
      lngColumn: "公営駐輪場_経度",
    });
    expect(findLatLngColumns(["世界_10進_X", "世界_10進_Y"])).toEqual({
      latColumn: "世界_10進_Y",
      lngColumn: "世界_10進_X",
    });
  });

  it("部分文字列一致では誤検出しない（box は x に一致しない）", () => {
    expect(findLatLngColumns(["box", "proxy", "name"])).toEqual({
      latColumn: null,
      lngColumn: null,
    });
  });

  it("完全一致をトークン一致より優先する", () => {
    // "緯度" 完全一致を、"観測_緯度" のトークン一致より優先
    expect(findLatLngColumns(["観測_緯度", "緯度", "経度"]).latColumn).toBe("緯度");
  });

  it("明示指定は完全一致のみで採用しエイリアス推測しない", () => {
    expect(findLatLngColumns(["lat_col", "lng_col"], { latColumn: "lat_col", lngColumn: "lng_col" })).toEqual({
      latColumn: "lat_col",
      lngColumn: "lng_col",
    });
    // 明示指定がヘッダに無ければ null（エイリアス推測へフォールバックしない）
    expect(findLatLngColumns(["緯度", "経度"], { latColumn: "missing" }).latColumn).toBeNull();
  });

  it("見つからない場合は null を返す", () => {
    expect(findLatLngColumns(["name", "address"])).toEqual({
      latColumn: null,
      lngColumn: null,
    });
  });
});

describe("tokenize", () => {
  it("英数字・日本語以外を区切りに分割する", () => {
    expect(tokenize("世界_10進_X")).toEqual(["世界", "10進", "x"]);
    expect(tokenize("公営駐輪場_緯度")).toEqual(["公営駐輪場", "緯度"]);
    expect(tokenize("box")).toEqual(["box"]);
  });
});
