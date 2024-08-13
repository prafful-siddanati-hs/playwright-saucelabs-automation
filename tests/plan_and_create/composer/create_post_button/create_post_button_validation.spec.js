const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const { DraftsPage } = require('../../../../pages/planandcreate/drafts');
const getFixture = require('../../../../custom-commands/getFixture');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Create post button validations', async ({ page }) => {
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);
	const draftsPage = new DraftsPage(page);
	const addFixture = new getFixture();

	await test.step('Setup and login as amplify user', async () => {
		await addFixture.command('amplify_user', 'composer_amplify_user', true, 300);
		await loginPage.signIn('amplify_user');
	});

	await test.step('Verify that there is no create post button on amplify home page', async () => {
		await expect(page.locator('//h1[text() = "Amplify"]')).toBeVisible();
		await expect(composePage.composeButton).not.toBeVisible();
	});

	await test.step('Verify that there is no create post button on planner week view', async () => {
		await plannerPage.visit();
		await expect(plannerPage.createPostButton).not.toBeVisible();
	});

	await test.step('Verify that there is no create post button on planner list view', async () => {
		await plannerPage.selectListView();
		await expect(plannerPage.createPostButton).not.toBeVisible();
	});

	await test.step('Verify that there is no create post button on planner drafts page', async () => {
		await draftsPage.visit();
		await expect(draftsPage.createButton).not.toBeVisible();
	});

});
