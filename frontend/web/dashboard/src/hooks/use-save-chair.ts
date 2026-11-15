"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useSaveMutation } from "@/hooks/use-save-mutation";
import type { ChairPayload } from "@/interfaces/chairs/chair-payload.interface";
import type { SaveVariables } from "@/interfaces/core/save-variables.interface";
import { bookingKeys } from "@/lib/query-keys/bookings/booking-keys";
import { chairKeys } from "@/lib/query-keys/chairs/chair-keys";
import { createChair, updateChair } from "@/services/api/mutation/save-chair.mutation";
import type { Chair } from "@/types/chairs/chair.type";

export function useSaveChair(): UseMutationResult<Chair, Error, SaveVariables<ChairPayload>> {
  const { chairs } = useDictionary();
  return useSaveMutation({ create: createChair, update: updateChair, invalidate: [chairKeys.all, bookingKeys.chairs], messages: chairs.toast });
}
