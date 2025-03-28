"use client";

import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode } from "react";

import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";
import { AuthorizePayment } from "../flights/authorize-payment";
import { DisplayBoardingPass } from "../flights/boarding-pass";
import { CreateReservation } from "../flights/create-reservation";
import { FlightStatus } from "../flights/flight-status";
import { ListFlights } from "../flights/list-flights";
import { SelectSeats } from "../flights/select-seats";
import { VerifyPayment } from "../flights/verify-payment";
import { ErrorMessage } from "./error-message";

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
}) => {
  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {content && typeof content === "string" && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{content}</Markdown>
          </div>
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === "result") {
                const { result } = toolInvocation;
                
                // Check for error states
                if (result && (result.error || result.status === "error")) {
                  return (
                    <ErrorMessage 
                      key={toolCallId}
                      message={result.message || "There was a problem processing your request."}
                      error={result.error}
                      type="error"
                    />
                  );
                }

                // Check for no results state
                if (result && result.status === "no_results") {
                  return (
                    <ErrorMessage 
                      key={toolCallId}
                      message={result.message || "No results found for your request."}
                      type="info"
                    />
                  );
                }

                return (
                  <div key={toolCallId}>
                    {toolName === "getWeather" ? (
                      <Weather weatherAtLocation={result} />
                    ) : toolName === "displayFlightStatus" ? (
                      <FlightStatus flightStatus={result} />
                    ) : toolName === "searchFlights" ? (
                      result.flights && result.flights.length > 0 ? (
                        <ListFlights chatId={chatId} results={result} />
                      ) : (
                        <ErrorMessage 
                          message={result.message || "No flights found matching your criteria."}
                          type="info"
                        />
                      )
                    ) : toolName === "selectSeats" ? (
                      result.seats && result.seats.length > 0 ? (
                        <SelectSeats chatId={chatId} availability={result} />
                      ) : (
                        <ErrorMessage 
                          message={result.message || "No seat information available for this flight."}
                          type="info"
                        />
                      )
                    ) : toolName === "createReservation" ? (
                      Object.keys(result).includes("error") ? (
                        <ErrorMessage 
                          message={result.message || "Failed to create reservation."}
                          error={result.error}
                          type="error"
                        />
                      ) : (
                        <CreateReservation reservation={result} />
                      )
                    ) : toolName === "authorizePayment" ? (
                      <AuthorizePayment intent={result} />
                    ) : toolName === "displayBoardingPass" ? (
                      Object.keys(result).includes("error") ? (
                        <ErrorMessage 
                          message={result.message || "Cannot display boarding pass."}
                          error={result.error}
                          type="error"
                        />
                      ) : (
                        <DisplayBoardingPass boardingPass={result} />
                      )
                    ) : toolName === "verifyPayment" ? (
                      <VerifyPayment result={result} />
                    ) : (
                      // For any other tool types, display the JSON result in a pre tag
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-[300px]">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              } else {
                return (
                  <div key={toolCallId} className="skeleton">
                    {toolName === "getWeather" ? (
                      <Weather />
                    ) : toolName === "displayFlightStatus" ? (
                      <FlightStatus />
                    ) : toolName === "searchFlights" ? (
                      <ListFlights chatId={chatId} />
                    ) : toolName === "selectSeats" ? (
                      <SelectSeats chatId={chatId} />
                    ) : toolName === "createReservation" ? (
                      <CreateReservation />
                    ) : toolName === "authorizePayment" ? (
                      <AuthorizePayment />
                    ) : toolName === "displayBoardingPass" ? (
                      <DisplayBoardingPass />
                    ) : null}
                  </div>
                );
              }
            })}
          </div>
        )}

        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
