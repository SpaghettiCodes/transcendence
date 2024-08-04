import { ImageFromBackendUrl } from "../pages/helpers.js";

export function generateProfileInfo(profile) {
	console.log(profile)

	let imageSrc = ImageFromBackendUrl(profile.profile_pic)
	let onlineStatus = profile.is_online ? 'online' : 'offline'

	return `
		<h2 class="mt-3">${profile.username}</h2>
		<div class='d-flex flex-row position-relative'>
			<img src="${imageSrc}" alt="Profile Picture" class="profile-pic" id="pfp">
			<div class='online-status ${onlineStatus}'></div>
		</div>
    `;
}