import { fetchMod } from "../../jwt.js"
import { redirect } from "../../router.js"
import { scoreDetailsDiv } from "./components/scoreDetailsDiv.js"
import { playerViewProfileButtonID } from "./components/playerDiv.js"

export default function result(prop={}) {
	let game_id = (prop['arguments']) ? (prop['arguments']['game_id']) : undefined
	let yourName = undefined

	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = async () => {
		try {
			const response = await fetchMod("http://localhost:8000/api/me");
			if (!response.ok)
				throw response
			const data = await response.json()
			console.log(data)
			yourName = data.username
			console.log(yourName)

			const resultResponse = await fetchMod(
				`http://localhost:8000/api/match/${game_id}/result`,
				{
					method: "GET",
				}
			)
			if (!resultResponse.ok) 
				throw resultResponse
			let resultData = await resultResponse.json()
			prop.data = {
				result: resultData.result,
				status: resultData.status
			}

			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

	// return the html code here
	let render_code = () => {
		return `
		<div class='resultDiv align-self-stretch d-flex flex-column vh-100 text-white'>
			${scoreDetailsDiv(prop.data, yourName)}
		</div>`
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		let { attacker, defender } = prop.data.result
		let players = [attacker, defender]
		
		// set onclick event for buttons
		for (let player of players) {
			let playerUsername = player.username
			let viewProfileButton = document.getElementById(playerViewProfileButtonID(playerUsername))
			if (!viewProfileButton)
				continue
			viewProfileButton.onclick = () => {
				redirect(`/friends?search=${playerUsername}`)
			}
		}
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
} 