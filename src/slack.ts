import type { Handler } from "@netlify/functions";
import { slackApi, verifySlackRequest } from "./util/slack";
import { parse } from "querystring";

async function handleSlashCommand(payload: SlackSlashCommandPayload) {
  switch (payload.command) {
    case "/foodfight":
      const joke = await fetch("https://icanhazdadjoke.com", {
        headers: { accept: "text/plain" },
      });
      const response = await slackApi("chat.postMessage", {
        channel: payload.channel_id,
        text: await joke.text(),
      });

      if (!response.ok) {
        console.log(response);
      }
      break;

    default:
      return {
        statusCode: 200,
        body: `Command ${payload.command} is not recognized`,
      };
  }
  return {
    statusCode: 200,
    body: "",
  };
}

export const handler: Handler = async (event) => {
  const valid = verifySlackRequest(event);
  if (!valid) {
    console.error("invalid request");
    return {
      statusCode: 400,
      body: "invalid request",
    };
  }

  const body = parse(event.body ?? "") as SlackPayload;
  if (body.command) {
    return handleSlashCommand(body as SlackSlashCommandPayload);
  }

  return {
    statusCode: 200,
    body: "TODO: handle Slack commands and interactivity",
  };
};
