import { redirect } from "../router.js"

export default function tournamentListing(prop={}) {
	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = async () => {
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `
		<div class="container text-center text-white">
			<h1 class="title">Tournament List</h1>
		</div>
		<div class="container-fluid">
			<div class="top-right-button-tl">
				<button id="createLobby" class="btn btn-outline-light btn-dark">Create Lobby</button>
			</div>
			<div class="row">
				<div>
					<div class="tournament-list min-vh-50">
						<h4>TOURNAMENT LOBBIES</h4>
						<br>
						<div class='tournament-list overflow-y-auto'>
							<div class="tournament-list-item">Lobby 1</div>
							<div class="tournament-list-item">Lobby 2</div>
							<div class="tournament-list-item">Lobby 3</div>
							<div class="tournament-list-item">Lobby 4</div>
							<div class="tournament-list-item">Lobby 5</div>
						</div>
					</div>
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