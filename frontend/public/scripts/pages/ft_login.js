export default function ftlogin(prop=undefined) {
	let prerender = () => {
	}

	let render_code = () => {
		return `
		<div>
			<p id="message">Login You In Rn...</p>
		</div>
		`
	}

	let get_ft_code = async (code) => {
		try
		{
			console.log(code)
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
				throw new Error(`${response.status}: ${response.statusText}`)
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

			data = await get_me.json()
			const element = document.getElementById("message")
			element.innerText = JSON.stringify(data)
		}
		catch (err) {
			const element = document.getElementById("message")
			element.innerText = err.message
		}
	}

	let postrender = () => {
		const queryString = window.location.search
		const urlParams = new URLSearchParams(queryString)
		
		const code = urlParams.get('code')
		get_ft_code(code)
	}

	return [prerender, render_code, postrender]
}