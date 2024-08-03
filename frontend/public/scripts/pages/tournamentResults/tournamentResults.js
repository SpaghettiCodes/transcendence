import generateUserTabs from "../../components/userTab.js"
import { fetchMod } from "../../jwt.js"
import { redirect, redirect_without_history } from "../../router.js"
import { pairElements } from "../helpers.js"
import { generateTournamentScreen } from "../tournament/components/roundGenerator.js"

export default function tournamentResult(prop={}) {
	let tournament_id = (prop['arguments']) ? (prop['arguments']['tournament_id']) : undefined
	let yourName = undefined

	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = async () => {
		if (tournament_id === undefined) {
			history.back()
			return false
		}

		const response = await fetchMod("https://localhost:8000/api/me");
		const data = await response.json()
		console.log(data)
		yourName = data.username

		const resultResponse = await fetchMod(
			`https://localhost:8000/api/tournament/${tournament_id}/result`,
			{
				method: "GET",
			}
		)
		if (!resultResponse.ok) {
			if (resultResponse.status === 404) {
				redirect_without_history('/error')
				return false
			}
		}
		let resultData = await resultResponse.json()
		console.log(resultData)
		prop.data = {
			result: resultData.result,
		}

		return true
	}

	// return the html code here
	let render_code = () => {
		return `
		<h2>Tournament Results</h2>
		<div class='col-sm d-flex flex-row flex-grow-1 align-self-stretch tournamentProgress' id="tournamentHistory">
		</div>
		<div>
			<h3>Winner</h3>
			<div id='winner'>
			</div>
		</div>
		<div class='d-flex flex-column align-items-center' id='participants'>
			<h4>Participants</h4>
			<div class='d-flex flex-row gap-2' id='playerDiv'>
			</div>
		</div>
		<button class='btn btn-dark text-white my-3' id='home-button'>Back</button>
		`
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		let { result } = prop.data
		let { players, rounds, winner } = result

		function playerDivOnClickGenerator (data) {
			return (element) => () => {
				let playerUsername = data.username
				redirect(`/friends/${playerUsername}`)
			}
		}

		const loadPlayerList = (players) => {
			let userTabs = generateUserTabs(players, playerDivOnClickGenerator)

			let playerListDiv = document.getElementById('playerDiv')
			userTabs.forEach(userTab => {
				if (userTab.playerAssociated !== winner.username)
					playerListDiv.appendChild(userTab)
			}); 
		}

		const loadWinner = (player) => {
			let userTab = generateUserTabs([player], playerDivOnClickGenerator)[0]
			let winnerDiv = document.getElementById('winner')
			winnerDiv.append(userTab)
		}

		const loadMatchHistory = (matchHistory) => {
			let tournamentHistory = document.getElementById('tournamentHistory')

			let payload = []
			let previousRoundData = undefined
			matchHistory.forEach((round) => {
				let roundData = []

				console.log(previousRoundData)
				if (previousRoundData) {
					roundData = pairElements((previousRoundData.map(previousMatch => previousMatch.result.winner)))
				} else {
					let roundMatches = round.match
					roundMatches.forEach((match) => {
						let matchData = []
						let { result } = match
						let { attacker, defender } = result
						matchData.push(attacker.username)
						matchData.push(defender.username)
						roundData.push(matchData)
					})
				}
				previousRoundData = round.match
				payload.push(roundData)
			})
			// push winner as last data
			payload.push([[winner.username]])

			// throw into function
			generateTournamentScreen(
				tournamentHistory,
				payload
			)
		}

		loadPlayerList(players)
		loadWinner(winner)
		loadMatchHistory(rounds)
		document.getElementById('home-button').onclick = () => history.back()
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}