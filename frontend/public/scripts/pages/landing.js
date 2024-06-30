import { redirect } from "../router.js"

// env var, remove when done
// note to self: DO NOT, PUSH, TO GITHUB

export default function landing(prop={}) {
	let prerender = () => {
		return true
	}

	let render_code = () => {
		return `
		<div>
			<form id="login">
				<div class="input_field">
					<input type="text" name="username" placeholder="username" value="">
					<input type="text" name="password" placeholder="password" value="">
				</div>
				<div id="submit_button">
					<input type="submit" id="login" value="Sign In">
					<input type="submit" id="sign_up" value="Sign Up">
				</div>
			</form>
			<br>

			<div>
				<p id="42login">Log in via 42</p>
			</div>

			<h1>Testing</h1>
			<div>
				<a href="/games">List Games</a>
				<br>
				<a href="/chat">Chat</a>
			</div>
		</div>
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