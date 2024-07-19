import { redirect } from "../router.js"

// this is merely a placeholder as i cook up a chat system
export default function testChat(prop={}) {
	let websocket = undefined

	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = () => {
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `
			<div class='d-flex overflow-scroll bg-white'>
				<div class="settings">
					<div class="usernameDiv">
						<h2 id="nameBig" class="hide"></h2>

						<div class="name_selection">
							<input id="name" placeholder="Username">
							<button id="save">Save</button>
						</div>
					</div>

					<div class="existingServerDiv">
						<h2>Connect to servers you are in: </h2>
						<div class="serverSelection" id="serverSelection">
						</div>
					</div>

					<div class="newServerDiv">
						<div class="left">
							<h3>New Server</h3>
							<input id="servername" placeholder="Server Title">
							<button id="sendapi">Create</button>
						</div>
						<div class="right">
							<h3>Members List</h3>
							<div id="newMemberList" class="memberList">
							</div>
							<div>
								<input id="memberName" placeholder="Member's Username">
								<button id="addToGroup">Add</button>
							</div>
						</div>
					</div>

					<h2 id="serverid" class="hide"></h2>
				</div>

				<div class="chat">
					<div class="left">
						<h3 class="memberlabel">Member List:</h3>
						<div class="memberbox" id="memberList"></div>
					</div>
					<div class="right">
						<div class="chatbox" id="chatbox"></div>
						<div class="inputbox">
							<input id="inputfield" placeholder="Some text..">
							<button id="sendbtn">Send</button>
							<button id="invitefight">Invite to Pong</button>
						</div>
					</div>
				</div>
			</div>
		`
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		let name = ""

		let roomid = undefined
		let lastmsgid = undefined

		let fucking_wait_lah = false

		let messageScreen = document.getElementById("chatbox")

		const generateListOfServersIn = (listOfServers) => {
			let serverSelectionField = document.getElementById("serverSelection")
			serverSelectionField.innerHTML = ''

			listOfServers.forEach((servers) => {
				let newDiv = document.createElement("div")
				newDiv.setAttribute("class", "serverDetailBlock")

				let roomIdDiv = document.createElement("div")
				roomIdDiv.innerText = `Chat ID: ${servers["roomid"]}`

				let titleDiv = document.createElement("div")
				titleDiv.innerText = `Chat Title: ${servers["title"]}`
				
				let newButton = document.createElement("button")
				newButton.innerText = "Connect"

				newButton.onclick = () => {
					let newRoomId = servers["roomid"]
					console.log(`connecting you to ${newRoomId}`)
					
					roomid = newRoomId
					connectToNewSocket(`ws://localhost:8000/chat/${roomid}`)
				}

				newDiv.appendChild(titleDiv)
				newDiv.appendChild(roomIdDiv)
				newDiv.appendChild(newButton)
				serverSelectionField.appendChild(newDiv)
			})
		}

		const getInServerList = () => {
			fetch(
				`http://localhost:8000/api/player/${name}/chat`, {
					method: "GET"
				}
			).then((value) => {
				return value.json()
			}).then((value) => {
				generateListOfServersIn(value)
			}).catch((reason) => {
				console.log(reason)
			})
		}

		messageScreen.addEventListener("scroll", async (event) => {
			if (!fucking_wait_lah) {
				fucking_wait_lah = true
				let threshold = 10
				let scrollMax = messageScreen.scrollHeight - messageScreen.clientHeight // magic
				let scrollValue = messageScreen.scrollTop * -1 // negative since upside down
	
				if ((scrollMax - scrollValue) < threshold) {
					let newMsg = await getPreviousMessages()

					if (newMsg) {
						let totalMsg = messageScreen.childElementCount
						messageScreen.children[totalMsg - newMsg].scrollTo()
					}
				}
				fucking_wait_lah = false
			}
		})

		let memberListDiv = document.getElementById("memberList")

		const makeErrorBox = (data) => {
			let newDiv = document.createElement("div")
			newDiv.setAttribute("class", "errorbox")
			newDiv.innerHTML = `
				<h4>Error</h4>
				<p>${data["message"]}</p>
			`
			return newDiv
		}

		const makeMessageBox = (data) => {
			let newDiv = document.createElement("div")
			newDiv.setAttribute("class", "messagebox")

			let authordiv = document.createElement("div")
			let messagediv = document.createElement("div")
			authordiv.setAttribute("class", "author")
			messagediv.setAttribute("class", "message")
			authordiv.innerHTML = data["sender"]['username']
			messagediv.innerHTML = data['content']
			newDiv.appendChild(authordiv)
			newDiv.appendChild(messagediv)

			return newDiv
		}

		const makeInviteBox = (data) => {
			let sender_details = data["sender"]
			let invite_details = data["invite_details"]
			let chatId = data["chatid"]

			let newDiv = document.createElement("div")
			newDiv.setAttribute("class", "invitebox")
			newDiv.setAttribute("id", `msg-${chatId}`)

			let sender = sender_details["username"]

			let messageDiv = document.createElement("div")
			messageDiv.setAttribute("class", "message")
			messageDiv.innerText = `Game Invitation By ${sender}`

			let button = document.createElement("button")
			button.setAttribute("id", `msg-button-${chatId}`)

			let status = invite_details["status"]
			let matchId = invite_details["match"]
			if (status === "waiting") {
				button.innerText = "Join Match"
				button.onclick = () => {
					redirect(`/match/${matchId}`)
				}
			} else if (status === "done") {
				button.innerText = "Match Results"
				button.onclick = () => {
					redirect(`/match/${matchId}/results`)
				}
			} else if (status === "expired") {
				button.innerText = "Unavailable"
				button.disabled = true
			}

			newDiv.append(messageDiv)
			newDiv.append(button)
			return newDiv
		}

		const updateInviteBox = (data) => {
			let chatid = data["chatid"]
			let status = data["status"]

			let inviteButton = document.getElementById(`msg-button-${chatid}`)
			if (status === "waiting") {
				inviteButton.innerText = "Join Match"
				inviteButton.onclick = () => {
					redirect(`/match/${gameData}`) // Lol, Lmao even
				}
			} else if (status === "done") {
				inviteButton.innerText = "Match Results"
				inviteButton.onclick = () => {
					redirect(`/match/${gameData}/results`)
				}
			} else if (status === "expired") {
				inviteButton.innerText = "Unavailable"
				inviteButton.disabled = true
			}
		}

		const getPreviousMessages = async () => {
			let url = undefined
			if (lastmsgid === undefined)
				url = `http://localhost:8000/api/chat/${roomid}/history?user=${name}`
			else
				url = `http://localhost:8000/api/chat/${roomid}/history?start_id=${lastmsgid}&user=${name}`

			try {
				const response = await fetch(url)

				if (!response.ok)
					throw "Panic"

				const data = await response.json()

				console.log(data)
				const messageList = data["history"]

				if (!messageList.length) {
					return
				}

				lastmsgid = messageList.at(-1)["chatid"]
				messageList.forEach(pastMessage => {
					let type = pastMessage["type"]
					let messageBlock = undefined

					switch (type) {
						case ("message"):
							messageBlock = makeMessageBox(pastMessage)
							break
						case ("invite"):
							messageBlock = makeInviteBox(pastMessage)
							break
					}

					messageScreen.append(messageBlock)
				})
				return messageList.length
			} catch (e) {
				console.log(e.message)
			}
			return -1
		}

		const setDetails = async (data) => {
			let members = data["members"]
			let owner = data["owner"]
			let title = data["title"]
			let titleField = document.getElementById("serverid")

			titleField.classList.remove("hide")
			titleField.innerHTML = `Connected to room ${title} | ID: ${roomid}`

			let newDiv = document.createElement("div")
			newDiv.setAttribute("class", "memberlist")
			newDiv.innerHTML = owner["username"]
			memberListDiv.appendChild(newDiv)

			members.forEach(member => {
				let newDiv = document.createElement("div")
				newDiv.setAttribute("class", "memberlist")
				newDiv.innerHTML = member["username"]
				memberListDiv.appendChild(newDiv)
			});

			await getPreviousMessages()
		}

		const sendMessage = (data) => {
			websocket.send(JSON.stringify(data))
		}

		const connectToNewSocket = (url) => {
			// reset everything
			messageScreen.innerHTML = ''
			memberListDiv.innerHTML = ''
			lastmsgid = undefined

			if (websocket)
				websocket.close()
			websocket = new WebSocket(url)

			websocket.onopen = (e) => {
				sendMessage({
					'command': 'join',
					'username': name
				})
			}

			websocket.onerror = (e) => {
				newDiv = makeErrorBox({
					"message": "Unexpectedly Disconnected"
				})
				message.prepend(newDiv)
			}

			websocket.onmessage = async (e) => {
				let data = JSON.parse(e.data)
				console.log(data)
				let command = data["command"]
				let newDiv = undefined

				switch (command)
				{
					case "error":
						newDiv = makeErrorBox(data)
						messageScreen.prepend(newDiv)
						break
					case "new_message":
						let messageDetails = data["details"]
						console.log(messageDetails)

						if (messageDetails["type"] === "message") {
							newDiv = makeMessageBox(messageDetails)
						} else if (messageDetails["type"] === "invite") {
							newDiv = makeInviteBox(messageDetails)
						}
						messageScreen.prepend(newDiv)
						break
					case "update_match":
						updateInviteBox(data)
						break
					case "details":
						await setDetails(data["details"])
						return
				}
			}

			websocket.onclose = (data) => {
			}
		}

		let nameField = document.getElementById("name")
		let nameSave = document.getElementById("save")
		let nameHeader = document.getElementById("nameBig")

		nameSave.onclick = () => {
			if (!nameField.value)
				return
			name = nameField.value

			nameHeader.classList.remove("hide")
			nameHeader.innerHTML = `Hello ${name}`

			let ownerField = document.getElementById("ownerField")
			if (!ownerField) {
				ownerField = document.create
			}
			
			getInServerList()
		}

		let memberField = document.getElementById("memberName")
		let memberBtn = document.getElementById("addToGroup")
		let newMemberBox = document.getElementById("newMemberList")

		memberBtn.onclick = () => {
			let newMember = memberField.value
			if (newMember && !memberList.includes(newMember)) {
				memberList.push(newMember)
				let newdiv = document.createElement("div")
				newdiv.setAttribute("class", "memberBox")
				newdiv.innerHTML = `${newMember}`
				newMemberBox.appendChild(newdiv)
			}

			// clear memeber field
			memberField.value = ''
		}

		let serverField = document.getElementById("servername")
		let sendToApi = document.getElementById("sendapi")
		let serverid = document.getElementById("serverid")

		sendToApi.onclick = async () => {
			serverid.classList.remove("hide")
			if (!name) {
				serverid.innerHTML = "Put your Username First!"
				return
			}
			if (!serverField.value) {
				serverid.innerHTML = "Put a server title First!"
				return
			}
			serverid.innerHTML = `Creating new server ${serverField.value}`

			let payload = {
				"username": name,
				"title": serverField.value,
				"members": memberList
			}

			// clear member list
			memberList = []
			newMemberBox.innerHTML = ''

			// clear server title
			serverField.value = ''

			console.log(payload)
			try {
				let result = await fetch(
					"http://localhost:8000/api/chat", {
						method: "POST",
						headers: {
							'Content-Type': 'application/json', // wtf
						},
						body: JSON.stringify(payload)
					}
				)
				if (result.ok) {
					let data = await result.json()
					console.log(data)
	
					roomid = data["roomid"]
					connectToNewSocket(`ws://localhost:8000/chat/${roomid}`)
				}

				// refresh server list
				getInServerList()
			}
			catch (err) {
				serverid.innerText = err.message
			}
		}

		let memberList = []
		let inputField = document.getElementById("inputfield")
		let sendBtn = document.getElementById("sendbtn")

		sendBtn.onclick = async () => {
			let payload = {
				"type": "message",
				"sender": name,
				"message": inputField.value
			}

			try {
				fetch(
					`http://localhost:8000/api/chat/${roomid}`,
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

			inputField.value = ""
		}

		let inviteBtn = document.getElementById("invitefight")

		inviteBtn.onclick = async () => {
			let payload = {
				"type": "invite",
				"sender": name,
				"message": "Optional Message Goes here",
				"match_type": "pong"
			}

			try {
				fetch(
					`http://localhost:8000/api/chat/${roomid}`,
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
	}

	let cleanup = () => {
		if (websocket)
			websocket.close()
	}

	return [prerender, render_code, postrender, cleanup]
}