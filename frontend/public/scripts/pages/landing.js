import { redirect, redirect_without_history } from "../router.js"
import { getJwtToken, removeJWTPair, setJwtToken, setRefreshToken } from "../jwt.js"
import { createButton, createInput } from "../components/elements.js"
import createInputFields from "../components/inputFields.js"
import { connectToPlayerNotificationWebsocket, disconnectPlayerNotificationWebsocket } from "./playerNoti.js"

// env var, remove when done
// note to self: DO NOT, PUSH, TO GITHUB

export default function landing(prop={}) {
	let prerender = async () => {
		removeJWTPair()
		disconnectPlayerNotificationWebsocket()
		return true
	}

	let render_code = () => {
		return`
		<div class="text-center">
			<h1 class="header-font">APONG US</h1>
		</div>
		<div class="d-flex flex-column align-items-stretch lowered gap-3 landingPageMain">
			${createInputFields(
				createInput('landing-ui-var input', 'username', 'username', 'username','Crewmate ID'),
				'ID',
				'landing-ui-var inputText',
				'input-fields gap-2',
				'fw-bold hide landing-ui-var text-danger text-center errorMsg',
				'usernameError'
			)}
			${createInputFields(
				createInput('landing-ui-var input', 'password', 'password', 'password','Crewmate Password'),
				'Password',
				'landing-ui-var inputText',
				'input-fields gap-2',
				'fw-bold hide landing-ui-var text-danger text-center errorMsg',
				'passwordError'
			)}
			<h3 class='hide landing-ui-var errorBoard fw-bold text-center text-danger' id='errorMsgBoard'>Test</h3>
			<div class='d-flex gap-4'>
				${createButton('ui-btn btn-outline-light flex-grow-1', undefined, 'Login', 'login')}
				${createButton('ui-btn btn-outline-light flex-grow-1', undefined ,'Sign up', 'sign-up')}
			</div>
			${createButton('ui-btn btn-outline-light btn-sm mt-5', undefined, 'Login via 42','42login')}
		</div>
		`
	}

	let postrender = () => {
		const loginButton = document.getElementById("login")
		const signUpButton = document.getElementById('sign-up')
		const ftlogin = document.getElementById("42login")
		const errorMsgBoard = document.getElementById('errorMsgBoard')
		const usernameError = document.getElementById('usernameError')
		const passwordError = document.getElementById('passwordError')
		
		const clearErrorMsg = () => {
			errorMsgBoard.innerText = ''
			usernameError.innerText = ''
			passwordError.innerText = ''
		}

		const showErrorMsg = (errorElement, msg) => {
			errorElement.classList.remove('hide')
			errorElement.innerText = msg
		}

		const getFieldValues = () => {
			let usernameInput = document.getElementById("username")
			let passwordInput = document.getElementById("password")

			const username = usernameInput.value
			const password = passwordInput.value

			let error = !username || !password
			if (!username) {
				showErrorMsg(usernameError, 'Username cannot be empty!')
			}
			if (!password) {
				showErrorMsg(passwordError, 'Password cannot be empty!')
			}

			return { username, password, error }
		}

		const login_action = (e) => {
			e.preventDefault()
			clearErrorMsg()
			let { username, password, error } = getFieldValues()
			if (error)
				return

			loginButton.disabled = true
			fetch('https://localhost:8000/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					'username': username,
					'password': password
				})
			}).then((result) => {
				if (!result.ok) {
					throw result
				}
				return result.json()
			}).then(
				(result) => {
					setJwtToken(result.data.access)
					setRefreshToken(result.data.refresh)
					connectToPlayerNotificationWebsocket()
					redirect('/home')
				}
			).catch((error) => {
				console.log(error)
				if (error.status === 404) {
					showErrorMsg(errorMsgBoard, 'Cannot find crewmate')
				} else if (error.status === 401) {
					showErrorMsg(errorMsgBoard, 'Incorrect Password')
				} else if (error.status === 403) {
					// forbidden, guy has 2fa on
					redirect_without_history('/auth/2fa', {username: username})
				} else if (error.status === 500) {
					showErrorMsg(errorMsgBoard, 'The server has failed you')
				}
				loginButton.disabled = false
			})
		}

		const sign_up_behavior = async (e) => {
			e.preventDefault()
			clearErrorMsg()
			let { username, password, error } = getFieldValues()
			if (error)
				return

			signUpButton.disabled = true
			fetch('https://localhost:8000/api/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					'username': username,
					'password': password
				})
			}).then((result) => {
				if (!result.ok) {
					throw result
				}
				return result.json()
			}).then((result) => {
					setJwtToken(result.data.access)
					setRefreshToken(result.data.refresh)
					connectToPlayerNotificationWebsocket()
					redirect('/home')
				}
			).catch(async (error) => {
				console.log(error)
				if (error.status === 404) {
				} else if (error.status === 409) {
					showErrorMsg(errorMsgBoard, 'Player with that username already exist')
				} else if (error.status === 400) {
					let response = await error.json()
					console.log(response)
					let reason = response.reason
					let { password, username } = reason
					if (username) 
						showErrorMsg(usernameError, username[0])
					else if (password)
						showErrorMsg(passwordError, password[0])
				}
				signUpButton.disabled = false
			})
		}

		const	fortytwo_login = async (e) => {
			e.preventDefault()
			clearErrorMsg()

			// get environmental variables
			const response = await fetch(
				"https://localhost:8000/api/ft/env",
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

		loginButton.onclick = login_action
		signUpButton.onclick = sign_up_behavior
		ftlogin.onclick = fortytwo_login
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}