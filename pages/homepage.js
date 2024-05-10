const {expect} = require('@playwright/test');

exports.HomePage = class HomePage {
	constructor(page) {
		this.page = page;
		this.homePageGlobalNavButton = page.getByLabel('Home');
		this.homePageWidget = page.locator('.homepage-widget-announcements');
		this.homePageCreateButton = page.getByRole('button', { name: 'Create a post', exact: true });
	}

	async visit() {
		await this.page.goto('/dashboard#/home');
		await this.page.waitForLoadState();
		await expect(this.homePageCreateButton).toBeVisible();
	}
};
