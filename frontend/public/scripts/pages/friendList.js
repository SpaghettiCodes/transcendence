import { redirect } from "../router.js";
import { createButton, createInput } from "../components/elements.js";
import { generateProfileInfo } from "../components/generateProfileInfo.js";
import { generateList } from "../components/generateList.js";
import { fetchMod } from "../jwt.js";
import { createAlert } from "../components/alert.js";
import { generateMatchHistory } from './profile/components/matchHistory.js';
import drawPieChartData from './profile/components/pieChartData.js';

//TODO 1. Fetch friend list from backend
//TODO 2. Display friend list
//TODO 3. For post-render, when clicked on specific user, call api 
// 		to fetch the specific user's profile, and display it in ${generateProfileInfo(profile)}

export default function template(prop = {}) {
    let friends, profile, friend;

    let prerender = async () => {
        try {
            const response = await fetchMod('http://localhost:8000/api/me');
            if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
            const user = await response.json();
            const friendsResponse = await fetchMod('http://localhost:8000/api/player/' + user.username + '/friends');
            if (!friendsResponse.ok) throw new Error('Network response was not ok ' + friendsResponse.statusText);
            const friendlist = await friendsResponse.json();
            prop.data = { user, friendlist };
            return true;
        } catch (error) {
            console.error('Fetch error:', error);
            return false;
        }
    };

    let render_code = () => {
        ({ friends = [], profile = {} } = prop.data || {});
        return `
            <h1 class="title text-center text-white">Colleagues</h1>
            <div class="d-flex flex-row flex-grow-1 align-self-stretch overflow-auto">
                <div class="d-flex flex-column friend-list overflow-auto">
                    <h4>Colleagues</h4>
                    <div class="input-group">
                        ${createInput("form-control rounded", "search", "searchInputBox", "", "Colleagues' ID")}
                        ${createButton('btn btn-dark', 'button', 'Search', 'search')}
                    </div>
                    <div dir="rtl" class="d-flex flex-column flex-grow-1 overflow-auto mt-2 p-2">
                        ${generateFriendList(friends)}
                    </div>
                </div>
                <div class="d-flex flex-column flex-grow-1 p-3 overflow-auto profile-details">
                    ${generateUserProfile(profile)}
                </div>
                <div class="buttons-bottom">
                    ${createButton('btn btn-success', 'button', 'Block', 'block')}
                    ${createButton('btn btn-danger', 'button', 'Invite', 'invite')}
                    ${createButton('btn btn-primary', 'button', 'Send Friend Request', 'request')}
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
            console.log('User:', user);
            const userMatchHistoryResponse = await fetchMod(`http://localhost:8000/api/player/${user.username}/match`);
            const matchHistory = await userMatchHistoryResponse.json();
            console.log('Match History:', matchHistory);
            const profileDetails = document.querySelector('.profile-details');
            profileDetails.innerHTML = generateUserProfile(user, matchHistory);
            friend = user;
            updateCharts(user, matchHistory);
        });

        document.querySelector('.friend-list').addEventListener('click', async (e) => {
            if (e.target.classList.contains('friend-list-item')) {
                const friendName = e.target.innerText;
                console.log('Friend:', friendName);

                const response = await fetchMod(`http://localhost:8000/api/player/${friendName}`);
                if (!response.ok) return createAlert('error', 'The user \'' + friendName + '\' does not exist');
                const friendProfile = await response.json();
                console.log('Friend Profile:', friendProfile);
                const friendMatchHistoryResponse = await fetchMod(`http://localhost:8000/api/player/${friendProfile.username}/match`);
                const matchHistory = await friendMatchHistoryResponse.json();
                console.log('Friend Match History:', matchHistory);
                const profileDetails = document.querySelector('.profile-details');
                profileDetails.innerHTML = generateUserProfile(friendProfile, matchHistory);
                updateCharts(friendProfile, matchHistory);
            }
        });

        document.getElementById('block').addEventListener('click', (e) => {
            console.log('Block button clicked', friend);
            // call the api here to block the user
        });

        document.getElementById('invite').addEventListener('click', (e) => {
            console.log('Invite button clicked');
            // call the api here to invite the user
        });

        document.getElementById('request').addEventListener('click', (e) => {
            console.log('Send Friend Request button clicked');
            // call the api here to send friend request
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
    return generateList(friends, friend => `<div class="friend-list-item">${friend}</div>`);
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
