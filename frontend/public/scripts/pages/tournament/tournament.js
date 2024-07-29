import generateUserTabs from "../../components/userTab.js"
import { fetchMod, getJwtToken } from "../../jwt.js"
import { redirect, redirect_replace_history, redirect_without_history } from "../../router.js"
import { everyElementContains, pairElements } from "../helpers.js"
import { appendOngoingMatchup, appendTournamentScreen, generateTournamentScreen } from "./components/roundGenerator.js"

export default function tournament(prop={}) {
	const tournamentID = (prop["arguments"]) ? (prop["arguments"]["tournament_id"]) : undefined
	const spectating = (prop['arguments']) ? prop['arguments']['spectate'] ? true : false : false

	let tournamentSocket = undefined
	let goingToBattle = false

	let currentPathName = window.location.pathname

	let yourName = undefined

	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = async () => {
		if (tournamentID === undefined)
		{
			history.back()
			return false
		}

		try {
			const me_response = await fetchMod(`https://localhost:8000/api/me`)
			if (!me_response.ok)
				throw me_response
			let value = await me_response.json()
			yourName = value.username
		} catch (e) {
			console.log(e)
			if (e === 'redirected')
				return false
			history.back()
			return false
		}
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `
		<div class="container-fluid text-white text-center">
			<h1 class="title">Tournament</h1>
		</div>
		<div class="row container-fluid d-flex flex-row justify-content-center align-self-center overflow-y-auto flex-grow-1 gap-3 px-5 tournamentContents">
			<div class='d-flex flex-column col-sm'>
				<h2 id='status'>Tournament has not started</h2>
				<div class='col-sm d-flex flex-row flex-grow-1 flex-shrink-1 tournamentProgress' id="tournament-rounds">
				</div>
			</div>
			<div class="col-sm player-list rounded d-flex flex-column align-items-stretch flex-grow-1 overflow-y-hidden">
				<h4>Players</h4>
				<br>
				<div class='d-flex flex-grow-1 flex-column overflow-y-auto' id='playersList'>
				</div>
				<button class='rounded' id='readybutton'>Ready</button>
			</div>
		</div>
		`
	}

	const getTournamentData = async() => {
		try {
			const response = await fetchMod(
				`https://localhost:8000/api/tournament/${tournamentID}`
			)

			if (!response.ok) {
				throw response
			}

			const data = await response.json()
			return data
		} catch (response) {
			console.log(response)
			if (response.status === 404) {
				redirect_without_history('/error')
				throw 'redirected'
			}
			throw response
		}
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		let tournamentScreen = document.getElementById('tournament-rounds')
		let playerList = document.getElementById('playersList')

		let readyButton = document.getElementById('readybutton')
		if (spectating)
			readyButton.remove()

		let statusBar = document.getElementById('status')

		const sendMessage = (data) => {
			tournamentSocket.send(JSON.stringify(data))
		}

		let ready = () => {
			sendMessage({
				'command': 'ready',
			})
		}

		let unready = () => {
			sendMessage({
				'command': 'unready'
			})
		}

		const loadPlayerList = (players, readiedPlayers) => {
			// lazy fix, maybe i will revamp tournament and matches again
			// for now, this is the lazy fix

			let userTabs = generateUserTabs(players)

			playerList.innerHTML = ''
			if (userTabs.length) {
				for (let userTab of userTabs) {
					if ( readiedPlayers.includes(userTab.playerAssociated) )
						userTab.classList.add('ready')
					playerList.appendChild(userTab)
				}
			} else {
				playerList.innerHTML = "No one is in this tournament!"
			}

			if (readiedPlayers.includes(yourName)) {
				readyButton.onclick = unready
				readyButton.innerText = 'Unready'
			} else {
				readyButton.onclick = ready
				readyButton.innerText = 'Ready'
			}
		}

		const loadCurrentGameList = (games, previousRoundData) => {
			let newRoundPlayers = undefined
			if (previousRoundData === undefined){

				if (!games.length)
					return
	
				newRoundPlayers = games.map((game) => {
					return game.players
				})
			} else {
				newRoundPlayers = pairElements((previousRoundData.map(previousMatch => previousMatch.result.winner)))
			}

			appendTournamentScreen(tournamentScreen, newRoundPlayers)

			if (!games.length)
				return

			const onClickGenerator = (gameID) => () => {
				if (spectating) {
					redirect(`/match/${gameID}/spectate`)
				} else {
					redirect(`/match/${gameID}`)
				}
			}

			for (let game of games) {
				if (game.players.includes(yourName) && !game.ended) {
					redirect(`/match/${game.game_id}`, {}, currentPathName)
					return
				}
			}
			let newRoundMatches = newRoundPlayers.map(player => games.find(game => everyElementContains(game.players, player)).game_id)

			appendOngoingMatchup(tournamentScreen, newRoundMatches, onClickGenerator)
		}

		const loadPlayedList = (previousRounds) => {
			tournamentScreen.innerHTML = ''

			if (!previousRounds.length)
				return

			// prep data
			let payload = []
			let previousRoundData = undefined
			previousRounds.forEach((round) => {
				let roundData = []

				if (previousRoundData) {
					// need to do hocus pocus magic circus here
					roundData = pairElements((previousRoundData.map(previousMatch => previousMatch.result.winner)))
				} else {
					round.forEach((match) => {
						let matchData = []
						let { result } = match
						let { attacker, defender } = result
						matchData.push(attacker)
						matchData.push(defender)
						roundData.push(matchData)
					})
				}

				previousRoundData = round
				payload.push(roundData)
			})

			// throw into function
			generateTournamentScreen(
				tournamentScreen,
				payload
			)

			return previousRoundData
		}

		const loadTournamentData = (data) => {
			let { started, players, ready, previousMatches, matches } = data

			if (started)
				setStatusMessage('Waiting for players to ready up...')
			else
				setStatusMessage("Waiting for players...")

			loadPlayerList(players, ready)
			let lastMatchDetails = loadPlayedList(previousMatches)
			loadCurrentGameList(matches, lastMatchDetails)
		}

		const refreshTournamentData = () => {
			getTournamentData().then(
				(data) => {
					loadTournamentData(data)
				}
			)
		}

		const setStatusMessage = (msg) => {
			statusBar.innerText = msg
		}

		const connectToWebsocket = async () => {
			tournamentSocket = new WebSocket(`wss://localhost:8000/tournament/${tournamentID}`)
			
			tournamentSocket.onerror = () => {
				console.log("uh oh stinky")
			}

			tournamentSocket.onopen = () => {
				if (!spectating){
					sendMessage({
						"command": "join",
						'jwt': getJwtToken()
					})
				} else {
					sendMessage({
						"command": "spectate",
					})
				}
			}

			tournamentSocket.onclose = () => {
				console.log("Tournament socket closed")
			}

			tournamentSocket.onmessage = (e) => {
				const data = JSON.parse(e.data)

				const status = data["status"]

				switch (status)
				{
					case "loser":
						redirect_replace_history(`/tournament/${tournamentID}/spectate`)
						break
					case "error":
						setStatusMessage(data['message'])
						break
					case "refresh":
						refreshTournamentData()
						break
					case "playerList":
						loadPlayerList(data["players"], data["ready"])
						break
					case "timer":
						setStatusMessage(data['message'])
						break
					case "cancel":
						setStatusMessage("Waiting for enough people to ready up...")
						break
					case "leave":
						redirect_replace_history(`/tournament/${tournamentID}/results`)
						break
					case "winner":
						setStatusMessage(`${data['winner']['username']} wins the tournament`)
						break
				}
			}
		}

		getTournamentData().then(
			(data) => {
				loadTournamentData(data)
				connectToWebsocket()
			}
		)
	}

	let cleanup = () => {
		if (tournamentSocket) {
			tournamentSocket.close()
		}
	}

	return [prerender, render_code, postrender, cleanup]
}