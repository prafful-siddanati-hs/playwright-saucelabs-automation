/* Test to verify composer state is retained when it is minimized during post creation & edit */
const { test, expect } = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const { DraftsPage } = require('../../../../pages/planandcreate/drafts');
const createUser = require('../../../../custom-commands/createUser');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Minimize composer during post creation & edit', async ({ page }) => {
	const genericText = 'I will minimize composer while creating a post ';
	const updatedGenericText = genericText.concat('--minimize while editing ');
	const duplicateGenericText = updatedGenericText.concat('--minimize while duplicating ');
	const createNewUser = new createUser();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);
	const draftsPage = new DraftsPage(page);

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('minimize_composer', 'professional');
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInAsProUser('minimize_composer');
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
		await composePage.verifyComposerModal();
	});

	await test.step('Start typing a message', async () => {
		await composePage.writeMessage(genericText);
		await expect(composePage.genericPreviewText).toHaveText(genericText);
	});

	await test.step('Minimize the composer', async () => {
		await composePage.minimizeComposer();
		await expect(composePage.composeScreen).not.toBeVisible();
		await page.waitForTimeout(1200);
	});

	await test.step('Open composer by clicking on floating dock', async () => {
		await expect(composePage.composerFloatingDock, 'Floating dock displays \'Create a post\'').toContainText('Create a post');
		await composePage.composerFloatingDock.click();
	});

	await test.step('Verify composer state is retained for create', async () => {
		await composePage.verifyComposerHeader();
		await composePage.verifyComposerFooter();
		await composePage.verifyGenericPreview(genericText);
	});

	await test.step('Save it as draft', async () => {
		await expect(composePage.saveAsDraftButton).toBeVisible();
		await composePage.saveAsDraftButton.click();
	});

	await test.step('Navigate to drafts page', async () => {
		await plannerPage.visit();
		await plannerPage.draftsTab.click();
		await expect(draftsPage.draftsSuccessCallOuts).not.toBeVisible();
		await expect(draftsPage.draftItem).toHaveCount(1);
	});

	await test.step('Edit the draft', async () => {
		await draftsPage.editDraftByContent(genericText);
		await composePage.updateDraft(updatedGenericText);
		await composePage.verifyGenericPreview(updatedGenericText);
	});

	await test.step('Minimize the composer while editing', async () => {
		await composePage.minimizeComposer();
		await expect(composePage.composeScreen).not.toBeVisible();
		await page.waitForTimeout(1200);
	});

	await test.step('Open composer by clicking on maximize button from floating dock', async () => {
		await expect(composePage.composerFloatingDock, 'Floating dock displays \'Edit Post\'').toContainText('Edit Post');
		await expect(composePage.maximizeComposeButton).toBeVisible();
		await composePage.maximizeComposeButton.click();
	});

	await test.step('Save the changes made to draft', async () => {
		await composePage.saveChanges();
	});

	await test.step('Duplicate the saved draft', async () => {
		await expect(draftsPage.draftsSuccessCallOuts).not.toBeVisible();
		await draftsPage.duplicateDraftByContent(updatedGenericText);
	});

	await test.step('Add new text to the post', async () => {
		await composePage.updateDraft(duplicateGenericText);
	});

	await test.step('Minimize the composer while duplicating the draft', async () => {
		await composePage.minimizeComposer();
		await expect(composePage.composeScreen).not.toBeVisible();
		await page.waitForTimeout(1200);
	});

	await test.step('Verify floating dock displays \'Create a post\'', async () => {
		await expect(composePage.composerFloatingDock).toContainText('Create a post');
		await composePage.composerFloatingDock.click();
	});

	await test.step('Verify composer state is retained for duplicate', async () => {
		await composePage.verifyComposerHeader();
		await composePage.verifyComposerFooter();
		await composePage.verifyGenericPreview(duplicateGenericText);
	});
});
