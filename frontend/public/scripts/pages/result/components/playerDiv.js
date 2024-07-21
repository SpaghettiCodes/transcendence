/*
<div class='d-flex flex-column flex-grow-1' id='yourResults'>
	<div class='detailsDiv d-flex justify-content-center align-items-center my-5'' id='yourProfile'>
		<div class='usernameDiv text-center px-5' id='name'>Username</div>
		<div class='profilePic' id='yourProfilePic'></div>
	</div>
</div>
*/

export default class playerDetailsDiv {
	constructor () {
		this.mainDiv = document.createElement('div')
		this.mainDiv.setAttribute('class', 'd-flex flex-column flex-grow-1')

		this.innerDiv = document.createElement('div')
		this.innerDiv.setAttribute('class', 'detailsDiv d-flex justify-content-center align-items-center my-5')

		this.usernameDiv = document.createElement('div')
		this.usernameDiv.setAttribute('class', 'usernameDiv text-center px-5')

		this.profilePic = document.createElement('div')
		this.profilePic.setAttribute('class', 'profilePic')

		this.mainDiv.appendChild(this.innerDiv)
		this.innerDiv.appendChild(this.usernameDiv)
		this.innerDiv.appendChild(this.profilePic)
	}

	setData = (data, callerUsername) => {
		let { username, profile_pic } = data
		this.usernameDiv.innerText = username
		this.profilePic.style.backgroundImage = `url(http://localhost:8000/api${profile_pic})`


		if (username !== callerUsername) {
			let profileButton = document.createElement('button')
			
		}
	}
}