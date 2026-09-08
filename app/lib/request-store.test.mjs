import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function environment() {
  const data = new Map();
  const localStorage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  function load() {
    const cache = {};
    function loadModule(name) {
      if (cache[name]) return cache[name];
      const source = readFileSync(new URL(name + ".ts", import.meta.url), "utf8");
      const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
      const exports = {};
      const context = { exports, localStorage, Date, Event,
        window: { dispatchEvent() {} },
        require: (path) => path === "react"
          ? { useSyncExternalStore: (_subscribe, snapshot) => snapshot() }
          : loadModule(path.replace("./", "")),
      };
      vm.runInNewContext(js, context);
      cache[name] = exports;
      return exports;
    }
    return loadModule("request-store");
  }
  return { load, data, localStorage };
}

const input = { languageId: "english", categoryId: "medical", description: "Sample appointment",
  urgency: "Immediate", exactAddress: "Sample hospital, desk 3", latitude: null, longitude: null };

test("create distinct requests, preserve submitted fields and reload from storage", () => {
  const env = environment();
  const store = env.load();
  assert.equal(store.useRequests().requests.length, 0);
  const first = store.createRequest(input, "");
  const second = store.createRequest({ ...input, exactAddress: "Second meeting point" }, "");
  assert.notEqual(first, second);
  const records = env.load().useRequests().requests;
  assert.equal(records.length, 2);
  assert.equal(records[1].exactAddress, input.exactAddress);
  assert.equal(records[1].latitude, null);
  assert.equal(records[1].status, "Open");
  assert.ok(Date.parse(records[1].expiresAt) > Date.now());
});

test("cancellation requires a reason and survives reload", () => {
  const env = environment();
  const store = env.load();
  const id = store.createRequest(input, "");
  assert.throws(() => store.updateRequest(id, "cancel", " "));
  store.updateRequest(id, "cancel", "No longer needed");
  const saved = env.load().useRequests().requests[0];
  assert.equal(saved.status, "Cancelled");
  assert.equal(saved.cancelReason, "No longer needed");
  assert.throws(() => store.updateRequest(id, "confirm"));
});

test("schedule uses current time and expires at appointment; urgent expiry never resets", () => {
  const env = environment();
  const store = env.load();
  assert.throws(() => store.createRequest({ ...input, urgency: "Scheduled" }, "bad-date"));
  assert.throws(() => store.createRequest({ ...input, urgency: "Scheduled" }, new Date(Date.now() - 1000).toISOString()));
  assert.throws(() => store.createRequest({ ...input, urgency: "Scheduled" }, new Date(Date.now() + 90000000).toISOString()));
  const date = new Date(Date.now() + 3600000).toISOString();
  store.createRequest({ ...input, urgency: "Scheduled" }, date);
  assert.equal(store.useRequests().requests[0].expiresAt, date);
  const expired = store.expireRequests(store.useRequests().requests, Date.parse(date) + 1);
  assert.equal(expired[0].status, "Expired");
  assert.equal(expired[0].cancelledBy, "System");
  assert.equal(env.load().useRequests().requests[0].expiresAt, date);
});

test("completion requires started work and both confirmations", () => {
  const env = environment();
  let store = env.load();
  const id = store.createRequest(input, "");
  assert.throws(() => store.updateRequest(id, "confirm"));
  const key = "khvi-requester-v1";
  let records = JSON.parse(env.localStorage.getItem(key));
  records[0].status = "InProgress";
  env.localStorage.setItem(key, JSON.stringify(records));
  store = env.load();
  store.updateRequest(id, "confirm");
  assert.equal(store.useRequests().requests[0].status, "InProgress");
  records = JSON.parse(env.localStorage.getItem(key));
  records[0].interpreterConfirmedDoneAtLabel = "Confirmed by interpreter";
  env.localStorage.setItem(key, JSON.stringify(records));
  store.updateRequest(id, "confirm");
  assert.equal(env.load().useRequests().requests[0].status, "Completed");
});

test("failed storage writes do not claim a successful request", () => {
  const env = environment();
  env.localStorage.setItem = () => { throw new Error("Storage denied"); };
  assert.throws(() => env.load().createRequest(input, ""), /Storage denied/);
  assert.equal(env.data.size, 0);
});
