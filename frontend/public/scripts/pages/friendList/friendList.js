import { generateListContainer, generateFriendList, generateBlockedList, generateFriendRequestList, generateUserProfile, updateCharts } from './components/friendListUI.js';
import { addEventListeners } from './components/eventHandlers.js';
import { fetchMe, fetchFriends, fetchRandomUsers, fetchProfile, fetchMatchHistory, fetchBlockedUsers, fetchFriendRequests } from './components/fetchData.js';
import { createButton } from '../../components/elements.js';

export default function template(prop = {}) {
    let friends, profile, matches, friend, me, blockList, friendRequests;
    
    let prerender = async () => {
        try {
            const userResponse = await fetchMe();
            me = userResponse;
            console.log('ME', userResponse.username);
    
            const friendsResponse = await fetchFriends(userResponse.username);
            let randomUsers = await fetchRandomUsers();
    
            randomUsers = randomUsers.filter(user => user.username !== me.username);

            const mergedList = [...friendsResponse, ...randomUsers];
            const uniqueMergedList = Array.from(new Set(mergedList.map(user => user.username)))
                                          .map(username => mergedList.find(user => user.username === username));
    
            const profile = uniqueMergedList[0];
            const profileData = await fetchProfile(profile.username);
            const profileMatchData = await fetchMatchHistory(profile.username);
    
            const blockList = await fetchBlockedUsers(userResponse.username);
            console.log(blockList);
    
            const friendRequests = await fetchFriendRequests(userResponse.username);
            console.log('friendRequests', friendRequests);
    
            prop.data = { user: profileData, matches: profileMatchData, friends: uniqueMergedList, blocked: blockList, friendRequests: friendRequests };
            return true;
        } catch (error) {
            console.error('Fetch error:', error);
            return false;
        }
    };
       

    let render_code = () => {
        profile = prop.data.user;
        matches = prop.data.matches;
        friends = prop.data.friends;
        blockList = prop.data.blocked;
        friendRequests = prop.data.friendRequests;
        friend = profile.username;
    
        return `
            <div class="d-flex flex-row flex-grow-1 align-self-stretch overflow-auto">
                <div class="d-flex flex-column list-section overflow-auto">
                    <div class="friend-list">
                        ${generateListContainer("Colleagues", "Colleagues' ID", "Search", generateFriendList(friends), true)}
                    </div>
                    <div class="blocked-list">
                        ${generateListContainer("Blocked Users", "Blocked Colleagues' ID", "Search", generateBlockedList(blockList), false)}
                    </div>
                    <div class="friend-request-list">
                        ${generateListContainer("Friend Requests", "Friend Requests' ID", "Search", generateFriendRequestList(friendRequests), false)}
                    </div>
                </div>
                <div class="d-flex flex-column profile-section overflow-auto">
                    <div class="profile-details">
                        ${generateUserProfile(profile, matches)}
                    </div>
                    <div class="buttons-bottom">
                        ${createButton('btn btn-danger', 'button', 'Block', 'block')}
                        ${createButton('btn btn-primary', 'button', 'Send Friend Request', 'request')}
                    </div>
                </div>
            </div>
        `;
    }

    let postrender = async () => {
        addEventListeners(prop, me, friend);

        const user = prop.data.user;
        if (user) {
            const matchHistoryResponse = await fetchMatchHistory(user.username);
            updateCharts(user, matchHistoryResponse);
        }
    }

    let cleanup = () => {}

    return [prerender, render_code, postrender, cleanup]
}
