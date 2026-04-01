/**
 * Chat action types for structured assistant responses.
 * These drive UI rendering of non-text content (opportunity cards, errors, etc.)
 */

export type ChatActionType =
  | "SHOW_MATCHES"
  | "SHOW_ERROR";

export interface ChatActionPayloadByType {
  SHOW_MATCHES: {
    title: string;
  };
  SHOW_ERROR: {
    message: string;
  };
}

export type ChatAction<T extends ChatActionType = ChatActionType> = {
  type: T;
  payload: ChatActionPayloadByType[T];
};
