import { createAlert } from "../components/alert.js"
import { fetchMod } from "../jwt.js"

async function defaultDataProcessor (data) {
	let { code, message } = data
	if (code === 'upcoming_tournament_match') {
		createAlert('info', message)
	}
}

let dataProcessors = [defaultDataProcessor]
export let playerNotificationWebsocket = undefined

export function connectToPlayerNotificationWebsocket(token) {
	if (!token) {
		return
	}

	// try to get me first
	async function checkMe() {
		await fetchMod("https://localhost:8000/api/me"); //change to the correct endpoint
	}

	function connectWebSock () {
		playerNotificationWebsocket = new WebSocket(`wss://localhost:8000/player`)

		const sendMessage = (message) => {
			playerNotificationWebsocket.send(JSON.stringify(message))
		}
	
		playerNotificationWebsocket.onerror = (e) => {
		}

		playerNotificationWebsocket.onmessage = async (e) => {
			const data = JSON.parse(e.data)
			for (let dataProcessor of dataProcessors) 
				await dataProcessor(data)
		}
	
		playerNotificationWebsocket.onopen = (e) => {
			sendMessage({
				command: 'join',
				jwt: token
			})
		}
	}

	checkMe().then(() => connectWebSock())
}

export function playerNotiAddProcessor(func) {
	dataProcessors.push(func)
}

export function playerNotiRemoveProcessor(func) {
	const index = dataProcessors.indexOf(func)
	if (index > -1) {
		dataProcessors.splice(index, 1)
	}
}

export function disconnectPlayerNotificationWebsocket() {
	if (playerNotificationWebsocket !== undefined)
		playerNotificationWebsocket.close()
}
