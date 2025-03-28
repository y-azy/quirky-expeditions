"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2 } from "lucide-react";

interface AuthorizePaymentProps {
  intent?: {
    reservationId: string;
    hasCompletedPayment: boolean;
    error?: string;
    message?: string;
  };
}

export function AuthorizePayment({ intent }: AuthorizePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [magicWord, setMagicWord] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  if (!intent) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Payment Authorization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 animate-pulse flex items-center justify-center bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Preparing payment form...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (intent.error) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Payment Authorization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md">
            <p>{intent.message || "Error authorizing payment"}</p>
            <p className="text-sm mt-1">{intent.error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Don't show the form if payment is already completed
  if (intent.hasCompletedPayment) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Payment Authorized</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-4 rounded-md">
            <p>Your payment has already been completed.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage("");
    
    try {
      const response = await fetch(`/api/reservation?id=${intent.reservationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ magicWord }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Payment failed to process');
      }
      
      // Let AI handle verification with another message
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.value = `Has my payment for reservation ${intent.reservationId} been completed?`;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.focus();
      }
      
    } catch (error) {
      console.error('Payment processing error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed to process');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Payment Authorization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-3 rounded-md text-sm">
          <p>For this demo, please enter "vercel" as the magic word to authorize payment.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="magicWord">Magic Word</Label>
            <Input
              id="magicWord"
              type="text"
              value={magicWord}
              onChange={(e) => setMagicWord(e.target.value)}
              placeholder="Enter magic word"
              required
              className="w-full"
            />
          </div>
          
          {errorMessage && (
            <div className="text-red-500 text-sm">
              {errorMessage}
            </div>
          )}
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full gap-2" 
              disabled={isProcessing || !magicWord}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Authorize Payment
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
