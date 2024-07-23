export function generateProfileInfo(profile) {
	console.log(profile)
	let winLostRatio = profile.matches_won / profile.matches_played

	return `
        <div class="profile-info">
            <img src="${profile.image}" alt="Profile Picture" class="profile-pic">
            <h2 class="mt-3">${profile.username}</h2>
            <div class="game-stats">
                <p>Games Played: ${profile.matches_played}</p>
                <p>Games Won: ${profile.matches_won}</p>
                <p>Win/Lost Ratio: ${winLostRatio}</p>
            </div>
        </div>
    `;
}