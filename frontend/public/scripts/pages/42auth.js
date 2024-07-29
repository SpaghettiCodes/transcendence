import { setJwtToken, setRefreshToken } from "../jwt.js"
import { redirect, redirect_replace_history } from "../router.js"

export default function ftlogin(prop={}) {
	const urlParams = new URLSearchParams(window.location.search)
	let code = urlParams.get('code')
	let ftCode = undefined

	let prerender = async () => {
		// if (!code) {
		// 	console.log("Go get your 42 auth code!")
		// 	redirect('/')
		// 	return false
		// }
		return true
	}

	let render_code = () => {
		return `
		<div class='d-flex flex-column gap-5 align-items-center overflow-auto' id='main'>
			<h2 id='message'>
				Login You In Rn...
			</h2>

			<div class='hide' id='registerPlayerTrigger'>
				<form class='d-flex flex-column gap-2 align-items-stretch' id='registerPlayer'>
					<h2>
						Unregistered! Fill in register details below
					</h2>
					<div class='inputFields'>
						<label for='username'>Username</label>
						<input type='text' name='username' id='username' value=''>
					</div>
					<div class='inputFields'>
						<label for='username'>Password</label>
						<input type='text' name='password' id='password' value=''>
					</div>
					<input type='submit' id='submitData' value='Submit'>
				</form>
			</div>
		</div>
		`
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

			await linkWithFTCode(ftCode, access)
		}
		catch (err) {
			if (err.status === 404) {
				console.log("You have not registered b4")
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
		document.getElementById('registerPlayer').addEventListener('submit', (e) => {
			e.preventDefault()
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