const events = require('events');
const MemberService = require('hsapi').memberService;
const SocialProfiles = require('hsapi').som;
const Teams = require('hsapi').teamsService;
const TeamMembers = require('hsapi').teamMembersService;
const Organization = require('hsapi').organizationsService;
const OrganizationMembers = require('hsapi').organizationMembersService;

const { som_bridge, broker_member_service, tops_skyline, testOrgPrefix, isOrgSafeToDelete, hasResponseErrors } = require('../globals.js');
const { use: { longTimeout } } = require('../playwright.config.js');

/**
 * @param {function}   callback     Used to return a locked account
 *
 * @return {function}  this         Returns itself for chaning commands
 */

class tearDown extends events.EventEmitter {
    constructor() {
        super();
        this.step = '';
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
                if (!hasResponseErrors(r)) {
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

    async command() {

        try {
            let memberService = new MemberService(broker_member_service);
            let socialProfiles = new SocialProfiles(som_bridge);
            let teams = new Teams(tops_skyline);
            let teamMembers = new TeamMembers(tops_skyline);
            let organization = new Organization(tops_skyline);
            let organizationMembers = new OrganizationMembers(tops_skyline);

            let users = (global.member && global.member[0]) ? global.member[0] : (global.fixture && global.fixture[0]);
            if (users.customAccount) {
                users = [users.customAccount];
            } else {
                users = [users];
            }
            //Set default values for fixtures & orgs
            let fixtures = global.fixture ? global.fixture : [];
            let orgs = global.organization ? global.organization :  [] ;

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
                let cancelledMembers = Promise.all(cancelledUsers);

                this.checkResponse(cancelledMembers, 'All Hootsuite users have been cancelled.');
            }

            this.step = 'Cleaning Social Profiles';
            let cleanedProfiles = fixtures.filter(requiresSocialProfileCleanup).map((fixture) => {
                return socialProfiles.cleanUpSocialProfile(fixture.socialProfile.type, {
                    userId: fixture.socialProfile.userId
                });
            });

            if (cleanedProfiles.length > 0) {
                let cleaned = Promise.all(cleanedProfiles);

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

            this.step = 'Check for teams and orgs';
            // Build array of teams, organizations, and members that need to be cleaned up.
            let tms = [];
            let ots = [];
            let oms = [];
            orgs.forEach((o) => {
                o.teams.forEach((t) => {
                    ots.push(t);
                    t.members.forEach((m) => {
                        // Do not delete the payment member of the organization.
                        if (m.memberId !== o.paymentMemberId) {
                            oms.push({
                                org: o,
                                member: m
                            });
                        }
                        tms.push({
                            team: t,
                            member: m
                        });
                    });
                });
            });

            this.step = 'Removing Team Members';
            let removedTeamMembers = tms.map((tm) => {
                return teamMembers.removeTeamMember(
                    parseInt(tm.member.memberId), parseInt(tm.team.id), parseInt(tm.team.createdUser));
            });

            if (removedTeamMembers.length > 0) {
                let removed = await Promise.all(removedTeamMembers);

                this.checkResponse(removed, 'All Hootsuite team members have been removed.');
            }

            this.step = 'Removing Teams';
            let removedTeams = ots.map((ot) => {
                return teams.removeTeam(ot.createdUser, ot.id);
            });

            if (removedTeams.length > 0) {
                let removed = await Promise.all(removedTeams);

                this.checkResponse(removed, 'All Hootsuite teams have been removed.');
            }

            this.step = 'Removing Organization Members';
            let removedOrgMembers = oms.map((om) => {
                return organizationMembers.deleteOrganizationMember(om.org.paymentMemberId,
                    om.member.memberId, om.org.id);
            });

            if (removedOrgMembers.length > 0) {
                let removed = await Promise.all(removedOrgMembers);

                this.checkResponse(removed, 'All Hootsuite organization members have been removed.');
            }

            this.step = 'Deleting Organizations';
            let deletedOrgs = orgs.map((org) => {
                if (isOrgSafeToDelete(org, org.pwTestMemberId, testOrgPrefix)) {
                    console.log(`Deleting Org ${org.name}: / Org Id: ${org.id} / Payment Member Id: ${org.paymentMemberId}`);
                    return organization.deleteOrganization(org.id, org.pwTestMemberId);
                }else {
                    throw new Error(`Org safety check failed: Skipping org ${org.id} deletion`);
                }
            });

            if (deletedOrgs.length > 0) {
                let deleted = await Promise.all(deletedOrgs);

                this.checkResponse(deleted, 'All Hootsuite temporary organizations have been deleted.');
            }
        } catch (err) {
            console.log('\nERROR', this.step, ':', err, '\n');
        } finally {
            clearTimeout(this.tearDownTimeout);
            //Clean up global storage
            global.member = [];
            global.fixture = [];
            global.organization = [];
            this.emit('Complete')
        }
    }
};

module.exports = tearDown;
