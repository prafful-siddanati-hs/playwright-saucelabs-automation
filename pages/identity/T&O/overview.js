const { expect } = require('@playwright/test');


exports.OverviewPage = class OverviewPage {
	constructor(page) {
		this.page = page;
		/**
         * - - - - - HEADER - - - - -
         */
		this.pageHeader = page.getByTestId('page-header');
		this.pageHeaderActionButton = page.locator('button[data-e2e-id="overview-heading-action-button"]');
		this.createNewTeamOption = page.locator('button[data-testid="list-item-clickable"] >> text=Create new team');
		this.inviteNewMembersOption = page.locator('button[data-testid="list-item-clickable"] >> text=Invite new members');
		this.addSocialAccountsOption = page.locator('button[data-testid="list-item-clickable"] >> text=Add social accounts');

		this.createNewTeamModal = page.getByTestId('create-team-modal');
	}

	async visit() {
		await this.page.goto('/dashboard#/organization-management');
		await this.page.waitForURL('/dashboard#/organization-management');
	}

	async selectHeaderButton() {
		await this.page.waitForSelector('button[data-e2e-id="overview-heading-action-button]"]');
		const headerButtonHandle = await this.page.$('button[data-e2e-id="overview-heading-action-button]"]');

		if (headerButtonHandle) {
			await headerButtonHandle.click();
			console.log('header action button clicked!');
		} else {
			console.log('header action button not found!');
		}
		await expect(this.composeScreen, 'should be navigated to composer full screen').toBeVisible();
	}
};
