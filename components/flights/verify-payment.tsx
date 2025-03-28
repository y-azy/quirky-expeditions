import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, Loader2 } from "lucide-react";

interface VerifyPaymentProps {
  result?: {
    hasCompletedPayment: boolean;
    error?: string;
    message?: string;
    status?: string;
  };
}

export function VerifyPayment({ result }: VerifyPaymentProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  
  if (!result) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Payment Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse flex items-center justify-center bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Checking payment status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result.error || result.status === "error") {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Payment Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md">
            <p>{result.message || "Error verifying payment"}</p>
            {result.error && <p className="text-sm mt-1">{result.error}</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleShowBoardingPass = () => {
    setIsButtonClicked(true);
    
    const message = "Please show me my boarding pass";
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = message;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.focus();
    }
  };
  
  const handleRetryPayment = () => {
    setIsButtonClicked(true);
    
    const message = "I want to try the payment again";
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = message;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.focus();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Payment Verification</CardTitle>
      </CardHeader>
      <CardContent>
        {isVerifying ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Verifying payment status...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            {result.hasCompletedPayment ? (
              <>
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">Payment Successful</h3>
                  <p className="text-muted-foreground">
                    Your payment has been processed successfully
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/20">
                  <X className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">Payment Not Completed</h3>
                  <p className="text-muted-foreground">
                    Your payment has not been processed yet
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center gap-4 border-t pt-4">
        {result.hasCompletedPayment ? (
          <Button
            onClick={handleShowBoardingPass}
            disabled={isButtonClicked}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            View Boarding Pass
          </Button>
        ) : (
          <Button
            onClick={handleRetryPayment}
            disabled={isButtonClicked}
            variant="outline"
            className="gap-2"
          >
            Try Again
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
