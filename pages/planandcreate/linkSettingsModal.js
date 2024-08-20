const { expect } = require('@playwright/test');

exports.LinkSettingsModal = class LinkSettingsModal {
	constructor(page) {
		this.page = page;
		this.linkSettingsModal = page.getByLabel('Apply Link Settings modal');
		this.presetSelectDropdown = page.locator('//*[@aria-label="Apply Link Settings modal"]//*[@aria-label="Select Preset Area"]//*[@data-testid="Preset-select"]//*[@aria-haspopup ="listbox"]', {locationStrategy: 'xpath'});
		this.linkSettingsNoTracker = page.getByText('Tracking: No Tracking');
		this.linkSettingsNoShortner = page.getByText('Shortener: No Shortener');
		this.customizeButton = page.locator('//*[@aria-label="Apply Link Settings modal"]//*[text()="Customize"]', {locationStrategy: 'xpath'});
		this.linkSettingsShortenerDropdown = page.locator('//*[@aria-label="Apply Link Settings modal"]//*[@data-testid="Shortener-select"]//*[@aria-haspopup="listbox"]', {locationStrategy: 'xpath'});
		this.linkSettingsTrackerDropdown = page.getByLabel('No Tracking');
		this.linkSettingsCutomTracker = page.getByTestId('Custom-select-item', {hasText: 'Custom'});
		this.trackingParametersTable = page.getByTestId('TrackingParametersTable');
		this.linkSettingsAddParameterButton = page.getByTestId('AddParameterButton');
		this.parameterName = page.getByTestId('CompoundParameterNameInput-0');
		this.parameterValue = page.getByTestId('CompoundParameterValueInput-0-0');
		this.linkShortener = page.getByTestId('Ow.ly-select-item');
		this.manageLinkPreset = page.getByTestId('Manage link presets-select-item', {hasText: 'Manage link presets'});
		this.shortenWithOwlyCaption = page.getByTestId('owlyText').locator('div');
		this.editAppliedLinkPreset = page.getByTestId('MessageEditArea').getByRole('button', { name: 'Edit' });
		this.selectLinkDropdown = page.getByTestId('Select a link-select').locator('div').first();
		this.linkSettingsApplyButton = page.locator('//*[@aria-label="Apply Link Settings modal"]//*[text()="Apply"]', {locationStrategy: 'xpath'});
	}

	async verifyLinkSettingsModal() {
		await expect(this.linkSettingsModal, 'Link settings modal is not visible').toBeVisible();
		await expect(this.presetSelectDropdown).toBeVisible();
		await expect(this.linkSettingsNoTracker).toBeVisible();
		await expect(this.linkSettingsNoShortner).toBeVisible();
	}

	async selectLink(url) {
		const linkToSelect =  this.page.locator(`[data-testid="${url}-select-item"]`, { hasText: url });

		await expect(this.selectLinkDropdown, 'Link dropdown is not visible').toBeVisible();
		await this.selectLinkDropdown.click();
		await expect(linkToSelect, 'Selected link is not displayed').toBeVisible();
		await linkToSelect.click();
	}

	async selectTracker(tracker) {
		const linkSettingsTracker = this.page.locator(`[data-testid="${tracker}-select-item"]`, { hasText: tracker });

		await expect(this.linkSettingsTrackerDropdown, 'Link settings track dropdown is not visible').toBeVisible();
		await this.linkSettingsTrackerDropdown.click();
		await linkSettingsTracker.click();
	}

	async setAdobeTrackingParameter(parameterName, parameterValue) {
		await expect(this.trackingParametersTable, 'Link tracking parameter table is not visible').toBeVisible();
		await expect(this.parameterName, 'Link settings tracking parameter name is not visible').toBeVisible();
		await this.parameterName.fill(parameterName);
		await expect(this.parameterValue, 'Link settings tracking parameter value is not visible').toBeVisible();
		await this.parameterValue.fill(parameterValue);
	}

	async setLinkTrackingParameter(index, type, value, name) {
		const typeDropdown = this.page.locator(`(//*[@data-testid="TrackingParametersTable"]//*[@aria-haspopup="listbox"])[${index}]`, {locationStrategy: 'xpath'});
		const typeSelector = this.page.locator(`//*[@role = "listbox"]//*[text() = "${type}"]`, {locationStrategy: 'xpath'});
		const parameterName = this.page.locator(`//*[@data-testid="TrackingParametersTable"]//*[@data-testid="ParameterNameInput-${index - 1}"]`, {locationStrategy: 'xpath'});

		await expect(typeDropdown, 'Link tracking parameter dropdown is visible').toBeVisible();
		await typeDropdown.click();

		await expect(typeSelector, 'Link tracking parameter type textbox is visible').toBeVisible();
		await typeSelector.click();

		if (name != null) {
			await expect(parameterName, 'Link settings tracking parameter name textbox is  visible').toBeVisible();
			await parameterName.click();
			await parameterName.fill(name);
		}

		if (type === 'Custom') {
			const valueSelector = this.page.locator(`//*[@data-testid="TrackingParametersTable"]//*[@data-testid="CompoundParameter-${index - 1}"]//*[@aria-label="Tracking parameter value"]`);
			const inputSelector = this.page.locator(`//input[@value='${value}']`, {locationStrategy: 'xpath'});

			await expect(valueSelector, 'Link tracking parameter value is visible').toBeVisible();
			await valueSelector.click();
			await this.page.keyboard.type(value);
			await expect(inputSelector, 'Link tracking parameter value is visible').toBeVisible();
		}
	}

	async selectLinkShortenerDropdown() {
		await expect(this.linkSettingsShortenerDropdown, 'Link shortener dropdown is visible').toBeVisible();
		await this.linkSettingsShortenerDropdown.click();
	}

	async selectMenuItemByName(name) {
		const menuItem = this.page.locator(`//*[@aria-label="Apply Link Settings modal"]//*[@role="option"]//*[text()="${name}"]`);
		await expect(menuItem, 'Link shortener dropdown list is visible').toBeVisible();
		await menuItem.click();
	}

	async selectCustomizeButton() {
		await expect(this.customizeButton).toBeVisible();
		await this.customizeButton.click();
	}

	async selectLinkSettingsTrackerDropDown() {
		await expect(this.linkSettingsTrackerDropdown).toBeVisible();
		await this.linkSettingsTrackerDropdown.click();
	}

	async selectLinkSettingsCustomTracker() {
		await expect(this.linkSettingsCutomTracker).toBeVisible();
		await this.linkSettingsCutomTracker.click();
	}

	async selectLinkSettingsApplyButton() {
		await expect(this.linkSettingsApplyButton).toBeVisible();
		await this.linkSettingsApplyButton.click();
		await this.page.waitForTimeout(2000);
	}

	async selectLinkPresetsDropDown() {
		await expect(this.presetSelectDropdown).toBeVisible();
		await this.presetSelectDropdown.click();
	}

};
