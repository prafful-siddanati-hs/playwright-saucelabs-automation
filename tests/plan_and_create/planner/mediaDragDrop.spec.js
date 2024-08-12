//@ts-check
const { test} = require('@playwright/test');
const {LoginPage} = require('../../../pages/login');
const {PlannerPage} = require('../../../pages/planandcreate/planner');
const createUser = require('../../../custom-commands/createUser');
const tearDown = require('../../../custom-commands/tearDown');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Drag and drop media from media panel', async ({page}) => {
	const createNewUser = new createUser();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);

	await createNewUser.command('dnd_media', 'professional');

	await loginPage.signInAsProUser('dnd_media');

	await plannerPage.plannerButton.click();
	await page.waitForLoadState();
	await plannerPage.switchToExpandedView(global.member[0].memberId);

	await plannerPage.dragAndDropMedia();
	await page.close();
});
