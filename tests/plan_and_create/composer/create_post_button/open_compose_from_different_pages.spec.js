const { test} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { HomePage } = require('../../../../pages/homepage');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const createUser = require('../../../../custom-commands/createUser');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Composer basic validations', async ({ page }) => {
	const createNewUser = new createUser();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const homePage = new HomePage(page);
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('create_post', 'professional');
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('create_post');
	});

	await test.step('Open composer from global navigator and verify its elements', async () => {
		await composePage.selectComposeButton();
		await composePage.verifyDefaultComposer();
	});

	await test.step('Exit composer', async () => {
		await composePage.exitComposer();
	});

	await test.step('Open composer from home page and verify its elements', async () => {
		await homePage.selectCreatePostButton();
		await composePage.verifyDefaultComposer();
	});

	await test.step('Again exit composer from home page', async () => {
		await composePage.exitComposer();
	});

	await test.step('Open composer from planner and verify its elements', async () => {
		await plannerPage.visit();
		await plannerPage.selectCreatePostButton();
		await composePage.verifyDefaultComposer();
	});

	await test.step('Again exit composer from planner week view', async () => {
		await composePage.exitComposer();
	});

	await test.step('Open composer from planner list view and verify its elements', async () => {
		await plannerPage.selectListView();
		await plannerPage.selectCreateButton();
		await composePage.verifyDefaultComposer();
	});

	await test.step('Again exit composer from planner week view', async () => {
		await composePage.exitComposer();
	});

	await test.step('Open composer from planner draft view and verify its elements', async () => {
		await plannerPage.selectListView();
		await plannerPage.selectCreateButton();
		await composePage.verifyDefaultComposer();
	});

});
