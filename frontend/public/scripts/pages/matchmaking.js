import { fetchMod } from "../jwt.js"
import { redirect, redirect_replace_history } from "../router.js"

export default function template(prop={}) {
	let gameType = (prop.arguments) ? (prop.arguments.game_type) : undefined
	let inMatchmaking = true
	let disconnectUrl = undefined

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
            <div class="content container fw-bolder text-white">
                <h1>MATCHMAKING</h1>
            </div>
            <div class="white-bar bottom-bar"></div>
        </div>
        `
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		const matchmakingGame = async (type) => {
			try {
				disconnectUrl = `http://localhost:8000/api/match?type=${type}`

				const response = await fetchMod(`http://localhost:8000/api/match?type=${type}`, {
					method: "GET"
				})
				if (!response.ok) {
					throw response
				}

				if (response.status == 204) {
					console.log('Dematching')
					return
				}

				const data = await response.json()
				const game_id = data.game_id

				inMatchmaking = false
				redirect_replace_history(`/match/${game_id}`)
			} catch (e) {
				if (inMatchmaking) {
					inMatchmaking = false
					history.back()
				}
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

				inMatchmaking = false
				redirect_replace_history(`/tournament/${tournamentID}`)
			} catch (e) {
				if (inMatchmaking) {
					inMatchmaking = false
					history.back()
				}
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
				console.error('Invalid option for type')
				inMatchmaking = false
				history.back()
				break
		}
	}

	let cleanup = () => {
		if (inMatchmaking && disconnectUrl) {
			inMatchmaking = false
			fetchMod(disconnectUrl, {
				method: 'DELETE'
			}).then((e) => {
				console.log('Removed from matchmaking')
			}).catch((e) => {
				e
			})
		}
	}

	return [prerender, render_code, postrender, cleanup]
}