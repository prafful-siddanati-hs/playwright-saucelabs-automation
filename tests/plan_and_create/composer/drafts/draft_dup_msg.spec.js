/* Test to duplicate facebook draft with link and mention */
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { getObjectByName, plan_create } = require('../../../../globals');
const {DraftsPage} = require('../../../../pages/planandcreate/drafts');

let fbAccount, memberId, userName;
const SHORTENER = 'https://ow.ly';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify duplicate facebook draft that contains link and mention', async ({ page }) => {
	const initialMention = plan_create.getFaceBookPageMention();
	const scheduleText = `Dup mention ${plan_create.getRandomUrl()}  ${Math.floor(Math.random() * 100)}`;

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const draftsPage = new DraftsPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('draft_dup', 'plan_create_facebookpage_mentions', true, 300);
		fbAccount = getObjectByName(global.fixture, 'draft_dup').facebookPage.username;
		memberId = global.member[0].memberId;
		userName = getObjectByName(global.fixture, 'draft_dup').username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('draft_dup');
	});

	await test.step('Delete residual draft messages via API', async () => {
		await draftsPage.deleteDraftsViaApi(memberId);
	});

	await test.step('Navigate to drafts page', async () => {
		await draftsPage.visit();
		await expect(draftsPage.draftItem).toHaveCount(0);
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select facebook account from profile picker', async () => {
		await composePage.profileDropDown.hover();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(fbAccount);
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
	});

	await test.step('Write a message with link and mention', async () => {
		await composePage.writeMessage(`${scheduleText} `);
		await composePage.messageArea.pressSequentially(`@${initialMention}`);
		await composePage.verifyFacebookPreview(`${scheduleText} @${initialMention}`);
	});

	await test.step('Select and link the mention', async () => {
		await composePage.selectMention(initialMention);
		await composePage.verifyFacebookMentionPreview(initialMention);
	});

	await test.step('Shorten the link to ow.ly shortener', async () => {
		await composePage.selectShortenWithOwlyButton();
		await page.waitForTimeout(1000);
		await composePage.verifyLinkInFacebookPagePreview(SHORTENER);
		await expect(composePage.clearOwlyShorteningButton).toBeVisible();
	});

	await test.step('Save message as draft and verify it on drafts page', async () => {
		await composePage.saveDraft();
		await expect(draftsPage.draftItem).toHaveCount(1);
		await expect(draftsPage.userName).toContainText(fbAccount);
		await expect(draftsPage.summary).toContainText(scheduleText);
		await expect(page.getByTestId('CreationDetails')).toContainText(userName);
	});

	await test.step('Select created draft and verify its preview on side pane', async () => {
		await draftsPage.cardList.first().click();
		await expect(draftsPage.facebookPreviewText).toContainText(scheduleText);
	});

	await test.step('Duplcate draft to verify if mention and link shortener is persisted', async () => {
		await expect(draftsPage.moreActionsButtonOnSidePane).toBeVisible();
		await draftsPage.moreActionsButtonOnSidePane.click();
		await expect(draftsPage.duplicateButtonOnSidePane).toBeVisible();
		await draftsPage.duplicateButtonOnSidePane.click();
		await page.waitForTimeout(1000);
		await composePage.verifyFacebookMentionPreview(initialMention);
		await composePage.verifyLinkInFacebookPagePreview(SHORTENER);
		await expect(composePage.saveDraftButton).toBeVisible();
		await expect(composePage.scheduleLaterButton).toBeVisible();
		await expect(composePage.postButton).toBeVisible();
		await composePage.saveDraft();
	});

	await test.step('Delete created draft via API', async () => {
		await draftsPage.deleteDraftsViaApi(memberId);
		await page.waitForTimeout(500);
	});
});
