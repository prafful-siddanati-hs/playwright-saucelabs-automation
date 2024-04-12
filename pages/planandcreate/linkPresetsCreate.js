const { expect } = require('@playwright/test');

exports.LinkPresetsCreatePage = class LinkPresetsCreatePage {
	constructor(page) {
		this.page = page;
		this.linkPresetNameInput = page.getByPlaceholder('Preset name...');
		this.linkPresetShortenerDropdown = page.getByLabel('Shortener');
		this.linkPresetTrackerDropdown = page.getByLabel('Tracking');
		this.linkPresetTrackingName = page.getByRole('button', { name: 'Custom' });
		this.linkPresetCreateButton = page.getByRole('button', { name: 'Create new preset' });
		this.linkPresetCancelButton = page.getByRole('button', { name: 'Cancel' });
		this.linkSettingsApplyButton = page.getByRole('button', { name: 'Apply' });
	}

	async clickCreateButton() {
		await expect(this.linkPresetCreateButton).toBeVisible();
		await this.linkPresetCreateButton.click();
	}

	async setPresetName(linkPresetName) {
		await expect(this.linkPresetNameInput).toBeVisible();
		await this.linkPresetNameInput.fill(linkPresetName);
	}

	async setShortener(linkPresetShortenerName) {
		const linkPresetShortener = this.page.getByRole('button', { name: `${linkPresetShortenerName}`, exact: true });
		await expect(this.linkPresetShortenerDropdown).toBeVisible();
		await this.linkPresetShortenerDropdown.hover();
		await this.linkPresetShortenerDropdown.click();
		await linkPresetShortener.click();
	}

	async setTracker(linkPresetTrackerName) {
		const linkPresetTracker = this.page.getByRole('button', { name: `${linkPresetTrackerName}`, exact: true });
		await expect(this.linkPresetTrackerDropdown).toBeVisible();
		await this.linkPresetTrackerDropdown.click();
		await linkPresetTracker.click();
	}

	async setTrackingParameter(index, type, value) {
		const typeDropdown = this.page.locator(`.rc-LinkTrackingParametersArea .-fieldImprovements:nth-child(${index}) .vk-TrackingParamsDropdownAnchor`);
		const typeSelector = this.page.locator(`.rc-LinkTrackingParametersArea .-fieldImprovements:nth-child(${index}) .vk-TrackingParamsListItemContainer .vk-ListItemWrapper:has-text("${type}")`);

		await expect(typeDropdown).toBeVisible();
		await typeDropdown.click();
		await expect(typeSelector).toBeVisible();
		await typeSelector.click();

		if (type === 'Custom') {
			let valueSelector = this.page.locator(`.rc-LinkTrackingParametersArea .-fieldImprovements:nth-child(${index}) .-fieldValueInputImprovements input`);
			const inputSelector = this.page.locator(`.rc-LinkTrackingParametersArea .-fieldImprovements:nth-child(${index}) .-fieldValueInputImprovements input[value="${value}"]`);

			await valueSelector.fill(value);
			await expect(inputSelector).toBeVisible();
		}
	}

	async clickApplyButton() {
		await expect(this.linkSettingsApplyButton).toBeVisible();
		await this.linkSettingsApplyButton.click();
	}

};
