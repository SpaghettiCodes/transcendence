import { redirect } from "../router.js"
import match from "./match.js"

export default function game(prop={}) {
	let sendMatchSocket = null
	let data_received = true

	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = () => {
		return true
	}

	// return the html code here
	let render_code = () => {
		return `
			<div>
				<button id="newgame">New Game</button>
				<button id="refresh">Refresh List</button>
				<input id="player_id" type="text" placeholder="this test, expect removal" value="">
				<button id="save">Save (temp)</button>
			</div>

			<div>
				<h2>List of games:</h2>
				<div id="room_container">
				<p>Loading list of games...</p>
				</div>
			</div>
		`
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		let room_list = document.getElementById("room_container")
		const refresh_button = document.getElementById("refresh")
		const new_game = document.getElementById("newgame")
		const save_button = document.getElementById("save")
		const matchSocket = new WebSocket("ws://localhost:8000/match")

		sendMatchSocket = (message) => {
			matchSocket.send(JSON.stringify(message))
		}

		matchSocket.onerror = function(e) {
			console.log(e)
			console.error("Mm yes socket failed")
		}

		matchSocket.onmessage = (e) => {
			data_received = true
			const data = JSON.parse(e.data)
			gen_html_tags(data)
		}

		const create_new_game = async () => {
			new_game.innerHTML = "Creating..."
			new_game.disabled = true

			let response
			try
			{
				response = await fetch(
					"http://localhost:8000/api/match",
					{
						method: "POST",
					}
				)

				let data = await response.json()
				let game_code = data["game_id"]
				redirect(`/match/${game_code}`)
			}
			catch
			{
				new_game.innerHTML = "Server Is Down"
				setTimeout(() => {
					new_game.innerHTML = "New Game"
					new_game.disabled = false
				}, 5000)
			}
		}

		const gen_html_tags = (data) => {
			if (!data.length) {
				room_list.innerHTML = "<p>No Rooms Found</p>"
				return
			}

			let html_components = data.map(({game_id, player_count, spectator_count}) => {
				return `
				<div>
					<div><p>Game ID: ${game_id}</p></div>
					<div><p>Players: ${player_count}</p></div>
					<div><p>Spectators: ${spectator_count}</p></div>
					<div>
						<a href="/match/${game_id}">Join</a>
					</div>
					<div>
						<a href="">Spectate</a>
					</div>
				</div>
				<hr>
				`
			})

			room_list.innerHTML = "<hr>" + html_components.join("")
		}

		const refresh_room_list = async () => {
			data_received = false
			room_list.innerHTML = "<p>Loading Server List...</p>"
			sendMatchSocket({
				"command": "list"
			})
		}

		const set_username = () => {
			const username_field = document.getElementById("player_id")
			localStorage.setItem("username", username_field.value)
		}

		refresh_button.addEventListener("click", refresh_room_list)
		new_game.addEventListener("click", create_new_game)
		save_button.addEventListener("click", set_username)
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}