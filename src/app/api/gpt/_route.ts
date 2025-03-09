import { saveLyricsWithSong } from "@/app/_lib/lyrics-api";
import { NextResponse } from "next/server";
import OpenAI from "openai";

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { title, lyrics } = await request.json();
    console.log(`${title} 분석중...`);
    // 가사 분석 요청인 경우
    if (title && lyrics) {
      const systemPrompt = `
당신은 일본어 가사를 분석하고 단어 정보를 추출하는 전문가입니다.
주어진 일본어 가사를 문장별로 분석하고, 각 문장에 포함된 단어의 정보를 아래 JSON 형식으로 제공하세요:

{
  "title": { "title": "일본어 제목", "title_korean": "한국어 제목" },
  "lyrics": [
    {
      "sentence": {
        "original": "일본어 문장",
        "pronunciation": "한국어 발음",
        "meaning": "한국어 의미"
      },
      "words": [
        {
          "original": "단어",
          "hiragana": "히라가나 또는 null",
          "pronunciation": "발음",
          "meaning": "의미",
          "word_type": "verb, particle, noun, adjective 중 하나"
        }
      ]
    }
  ]
}

요구사항:
1. 히라가나와 original이 같으면 "hiragana"는 null로 설정
2. "pronunciation"은 한국어 발음처럼 띄어쓰기를 포함해 표기
3. "word_type"은 verb, particle, noun, adjective 중 하나로 분류
4. "meaning"은 노래 가사처럼 자연스럽게 번역 (예: "아직 보이지 않는다"가 아니라 "아직 보이지 않아")
5. 한국어 번역 시 조사도 함께 붙여서 표기 (예: "君のこゝろが"는 "키미노 코코로가")
6. 가사는 생략하지 말고 전체를 분석

위의 조건을 모두 만족하는 JSON 결과만 출력하세요.
예시는 다음과 같습니다.
{
  "title": {
    "title": "○○ちゃん",
    "title_korean": "○○짱"
  },
  "lyrics": [
    {
      "sentence": {
        "original": "私のこれまでの恋は",
        "pronunciation": "와타시노 코레마데노 코이와",
        "meaning": "나의 지금까지의 사랑은"
      },
      "words": [
        {
          "original": "私",
          "hiragana": "わたし",
          "pronunciation": "와타시",
          "meaning": "나",
          "word_type": "noun"
        },
        {
          "original": "の",
          "hiragana": null,
          "pronunciation": "노",
          "meaning": "의",
          "word_type": "particle"
        },
        {
          "original": "これまで",
          "hiragana": null,
          "pronunciation": "코레마데",
          "meaning": "지금까지",
          "word_type": "noun"
        },
        {
          "original": "の",
          "hiragana": null,
          "pronunciation": "노",
          "meaning": "의",
          "word_type": "particle"
        },
        {
          "original": "恋",
          "hiragana": "こい",
          "pronunciation": "코이",
          "meaning": "사랑",
          "word_type": "noun"
        },
        {
          "original": "は",
          "hiragana": null,
          "pronunciation": "와",
          "meaning": "은",
          "word_type": "particle"
        }
      ]
    },
    {
      "sentence": {
        "original": "この強がりな性格が邪魔をして",
        "pronunciation": "코노 츠요가리나 세이카쿠가 자마오 시테",
        "meaning": "이 강한 척하는 성격이 방해해서"
      },
      "words": [
        {
          "original": "この",
          "hiragana": null,
          "pronunciation": "코노",
          "meaning": "이",
          "word_type": "adjective"
        },
        {
          "original": "強がりな",
          "hiragana": "つよがりな",
          "pronunciation": "츠요가리나",
          "meaning": "강한척하는",
          "word_type": "adjective"
        },
        {
          "original": "性格",
          "hiragana": "せいかく",
          "pronunciation": "세이카쿠",
          "meaning": "성격",
          "word_type": "noun"
        },
        {
          "original": "が",
          "hiragana": null,
          "pronunciation": "가",
          "meaning": "이",
          "word_type": "particle"
        },
        {
          "original": "邪魔",
          "hiragana": "じゃま",
          "pronunciation": "자마",
          "meaning": "방해",
          "word_type": "noun"
        },
        {
          "original": "を",
          "hiragana": null,
          "pronunciation": "오",
          "meaning": "를",
          "word_type": "particle"
        },
        {
          "original": "して",
          "hiragana": null,
          "pronunciation": "시테",
          "meaning": "해서",
          "word_type": "verb"
        }
      ]
    },
   ...
    ]
`;

      try {
        // 첫 번째 분석 요청
        const initialResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini", // gpt-4o 대신 gpt-3.5-turbo 사용하여 비용 절감
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `제목: ${title}\n가사: ${lyrics}\n\n위 노래의 제목과 가사를 분석해주세요. JSON 형식으로만 응답하세요.`,
            },
          ],
          temperature: 0.1,
          max_tokens: 10000,
          response_format: { type: "json_object" }, // JSON 응답 형식 강제
        });

        const initialResult = initialResponse.choices[0].message.content;

        // 검증 요청 (JSON 형식만 반환하도록 최적화)
        const verificationPrompt = `
        
다음은 일본어 가사 분석 결과입니다. 이 결과가 아래 요구사항에 맞게 분석되었는지 확인하고, 필요한 경우 수정해주세요:

1. 히라가나와 original이 같으면 hiragana는 null로 설정되어 있는지 확인
2. pronunciation에 한국어와 유사하게 띄어쓰기가 포함되어 있는지 확인
3. 모든 단어의 품사가 verb, particle, noun, adjective 중 하나인지 확인
4. meaning이 노래 가사처럼 자연스럽게 번역되었는지 확인 (예: "아직 보이지 않는다"가 아니라 "아직 보이지 않아")
5. 한국어 번역 시 조사가 붙어있는지 확인 ex) "君のこゝろが"는 "키미노 코코로가"
6. 가사 전체가 빠짐없이 분석되었는지 확인

분석 결과:
${initialResult}

위 결과를 검증하고, 요구사항에 맞게 수정된 결과를 JSON 형식으로만 제공해주세요. 
설명이나 추가 텍스트 없이 순수 JSON만 반환하세요.
`;
        console.log("1차 분석 완료");
        console.log(initialResult);
        console.log("검증 요청 중...");
        const verificationResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini", // gpt-4o 대신 gpt-3.5-turbo 사용
          messages: [
            {
              role: "system",
              content: "당신은 일본어 가사 분석 결과를 검증하는 전문가입니다. JSON 형식으로만 응답하세요.",
            },
            { role: "user", content: verificationPrompt },
          ],
          temperature: 0.1,
          max_tokens: 10000,
          response_format: { type: "json_object" }, // JSON 응답 형식 강제
        });
        console.log("2차 분석 완료");
        console.log(verificationResponse.choices[0].message.content);
        // 응답에서 토큰 사용량 추출
        const promptTokens =
          (initialResponse.usage?.prompt_tokens || 0) + (verificationResponse.usage?.prompt_tokens || 0);
        const completionTokens =
          (initialResponse.usage?.completion_tokens || 0) + (verificationResponse.usage?.completion_tokens || 0);
        const totalTokens =
          (initialResponse.usage?.total_tokens || 0) + (verificationResponse.usage?.total_tokens || 0);
        // 저장 함수 호출
        try {
          const { success, songId, error } = await saveLyricsWithSong(
            JSON.parse(verificationResponse.choices[0].message.content || "{}")
          );
          if (success) {
            console.log(`저장 성공! 노래 ID: ${songId}`);
            return NextResponse.json(
              {
                content: verificationResponse.choices[0].message.content,
                usage: {
                  prompt_tokens: promptTokens,
                  completion_tokens: completionTokens,
                  total_tokens: totalTokens,
                },
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
