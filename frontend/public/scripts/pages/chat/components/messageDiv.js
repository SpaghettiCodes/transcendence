import { redirect } from "../../../router.js"
import { redirectSpamWrapper } from "../../helpers.js"

export default class messageDiv {
	constructor (type) {
		this.mainDiv = document.createElement("div")
		this.mainDiv.setAttribute('class', 'messageBox rounded')

		this.ImageHolder = document.createElement("img")
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
		} else if (type === 'blocked') {
			this.messageContent = document.createElement('div')
			this.messageContent.setAttribute('class', 'messageContent text-break')

			this.content.appendChild(this.messageContent)
		}
		else {
			console.error("unkown type for message div")
		}

		this.type = type
	}

	captialize = (string) => {
		return string.charAt(0).toUpperCase() + string.slice(1)
	}

	setData = (data) => {
		let authorID = data['sender']['username']
		let imageURL = `https://localhost:8000/api${data['sender']['profile_pic']}`
		this.ImageHolder.src = imageURL
		this.ImageHolder.onclick = redirectSpamWrapper(
			() => {
				redirect(`/friends/${authorID}`)
			}
		)


		if (this.type === 'message') {
			let messageContent = data['content']
			this.messageContent.innerText = messageContent
			this.playerField.innerText = authorID
		} else if (this.type === 'invite') {
			let chatID = data['chatid']

			let invite_details = data['invite_details']
			let match_details = invite_details['match']
			let status = invite_details['status']

			let matchID = match_details ? match_details['matchid'] : undefined
			let matchType = match_details ? this.captialize(match_details['type']) : undefined

			this.inviteContent.setAttribute('id', `msg-inviteContent-${chatID}`)
			this.statusButton.setAttribute('id', `msg-statusButton-${chatID}`)
			let message = `${authorID} has invited to play ${matchType}`

			this.inviteContent.innerText = message
			messageDiv.setPlayButtonStatus(this.inviteContent, this.statusButton, status, matchID)
		} else if (this.type === 'blocked') {
			this.ImageHolder.remove()
			let messageContent = data['content']
			this.messageContent.innerText = messageContent
			this.messageContent.style.fontWeight = 'bolder'
		}
	}

	static getContentDiv(chatID) {
		return document.getElementById(`msg-inviteContent-${chatID}`)
	}

	static getStatusButton (chatID) {
		return document.getElementById(`msg-statusButton-${chatID}`)
	}

	static setPlayButtonStatus (inviteContent, buttonElement, status, matchID) {
		if (status === "waiting") {
			buttonElement.innerText = "Join Match"
			buttonElement.onclick = redirectSpamWrapper(
				() => {
					redirect(`/match/${matchID}`)
				}	
			)
		} else if (status === "done") {
			buttonElement.innerText = "Match Results"
			buttonElement.onclick = redirectSpamWrapper(
				() => {
					redirect(`/match/${matchID}/results`)
				}	
			)
		} else if (status === "expired") {
			inviteContent.innerText = 'This invitation is no longer available'
			buttonElement.innerText = "Unavailable"
			buttonElement.disabled = true
		}
	}
}
