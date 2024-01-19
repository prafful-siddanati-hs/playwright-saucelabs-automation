/**
 * Custom command to find an account not currently being used by other tests.
 * Uses dynamodb to lock resource while it's using it.
 *
 * Requirements:
 * Always run it as first step (not before block)
 *  - abortOnAssertionFailure: false
 *  - end_session_on_fail: true
 *  - skip_testcases_on_fail: true
 *
 * Fault tolerance:
 * In case of any operation fails, fixture is pushed to the global
 * storage at the last then() block, after catch. This allows to
 * teardown (after) block to release locked accounts.
 *
 * Make sure to run tearDown once you are done.
 */
const events = require('events');
const DynamoDB = require('hsdynamodb');
const SocialProfiles = require('hsapi').som;
const OrganizationMembers = require('hsapi').organizationMembersService;
const _ = require('underscore');

const { som_bridge, tops_skyline, hasResponseErrors } = require('../globals.js');

/**
 * @param  {string}    name         Name of the fixture to be called by other methods
 * @param  {string}    type         Social Media account type @see {fixtures/accounts.js}
 * @param  {boolean}   addSocial    If true, social profile is included in Hootsuite account (optional, default: false)
 * @param  {number}    ttl          Amount of time in seconds to lock the account.
 *                                  Value must be between 30 and 600. (optional, default: 90)
 *
 * @return {function}  this         Allows to chain commands
 *
 * If success and addSocial = true, example below returned via optional callback
 * and pushed into global.fixtures[]:
 *
 * {
 *    name: 'acc1',
 *    socialProfile: {
 *       userId: 3428047578,
 *       type: 'TWITTER',
 *       email: 'gabriel.sagula+ads3@hootsuite.com',
 *       username: 'LMongosy',
 *       password: '4Connection',
 *       auth1: '3428047578-lmzfsrymEtdHKwwWyl8kBSCtO3l8ccBz0ZJPCye',
 *       auth2: 'FJzTlcpbdxM5Tk5wZHoAt9AQp67R3YtlhlPq2vGE9PMxo',
 *       socialProfileId: 57347427,
 *       isSecurePost: true,
 *       isReauthRequired: 0
 *    },
 *    dynamodb: {
 *       session: '96f04d44-453b-1fb2-1ed5-d10caa4e09e3',
 *       key: 'tests/venkman/3428047578'
 *    },
 *    member: {
 *       fullName: 'wideguide',
 *       email: 'wideguide_1455410303384@hootfree.com',
 *       password: 'Password',
 *       memberId: 10779974
 *    }
 * }
 */

/**
 * @param  {string}    name         Name of the fixture to be called by other methods
 * @param  {string}    type         Social Media account type @see {fixtures/accounts.js}
 * @param  {boolean}   addSocial    If true, social profile is included in Hootsuite account (optional, default: false)
 * @param  {number}    ttl          Amount of time in seconds to lock the account.
 *                                  Value must be between 30 and 600. (optional, default: 90)
 *
 * @return {function}  this         Allows to chain commands
 *
 * If success and addSocial = true, example below returned via optional callback
 * and pushed into global.fixtures[]:
 *
 * {
 *    name: 'acc1',
 *    socialProfile: {
 *       userId: 3428047578,
 *       type: 'TWITTER',
 *       email: 'gabriel.sagula+ads3@hootsuite.com',
 *       username: 'LMongosy',
 *       password: '4Connection',
 *       auth1: '3428047578-lmzfsrymEtdHKwwWyl8kBSCtO3l8ccBz0ZJPCye',
 *       auth2: 'FJzTlcpbdxM5Tk5wZHoAt9AQp67R3YtlhlPq2vGE9PMxo',
 *       socialProfileId: 57347427,
 *       isSecurePost: true,
 *       isReauthRequired: 0
 *    },
 *    dynamodb: {
 *       session: '96f04d44-453b-1fb2-1ed5-d10caa4e09e3',
 *       key: 'tests/venkman/3428047578'
 *    },
 *    member: {
 *       fullName: 'wideguide',
 *       email: 'wideguide_1455410303384@hootfree.com',
 *       password: 'Password',
 *       memberId: 10779974
 *    }
 * }
 */

class getFixture extends events.EventEmitter {
    constructor() {
        super();
        this.step = '';
    }

    checkResponse(response, successMsg) {
        if (this.step && this.step !== '') {
            console.log(`${this.step}:`);
        }

        if (!Array.isArray(response)) {
            response = [response];
        }

        response.forEach((r) => {
            if (!hasResponseErrors(r)) {
                console.log(true, `${successMsg}`);
            } else {
                console.log(false, JSON.stringify(r, null, 2));
            }
        });
    }

