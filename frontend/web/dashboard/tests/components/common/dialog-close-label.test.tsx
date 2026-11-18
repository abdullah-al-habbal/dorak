// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { I18nContext } from "@/components/providers/i18n-context";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Locale } from "@/enums/access/locale.enum";
import { TextDirection } from "@/enums/access/text-direction.enum";
import { DICTIONARIES } from "@/locales/dictionaries.constant";

describe("dialog close button", () => {
  it.each([
    [Locale.En, TextDirection.Ltr],
    [Locale.Ar, TextDirection.Rtl],
  ])("is named in the page language (%s)", (locale, direction) => {
    const dictionary = DICTIONARIES[locale];
    render(
      <I18nContext.Provider value={{ locale, direction, dictionary }}>
        <Dialog open>
          <DialogContent>
            <DialogTitle>t</DialogTitle>
            <DialogDescription>d</DialogDescription>
          </DialogContent>
        </Dialog>
      </I18nContext.Provider>,
    );
    expect(screen.getByRole("button", { name: dictionary.common.close })).toBeInTheDocument();
  });
});
