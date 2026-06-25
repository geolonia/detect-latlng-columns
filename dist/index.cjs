"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  LAT_ALIASES: () => LAT_ALIASES,
  LNG_ALIASES: () => LNG_ALIASES,
  findLatLngColumns: () => findLatLngColumns,
  tokenize: () => tokenize
});
module.exports = __toCommonJS(index_exports);
var LAT_ALIASES = ["latitude", "lat", "\u7DEF\u5EA6", "y"];
var LNG_ALIASES = ["longitude", "lng", "lon", "long", "\u7D4C\u5EA6", "x"];
function findExact(headers, name) {
  const target = name.trim().toLowerCase();
  return headers.find((h) => h.trim().toLowerCase() === target) ?? null;
}
var SEPARATOR = /[^0-9a-z぀-ヿ㐀-鿿]+/i;
function tokenize(header) {
  return header.trim().toLowerCase().split(SEPARATOR).filter((t) => t.length > 0);
}
function findByToken(headers, alias) {
  return headers.find((h) => tokenize(h).includes(alias)) ?? null;
}
function findByAlias(headers, aliases) {
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
function findLatLngColumns(headers, opts = {}) {
  const latOverride = opts.latColumn?.trim();
  const lngOverride = opts.lngColumn?.trim();
  const latColumn = latOverride ? findExact(headers, latOverride) : findByAlias(headers, LAT_ALIASES);
  const lngColumn = lngOverride ? findExact(headers, lngOverride) : findByAlias(headers, LNG_ALIASES);
  return { latColumn, lngColumn };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LAT_ALIASES,
  LNG_ALIASES,
  findLatLngColumns,
  tokenize
});
