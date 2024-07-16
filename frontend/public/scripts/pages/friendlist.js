import { redirect } from "../router.js"

export default function template(prop={}) {
	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = () => {
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `
			<div class="video-container">
				<video autoplay muted loop id="bg-video">
					<source src="video/among_us.mp4" type="video/mp4">
					Your browser does not support HTML5 video.
				</video>
			</div>
			<div class="container-fiuld d-flex flex-column p-3 h-100">
				<h1 class="text-center text-white">Colleagues</h1>
				<div class="d-flex flex-row flex-grow-1 overflow-auto">
					<div class="d-flex flex-column friend-list">
						<h4>Colleagues</h4>
						<div class="input-group">
							<input type="search" class="form-control rounded" placeholder="Colleaguess' ID"/>
							<button type="button" class="btn btn-dark" data-mdb-ripple-init>Search</button>
						</div>
						<div dir="rtl" class="d-flex flex-column flex-grow-1 overflow-auto mt-2 p-2">
							<div class="friend-list-item">Friend 1</div>
							<div class="friend-list-item">Friend 2</div>
							<div class="friend-list-item">Friend 3</div>
							<div class="friend-list-item">Friend 4</div>
							<div class="friend-list-item">Friend 5</div>
							<div class="friend-list-item">Friend x</div>
							<div class="friend-list-item">Friend x</div>
							<div class="friend-list-item">Friend x</div>
							<div class="friend-list-item">Friend x</div>
							<div class="friend-list-item">Friend x</div>
							<div class="friend-list-item">Friend x</div>
							<div class="friend-list-item">Friend x</div>
							<div class="friend-list-item">Friend x</div>
							<div class="friend-list-item">Friend x</div>
							<div class="friend-list-item">Friend x</div>
							<div class="friend-list-item">Friend x</div>
							<div class="friend-list-item">Friend x</div>
							<div class="friend-list-item">Friend x</div>
							<div class="friend-list-item">Friend x</div>
						</div>
					</div>
					<div class="d-flex flex-column flex-grow-1 p-3 overflow-auto profile-details">
						<div class="text-white flex-grow-1 overflow-auto">
							<img src="bocchi.jpeg" alt="Profile Picture Goes Here" class="profile-pic">
							<h2 class="mt-3">Username</h2>
							<div class="game-stats">
								<p>Games Played: 3</p>
								<p>Games Won: 2</p>
								<p>Win/Lost Ratio: 1.5</p>
							</div>
						</div>
						<div class="buttons-bottom">
							<button type="button" class="btn btn-success">Block</button>
							<button type="button" class="btn btn-danger">Invite</button>
							<button type="button" class="btn btn-primary">Send Friend Request</button>
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