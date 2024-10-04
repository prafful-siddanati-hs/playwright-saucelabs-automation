const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const {ComposePage} = require('../../../../pages/planandcreate/compose');
const {getObjectByName, plan_create} = require('../../../../globals');
const {LoginPage} = require('../../../../pages/login');
const getFixture = require('../../../../custom-commands/getFixture');
const {DraftsPage} = require('../../../../pages/planandcreate/drafts');
let profile, userName, memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Create draft using composer', async ({ page }) => {
	const draftText = plan_create.getComposeMessage() + ' ' + plan_create.getRandomUrl() + ' ' + plan_create.getRandomHashTag() + ' ' + plan_create.getRandomEmoji() + ' '+ '@mention';

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const draftsPage = new DraftsPage(page);

	await test.step('Setup user', async () => {
		await addFixture.command('draft_create', 'pro_user_composer', true, 300);
		profile = getObjectByName(global.fixture, 'draft_create').twitter.username;
		userName = getObjectByName(global.fixture, 'draft_create').username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login in as pro user', async () => {
		await loginPage.signIn('draft_create');
	});

	await test.step('Delete residual draft messages via API', async () => {
		await draftsPage.deleteDraftsViaApi(memberId);
	});

	await test.step('Navigate to drafts page', async () => {
		await draftsPage.visit();
		await expect(draftsPage.draftItem).toHaveCount(0);
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Create draft without selecting network and no text and verify it', async () => {
		await composePage.saveDraft();
		await expect(draftsPage.draftItem).toHaveCount(1);
		await expect(page.getByLabel('No account, Draft , Status Draft, Caption ')).toBeVisible();
		await expect(page.getByTestId('CreationDetails')).toContainText(userName);
	});

	await test.step('Select created draft and edit it', async () => {
		await draftsPage.cardList.first().click();
		await expect(draftsPage.editButtonOnSidePane).toBeVisible();
		await draftsPage.editButtonOnSidePane.click();
	});

	await test.step('Select twitter profile and select save changes', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(profile);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await composePage.saveChanges();
	});

	await test.step('Verify draft with single network selected and no text message', async () => {
		await expect(draftsPage.draftItem).toHaveCount(1);
		await expect(page.getByLabel(profile)).toBeVisible();
		await expect(page.getByTestId('CreationDetails')).toContainText(userName);
	});

	await test.step('Edit draft to add message', async () => {
		await expect(draftsPage.editButtonOnSidePane).toBeVisible();
		await draftsPage.editButtonOnSidePane.click();
		await composePage.writeMessage(draftText);
	});

	await test.step('Verify draft preview and save changes', async () => {
		await composePage.verifyTwitterPreview(draftText);
		await composePage.saveChanges();
		await draftsPage.verifyDraftMessage(profile, draftText, userName);
	});

	await test.step('Delete created draft via API', async () => {
		await draftsPage.deleteDraftsViaApi(memberId);
		await page.waitForTimeout(500);
	});
});
