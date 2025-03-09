"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Clipboard } from "lucide-react";
import { toast } from "sonner";
import { CompactedLyricsData, saveLyricsWithSong } from "@/app/_lib/lyrics-api";

export default function ApiTest() {
  // JSON 입력 상태
  const [jsonInput, setJsonInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 예시 JSON
  const exampleJson = JSON.stringify(
    {
      title: "君のこゝろ",
      lyrics:
        "まだまだまだまだ見えない\n君のこゝろが\nまだまだまだまだ見えない\n僕のこの腐った目じゃ\n君を痛めつけるものを\n全部見つけだしてさ\n守ってあげたい",
    },
    null,
    2
  );

  // 가사 분석 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jsonInput.trim()) return;

    try {
      // JSON 파싱 시도
      const parsedInput = JSON.parse(jsonInput);

      if (!parsedInput.title || !parsedInput.lyrics) {
        toast.error("입력 오류", {
          description: "JSON에 title과 lyrics 필드가 필요합니다.",
        });
        return;
      }

      setIsLoading(true);
      setResponse("");

      const res = await fetch("/api/gpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: parsedInput.title,
          lyrics: parsedInput.lyrics,
        }),
      });

      if (!res.ok) {
        throw new Error("API 요청에 실패했습니다");
      }

      const data = await res.json();
      setResponse(data.content);
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error("JSON 파싱 오류", {
          description: "올바른 JSON 형식이 아닙니다.",
        });
      } else {
        console.error("Error:", error);
        setResponse("오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    toast.success("복사 완료", {
      description: "분석 결과가 클립보드에 복사되었습니다.",
    });
  };

  const setExampleData = () => {
    setJsonInput(exampleJson);
  };

  const lyrics = {
    title: { title: "君のこゝろ", title_korean: "너의 마음" },
    lyrics: [
      {
        sentence: {
          original: "まだまだまだまだ見えない",
          pronunciation: "마다 마다 마다 마다 미에나이",
          meaning: "아직 보이지 않아",
        },
        words: [
          {
            original: "まだ",
            hiragana: null,
            pronunciation: "마다",
            meaning: "아직",
            word_type: "adjective",
          },
          {
            original: "見えない",
            hiragana: null,
            pronunciation: "미에나이",
            meaning: "보이지 않아",
            word_type: "verb",
          },
        ],
      },
      {
        sentence: {
          original: "君のこゝろが",
          pronunciation: "키미노 코코로가",
          meaning: "너의 마음이",
        },
        words: [
          {
            original: "君",
            hiragana: "きみ",
            pronunciation: "키미",
            meaning: "너",
            word_type: "noun",
          },
          {
            original: "の",
            hiragana: null,
            pronunciation: "노",
            meaning: "의",
            word_type: "particle",
          },
          {
            original: "こゝろ",
            hiragana: "こころ",
            pronunciation: "코코로",
            meaning: "마음",
            word_type: "noun",
          },
          {
            original: "が",
            hiragana: null,
            pronunciation: "가",
            meaning: "이/가",
            word_type: "particle",
          },
        ],
      },
      {
        sentence: {
          original: "まだまだまだまだ見えない",
          pronunciation: "마다 마다 마다 마다 미에나이",
          meaning: "아직 보이지 않아",
        },
        words: [
          {
            original: "まだ",
            hiragana: null,
            pronunciation: "마다",
            meaning: "아직",
            word_type: "adjective",
          },
          {
            original: "見えない",
            hiragana: null,
            pronunciation: "미에나이",
            meaning: "보이지 않아",
            word_type: "verb",
          },
        ],
      },
      {
        sentence: {
          original: "僕のこの腐った目じゃ",
          pronunciation: "보쿠노 코노 쿠삿타 메자",
          meaning: "내 이 썩은 눈으로는",
        },
        words: [
          {
            original: "僕",
            hiragana: "ぼく",
            pronunciation: "보쿠",
            meaning: "나",
            word_type: "noun",
          },
          {
            original: "の",
            hiragana: null,
            pronunciation: "노",
            meaning: "의",
            word_type: "particle",
          },
          {
            original: "この",
            hiragana: null,
            pronunciation: "코노",
            meaning: "이",
            word_type: "adjective",
          },
          {
            original: "腐った",
            hiragana: "くさった",
            pronunciation: "쿠삿타",
            meaning: "썩은",
            word_type: "adjective",
          },
          {
            original: "目",
            hiragana: "め",
            pronunciation: "메",
            meaning: "눈",
            word_type: "noun",
          },
          {
            original: "じゃ",
            hiragana: null,
            pronunciation: "자",
            meaning: "로는",
            word_type: "particle",
          },
        ],
      },
      {
        sentence: {
          original: "君を痛めつけるものを",
          pronunciation: "키미오 이타메츠케루 모노오",
          meaning: "너를 아프게 하는 것을",
        },
        words: [
          {
            original: "君",
            hiragana: "きみ",
            pronunciation: "키미",
            meaning: "너",
            word_type: "noun",
          },
          {
            original: "を",
            hiragana: null,
            pronunciation: "오",
            meaning: "을/를",
            word_type: "particle",
          },
          {
            original: "痛めつける",
            hiragana: "いためつける",
            pronunciation: "이타메츠케루",
            meaning: "아프게 하다",
            word_type: "verb",
          },
          {
            original: "もの",
            hiragana: "もの",
            pronunciation: "모노",
            meaning: "것",
            word_type: "noun",
          },
          {
            original: "を",
            hiragana: null,
            pronunciation: "오",
            meaning: "을/를",
            word_type: "particle",
          },
        ],
      },
      {
        sentence: {
          original: "全部見つけだしてさ",
          pronunciation: "젠부 미츠케다시테사",
          meaning: "모두 찾아내고 싶어",
        },
        words: [
          {
            original: "全部",
            hiragana: "ぜんぶ",
            pronunciation: "젠부",
            meaning: "모두",
            word_type: "noun",
          },
          {
            original: "見つけだして",
            hiragana: "みつけだして",
            pronunciation: "미츠케다시테",
            meaning: "찾아내고",
            word_type: "verb",
          },
          {
            original: "さ",
            hiragana: null,
            pronunciation: "사",
            meaning: "하고 싶어",
            word_type: "particle",
          },
        ],
      },
      {
        sentence: {
          original: "守ってあげたい",
          pronunciation: "마못테 아게타이",
          meaning: "지켜주고 싶어",
        },
        words: [
          {
            original: "守って",
            hiragana: "まもって",
            pronunciation: "마못테",
            meaning: "지켜주고",
            word_type: "verb",
          },
          {
            original: "あげたい",
            hiragana: null,
            pronunciation: "아게타이",
            meaning: "하고 싶어",
            word_type: "verb",
          },
        ],
      },
      {
        sentence: {
          original: "まだまだまだまだ見えない",
          pronunciation: "마다 마다 마다 마다 미에나이",
          meaning: "아직 보이지 않아",
        },
        words: [
          {
            original: "まだ",
            hiragana: null,
            pronunciation: "마다",
            meaning: "아직",
            word_type: "adjective",
          },
          {
            original: "見えない",
            hiragana: null,
            pronunciation: "미에나이",
            meaning: "보이지 않아",
            word_type: "verb",
          },
        ],
      },
      {
        sentence: {
          original: "君のこゝろが",
          pronunciation: "키미노 코코로가",
          meaning: "너의 마음이",
        },
        words: [
          {
            original: "君",
            hiragana: "きみ",
            pronunciation: "키미",
            meaning: "너",
            word_type: "noun",
          },
          {
            original: "の",
            hiragana: null,
            pronunciation: "노",
            meaning: "의",
            word_type: "particle",
          },
          {
            original: "こゝろ",
            hiragana: "こころ",
            pronunciation: "코코로",
            meaning: "마음",
            word_type: "noun",
          },
          {
            original: "が",
            hiragana: null,
            pronunciation: "가",
            meaning: "이/가",
            word_type: "particle",
          },
        ],
      },
      {
        sentence: {
          original: "君の闇の門を取って",
          pronunciation: "키미노 야미노 모노오 톳테",
          meaning: "너의 어둠의 문을 가져가고",
        },
        words: [
          {
            original: "君",
            hiragana: "きみ",
            pronunciation: "키미",
            meaning: "너",
            word_type: "noun",
          },
          {
            original: "の",
            hiragana: null,
            pronunciation: "노",
            meaning: "의",
            word_type: "particle",
          },
          {
            original: "闇",
            hiragana: "やみ",
            pronunciation: "야미",
            meaning: "어둠",
            word_type: "noun",
          },
          {
            original: "の",
            hiragana: null,
            pronunciation: "노",
            meaning: "의",
            word_type: "particle",
          },
          {
            original: "門",
            hiragana: "もん",
            pronunciation: "몬",
            meaning: "문",
            word_type: "noun",
          },
          {
            original: "を",
            hiragana: null,
            pronunciation: "오",
            meaning: "을/를",
            word_type: "particle",
          },
          {
            original: "取って",
            hiragana: "とって",
            pronunciation: "톳테",
            meaning: "가져가고",
            word_type: "verb",
          },
        ],
      },
      {
        sentence: {
          original: "優しい音だけの世界で",
          pronunciation: "야사시이 오토다케노 세카이데",
          meaning: "부드러운 소리만의 세계에서",
        },
        words: [
          {
            original: "優しい",
            hiragana: "やさしい",
            pronunciation: "야사시이",
            meaning: "부드러운",
            word_type: "adjective",
          },
          {
            original: "音",
            hiragana: "おと",
            pronunciation: "오토",
            meaning: "소리",
            word_type: "noun",
          },
          {
            original: "だけ",
            hiragana: null,
            pronunciation: "다케",
            meaning: "만",
            word_type: "particle",
          },
          {
            original: "の",
            hiragana: null,
            pronunciation: "노",
            meaning: "의",
            word_type: "particle",
          },
          {
            original: "世界",
            hiragana: "せかい",
            pronunciation: "세카이",
            meaning: "세계",
            word_type: "noun",
          },
          {
            original: "で",
            hiragana: null,
            pronunciation: "데",
            meaning: "에서",
            word_type: "particle",
          },
        ],
      },
      {
        sentence: {
          original: "歌ってあげたい",
          pronunciation: "우타앗테 아게타이",
          meaning: "불러주고 싶어",
        },
        words: [
          {
            original: "歌って",
            hiragana: "うたって",
            pronunciation: "우타앗테",
            meaning: "불러주고",
            word_type: "verb",
          },
          {
            original: "あげたい",
            hiragana: null,
            pronunciation: "아게타이",
            meaning: "하고 싶어",
            word_type: "verb",
          },
        ],
      },
      {
        sentence: {
          original: "まだまだまだまだ見えない",
          pronunciation: "마다 마다 마다 마다 미에나이",
          meaning: "아직 보이지 않아",
        },
        words: [
          {
            original: "まだ",
            hiragana: null,
            pronunciation: "마다",
            meaning: "아직",
            word_type: "adjective",
          },
          {
            original: "見えない",
            hiragana: null,
            pronunciation: "미에나이",
            meaning: "보이지 않아",
            word_type: "verb",
          },
        ],
      },
      {
        sentence: {
          original: "君のこゝろが",
          pronunciation: "키미노 코코로가",
          meaning: "너의 마음이",
        },
        words: [
          {
            original: "君",
            hiragana: "きみ",
            pronunciation: "키미",
            meaning: "너",
            word_type: "noun",
          },
          {
            original: "の",
            hiragana: null,
            pronunciation: "노",
            meaning: "의",
            word_type: "particle",
          },
          {
            original: "こゝろ",
            hiragana: "こころ",
            pronunciation: "코코로",
            meaning: "마음",
            word_type: "noun",
          },
          {
            original: "が",
            hiragana: null,
            pronunciation: "가",
            meaning: "이/가",
            word_type: "particle",
          },
        ],
      },
      {
        sentence: {
          original: "まだまだまだまだ見えない",
          pronunciation: "마다 마다 마다 마다 미에나이",
          meaning: "아직 보이지 않아",
        },
        words: [
          {
            original: "まだ",
            hiragana: null,
            pronunciation: "마다",
            meaning: "아직",
            word_type: "adjective",
          },
          {
            original: "見えない",
            hiragana: null,
            pronunciation: "미에나이",
            meaning: "보이지 않아",
            word_type: "verb",
          },
        ],
      },
      {
        sentence: {
          original: "君のこゝろが",
          pronunciation: "키미노 코코로가",
          meaning: "너의 마음이",
        },
        words: [
          {
            original: "君",
            hiragana: "きみ",
            pronunciation: "키미",
            meaning: "너",
            word_type: "noun",
          },
          {
            original: "の",
            hiragana: null,
            pronunciation: "노",
            meaning: "의",
            word_type: "particle",
          },
          {
            original: "こゝろ",
            hiragana: "こころ",
            pronunciation: "코코로",
            meaning: "마음",
            word_type: "noun",
          },
          {
            original: "が",
            hiragana: null,
            pronunciation: "가",
            meaning: "이/가",
            word_type: "particle",
          },
        ],
      },
    ],
  };

  const saveLyrics = async () => {
    await saveLyricsWithSong(lyrics as unknown as CompactedLyricsData);
  };

  return (
    <div className="container mx-auto py-10">
      <button onClick={saveLyrics}>저장</button>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>가사 분석 도구</CardTitle>
          <CardDescription>일본어 가사를 분석하여 단어 정보를 추출합니다</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="jsonInput" className="text-sm font-medium">
                  JSON 입력 (title과 lyrics 필드 포함)
                </label>
                <Button type="button" variant="outline" size="sm" onClick={setExampleData}>
                  예시 데이터
                </Button>
              </div>
              <Textarea
                id="jsonInput"
                placeholder={`{\n  "title": "노래 제목",\n  "lyrics": "가사 내용..."\n}`}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="min-h-[200px] font-mono"
              />
            </div>

            {response && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">분석 결과</label>
                  <Button type="button" variant="ghost" size="sm" onClick={handleCopy}>
                    <Clipboard className="h-4 w-4 mr-2" />
                    복사
                  </Button>
                </div>
                <div className="p-4 rounded-md bg-muted whitespace-pre-wrap overflow-auto max-h-[400px] font-mono text-sm">
                  {response}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !jsonInput.trim()}>
              {isLoading ? "분석 중..." : "가사 분석"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
