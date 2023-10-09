import { Handler, schedule } from "@netlify/functions";
import { getNewItems } from "./util/notion";
import { blocks, slackApi } from "./util/slack";

const postNotionItemsSlack: Handler = async () => {
  const items = await getNewItems();

  await slackApi("chat.postMessage", {
    channel: "C060B8P9CJC",
    blocks: [
      blocks.section({
        text: [
          "Here are the opinions awaiting judgment:",
          "",
          ...items.map(
            (item) => `- ${item.opinion} (spice level : ${item.spiceLevel})`
          ),
          "",
          `see all items: <https://notion.com/${process.env.NOTION_DATABASE_ID}|in Notion>`,
        ].join("\n"),
      }),
    ],
  });
  return {
    statusCode: 200,
  };
};

export const handler = schedule("* * * * *", postNotionItemsSlack);
