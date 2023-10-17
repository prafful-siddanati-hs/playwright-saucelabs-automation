//@ts-check
import { test } from '@playwright/test';
import fs from 'fs';

interface TestData {
    email: string;
    password: string;
}

function readJson(fileName: string): TestData[] {
    let rawData = fs.readFileSync(fileName, 'utf-8');
    return JSON.parse(rawData);
}

test('External media upload',async ({page}) => {
    let testData: TestData[] = readJson('fixtures/accounts.json');

    await page.goto('https://staging.hootsuite.com/login');
    await page.fill('#loginEmailInput',testData[2].email)
    await page.fill('#loginPasswordInput', testData[2].password);
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
})
