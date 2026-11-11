"use client";

import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

import { useDeleteMutation } from "@/hooks/use-delete-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { useListQuery } from "@/hooks/use-list-query";
import { useSaveMutation } from "@/hooks/use-save-mutation";
import type { SaveVariables } from "@/interfaces/save-variables.interface";
import { paymentGatewayKeys } from "@/lib/payment-gateway-keys";
import { createPaymentGateway, deletePaymentGateway, setPaymentGatewayActive, updatePaymentGateway } from "@/services/api/mutation/payment-gateway.mutation";
import type { PaymentGatewayPayload } from "@/services/api/mutation/payment-gateway.mutation";
import { fetchPaymentGateways } from "@/services/api/query/payment-gateway.query";
import type { PaymentGateway } from "@/types/payment-gateway.type";

export function usePaymentGateways(): UseQueryResult<PaymentGateway[]> {
  return useListQuery(paymentGatewayKeys.list, fetchPaymentGateways);
}

/** The dialog shows failures itself, so a rejected credential value never reaches a toast. */
export function useSavePaymentGateway(): UseMutationResult<PaymentGateway, Error, SaveVariables<PaymentGatewayPayload>> {
  const { settings } = useDictionary();
  return useSaveMutation({ create: createPaymentGateway, update: updatePaymentGateway, invalidate: [paymentGatewayKeys.all], messages: settings.gateways.toast });
}

export function useDeletePaymentGateway(): UseMutationResult<void, Error, string> {
  const { settings } = useDictionary();
  return useDeleteMutation({ remove: deletePaymentGateway, invalidate: [paymentGatewayKeys.all], messages: settings.gateways.toast, surfaceConflict: true });
}

interface ActiveVariables {
  id: string;
  active: boolean;
}

export function useSetPaymentGatewayActive(): UseMutationResult<PaymentGateway, Error, ActiveVariables> {
  const { settings } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ id, active }: ActiveVariables) => setPaymentGatewayActive(id, active),
    invalidate: [paymentGatewayKeys.all],
    successMessage: (_data, { active }) => (active ? settings.gateways.toast.on : settings.gateways.toast.off),
    errorMessage: () => settings.gateways.toast.protected,
  });
}
