import { addSong, getSongId } from "./song-api";
import { addWord } from "./word-api";
import { addSentence, addSentenceWord } from "./sentence-api";
import { findExistingWord } from "./word-api";

export interface CompactedLyricsData {
  title: {
    t: string;
    k: string;
  };
  lyrics: CompactedLyricsSentence[];
}

interface CompactedLyricsSentence {
  s: {
    o: string;
    p: string;
    m: string;
  };
  w: CompactedLyricsWord[];
}

interface CompactedLyricsWord {
  o: string;
  h: string | null;
  p: string;
  m: string;
  t: string;
}

// 축약된 형식을 원래 형식으로 변환하는 함수
export function expandFormat(data: CompactedLyricsData) {
  return {
    title: {
      title: data.title.t,
      title_korean: data.title.k,
    },
    lyrics: data.lyrics.map((item: CompactedLyricsSentence) => ({
      sentence: {
        original: item.s.o,
        pronunciation: item.s.p,
        meaning: item.s.m,
      },
      words: item.w.map((word: CompactedLyricsWord) => ({
        original: word.o,
        hiragana: word.h,
        pronunciation: word.p,
        meaning: word.m,
        word_type: word.t,
      })),
    })),
  };
}

export async function saveLyricsWithSong(lyricsData: CompactedLyricsData) {
  try {
    // 축약된 형식을 원래 형식으로 변환
    const expandedData = expandFormat(lyricsData);

    const songId = (await getSongId(expandedData.title)) ?? (await addSong(expandedData.title));

    if (!songId) {
      throw new Error("노래 추가 실패");
    }

    // 단어 사전 (중복 방지)
    const wordDict: Record<string, string> = {};

    // 각 문장과 단어 처리
    for (let i = 0; i < expandedData.lyrics.length; i++) {
      const lyricItem = expandedData.lyrics[i];

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
          const { data: existingWord } = await findExistingWord(wordItem.original);

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
            } = await addWord({
              original: wordItem.original,
              hiragana: wordItem.hiragana,
              pronunciation: wordItem.pronunciation,
              meaning: wordItem.meaning,
              word_type: wordItem.word_type,
            });

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

    return { success: true, songId, error: null };
  } catch (error) {
    console.error("가사 저장 실패:", error);

    return { success: false, songId: null, error };
  }
}
