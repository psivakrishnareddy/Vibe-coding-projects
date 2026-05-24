import { expect, test } from "@playwright/test";

test("smoke: board renders with five columns", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Kanban Board")).toBeVisible();
  await expect(page.locator("[data-testid^='column-']")).toHaveCount(5);
});

test("rename column", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Backlog" }).click();
  const input = page.getByLabel("Edit column title");
  await input.fill("Ideas");
  await input.press("Enter");
  await expect(page.getByRole("button", { name: "Ideas" })).toBeVisible();
});

test("add and delete card", async ({ page }) => {
  await page.goto("/");
  const firstColumn = page.locator("[data-testid='column-col-1']");
  await firstColumn.getByTestId("add-card-title").fill("New card");
  await firstColumn.getByTestId("add-card-details").fill("Card details");
  await firstColumn.getByRole("button", { name: "Add card" }).click();
  await expect(firstColumn.getByText("New card")).toBeVisible();

  await firstColumn.getByRole("button", { name: "Delete" }).last().click();
  await expect(firstColumn.getByText("New card")).toHaveCount(0);
});

test("drag card to another column", async ({ page }) => {
  await page.goto("/");
  const card = page.locator("[data-testid='card-card-1']");
  const targetColumn = page.locator("[data-testid='column-col-2']");
  const cardBox = await card.boundingBox();
  const targetBox = await targetColumn.boundingBox();
  if (!cardBox || !targetBox) {
    test.fail();
    return;
  }
  await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + 90, { steps: 12 });
  await page.mouse.up();

  await expect(targetColumn.getByText("Clarify homepage copy")).toBeVisible();
});
