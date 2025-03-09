"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useWordSettingsStore } from "@/store/use-word-settings-store";

export function WordSettings() {
  const [showSettings, setShowSettings] = useState(false);
  const { settings, updateSettings } = useWordSettingsStore();

  return (
    <>
      <div
        onClick={() => setShowSettings(true)}
        className="hover:bg-primary/10 rounded-full h-10 w-10 flex items-center justify-center cursor-pointer"
      >
        <Settings className="w-8 h-8" />
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[425px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">단어 카드 설정</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">보고 싶은 품사 선택</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "noun", label: "명사" },
                  { id: "verb", label: "동사" },
                  { id: "adjective", label: "형용사" },
                  { id: "particle", label: "조사" },
                  { id: "adverb", label: "부사" },
                ].map(({ id, label }) => (
                  <div key={id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`wordType-${id}`}
                      checked={settings.wordTypes[id as keyof typeof settings.wordTypes]}
                      onCheckedChange={(checked) =>
                        updateSettings({
                          wordTypes: {
                            ...settings.wordTypes,
                            [id]: checked as boolean,
                          },
                        })
                      }
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label htmlFor={`wordType-${id}`} className="text-sm font-medium">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">보기 설정</h4>
              {[
                { id: "showPronunciation", label: "발음 보기" },
                { id: "showMeaning", label: "뜻 보기" },
                { id: "showHiragana", label: "히라가나 보기" },
              ].map(({ id, label }) => (
                <div key={id} className="flex items-center space-x-3">
                  <Checkbox
                    id={id}
                    checked={!!settings[id as keyof typeof settings]}
                    onCheckedChange={(checked) => updateSettings({ [id]: !!checked })}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label htmlFor={id} className="text-sm font-medium">
                    {label}
                  </label>
                </div>
              ))}

              <div className="pt-4">
                <h4 className="text-sm font-medium mb-2">학습 설정</h4>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="showOnlyUnknown"
                    checked={settings.showOnlyUnknown}
                    onCheckedChange={(checked) => updateSettings({ showOnlyUnknown: !!checked })}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label htmlFor="showOnlyUnknown" className="text-sm font-medium">
                    모르는 단어만 보기
                  </label>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
