
export default function home(prop={}) {
	let prerender = () => {
		return true
	}

	let render_code = () => {
		return `
		<h1>Pong</h1>
		<div id="playbutton">
			<p>Play Now</p>
		</div>
		`
	}

	let postrender = () => {
		const	play_game = async () => {
			alert("Playing the GAME")
		}

		const play_button = document.getElementById("playbutton")
		play_button.addEventListener('click', play_game)
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}