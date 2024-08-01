import { createButton } from "../components/elements.js"
import { fetchMod } from "../jwt.js"
import { redirect } from "../router.js"

export default function home(prop={}) {
	let pong = false
	let apong = false
	let tournament = false

	let prerender = async () => {
		const response = await fetchMod("https://localhost:8000/api/match/ongoing");
		
		if (!response.ok) {
			return true // welp, forget everything and leave
		}

		const value = await response.json()
		pong = value.pong
		apong = value.apong
		tournament = value.tournament
		return true
	}

	let render_code = () => {
		return `
		<div class="text-center mb-5">
            <h1 class="header-font">APONG US</h1>
        </div>
        <div id="content" class="row width-80 text-center">
            <div class="col-md-4 mb-3 align-self-center" id="pongGame">${createButton('flex-grow-1 ui-btn btn-block', 'button',
				pong ? 'Pong (reconnect)' : 'Pong', undefined)}</div>
            <div class="col-md-4 mb-3 align-self-center" id="apongUsGame">${createButton('flex-grow-1 ui-btn btn-block', 'button',
				apong ? 'APong Us (reconnect)' : 'APong Us', undefined)}</div>
            <div class="col-md-4 mb-3 align-self-center" id="tournament">${createButton('flex-grow-1 ui-btn btn-block', 'button',
				tournament ? 'Tournament (reconnect)' : 'Tournament', undefined)}</div>
            <div class="col-md-4 mb-3 align-self-center" id="profile">${createButton('flex-grow-1 ui-btn btn-block', 'button', 'Profile', undefined)}</div>
            <div class="col-md-4 mb-3 align-self-center" id="friends">${createButton('flex-grow-1 ui-btn btn-block', 'button','Friends....?', undefined)}</div>
            <div class="col-md-4 mb-3 align-self-center" id="chat">${createButton('flex-grow-1 ui-btn btn-block', 'button', 'Send distress signal', undefined)}</div>
        </div>
		`
	}

	let postrender = () => {
		const	matchmakePong = () => {
			redirect('/matchmaking/pong')
		}

		const	matchmakeApong = () => {
			redirect('/matchmaking/apong')
		}

		const	 go_profile = () => {
			console.log("clicked");
			redirect("/profile")
		}

		const	 go_friends = () => {
			redirect("/friends")
		}

		const 	matchmakeTournamnet = () => {
			redirect('/matchmaking/tournament')
		}

		const	changeLanguage = () => {
			alert('Soon!')
		}

		const	chatWithFriends = () => {
			redirect('/chat')
		}

		const profile_button = document.getElementById("profile")
		profile_button.onclick = go_profile

		const friend_button = document.getElementById("friends")
		friend_button.onclick = go_friends

		const pong_button = document.getElementById("pongGame")
		pong_button.onclick = matchmakePong

		const apong_button = document.getElementById("apongUsGame")
		apong_button.onclick = matchmakeApong

		const tournament_button = document.getElementById("tournament")
		tournament_button.onclick = matchmakeTournamnet

		const chat_button = document.getElementById("chat")
		chat_button.onclick = chatWithFriends
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}