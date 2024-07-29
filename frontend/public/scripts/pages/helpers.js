export function ImageFromBackendUrl(url) {
	return `https://localhost:8000${url}`
}

export function pairElements(arr) {
	let saved = []
	for (let i = 0; i < arr.length; i += 2) {
		if ((i + 1) < arr.length)
			saved.push([arr[i], arr[i+1]])
		else
			saved.push([arr[i]])
	}
	return saved
}

export let everyElementContains = (a, b) => a.every(value => b.includes(value))

// this function exist because i do not want to send two of the exact same copy of data
// :)
export function getMatchWinnerData(matchData) {
	let { attacker, defender, winner } = matchData
	let attackerUsername = attacker.username
	let defenderUsername = defender.username

	if (winner === attackerUsername)
		return attacker
	else if (winner === defenderUsername)
		return defender
	else
		return undefined
}