/* Test to verify that IG first comment hashtags are recommended only based on main caption box */
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const {ComposePage} = require('../../../../pages/planandcreate/compose');
const {getObjectByName} = require('../../../../globals');
const {LoginPage} = require('../../../../pages/login');
const getFixture = require('../../../../custom-commands/getFixture');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');

const HASHTAGS_HEADER = 'AI hashtag suggestions';
const NO_RECCOMENDED_HASHTAGS= 'To get hashtag suggestions, add some text or images to your post.';
let igbAccount, memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();
	await cleanUp.command();
	await page.close();
});

test('Verify hashtags generation for IG first comment', async ({ page }) => {
	const scheduleText = 'Text in main message to generate hashtags ' + Math.floor(Math.random() * 1000);
	const firstCommentText = 'Only first comment text ';

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('igfc_hashtags_generation', 'pro_user_composer', true, 300);
		igbAccount = getObjectByName(global.fixture, 'igfc_hashtags_generation').instagramBusiness.username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('igfc_hashtags_generation');
	});

	await test.step('Delete residual scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select IGB account from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(igbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Add first comment', async () => {
		await expect(composePage.firstCommentHeader).toBeVisible();
		await composePage.firstCommentTextArea.click();
		await composePage.firstCommentTextArea.type(firstCommentText);
	});

	await test.step('Verify hashtags are not generated for first comment box', async () => {
		await expect(composePage.firstCommentHashtagSuggestion).toBeVisible();
		await composePage.firstCommentHashtagSuggestion.click();
		await expect(page.getByRole('heading', { name: HASHTAGS_HEADER })).toBeVisible();
		await expect(page.getByText(NO_RECCOMENDED_HASHTAGS)).toBeVisible();
		await expect(composePage.hashtagPanelCloseButton).toBeVisible();
		await composePage.hashtagPanelCloseButton.click();
	});

	await test.step('Add text to main message box', async () => {
		await composePage.writeMessage(scheduleText);
		await composePage.verifyInstagramPreview(scheduleText);
	});

	await test.step('Verify hashtags are now generated for first comment', async () => {
		await expect(composePage.firstCommentHashtagSuggestion).toBeVisible();
		await composePage.firstCommentHashtagSuggestion.click();
		await expect(page.getByRole('heading', { name: HASHTAGS_HEADER })).toBeVisible();
		await expect(composePage.hashtagsArea).toBeVisible();
		await expect(composePage.addHashtagButton).toBeDisabled();
		await composePage.firstHashtagSuggestion.click();
		await expect(composePage.addHashtagButton).toBeEnabled();
		await composePage.addHashtagButton.click();
		await composePage.hashtagPanelCloseButton.click();
	});

	await test.step('Verify first comment has hashtag in preview', async () => {
		await expect(composePage.instagramFirstCommentHashtagLink).toHaveCount(1); //Verify there is hashtag in first comment preview
	});
});
