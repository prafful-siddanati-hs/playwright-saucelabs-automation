const { expect } = require('@playwright/test');

exports.CampaignsManagePage = class CampaignsManagePage {
	constructor(page) {
		this.page = page;
		this.closeButton = page.locator('.rc-ManageCampaigns .rc-HeaderCloseButton');
		this.campaignCreateButton = page.locator('.rc-ManageCampaigns .-createCampaignButton');
		this.campaignsList = page.locator('.rc-ManageCampaigns .vk-CampaignList');
		this.noCampaignsMessage = page.locator('.rc-ManageCampaigns .-emptyCampaigns');
		this.archiveToggleListItem = page.locator('.rc-ManageCampaigns .vk-ToggleArchiveListItem');
		this.archiveConfirmButton = page.locator('.vk-ConfirmArchiveButton');
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

	async editCampaign(name) {
		const selector = `//*[contains(@class, "vk-CampaignName") and contains(text(), "${name}")]//following::*[3]//button[contains(@class, "vk-EditCampaign")]`;

		await expect(this.page.locator(selector)).toBeVisible();
		await this.page.locator(selector).click();
	}

	async toggleCampaignArchive(name, isArchived) {
		const selector = `//*[contains(@class, "vk-CampaignName") and contains(text(), "${name}")]//following::*[3]//button[contains(@class, "vk-MoreActionsButton")]`;

		await expect(this.page.locator(selector)).toBeVisible();
		await this.page.locator(selector).click();
		await expect(this.archiveToggleListItem).toBeVisible();
		await this.archiveToggleListItem.click();

		if (isArchived) {
			await expect(this.archiveConfirmButton).toBeVisible();
			await this.archiveConfirmButton.click();
		}
	}

	async   verifyCampaignArchiveStatus(name, isArchived) {
		const selector = `//*[contains(@class, "vk-CampaignName") and contains(text(), "${name}")]//following::td[2][contains(@class, "vk-CampaignState") and contains(text(), ${isArchived ? 'Archived' : 'Active'})]`;

		await expect(this.page.locator(selector)).toBeVisible();
	}
};
