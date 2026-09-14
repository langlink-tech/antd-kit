import { expect, it } from "vitest";
import { checkConfirmErrors } from "./fixtures/run-confirm-errors.mjs";

it("accounts for exactly the expected upstream rejection and rejects extra errors", () => {
  const result = checkConfirmErrors();
  expect(result.stdout).toContain("sync and async rejection: exact accounting passed");
  expect(result.error).toBeUndefined();
  expect(result.status).toBe(1);
  expect(result.stderr).toContain("unexpected rejection");
}, 35000);
