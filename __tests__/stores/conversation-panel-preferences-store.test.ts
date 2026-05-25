import { beforeEach, describe, expect, it } from "vitest";
import { useConversationPanelPreferencesStore } from "#/stores/conversation-panel-preferences-store";

const STORAGE_KEY = "conversation-panel-preferences";

describe("conversation-panel-preferences store", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to all conversations visible (hide toggles off) and expected preferences", () => {
    const state = useConversationPanelPreferencesStore.getState();
    expect(state.hideInactiveConversations).toBe(false);
    expect(state.hideOldConversations).toBe(false);
    expect(state.showRepoBranchMetadata).toBe(false);
    expect(state.showLlmProfiles).toBe(false);
    expect(state.organizeMode).toBe("chronological");
    expect(state.conversationSort).toBe("updated");
    expect(state.threadScope).toBe("all");
  });

  it("toggles hideInactiveConversations and persists to localStorage", () => {
    useConversationPanelPreferencesStore
      .getState()
      .toggleHideInactiveConversations();

    expect(
      useConversationPanelPreferencesStore.getState().hideInactiveConversations,
    ).toBe(true);

    const persisted = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "{}",
    );
    expect(persisted.state.hideInactiveConversations).toBe(true);
  });

  it("toggles hideOldConversations and persists to localStorage", () => {
    useConversationPanelPreferencesStore
      .getState()
      .toggleHideOldConversations();

    expect(
      useConversationPanelPreferencesStore.getState().hideOldConversations,
    ).toBe(true);

    const persisted = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "{}",
    );
    expect(persisted.state.hideOldConversations).toBe(true);
  });

  it("toggles showRepoBranchMetadata and persists the new value to localStorage", () => {
    useConversationPanelPreferencesStore
      .getState()
      .toggleShowRepoBranchMetadata();

    expect(
      useConversationPanelPreferencesStore.getState().showRepoBranchMetadata,
    ).toBe(true);

    const persisted = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "{}",
    );
    expect(persisted.state.showRepoBranchMetadata).toBe(true);
  });

  it("persists data fields but not action functions", () => {
    useConversationPanelPreferencesStore
      .getState()
      .toggleHideOldConversations();

    const persisted = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "{}",
    );
    expect(Object.keys(persisted.state).sort()).toEqual([
      "conversationSort",
      "hideInactiveConversations",
      "hideOldConversations",
      "organizeMode",
      "showLlmProfiles",
      "showRepoBranchMetadata",
      "threadScope",
    ]);
  });

  it("exposes setters and a toggler for the LLM-profiles preference", () => {
    useConversationPanelPreferencesStore.getState().setShowLlmProfiles(true);
    expect(
      useConversationPanelPreferencesStore.getState().showLlmProfiles,
    ).toBe(true);

    useConversationPanelPreferencesStore
      .getState()
      .toggleShowLlmProfiles();
    expect(
      useConversationPanelPreferencesStore.getState().showLlmProfiles,
    ).toBe(false);
  });

  it("updates organize, sort, and thread-scope preferences via their setters", () => {
    const store = useConversationPanelPreferencesStore.getState();
    store.setOrganizeMode("grouped");
    store.setConversationSort("created");
    store.setThreadScope("relevant");

    const next = useConversationPanelPreferencesStore.getState();
    expect({
      organizeMode: next.organizeMode,
      conversationSort: next.conversationSort,
      threadScope: next.threadScope,
    }).toEqual({
      organizeMode: "grouped",
      conversationSort: "created",
      threadScope: "relevant",
    });
  });

  it("rehydrates legacy localStorage payloads (new fields filled with defaults)", async () => {
    // Simulate a user upgrading from a build that only persisted the old
    // preferences. After rehydration the store should fill the new fields
    // from `initialState`.
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          showRepoBranchMetadata: true,
        },
        version: 0,
      }),
    );

    await useConversationPanelPreferencesStore.persist.rehydrate();

    const state = useConversationPanelPreferencesStore.getState();
    expect({
      hideInactiveConversations: state.hideInactiveConversations,
      hideOldConversations: state.hideOldConversations,
      showRepoBranchMetadata: state.showRepoBranchMetadata,
      showLlmProfiles: state.showLlmProfiles,
      organizeMode: state.organizeMode,
      conversationSort: state.conversationSort,
      threadScope: state.threadScope,
    }).toEqual({
      hideInactiveConversations: false,
      hideOldConversations: false,
      showRepoBranchMetadata: true,
      showLlmProfiles: false,
      organizeMode: "chronological",
      conversationSort: "updated",
      threadScope: "all",
    });
  });
});
