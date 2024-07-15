
export default function home(prop={}) {
	let prerender = () => {
		return true
	}

	let render_code = () => {
		return `
		<div class="container-fluid d-flex flex-column min-vh-100 justify-content-center align-items-center text-white">
			<div class="video-container">
				<video autoplay muted loop id="bg-video">
					<source src="video/among_us.mp4" type="video/mp4">
					Your browser does not support HTML5 video.
				</video>
			</div>
			<div class="text-center mb-5">
				<h1 class="header-font">APONG US</h1>
			</div>

			<div id="content" class="row text-center">
				<div class="col-md-4 mb-3" id="pongGame">
					<button class="ui-btn btn-block"><span>Pong</span></button>
				</div>
				<div class="col-md-4 mb-3" id="apongUsGame">
				<button class="ui-btn btn-block"><span>APong Us</span></button>
				</div>
				<div class="col-md-4 mb-3" id="tournament">
				<button class="ui-btn btn-block"><span>Tournament</span></button>
				</div>
				<div class="col-md-4 mb-3">
				<button class="ui-btn btn-block"><span>Language</span></button>
				</div>
				<div class="col-md-4 mb-3">
				<button class="ui-btn btn-block"><span>Profile</span></button>
				</div>
				<div class="col-md-4 mb-3">
				<button class="ui-btn btn-block"><span>Friends....?</span></button>
				</div>
			</div> 
		</div>
		`
	}

	let postrender = () => {
		const	pongGame = async () => {
			alert("Playing the PONG game")
		}

		const	ApongUsGame = async () => {
			alert('Entering APONG US game')
		}

		const pong_button = document.getElementById("pongGame")
		pong_button.addEventListener('click', pongGame)
		
		const apongUs_button = document.getElementById("apongUsGame")
		apongUs_button.addEventListener('click', ApongUsGame)
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}