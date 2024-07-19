import { redirect } from "../../../router.js"

export default class messageDiv {
	constructor (type) {
		this.mainDiv = document.createElement("div")
		this.mainDiv.setAttribute('class', 'messageBox rounded')

		this.ImageHolder = document.createElement("div")
		this.ImageHolder.setAttribute("class", "ImageHolder")
		this.mainDiv.appendChild(this.ImageHolder)

		this.content = document.createElement("div")
		this.content.setAttribute("class", "d-flex flex-column content")
		this.mainDiv.append(this.content)

		if (type === "message") {
			this.playerField = document.createElement('div')
			this.playerField.setAttribute("class", "playerID")

			this.messageContent = document.createElement('div')
			this.messageContent.setAttribute('class', 'messageContent text-break')

			this.content.appendChild(this.playerField)
			this.content.appendChild(this.messageContent)
		} else if (type === "invite") {
			this.inviteContent = document.createElement('div')
			this.inviteContent.setAttribute('class', 'inviteContent')

			this.statusButton = document.createElement("button")
			this.statusButton.type = 'button'
			this.statusButton.setAttribute('class', "playButton rounded mt-2")
			
			this.content.appendChild(this.inviteContent)
			this.content.appendChild(this.statusButton)
		} else {
			console.error("unkown type for message div")
		}

		this.type = type
	}

	captialize = (string) => {
		return string.charAt(0).toUpperCase() + string.slice(1)
	}

	setData = (data) => {
		let authorID = data['sender']['username']

		if (this.type === 'message') {
			let messageContent = data['content']
			this.messageContent.innerText = messageContent
			this.playerField.innerText = authorID
		} else if (this.type === 'invite') {
			let invite_details = data['invite_details']
			let chatID = data['chatid']
			let status = invite_details['status']
			let matchID = invite_details['match']
			let matchType = this.captialize(invite_details['type'])

			this.statusButton.setAttribute('id', `msg-statusButton-${chatID}`)
			let message = `${authorID} has invited to play ${matchType}`

			this.inviteContent.innerText = message
			messageDiv.setPlayButtonStatus(this.statusButton, status, matchID)
		}
	}

	static getStatusButton (chatID) {
		return document.getElementById(`msg-statusButton-${chatID}`)
	}

	static setPlayButtonStatus (buttonElement, status, matchID) {
		if (status === "waiting") {
			buttonElement.innerText = "Join Match"
			buttonElement.onclick = () => {
				redirect(`/match/${matchID}`)
			}
		} else if (status === "done") {
			buttonElement.innerText = "Match Results"
			buttonElement.onclick = () => {
				redirect(`/match/${matchID}/results`)
			}
		} else if (status === "expired") {
			buttonElement.innerText = "Unavailable"
			buttonElement.disabled = true
		}
	}
}
