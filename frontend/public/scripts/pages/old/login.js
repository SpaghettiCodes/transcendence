import { redirect } from "../../router.js"
import { setJwtToken, setRefreshToken } from "../../jwt.js"

export default function login(prop={}) {
    // attach all pre-rendering code here (like idk, fetch request or something)
    let prerender = async () => {
        return true // return true to continue to render_code
        // return false to abort (usually used with redirect)
    }

    // return the html code here
    let render_code = () => {
        return `
		<div>
			<form id="login">
				<div class="input_field">
					<input type="text" name="username" value="">
					<input type="text" name="password" value="">
				</div>
				<div id="submit">
					<input type="submit" id="login" value="Sign In">
				</div>
			</form>
		</div>
		`
    }

    // attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
    let postrender = () => {
        var form = document.getElementById("login");
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(form).entries()
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData))
            });
        
            const result = await response.json();
            console.log(result)

            setJwtToken(result.data.access)
			setRefreshToken(result.data.refresh)
            // axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
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

*/