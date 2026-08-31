import { describe, expect, it } from "vitest";
import { scanText, scanValue } from "./privacy.mjs";
describe("privacy scanner", () => {
  it.each([
    "192.168.1.5",
    "::1",
    "localhost",
    "server.local",
    "user@host:/repo",
    "/Users/name/file",
    "C:\\Users\\name\\file",
    "/v1/models",
  ])("rejects unsafe text: %s", (value) => {
    expect(scanText(value).length).toBeGreaterThan(0);
  });
  it.each([
    "password",
    "apiKey",
    "access_token",
    "privateKey",
    "containerName",
  ])("rejects unsafe key: %s", (key) => {
    expect(scanValue({ [key]: "value" }).length).toBeGreaterThan(0);
  });
  it("rejects unsafe external URLs", () => {
    expect(scanValue({ sourceUrl: "http://example.com" }).join(" ")).toMatch(
      /unsafe external URL/,
    );
    expect(scanValue({ sourceUrl: "https://192.0.2.1/a" }).join(" ")).toMatch(
      /unsafe external URL/,
    );
  });
  it("accepts public HTTPS and ordinary benchmark values", () => {
    expect(
      scanValue({
        sourceUrl: "https://example.com/a",
        quant: "IQ3_XXS",
        score: 42,
      }),
    ).toEqual([]);
  });
});
