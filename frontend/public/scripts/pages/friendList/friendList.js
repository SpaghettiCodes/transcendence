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
                <div class="d-flex flex-column list-section">
                    <div class="friend-list">
                        ${generateListContainer("Colleagues", "Colleagues' ID", "Search", generateFriendList(friends), true)}
                    </div>
                    <div class="blocked-list scrollable">
                        ${generateListContainer("Blocked Colleagues", "Blocked Colleagues' ID", "Search", generateBlockedList(blockList), false)}
                    </div>
                    <div class="friend-request-list scrollable">
                        ${generateListContainer("Colleague Requests", "Friend Requests' ID", "Search", generateFriendRequestList(friendRequests), false)}
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

function generateFriendList(friends) {
    return generateList(friends, friend => `<div class="friend-list-item">${friend.username}</div>`);
}


function generateBlockedList(blockedUsers) {
    return generateList(blockedUsers, blocked => `
        <div class="blocked-list-item">
            <span>${blocked.username}</span>
            ${createButton('btn btn-danger unblock-button', 'button', 'Unblock', '', { username: blocked.username })}
        </div>
    `);
}

function generateFriendRequestList(requests) {
    const { received, sent } = requests;
    return generateList(received, request => `
        <div class="friend-request-list-item">
            <span>${request.sender}</span>
            <div class="button-container">
                ${createButton('btn btn-primary accept-button btn-sm', 'button', 'Accept', '', { 'username': request.sender })}
                ${createButton('btn btn-danger decline-button btn-sm', 'button', 'Decline', '', { 'username': request.sender })}
            </div>
        </div>
    `);
}

function generateUserProfile(profile, matches = []) {
    return `
    <div class="d-flex justify-content-center flex-grow-1 gap-5 text-white overflow-y-hidden profile p-4">
        <div class='d-flex flex-column overflow-y-auto gap-1 profile-stuff'>
            <div class="profile-info p-3">
                ${generateProfileInfo(profile)}
            </div>
            <div class="d-flex flex-column match-history flex-grow-1 overflow-y-auto p-3 rounded">
                <h3>Match History</h3>
                <div class="d-flex overflow-y-auto tab-content mt-3 tab-pane fade show active" id="recent" role="tabpanel" aria-labelledby="recent-tab" id="matchHistoryTabContent">
                    <ul class="d-flex w-100 flex-column overflow-y-auto list-group">
                        ${generateMatchHistory(matches)}
                    </ul>
                </div>
            </div>
        </div>
        <div class="d-flex flex-column chartArea scroll-y-auto">
            <div class="chartBox1">
                <canvas id="myChart1"></canvas>
            </div>
            <div class="chartBox2">
                <canvas id="myChart2"></canvas>
            </div>
            <div class="chartBox3">
                <canvas id="myChart3"></canvas>
            </div>
        </div>
    </div>
    `;
}

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

function generateListContainer(title, inputPlaceholder, buttonLabel, listContent, includeSearch = true) {
    return `
        <div class="d-flex flex-column list-container overflow-auto">
            <h4>${title}</h4>
            ${includeSearch ? `
            <div class="input-group">
                ${createInput("form-control rounded", "search", 'searchInputBox', "", inputPlaceholder)}
                ${createButton('btn btn-dark', 'button', buttonLabel, 'search')}
            </div>
            ` : ''}
            <div class="d-flex flex-column flex-grow-1 overflow-auto mt-2 p-2">
                ${listContent}
            </div>
        </div>
    `;
}
