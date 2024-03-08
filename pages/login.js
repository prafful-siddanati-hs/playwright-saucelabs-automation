const { expect } = require('@playwright/test');
const {getObjectByName} = require('../globals');

exports.LoginPage = class LoginPage {
	constructor(page) {
		this.page = page;
		this.cookie = [];
		this.emailAddress = page.locator('#loginEmailInput');
		this.password = page.locator('#loginPasswordInput');
		this.loginSubmit = page.getByRole('button', { name: 'Sign in', exact: true });
		this.streamsView = page.locator('#stream-migration-root');
		this.welcomeSelector = page.getByRole('heading', { name: 'Welcome back,' });
	}

	async visit() {
		await this.page.goto('login?lang=en');
	}

	async signIn(member) {
		let user;
		let hsUsers = global.member;

		if (typeof member === 'string') {
			user = getObjectByName(hsUsers, member);
		} else if (hsUsers.size() > 0) {
			user = hsUsers.get()[hsUsers.size() - 1];
		} else if (member) {
			user = member;
		} else {
			console.log('No Hootsuite User found.');
		}

		await this.page.goto('/login?lang=en');
		await this.page.waitForLoadState('networkidle');
		await expect(this.page).toHaveTitle(/Hootsuite - Login/);
		await this.emailAddress.fill(user.email);
		await this.password.fill(user.password);
		await this.loginSubmit.click();
		await expect(this.emailAddress).not.toBeVisible();
		await this.page.waitForLoadState();
		await this.page.waitForLoadState('networkidle');
	}

	async login(email, password) {
		await this.page.goto('/login?lang=en');
		await expect(this.page).toHaveTitle(/Hootsuite - Login/);
		await this.emailAddress.fill(email);
		await this.password.fill(password);
		await this.loginSubmit.click();
		await expect(this.emailAddress).not.toBeVisible();
		await this.page.waitForLoadState();
	}

	async logout() {
		await this.page.goto('/logout');
		await expect(this.emailAddress).toBeVisible();
	}

	// Redirect to dashboard home after login to skip any onboarding
	async signInSkipOnboarding(member) {
		await this.signIn(member);
		await this.page.goto('/dashboard#home');
	}

	async verifySocialNetwork(name) {
		await expect(this.page.locator(`//*[contains(@id, "social-profiles-tab")]//*[text()="${name}"]`)).toBeVisible();
	}
};
