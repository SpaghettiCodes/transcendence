import { createButton, createInput } from "../components/elements.js"
import createInputFields from "../components/inputFields.js"
import { setJwtToken, setRefreshToken } from "../jwt.js"
import { redirect, redirect_replace_history } from "../router.js"
import { connectToPlayerNotificationWebsocket } from "./playerNoti.js"

export default function ftlogin(prop={}) {
	const urlParams = new URLSearchParams(window.location.search)
	let code = urlParams.get('code')
	let ftCode = undefined

	let prerender = async () => {
		if (!code) {
			console.log("Go get your 42 auth code!")
			redirect('/')
			return false
		}
		return true
	}

	let render_code = () => {
		return `
		<div class='d-flex flex-column gap-5 align-items-center overflow-auto' id='main'>
			<h2 id='message'>
				Login You In Rn...
			</h2>

			<div class='hide' id='registerPlayerTrigger'>
				<form class='d-flex flex-column gap-5 align-items-center' id='registerPlayer'>
					<h2>
						Unregistered! Fill in your profile details below
					</h2>
					<div class='d-flex flex-column landingPageMain gap-3'>
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
						${createButton('ui-btn btn-outline-light flex-grow-1', 'submit', 'Submit', 'submitData')}
					</div>
				</form>
			</div>
		</div>
		`
	}

	let usernameError = undefined
	let passwordError = undefined
	let errorMsgBoard = undefined
	
	const clearErrorMsg = () => {
		errorMsgBoard.innerText = ''
		usernameError.innerText = ''
		passwordError.innerText = ''
	}

	const showErrorMsg = (errorElement, msg) => {
		errorElement.classList.remove('hide')
		errorElement.innerText = msg
	}

	let getFTCode = async (code) => {
		try
		{
			let payload = {
				"code" : code
			}

			const response = await fetch(
				"https://localhost:8000/api/ft/auth",
				{
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(payload)
				}
			)

			if (!response.ok) {
				throw response
			}

			let data = await response.json()
			const access_token = data.access_token
			return access_token
		}
		catch (err) {
			if (err.status === 401) {
				document.getElementById('message').innerText = '401 Unauthorized'
				throw 404
			}
		}
	}

	let exchangeForPlayerCode = async (ftCode) => {
		try
		{
			const response = await fetch(
				"https://localhost:8000/api/ft",
				{
					method: "GET",
					headers: {
						'Authorization': `Bearer ${ftCode}`,
						'Content-Type': 'application/json',
					}
				}
			)

			if (!response.ok) {
				throw response
			}

			let result = await response.json()
			let { data } = result
			let { access, refresh } = data

			setJwtToken(access)
			setRefreshToken(refresh)
			connectToPlayerNotificationWebsocket()

			redirect_replace_history('/home')
			return
		}
		catch (err) {
			if (err.status === 404) {
				showRegisterForm()
			}
		}
	}

	let showRegisterForm = () => {
		document.getElementById('message').classList.add('hide')
		document.getElementById('registerPlayerTrigger').classList.remove('hide')
	}

	let registerNewPlayer = async (ftCode) => {
		try
		{
			const formData = new FormData(document.getElementById('registerPlayer')).entries()
			const data = Object.fromEntries(formData)

			const response = await fetch(
				"https://localhost:8000/api/register", {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(data)
				}
			)

			if (!response.ok) {
				throw response
			}

			let result = await response.json()
			let responseData = result.data
			let { access, refresh } = responseData

			setJwtToken(access)
			setRefreshToken(refresh)
			connectToPlayerNotificationWebsocket()

			await linkWithFTCode(ftCode, access)
		}
		catch (error) {
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
		}
	}

	let linkWithFTCode = async (ftCode, playerCode) => {
		try
		{
			const response = await fetch(
				"https://localhost:8000/api/ft", {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						'ft_code': ftCode,
						'player_code': playerCode
					})
				}
			)

			if (!response.ok) {
				throw response
			}

			redirect_replace_history('/home')
		}
		catch (err) {
			if (err.status === 404) {
				console.log("Linking with code failed, that shouldnt failed wdym it failed")
			} else if (err.status === 401) {
				console.log(await err.json())
			}
		}
	}

	let postrender = () => {
		usernameError = document.getElementById('usernameError')
		passwordError = document.getElementById('passwordError')
		errorMsgBoard = document.getElementById('errorMsgBoard')

		document.getElementById('registerPlayer').addEventListener('submit', (e) => {
			e.preventDefault()
			clearErrorMsg()
			registerNewPlayer(ftCode)
		})

		getFTCode(code).then((value) => {
			ftCode = value
			return exchangeForPlayerCode(ftCode)
		}).catch(e => {
			console.log(e)
		})
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}