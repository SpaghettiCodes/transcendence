import { redirect } from "../../router.js";
import { createButton, createInput } from "../../components/elements.js";
import { generateProfileInfo } from "../../components/generateProfileInfo.js";
import { generateList } from "../../components/generateList.js";
import { fetchMod } from "../../jwt.js";
import { createAlert } from "../../components/alert.js";
import { generateMatchHistory } from '../profile/components/matchHistory.js';
import drawPieChartData from '../profile/components/pieChartData.js';
import { createLoader } from "../../components/loader.js";


// TODO - create a div for blocked list that show all the block
// TODO - create a div for friend request that show all the friend request

export default function template(prop = {}) {
    let friends, profile, matches ,friend, me, blockList, friendRequests;

    let prerender = async () => {
        try {
			const response = await fetchMod('http://localhost:8000/api/me');
			if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
			const user = await response.json();
			me = user;
			console.log('ME', user.username)
			const friendsResponse = await fetchMod('http://localhost:8000/api/player/' + user.username + '/friends');
			if (!friendsResponse.ok) throw new Error('Network response was not ok ' + friendsResponse.statusText);
			const friendlist = await friendsResponse.json();
		
			const randomUsers = await fetchMod('http://localhost:8000/api/player/random?number=5');
			if (!randomUsers.ok) throw new Error('Network response was not ok ' + randomUsers.statusText);
			const randomUsersData = await randomUsers.json();
		
			const mergedList = [...friendlist, ...randomUsersData];
			
			const profile = Object.values(mergedList)[0];
			const profileFetch = await fetchMod(`http://localhost:8000/api/player/${profile.username}`);
			const profileData = await profileFetch.json();

			const profileMatch = await fetchMod(`http://localhost:8000/api/player/${profile.username}/match`);
			const profileMatchData = await profileMatch.json();

			const block = await fetchMod(`http://localhost:8000/api/player/${user.username}/blocked`);
			const blockList = await block.json();
			console.log(blockList);

            const Requests = await fetchMod(`http://localhost:8000/api/player/${user.username}/friends/request`);
            const friendRequests = await Requests.json();
            console.log('friendResquests', friendRequests);

			 prop.data = { user: profileData, matches: profileMatchData, friends: mergedList, blocked: blockList, friendRequests : friendRequests};
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
        friendRequests = prop.data.friendRequests; // Add this line to handle friend requests
        friend = profile.username;
    
        return `
            <div class="d-flex flex-row flex-grow-1 align-self-stretch overflow-auto">
                <div class="d-flex flex-column list-section overflow-auto">
                    <div class="friend-list">
                        ${generateListContainer("Colleagues", "Colleagues' ID", "Search", generateFriendList(friends))}
                    </div>
                    <div class="blocked-list">
                        ${generateListContainer("Blocked Users", "Blocked Colleagues' ID", "Search", generateBlockedList(blockList))}
                    </div>
                    <div class="friend-request-list">
                        ${generateListContainer("Friend Requests", "Friend Requests' ID", "Search", generateFriendRequestList(friendRequests))}
                    </div>
                </div>
                <div class="d-flex flex-column profile-section overflow-auto">
                    <div class="profile-details">
                        ${generateUserProfile(profile, matches)}
                    </div>
                    <div class="buttons-bottom">
                        ${createButton('btn btn-success', 'button', 'Block', 'block')}
                        ${createButton('btn btn-danger', 'button', 'Invite', 'invite')}
                        ${createButton('btn btn-primary', 'button', 'Send Friend Request', 'request')}
                    </div>
                </div>
            </div>
        `;
    }
    

    let postrender = async () => {
        const user = prop.data.user;

        document.getElementById('search').addEventListener('click', async (e) => {
            const inputBox = document.getElementById('searchInputBox');
            const search = inputBox.value;
            console.log('Search:', search);

			
            const response = await fetchMod(`http://localhost:8000/api/player/${search}`);
            if (!response.ok) return createAlert('error', 'The user \'' + search + '\' does not exist');
            const user = await response.json();
            const userMatchHistoryResponse = await fetchMod(`http://localhost:8000/api/player/${user.username}/match`);
            const matchHistory = await userMatchHistoryResponse.json();
            const profileDetails = document.querySelector('.profile-details');
			profileDetails.innerHTML = createLoader();
			await sleep(1000);
            profileDetails.innerHTML = generateUserProfile(user, matchHistory);
            updateCharts(user, matchHistory);
            friend = user;
        });


        document.querySelector('.friend-list').addEventListener('click', async (e) => {
            if (e.target.classList.contains('friend-list-item')) {
                const friendName = e.target.innerText;
                console.log('Friend:', friendName);
    
                // Show loading indicator
                const profileDetails = document.querySelector('.profile-details');
                profileDetails.innerHTML = createLoader();
    
                try {
                    const response = await fetchMod(`http://localhost:8000/api/player/${friendName}`);
                    if (!response.ok) {
                        createAlert('error', 'The user \'' + friendName + '\' does not exist');
                        profileDetails.innerHTML = ''; // Clear loading indicator
                        return;
                    }
                    const friendProfile = await response.json();
                    const friendMatchHistoryResponse = await fetchMod(`http://localhost:8000/api/player/${friendProfile.username}/match`);
                    const matchHistory = await friendMatchHistoryResponse.json();
    
                    // Update profile details and charts
                    profileDetails.innerHTML = generateUserProfile(friendProfile, matchHistory);
                    updateCharts(friendProfile, matchHistory);
                    friend = friendProfile.username;
                } catch (error) {
                    console.error('Error fetching data:', error);
                    createAlert('error', 'An error occurred while fetching data');
                    profileDetails.innerHTML = ''; // Clear loading indicator
                }
            }
        });

        document.querySelector('.blocked-list').addEventListener('click', async (e) => {
            if (e.target.classList.contains('unblock-button')) {
                const blockedUsername = e.target.dataset.username;
                console.log('Unblock:', blockedUsername);
    
                const response = await fetchMod(`http://localhost:8000/api/player/${me.username}/blocked/${blockedUsername}`, {
                    method: 'DELETE',
                });
    
                if (response.ok) {
                    createAlert('success', 'User ' + blockedUsername + ' unblocked successfully');
                    e.target.parentElement.remove();
                } else {
                    createAlert('error', 'An error occurred while unblocking user');
                }
            }
        });

        document.querySelector('.friend-request-list').addEventListener('click', async (e) => {
            if (e.target.classList.contains('accept') || e.target.classList.contains('decline')) {
                const requestUsername = e.target.dataset.username;
                const action = e.target.classList.contains('accept') ? 'accept' : 'decline';
                console.log(`${action.charAt(0).toUpperCase() + action.slice(1)} friend request:`, requestUsername);

                const endpoint = action === 'accept'
                    ? `http://localhost:8000/api/player/${me.username}/friends/${requestUsername}/accept`
                    : `http://localhost:8000/api/player/${me.username}/friends/${requestUsername}/decline`;

                const response = await fetchMod(endpoint, { method: 'POST' });

                if (response.ok) {
                    createAlert('success', `Friend request from ${requestUsername} ${action}ed successfully`);
                    e.target.parentElement.remove();
                } else {
                    createAlert('error', `An error occurred while ${action}ing friend request`);
                }
            }
        });

        document.getElementById('block').addEventListener('click', async (e) => {
            console.log('Block button clicked', friend);
            // call the api here to block the user

			console.log('the friend to block', friend);

			const response = await fetchMod(`http://localhost:8000/api/player/${me.username}/blocked`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body : JSON.stringify({
					'target' : friend,
				})
			});

			if (response.ok) return createAlert('success', 'User ' + friend + ' blocked successfully');
			if (!response.ok) {
				if (response.status === 409) return createAlert('info', 'User ' + friend + ' already blocked');
				createAlert('error', 'An error occurred while blocking user');
				throw new Error('Error :' + response.statusText);
			}
        });

        document.getElementById('invite').addEventListener('click', (e) => {
            console.log('Invite button clicked');
            // call the api here to invite the user

			console.log('the friend to invite', friend);

			//rediect to chat with this user 
			return redirect('/chat/' + friend);
        });

        document.getElementById('request').addEventListener('click', async (e) => {
            console.log('Send Friend Request button clicked');
            // call the api here to send friend request

			console.log('the friend to send friend request', friend);

			const response = await fetchMod(`http://localhost:8000/api/player/${friend}/friends/request`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body : JSON.stringify({
					'sender' : me.username,
				})
			});

			if (response.ok) return createAlert('success', 'Friend request to ' + friend + ' sent successfully');
			if (!response.ok) {
				if (response.status === 409) return createAlert('info', 'Friend request to ' + friend + ' already sent');
				createAlert('error', 'An error occurred while sending friend request');
				throw new Error('Error :' + response.statusText);
			}
        });

        const updateCharts = (profile, matchHistory) => {
            const { pong_matches_won, pong_matches_lost, apong_matches_won, apong_matches_lost, tournament_won, tournament_lost } = profile;
            drawPieChartData(document.getElementById('myChart1'), {
                labels: ['Losses', 'Wins'],
                rawData: [pong_matches_lost, pong_matches_won],
                id: 'pong',
                gameName: 'Pong'
            });
            drawPieChartData(document.getElementById('myChart2'), {
                labels: ['Losses', 'Wins'],
                rawData: [apong_matches_lost, apong_matches_won],
                id: 'apong',
                gameName: 'APong'
            });
            drawPieChartData(document.getElementById('myChart3'), {
                labels: ['Losses', 'Wins'],
                rawData: [tournament_lost, tournament_won],
                id: 'tournament',
                gameName: 'Tournaments'
            });
        }

        if (user) {
            const matchHistoryResponse = await fetchMod(`http://localhost:8000/api/player/${user.username}/match`);
            const matchHistory = await matchHistoryResponse.json();
            updateCharts(user, matchHistory);
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
            ${blocked.username}
            ${createButton('btn btn-danger unblock-button', 'button', 'Unblock', 'unblock', { 'data-username': blocked.username })}
        </div>
    `);
}

function generateFriendRequestList(requests) {
    const { received, sent } = requests;
    return generateList(received, request => `
        <div class="friend-request-list-item">
            ${request.sender}
            ${createButton('btn btn-primary accept-button', 'button', 'Accept', 'accept', { 'data-username': request.sender })}
            ${createButton('btn btn-danger decline-button', 'button', 'Decline', 'decline', { 'data-username': request.sender })}
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

function generateListContainer(title, inputPlaceholder, buttonLabel, listContent) {
    return `
        <div class="d-flex flex-column list-container overflow-auto">
            <h4>${title}</h4>
            <div class="input-group">
                ${createInput("form-control rounded", "search", `${title.toLowerCase()}SearchInputBox`, "", inputPlaceholder)}
                ${createButton('btn btn-dark', 'button', buttonLabel, 'search')}
            </div>
            <div class="d-flex flex-column flex-grow-1 overflow-auto mt-2 p-2">
                ${listContent}
            </div>
        </div>
    `;
}
