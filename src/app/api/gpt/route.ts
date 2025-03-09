import { saveLyricsWithSong } from "@/app/_lib/lyrics-api";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const logToFile = (data: string, filename: string) => {
  const logDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logPath = path.join(logDir, filename);
  fs.writeFileSync(logPath, typeof data === "string" ? data : JSON.stringify(data, null, 2));
  console.log(`로그가 ${logPath}에 저장되었습니다.`);
};

export async function POST(request: Request) {
  try {
    const { title, lyrics } = await request.json();
    console.log(`${title} 분석중...`);
    // 가사 분석 요청인 경우
    if (title && lyrics) {
      const prompt = `
다음 JSON 형식의 데이터를 분석하여 일본어 가사의 제목과 내용을 추출하고, 각 문장과 단어 정보를 JSON 형식으로 제공하세요. 제목은 'title' 필드에, 가사는 'lyrics' 필드에 저장하고, 가사의 첫 줄을 제목으로 오인하지 마세요.



출력 형식:
{
  "title": { 
    "t": "일본어 제목", 
    "k": "한국어 제목" 
  },
  "lyrics": [
    {
      "s": {
        "o": "일본어 문장",
        "p": "한국어 발음",
        "m": "한국어 의미"
      },
      "w": [
        {
          "o": "단어",
          "h": "히라가나 또는 null",
          "p": "발음",
          "m": "의미",
          "t": "verb, particle, noun, adjective 중 하나"
        }
      ]
    }
  ]
}

요구사항:
1. 히라가나와 original이 같으면 "hiragana"는 null로 설정
2. "pronunciation"은 한국어 발음처럼 띄어쓰기를 포함해 표기
3. "word_type"은 verb, particle, noun, adjective,adverb 중 하나로 분류
4. "meaning"은 노래 가사처럼 자연스럽게 번역 (예: "아직 보이지 않는다"가 아니라 "아직 보이지 않아")
5. 한국어 번역 시 조사도 함께 붙여서 표기 (예: "君のこゝろが"는 "키미노 코코로가")
6. 가사는 생략하지 말고 전체를 분석
7. title이 영어로 제공될 경우 출력에서 title의 t는 일본어(가타카나,히라가나,한자 중 하나)로 표기, k는 한국어로 번역하여 표기하세요
8. 조사 "な"는 분리하지 않고 표기 
ex)
"o": "強がりな",
"h": "つよがりな",
"p": "츠요가리나",
9. "?"는 단어로 분리하지말고 스킵

위의 조건을 모두 만족하는 JSON 결과만 출력하세요
예시는 다음과 같습니다.
아래는 전체 예시입니다:
{
  "title": {
    "t": "○○ちゃん",
    "k": "○○짱"
  },
  "lyrics": [
    {
      "s": {
        "o": "私のこれまでの恋は",
        "p": "와타시노 코레마데노 코이와",
        "m": "나의 지금까지의 사랑은"
      },
      "w": [
        {
          "o": "私",
          "h": "わたし",
          "p": "와타시",
          "m": "나",
          "t": "noun"
        },
        {
          "o": "の",
          "h": null,
          "p": "노",
          "m": "의",
          "t": "particle"
        },
        {
          "o": "これまで",
          "h": null,
          "p": "코레마데",
          "m": "지금까지",
          "t": "noun"
        },
        {
          "o": "の",
          "h": null,
          "p": "노",
          "m": "의",
          "t": "particle"
        },
        {
          "o": "恋",
          "h": "こい",
          "p": "코이",
          "m": "사랑",
          "t": "noun"
        },
        {
          "o": "は",
          "h": null,
          "p": "와",
          "m": "은",
          "t": "particle"
        }
      ]
    },
    {
      "s": {
        "o": "この強がりな性格が邪魔をして",
        "p": "코노 츠요가리나 세이카쿠가 자마오 시테",
        "m": "이 강한 척하는 성격이 방해해서"
      },
      "w": [
        {
          "o": "この",
          "h": null,
          "p": "코노",
          "m": "이",
          "t": "adjective"
        },
        {
          "o": "強がりな",
          "h": "つよがりな",
          "p": "츠요가리나",
          "m": "강한척하는",
          "t": "adjective"
        },
        {
          "o": "性格",
          "h": "せいかく",
          "p": "세이카쿠",
          "m": "성격",
          "t": "noun"
        },
        {
          "o": "が",
          "h": null,
          "p": "가",
          "m": "이",
          "t": "particle"
        },
        {
          "o": "邪魔",
          "h": "じゃま",
          "p": "자마",
          "m": "방해",
          "t": "noun"
        },
        {
          "o": "を",
          "h": null,
          "p": "오",
          "m": "를",
          "t": "particle"
        },
        {
          "o": "して",
          "h": null,
          "p": "시테",
          "m": "해서",
          "t": "verb"
        }
      ]
    }
  ]
}
    입력:   
    title: ${title}
    lyrics: ${lyrics}
`;

      try {
        // 첫 번째 분석 요청
        const result = await model.generateContent(prompt);

        const initialResult = result.response.text();

        // 파일에 로그 저장하기 전에 JSON 형식 정리
        let cleanInitialResult = initialResult;
        if (initialResult.startsWith("```json")) {
          cleanInitialResult = initialResult.replace(/^```json\n|\n```$/g, "");
        } else if (initialResult.startsWith("```")) {
          cleanInitialResult = initialResult.replace(/^```\n|\n```$/g, "");
        }

        // 파일에 로그 저장
        logToFile(cleanInitialResult, `${title}-initial-result.json`);

        console.log("1차 분석 완료");

        //         const verificationPrompt = `

        // 다음 결과가 요구사항에 맞는지 확인하고 수정해주세요:

        // 1. h와 o가 같으면 h는 null
        // 2. p는 한국어 발음으로 띄어쓰기 포함
        // 3. t는 verb, particle, noun, adjective 중 하나로 분류
        // 4. m이 노래 가사처럼 자연스럽게 번역되었는지 확인 (예: "아직 보이지 않는다"가 아니라 "아직 보이지 않아")
        // 5. 조사는 붙여서 표기 (예: "키미노 코코로가")
        // ex) "君のこゝろが"
        // "키미노 코코로가"
        // 너의 마음이
        // ex) 少し匂いを嗅がせて
        // 스코시 니오이오 카가세테
        // 조금 냄새를 맡게 해줘
        // ex) お風呂からあがったら
        // 오후로 카라 아갓타라
        // 목욕 에서 나오면
        // 6. 가사 전체가 빠짐없이 분석되었는지 확인

        // 분석 결과:
        // ${cleanInitialResult}

        // 위 결과를 검증하고, 요구사항에 맞게 수정된 결과를 JSON 형식으로만 제공해주세요.
        // 설명이나 추가 텍스트 없이 반드시 순수 JSON만 반환하세요.
        // `;

        // console.log("검증 중...");
        // const verificationResponse = await model.generateContent(verificationPrompt);
        // const verificationResult = verificationResponse.response.text();

        // // 파일에 로그 저장하기 전에 JSON 형식 정리
        // let cleanVerificationResult = verificationResult;
        // if (verificationResult.startsWith("```json")) {
        //   cleanVerificationResult = verificationResult.replace(/^```json\n|\n```$/g, "");
        // } else if (verificationResult.startsWith("```")) {
        //   cleanVerificationResult = verificationResult.replace(/^```\n|\n```$/g, "");
        // }

        // // 파일에 로그 저장
        // logToFile(cleanVerificationResult, `${title}-verification-result.json`);

        // console.log("2차 분석 완료");
        const cleanVerificationResult = cleanInitialResult;

        try {
          const { success, songId, error } = await saveLyricsWithSong(JSON.parse(cleanVerificationResult || "{}"));
          if (success) {
            console.log(`저장 성공! 노래 ID: ${songId}`);
            return NextResponse.json(
              {
                content: cleanVerificationResult,
              },
              { status: 200 }
            );
          } else {
            console.error("저장 실패:", error);
            return NextResponse.json(
              {
                error: "가사 저장 실패",
                message:
                  typeof error === "object" && error !== null && "message" in error
                    ? (error as { message: string }).message
                    : "알 수 없는 오류가 발생했습니다",
                success: false,
              },
              { status: 400 }
            );
          }
        } catch (error) {
          console.error("저장 실패:", error);
          return NextResponse.json(
            {
              error: "가사 저장 처리 중 오류 발생",
              message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
              success: false,
            },
            { status: 500 }
          );
        }
      } catch (apiError) {
        console.error("OpenAI API 첫 번째 시도 실패:", apiError);
        return NextResponse.json({ error: "API 요청 처리 중 오류가 발생했습니다" }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: "제목과 가사 정보가 필요합니다" }, { status: 400 });
    }
  } catch (error) {
    console.error("OpenAI API 오류:", error);
    return NextResponse.json({ error: "API 요청 처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
