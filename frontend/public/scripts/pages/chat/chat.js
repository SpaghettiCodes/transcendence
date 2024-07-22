import { redirect } from "../../router.js"
import messageDiv from "./components/messageDiv.js"
import errorDiv from "./components/errorDiv.js"
import endOfChatDiv from "./components/endOfChatDiv.js"

import { createButton, createInput } from "../../components/elements.js"
import { fetchMod } from "../../jwt.js"

export default function chat(prop={}) {
	let websocket = undefined
	let resizeHandler = undefined

	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = () => {
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `
		<h1 class="title">SMS</h1>
		<div class="d-flex flex-grow-1 align-self-stretch overflow-hidden" id='contentDiv'>
			<div class="d-flex flex-column friend-list p-2">
				<h4>Colleagues</h4>
				<div class="input-group mb-3">
					${createInput("form-control rounded", "search", "search", "Colleaguess' ID")}
					${createButton('Search', 'btn btn-dark', 'button')}
				</div>
				<div dir="rtl" class="d-flex flex-column flex-grow-1 overflow-y-auto" style="padding-left:5px;" id="friend-list-items">
				</div>
			</div>
			<div class="d-flex flex-column flex-grow-1 px-2">
				<div class="chat-content-field d-flex flex-column-reverse flex-grow-1 p-2 mb-2 overflow-y-auto rounded" id="chatContentField">
				</div>
				<div class="text-input-box">
					<div class="d-flex flex-row text-input-box">
						<textarea class="form-control" rows="1" placeholder="Type your message here..." id="dataEnter"></textarea>
						<button type="button" class="btn btn-dark mx-2 disabled" id="sendMessageButton">Send</button>
						<button type="button" class="btn btn-dark d-flex disabled" id="inviteForMatchButton">
							<div class='px-2'>
								Invite
							</div>
							<select class='rounded bg-black border-black text-white' id="inviteForMatchType">
								<option value="pong">Pong</option>
								<option value="apong">APong Us</option>
							</select>
						</button>
						</div>
				</div>
			</div>
		</div>
	`
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		// temp
		const username = localStorage.getItem('username')
		// PLEASE CHANGE LATER, WE ARE NOT SAVING USERNAME IN LOCAL STORAGE
		// or maybe we are, idk

		console.log('Username =', username)

		const friendList = document.getElementById("friend-list-items")
		const chatContentField = document.getElementById("chatContentField")
		const sendMessageButton = document.getElementById('sendMessageButton')
		const sendInviteButton = document.getElementById('inviteForMatchButton')
		const typeSelectionField = document.getElementById('inviteForMatchType')

		let lastMSGID = undefined
		let currentlyViewingChatID = undefined

		let loadingNewMessages = false
		let gotAllMessages = false

		let loadingNewChatroom = false
		// <div class="friend-list-item">
		// 	Friend 1
		// </div>

		const getFriendList = () => {
			fetchMod(
				`http://localhost:8000/api/player/${username}/friends`,
				{
					method: "GET",
				}
			).then((value) => {
				if (!value.ok)
					throw value
				return value.json()
			}).then(
				(data) => {
					for (let friend of data) {
						let newFriendDiv = document.createElement("div")
						let friendUsername = friend['username']
						newFriendDiv.setAttribute('class', 'friend-list-item')

						newFriendDiv.innerText = friendUsername
						newFriendDiv.onclick = async () => {
							await connectToNewChatroom(username, friendUsername)
							newFriendDiv.setAttribute('id', 'friendMsgActivated')
						}
						friendList.append(newFriendDiv)
					}
				}
			).catch((value) => console.error(value))
		}

		const connectToNewChatroom = async (player_username, target_username) => {
			if (!loadingNewChatroom) {
				loadingNewChatroom = true
				resetChatVariables()

				// disable sending messages
				sendMessageButton.classList.add('disabled')
				sendInviteButton.classList.add('disabled')

				let chatID = await getChatRoomData(`http://localhost:8000/api/player/${player_username}/chat/${target_username}`)
				connectToWebsocket(`ws://localhost:8000/chat/${chatID}`)

				// reenable sending message
				sendMessageButton.classList.remove('disabled')
				sendInviteButton.classList.remove('disabled')
			}
		}

		const getPreviousMessages = async (chatID, resetChat=false) => {
			let url = undefined
			let didWeGetAllMessagesBefore = gotAllMessages
			if (lastMSGID === undefined)
				url = `http://localhost:8000/api/chat/${chatID}/history`
			else
				url = `http://localhost:8000/api/chat/${chatID}/history?start_id=${lastMSGID}`

			try {
				const response = await fetchMod(url)

				if (!response.ok)
					throw response

				const data = await response.json()

				const messageList = data["history"]
				const haveMore =  data["haveMore"]

				if (resetChat) {
					resetChatContent()
				}

				if (!messageList.length) {
					gotAllMessages = true
					if (!didWeGetAllMessagesBefore && gotAllMessages) {
						let newEOFdiv = new endOfChatDiv()
						chatContentField.append(newEOFdiv.mainDiv)
					}
					return 0
				}

				lastMSGID = messageList.at(-1)["chatid"]
				messageList.forEach((pastMessage) => {
					let type = pastMessage["type"]
					let messageBlock = new messageDiv(type)
					messageBlock.setData(pastMessage)
					chatContentField.append(messageBlock.mainDiv)
				})

				if (!haveMore) {
					gotAllMessages = true
					if (!didWeGetAllMessagesBefore && gotAllMessages) {
						let newEOFdiv = new endOfChatDiv()
						chatContentField.append(newEOFdiv.mainDiv)
					}
				}

				return messageList.length
			} catch (e) {
				console.log(e)
			}
			return -1
		}

		const getChatRoomData = async (url) => {
			try {
				let results = await fetchMod(
					url, {
						method: "GET",
					}
				)

				if (!results.ok) {
					throw results
				}

				let data = await results.json()
				let roomid = data['roomid']

				currentlyViewingChatID = roomid

				let messageGotten = await getPreviousMessages(roomid, true)
				while (chatContentField.clientHeight >= chatContentField.scrollHeight && messageGotten) {
					messageGotten = await getPreviousMessages(roomid)
				}
				return roomid
			} catch (e) {
				console.log('uh oh poopy')
			}

		}

		const sendMessage = (data) => {
			websocket.send(JSON.stringify(data))
		}

		const resetChatContent = () => {
			chatContentField.innerHTML = ''
		}

		const resetChatVariables = () => {
			lastMSGID = undefined
			gotAllMessages = false
			if (websocket)
				websocket.close()

			let activatedButton = document.getElementById('friendMsgActivated')
			if (activatedButton)
				activatedButton.removeAttribute('id')
		}

		const connectToWebsocket = (url) => {
			websocket = new WebSocket(url)

			websocket.onopen = (e) => {
				sendMessage({
					'command': 'join',
					'username': username
				})

				loadingNewChatroom = false
			}

			websocket.onerror = (e) => {
				let newErrorDiv = new errorDiv("Unexpectedly Disconnected")
				chatContentField.prepend(newErrorDiv.mainDiv)
			}

			websocket.onmessage = async (e) => {
				let data = JSON.parse(e.data)
				let command = data["command"]

				switch (command)
				{
					case "error":
						let newErrorDiv = new errorDiv(data)
						chatContentField.prepend(newErrorDiv.newDiv)
						break
					case "new_message":
						let messageDetails = data["details"]
						let type = messageDetails['type']
						let messageBlock = new messageDiv(type)
						messageBlock.setData(messageDetails)
						chatContentField.prepend(messageBlock.mainDiv)
						break
					case "update_match":
						let { chatid, status, matchid } = data
						messageDiv.setPlayButtonStatus(messageDiv.getContentDiv(chatid), messageDiv.getStatusButton(chatid), status, matchid)
						break
					case "details":
						break
				}
			}

			websocket.onclose = (data) => {
			}
		}

		sendInviteButton.onclick = async () => {
			let payload = {
				'type': 'invite',
				'sender': username,
				'message': 'do we really need a message?',
				'match_type': typeSelectionField.value
			}

			try {
				await fetchMod(
					`http://localhost:8000/api/chat/${currentlyViewingChatID}`,
					{
						method: "POST",
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(payload)
					}
				)
			} catch (e) {
				console.log(e)
			}
		}

		sendMessageButton.onclick = async () => {
			let messageField = document.getElementById("dataEnter")

			if (!messageField.value) {
				console.log('empty content')
				return
			}

			let payload = {
				"type": "message",
				"sender": username,
				// should sanitize data here...
				"message": messageField.value
			}

			try {
				await fetchMod(
					`http://localhost:8000/api/chat/${currentlyViewingChatID}`,
					{
						method: "POST",
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(payload)
					}
				)
			}
			catch (e) {
				console.log(e)
			}

			messageField.value = ''
			chatContentField.scrollTo(0, 0)
		}

		typeSelectionField.addEventListener('click', (event) => {
			event.stopPropagation()
			event.stopImmediatePropagation()
		})

		chatContentField.addEventListener("scroll", (event) => {
			if (!loadingNewMessages) {
				let threshold = 10
				let scrollMax = chatContentField.scrollHeight - chatContentField.clientHeight // magic

				// cant be scrolled
				if (!scrollMax) {
					return
				}

				let scrollValue = chatContentField.scrollTop * -1 // negative since upside down

				if ((scrollMax - scrollValue) < 10) {
					loadingNewMessages = true
					getPreviousMessages(currentlyViewingChatID).then(
						(value) => { loadingNewMessages = false }
					)
				}
			}
		})

		resizeHandler = async () => {
			// _yes_, currentlyViewingChatId can be 0
			if (chatContentField.clientHeight >= chatContentField.scrollHeight && currentlyViewingChatID !== undefined) {
				let messageGotten = await getPreviousMessages(currentlyViewingChatID)
				while (chatContentField.clientHeight >= chatContentField.scrollHeight && messageGotten) {
					messageGotten = await getPreviousMessages(currentlyViewingChatID)
				}
			}
		}
		window.addEventListener('resize', resizeHandler)

		getFriendList()

		let eofDiv = new endOfChatDiv()
		chatContentField.appendChild(eofDiv.mainDiv)
	}

	let cleanup = () => {
		if (websocket)
			websocket.close()
	}

	return [prerender, render_code, postrender, cleanup]
}