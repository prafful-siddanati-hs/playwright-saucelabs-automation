const events = require('events');
const MemberService = require('hsapi').memberService;
const SocialProfiles = require('hsapi').som;

const { som_bridge, broker_member_service } = require('../globals.js');
const { use: { longTimeout } } = require('../playwright.config.js');

class tearDown extends events.EventEmitter {
    constructor() {
        super();
        this.step = '';
    }

    hasResponseErrors(res) {
        if (typeof res !== 'object') {
            console.log('Unable to parse response object.');
            return true;
        }
        // Check for errors in the body and non-200 status codes.
        return ((res.body && res.body.errors) || (res.statusCode && res.statusCode !== 200));
    }

    checkResponse(response, successMsg) {
        if (this.step && this.step !== '') {
            console.log(`${this.step}:`);
        }

        if (!response[0]) {
            console.log(true, `${successMsg}`);
        } else {
            if (!Array.isArray(response)) {
                response = [response];
            }
            response.forEach((r) => {
                if (!this.hasResponseErrors(r)) {
                    console.log(true, `${successMsg}`);
                } else {
                    console.log(false, JSON.stringify(r, null, 2));
                }
            });
        }
    }

    tearDownTimeout = setTimeout(() => {
        let message = `Failed to complete tearDown() at step: ${this.step}`;
        console.error(message);
        throw new Error(message);
    }, parseInt(longTimeout));

    async command(callback) {
        try {
            let socialProfiles = new SocialProfiles(som_bridge);
            let memberService = new MemberService(broker_member_service);

            let users = global.member;
            let fixtures = global.fixture;

            function requiresTearDown (user) {
                return user.tearDown === true;
            }
        
            function requiresEmailChange (user) {
                return user.emailChange === true;
            }
        
            function requiresSocialProfileCleanup (fixture) {
                return fixture.isSocialProfile === true;
            }

            this.step = 'Editing Hootsuite users emails';
            let emailChangedUsers = users.filter(requiresEmailChange).map((user) => {
                let emailToDelete = `qa_${Date.now()}@tobedeleted.ly`;
                

                return memberService.modifyUserAccount(user.memberId, {
                    email: emailToDelete
                });
            });

            if (emailChangedUsers.length > 0) {
                let updatedEmails = await Promise.all(emailChangedUsers);

                this.checkResponse(updatedEmails, 'Edited Hootsuite users email addresses.');
            }

            this.step = 'Deleting Hootsuite users';
            let cancelledUsers = users.filter(requiresTearDown).map((user) => {
                return memberService.cancelUserAccount(user.memberId);
            });

            if (cancelledUsers.length > 0) {
                let cancelledMembers = await Promise.all(cancelledUsers);

                this.checkResponse(cancelledMembers, 'All Hootsuite users have been cancelled.');
            }

            this.step = 'Cleaning Social Profiles';
            let cleanedProfiles = fixtures.filter(requiresSocialProfileCleanup).map((fixture) => {
                return socialProfiles.cleanUpSocialProfile(fixture.socialProfile.type, {
                    userId: fixture.socialProfile.userId
                });
            });

            if (cleanedProfiles.length > 0) {
                let cleaned = await Promise.all(cleanedProfiles);

                this.checkResponse(cleaned, 'All Hootsuite users have been cleaned.');
            }

            this.step = 'Releasing locked accounts from DynamoDB';
            let toBeReleased = fixtures.map((fixture) => {
                return fixture.dynamodb.destroy();
            });

            if (toBeReleased.length > 0) {
                let released = await Promise.all(toBeReleased);

                this.checkResponse(released, 'All accounts have been released.')
            }

            if (typeof callback === 'function') {
                callback.call(self);
            }

        } catch (err) {
            console.log('\nERROR', this.step, ':', err, '\n');
        } finally {
            clearTimeout(this.tearDownTimeout);
            this.emit('Complete')
        }

    }
};

module.exports = tearDown;
