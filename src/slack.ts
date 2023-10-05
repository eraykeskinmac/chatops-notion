import type { Handler } from "@netlify/functions";
import { blocks, modal, slackApi, verifySlackRequest } from "./util/slack";
import { parse } from "querystring";

async function handleSlashCommand(payload: SlackSlashCommandPayload) {
  switch (payload.command) {
    case "/foodfight":
      const response = await slackApi(
        "views.open",
        modal({
          id: "foodfight-modal",
          title: "Start a food fight",
          trigger_id: payload.trigger_id,
          blocks: [
            blocks.section({
              text: "The discourse demands food drama! Send in your spicest food take so we can all argue about them and feel alive.",
            }),
            blocks.input({
              id: "opinion",
              label: "Deposit your controversial food opinion here.",
              placeholder:
                "Example: peanut butter and mayonnise sandwiches are delicious!",
              initial_value: payload.text ?? "",
              hint: "What do you believe about foot that people find appalling? Say it with your chest!",
            }),
            blocks.select({
              id: "spice_level",
              label: "How spicy is this opinion?",
              placeholder: "Select a spice level",
              options: [
                { label: "mild", value: "mild" },
                { label: "medium", value: "medium" },
                { label: "spicy", value: "spicy" },
                { label: "nuclear", value: "nuclear" },
              ],
            }),
          ],
        })
      );

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

async function handleInteractivity(payload: SlackModalPayload) {
  const callback_id = payload.callback_id ?? payload.view.callback_id;

  switch (callback_id) {
    case "foodfight-modal":
      const data = payload.view.state.values;
      const fields = {
        opinion: data.opinion_block.opinion.value,
        spiceLevel: data.spice_level_block.spice_level,
        submitter: payload.user.name,
      };

      await slackApi("chat.postMessage", {
        channel: "C060B8P9CJC",
        text: `Oh dang, y'all! :eyes: <@${payload.user.id}> just started a a food fight with a ${fields.spiceLevel} take: ${fields.opinion}... discuss `,
      });

      break;
    default:
      console.log(`No handler defined for ${callback_id}`);
      return {
        statusCode: 400,
        body: `No hnadler defined for ${callback_id}`,
      };
  }
  return {
    statusCode: 200,
    body: "",
  }
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

  if (body.payload) {
    const payload = JSON.parse(body.payload)
    return handleInteractivity(payload)
  }

  return {
    statusCode: 200,
    body: "TODO: handle Slack commands and interactivity",
  };
};
