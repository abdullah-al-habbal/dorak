"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { apiErrorMessage } from "@/services/api/api-error-message.util";
import { ApiClientError } from "@/services/api/client-error";
import { bookingClientReviewSchema } from "@/services/api/dashboard/booking-client-review.schema";
import type { BookingClientReviewInput } from "@/services/api/dashboard/booking-client-review.types";
import { rateBookingClient } from "@/services/api/dashboard/dashboard-workflow.mutation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface IBookingRateClientFormProps {
  bookingId: string;
  onRated: () => void;
}

const RATINGS = ["5", "4", "3", "2", "1"] as const;

export function BookingRateClientForm({
  bookingId,
  onRated,
}: IBookingRateClientFormProps) {
  const dictionary = useDictionary();
  const copy = dictionary.bookingActions;
  const [rating, setRating] = useState("5");
  const form = useForm<BookingClientReviewInput>({
    resolver: zodResolver(bookingClientReviewSchema),
    defaultValues: { rating: 5, comment: "" },
  });
  const rate = useDashboardMutation(
    "bookings",
    (value: BookingClientReviewInput) =>
      rateBookingClient(bookingId, bookingClientReviewSchema.parse(value)),
  );

  const failed = (error: unknown) => {
    if (error instanceof ApiClientError && error.status === 409) {
      toast.error(copy.clientAlreadyRated);
      return;
    }
    if (error instanceof ApiClientError && error.status === 422) {
      toast.error(copy.clientRatingUnavailable);
      return;
    }
    toast.error(apiErrorMessage(error, dictionary));
  };

  return (
    <form
      className="mt-4 grid gap-2"
      onSubmit={form.handleSubmit((value) =>
        rate.mutate(value, {
          onSuccess: () => {
            toast.success(copy.clientRated);
            onRated();
          },
          onError: failed,
        }),
      )}
    >
      <Select
        aria-label={copy.clientRating}
        value={rating}
        onChange={(value) => {
          setRating(String(value));
          form.setValue("rating", Number(value));
        }}
      >
        <SelectTrigger>
          <SelectValue />
          <SelectIndicator />
        </SelectTrigger>
        <SelectContent>
          {RATINGS.map((rating) => (
            <SelectItem key={rating} id={rating}>
              {"★".repeat(Number(rating))}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        aria-label={copy.clientComment}
        placeholder={copy.clientComment}
        {...form.register("comment")}
      />
      <Button type="submit" appearance="outline" isDisabled={rate.isPending}>
        {copy.rateClient}
      </Button>
    </form>
  );
}
