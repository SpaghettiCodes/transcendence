import { createButton } from "../components/elements.js"
import { redirect } from "../router.js"

export default function home(prop={}) {
	let prerender = async () => {
		return true
	}

	let render_code = () => {
		return `
		<div class="text-center mb-5">
            <h1 class="header-font">APONG US</h1>
        </div>
        <div id="content" class="row width-80 text-center">
            <div class="col-md-4 mb-3 align-self-center" id="pongGame">${createButton('flex-grow-1 ui-btn btn-block', 'button',  'Pong',undefined)}</div>
            <div class="col-md-4 mb-3 align-self-center" id="apongUsGame">${createButton('flex-grow-1 ui-btn btn-block', 'button', 'APong Us',undefined)}</div>
            <div class="col-md-4 mb-3 align-self-center" id="tournament">${createButton('flex-grow-1 ui-btn btn-block', 'button', 'Tournament',undefined)}</div>
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