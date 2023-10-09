import { Handler } from "@netlify/functions";
import { getNewItems } from "./util/notion";
import { slackApi } from "./util/slack";

const postNotionItemsSlack: Handler = async () => {
  const items = await getNewItems();

  await slackApi("chat.postMessage", {
    channel: "C060B8P9CJC"
  })
};
