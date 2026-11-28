import { test, expect } from '@playwright/test';

test('User can create, view, and delete recipes', async ({ page }) => {
    const username = `auth_test_${Date.now()}`;
    const password = 'Test1234!';

    await page.goto('http://localhost:5173/login');
    await page.getByRole('link', { name: 'Sign up' }).click();
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill(username);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.getByRole('button', { name: 'Log Out' })).toBeVisible();

    await page.getByRole('button', { name: 'Create Post' }).click();
    await page.getByRole('textbox', { name: 'Tittttllleeee' }).click();
    await page.getByRole('textbox', { name: 'Tittttllleeee' }).fill('Test Recipe');
    await page.getByRole('textbox', { name: 'What is this recipe about?' }).click();
    await page.getByRole('textbox', { name: 'What is this recipe about?' }).fill('Part of testing procedure');
    await page.getByRole('spinbutton').first().click();
    await page.getByRole('spinbutton').first().fill('2');
    await page.getByRole('spinbutton').nth(1).click();
    await page.getByRole('spinbutton').nth(1).fill('11');
    await page.getByRole('spinbutton').nth(1).click();
    await page.getByRole('spinbutton').nth(1).fill('12');
    await page.getByRole('spinbutton').nth(1).click();
    await page.getByRole('textbox', { name: 'Quantity (2 cups)' }).click();
    await page.getByRole('textbox', { name: 'Quantity (2 cups)' }).fill('1');
    await page.getByRole('textbox', { name: 'Ingredient (flour)' }).click();
    await page.getByRole('textbox', { name: 'Ingredient (flour)' }).fill('a');
    await page.getByRole('button', { name: '+ Add ingredient' }).click();
    await page.locator('#ing-qty-2').fill('2');
    await page.getByRole('textbox', { name: 'Ingredient (flour)' }).nth(1).click();
    await page.getByRole('textbox', { name: 'Ingredient (flour)' }).nth(1).fill('b');
    await page.getByRole('textbox', { name: 'Describe this step' }).click();
    await page.getByRole('textbox', { name: 'Describe this step' }).fill('hi');
    await page.getByRole('button', { name: '+ Add step' }).click();
    await page.locator('#step-3').fill('bye');
    await page.getByRole('button', { name: 'Publish Recipe' }).click();

    await expect(page.getByText(`Test Recipe by ${username}`)).toBeVisible();
    await page.reload();
    await expect(page.getByText(`Test Recipe by ${username}`)).toBeVisible();

    await page.locator('.recipe-card-cover').first().click();
    await expect(page.getByRole('heading', { name: 'Test Recipe' })).toBeVisible();
    await page.getByRole('button', { name: 'Back' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(`Test Recipe by ${username}`)).toHaveCount(0);

    await page.reload();
    await expect(page.getByText(`Test Recipe by ${username}`)).toHaveCount(0);
    await page.getByRole('button', { name: 'Log Out' }).click();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});