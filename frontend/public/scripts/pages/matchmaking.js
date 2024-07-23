import { redirect } from "../router.js"

export default function template(prop={}) {
	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = async () => {
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `
        <div id="mm">
            <div class="white-bar top-bar"></div>
            <div class="content container text-white">
                <p>MATCHMAKING</p>
            </div>
            <div class="white-bar bottom-bar"></div>
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