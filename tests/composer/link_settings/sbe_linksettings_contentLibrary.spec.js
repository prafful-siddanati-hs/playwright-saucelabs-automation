/**
 * [https://hootsuite.atlassian.net/browse/SBE-5931]
 * Test for linksettings via content library template.
 */
const { test, expect} = require('@playwright/test');
const { SetUpEnterpriseUser } = require('../../../custom-commands/setUpEnterpriseUser');
const { LoginPage } = require('../../../pages/login');
const { ComposePage } = require('../../../pages/planandcreate/compose');
const { PlannerPage } = require('../../../pages/planandcreate/planner');
const { ContentLibraryPage } = require('../../../pages/planandcreate/contentLibrary');
const createTeam = require('../../../custom-commands/createTeam');
const tearDown = require('../../../custom-commands/tearDown');
const {getObjectByName, plan_create} = require('../../../globals');
const URL = plan_create.getSBETestUrl();
const TRACKER = 'Adobe Analytics';
const PARAMETER_NAME = 'category';
const PARAMETER_VALUE = 'Ecommerce';
let memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Link settings via content library template', async ({ page }) => {
	let clLinkOrg = 'PW_contentLib_links'.concat(Math.floor(Math.random() * 10000));
	let clLinkText = `CL template with links ${URL}`;
	const clLinkTeam = 'PW_CL_LINKS_TEAM';
	const clLinkName = 'Content Library Links';
	const setUpEnterpriseUser = new SetUpEnterpriseUser();
	const createNewTeam = new createTeam();
	const contentLibraryPage = new ContentLibraryPage(page);
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);

	let accounts = {
		twitter: []
	};
	accounts.twitter.push('pw_cl_links_tw');

	await test.step('Setup enterprise user, team &  account', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(clLinkOrg, 'pw_cl_link_template', accounts);
		await createNewTeam.command(clLinkTeam);
		memberId = global.member[0].memberId;
	});

	await test.step('Login as test enterprise user', async () => {
		await loginPage.signInSkipOnboarding('pw_cl_link_template');
		const isViewVisible = await Promise.race([
			loginPage.streamsView.waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
			loginPage.welcomeSelector.waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
		]);
		expect(isViewVisible).toBeTruthy();
	});

	await test.step('Navigate to content library page', async () => {
		await contentLibraryPage.visit();
	});

	await test.step('Create new content library', async() => {
		await contentLibraryPage.createContentLibrary(clLinkName, clLinkTeam);
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(clLinkText);
	});

	await test.step('Save a content library template', async () => {
		await composePage.saveToContentLibrary();
		await contentLibraryPage.createContentLibraryAsset(clLinkName);
		await expect(composePage.composeScreen).not.toBeVisible();
		await expect(contentLibraryPage.clSuccessCallout).not.toBeVisible();
	});

	await test.step('Verify template was created', async () => {
		await contentLibraryPage.verifyContentLibraryTemplate(clLinkText);
	});

	await test.step('Select the template to compose', async () => {
		await contentLibraryPage.selectContentLibraryTemplateToCompose(clLinkText);
	});

	await test.step('Verify twitter account is selected', async () => {
		await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, 'pw_cl_links_tw').username);
	});

	await test.step('Open link settings modal', async () => {
		await composePage.openLinkSettingsDialog();
		await expect(composePage.presetSelectDropdown).toBeVisible();
		await expect(composePage.linkSettingsNoTracker).toBeVisible();
		await expect(composePage.linkSettingsNoShortner).toBeVisible();
	});

	await test.step('Add a tracker',async () => {
		await expect(composePage.customizePresetButton).toBeVisible();
		await composePage.customizePresetButton.click();
		await expect(composePage.linkSettingsTrackerDropdown).toBeVisible();
		await composePage.linkSettingsTrackerDropdown.click();
		await composePage.selectTracker(TRACKER);
	});

	await test.step('Set a tracking parameter', async () => {
		await composePage.setTrackingParameter(PARAMETER_NAME, PARAMETER_VALUE);
	});

	await test.step('Verify & apply the tracking parameter', async () => {
		const exampleURL = page.getByTestId('LinkPreviewWithUTM');
		await expect(exampleURL).toContainText(`${URL}?${PARAMETER_NAME}=${PARAMETER_VALUE}`);
		await expect(composePage.linkSettingsApplyButton).toBeVisible();
		await composePage.linkSettingsApplyButton.click();
		await expect(composePage.feCallOuts).not.toBeVisible();
	});

	await test.step('Verify the tracker is applied', async () => {
		await expect(composePage.twitterPreviewText).toContainText(PARAMETER_NAME);
		await expect(composePage.twitterPreviewText).toContainText(PARAMETER_VALUE);
		await composePage.verifyLinkInTwitterPreview(`${URL}?${PARAMETER_NAME}=${PARAMETER_VALUE}`);
	});

	await test.step('Schedule the message', async () => {
		await composePage.schedule();
	});

	await test.step('Hide native posts', async () => {
		await plannerPage.hideNativePosts(memberId);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled message', async () => {
		await plannerPage.verifyScheduledMessage(clLinkText.concat(`?${PARAMETER_NAME}=${PARAMETER_VALUE}`));
		await plannerPage.showPreviewPane(clLinkText.concat(`?${PARAMETER_NAME}=${PARAMETER_VALUE}`));
	});

	await test.step('Verify link settings on preview pane', async () => {
		await plannerPage.verifyTextInPreviewPane(clLinkText.concat(`?${PARAMETER_NAME}=${PARAMETER_VALUE}`));
	});
});
