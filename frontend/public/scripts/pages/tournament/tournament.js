import generateUserTabs from "../../components/userTab.js"
import { redirect } from "../../router.js"
import { generateTournamentScreen, roundGenerator } from "./components/roundGenerator.js"

export default function tournament(prop={}) {
	const tournamentID = (prop["arguments"]) ? (prop["arguments"]["tournament_id"]) : undefined

	let tournamentSocket = undefined
	let goingToBattle = false

	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = async () => {
		if (tournamentID === undefined)
		{
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
				<div class='d-flex flex-column overflow-y-auto' id='playersList'>
				</div>
			</div>
		</div>
		`
	}



	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		let tournamentScreen = document.getElementById('tournament-rounds')
		generateTournamentScreen(
			tournamentScreen,
			[
			[
				[0, 1], [2, 3]
			],
			[
				[2, 3]
			],
			[ ['winner'] ],
		])

		let playerTabs = generateUserTabs([], () => {})
		if (playerTabs.length)
			document.getElementById('playersList').appendChild(
				...playerTabs
			)
		else
			document.getElementById('playersList').innerText = 'Empty!'
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}