import { redirect } from "../router.js"

export default function tournament(prop={}) {
	const tournamentID = (prop["arguments"]) ? (prop["arguments"]["tournament_id"]) : undefined
	const player_id = localStorage.getItem("username") || "default"

	let tournamentSocket = undefined
	let goingToBattle = false

	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = async () => {
		if (tournamentID === undefined)
		{
			history.back()
			return false
		}
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `
		<div class="container-fluid text-white text-center">
			<h1 class="title">Tournament</h1>
		</div>
		<div class="row container-fluid d-flex flex-row justify-content-center align-self-center overflow-y-auto flex-grow-1 gap-3 px-5 tournamentContents">
			<div class='col-sm d-flex flex-row flex-grow-1 flex-shrink-1 tournamentProgress' id="tournament">
				<ul class="round round-1">
					<li class="spacer">&nbsp;</li>
					
					<li class="game game-top winner">Player 1</li>
					<li class="game game-spacer">&nbsp;</li>
					<li class="game game-bottom ">Player 2</li>
				
					<li class="spacer">&nbsp;</li>
					
					<li class="game game-top winner">Player 3</li>
					<li class="game game-spacer">&nbsp;</li>
					<li class="game game-bottom ">Player 4</li>
				
					<li class="spacer">&nbsp;</li>
					
					<li class="game game-top winner">Player 5</li>
					<li class="game game-spacer">&nbsp;</li>
					<li class="game game-bottom ">Player 6</li>
				
					<li class="spacer">&nbsp;</li>
					
					<li class="game game-top winner">Player 7</li>
					<li class="game game-spacer">&nbsp;</li>
					<li class="game game-bottom ">Player 8</li>
				
					<li class="spacer">&nbsp;</li>
				</ul>
				<ul class="round round-2">
					<li class="spacer">&nbsp;</li>
					
					<li class="game game-top winner">Player 1</li>
					<li class="game game-spacer">&nbsp;</li>
					<li class="game game-bottom ">Player 4</li>
				
					<li class="spacer">&nbsp;</li>
					
					<li class="game game-top winner">Player 5</li>
					<li class="game game-spacer">&nbsp;</li>
					<li class="game game-bottom ">Player 7</li>
				
					<li class="spacer">&nbsp;</li>
				</ul>
					<ul class="round round-3">
					<li class="spacer">&nbsp;</li>
					
					<li class="game game-top winner">Player 1</li>
					<li class="game game-spacer">&nbsp;</li>
					<li class="game game-bottom ">Player 5</li>
				
					<li class="spacer">&nbsp;</li>
				</ul>
				<ul class="round round-4">
					<li class="spacer">&nbsp;</li>
					
					<li class="game game-top winner">Player 1</li>
				
					<li class="spacer">&nbsp;</li>
				</ul>
			</div>
			<div class="col-sm player-list rounded d-flex flex-column align-items-stretch flex-grow-1 overflow-y-hidden">
				<h4>Players</h4>
				<br>
				<div class='d-flex flex-column overflow-y-auto'>
					<div class="player-list-item">Player 1</div>
					<div class="player-list-item">Player 2</div>
					<div class="player-list-item">Player 3</div>
					<div class="player-list-item">Player 4</div>
					<div class="player-list-item">Player 5</div>
					<div class="player-list-item">Player 6</div>
					<div class="player-list-item">Player 7</div>
					<div class="player-list-item">Player 8</div>
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