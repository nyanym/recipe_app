import { test, expect } from '@playwright/test';

test('User can sign up, login, and log out', async ({ page }) => {
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

    await page.reload();
    await expect(page.getByRole('button', { name: 'Log Out' })).toBeVisible();
    
    await page.getByRole('button', { name: 'Log Out' }).click();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log Out' })).not.toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log Out' })).not.toBeVisible();

    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill(username);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('button', { name: 'Log Out' })).toBeVisible();

    await page.getByRole('button', { name: 'Log Out' }).click();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log Out' })).not.toBeVisible();
});