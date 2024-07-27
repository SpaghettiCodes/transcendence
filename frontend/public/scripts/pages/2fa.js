import { redirect } from "../../router.js"

export default function template(prop={}) {
	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = async () => {
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `
        <div class="container text-center full-height">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <h1>An e-mail had been sent to (email) which containes the code for this 2-factor authenticator.</h1>
                    <input type="text" class="form-control mt-3" placeholder="6-DIGIT-CODE">
                </div>
            </div>
        </div>
        `
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}