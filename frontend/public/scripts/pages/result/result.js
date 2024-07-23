import { fetchMod } from "../../jwt.js"
import { redirect } from "../../router.js"
import playerDetailsDiv from "./components/playerDiv.js"

export default function result(prop={}) {
	let game_id = (prop['arguments']) ? (prop['arguments']['game_id']) : undefined

	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = async () => {
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `
		<div class='resultDiv align-self-stretch d-flex flex-column vh-100 text-white'>
			<div class='statusDiv text-center flex-grow-1 fw-bold' id='statusDiv'>RESULTS</div>
			<div class='d-flex' id='playerScoreField'>
					<div class='scoreDiv text-center flex-grow-1' id='attackerScoreDiv'></div>
					<div class='scoreDiv'>:</div>
					<div class='scoreDiv text-center flex-grow-1' id='defenderScoreDiv'></div>
			</div>
			<div class='resultDiv d-flex flex-grow-2' id='playerDetailsField'></div>
		</div>`
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		const playerScoreField = document.getElementById('playerScoreField')
		const playerDetailsField = document.getElementById('playerDetailsField')
		const statusDiv = document.getElementById('statusDiv')

		// TEMP
		let username = localStorage.getItem('username')

		const displayData = (matchResult) => {
			let { attacker, attacker_score, defender, defender_score, winner, loser, reason } = matchResult

			let attackerScoreField = document.getElementById('attackerScoreDiv')
			attackerScoreField.innerText = attacker_score
			let defenderScoreField = document.getElementById('defenderScoreDiv')
			defenderScoreField.innerText = defender_score

			let attackerDetails = new playerDetailsDiv()
			attackerDetails.setData(attacker, username)

			let defenderDetails = new playerDetailsDiv()
			defenderDetails.setData(defender, username)

			playerDetailsField.appendChild(attackerDetails.mainDiv)
			playerDetailsField.appendChild(defenderDetails.mainDiv)

			if (reason === 'draw') {
				statusDiv.innerText = 'DRAW'
			}
			else if (winner === username) {
				statusDiv.innerText = 'YOU WIN'
			} else if (loser === username) {
				if (reason === 'normal') {
					statusDiv.innerText = 'YOU LOSE'
				} else if (reason === 'forfeited') {
					statusDiv.innerText = 'FORFEITED'
				}
			}
		}

		const displayStillOnGoing = () => {
			statusDiv.innerText = 'MATCH STILL ONGOING'

			playerScoreField.remove()
			playerDetailsField.remove()

			const watchField = document.createElement('div')
			watchField.setAttribute('class', 'text-center watchPrompt')
			watchField.innerText = 'Click here to watch the game'
			watchField.onclick = () => {
				redirect(`/match/${game_id}/spectate`)
			}
			statusDiv.appendChild(watchField)
		}

		const getGameResult = async () => {
			try {
				let response = await fetchMod(
					`http://localhost:8000/api/match/${game_id}/result`,
					{
						method: "GET",
					}
				)
				if (!response.ok)
					throw response

				let data = await response.json()
				let matchResult = data['result']
				let matchStatus = data['status']

				if (matchStatus === 'ongoing') {
					displayStillOnGoing()
					return
				}
				displayData(matchResult)
			} catch (e) {
				console.log(e)
			}
		}

		getGameResult()
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
} 