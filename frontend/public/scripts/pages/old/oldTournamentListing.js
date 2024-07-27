import { redirect } from "../../router.js"
import { fetchMod } from "../../jwt.js"

export default function tournamentList(prop={}) {
	// attach all pre-rendering code here (like idk, fetchMod request or something)
	let prerender = async () => {
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `<div>
		<button id="newtour">New Tournament</button>
		<button id="matchmake">Find a Match</button>
		<input id="player_id" type="text" placeholder="this test, expect removal" value="">
		<button id="save">Save (temp)</button>
		</div>

		<div id="listOfTournaments">
		</div>
		`
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		const tournamentListWebsocket = new WebSocket("ws://localhost:8000/tournament")

		const generateHtmlTags = (tournaments) => {
			listOfTournaments.innerHTML = ''
			tournaments.forEach(tournament => {
				let newDiv = document.createElement("div")
				let idDiv = document.createElement("div")
				let playerDiv = document.createElement("div")
				let statusDiv = document.createElement("div")
				let playDiv = document.createElement("button")
				let spectateDiv = document.createElement("button")

				let id = tournament["id"]

				idDiv.innerText = `Tournament ${id}`
				playerDiv.innerText = `Player Count: ${tournament["players"]}`

				if (tournament["started"])
					statusDiv.innerText = `Status: Playing Round ${tournament["round"]}`
				else
					statusDiv.innerText = `Status: Waiting for players`

				playDiv.innerText = "Play"

				playDiv.onclick = () => {
					redirect(`/tournament/${id}`)
				}

				spectateDiv.innerText = "Spectate"

				spectateDiv.onclick = () => {
					console.log(tournament)
				}

				newDiv.appendChild(idDiv)
				newDiv.appendChild(playerDiv)
				newDiv.append(statusDiv)
				newDiv.appendChild(playDiv)
				newDiv.appendChild(spectateDiv)

				listOfTournaments.appendChild(newDiv)
			});
		}

		tournamentListWebsocket.onopen = (e) => {
		}

		tournamentListWebsocket.onclose = (e) => {
		}

		tournamentListWebsocket.onmessage = (e) => {
			const data = JSON.parse(e.data)
			generateHtmlTags(data)
		}

		const new_tournament_button = document.getElementById("newtour")
		const save_button = document.getElementById("save")
		const listOfTournaments = document.getElementById("listOfTournaments")
		const randomMatchmakingButton = document.getElementById("matchmake")

		const set_username = () => {
			const username_field = document.getElementById("player_id")
			localStorage.setItem("username", username_field.value)
		}

		const createNewTournament = async () => {
			let response
			try {
				response = await fetchMod(
					"http://localhost:8000/api/tournament",
					{
						method: "POST"
					}
				)

				if (!response.ok)
					throw "Stinky"

				let data = await response.json()
				redirect(`/tournament/${data["tournament_id"]}`)
			}
			catch {
				console.log("went left")
			}
		}

		const randomMatchmaking = async () => {
			// to websocket or not to websocket
			let response
			try {
				response = await fetchMod(
					"http://localhost:8000/api/tournament",
					{
						method: "GET"
					}
				)

				if (!response.ok)
					throw "Cry"

				let data = await response.json()
				redirect(`/tournament/${data["tournament_id"]}`)
			}
			catch {
				console.log("oh, boo hoo hoo")
			}
		}

		randomMatchmakingButton.addEventListener("click", randomMatchmaking)
		new_tournament_button.addEventListener("click", createNewTournament)
		save_button.addEventListener("click", set_username)
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}