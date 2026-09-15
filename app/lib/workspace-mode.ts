import { getMockUserSession, type UserProfile } from "@/app/lib/mock-auth";

export type WorkspaceRole = "User" | "Interpreter";
export type InterpreterWorkspaceMode = "helper" | "requester";

const STORAGE_KEY_PREFIX = "khvi_interpreter_workspace_mode_v1:";
const CHANGE_EVENT = "khvi:interpreter-workspace-mode-change";

function storageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export function getInterpreterWorkspaceMode(user: UserProfile): InterpreterWorkspaceMode {
  if (user.role !== "Interpreter" || typeof window === "undefined") return "helper";

  try {
    return window.localStorage.getItem(storageKey(user.userId)) === "requester" ? "requester" : "helper";
  } catch {
    return "helper";
  }
}

export function setInterpreterWorkspaceMode(userId: string, mode: InterpreterWorkspaceMode): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey(userId), mode);
  } catch {
    // The active page still updates even when browser storage is unavailable.
  }

  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { userId, mode } }));
}

export function getActiveWorkspaceRole(user: UserProfile): WorkspaceRole | null {
  if (user.role === "User") return "User";
  if (user.role !== "Interpreter") return null;
  return getInterpreterWorkspaceMode(user) === "requester" ? "User" : "Interpreter";
}

export function getWorkspaceActorSession(): UserProfile | null {
  const user = getMockUserSession();
  if (!user) return null;

  const activeRole = getActiveWorkspaceRole(user);
  return activeRole ? { ...user, role: activeRole } : user;
}

export function subscribeInterpreterWorkspaceMode(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key.startsWith(STORAGE_KEY_PREFIX)) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}
