import { redirect } from "../router.js"

// this is merely a placeholder as i cook up a chat system
export default function chat(prop={}) {
	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = () => {
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `
			<div>
				<h1>Test ChatRoom</h1>
				<p>This is going on list and on games~~~</p>

				<div class="chat">
					<div class="chatbox" id="chatbox">
					</div>
					<div class="inputbox">
					
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