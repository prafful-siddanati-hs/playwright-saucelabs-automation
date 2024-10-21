exports.ManageCampaignsPage = class ManageCampaignsPage {
	constructor(page) {
		this.page = page;
		this.manageCampaignsView = page.locator('.rc-AppCampaignsView .rc-ManageCampaigns');
		this.createCampaignButton = page.locator('.rc-AppCampaigns button.-createCampaignButton');
	}
};
