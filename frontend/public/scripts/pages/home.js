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
            <div class="col-md-4 mb-3" id="pongGame">${createButton('Pong', 'flex-grow-1 ui-btn btn-block')}</div>
            <div class="col-md-4 mb-3" id="apongUsGame">${createButton('APong Us', 'flex-grow-1 ui-btn btn-block')}</div>
            <div class="col-md-4 mb-3" id="tournament">${createButton('Tournament', 'flex-grow-1 ui-btn btn-block')}</div>
            <div class="col-md-4 mb-3" id="language">${createButton('Language', 'flex-grow-1 ui-btn btn-block')}</div>
            <div class="col-md-4 mb-3" id="profile">${createButton('Profile', 'flex-grow-1 ui-btn btn-block')}</div>
            <div class="col-md-4 mb-3" id="friends">${createButton('Friends....?', 'flex-grow-1 ui-btn btn-block')}</div>
        </div>
		`
	}

	let postrender = () => {
		const	pongGame = async () => {
			alert("Playing the PONG game")
		}

		const	ApongUsGame = async () => {
			alert('Entering APONG US game')
		}

		const	 go_profile = async () => {
			console.log("clicked");
			redirect("/profile")
		}

		const	 go_friends = async () => {
			redirect("/friendlist")
		}

		const profile_button = document.getElementById("profile")
		profile_button.addEventListener('click', go_profile)

		const friend_button = document.getElementById("friends")
		friend_button.addEventListener('click', go_friends)

		const pong_button = document.getElementById("pongGame")
		pong_button.addEventListener('click', pongGame)
		
		const apongUs_button = document.getElementById("apongUsGame")
		apongUs_button.addEventListener('click', ApongUsGame)
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}