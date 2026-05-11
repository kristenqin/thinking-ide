import test from "node:test";
import assert from "node:assert/strict";
import { revealSource } from "./sourceLocator";
import type { SourceRef } from "../models/source";

class FakeElement {
  public attributes = new Map<string, string>();
  public scrolled = false;

  constructor(
    public readonly id: string,
    role: "user" | "assistant",
    public textContent: string
  ) {
    this.attributes.set("data-message-author-role", role);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  removeAttribute(name: string) {
    this.attributes.delete(name);
  }

  scrollIntoView() {
    this.scrolled = true;
  }
}

function buildSource(anchorOverrides: Partial<SourceRef["anchor"]> = {}): SourceRef {
  return {
    id: "source-1",
    messageId: "assistant_1",
    status: "active",
    anchor: {
      selector: '[data-message-author-role="assistant"]',
      role: "assistant",
      occurrenceIndex: 1,
      previewStart: "Exchange 1 should trigger the observer",
      previewEnd: "preserve manual node positions.",
      ...anchorOverrides
    }
  };
}

function installDom(elements: FakeElement[]) {
  const byId = new Map(elements.filter((element) => element.id).map((element) => [element.id, element]));
  const scheduled: Array<() => void> = [];
  const globalObject = globalThis as typeof globalThis & {
    document: Document;
    window: Window & typeof globalThis;
  };

  globalObject.document = {
    querySelectorAll(selector: string) {
      if (selector !== '[data-message-author-role="assistant"]') {
        return [] as unknown as NodeListOf<Element>;
      }

      return elements as unknown as NodeListOf<Element>;
    },
    getElementById(id: string) {
      return (byId.get(id) ?? null) as unknown as HTMLElement | null;
    }
  } as unknown as Document;
  globalObject.window = {
    setTimeout(callback: () => void) {
      scheduled.push(callback);
      return scheduled.length;
    }
  } as unknown as Window & typeof globalThis;

  return {
    flushTimers() {
      while (scheduled.length > 0) {
        scheduled.shift()?.();
      }
    }
  };
}

test("revealSource highlights a matching anchored message", () => {
  const seed = new FakeElement(
    "assistant_seed",
    "assistant",
    "Start with the chat scan. Then map the draft generation. Then show how local persistence restores user work."
  );
  const target = new FakeElement(
    "",
    "assistant",
    "Exchange 1 should trigger the observer, regenerate the draft, and preserve manual node positions."
  );
  const timers = installDom([seed, target]);

  const result = revealSource(
    buildSource({
      domId: "missing-dom-id"
    })
  );

  assert.equal(result, "revealed");
  assert.equal(seed.scrolled, false);
  assert.equal(target.scrolled, true);
  assert.equal(target.getAttribute("data-thinking-ide-highlight"), "true");

  timers.flushTimers();
  assert.equal(target.getAttribute("data-thinking-ide-highlight"), null);
});

test("revealSource marks the source as lost instead of highlighting the wrong assistant fallback", () => {
  const wrongAssistant = new FakeElement(
    "assistant_seed",
    "assistant",
    "Start with the chat scan. Then map the draft generation. Then show how local persistence restores user work."
  );
  installDom([wrongAssistant]);

  const result = revealSource(buildSource());

  assert.equal(result, "lost");
  assert.equal(wrongAssistant.scrolled, false);
  assert.equal(wrongAssistant.getAttribute("data-thinking-ide-highlight"), null);
});
