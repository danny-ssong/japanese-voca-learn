import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WordSettingsProps {
  showPronunciation: boolean;
  showMeaning: boolean;
  showHiragana: boolean;
  wordTypes: {
    noun: boolean;
    verb: boolean;
    adjective: boolean;
    particle: boolean;
  };
  showOnlyUnknown: boolean;
}

interface WordSettingsStore {
  settings: WordSettingsProps;
  updateSettings: (newSettings: Partial<WordSettingsProps>) => void;
}

const DEFAULT_SETTINGS: WordSettingsProps = {
  showPronunciation: true,
  showMeaning: true,
  showHiragana: true,
  showOnlyUnknown: false,
  wordTypes: {
    noun: true,
    verb: true,
    adjective: true,
    particle: true,
  },
};

export const useWordSettingsStore = create<WordSettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
            wordTypes: {
              ...state.settings.wordTypes,
              ...(newSettings.wordTypes || {}),
            },
          },
        })),
    }),
    {
      name: "word-settings-storage",
    }
  )
);
