/*
<div class='d-flex flex-column flex-grow-1' id='yourResults'>
	<div class='detailsDiv d-flex justify-content-center align-items-center my-5'' id='yourProfile'>
		<div class='usernameDiv text-center px-5' id='name'>Username</div>
		<div class='profilePic' id='yourProfilePic'></div>
	</div>
</div>
*/
import { redirect } from "../../../router.js"

export default class playerDetailsDiv {
	constructor () {
		this.mainDiv = document.createElement('div')
		this.mainDiv.setAttribute('class', 'd-flex flex-column flex-grow-1')

		this.innerDiv = document.createElement('div')
		// the solution to shitty sections == more div
		this.innerDiv.setAttribute('class', 'd-flex flex-column justify-content-center align-items-center')

		this.playerDetailsDiv = document.createElement('div')
		this.playerDetailsDiv.setAttribute('class', 'detailsDiv d-flex justify-content-center align-items-center my-5')

		this.usernameDiv = document.createElement('div')
		this.usernameDiv.setAttribute('class', 'usernameDiv text-center')

		this.profilePic = document.createElement('div')
		this.profilePic.setAttribute('class', 'profilePic')

		this.mainDiv.appendChild(this.innerDiv)
		this.playerDetailsDiv.appendChild(this.usernameDiv)
		this.playerDetailsDiv.appendChild(this.profilePic)
		this.innerDiv.appendChild(this.playerDetailsDiv)
	}

	setData = (data, callerUsername) => {
		let { username, profile_pic } = data
		this.usernameDiv.innerText = username
		this.profilePic.style.backgroundImage = `url(http://localhost:8000/api${profile_pic})`

		if (username !== callerUsername) {
			let profileButton = document.createElement('button')
			profileButton.setAttribute('class', 'resultBtn')
			profileButton.innerText = 'View Profile'
			profileButton.onclick = (event) => {
				redirect(`/colleagues?search=${username}`)
			}

			this.innerDiv.appendChild(profileButton)
		}
	}
}