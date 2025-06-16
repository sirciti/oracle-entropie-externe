test.describe("Icosahedron Animation", () => {
  test("should fetch icosahedron animation", async ({ page }) => {
    await page.goto("http://localhost:8080/");
    await page.click("#animate-icosahedron");
    const data = await page.textContent("#icosahedron-animation");
    expect(data).toContain("vertices");
  });
});

test.describe("Token Generation", () => {
  test("should generate token", async ({ page }) => {
    await page.goto("http://localhost:8080/");
    await page.fill("#seed-input", "test");
    await page.click("#generate-token");
    const token = await page.textContent("#token-output");
    expect(token).toContain("mock-token-test");
  });
});
