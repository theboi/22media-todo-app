import test from "node:test";
import assert from "node:assert/strict";
import { resolveApiUrl } from "./resolve-url.ts";

test("native development reaches Laravel on the Expo computer", () => {
  for (const platform of ["ios", "android"]) {
    assert.equal(resolveApiUrl({ platform, development: true, hostUri: "192.168.68.100:8082" }), "http://192.168.68.100:8000/api");
  }
});
test("explicit API address wins and web keeps its local address", () => {
  assert.equal(resolveApiUrl({ override: "https://api.example.test/api/", platform: "ios", development: true, hostUri: "192.168.68.100:8082" }), "https://api.example.test/api");
  assert.equal(resolveApiUrl({ platform: "web", development: true, hostUri: "192.168.68.100:8082" }), "http://localhost:8000/api");
});
