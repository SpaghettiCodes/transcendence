import { createButton, createInput } from "../../../components/elements.js";
import { createLoader } from "../../../components/loader.js";
import { createAlert } from "../../../components/alert.js";
import { generateProfileInfo } from "../../../components/generateProfileInfo.js";
import { generateList } from "../../../components/generateList.js";
import { generateMatchHistory } from '../../profile/components/matchHistory.js';
import drawPieChartData from '../../profile/components/pieChartData.js';

export function generateListContainer(title, inputPlaceholder, buttonLabel, listContent, includeSearch = true) {
    return `
        <div class="d-flex flex-column list-container overflow-auto">
            <h4>${title}</h4>
            ${includeSearch ? `
            <div class="input-group">
                ${createInput("form-control rounded", "search", `${title.toLowerCase()}SearchInputBox`, "", inputPlaceholder)}
                ${createButton('btn btn-dark', 'button', buttonLabel, 'search')}
            </div>
            ` : ''}
            <div class="d-flex flex-column flex-grow-1 overflow-auto mt-2 p-2">
                ${listContent}
            </div>
        </div>
    `;
}

export function generateFriendList(friends) {
    return generateList(friends, friend => `<div class="friend-list-item">${friend.username}</div>`);
}

export function generateBlockedList(blockedUsers) {
    return generateList(blockedUsers, blocked => `
        <div class="blocked-list-item">
            <span>${blocked.username}</span>
            ${createButton('btn btn-danger unblock-button', 'button', 'Unblock', '', { username: blocked.username })}
        </div>
    `);
}

export function generateFriendRequestList(requests) {
    const { received, sent } = requests;
    return generateList(received, request => `
        <div class="friend-request-list-item">
            ${request.sender}
            ${createButton('btn btn-primary accept-button', 'button', 'Accept', '', { 'username': request.sender })}
            ${createButton('btn btn-danger decline-button', 'button', 'Decline', '', { 'username': request.sender })}
        </div>
    `);
}

export function generateUserProfile(profile, matches = []) {
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

export function updateCharts(profile, matchHistory) {
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
