"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { useDictionary } from "@/hooks/use-dictionary";
import { useMonetizationMutation } from "@/hooks/use-monetization-mutation";
import { saveGateway } from "@/services/api/dashboard/monetization/monetization.query";
import { gatewayFormSchema } from "@/services/api/dashboard/monetization/schemas/monetization.schema";
import type {
  IGateway,
  IGatewayForm,
} from "@/services/api/dashboard/monetization/types/imonetization.types";
import { useForm } from "react-hook-form";

interface IGatewayFormProps {
  gateway?: IGateway;
  onDone: () => void;
}

function defaultsFor(gateway?: IGateway): IGatewayForm {
  return {
    code: gateway?.code ?? "",
    nameEn: gateway?.name.en ?? "",
    nameAr: gateway?.name.ar ?? "",
    driver: gateway?.driver ?? "",
    isActive: gateway?.isActive ?? true,
    isDefault: gateway?.isDefault ?? false,
    config: "",
  };
}

export function GatewayForm({ gateway, onDone }: IGatewayFormProps) {
  const copy = useDictionary().monetization;
  const form = useForm<IGatewayForm>({
    resolver: zodResolver(gatewayFormSchema),
    defaultValues: defaultsFor(gateway),
  });
  const { errors } = form.formState;
  const save = useMonetizationMutation(
    (value: IGatewayForm) => saveGateway(value, gateway?.id),
    {
      successMessage: copy.saved,
      onSuccess: () => {
        form.reset(defaultsFor());
        onDone();
      },
    },
  );
  const field = (
    name: "code" | "nameEn" | "nameAr" | "driver",
    label: string,
  ) => (
    <label className="grid gap-1 text-sm text-text-100">
      <span>{label}</span>
      <Input
        state={errors[name] ? "error" : "default"}
        {...form.register(name)}
      />
    </label>
  );

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={form.handleSubmit((value) => save.mutate(value))}
    >
      {field("code", copy.gateways.code)}
      {field("driver", copy.gateways.driver)}
      {field("nameEn", copy.nameEn)}
      {field("nameAr", copy.nameAr)}
      <label className="grid gap-1 text-sm text-text-100 sm:col-span-2">
        <span>{copy.gateways.config}</span>
        <TextArea {...form.register("config")} />
        <span className="text-text-secondary">
          {copy.gateways.configHint}
          {gateway && gateway.configKeys.length > 0
            ? ` ${copy.gateways.configKeys}: ${gateway.configKeys.join(", ")}`
            : ""}
        </span>
      </label>
      <label className="flex items-center gap-2 text-sm text-text-100">
        <input type="checkbox" {...form.register("isActive")} />
        {copy.active}
      </label>
      <label className="flex items-center gap-2 text-sm text-text-100">
        <input type="checkbox" {...form.register("isDefault")} />
        {copy.gateways.isDefault}
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" isDisabled={save.isPending}>
          {copy.save}
        </Button>
        {gateway ? (
          <Button type="button" appearance="outline" onPress={onDone}>
            {copy.cancelEdit}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
