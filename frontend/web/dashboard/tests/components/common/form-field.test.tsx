// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormField, fieldErrorId } from "@/components/common/form-field";

describe("FormField", () => {
  it("links the label to its control", () => {
    render(
      <FormField id="name" label="Name">
        <input id="name" />
      </FormField>,
    );
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("shows the hint next to the label and no error by default", () => {
    render(
      <FormField id="name" label="Name" hint="optional">
        <input id="name" />
      </FormField>,
    );
    expect(screen.getByText("(optional)")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("announces the error under the id the control points at", () => {
    render(
      <FormField id="name" label="Name" error="Required">
        <input id="name" aria-describedby={fieldErrorId("name")} />
      </FormField>,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Required");
    expect(alert).toHaveAttribute("id", "name-error");
    expect(screen.getByLabelText("Name")).toHaveAccessibleDescription("Required");
  });
});
