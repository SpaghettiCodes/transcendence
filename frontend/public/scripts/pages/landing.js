import { redirect } from "../router.js"
import { createButton, createInput } from "../components/elements.js"

// env var, remove when done
// note to self: DO NOT, PUSH, TO GITHUB

export default function landing(prop={}) {
	let prerender = () => {
		return true
	}

	let render_code = () => {
		return`
		<div class="text-center mb-3">
            <h1 class="header-font">APONG US</h1>
        </div>
        <div class="d-flex flex-column align-items-center lowered">
            <div class="mb-3 mt-3">
                <label for="email" class="form-label">ID:</label>
                ${createInput('form-control', 'username', 'email', 'email', 'Crewmate ID')}
                <label for="pwd" class="form-label">Password:</label>
                ${createInput('form-control', 'password', 'pwd', 'pswd' ,'Crewmate Password')}
            </div>
            <div>
                ${createButton('Login', 'btn-outline-light')}
                ${createButton('Sign up', 'btn-outline-light')}
            </div>
            <div class="mb-3 mt-3">
                ${createButton('Login via 42', 'btn-outline-light btn-sm')}
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