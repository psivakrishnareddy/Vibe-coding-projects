import { test, expect } from '@playwright/test';

test('Kanban Board loads successfully and has default columns', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('To Do')).toBeVisible();
  await expect(page.getByText('Done')).toBeVisible();
});

test('Can add a new card', async ({ page }) => {
  await page.goto('/');
  
  const todoCol = page.locator('.kanban-column', { hasText: 'To Do' });
  await todoCol.getByText('Add a card').click();
  
  const titleInput = todoCol.locator('input[placeholder="Card Title"]');
  await titleInput.fill('My New Test Card');
  
  const textarea = todoCol.locator('textarea[placeholder="Details (optional)"]');
  await textarea.fill('Testing the details field');
  
  // Click Add
  await todoCol.locator('button', { hasText: 'Add' }).click();

  await expect(page.getByText('My New Test Card')).toBeVisible();
  await expect(page.getByText('Testing the details field')).toBeVisible();
});

test('Can rename a column', async ({ page }) => {
  await page.goto('/');
  
  const todoTitle = page.locator('h2.kanban-column-title', { hasText: 'To Do' });
  await todoTitle.click();
  
  const titleInput = page.locator('.kanban-column-title-input');
  await titleInput.fill('To Do (Updated)');
  await titleInput.press('Enter');

  await expect(page.getByText('To Do (Updated)')).toBeVisible();
});

test('Can delete a card', async ({ page }) => {
  await page.goto('/');
  
  const card = page.locator('.kanban-card', { hasText: 'Design UI' });
  await expect(card).toBeVisible();

  // Hover to reveal the delete button
  await card.hover();
  await card.locator('.kanban-card-delete-btn').click();
  
  await expect(page.getByText('Design UI')).not.toBeVisible();
});
