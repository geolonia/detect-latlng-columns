// src/index.ts
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
export {
  LAT_ALIASES,
  LNG_ALIASES,
  findLatLngColumns,
  tokenize
};
