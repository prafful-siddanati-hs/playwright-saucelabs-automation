// @ts-check
const { test } = require('@playwright/test');
const { formatISO, addHours, addDays, subDays } = require('date-fns');
const {LoginPage} = require("../../pages/login");
const {PlannerPage} = require("../../pages/planandcreate/planner");
const fs = require('fs');
const scheduleV3Message = require("../../custom-commands/scheduleV3Message");

 function readJson() {
  let rawData = fs.readFileSync('fixtures/accounts.json', 'utf-8');
  return JSON.parse(rawData);
}
//
// test('Drag and drop card on week view', async ({ page }) => {
//     const user = readJson();
//     const loginPage = new LoginPage(page);
//     const createScheduleMessage = new scheduleV3Message();
//     const plannerPage = new PlannerPage(page);
//
//     const scheduleTime = addHours(new Date(), 1);
//     const composeText = `test drag and drop card on planner week view ${Date.now()}`;
//
//     await loginPage.login(user[0].email, user[0].password);
//
//     /* Create a scheduled message */
//     await createScheduleMessage.command(
//         parseInt(user[0].memberId, 10),
//         {
//             messages: [
//                 {
//                     socialProfileId: user[0].socialProfileId,
//                     text: composeText,
//                     scheduledSendTime: formatISO(scheduleTime)
//                 }
//             ]
//         }
//     );
//
//   await plannerPage.dragAndDropCard(composeText);
//   await page.close();
// });

test('drag and drop media from side pane on week view', async ({ page }) => {
  const user = readJson();

  const loginPage = new LoginPage(page);
  const plannerPage = new PlannerPage(page);

  await loginPage.login(user[1].email, user[1].password);
  await plannerPage.dragAndDropMedia();
  await page.close();
});

// test('Bitly creation', async ({ page }) => {
//   await page.goto('https://staging.hootsuite.com/login');
//   await page.getByRole('textbox', { name: 'Please enter a valid email address' }).fill("prafful.siddanati+testaccount@hootsuite.com")
//   await page.locator('#loginPasswordInput').fill("!1Password");
//   await page.getByRole('button', { name: 'Sign in', exact: true }).click();
//   await page.waitForTimeout(2000);
//
//   await page.locator('[data-test-id="global-nav-account-button"]').click();
//
//   await page.locator('[data-test-id="Manage accounts and teams"]').click();
//   await page.getByRole('button', { name: 'Link Settings' }).nth(1).click();
//   await page.getByRole('button', { name: 'Bit.ly shorteners' }).click();
//   await page.getByRole('button', { name: 'Create new Bit.ly shortener' }).click();
//   await page.getByPlaceholder('Shortener name...').click();
//   await page.getByPlaceholder('Shortener name...').fill(`test bitly ${Date.now()}`);
//   const page1Promise = page.waitForEvent('popup');
//   await page.getByRole('button', { name: 'Add new Bit.ly shortener' }).click();
//   const page1 = await page1Promise;
//   await page1.getByRole('button', { name: 'Close' }).click();
//   await page1.getByRole('link', { name: 'Sign in with your Bitly account' }).click();
//   await page1.locator('#sign-in input[name="username"]').click();
//   await page1.locator('#sign-in input[name="username"]').fill('PraffulS');
//   await page1.locator('#sign-in input[name="password"]').click();
//   await page1.locator('#sign-in input[name="password"]').fill('tKq54RWaw362');
//   await page1.getByRole('button', { name: 'Log in' }).click();
//   await page1.getByRole('button', { name: 'Allow' }).click();
//   await page1.close();
//   await page.close();
// });
