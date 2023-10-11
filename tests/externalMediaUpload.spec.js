const { test } = require('@playwright/test');

test('Media upload', async ({ page }) => {
    await page.goto('https://staging.hootsuite.com/login');
    await page.getByRole('textbox', { name: 'Please enter a valid email address' }).fill("pro_user_composer3_stg@hootsuite.com")
    await page.locator('#loginPasswordInput').fill("0Kh5xdBIGYzV");
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForTimeout(2000);
    await page.getByLabel('Composer', { exact: true }).click();
    await page.getByLabel('Composer', { exact: true }).click();
    await page.getByLabel('Post').click();
    await page.getByPlaceholder('Select a social account').click();
    await page.getByTestId('MessageEditArea').getByText('Composer3H').first().click();
    await page.setInputFiles('.vk-MediaUpload input[type="file"]', 'tests/owly-snowboard.jpg');
    await page.waitForTimeout(3000);
    await page.close();
  });
  