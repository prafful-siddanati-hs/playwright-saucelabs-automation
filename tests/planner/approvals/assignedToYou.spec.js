const { test, expect} = require('@playwright/test');

test.afterEach(async ({ page }) => {
    
    await page.close();
});

test('Test to check folder navigation', async ({}) => {
    console.log("Inside approvals folder");
});