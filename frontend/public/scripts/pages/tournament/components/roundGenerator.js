let spaceGenerator = () => {
	let spacer = document.createElement('li')
	spacer.setAttribute('class', 'spacer')
	spacer.innerText = '\xa0';
	return spacer
}

export function roundGenerator(matchCount, players){
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

export function generateTournamentScreen(attachmentElement, data){
	attachmentElement.innerHTML = ''
	for (let round of data) {
		let matchCount = round.filter((v) => v.length == 2).length
		attachmentElement.appendChild(
			roundGenerator(matchCount, round)
		)
	}
}