import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PaymentFormProps {
  reservationId: string;
  amount: number;
  onSuccess: () => void;
}

export function PaymentForm({ reservationId, amount, onSuccess }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/reservation?id=${reservationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ magicWord: 'vercel' }),
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      toast.success('Payment successful!');
      onSuccess();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Amount to Pay</Label>
        <Input
          type="text"
          value={`$${amount.toFixed(2)}`}
          disabled
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Processing...' : 'Complete Payment'}
      </Button>
    </form>
  );
}
