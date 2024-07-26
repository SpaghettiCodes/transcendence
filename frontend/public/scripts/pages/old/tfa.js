import { redirect } from "../../router.js"
import { setJwtToken, setRefreshToken, fetchMod } from "../../jwt.js"

export default function tfa(prop={}) {
    // attach all pre-rendering code here (like idk, fetch request or something)
    let prerender = async () => {
        return true // return true to continue to render_code
        // return false to abort (usually used with redirect)
    }

    // return the html code here
    let render_code = () => {
        return `
		<div>
			<form id="send">
				<div class="input_field">
					<input type="text" name="username" value="">
				</div>
				<div id="send">
					<input type="submit" id="send" value="Send">
				</div>
			</form>
		</div>

		<div>
			<form id="verify">
				<div class="input_field">
					<input type="text" name="username" value="">
					<input type="text" name="code" value="">
				</div>
				<div id="verify">
					<input type="submit" id="verify" value="Verify">
				</div>
			</form>
		</div>
		`
    }

    // attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
    let postrender = () => {
		var form_send = document.getElementById("send");
        form_send.addEventListener('submit', async function (e) {
            e.preventDefault();
            const data_send = new FormData(form_send).entries()
            const response_send = await fetch('http://localhost:8000/api/2fa/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(data_send))
            });

			const result_send = await response_send.json();
			console.log(result_send)
        });

		var form_verify = document.getElementById("verify");
        form_verify.addEventListener('submit', async function (ee) {
            ee.preventDefault();
            const data_verify = new FormData(form_verify).entries()
            const response_verify = await fetch('http://localhost:8000/api/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(data_verify))
            });

			const result_verify = await response_verify.json();
			console.log(result_verify)
        });
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
