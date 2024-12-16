//@ts-check
const {test} = require('@playwright/test');
const {LoginPage} = require('../../../../pages/login');
const {PlannerPage} = require('../../../../pages/planandcreate/planner');
const createUser = require('../../../../custom-commands/createUser');
const tearDown = require('../../../../custom-commands/tearDown');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify media panel items can be dropped on to planner week view', async ({page}) => {
	const createNewUser = new createUser();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('dnd_media', 'professional');
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInAsProUser('dnd_media');
	});

	await test.step('Navigate to planner & switch to expanded view', async () => {
		await plannerPage.visit();
		await plannerPage.switchToExpandedView(global.member[0].memberId);
	});

	await test.step('Drag and drop media from media panel', async () => {
		await plannerPage.dragAndDropMedia();
	});
});
