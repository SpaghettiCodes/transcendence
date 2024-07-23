export function generateProfileInfo(profile) {
	console.log(profile)

	let winLostRatio = undefined
	if (profile.matches_played)
		winLostRatio = profile.matches_won / profile.matches_played
	else
		winLostRatio = 'Cant be calculated yet'

	let imageSrc = `http://localhost:8000${profile.profile_pic}`

	return `
        <div class="profile-info">
            <img src="${imageSrc}" alt="Profile Picture" class="profile-pic">
            <h2 class="mt-3">${profile.username}</h2>
            <div class="game-stats">
                <p>Games Played: ${profile.matches_played}</p>
                <p>Games Won: ${profile.matches_won}</p>
                <p>Win/Lost Ratio: ${winLostRatio}</p>
            </div>
        </div>
    `;
}