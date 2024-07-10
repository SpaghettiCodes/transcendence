import { redirect } from "../router.js"
import { getJwtToken } from "../jwt.js"

export default function test(prop={}) {
	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = () => {
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `
		<div>
			<form id="profile">
				<div id="submit">
					<input type="submit" id="profile" value="Check Profile">
				</div>
			</form>
		</div>
		`
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		const jwtToken = getJwtToken();
		if (!jwtToken) {
			window.location.href = 'http://localhost:8080/login';
		}

        var form = document.getElementById("profile");
		const jwt = getJwtToken()
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(form).entries()
            const response = await fetch('http://localhost:8000/api/player/e', {
                method: 'POST',
                headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${jwt}`
				 },
                body: JSON.stringify(Object.fromEntries(formData))
            });
        
			if (response.ok) {
				const result = await response.json();
				console.log(result)
				console.log("success")
			}
			else {
				window.location.href = 'http://localhost:8080/login';
				console.log("error")
			}

        });
    }

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}