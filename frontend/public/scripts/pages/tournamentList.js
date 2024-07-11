import { redirect } from "../router.js"

export default function tournamentList(prop={}) {
	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = () => {
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
		const new_tournament_button = document.getElementById("newtour")
		const save_button = document.getElementById("save")
		const listOfTournaments = document.getElementById("listOfTournaments")

		const create_new_game = async () => {
			console.log("new tournament creating...")
		}

		const set_username = () => {
			const username_field = document.getElementById("player_id")
			localStorage.setItem("username", username_field.value)
		}

		const get_list_of_tournamnets = async () => {
			// to websocket or not to websocket
			let response
			try {
				response = await fetch(
					"http://localhost:8000/api/tournament",
					{
						method: "GET"
					}
				)

				if (!response.ok)
					throw "Cry"

				let data = await response.json()
				data.forEach(tournament => {
					let newDiv = document.createElement("div")
					let idDiv = document.createElement("div")
					let playDiv = document.createElement("button")
					let spectateDiv = document.createElement("button")

					idDiv.innerText = tournament
					playDiv.innerText = "Play"

					playDiv.onclick = () => {
						redirect(`/tournament/${tournament}`)
					}

					spectateDiv.innerText = "Spectate"

					spectateDiv.onclick = () => {
						console.log(tournament)
					}

					newDiv.appendChild(idDiv)
					newDiv.appendChild(playDiv)
					newDiv.appendChild(spectateDiv)

					listOfTournaments.appendChild(newDiv)
				});
			}
			catch {
				console.log("oh, boo hoo hoo")
			}
		}

		get_list_of_tournamnets()

		new_tournament_button.addEventListener("click", create_new_game)
		save_button.addEventListener("click", set_username)
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}