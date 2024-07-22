import { createButton } from "../components/elements.js"
import { redirect } from "../router.js"

export default function home(prop={}) {
	let prerender = () => {
		return true
	}

	let render_code = () => {
		return `
		<div class="text-center mb-5">
            <h1 class="header-font">APONG US</h1>
        </div>
        <div id="content" class="row width-80 text-center">
            <div class="col-md-4 mb-3 align-self-center" id="pongGame">${createButton('Pong', 'flex-grow-1 ui-btn btn-block')}</div>
            <div class="col-md-4 mb-3 align-self-center" id="apongUsGame">${createButton('APong Us', 'flex-grow-1 ui-btn btn-block')}</div>
            <div class="col-md-4 mb-3 align-self-center" id="tournament">${createButton('Tournament', 'flex-grow-1 ui-btn btn-block')}</div>
            <div class="col-md-4 mb-3 align-self-center" id="language">${createButton('Language', 'flex-grow-1 ui-btn btn-block')}</div>
            <div class="col-md-4 mb-3 align-self-center" id="profile">${createButton('Profile', 'flex-grow-1 ui-btn btn-block')}</div>
            <div class="col-md-4 mb-3 align-self-center" id="friends">${createButton('Friends....?', 'flex-grow-1 ui-btn btn-block')}</div>
            <div class="col-md-12 mb-3 align-self-center" id="chat">${createButton('Send distress signal', 'flex-grow-1 ui-btn btn-block')}</div>
        </div>
		`
	}

	let postrender = () => {
		const	matchmakePong = () => {
			alert("Playing the PONG game")
		}

		const	matchmakeApong = () => {
			alert('Entering APONG US game')
		}

		const	 go_profile = () => {
			console.log("clicked");
			redirect("/profile")
		}

		const	 go_friends = () => {
			redirect("/friends")
		}

		const 	matchmakeTournamnet = () => {
			alert('matchmaking for tournament')
		}

		const	changeLanguage = () => {
			alert('Soon!')
		}

		const	chatWithFriends = () => {
			redirect('/chat')
		}

		const profile_button = document.getElementById("profile")
		profile_button.addEventListener('click', go_profile)

		const friend_button = document.getElementById("friends")
		friend_button.addEventListener('click', go_friends)

		const pong_button = document.getElementById("pongGame")
		pong_button.addEventListener('click', matchmakePong)

		const apong_button = document.getElementById("apongUsGame")
		apong_button.addEventListener('click', matchmakeApong)

		const tournament_button = document.getElementById("tournament")
		tournament_button.addEventListener('click', matchmakeTournamnet)

		const language_button = document.getElementById("language")
		language_button.addEventListener('click', changeLanguage)

		const chat_button = document.getElementById("chat")
		chat_button.addEventListener('click', chatWithFriends)
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}