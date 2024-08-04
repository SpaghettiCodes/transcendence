import { redirect } from "../../../router.js";

let spaceGenerator = () => {
	let spacer = document.createElement('li')
	spacer.setAttribute('class', 'spacer')
	spacer.innerText = '\xa0';
	return spacer
}

function playerMatchupDiv(matchCount, players){
	let ulElement = document.createElement('ul')
	ulElement.setAttribute('class', 'round round-1')

	let fragment = document.createDocumentFragment()

	if (matchCount === 0) {
		fragment.appendChild(spaceGenerator())

		let topPlayer = document.createElement('li')
		topPlayer.setAttribute('class', 'game game-top')
		topPlayer.innerText = players[0][0]

		fragment.appendChild(topPlayer)

		fragment.appendChild(spaceGenerator())
	} else {
		for (let i = 0; i < matchCount; ++i) { 
			fragment.appendChild(spaceGenerator())
	
			let topPlayer = document.createElement('li')
			topPlayer.setAttribute('class', 'game game-top')
			topPlayer.innerText = players[i][0]

			let middleSpace = document.createElement('li')
			middleSpace.setAttribute('class', 'game game-spacer')

			let bottomPlayer = document.createElement('li')
			bottomPlayer.setAttribute('class', 'game game-bottom')
			bottomPlayer.innerText = players[i][1]
	
			fragment.appendChild(topPlayer)
			fragment.appendChild(middleSpace)
			fragment.appendChild(bottomPlayer)
	
			if (i == matchCount - 1) // last one
				fragment.appendChild(spaceGenerator())
		}
	}

	ulElement.appendChild(fragment)
	return ulElement
}

function determineInnerText(matchData) {
	let { ended, players } = matchData

	if (!ended)
		return `${players[0]} vs ${players[1]}`
	else {
		let { result } = matchData
		return result.winner
	}
}

function matchDetailsDiv(matchCount, matches, onClickGenerator) {
	let ulElement = document.createElement('ul')
	ulElement.setAttribute('class', 'round round-1')

	let fragment = document.createDocumentFragment()

	for (let i = 0; i < matchCount; i += 2) { 
		fragment.appendChild(spaceGenerator())

		let topPlayer = document.createElement('li')
		topPlayer.setAttribute('class', 'game game-top')

		let topRedirector = document.createElement('div')
		topRedirector.setAttribute('class', '')
		topRedirector.innerText = determineInnerText(matches[i])
		topRedirector.onclick = onClickGenerator(matches[i])
		topPlayer.appendChild(topRedirector)

		fragment.appendChild(topPlayer)

		if ((i + 1) < matchCount) {
			let middleSpace = document.createElement('li')
			middleSpace.setAttribute('class', 'game game-spacer')
			fragment.appendChild(middleSpace)
			
			let bottomPlayer = document.createElement('li')
			bottomPlayer.setAttribute('class', 'game game-bottom')

			let bottomRedirector = document.createElement('div')
			bottomRedirector.setAttribute('class', '')
			bottomRedirector.innerText = determineInnerText(matches[i + 1])
			bottomRedirector.onclick = onClickGenerator(matches[i + 1])
			bottomPlayer.appendChild(bottomRedirector)

			fragment.appendChild(bottomPlayer)

			if ((i + 1) == matchCount - 1) // last one
				fragment.appendChild(spaceGenerator())
		}

		if ((i) == matchCount - 1) // last one
			fragment.appendChild(spaceGenerator())
	}

	ulElement.appendChild(fragment)
	return ulElement
}

export function appendOngoingMatchup(attachmentElement, gameData, onClickGenerator) {
	attachmentElement.appendChild(
		matchDetailsDiv(gameData.length, gameData, onClickGenerator)
	)
}

export function appendTournamentScreen(attachmentElement, round) {
	let matchCount = round.filter((v) => v.length === 2).length
	attachmentElement.appendChild(
		playerMatchupDiv(matchCount, round)
	)
}

export function generateTournamentScreen(attachmentElement, data){
	attachmentElement.innerHTML = ''
	for (let round of data) {
		let matchCount = round.filter((v) => v.length === 2).length
		attachmentElement.appendChild(
			playerMatchupDiv(matchCount, round)
		)
	}
}