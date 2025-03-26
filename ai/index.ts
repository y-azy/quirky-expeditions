import { openai } from "@ai-sdk/openai";
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";
import { customMiddleware } from "./custom-middleware";

export const model = wrapLanguageModel({
  model: openai("gpt-4"),
  middleware: customMiddleware,
});

export const fastModel = wrapLanguageModel({
  model: openai("gpt-3.5-turbo"),
  middleware: customMiddleware,
});
