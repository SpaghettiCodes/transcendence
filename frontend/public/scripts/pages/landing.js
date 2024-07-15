import { redirect } from "../router.js"

// env var, remove when done
// note to self: DO NOT, PUSH, TO GITHUB

export default function landing(prop={}) {
	let prerender = () => {
		return true
	}

	let render_code = () => {
		return `
		<div class="container-fluid d-flex flex-column min-vh-100 justify-content-center align-items-center text-white">
			<div class="text-center mb-5">
				<h1 class="header-font">APONG US</h1>
			</div>
<<<<<<< HEAD:frontend/public/scripts/references/landing.js

			<h1>Testing</h1>
			<div>
				<a href="/match">List Games</a>
				<br>
				<a href="/chat">Chat</a>
				<br>
				<a href="/tournament">List Tournament</a>
			</div>
		</div>
=======
        <div class="video-container">
            <video autoplay muted loop id="bg-video">
                <source src="video/among_us.mp4" type="video/mp4">
                Your browser does not support HTML5 video.
            </video>
        </div>
		<div class="d-flex flex-column align-items-center lowered">
            <div class="mb-3 mt-3">
                <label for="email" class="form-label">ID:</label>
                <input type="username" class="form-control" id="email" placeholder="Crewmate id" name="email">
                <label for="pwd" class="form-label">Password:</label>
                <input type="password" class="form-control" id="pwd" placeholder="Crewmate Password" name="pswd">
            </div>
            <div>
                <button type="submit" class="btn btn-outline-light">Login</button> 
                <button type="submit" class="btn btn-outline-light">Sign up</button>
            </div>
            <div class="mb-3 mt-3">
                <button type="button" class="btn btn-outline-light btn-sm">Login via 42</button>
            </div>
        </div>
>>>>>>> html:frontend/public/scripts/pages/landing.js
		`
	}

	let postrender = () => {
		const	login_action = (e) => {
			e.preventDefault()
			let submit_div = document.getElementById("submit_button")
			submit_div.innerHTML = "<p>Loading...</p>"

			const loginData = new FormData(e.target)
			const username = loginData.get("username")
			const password = loginData.get("password")
			alert(`${username} and ${password}`)

			// fake delay "thumbsup"
			setTimeout(() => {submit_div.innerHTML = '<input type="submit" value="Sign In">'}, 2000);
		}

		const login_form = document.getElementById("login")
		login_form.addEventListener('submit', login_action)

		const	fortytwo_login = async (e) => {
			e.preventDefault()

			// get environmental variables
			const response = await fetch(
				"http://localhost:8000/api/ft/env",
				{
					method: "GET",
				}
			)
			const { clientuid, redirecturi, state } = await response.json()

			// what the fuck
			const	fortytwo_api = `https://api.intra.42.fr/oauth/authorize?`
			const	full_url = fortytwo_api + new URLSearchParams({
				client_id: clientuid,
				redirect_uri: redirecturi,
				scope: "public",
				state: state,
				response_type: "code"
			})

			// cant use get request here because it complains about fucking cor or something
			// pretty sure you are suppose to redirect it also, not use a get request
			// but the documentation saId to Use A Get requEST??
			// https://sentry.io/answers/why-does-my-javascript-code-receive-a-no-access-control-allow-origin-header-error-while-postman-does-not/
			// ...thank you 42 api
			window.location.href = full_url // redirect you to login and give access
		}

		const ftlogin = document.getElementById("42login")
		ftlogin.addEventListener('click', fortytwo_login)
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}