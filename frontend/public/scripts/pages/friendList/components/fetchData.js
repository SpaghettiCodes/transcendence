import { fetchMod } from "../../../jwt.js";

export async function fetchMe() {
    const response = await fetchMod('http://localhost:8000/api/me');
    if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
    return response.json();
}

export async function fetchFriends(username) {
    const response = await fetchMod(`http://localhost:8000/api/player/${username}/friends`);
    if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
    return response.json();
}

export async function fetchRandomUsers() {
    const response = await fetchMod('http://localhost:8000/api/player/random?number=5');
    if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
    return response.json();
}

export async function fetchProfile(username) {
    const response = await fetchMod(`http://localhost:8000/api/player/${username}`);
    if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
    return response.json();
}

export async function fetchMatchHistory(username) {
    const response = await fetchMod(`http://localhost:8000/api/player/${username}/match`);
    if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
    return response.json();
}

export async function fetchBlockedUsers(username) {
    const response = await fetchMod(`http://localhost:8000/api/player/${username}/blocked`);
    if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
    return response.json();
}

export async function fetchFriendRequests(username) {
    const response = await fetchMod(`http://localhost:8000/api/player/${username}/friends/request`);
    if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
    return response.json();
}

export async function blockUser(me, target) {
    const response = await fetchMod(`http://localhost:8000/api/player/${me}/blocked`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'target': target })
    });
    return response;
}

export async function unblockUser(me, target) {
    const response = await fetchMod(`http://localhost:8000/api/player/${me}/blocked`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'target': target })
    });
    return response;
}

export async function sendFriendRequest(me, friend) {
    const response = await fetchMod(`http://localhost:8000/api/player/${friend}/friends/request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'sender': me })
    });
    return response;
}

export async function acceptFriendRequest(me, sender) {
    const response = await fetchMod(`http://localhost:8000/api/player/${me}/friends/request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'sender': me })
    });
    return response;
}

export async function declineFriendRequest(me, sender) {
    const response = await fetchMod(`http://localhost:8000/api/player/${me}/friends/request`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'sender': me })
    });
    return response;
}
