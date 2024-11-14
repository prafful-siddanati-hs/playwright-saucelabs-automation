const {expect} = require('@playwright/test');

exports.HomePage = class HomePage {
	constructor(page) {
		this.page = page;
		this.homePageGlobalNavButton = page.locator('[data-dap-target="global-nav-apps-section"] [aria-label="Home"]');
		this.homePageWidget = page.locator('.homepage-widget-inspirations');
		this.homePageCreateButton = page.locator('//*[contains(@class, "homepage-welcome-header")]//*[contains(text(), "Create a post")]', {locationStrategy: 'xpath'});
		this.showMoreOptions = page.getByLabel('Show more options');
		this.productNotificationsButton = page.getByLabel('Notifications');
		this.homePageAccountButton = page.locator('button[data-test-id="global-nav-account-button"]');
		this.homePageSocialAccountsAndTeamsButton = page.locator('div[data-key="org_management"][role="row"]');
	}

	async visit() {
		await this.page.goto('/dashboard#/home');
		await this.page.waitForLoadState();
		await expect(this.homePageCreateButton).toBeVisible();
	}

	async selectCreatePostButton() {
		await expect(this.homePageCreateButton).toBeVisible();
		await this.homePageCreateButton.click();
	}
};
