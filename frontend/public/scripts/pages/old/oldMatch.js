import { redirect } from "../../router.js"
import { fetchMod } from "../../jwt.js"

export default function oldMatch(prop={}) {
	console.log(prop)

	let game_id = (prop["arguments"]) ? (prop["arguments"]["game_id"]) : undefined
	let tournament_id = (prop["arguments"]) ? prop["arguments"]["tournament_id"] : undefined

	let apiURI = (tournament_id) ? `tournament/${tournament_id}/match/${game_id}` : `match/${game_id}`

	let player_id = localStorage.getItem("username") || "default"
	let pongSocket = undefined

	// attach all pre-rendering code here (like idk, fetchMod request or something)
	let prerender = async () => {
		// if (game_id === undefined)
		// {
		// 	redirect("/match")
		// 	return false
		// }
		return true
	}

	// return the html code here
	let render_code = () => {
		return `
		<div>
			<div>
				<h1>Game ID: ${game_id || "nope nothing"}</h1>
			</div>
			<div id="details">Loading...</div>
			<div id="score"></div>
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

		let waitingInterval = undefined	

		let ballRadius = undefined
		let paddleWidth = undefined
		let paddleHeight = undefined
		let ventWidth = undefined

		let attacker = undefined
		let defender = undefined

		let scores = {}

		const detailDiv = document.getElementById("details")
		const scoreDiv = document.getElementById("score")

		const getGameData = () => {
			fetchMod (
				`https://localhost:8000/api/${apiURI}`,
				{
					method: "GET",
				}
			).then( (value) => {
				detailDiv.innerHTML = ''
				return value.json()
			}).then( (data) => {
				if (data["started"])
				{
					attacker = data["sides"]["attacker"]
					defender = data["sides"]["defender"]
					detailDiv.innerHTML = `${attacker} vs ${defender}`
					scores[attacker] = data["score"]["attacker"]
					scores[defender] = data["score"]["defender"]

					rerenderScoreDiv()
				}

				let settings = data["settings"]

				ballRadius = settings["ball"]["radius"],
				paddleWidth = settings["paddle"]["width"],
				paddleHeight = settings["paddle"]["height"]

				if (settings["vent"])
					ventWidth = settings["vent"]["width"]
			})
		}

		const rerenderScoreDiv = () => {
			scoreDiv.innerHTML = `${scores[attacker]} - ${scores[defender]}`
		}

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
			let { balls, vents, attacker, defender } = data

			balls.forEach(ball => {
				drawBall(ball["x"], ball["y"], ballRadius)
			});
			drawPaddle(attacker["x"], attacker["y"], paddleWidth, paddleHeight, "#00FF80")
			drawPaddle(defender["x"], defender["y"], paddleWidth, paddleHeight, "#D99FFF")

			// temp, will make proper check, eventually yes
			if (vents) {
				vents.forEach(vent => {
					drawVents(vent["x"], vent["y"], ventWidth)
				})
			}
		}

		let drawVents = (x, y, width, color="#707070") => {
			ctx.beginPath()
			ctx.rect(x, y, width, 5)
			ctx.fillStyle = color
			ctx.fill()
			ctx.closePath()
		}

		let drawBall = (x, y, radius) => {
			ctx.fillStyle = "#000000"
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fill()
			ctx.closePath() 
		}

		// the coordinates of the paddle is at the upper left corner
		let drawPaddle = (x, y, width, height, color="#000000") => {
			ctx.beginPath()
			ctx.rect(x, y, width, height)
			ctx.fillStyle = color
			ctx.fill()
			ctx.closePath()
		}

		const drawGamePaused = (msg) => {
			ctx.fillStyle = "#000000"
			ctx.font = '20px sans-serif'
			ctx.textBaseline = "middle"
			ctx.textAlign = "center"

			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
			ctx.fillText(msg , 115, 25, ctx.canvas.width)
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

		const updateScore = (scorer) => {
			++scores[scorer]
			rerenderScoreDiv()
		}

		const sendMessage = (data) => {
			pongSocket.send(JSON.stringify(data))
		}

		const drawEnd = (durationLeft, winner) => {
			ctx.fillStyle = "#000000"
			ctx.font = '20px sans-serif'
			ctx.textBaseline = "middle"
			ctx.textAlign = "center"

			let text = `Player ${winner} wins!`
			let text2 = `This match will close in ${durationLeft} seconds`
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
			ctx.fillText(text , 115, 25, ctx.canvas.width)
			ctx.fillText(text2, 115, 50, ctx.canvas.width)
		}

		const connectSocket = () => {
			pongSocket = new WebSocket(`ws://localhost:8000/${apiURI}`)
	
			pongSocket.onopen = function(e) {
				sendMessage({
					'command': 'join',
					'username': player_id, // fuck gotta figure out how to do this now wohoo
				})
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
						getGameData()
						break
					case "wait":
						drawWaitingPlayer()
						break
					case "error":
						let message = data["message"]
						showError(message)
						break
					case "pause":
						drawGamePaused(data["message"])
						break
					case "countdown":
						drawNumber(data["value"])
						break
					case "score":
						drawScore(data["scorer"])
						if (data["update"])
							updateScore(data["scorer"])
						break
					case "end":
						drawEnd(data["lifetime"], data["winner"])
						break
					case "redirect":
						history.back()
						// redirect("/match")
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
		}

		// addEventListener("resize", (event) => {recalibratePixels()})
		// recalibratePixels()

		// getGameData()
		// connectSocket()

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