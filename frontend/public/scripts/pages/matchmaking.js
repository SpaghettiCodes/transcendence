import { fetchMod } from "../jwt.js"
import { redirect, redirect_without_history } from "../router.js"

export default function template(prop={}) {
	let gameType = (prop.arguments) ? (prop.arguments.game_type) : undefined

	
	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = async () => {
		if (!gameType) {
			history.back()
			return false
		}
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `
        <div id="mm">
            <div class="white-bar top-bar"></div>
            <div class="content container text-white">
                <p>MATCHMAKING</p>
            </div>
            <div class="white-bar bottom-bar"></div>
        </div>
        `
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		const matchmakingGame = async (type) => {
			try {
				const response = await fetchMod(`http://localhost:8000/api/match?type=${type}`, {
					method: "GET"
				})
				if (!response.ok) {
					throw response
				}
				const data = await response.json()
				const game_id = data.game_id

				redirect_without_history(`/match/${game_id}`)
			} catch (e) {
				console.log(e)
				history.back()
			}
		}

		const matchmakingTournament = async () => {
			try {
				const response = await fetchMod('http://localhost:8000/api/tournament', {
					method: "GET"
				})
				if (!response.ok) {
					throw response
				}
				const data = await response.json()
				const tournamentID = data.tournament_id

				redirect_without_history(`/tournament/${tournamentID}`)
			} catch (e) {
				console.log(e)
				history.back()
			}
		}

		switch (gameType) {
			case ('pong'):
			case ('apong'):
				matchmakingGame(gameType)
				break
			case ('tournament'):
				matchmakingTournament()
				break
			default:
				console.log('idk whats that')
				history.back()
				break
		}
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}