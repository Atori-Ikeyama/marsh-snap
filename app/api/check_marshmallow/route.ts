import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

export const Judgment = z.object({
  judgment: z.string(),
  comment: z.string(),
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const preprocess = (dataString: string) => {
  const matches = dataString.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 string");
  }
  return matches[2];
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const params = await request.json();

  const imageBuffer = preprocess(params.snapshot);

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "画像にマシュマロが写っている場合，そのマシュマロの焼き加減を３段階で判定してください．判定結果は「お見事」「おしい」「ひどい」の3つです．判定の結果に加え，一言アドバイスの添えてください．例えば，「ひどい」の場合，もう一つ買って再度挑戦しようなどです．",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBuffer}`,
            },
          },
        ],
      },
    ],
    response_format: zodResponseFormat(Judgment, "judgment"),
  });

  try {
    return NextResponse.json(completion.choices[0].message.parsed);
  } catch (error) {
    throw error;
  }
}
