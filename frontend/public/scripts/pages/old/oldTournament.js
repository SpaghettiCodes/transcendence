import { redirect } from "../../router"

export default function tournament(prop={}) {
	const tournamentID = (prop["arguments"]) ? (prop["arguments"]["tournament_id"]) : undefined
	const player_id = localStorage.getItem("username") || "default"

	let tournamentSocket = undefined
	let goingToBattle = false

	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = () => {
		if (tournamentID === undefined)
		{
			redirect("/tournament")
			return false
		}
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `<div>
		<h2 id="title"></h2>
		<div id="tournamentDetails">
			<h3 id="status">Loading data...</h3>

			<h3>Player List</h3>
			<div id="playerList">
			</div>

			<h3>Currently Playing</h3>
			<div id="currentPlay">
			</div>

			<h3>Match History</h3>
			<div id="matchHistory">
			</div>
		</div>
		</div>
		`
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		const titleTag = document.getElementById("title")
		const statusTag = document.getElementById("status")
		const playerList = document.getElementById("playerList")
		const previousMatchesDiv = document.getElementById("matchHistory")
		const currentPlayingDiv = document.getElementById("currentPlay")

		titleTag.innerText = `Tournament ${tournamentID}`

		const sendMessage = (data) => {
			tournamentSocket.send(JSON.stringify(data))
		}

		let ready = () => {
			sendMessage({
				"command": "ready",
				"username": player_id
			})
		}

		let unready = () => {
			sendMessage({
				"command": "unready",
				"username": player_id
			})
		}

		const loadPlayerList = (players, readiedPlayers) => {
			playerList.innerHTML = ''

			if (!players.length) {
				playerList.innerHTML = "No players in this tournament!"
			} else {
				players.forEach(player => {
					let newDiv = document.createElement("div")
					newDiv.innerText = player

					// is the current player
					if (player === player_id) {
						let readyButton = document.createElement("button")
						readyButton.setAttribute("id", "readyButton")

						if (readiedPlayers.includes(player)) {
							readyButton.innerText = "unready"
							readyButton.onclick = unready
						}
						else {
							readyButton.innerText = "ready"
							readyButton.onclick = ready
						}

						newDiv.append(readyButton)
					} else if (readiedPlayers.includes(player)) {
						let newP = document.createElement("p")
						newP.innerText = "ready"

						newDiv.append(newP)
					}
					playerList.append(newDiv)
				});
			}
		}

		const loadCurrentGameList = (games) => {

			if (!games.length) {
				games.innerHTML = "No matches in play"
			} else {
				games.forEach(game => {
					let newDiv = document.createElement("div")

					let id = game["game_id"]

					let players = game["players"]
					let vsTitle = players.join(" vs ")

					let idDiv = document.createElement("div")
					idDiv.innerText = `Game ID: ${id}`

					let vsTitleDiv = document.createElement("vsTitle")
					vsTitleDiv.innerText = vsTitle

					newDiv.append(idDiv)
					newDiv.append(vsTitleDiv)

					if (players.includes(player_id)) {
						// what are you doing here? go play your match!
						redirect(`/tournament/${tournamentID}/match/${id}`)
						return
					} else {
						let spectateButton = document.createElement("button")
						spectateButton.innerText = "spectate"

						spectateButton.onclick = () => {
							console.log("spectating comes, eventually")
							// redirect(`/tournament/${tournamentID}/match/${id}`)
						}

						newDiv.append(spectateButton)
					}

					currentPlayingDiv.append(newDiv)
				})
			}
		}

		const loadPlayedlist = (previousRounds) => {
			let rounds = 0

			if (!previousRounds.length) {
				previousMatchesDiv.innerHTML = "No matches played yet"
			} else {
				previousRounds.forEach(previousRound => {
					let newTitle = document.createElement("h4")
					++rounds
					newTitle.innerText = `Round ${rounds}`
					previousMatchesDiv.append(newTitle)

					previousRound.forEach(match => {
						let newDiv = document.createElement("div")
	
						let historyIdDiv = document.createElement("div")
						historyIdDiv.innerText = `Game ID: ${match["id"]}`
	
						let attackerSideDiv = document.createElement("div")
						let attacker = match["sides"]["attacker"]
						let attackerScore = match["score"]["attacker"]
						attackerSideDiv.innerText = `Player ${attacker} Score : ${attackerScore}`
	
						let defenderSideDiv = document.createElement("div")
						let defender = match["sides"]["defender"]
						let defenderScore = match["score"]["defender"]
						defenderSideDiv.innerText = `Player ${defender} Score : ${defenderScore}`
	
						let winnerDiv = document.createElement("div")
						let winner = match["winner"]
						winnerDiv.innerText = `Winner : ${winner}`

						newDiv.append(historyIdDiv)
						newDiv.append(attackerSideDiv)
						newDiv.append(defenderSideDiv)
						newDiv.append(winnerDiv)
						previousMatchesDiv.append(newDiv)
					})
				});
			}
		}

		const loadTournamentData = (data) => {
			statusTag.innerHTML = data["started"] ? "In Progress" : "Waiting Players"
			previousMatchesDiv.innerHTML = ''
			currentPlayingDiv.innerHTML = ''

			let players = data["players"]
			let readiedPlayers = data["ready"]
			loadPlayerList(players, readiedPlayers)

			let previousMatchesList = data["previousMatches"]
			loadPlayedlist(previousMatchesList)

			let currentPlayingList = data["matches"]
			loadCurrentGameList(currentPlayingList)
		}

		const setStatusMessage = (message) => {
			statusTag.innerHTML = message
		}

		const getData = async () => {
			try {
				const response = await fetch(
					`https://localhost:8000/api/tournament/${tournamentID}`
				)

				if (!response.ok) {
					throw "panic"
				}

				const data = await response.json()
				loadTournamentData(data)
			}
			catch (e) {
				console.log(e)
				statusTag.innerText = "Tournament not found"
			}
		}

		const connectToWebsocket = async () => {
			tournamentSocket = new WebSocket(`ws://localhost:8000/tournament/${tournamentID}`)
			
			tournamentSocket.onerror = () => {
				console.log("uh oh stinky")
			}

			tournamentSocket.onopen = () => {
				sendMessage({
					"command": "join",
					"username": player_id // remember to do funny jwt here
				})
			}

			tournamentSocket.onclose = () => {
				console.log("womp womp")
			}

			tournamentSocket.onmessage = (e) => {
				const data = JSON.parse(e.data)

				const status = data["status"]

				switch (status)
				{
					case "error":
						let tournamentDetails = document.getElementById("tournamentDetails")
						tournamentDetails.innerText = data["message"]
						break
					case "refresh":
						getData()
						break
					case "playerList":
						loadPlayerList(data["players"], data["ready"])
						break
					case "timer":
						setStatusMessage(data["message"])
						break
					case "cancel":
						setStatusMessage("Waiting for enough people to ready up...")
						break
					case "leave":
						history.back()
						break
					case "winner":
						setStatusMessage(`The winner of the tournament is Player ${data["winner"]}</br>The tournament room will close in ${data["time"]} second`)
						break
				}
			}
		}

		getData()
		connectToWebsocket()
	}

	let cleanup = () => {
		if (tournamentSocket)
			tournamentSocket.close()
	}

	return [prerender, render_code, postrender, cleanup]
}