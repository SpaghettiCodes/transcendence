import { redirect } from "../router.js"

// this is merely a placeholder as i cook up a chat system
export default function chat(prop={}) {
	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = () => {
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `
			<div>
				<h1>Test ChatRoom</h1>

				<h2 id="nameBig"></h2>

				<div class="name_selection">
					<input id="name" placeholder="Username">
					<button id="save">Save</button>
				</div>

				<h2 id="serverid"></h2>

				<div class="server_selection">
					<input id="servername" placeholder="Create A New Server">
					<button id="sendapi">Connect</button>
				</div>

				<div class="serverid_connection">
					<input id="serveridfield" placeholder="Connect to an existing Server ID">
					<button id="attemptConnection">Connect</button>
				</div>

				<div class="chat">
					<div class="left">
						<h3 class="memberlabel">Member List:</h3>
						<div class="memberbox" id="memberList"></div>
						</br>
						<div class="add_members">
						<input id="membername" placeholder="Add Members">
						<button id="addmembers">Add and Update Members</button>
						</div>
					</div>
					<div class="right">
						<div class="chatbox" id="chatbox"></div>
						</br>
						<div class="inputbox">
							<input id="inputfield" placeholder="Some text..">
							<button id="sendbtn">Send</button>
						</div>
					</div>
				</div>
			</div>
		`
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		let name = ""
		let websocket = undefined
		let roomid = undefined

		let messageScreen = document.getElementById("chatbox")

		let memberListDiv = document.getElementById("memberList")
		let memberField = document.getElementById("membername")
		let memberBtn = document.getElementById("addmembers")

		const setDetails = (data) => {
			let members = data["members"]
			let owner = data["owner"]
			let title = data["title"]
			let titleField = document.getElementById("serverid")

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
		}

		const sendMessage = (data) => {
			websocket.send(JSON.stringify(data))
		}

		const connectToNewSocket = (url) => {
			messageScreen.innerHTML = ''
			memberListDiv.innerHTML = ''

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
				console.log("Cry")
			}

			websocket.onmessage = (e) => {
				let data = JSON.parse(e.data)
				let status = data["status"]

				let newDiv = document.createElement("div")
				switch (status)
				{
					case "error":
						newDiv.setAttribute("class", "errorbox")
						newDiv.innerHTML = `
							<h4>Error</h4>
							<p>${data["message"]}</p>
						`
						break
					case "new_message":
						newDiv.setAttribute("class", "messagebox")
						let authordiv = document.createElement("div")
						let messagediv = document.createElement("div")
						authordiv.setAttribute("class", "author")
						messagediv.setAttribute("class", "message")
						authordiv.innerHTML = data["sender"]
						messagediv.innerHTML = data["message"]
						newDiv.appendChild(authordiv)
						newDiv.appendChild(messagediv)
						break
					case "details":
						setDetails(data["details"])
						break
				}
				messageScreen.prepend(newDiv)
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
			nameHeader.innerHTML = `Hello ${name}`

			let ownerField = document.getElementById("ownerField")
			if (!ownerField) {
				ownerField = document.create
			}
		}

		memberBtn.onclick = () => {
			let newMember = memberField.value
			if (newMember && !memberList.includes(newMember)) {
				memberList.push(newMember)
				let newdiv = document.createElement("div")
				newdiv.setAttribute("class", "memberlist")
				newdiv.innerHTML = `${newMember}`
				memberListDiv.appendChild(newdiv)
			}
		}

		let serverField = document.getElementById("servername")
		let sendToApi = document.getElementById("sendapi")
		let serverid = document.getElementById("serverid")
		let payload

		sendToApi.onclick = async () => {
			if (!name) {
				serverid.innerHTML = "Put your Username First!"
				return
			}

			if (!serverField.value) {
				serverid.innerHTML = "Put a server title First!"
				return
			}

			serverid.innerHTML = `Connecting to = ${serverField.value}`

			payload = {
				"username": name,
				"chat_title": serverField.value,
				"members": memberList
			}

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
			}
			catch (err) {
				serverid.innerText = err.message
			}
		}

		let memberList = []
		let inputField = document.getElementById("inputfield")
		let sendBtn = document.getElementById("sendbtn")

		sendBtn.onclick = () => {
			if (!websocket) {
				console.error("Go connect to something first")
				return
			}

			sendMessage({
				'status': "new_message",
				'sender': name,
				'message': inputField.value
			})
		}

		let serveridField = document.getElementById("serveridfield")
		let attemptoConnect = document.getElementById("attemptConnection")

		attemptoConnect.onclick = () => {
			roomid = serveridField.value
			connectToNewSocket(`ws://localhost:8000/chat/${roomid}`)
		}
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}