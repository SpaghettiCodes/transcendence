import { redirect } from "../router.js"

export default function ftlogin(prop={}) {
	let prerender = async () => {
		return true
	}

	let render_code = () => {
		return `
		<div class='d-flex overflow-auto' id='main'>
			<div id='message'>
				Login You In Rn...
			</div>
		</div>
		`
	}

	let get_ft_code = async (code) => {
		try
		{
			let payload = {
				"code" : code
			}

			const response = await fetch(
				"http://localhost:8000/api/ft/auth",
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

			payload = {
				"code": access_token
			}

			const get_me = await fetch(
				"http://localhost:8000/api/ft/me",
				{
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(payload)
				}
			)
			if (!get_me.ok) {
				throw get_me
			}

			data = await get_me.json()
			const mainElement = document.getElementById('main')
			const element = document.getElementById("message")
			const funnyMessage = document.createElement('h1')
			funnyMessage.innerText = "LOOK AT ALL THESE DATA"
			funnyMessage.style.fontSize = `15vh`
			funnyMessage.style.color = `white`
			mainElement.prepend(funnyMessage)
			element.innerText = JSON.stringify(data)
		}
		catch (err) {
			const element = document.getElementById("message")
			element.innerText = JSON.stringify(err)
		}
	}

	let postrender = () => {
		const queryString = window.location.search
		const urlParams = new URLSearchParams(queryString)

		console.log(queryString)
		const code = urlParams.get('code')
		if (!code) {
			console.log("Go get your 42 auth code!")
			redirect('/')
			return
		}
		get_ft_code(code)
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}