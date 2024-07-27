import generateUserTabs from "../../components/userTab.js"
import { getUserTab } from "../../components/userTab.js"
import { fetchMod, getJwtToken } from "../../jwt.js"
import { redirect, redirect_without_history } from "../../router.js"
import drawPieChartData from "../profile/components/pieChartData.js"
import { appendOngoingMatchup, appendTournamentScreen, generateTournamentScreen } from "./components/roundGenerator.js"

export default function tournament(prop={}) {
	const tournamentID = (prop["arguments"]) ? (prop["arguments"]["tournament_id"]) : undefined

	let tournamentSocket = undefined
	let goingToBattle = false

	let yourName = undefined

	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = async () => {
		if (tournamentID === undefined)
		{
			history.back()
			return false
		}

		try {
			const me_response = await fetchMod(`http://localhost:8000/api/me`)
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
			<div class='col-sm d-flex flex-row flex-grow-1 flex-shrink-1 tournamentProgress' id="tournament-rounds">
				<div>
					Tournament has not started
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

	const getPlayersData = async (username) => {
		try {
			const response = await fetchMod(
				`http://localhost:8000/api/player/${username}`
			)

			if (!response.ok) {
				throw response
			}

			const data = await response.json()
			return data
		} catch (response) {
			console.log(response)
			if (response.status === 404) {
				console.error('dont know who that is')
			}
		}
	}

	const getTournamentData = async() => {
		try {
			const response = await fetchMod(
				`http://localhost:8000/api/tournament/${tournamentID}`
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
		}
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		let tournamentScreen = document.getElementById('tournament-rounds')
		let playerList = document.getElementById('playersList')
		let readyButton = document.getElementById('readybutton')

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

			const gatherPlayersData = async () => {
				return await Promise.all(
					players.map(async (username) => await getPlayersData(username))
				)
			}


			gatherPlayersData().then(
				(playerDatas) => {
					let userTabs = generateUserTabs(playerDatas)

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
			)
		}

		const loadCurrentGameList = (games) => {
			if (!games.length)
				return

			let newRoundPlayers = games.map((game) => {
				return game.players
			})
			console.log(newRoundPlayers)

			appendTournamentScreen(tournamentScreen, newRoundPlayers)

			const onClickGenerator = (gameID) => () => {
				redirect(`/match/${gameID}`, {
					'arguments': {
						'tournament_id': tournamentID
					}
				})
			}

			let newRoundMatches = []

			for (let game of games) {
				let gameID = game.game_id
				if (game.players.includes(yourName)) {
					redirect(`/match/${gameID}`, {
						'arguments': {
							'tournament_id': tournamentID
						}
					})
					return
				}
				newRoundMatches.push(gameID)
			}

			appendOngoingMatchup(tournamentScreen, newRoundMatches, onClickGenerator)
		}

		const loadPlayedList = (previousRounds) => {
			tournamentScreen.innerHTML = ''
		}

		const loadTournamentData = (data) => {
			let { started, players, ready, previousMatches, matches } = data
			loadPlayerList(players, ready)
			loadPlayedList(previousMatches)
			loadCurrentGameList(matches)
		}

		const refreshTournamentData = () => {
			getTournamentData().then(
				(data) => {
					loadTournamentData(data)
				}
			)
		}

		const connectToWebsocket = async () => {
			tournamentSocket = new WebSocket(`ws://localhost:8000/tournament/${tournamentID}`)
			
			tournamentSocket.onerror = () => {
				console.log("uh oh stinky")
			}

			tournamentSocket.onopen = () => {
				sendMessage({
					"command": "join",
					'jwt': getJwtToken()
				})
			}

			tournamentSocket.onclose = () => {
				console.log("Tournament socket closed")
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
						refreshTournamentData()
						break
					case "playerList":
						loadPlayerList(data["players"], data["ready"])
						break
					case "timer":
						console.log('Implement me Later')
						break
					case "cancel":
						console.log('Implement Me Later')
						// setStatusMessage("Waiting for enough people to ready up...")
						break
					case "leave":
						history.back()
						break
					case "winner":
						console.log('win')
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