import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Component test files import this helper once: it adds the jest-dom matchers and unmounts after each test.
// The file itself opts in to jsdom with `// @vitest-environment jsdom`; every other test keeps the Node environment.
afterEach(cleanup);
