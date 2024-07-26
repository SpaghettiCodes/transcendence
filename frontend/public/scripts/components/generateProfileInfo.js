export function generateProfileInfo(profile) {
	console.log(profile)

	let winLostRatio = undefined
	if (profile.matches_played)
		winLostRatio = profile.matches_won / profile.matches_played
	else
		winLostRatio = 'Cant be calculated yet'

	let imageSrc = `http://localhost:8000${profile.profile_pic}`

	return `
		<h2 class="mt-3">${profile.username}</h2>
		<img src="${imageSrc}" alt="Profile Picture" class="profile-pic" id="pfp">
    `;
}