import { expect, test } from "@playwright/test";

test.describe("Better-Auth integration", () => {
  test("uses canonical Better-Auth endpoint for email sign-in", async ({ page }) => {
    const capturedUrls: string[] = [];

    await page.route("**/api/auth/**", async (route) => {
      capturedUrls.push(route.request().url());
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "stubbed for endpoint contract test" }),
      });
    });

    await page.goto("/login");
    await page.getByLabel("อีเมล (Email)").fill("contract-test@example.com");
    await page.getByLabel("รหัสผ่าน (Password)").fill("invalid-password");
    await page.getByRole("button", { name: /^เข้าสู่ระบบ$/ }).click();

    await expect.poll(() => capturedUrls.length).toBeGreaterThan(0);

    const hasCanonicalSignin = capturedUrls.some((url) =>
      url.includes("/api/auth/sign-in/email"),
    );
    const hasLegacyCustomSignin = capturedUrls.some((url) =>
      url.includes("/api/auth/signin"),
    );

    expect(hasCanonicalSignin).toBe(true);
    expect(hasLegacyCustomSignin).toBe(false);
  });

  test("login -> session -> logout lifecycle works", async ({ page }) => {
    const email = process.env.E2E_AUTH_EMAIL;
    const password = process.env.E2E_AUTH_PASSWORD;

    test.skip(!email || !password, "Set E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD for auth lifecycle integration test.");

    await page.goto("/login");
    await page.getByLabel("อีเมล (Email)").fill(email!);
    await page.getByLabel("รหัสผ่าน (Password)").fill(password!);

    const loginResponsePromise = page.waitForResponse((response) => {
      return (
        response.request().method() === "POST" &&
        response.url().includes("/api/auth/sign-in/email")
      );
    });

    await page.getByRole("button", { name: /^เข้าสู่ระบบ$/ }).click();
    const loginResponse = await loginResponsePromise;
    expect(loginResponse.status()).toBeLessThan(500);

    await page.goto("/api/auth/get-session");
    await expect(page.locator("body")).toContainText("user");

    const logoutResponse = await page.request.post("/api/auth/sign-out", {
      data: {},
    });
    expect(logoutResponse.status()).toBeLessThan(500);

    const sessionAfterLogoutResponse = await page.request.get("/api/auth/get-session");
    expect(sessionAfterLogoutResponse.status()).toBeLessThan(500);

    const sessionAfterLogoutText = await sessionAfterLogoutResponse.text();
    expect(sessionAfterLogoutText.toLowerCase()).not.toContain('"user"');
  });
});
