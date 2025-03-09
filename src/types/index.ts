import type { Database } from "./database.types";

export type Song = Database["public"]["Tables"]["song"]["Row"];

export type Word = Database["public"]["Tables"]["word"]["Row"];

export type UnknownWord = Database["public"]["Tables"]["unknown_word"]["Row"];

export type User = Database["public"]["Tables"]["user"]["Row"];

export type Sentence = Database["public"]["Tables"]["sentence"]["Row"];

export type SentenceWord = Database["public"]["Tables"]["sentence_word"]["Row"];

export type SentenceWordWithJoin = SentenceWord & {
  word: Word;
};
