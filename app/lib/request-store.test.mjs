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

test("schedule starts on the next calendar day and expires at the appointment", () => {
  const currentTime = new Date(2026, 8, 8, 22, 10, 0, 0);
  const env = environment(currentTime);
  const store = env.load();
  assert.throws(() => store.createRequest({ ...input, urgency: "Scheduled" }, "bad-date"));
  const tooSoon = new Date(2026, 8, 8, 23, 59, 0, 0);
  assert.throws(() => store.createRequest({ ...input, urgency: "Scheduled" }, tooSoon.toISOString()));
  const appointment = new Date(2026, 8, 9, 0, 0, 0, 0);
  store.createRequest({ ...input, urgency: "Scheduled" }, appointment.toISOString());
  assert.equal(store.useRequests().requests[0].expiresAt, appointment.toISOString());
  const expired = store.expireRequests(store.useRequests().requests, appointment.getTime() + 1);
  assert.equal(expired[0].status, "Expired");
  assert.equal(expired[0].cancelledBy, "System");
  assert.equal(env.load().useRequests().requests[0].expiresAt, appointment.toISOString());
});

test("scheduled appointments have no maximum future date", () => {
  const currentTime = new Date(2026, 8, 8, 22, 10, 0, 0);
  const env = environment(currentTime);
  const appointment = new Date(2027, 0, 15, 9, 30, 0, 0);
  env.load().createRequest({ ...input, urgency: "Scheduled" }, appointment.toISOString());
  assert.equal(env.load().useRequests().requests[0].expiresAt, appointment.toISOString());
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

const requester = { userId: "user-1", name: "Requester", phone: "0800000001", role: "User" };
const interpreter = { userId: "interpreter-1", name: "Interpreter", phone: "0800000002", role: "Interpreter" };

test("claim, requester approval, start and dual completion share one request", () => {
  const env = environment();
  const store = env.load();
  const id = store.createRequest(input, "");
  store.attachRequester(id, requester);

  assert.throws(() => store.claimRequest(id, { ...requester, role: "Interpreter" }), /own request/);
  store.claimRequest(id, interpreter);
  assert.equal(store.useRequests().requests[0].status, "Claimed");
  assert.equal(store.useRequests().requests[0].interpreterId, interpreter.userId);
  assert.throws(() => store.startRequest(id, interpreter), /confirm/);

  store.confirmInterpreterSelection(id, requester);
  store.startRequest(id, interpreter);
  assert.equal(store.useRequests().requests[0].status, "InProgress");

  store.confirmRequestCompletion(id, requester);
  assert.equal(store.useRequests().requests[0].status, "InProgress");
  store.confirmRequestCompletion(id, interpreter);
  assert.equal(store.useRequests().requests[0].status, "Completed");
  assert.ok(store.useRequests().requests[0].endedAtLabel);
});

test("interpreter withdrawal returns an unstarted request to the open pool", () => {
  const env = environment();
  const store = env.load();
  const id = store.createRequest(input, "");
  store.attachRequester(id, requester);
  store.claimRequest(id, interpreter);
  store.cancelMission(id, interpreter, "Cannot attend");

  const reopened = store.useRequests().requests[0];
  assert.equal(reopened.status, "Open");
  assert.equal(reopened.interpreterId, null);
  assert.equal(reopened.interpreter, null);
  assert.equal(reopened.cancelledBy, null);
  assert.equal(reopened.cancelReason, null);
});

test("requester can edit request details until work starts", () => {
  const env = environment();
  const store = env.load();
  const id = store.createRequest(input, "");
  store.attachRequester(id, requester);
  store.updateRequestDetailsBeforeStart(id, requester, {
    languageId: "chinese",
    categoryId: "government",
    description: "Bring the original passport",
    exactAddress: "Government office, counter 5",
  });

  const updated = store.useRequests().requests[0];
  assert.equal(updated.languageId, "chinese");
  assert.equal(updated.categoryId, "government");
  assert.equal(updated.description, "Bring the original passport");
  assert.equal(updated.exactAddress, "Government office, counter 5");

  store.claimRequest(id, interpreter);
  store.updateRequestDetailsBeforeStart(id, requester, {
    languageId: "english",
    categoryId: "medical",
    description: "Updated before start",
    exactAddress: "Community clinic, entrance B",
  });
  const claimedUpdate = store.useRequests().requests[0];
  assert.equal(claimedUpdate.description, "Updated before start");
  assert.equal(claimedUpdate.exactAddress, "Community clinic, entrance B");

  store.confirmInterpreterSelection(id, requester);
  store.startRequest(id, interpreter);
  assert.throws(() => store.updateRequestDetailsBeforeStart(id, requester, {
    languageId: "english",
    categoryId: "medical",
    description: "Changed after start",
    exactAddress: "Another place",
  }), /before work starts/);
});

test("request detail edits validate ownership and meeting point", () => {
  const env = environment();
  const store = env.load();
  const id = store.createRequest(input, "");
  store.attachRequester(id, requester);

  assert.throws(() => store.updateRequestDetailsBeforeStart(id, { ...requester, userId: "user-2" }, {
    languageId: "english",
    categoryId: "medical",
    description: "Changed by another user",
    exactAddress: "Another place",
  }), /Only the requester/);
  assert.throws(() => store.updateRequestDetailsBeforeStart(id, requester, {
    languageId: "english",
    categoryId: "medical",
    description: "Missing place",
    exactAddress: " ",
  }), /meeting point/);
});

test("interpreter withdrawal after work starts cancels the request", () => {
  const env = environment();
  const store = env.load();
  const id = store.createRequest(input, "");
  store.attachRequester(id, requester);
  store.claimRequest(id, interpreter);
  store.confirmInterpreterSelection(id, requester);
  store.startRequest(id, interpreter);
  store.cancelMission(id, interpreter, "Emergency");

  const cancelled = store.useRequests().requests[0];
  assert.equal(cancelled.status, "Cancelled");
  assert.equal(cancelled.cancelledBy, "Interpreter");
});

test("an interpreter cannot hold two active assignments", () => {
  const env = environment();
  const store = env.load();
  const firstId = store.createRequest(input, "");
  const secondId = store.createRequest({ ...input, exactAddress: "Second location" }, "");
  store.claimRequest(firstId, interpreter);

  assert.throws(() => store.claimRequest(secondId, interpreter), /active assignment/);
  assert.equal(store.useRequests().requests.find((request) => request.requestId === secondId).status, "Open");
});
