import { fetchMe, fetchProfile, fetchMatchHistory, blockUser, unblockUser, sendFriendRequest, acceptFriendRequest, declineFriendRequest } from './fetchData.js';
import { createAlert } from "../../../components/alert.js";
import { createLoader } from "../../../components/loader.js";
import { generateUserProfile, updateCharts } from './friendListUI.js';
import { createButton } from '../../../components/elements.js';

export function addEventListeners(prop, me, friend) {
    document.getElementById('search').addEventListener('click', async (e) => {
        const inputBox = document.getElementById('searchInputBox');
        const search = inputBox.value;
        console.log('Search:', search);

        try {
            const user = await fetchProfile(search);
            const matchHistory = await fetchMatchHistory(user.username);
            const profileDetails = document.querySelector('.profile-details');
            profileDetails.innerHTML = createLoader();
            await sleep(1000);
            profileDetails.innerHTML = generateUserProfile(user, matchHistory);
            updateCharts(user, matchHistory);
            friend = user;
        } catch (error) {
            createAlert('error', 'The user \'' + search + '\' does not exist');
        }
    });

    document.querySelector('.friend-list').addEventListener('click', async (e) => {
        if (e.target.classList.contains('friend-list-item')) {
            const friendName = e.target.innerText;
            console.log('Friend:', friendName);

            // Show loading indicator
            const profileDetails = document.querySelector('.profile-details');
            profileDetails.innerHTML = createLoader();

            try {
                const friendProfile = await fetchProfile(friendName);
                const matchHistory = await fetchMatchHistory(friendProfile.username);

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

            const response = await unblockUser(me.username, blockedUsername);

            if (response.ok) {
                createAlert('success', 'User ' + blockedUsername + ' unblocked successfully');
                button.parentElement.remove();
            } else {
                createAlert('error', 'An error occurred while unblocking user');
            }
        }
    });

    document.querySelector('.friend-request-list').addEventListener('click', async (e) => {
        if (e.target.classList.contains('accept-button')) {
            const friendName = e.target.dataset.username;
            console.log('Accept:', friendName);

            const response = await acceptFriendRequest(me.username, friendName);

            if (response.ok) {
                createAlert('success', 'Friend request from ' + friendName + ' accepted successfully');
                e.target.parentElement.remove();
            } else {
                createAlert('error', 'An error occurred while accepting friend request');
            }
        } else if (e.target.classList.contains('decline-button')) {
            const friendName = e.target.dataset.username;
            console.log('Decline:', friendName);

            const response = await declineFriendRequest(me.username, friendName);

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

        const response = await blockUser(me.username, friend);

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

        const response = await sendFriendRequest(me.username, friend);

        if (response.ok) return createAlert('success', 'Friend request to ' + friend + ' sent successfully');
        if (!response.ok) {
            if (response.status === 409) return createAlert('info', 'Friend request to ' + friend + ' already sent');
            createAlert('error', 'An error occurred while sending friend request');
            throw new Error('Error :' + response.statusText);
        }
    });

    document.querySelectorAll('.unblock-button').forEach(button => {
        button.addEventListener('click', async (e) => {
            const blockedUsername = button.dataset.username;
            console.log('Unblock:', blockedUsername);

            const response = await unblockUser(me.username, blockedUsername);

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

            const response = await acceptFriendRequest(me.username, friendName);

            if (response.ok) {
                createAlert('success', 'Friend request from ' + friendName + ' accepted successfully');
                button.parentElement.remove();
            } else {
                createAlert('error', 'An error occurred while accepting friend request');
            }
        });
    });

    document.querySelectorAll('.decline-button').forEach(button => {
        button.addEventListener('click', async (e) => {
            const friendName = button.dataset.username;
            console.log('Decline:', friendName);

            const response = await declineFriendRequest(me.username, friendName);

            if (response.ok) {
                createAlert('success', 'Friend request from ' + friendName + ' declined successfully');
                button.parentElement.remove();
            } else {
                createAlert('error', 'An error occurred while declining friend request');
            }
        });
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
