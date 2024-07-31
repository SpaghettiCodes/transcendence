import { redirect } from "../../router.js";
import { createButton, createInput } from "../../components/elements.js";
import { generateProfileInfo } from "../../components/generateProfileInfo.js";
import { generateList } from "../../components/generateList.js";
import { fetchMod } from "../../jwt.js";
import { createAlert } from "../../components/alert.js";
import { generateMatchHistory } from '../profile/components/matchHistory.js';
import drawPieChartData from '../profile/components/pieChartData.js';
import { createLoader } from "../../components/loader.js";

export default function template(prop = {}) {
    let friends, profile, matches ,friend, me, blockList, friendRequests;
	let searchParams = new URLSearchParams(window.location.search)
	let searching = searchParams.get('search')

    let prerender = async () => {
        try {
            const response = await fetchMod('https://localhost:8000/api/me');
            if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
            const user = await response.json();
            me = user;
            console.log('ME', user.username);
    
            const friendsResponse = await fetchMod('https://localhost:8000/api/player/' + user.username + '/friends');
            if (!friendsResponse.ok) throw new Error('Network response was not ok ' + friendsResponse.statusText);
            const friendlist = await friendsResponse.json();
    
            const randomUsers = await fetchMod('https://localhost:8000/api/player/random?number=5');
            if (!randomUsers.ok) throw new Error('Network response was not ok ' + randomUsers.statusText);
            let randomUsersData = await randomUsers.json();
    
            randomUsersData = randomUsersData.filter(randomUser => randomUser.username !== me.username);
    
            const mergedList = [...friendlist, ...randomUsersData];
            const uniqueMergedList = Array.from(new Set(mergedList.map(user => user.username)))
                                          .map(username => mergedList.find(user => user.username === username));

			let profileData = undefined
			let profileMatchData = undefined
			if (searching !== null) {
				try {
					const profileFetch = await fetchMod(`https://localhost:8000/api/player/${searching}`);
					if (!profileFetch.ok)
						throw profileFetch
					profileData = await profileFetch.json();
		
					const profileMatch = await fetchMod(`https://localhost:8000/api/player/${searching}/match`);
					profileMatchData = await profileMatch.json();
				} catch (response) {
					if (response.status === 404) {
						console.log('forget it')
						profileData = undefined
						profileMatchData = undefined
					}
				}
			}

			if (!profileData || !profileMatchData) {
				const profile = uniqueMergedList[0]
				const profileFetch = await fetchMod(`https://localhost:8000/api/player/${profile.username}`);
				profileData = await profileFetch.json();

				const profileMatch = await fetchMod(`https://localhost:8000/api/player/${profile.username}/match`);
				profileMatchData = await profileMatch.json();
			}

            const block = await fetchMod(`https://localhost:8000/api/player/${user.username}/blocked`);
            const blockList = await block.json();
            console.log(blockList);
    
            const Requests = await fetchMod(`https://localhost:8000/api/player/${user.username}/friends/request`);
            const friendRequests = await Requests.json();
            console.log('friendRequests', friendRequests);
    
            prop.data = { user: profileData, matches: profileMatchData, friends: uniqueMergedList, blocked: blockList, friendRequests: friendRequests };
            return true;
        } catch (error) {
            console.error('Fetch error:', error);
			if (error === 'redirected')
				return false
			history.back()
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
                <div class="list-section overflow-auto">
                    <div class="d-flex friend-list">
                    ${generateListContainer("Colleagues", "Colleagues' ID", "Search", generateFriendList(friends), true)}
                    </div>
                    <div class="d-flex blocked-list scrollable">
                        ${generateListContainer("Blocked Colleagues", "Blocked Colleagues' ID", "Search", generateBlockedList(blockList), false)}
                    </div>
                    <div class="d-flex friend-request-list scrollable">
                        ${generateListContainer("Colleague Requests", "Friend Requests' ID", "Search", generateFriendRequestList(friendRequests), false)}
                    </div>
                </div>
                <div class="d-flex flex-column profile-section overflow-y-auto">
                    <div class="d-flex flex-column profile-details overflow-y-auto">
                        ${generateUserProfile(profile, matches)}
                    </div>
                    <div class="d-flex buttons-bottom mt-2 gap-5 align-self-center">
                        ${createButton('btn btn-danger', 'button', 'Block', 'block')}
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

			
            const response = await fetchMod(`https://localhost:8000/api/player/${search}`);
            if (!response.ok) return createAlert('error', 'The user \'' + search + '\' does not exist');
            const user = await response.json();
            const userMatchHistoryResponse = await fetchMod(`https://localhost:8000/api/player/${user.username}/match`);
            const matchHistory = await userMatchHistoryResponse.json();
            const profileDetails = document.querySelector('.profile-details');
			profileDetails.innerHTML = createLoader();
			await sleep(1000);
            profileDetails.innerHTML = generateUserProfile(user, matchHistory);
            updateCharts(user, matchHistory);
            friend = user.username;
        });


        document.querySelector('.friend-list').addEventListener('click', async (e) => {
            if (e.target.classList.contains('friend-list-item')) {
                const friendName = e.target.innerText;
                console.log('Friend:', friendName);
    
                // Show loading indicator
                const profileDetails = document.querySelector('.profile-details');
                profileDetails.innerHTML = createLoader();
    
                try {
                    const response = await fetchMod(`https://localhost:8000/api/player/${friendName}`);
                    if (!response.ok) {
                        createAlert('error', 'The user \'' + friendName + '\' does not exist');
                        profileDetails.innerHTML = ''; // Clear loading indicator
                        return;
                    }
                    const friendProfile = await response.json();
                    const friendMatchHistoryResponse = await fetchMod(`https://localhost:8000/api/player/${friendProfile.username}/match`);
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
            if (e.target.classList.contains('unblock-button') || e.target.parentElement.classList.contains('unblock-button')) {
                const button = e.target.classList.contains('unblock-button') ? e.target : e.target.parentElement;
                const blockedUsername = button.dataset.username;
                console.log('Unblock:', blockedUsername);
                console.log('me', me);
        
                const response = await fetchMod(`https://localhost:8000/api/player/${me.username}/blocked`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body : JSON.stringify({
                        'target' : blockedUsername,
                    })
                });
        
                if (response.ok) {
                    createAlert('success', 'User ' + blockedUsername + ' unblocked successfully');
                    button.parentElement.remove();
                } else {
                    createAlert('error', 'An error occurred while unblocking user');
                }
            }
        });
        
        document.querySelector('.friend-request-list').addEventListener('click', async (e) => {
            console.log('clicked on friend request list')

            if (e.target.classList.contains('accept-button')) {
                const friendName = e.target.dataset.username;
                console.log('Accept:', friendName);
        
                const response = await fetchMod(`https://localhost:8000/api/player/${friendName}/friends/request`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'sender': me.username,
                    })
                });
        
                if (response.ok) {
                    createAlert('success', 'Friend request from ' + friendName + ' accepted successfully');
                    e.target.parentElement.remove();
                } else {
                    createAlert('error', 'An error occurred while accepting friend request');
                }
            } else if (e.target.classList.contains('decline-button')) {
                const friendName = e.target.dataset.username;
                console.log('Decline:', friendName);
        
                const response = await fetchMod(`https://localhost:8000/api/player/${friendName}/friends/request`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'sender': me.username,
                    })
                });
        
                if (response.ok) {
                    createAlert('success', 'Friend request from ' + friendName + ' declined successfully');
                    e.target.parentElement.remove();
                } else {
                    createAlert('error', 'An error occurred while declining friend request');
                }
            }
        });
        
        

        document.getElementById('block').addEventListener('click', async (e) => {
            console.log('Block button clicked', friend);
            
            const response = await fetchMod(`https://localhost:8000/api/player/${me.username}/blocked`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'target': friend,
                })
            });
        
            if (response.ok) {
                createAlert('success', 'User ' + friend + ' blocked successfully');
        
                const blockListContainer = document.querySelector('.blocked-list .d-flex.flex-column.flex-grow-1.overflow-auto.mt-2.p-2');
                const newBlockedItem = document.createElement('div');
                newBlockedItem.classList.add('blocked-list-item');
                newBlockedItem.innerHTML = `
                    ${friend}
                    ${createButton('btn btn-danger unblock-button', 'button', 'Unblock', '', { username: friend })}
                `;
                blockListContainer.appendChild(newBlockedItem);
            } else {
                if (response.status === 409) {
                    createAlert('info', 'User ' + friend + ' already blocked');
                } else {
                    createAlert('error', 'An error occurred while blocking user');
                    throw new Error('Error :' + response.statusText);
                }
            }
        });

        document.getElementById('request').addEventListener('click', async (e) => {
            console.log('Send Friend Request button clicked');

			console.log('the friend to send friend request', friend);

			const response = await fetchMod(`https://localhost:8000/api/player/${friend}/friends/request`, {
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
				if (response.status === 409) {
					let errMsg = await response.json()
					return createAlert('info', errMsg.error);
				} else if (response.status === 400) {
					let errMsg = await response.json()
					return createAlert('error', errMsg.error);						
				}
				createAlert('error', `Error occured while sending friend request: ${response.status}`)
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
            const matchHistoryResponse = await fetchMod(`https://localhost:8000/api/player/${user.username}/match`);
            const matchHistory = await matchHistoryResponse.json();
            updateCharts(user, matchHistory);
        }
        
        document.querySelectorAll('.unblock-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                const blockedUsername = button.dataset.username;
                console.log('Unblock:', blockedUsername);
                console.log('me', me);
    
                const response = await fetchMod(`https://localhost:8000/api/player/${me.username}/blocked`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'target': blockedUsername,
                    })
                });
    
                if (response.ok) {
                    createAlert('success', 'User ' + blockedUsername + ' unblocked successfully');
                    button.parentElement.remove();
                } else {
                    createAlert('error', 'An error occurred while unblocking user');
                }
            });
        });
    
        document.querySelectorAll('.accept-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                const friendName = button.dataset.username;
                console.log('Accept:', friendName);
        
                const response = await fetchMod(`https://localhost:8000/api/player/${friendName}/friends/request`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'sender': me.username,
                    })
                });
        
                if (response.ok) {
                    createAlert('success', 'Friend request from ' + friendName + ' accepted successfully');
                    button.closest('.friend-request-list-item').remove(); // Remove the entire list item
                } else {
                    createAlert('error', 'An error occurred while accepting friend request');
                }
            });
        });
        
        document.querySelectorAll('.decline-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                const friendName = button.dataset.username;
                console.log('Decline:', friendName);
        
                const response = await fetchMod(`https://localhost:8000/api/player/${friendName}/friends/request`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'sender': me.username,
                    })
                });
        
                if (response.ok) {
                    createAlert('success', 'Friend request from ' + friendName + ' declined successfully');
                    button.closest('.friend-request-list-item').remove(); // Remove the entire list item
                } else {
                    createAlert('error', 'An error occurred while declining friend request');
                }
            });
        });
        
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
        <div class="flex-grow-1 d-flex flex-column list-container overflow-auto">
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
