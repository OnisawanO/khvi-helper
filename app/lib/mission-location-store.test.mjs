import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function environment() {
  const data = new Map();
  const localStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
  const source = readFileSync(new URL("mission-location-store.ts", import.meta.url), "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  const context = {
    exports,
    localStorage,
    Event,
    Date,
    window: {
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {},
    },
    require: (path) => {
      if (path === "react") return { useSyncExternalStore: (_subscribe, snapshot) => snapshot() };
      throw new Error(`Unexpected import: ${path}`);
    },
  };
  vm.runInNewContext(js, context);
  return exports;
}

const requester = { userId: "user-1", role: "User" };
const interpreter = { userId: "interpreter-1", role: "Interpreter" };
const request = {
  requestId: "1001",
  status: "Claimed",
  requester: { userId: requester.userId },
  interpreterId: interpreter.userId,
};

test("requester and assigned interpreter can save separate mission locations", () => {
  const store = environment();
  store.saveMissionLocation(request, requester, 8.6425, 99.8981);
  store.saveMissionLocation(request, interpreter, 8.6501, 99.9022);
  store.saveMissionLocation(request, requester, 8.6432, 99.8994, 7.4);

  const saved = store.useMissionLocations(request.requestId);
  assert.equal(saved.requester.actorId, requester.userId);
  assert.equal(saved.requester.latitude, 8.6432);
  assert.equal(saved.requester.longitude, 99.8994);
  assert.equal(saved.requester.accuracyMeters, 7.4);
  assert.equal(saved.interpreter.actorId, interpreter.userId);
  assert.equal(saved.interpreter.longitude, 99.9022);
});

test("mission locations reject unauthorized actors and invalid coordinates", () => {
  const store = environment();
  assert.throws(
    () => store.saveMissionLocation(request, { ...interpreter, userId: "another-interpreter" }, 8.6, 99.9),
    /assigned interpreter/,
  );
  assert.throws(() => store.saveMissionLocation(request, requester, 120, 99.9), /invalid location/);
  assert.throws(
    () => store.saveMissionLocation({ ...request, status: "Completed" }, requester, 8.6, 99.9),
    /no longer accepts/,
  );
});
