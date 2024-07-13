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
		<h1 class="title">Tournament Mode</h1>
		<div class="tournament">
			<div class="box corner-top-left text-black display: flex-column">
				Player 1
				<div class="btn btn-dark">Ready</div>
			</div>
			<div class="box middle-left text-black">Player 1</br>vs</br>Player 3</div>
			<div class="box corner-top-right text-black display: flex-column">
				Player 2
				<div class="btn btn-dark">Ready</div>
			</div>
			<div class="box corner-bottom-left text-black display: flex-column">
				Player 3
				<div class="btn btn-dark">Ready</div>
			</div>
			<div class="box middle-right text-black">Player 2</br>vs</br>Player 4</div>
			<div class="box corner-bottom-right text-black display: flex-column">
				Player 4
				<div class="btn btn-dark">Ready</div>
			</div>        
			<div class="box final-left text-black display: flex-column">
				Finalist 1
				<div class="btn btn-dark">Ready</div>
			</div>
			<div class="box final-right text-black display: flex-column">
				Finalist 2
				<div class="btn btn-dark">Ready</div>
			</div>
			<div class="box center text-black">Finalist 1<br>vs<br>Finalist 2</div>
			
			<div class="box center-up text-black">Winner</div>
			
			<!-- Lines connecting the boxes -->
			<div class="line top-left-to-bottom-left"></div>
			<div class="line top-right-to-bottom-right"></div>
			<div class="line bottom-left-to-final-left"></div>
			<div class="line bottom-right-to-final-right"></div>
			<div class="line final-left-to-center"></div>
			<div class="line final-right-to-center"></div>
			<div class="line center-to-winner"></div>
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