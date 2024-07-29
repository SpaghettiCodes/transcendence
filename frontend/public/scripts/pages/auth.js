import { setJwtToken, setRefreshToken } from "../jwt.js"
import { redirect } from "../router.js"

export default function auth2fa(prop={}) {
	let sendToUsername = prop.username

	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = async () => {
		if (!sendToUsername) {
			history.back()
			return false
		}
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `
		<h1 id='status'>Sending Verification Code</h1>
		<button id='resendCode'>Resend Code</button>

		<br>

		<form class='d-flex gap-2 align-items-center' id="verify">
			<div class="input_field">
				<input type="text" name="code" value="">
			</div>
			<div>
				<input type="submit" value="Verify">
			</div>
		</form>

		<br>

		<h3 class="fw-bold hide landing-ui-var text-danger text-center errorMsg" id="errorBoard">Test</h3>
		`
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		const errorBoard = document.getElementById('errorBoard')

		const sendEmail = async () => {
			try {
				const response = await fetch('https://localhost:8000/api/2fa/send', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						'username': sendToUsername
					})
				});

				if (!response.ok) {
					throw response
				}

				document.getElementById('status').innerText = 'Verification Code Sent'
			} catch (e) {
				console.log(e)
				document.getElementById('status').innerText = 'Error while sending code'
			}	
		}

		const showErrorMsg = (errorElement, msg) => {
			errorElement.innerText = ''
			errorElement.classList.remove('hide')
			errorElement.innerText = msg
		}

		var form_verify = document.getElementById("verify");
		form_verify.addEventListener('submit', async function (e) {
			try {
				e.preventDefault();
				const data = new FormData(form_verify).entries()
				const code = Object.fromEntries(data).code.trim()

				if (!code.match(/^[0-9]{6,6}$/)) {
					console.log('womp womp')
					showErrorMsg(errorBoard, 'Invalid Code!')
					return
				}

				const response = await fetch('https://localhost:8000/api/2fa/verify', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						'username': sendToUsername,
						'code': code
					})
				});
	
				if (!response.ok) {
					throw response
				}

				const result = await response.json();
				const { access, refresh } = result.data
				setJwtToken(access)
				setRefreshToken(refresh)
				redirect('/home')
			} catch (e) {
				if (e.status === 410) { // code has expired
					showErrorMsg(errorBoard, 'Code has expired! Request for a new one!')
				} else if (e.status === 401) {
					showErrorMsg(errorBoard, 'Invalid Code!')
				}
				console.log(e)
			}

		});

		sendEmail()
		document.getElementById('resendCode').onclick = () => {
			document.getElementById('status').innerText = 'Sending Verification Code'
			sendEmail()
		}
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}

/*

{
"username":"e",
"password":"eee",
"email":"e@e.com"
}

{
"username":"justyn",
"password":"eee",
"email":"justyntkw@gmail.com"
}

*/
