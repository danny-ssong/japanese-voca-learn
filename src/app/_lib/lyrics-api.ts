import { toast } from "sonner";
import { addSong } from "./song-api";
import { addWord } from "./word-api";
import { addSentence, addSentenceWord } from "./sentence-api";
import { findExistingWord } from "./word-api";

interface LyricsWord {
  original: string;
  hiragana: string | null;
  pronunciation: string;
  meaning: string;
  word_type: string;
}

interface LyricsSentence {
  sentence: {
    original: string;
    pronunciation: string;
    meaning: string;
  };
  words: LyricsWord[];
}

interface LyricsData {
  title: {
    title: string;
    title_korean: string;
  };
  lyrics: LyricsSentence[];
}

export async function saveLyricsWithSong(lyricsData: LyricsData) {
  try {
    // 트랜잭션 시작
    const {
      success: songSuccess,
      songId,
      error: songError,
    } = await addSong({
      title: lyricsData.title.title,
      title_korean: lyricsData.title.title_korean,
    });

    if (!songSuccess || songError || !songId) {
      throw songError || new Error("노래 추가 실패");
    }

    // 단어 사전 (중복 방지)
    const wordDict: Record<string, string> = {};

    // 각 문장과 단어 처리
    for (let i = 0; i < lyricsData.lyrics.length; i++) {
      const lyricItem = lyricsData.lyrics[i];

      // 1. 문장 추가
      const { data: sentenceData, error: sentenceError } = await addSentence(songId, lyricItem.sentence, i);

      if (sentenceError || !sentenceData) {
        throw sentenceError || new Error(`문장 추가 실패: ${i + 1}번째 문장`);
      }

      const sentenceId = sentenceData.id;

      // 2. 각 단어 처리
      for (let j = 0; j < lyricItem.words.length; j++) {
        const wordItem = lyricItem.words[j];
        const wordKey = `${wordItem.original}-${wordItem.pronunciation}-${wordItem.meaning}`;

        let wordId;

        // 이미 추가된 단어인지 확인 (현재 세션)
        if (wordDict[wordKey]) {
          wordId = wordDict[wordKey];
        } else {
          // 데이터베이스에서 단어 검색
          const { data: existingWord } = await findExistingWord(wordItem.original, wordItem.hiragana);

          if (existingWord) {
            // 이미 데이터베이스에 존재하는 단어 사용
            wordId = existingWord.id;
            wordDict[wordKey] = wordId;
          } else {
            // 새 단어 추가
            const {
              success,
              wordId: newWordId,
              error,
            } = await addWord(
              {
                original: wordItem.original,
                hiragana: wordItem.hiragana,
                pronunciation: wordItem.pronunciation,
                meaning: wordItem.meaning,
                word_type: wordItem.word_type,
                order: Object.keys(wordDict).length, // 단어 순서
              },
              songId
            );

            if (!success || error) {
              throw error || new Error(`단어 추가 실패: ${wordItem.original}`);
            }

            wordId = newWordId;
            wordDict[wordKey] = wordId;
          }
        }

        // 3. 문장-단어 연결
        const { success: linkSuccess, error: linkError } = await addSentenceWord(sentenceId, wordId, j);

        if (!linkSuccess || linkError) {
          throw linkError || new Error(`문장-단어 연결 실패: ${wordItem.original}`);
        }
      }
    }

    toast.success("가사 저장 성공", {
      description: "노래와 가사가 성공적으로 저장되었습니다.",
    });

    return { success: true, songId, error: null };
  } catch (error) {
    console.error("가사 저장 실패:", error);
    toast.error("가사 저장 실패", {
      description: "가사를 저장하는 중 오류가 발생했습니다.",
    });
    return { success: false, songId: null, error };
  }
}
