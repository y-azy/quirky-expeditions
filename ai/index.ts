import { openai } from "@ai-sdk/openai";
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";
import { customMiddleware } from "./custom-middleware";

export const model = wrapLanguageModel({
  //model: openai("gpt-4"), // Uncomment to use GPT-4 and comment out the GPT-3.5 line
  model: openai("gpt-3.5-turbo"),
  middleware: customMiddleware,
});

export const fastModel = wrapLanguageModel({
  model: openai("gpt-3.5-turbo"),
  middleware: customMiddleware,
});