    async command(name, type, addSocial, ttl) {
        let fixture = {};

        try {
            if (!ttl) {
                ttl = 90;
            }

            if (ttl < 30 || ttl > 600 || typeof ttl !== 'number') {
                throw new Error('ttl must be a number of seconds between 30 and 600.');
            }

            let dynamoDB = 'build-ci-dynamodb-test-accounts-dev';
            let AWSprofile = 'build-ci-aws-creds';

            let accountsFile = 'accounts.js';
            let dynamodb = new DynamoDB('playwright-saucelabs', AWSprofile, dynamoDB);
            let socialProfiles = new SocialProfiles(som_bridge);
            let accountData = require(`./../fixtures/${accountsFile}`);
            let accounts = accountData[type];

            if (!accounts) {
                let keys = _.allKeys(accountData);
                throw new Error(`${type} not available. Supported values are ${keys.toString()}.`);
            }

            const opts = {
                timeout: (ttl * 1000)
            };

            // Locking account in DynamoDB
            this.step = 'Locking account in DynamoDB';

            let locked = await dynamodb.lockFromList(accounts, opts);

            this.checkResponse(locked.resource, 'Account has been locked.');

            Object.assign(fixture, locked.resource);

            fixture.name = name;

            fixture.dynamodb = {
                key: locked.key,
                destroy: locked.destroy
            };

            if ((fixture.isSocialProfile === undefined || fixture.isSocialProfile === true) && (fixture.tearDown !== false)) {
                // If tearDown is false we don't want to cleanup the test accounts.
                fixture.isSocialProfile = true;

                fixture.socialProfile = {
                    userId: fixture.id,
                    type: fixture.type.toUpperCase(),
                    email: fixture.email,
                    username: fixture.username,
                    password: fixture.password,
                    auth1: fixture.auth1,
                    auth2: fixture.auth2
                };

                // Cleaning social profile
                this.step = 'Cleaning social profile';

                let isClean =  socialProfiles.cleanUpSocialProfile(fixture.socialProfile.type, {
                    userId: fixture.socialProfile.userId
                });

                this.checkResponse(isClean, 'Social profile has been cleaned.');

                if (addSocial) {
                    let member = (global.member && global.member[0]) ? global.member[0] : (global.fixture && global.fixture[0]);

                    if (!member) {
                        throw new Error('No Hootsuite account. Call createUser before add social network.');
                    }

                    fixture.member = member;

                    this.step = 'Adding social network to Hootsuite member';

                    socialProfiles.addSocialProfile(fixture.socialProfile.userId,
                        fixture.socialProfile.username,
                        fixture.socialProfile.type,
                        fixture.socialProfile.auth1,
                        fixture.socialProfile.auth2,
                        {
                            memberId: fixture.member.memberId,
                            externalId: fixture.socialProfile.userId
                        })
                        .then(profile => {
                            this.checkResponse(profile, `Social profile ${fixture.socialProfile.username} has been added.`);
                            fixture.socialProfile.socialProfileId = profile.socialProfileId;
                            fixture.socialProfile.isSecurePost = profile.isSecurePost;
                            fixture.socialProfile.isReuathRequired = profile.isReuathRequired;
                        });
                }
            } else {
                fixture.isSocialProfile = false;
                fixture.customAccount = {};

                Object.assign(fixture.customAccount, locked.resource);

                if (fixture.type === 'enterprise') {
                    let organizationMembers = new OrganizationMembers(tops_skyline);

                    this.step = 'Checking user for existing Organizations';
                    let existingOrgs = await organizationMembers.getMemberOrgs(parseInt(fixture.memberId));

                    if (typeof existingOrgs !== 'object') {
                        console.log(`Failed to retrieve user organizations. Response: ${JSON.stringify(existingOrgs)}`);
                    }

                    if (existingOrgs.data.length > 0) {
                        let existingOrgData = Object.values(existingOrgs.data);

                        console.log(`Current member is in ${existingOrgData.length} orgs`);

                        existingOrgData.forEach((org) => {
                            console.log(` Org name: ${org.name} / Org Id: ${org.id} / Payment Member Id: ${org.paymentMemberId}`);
                        })
                    }
                }

                //Do not call tearDown() for dedicated enterprise users
                if (fixture.customAccount.isHootsuiteUser || fixture.type === 'enterprise') {
                    fixture.customAccount.requiresTearDown = false;
                    fixture.customAccount.requiresEmailChange = false;
                    fixture.customAccount.name = fixture.name;
                    if (!global.member) {
                        global.member = []
                    }
                    global.member.push(fixture.customAccount);
                }

                //If custom account does not have email, return the id instead.
                if (!locked.resource.email) {
                    fixture.customAccount.email = locked.resource.id;
                }
            }

            let displayEmail = fixture.isSocialProfile ? fixture.socialProfile.email : fixture.customAccount.email;
            /*let displayPassword = fixture.isSocialProfile ? fixture.socialProfile.password : fixture.customAccount.password;

            //TODO:Figure out how to differentiate pipeline vs local, for now print only email, update later is needed
            if (isPipeline) {
                console.log(!locked.resource !== undefined, `Only Email: ${displayEmail}`);
            }
            console.log(locked.resource !== undefined, `${displayEmail} / ${displayPassword}`); */

            console.log(!locked.resource !== undefined, `${displayEmail}`);

        } catch (err) {
            console.assert(false, `${this.step} ${err}`);
        } finally {
            //Update global storage with fixture array so that addSocialToOrg() & tearDown() can access it.
            if (!global.fixture) {
                global.fixture = []
            }
            global.fixture.push(fixture);
            this.emit('complete');
        }
            return this;
        }
    };

module.exports = getFixture;
