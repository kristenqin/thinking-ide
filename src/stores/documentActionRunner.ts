import type { ThinkingDocument } from "../models/document";
import type { DocumentRecentAction } from "../services/documentMutations";
import { clearPersistedDocument, persistDocument } from "../services/repository";

type DocumentStoreState = {
  document?: ThinkingDocument;
  notice?: string;
  recentAction?: DocumentRecentAction;
  status?: string;
  error?: string;
};

type StoreSet<TState extends DocumentStoreState> = (partial: Partial<TState>) => void;
type StoreGet<TState extends DocumentStoreState> = () => TState;

type DocumentStoreCommit<TState extends DocumentStoreState, TResult> = {
  document: ThinkingDocument;
  patch?: Partial<TState>;
  result?: TResult;
};

export async function commitDocumentState<TState extends DocumentStoreState>(
  set: StoreSet<TState>,
  document: ThinkingDocument,
  patch: Partial<TState> = {} as Partial<TState>
): Promise<void> {
  set({ document, ...patch } as Partial<TState>);
  await persistDocument(document);
}

export async function runDocumentStoreAction<TState extends DocumentStoreState, TResult = void>(
  get: StoreGet<TState>,
  set: StoreSet<TState>,
  action: (
    state: TState,
    document: ThinkingDocument
  ) => DocumentStoreCommit<TState, TResult> | undefined
): Promise<TResult | undefined> {
  const state = get();
  const current = state.document;
  if (!current) {
    return undefined;
  }

  const outcome = action(state, current);
  if (!outcome) {
    return undefined;
  }

  await commitDocumentState(set, outcome.document, outcome.patch);
  return outcome.result;
}

export async function clearDocumentStoreState<TState extends DocumentStoreState>(
  get: StoreGet<TState>,
  set: StoreSet<TState>,
  patch: Partial<TState>
): Promise<boolean> {
  const current = get().document;
  if (!current) {
    return false;
  }

  await clearPersistedDocument(current.conversation.id);
  set({ document: undefined, ...patch } as Partial<TState>);
  return true;
}
