import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function environment(now = null) {
  const data = new Map();
  const localStorage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  const DateImpl = now
    ? class extends Date {
      constructor(...args) { super(...(args.length === 0 ? [now.getTime()] : args)); }
      static now() { return now.getTime(); }
    }
    : Date;
  function load() {
    const cache = {};
    function loadModule(name) {
      if (cache[name]) return cache[name];
      const source = readFileSync(new URL(name + ".ts", import.meta.url), "utf8");
      const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
      const exports = {};
      const context = { exports, localStorage, Date: DateImpl, Event,
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
  const currentTime = new Date(2026, 8, 8, 22, 10, 0, 0);
  const env = environment(currentTime);
  const store = env.load();
  assert.throws(() => store.createRequest({ ...input, urgency: "Scheduled" }, "bad-date"));
  const tooSoon = new Date(currentTime);
  tooSoon.setHours(22, 30, 0, 0);
  assert.throws(() => store.createRequest({ ...input, urgency: "Scheduled" }, tooSoon.toISOString()));
  const appointment = new Date(currentTime);
  appointment.setHours(23, 0, 0, 0);
  store.createRequest({ ...input, urgency: "Scheduled" }, appointment.toISOString());
  assert.equal(store.useRequests().requests[0].expiresAt, appointment.toISOString());
  const expired = store.expireRequests(store.useRequests().requests, appointment.getTime() + 1);
  assert.equal(expired[0].status, "Expired");
  assert.equal(expired[0].cancelledBy, "System");
  assert.equal(env.load().useRequests().requests[0].expiresAt, appointment.toISOString());
});

test("scheduled appointments cannot exceed 24 hours", () => {
  const currentTime = new Date(2026, 8, 8, 22, 10, 0, 0);
  const env = environment(currentTime);
  const appointment = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000 + 1);
  assert.throws(() => env.load().createRequest({ ...input, urgency: "Scheduled" }, appointment.toISOString()));
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
