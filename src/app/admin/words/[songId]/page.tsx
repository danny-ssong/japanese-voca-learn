"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/app/_components/auth-provider";
import type { Song, Word } from "@/types";
import { WordExport } from "@/app/admin/_components/word-export";
import { fetchWords, addWord, updateWord, deleteWord, moveWord, bulkImportWords } from "@/app/admin/_lib/word-service";
import { fetchSongById } from "@/app/admin/_lib/song-service";
import { getUser } from "../../_lib/user-service";

export default function AdminSongWordsPage() {
  const [song, setSong] = useState<Song | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWord, setNewWord] = useState<Partial<Word>>({
    original: "",
    hiragana: "",
    pronunciation: "",
    meaning: "",
    word_type: "noun",
    order: 0,
  });
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [jsonInput, setJsonInput] = useState<string>("");
  const router = useRouter();
  const { authUser } = useAuth();
  const songId = useParams().songId as string;

  useEffect(() => {
    async function checkAdminAndFetchData() {
      if (!authUser) {
        // router.push("/auth");
        return;
      }

      try {
        // 관리자 권한 확인
        const user = await getUser(authUser.id);

        if (!user?.is_admin) {
          toast.error("접근 권한 없음", {
            description: "관리자만 접근할 수 있는 페이지입니다.",
          });
          router.push("/");
          return;
        }

        // 노래 정보 가져오기
        const { data: songData, error: songError } = await fetchSongById(songId);

        if (songError) throw songError;
        setSong(songData);

        // 단어 목록 가져오기
        const { data, error } = await fetchWords(songId);
        if (!error) {
          setWords(data);
        }
      } catch (error) {
        console.error("Error checking admin status or fetching song:", error);
        toast.error("데이터 로딩 실패", {
          description: "정보를 불러오는 중 오류가 발생했습니다.",
        });
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndFetchData();
  }, [authUser, router, songId]);

  async function fetchWordList() {
    const { data, error } = await fetchWords(songId);
    if (!error) {
      setWords(data);
    }
  }

  async function handleAddWord() {
    if (!newWord.original || !newWord.pronunciation || !newWord.meaning) {
      toast.error("필수 정보 누락", {
        description: "원어, 발음, 뜻은 필수 입력 항목입니다.",
      });
      return;
    }

    // 현재 단어 개수를 기준으로 order 값 설정
    const order = words.length > 0 ? Math.max(...words.map((w) => w.order)) + 1 : 0;
    const wordToAdd = { ...newWord, order, song_id: songId };

    const { success } = await addWord(wordToAdd, songId);

    if (success) {
      setNewWord({
        original: "",
        hiragana: "",
        pronunciation: "",
        meaning: "",
        word_type: "noun",
        order: 0,
      });
      fetchWordList();
    }
  }

  async function handleUpdateWord() {
    if (!editingWord) return;

    if (!editingWord.original || !editingWord.pronunciation || !editingWord.meaning) {
      toast.error("필수 정보 누락", {
        description: "원어, 발음, 뜻은 필수 입력 항목입니다.",
      });
      return;
    }

    const { success } = await updateWord(editingWord);

    if (success) {
      setEditingWord(null);
      fetchWordList();
    }
  }

  async function handleDeleteWord(id: string) {
    if (!confirm("정말로 이 단어를 삭제하시겠습니까?")) {
      return;
    }

    const { success } = await deleteWord(id);

    if (success) {
      fetchWordList();
    }
  }

  async function handleMoveWord(id: string, direction: "up" | "down") {
    const { success } = await moveWord(words, id, direction);

    if (success) {
      fetchWordList();
    }
  }

  async function handleBulkImport(jsonText: string) {
    const maxOrder = words.length > 0 ? Math.max(...words.map((w) => w.order)) : -1;
    const { success } = await bulkImportWords(jsonText, songId, maxOrder);

    if (success) {
      fetchWordList();
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">데이터를 불러오는 중...</div>;
  }

  if (!song) {
    return <div className="flex justify-center p-8">노래 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{song.title} - 단어 관리</h1>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin")}>
          관리자 대시보드로 돌아가기
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold mb-4">새 단어 추가</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="original" className="text-sm font-medium block mb-1">
                원어 *
              </label>
              <Input
                id="original"
                value={newWord.original}
                onChange={(e) => setNewWord({ ...newWord, original: e.target.value })}
                placeholder="원어"
              />
            </div>
            <div>
              <label htmlFor="hiragana" className="text-sm font-medium block mb-1">
                히라가나 (선택사항)
              </label>
              <Input
                id="hiragana"
                value={newWord.hiragana || ""}
                onChange={(e) => setNewWord({ ...newWord, hiragana: e.target.value })}
                placeholder="히라가나"
              />
            </div>
            <div>
              <label htmlFor="pronunciation" className="text-sm font-medium block mb-1">
                발음 *
              </label>
              <Input
                id="pronunciation"
                value={newWord.pronunciation || ""}
                onChange={(e) => setNewWord({ ...newWord, pronunciation: e.target.value })}
                placeholder="발음"
              />
            </div>
            <div>
              <label htmlFor="meaning" className="text-sm font-medium block mb-1">
                뜻 *
              </label>
              <Input
                id="meaning"
                value={newWord.meaning}
                onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                placeholder="뜻"
              />
            </div>
            <div>
              <label htmlFor="wordType" className="text-sm font-medium block mb-1">
                품사
              </label>
              <Select
                value={newWord.word_type}
                onValueChange={(value) => setNewWord({ ...newWord, word_type: value as Word["word_type"] })}
              >
                <SelectTrigger id="wordType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="noun">명사</SelectItem>
                  <SelectItem value="verb">동사</SelectItem>
                  <SelectItem value="adjective">형용사</SelectItem>
                  <SelectItem value="particle">조사</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddWord}>단어 추가</Button>
        </CardFooter>
      </Card>

      <div className="mt-4">
        <h3 className="text-lg font-bold mb-4">JSON 일괄 추가</h3>
        <div className="flex gap-4">
          <textarea
            className="flex-1 min-h-[200px] p-2 border rounded-md"
            placeholder={`{
              "nouns": [{ "original": "君", "hiragana": "きみ", "pronounce": "키미", "meaning": "너" }],
              "particles": [{ "original": "の", "pronounce": "노", "meaning": "~의" }],
              "verbs": [{ "original": "生きる", "hiragana": "いきる", "pronounce": "이키루", "meaning": "살다" }],
              "adjectives": [{ "original": "悪い", "hiragana": "わるい", "pronounce": "와루이", "meaning": "나쁘다" }]
              }`}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          <Button onClick={() => handleBulkImport(jsonInput)}>일괄 추가</Button>
        </div>
      </div>

      <div>
        <WordExport words={words} />
      </div>

      <div className="mb-4 flex gap-2 items-center">
        <h3 className="text-lg font-bold">단어 목록</h3>
        <p className="text-sm text-muted-foreground">총 단어 수:{words.length}</p>
        <p className="text-sm text-muted-foreground">
          명사: {words.filter((word) => word.word_type === "noun").length}
        </p>
        <p className="text-sm text-muted-foreground">
          동사: {words.filter((word) => word.word_type === "verb").length}
        </p>
        <p className="text-sm text-muted-foreground">
          형용사: {words.filter((word) => word.word_type === "adjective").length}
        </p>
        <p className="text-sm text-muted-foreground">
          조사: {words.filter((word) => word.word_type === "particle").length}
        </p>
      </div>
      {words.length === 0 ? (
        <p className="text-center py-4">등록된 단어가 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {words.map((word) =>
            editingWord && editingWord.id === word.id ? (
              <Card key={word.id}>
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor={`edit-original-${word.id}`} className="text-sm font-medium block mb-1">
                        원어 *
                      </label>
                      <Input
                        id={`edit-original-${word.id}`}
                        value={editingWord.original}
                        onChange={(e) => setEditingWord({ ...editingWord, original: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor={`edit-hiragana-${word.id}`} className="text-sm font-medium block mb-1">
                        히라가나 (선택사항)
                      </label>
                      <Input
                        id={`edit-hiragana-${word.id}`}
                        value={editingWord.hiragana || ""}
                        onChange={(e) => setEditingWord({ ...editingWord, hiragana: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor={`edit-pronunciation-${word.id}`} className="text-sm font-medium block mb-1">
                        발음 *
                      </label>
                      <Input
                        id={`edit-pronunciation-${word.id}`}
                        value={editingWord.pronunciation || ""}
                        onChange={(e) => setEditingWord({ ...editingWord, pronunciation: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor={`edit-meaning-${word.id}`} className="text-sm font-medium block mb-1">
                        뜻 *
                      </label>
                      <Input
                        id={`edit-meaning-${word.id}`}
                        value={editingWord.meaning}
                        onChange={(e) => setEditingWord({ ...editingWord, meaning: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor={`edit-wordType-${word.id}`} className="text-sm font-medium block mb-1">
                        품사
                      </label>
                      <Select
                        value={editingWord.word_type}
                        onValueChange={(value) =>
                          setEditingWord({ ...editingWord, word_type: value as Word["word_type"] })
                        }
                      >
                        <SelectTrigger id={`edit-wordType-${word.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="noun">명사</SelectItem>
                          <SelectItem value="verb">동사</SelectItem>
                          <SelectItem value="adjective">형용사</SelectItem>
                          <SelectItem value="particle">조사</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button onClick={handleUpdateWord}>저장</Button>
                  <Button variant="outline" onClick={() => setEditingWord(null)}>
                    취소
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card key={word.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-bold">{word.original}</h4>
                      {word.hiragana && <p className="text-sm text-muted-foreground">{word.hiragana}</p>}
                    </div>
                    <span className="px-2 py-1 bg-secondary rounded-md text-xs">
                      {word.word_type === "noun"
                        ? "명사"
                        : word.word_type === "verb"
                        ? "동사"
                        : word.word_type === "adjective"
                        ? "형용사"
                        : "조사"}
                    </span>
                  </div>
                  <p className="mb-1">
                    <span className="text-sm font-medium">발음:</span> {word.pronunciation}
                  </p>
                  <p>
                    <span className="text-sm font-medium">뜻:</span> {word.meaning}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingWord(word)}>
                      수정
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteWord(word.id)}>
                      삭제
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleMoveWord(word.id, "up")}
                      disabled={words.indexOf(word) === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleMoveWord(word.id, "down")}
                      disabled={words.indexOf(word) === words.length - 1}
                    >
                      ↓
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
