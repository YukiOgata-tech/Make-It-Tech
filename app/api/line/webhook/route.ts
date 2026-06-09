import { messagingApi, validateSignature } from "@line/bot-sdk";
import { NextRequest } from "next/server";

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-line-signature") ?? "";
  const body = await req.text();

  if (!validateSignature(body, process.env.LINE_CHANNEL_SECRET!, signature)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { events } = JSON.parse(body);

  for (const event of events) {
    if (event.type !== "message" || event.message.type !== "text") continue;

    if (event.message.text === "実績見せて") {
      await client.replyMessage(event.replyToken, {
        type: "text",
        text: "実績はこちらからご覧いただけます！\nhttps://make-it-tech.com/works",
      });
    }
  }

  return new Response("OK", { status: 200 });
}
