import { redirect } from "../router.js"

export default function match(prop={}) {
	let game_id = (prop["arguments"]) ? (prop["arguments"]["game_id"]) : undefined
	let player_id = localStorage.getItem("username") || "default"
	let server_up = false
	let pongSocket = undefined
	let waitingInterval = undefined

	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = () => {
		if (game_id === undefined)
		{
			redirect("/games")
			return false
		}
		return true
	}

	// return the html code here
	let render_code = () => {
		return `
		<div>
			<div>
				<h1>Game ID: ${game_id || "nope nothing"}</h1>
			</div>
			<div id="canvasDiv">
			<canvas id="gameWindow"></canvas>
			</div>
		</div>
		`
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		const canvas = document.getElementById("gameWindow")
		const ctx = canvas.getContext("2d")

		// why does my ball looks so blury
		// this is cuz of the devicePixelRatio property
		// https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
		// which is basically the size of one CSS pixel : size of one physical pixel
		// sometimes its not 1, which causes the picture to be blurry
		// you will need to scale your canvas size in accordance to this

		let recalibratePixels = () => {
			// set display size in css pixel
			var h_size = 350
			var w_size = 750
			canvas.style.height = h_size + "px"
			canvas.style.width = w_size + "px"

			// set actual size in memory (scaled to account for extra pixel density)
			var scale = window.devicePixelRatio
			canvas.width = w_size * scale
			canvas.height = h_size * scale

			// normalize coordinate system to use CSS pixels
			ctx.scale(scale, scale)
		}

		let drawWaitingPlayer = () => {
			ctx.fillStyle = "#000000"
			ctx.font = '20px sans-serif'
			ctx.textBaseline = "middle"
			ctx.textAlign = "center"

			let text = "Waiting for opponent..."
			waitingInterval = setInterval(() => {
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
				ctx.fillText(text , 115, 25, ctx.canvas.width)
			}, 100)
			console.log(waitingInterval)
		}

		const drawScore = (scorer) => {
			ctx.fillStyle = "#000000"
			ctx.font = '20px sans-serif'
			ctx.textBaseline = "middle"
			ctx.textAlign = "center"

			let text = `${scorer} Scored`
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
			ctx.fillText(text , 115, 25, ctx.canvas.width)
		}

		let showError = (message) => {
			const errorDiv = document.getElementById("canvasDiv")

			errorDiv.innerHTML = `<h1>${message}</h1>`
		}

		let drawStage = (data) => {
			// clear canvas
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			let { ballx, bally, attackerx, attackery, defenderx, defendery } = data

			drawBall(ballx, bally)
			drawPaddle(attackerx, attackery, "#00FF80")
			drawPaddle(defenderx, defendery, "#D99FFF")
		}

		let drawBall = (x, y) => {
			ctx.fillStyle = "#000000"
			ctx.beginPath();
			ctx.arc(x, y, 7, 0, Math.PI * 2);
			ctx.fill()
			ctx.closePath() 
		}

		// the coordinates of the paddle is at the upper left corner
		let drawPaddle = (x, y, color="#000000") => {
			ctx.beginPath()
			ctx.rect(x, y, 10, 100)
			ctx.fillStyle = color
			ctx.fill()
			ctx.closePath()
		}

		const drawGamePaused = () => {
			ctx.fillStyle = "#000000"
			ctx.font = '20px sans-serif'
			ctx.textBaseline = "middle"
			ctx.textAlign = "center"

			let text = "Game Paused"
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
			ctx.fillText(text , 115, 25, ctx.canvas.width)
		}

		const drawNumber = (number) => {
			ctx.fillStyle = "#000000"
			ctx.font = '20px sans-serif'
			ctx.textBaseline = "middle"
			ctx.textAlign = "center"

			let text = `${number}`
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
			ctx.fillText(text , 115, 25, ctx.canvas.width)
		}

		const processFrame = (data) => {
			drawStage(data)
		}

		pongSocket = new WebSocket(`ws://localhost:8000/pong/${game_id}`)
		const sendMessage = (data) => {
			pongSocket.send(JSON.stringify(data))
		}

		pongSocket.onopen = function(e) {
			sendMessage({
				'command': 'join',
				'username': player_id, // fuck gotta figure out how to do this now wohoo
			})
			server_up = true
		}

		pongSocket.onerror = function(e) {
			console.log("player left prematurely")
		}

		pongSocket.onmessage = function(e) {
			const data = JSON.parse(e.data)
			const status = data["status"]

			switch (status)
			{
				case "update":
					processFrame(data)
					break
				case "joined":
					// do something here
					break
				case "start":
					console.log("starting...")
					if (waitingInterval)
						clearInterval(waitingInterval)
					break
				case "wait":
					drawWaitingPlayer()
					break
				case "error":
					let message = data["message"]
					showError(message)
					break
				case "pause":
					drawGamePaused()
					break
				case "countdown":
					drawNumber(data["value"])
					break
				case "score":
					drawScore(data["scorer"])
					break
				default:
					console.log("unrecognizable message")
					break
			}
		}

		pongSocket.onclose = function(e) {
			console.error('Chat socket close unexpectedly');
		}

		pongSocket.onerror = (e) => {
			console.log("bro left")
		}

		addEventListener("resize", (event) => {recalibratePixels()})
		recalibratePixels()

		document.onkeydown = (e) => {
			e = e || window.event

			switch (e.keyCode){
				case (87):
					e.preventDefault()
					sendMessage({
						"username": player_id,
						"action": "go_up"
					})
					break;
				case (83):
					e.preventDefault()
					sendMessage({
						"username": player_id,
						"action": "go_down"
					})
					break;
			}
		}

		document.onkeyup = (e) => {
			e = e || window.event

			switch (e.keyCode)
			{
				case (87):
				case (83):
					e.preventDefault()
					sendMessage({
						"username": player_id,
						"action": "stop"
					})
					break;
			}
		}
	}

	let cleanup = () => {
		if (pongSocket)
			pongSocket.close()

		// uhhh should work
		document.onkeydown = () => {}
		document.onkeyup = () => {}
	}

	return [prerender, render_code, postrender, cleanup]
}