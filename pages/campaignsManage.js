const { expect } = require('@playwright/test');

exports.CampaignsManagePage = class CampaignsManagePage {
	constructor(page) {
		this.page = page;
		this.closeButton = page.locator('.rc-ManageCampaigns .rc-HeaderCloseButton');
		this.campaignCreateButton = page.locator('.rc-ManageCampaigns .-createCampaignButton');
		this.campaignsList = page.locator('.rc-ManageCampaigns .vk-CampaignList');
		this.noCampaignsMessage = page.locator('.rc-ManageCampaigns .-emptyCampaigns');
	}

	async closeCampaignsManageModal() {
		await expect(this.closeButton).toBeVisible();
		await this.closeButton.click();
		await expect(this.closeButton).not.toBeVisible();
	}

	async selectCreateCampaignButton() {
		await expect(this.campaignCreateButton).toBeVisible();
		await this.campaignCreateButton.click();
	}

	async verifyCampaignExists(name) {
		const selector = `//*[contains(@class, "rc-ManageCampaigns")]//*[contains(@class, "vk-CampaignName") and contains(text(), "${name}")]`;

		await expect(this.campaignsList).toBeVisible();
		await expect(this.page.locator(selector)).toBeVisible();
	}

};
