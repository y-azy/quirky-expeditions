import { InfoIcon, AlertCircleIcon } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  error?: string;
  type?: "error" | "warning" | "info";
}

export function ErrorMessage({ message, error, type = "error" }: ErrorMessageProps) {
  const getBgColor = () => {
    switch (type) {
      case "error":
        return "bg-red-100 dark:bg-red-900/20";
      case "warning":
        return "bg-amber-100 dark:bg-amber-900/20";
      case "info":
        return "bg-blue-100 dark:bg-blue-900/20";
      default:
        return "bg-red-100 dark:bg-red-900/20";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "error":
        return "text-red-800 dark:text-red-200";
      case "warning":
        return "text-amber-800 dark:text-amber-200";
      case "info":
        return "text-blue-800 dark:text-blue-200";
      default:
        return "text-red-800 dark:text-red-200";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "error":
      case "warning":
        return <AlertCircleIcon className="size-5" />;
      case "info":
        return <InfoIcon className="size-5" />;
      default:
        return <AlertCircleIcon className="size-5" />;
    }
  };

  return (
    <div className={`${getBgColor()} ${getTextColor()} p-4 rounded-md flex gap-3`}>
      <div className="shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-medium">{message}</p>
        {error && type === "error" && (
          <p className="text-sm opacity-80">
            Error details: {error}
          </p>
        )}
      </div>
    </div>
  );
}
