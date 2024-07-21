export function generateProfileInfo(profile) {
    return `
        <div class="profile-info">
            <img src="${profile.image}" alt="Profile Picture" class="profile-pic">
            <h2 class="mt-3">${profile.username}</h2>
            <div class="game-stats">
                <p>Games Played: ${profile.gamesPlayed}</p>
                <p>Games Won: ${profile.gamesWon}</p>
                <p>Win/Lost Ratio: ${profile.winLostRatio}</p>
            </div>
        </div>
    `;
}