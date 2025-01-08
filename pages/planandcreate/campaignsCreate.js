const { expect } = require('@playwright/test');

exports.CampaignsCreatePage = class CampaignsCreatePage {
	constructor(page) {
		this.page = page;
		this.closeButton = page.locator('.rc-ManageCampaigns .rc-HeaderCloseButton');
		this.createButton = page.locator('.rc-AppCampaignsView button.-createCampaignButton');
		this.campaignNameInput = page.locator('.rc-CreateCampaign .-campaignNameTextInput input');
		this.campaignDescriptionInput = page.locator('.rc-CreateCampaign .-campaignDescriptionTextArea textarea');
		this.linkPresetsDropdown = page.locator('.rc-CreateCampaign .vk-LinkPresetsDropdownAnchor');
		this.dateRangeDropdown = page.locator('.rc-CreateCampaign .-dateRangeButton');
		this.datePickerNextMonth = page.locator('[aria-label="Go to next month"]');
		this.datePickerSetButton = page.locator('.rc-DateRangeTimePicker .-setButton');
		this.campaignStartDate = page.locator('button.rdp-day[tabindex="0"]');
		this.campaignEndDate = page.locator('button.rdp-day[tabindex="0"]'); //1st of next month
	}

	async selectCreateCampaignButton() {
		await expect(this.createButton).toBeVisible();
		await this.createButton.click();
	}

	async selectLinkPresetByName(name) {
		const menuItem = `//div[contains(@class, "rc-LinkPresetDropdown")]//button[contains(@class, "vk-PresetListItem")]//div[contains(text(), "${name}")]`;
		await expect(this.page.locator(menuItem)).toBeVisible();
		await this.page.locator(menuItem).click();
	}

	async setCampaignName(name) {
		await expect(this.campaignNameInput).toBeVisible();
		await this.campaignNameInput.fill(name);
	}

	async selectDefaultDateRange() {
		await expect(this.dateRangeDropdown).toBeVisible();
		await this.dateRangeDropdown.click();
		await expect(this.datePickerNextMonth).toBeVisible();
		await this.datePickerNextMonth.click();
		await this.campaignStartDate.click();
		await this.datePickerNextMonth.click();
		await this.campaignEndDate.click();
		await this.datePickerSetButton.click();
		await expect(this.datePickerSetButton).not.toBeVisible();
	}

	async clickLinkPresetsDropdown() {
		await expect(this.linkPresetsDropdown).toBeVisible();
		await this.linkPresetsDropdown.click();
	}

	async extendDateRange() {
		await expect(this.dateRangeDropdown).toBeVisible();
		await this.dateRangeDropdown.click();
		await expect(this.datePickerNextMonth).toBeVisible();
		await this.datePickerNextMonth.click();
		await this.datePickerNextMonth.click();
		await this.campaignEndDate.click();
		await this.datePickerSetButton.click();
		await expect(this.datePickerSetButton).not.toBeVisible();
	}

	async clickCreateCampaignButton() {
		await expect(this.createButton).toBeVisible();
		await this.createButton.hover();
		await this.createButton.click();
	}

};
