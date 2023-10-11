// @ts-check
const { test, expect } = require('@playwright/test');
const moment = require('moment');


// test('has title', async ({ page }) => {
//   await page.goto('https://playwright.dev/');
//
//   // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/Playwright/);
// });
//
// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');
//
//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();
//
//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
//
test('drag and drop card on week view', async ({ page }) => {
  const nextDayDate = moment(Date.now())
      .add(1, 'days')
      .format('dddd, D MMMM');

  const nextDayTime = moment(Date.now())
      .add(2, 'days')
      .format('hA');

  const composeText = `test drag and drop ${Date.now()}`;
  await page.goto('https://staging.hootsuite.com/login');

  await expect(page).toHaveTitle(/Hootsuite - Login/);

  await page.locator('#loginEmailInput').fill("plan.create.automation+stgpro1@hootsuite.com")
  await page.locator('#loginPasswordInput').fill("0i292mJLOfyN");

  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForTimeout(2000);

  await page.getByLabel('Composer', { exact: true }).click();
  await page.getByLabel('Composer', { exact: true }).click();
  await page.getByLabel('Post').click();
  await page.getByPlaceholder('Select a social account').click();
  await page.getByTestId('MessageEditArea').getByText('HComposer1').first().click();
  await page.getByText('Twitterhs_composer1@HComposer1• Just nowSocial networks regularly make updates t').click();

  await page.getByLabel('Text').click();
  await page.getByLabel('Text').fill(composeText);
  await page.getByRole('button', { name: 'Schedule for later' }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  await page.getByRole('button', { name: 'Schedule', exact: true }).click();
  await page.getByRole('button', { name: 'Schedule', exact: true }).click();
  await page.getByTestId('CloseButton').click();

  const source = await page.getByText(composeText);
  const destination = await page.getByRole('gridcell', { name: `0 posts, ${nextDayDate} at ${nextDayTime}` });
  await page.waitForTimeout(2000);
  await source.hover();
  await page.mouse.down();

  await destination.hover();
  await destination.hover();
  await page.mouse.up();

  await page.waitForTimeout(1000);
  await page.getByText(composeText).click();
  await page.getByTestId('DeleteButton').click();
  await page.getByRole('button', { name: 'Delete post' }).click();
  await page.waitForTimeout(3000);

  await page.close();
});

test('drag and drop media from side pane on week view', async ({ page }) => {
  const nextDayDate = moment(Date.now())
      .add(1, 'days')
      .format('dddd, D MMMM');

  await page.goto('https://staging.hootsuite.com/login');
  await page.getByRole('textbox', { name: 'Please enter a valid email address' }).fill("pro_user_composer2@hootsuite.com")
  await page.locator('#loginPasswordInput').fill("nJUW6u6M3q6M");
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForTimeout(2000);

  await page.getByLabel('Planner', { exact: true }).click();
  await page.getByTestId('ContentButton').click();

  const source = page.getByLabel('Tall majestic palm trees on green hills');

  const destination = await page.getByRole('gridcell', { name: `0 posts, ${nextDayDate} at 12AM` });
  await page.waitForTimeout(1000);

  await source.dragTo(destination);

  await page.waitForTimeout(2000);

  await page.getByText('No account').click();

  await page.getByTestId('DeleteButton').click();
  await page.getByRole('button', { name: 'Delete post' }).click();
  await page.waitForTimeout(2000);
  await page.close();
});

test('Bitly creation', async ({ page }) => {
  await page.goto('https://staging.hootsuite.com/login');
  await page.getByRole('textbox', { name: 'Please enter a valid email address' }).fill("prafful.siddanati+testaccount@hootsuite.com")
  await page.locator('#loginPasswordInput').fill("!1Password");
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForTimeout(2000);

  await page.locator('[data-test-id="global-nav-account-button"]').click();

  await page.locator('[data-test-id="Manage accounts and teams"]').click();
  await page.getByRole('button', { name: 'Link Settings' }).nth(1).click();
  await page.getByRole('button', { name: 'Bit.ly shorteners' }).click();
  await page.getByRole('button', { name: 'Create new Bit.ly shortener' }).click();
  await page.getByPlaceholder('Shortener name...').click();
  await page.getByPlaceholder('Shortener name...').fill(`test bitly ${Date.now()}`);
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Add new Bit.ly shortener' }).click();
  const page1 = await page1Promise;
  await page1.getByRole('button', { name: 'Close' }).click();
  await page1.getByRole('link', { name: 'Sign in with your Bitly account' }).click();
  await page1.locator('#sign-in input[name="username"]').click();
  await page1.locator('#sign-in input[name="username"]').fill('PraffulS');
  await page1.locator('#sign-in input[name="password"]').click();
  await page1.locator('#sign-in input[name="password"]').fill('tKq54RWaw362');
  await page1.getByRole('button', { name: 'Log in' }).click();
  await page1.getByRole('button', { name: 'Allow' }).click();
  await page1.close();
  await page.close();
});

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
