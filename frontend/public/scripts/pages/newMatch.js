import { fetchMod } from "../jwt.js"
import { redirect, redirect_replace_history } from "../router.js"

export default function match(prop={}) {
	// API
	let game_id = (prop["arguments"]) ? (prop["arguments"]["game_id"]) : undefined
	let tournament_id = (prop["arguments"]) ? prop["arguments"]["tournament_id"] : undefined
	let spectating = (prop["arguments"]) ? prop["arguments"]["spectate"] ? true : false : false
	let apiURI = (tournament_id) ? `tournament/${tournament_id}/match/${game_id}` : `match/${game_id}`

	// TEMP, REPLACE WITH JWT LATER
	let player_id = localStorage.getItem("username") || "default"

	let fixDimensions = undefined
	let pongSocket = undefined

	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = async () => {
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `
		<div class="matchContent d-flex flex-column bg-black" id="matchContent">
			<div class="matchDetailsFrame d-flex align-items-end flex-grow-1  text-white" id="matchDetailsFrame">
				<h1 class="flex-grow-1 text-center" id="attackerNameField">Name</h1>
				<h1>VS</h1>
				<h1 class="flex-grow-1 text-center" id="defenderNameField">Name</h1>
			</div>
			<div class="mainGameplayFrame" id="mainGameplayFrame">
				<div class="mainField" id="mainField">
					<div class="aRandomLine"></div>
					<div class="matchScoreCount firstHalf" id="attackerScoreBoard">0</div>
					<div class="matchScoreCount secondHalf" id="defenderScoreBoard">0</div>
					<div id="gameComponent"></div>
					<div class="d-flex align-items-center justify-content-center text-center text-white fw-bold w-100 h-100" id="messageBoard">
						Please wait as we fetch the data...
					</div>
				</div>
			</div>
		</div>
		<div class="text-danger fw-bold text-center font-size-5vm" id="errorBoard"></div>
		`
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		const mainGameplayFrame = document.getElementById("mainGameplayFrame")
		const mainField = document.getElementById("mainField")
		const gameComponent = document.getElementById("gameComponent")
		const messageBoard = document.getElementById("messageBoard")

		let matchStarted = false

		// these are fixed and should be taken from API calling /match/<id>
		let serverFieldWidth = undefined
		let serverFieldHeight = undefined
		let serverAspectRatio = undefined

		let serverPaddleHeight = undefined
		let serverPaddleWidth = undefined

		let serverBallRadius = undefined

		let serverVentWidth = undefined

		// playing field dimensions, CAN AND WILL CHANGE
		let fieldHeight = undefined
		let fieldWidth = undefined

		let attacker = undefined
		let defender = undefined

		let scores = {}

		const getGameData = async () => {
			let value = await fetchMod (
				`https://localhost:8000/api/${apiURI}`,
				{
					method: "GET",
				}
			)

			if (!value.ok) {
				if (value.status === 404) {
					redirect('/error')
				} else {
					console.log("oh no")
				}
				return
			}

			let data = await value.json()
			console.log(data)
			matchStarted = data["started"]
			if (matchStarted)
			{
				attacker = data["sides"]["attacker"]
				defender = data["sides"]["defender"]

				document.getElementById("attackerNameField").innerText = attacker
				document.getElementById("defenderNameField").innerText = defender

				// no idea where to put score first sooo
				scores[attacker] = data["score"]["attacker"]
				scores[defender] = data["score"]["defender"]

				updateScoreBoard()
			}

			let settings = data["settings"]

			serverFieldWidth = settings["width"]
			serverFieldHeight = settings["height"]
			serverAspectRatio = serverFieldWidth / serverFieldHeight

			serverBallRadius = settings["ball"]["radius"],
			serverPaddleWidth = settings["paddle"]["width"],
			serverPaddleHeight = settings["paddle"]["height"]

			if (settings["vent"])
				serverVentWidth = settings["vent"]["width"]

			fixFieldDimensions()
		}

		const errorMessage = (msg) => {
			document.getElementById("matchContent").removeAttribute('class')
			document.getElementById("matchContent").style.display = 'none'
			mainField.style.display = 'none'
			document.getElementById("errorBoard").innerText = msg
		}

		const fixPaddleDimensions = ({
			paddleElement,
			oldWidth,
			oldHeight,
			oldFieldWidth,
			oldFieldHeight,
			newFieldWidth,
			newFieldHeight
		}) => {
			let paddleWidthRatio = oldWidth / oldFieldWidth
			let paddleHeightRatio = oldHeight / oldFieldHeight

			let newPaddleWidth = newFieldWidth * paddleWidthRatio
			let newPaddleHeight = newFieldHeight * paddleHeightRatio

			paddleElement.style.width = `${newPaddleWidth}px`
			paddleElement.style.height = `${newPaddleHeight}px`

			return {
				"newPaddleWidth": newPaddleWidth,
				"newPaddleHeight": newPaddleHeight
			}
		}

		const updateScoreBoard = () => {
			document.getElementById("attackerScoreBoard").innerText = scores[attacker]
			document.getElementById("defenderScoreBoard").innerText = scores[defender]
		}

		const fixPaddlePosition = ({
			paddleElement, 
			oldx,
			oldy,
			oldFieldWidth,
			oldFieldHeight,
			newFieldWidth,
			newFieldHeight
		}) => {
			let xRatio = oldx / oldFieldWidth
			let yRatio = oldy / oldFieldHeight

			paddleElement.style.top = `${newFieldHeight * yRatio}px`
			paddleElement.style.left = `${newFieldWidth * xRatio}px`
		}

		const fixBallDimensions = ({
			ballElement,
			oldRadius,
			oldFieldHeight,
			newFieldHeight
		}) => {
			let ballRatio = oldRadius / oldFieldHeight

			let newballRadius = newFieldHeight * ballRatio
			let newballDiameter = newballRadius * 2

			ballElement.style.width = `${newballDiameter}px`
			ballElement.style.height = `${newballDiameter}px`

			return newballRadius
		}

		const fixBallPosition = ({
			ballElement,
			oldx,
			oldy,
			oldFieldWidth,
			oldFieldHeight,
			newFieldWidth,
			newFieldHeight
		}) => {
			let xRatio = oldx / oldFieldWidth
			let yRatio = oldy / oldFieldHeight

			let ballRadius = +ballElement.style.height.slice(0, -2) / 2

			ballElement.style.top = `${newFieldHeight * yRatio - ballRadius}px`
			ballElement.style.left = `${newFieldWidth * xRatio - ballRadius}px`
		}

		const fixFieldDimensions = () => {
			let windowWidth = mainGameplayFrame.offsetWidth
			let windowHeight = mainGameplayFrame.offsetHeight

			let widthAlpha = windowWidth / serverFieldWidth
			let heightAlpha = windowHeight / serverFieldHeight

			let alpha = Math.min(widthAlpha, heightAlpha)

			let newWidth = (serverFieldWidth * alpha)
			let newHeight = (serverFieldHeight * alpha)

			let oldFieldWidth = mainField.offsetWidth
			let oldFieldHeight = mainField.offsetHeight

			mainField.style.width = `${newWidth}px`
			mainField.style.height = `${newHeight}px`

			console.log("Hello")
			let mainFieldBorder = +getComputedStyle(mainField).borderWidth.slice(0, -2)

			fieldWidth = mainField.offsetWidth - 2 * (mainFieldBorder)
			fieldHeight = mainField.offsetHeight - 2 * (mainFieldBorder)

			let paddles = document.getElementsByClassName("paddle")
			for (let paddle of paddles) {
				fixPaddleDimensions({
					"paddleElement": paddle,
					"oldWidth": serverPaddleWidth,
					"oldHeight": serverPaddleHeight,
					"oldFieldWidth": serverFieldWidth,
					"oldFieldHeight": serverFieldHeight,
					"newFieldWidth": fieldWidth,
					"newFieldHeight": fieldHeight
				})

				fixPaddlePosition({
					"paddleElement": paddle,
					"oldx": +paddle.style.left.slice(0, -2),
					"oldy": +paddle.style.top.slice(0, -2),
					"oldFieldWidth": oldFieldWidth,
					"oldFieldHeight": oldFieldHeight,
					"newFieldWidth": fieldWidth,
					"newFieldHeight": fieldHeight
				})
			}

			let balls = document.getElementsByClassName("ball")
			for (let ball of balls) {

				fixBallDimensions({
					"ballElement": ball,
					"oldRadius": serverBallRadius,
					"oldFieldHeight": serverFieldHeight,
					"newFieldHeight": fieldHeight
				})

				let ballRadius = +ball.style.height.slice(0, -2) / 2

				fixBallPosition({
					"ballElement": ball,
					"oldx": +ball.style.left.slice(0, -2) + ballRadius,
					"oldy": +ball.style.top.slice(0, -2) + ballRadius,
					"oldFieldWidth": oldFieldWidth,
					"oldFieldHeight": oldFieldHeight,
					"newFieldWidth": fieldWidth,
					"newFieldHeight": fieldHeight
				})
			}
		}

		const setMinDimensions = () => {
			let minimumBearableHeight = minimumBearableWidth / serverAspectRatio
			mainField.style.minWidth = `${minimumBearableWidth}px`
			mainField.style.minHeight = `${minimumBearableHeight}px`
		}

		const makePaddle = (newx, newy, id) => {
			let newPaddle = document.createElement("div")
			newPaddle.setAttribute("class", `paddle ${id}`)

			fixPaddleDimensions({
				"paddleElement": newPaddle,
				"oldWidth": serverPaddleWidth,
				"oldHeight": serverPaddleHeight,
				"oldFieldWidth": serverFieldWidth,
				"oldFieldHeight": serverFieldHeight,
				"newFieldWidth": fieldWidth,
				"newFieldHeight": fieldHeight
			})

			fixPaddlePosition({
				"paddleElement": newPaddle,
				"oldx": newx,
				"oldy": newy,
				"oldFieldWidth": serverFieldWidth,
				"oldFieldHeight": serverFieldHeight,
				"newFieldWidth": fieldWidth,
				"newFieldHeight": fieldHeight
			})

			gameComponent.appendChild(newPaddle)
		}

		const makeBall = (newx, newy) => {
			let newBall = document.createElement("div")
			newBall.setAttribute("class", "ball")

			fixBallDimensions({
				"ballElement": newBall,
				"oldRadius": serverBallRadius,
				"oldFieldHeight": serverFieldHeight,
				"newFieldHeight": fieldHeight
			})

			fixBallPosition({
				"ballElement": newBall,
				"oldx": newx,
				"oldy": newy,
				"oldFieldWidth": serverFieldWidth,
				"oldFieldHeight": serverFieldHeight,
				"newFieldWidth": fieldWidth,
				"newFieldHeight": fieldHeight
			})

			gameComponent.appendChild(newBall)
		}

		const processFrame = (data) => {
			gameComponent.innerHTML = ''
			messageBoard.innerHTML = ''
			let {balls, attacker, defender} = data
			makePaddle(attacker["x"], attacker["y"], "attacker")
			makePaddle(defender["x"], defender["y"], "defender")

			for (let ball of balls) {
				makeBall(ball["x"], ball["y"])
			}
		}

		const updateMessageBoard = (message, size) => {
			messageBoard.style.fontSize = `${size}vmin`
			messageBoard.innerText = message
		}

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

		const sendMessage = (data) => {
			pongSocket.send(JSON.stringify(data))
		}

		const connectSocket = () => {
			pongSocket = new WebSocket(`wss://localhost:8000/${apiURI}`)
	
			pongSocket.onopen = function(e) {
				let commandToSend = 'join'
				if (spectating) {
					commandToSend = 'watch'
				}

				sendMessage({
					'command': commandToSend,
					'username': player_id, // fuck gotta figure out how to do this now wohoo
				})
			}
	
			pongSocket.onerror = function(e) {
				console.log("Uh oh")
			}
	
			pongSocket.onmessage = function(e) {
				const data = JSON.parse(e.data)
				const status = data["status"]

				// default message board size = 2.5vw

				switch (status)
				{
					case "update":
						processFrame(data)
						break
					case "joined":
						break
					case "start":
						getGameData()
						break
					case "wait":
						updateMessageBoard("Waiting for players...", 5)
						document.getElementById("attackerNameField").innerText = 'Finding Player'
						document.getElementById("defenderNameField").innerText = 'Finding Player'
						break
					case "error":
						errorMessage(data["message"])
						break
					case "pause":
						let message = data["message"]
						updateMessageBoard(`Game Paused\n${message}`, 5)
						break
					case "countdown":
						let timeRemaining = data["value"]
						updateMessageBoard(timeRemaining, 10)
						break
					case "score":
						let whoScored  = data["scorer"]
						if (data["update"]) {
							++scores[whoScored]
							updateScoreBoard()
						}
						updateMessageBoard(`${whoScored} Scored`, 5)
						break
					case "end":
						let gameLifetime = data["lifetime"]
						updateMessageBoard(`Game Ended\nYou will be ejected in ${gameLifetime}`, 5)
						break
					case "redirect":
						redirect_replace_history(`/match/${game_id}/results`)
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
				errorMessage("Unable to connect to Server")
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

		getGameData().then(
			(value) => {
				connectSocket()
				window.addEventListener("resize", fixFieldDimensions)
				fixDimensions = fixFieldDimensions
			}
		).catch(
			(error) => {
				console.log(error)
				console.log("well that did not work out")
			}
		)
	}

	let cleanup = () => {
		if (pongSocket)
			pongSocket.close()

		if (fixDimensions)
			window.removeEventListener("resize", fixDimensions)

		document.onkeydown = () => {}
		document.onkeyup = () => {}
	}

	return [prerender, render_code, postrender, cleanup]
}