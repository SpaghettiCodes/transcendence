import { generateList } from "../../../components/generateList.js"

export function generateMatchHistory(items) {
	if (!items.length) {
		return `<li class="list-group-item">No matches to show, Try playing a Game!</li>`
	}
	return generateList(items, match => {
		let resultData = match.result
		let { attacker, attacker_score, defender, defender_score } = resultData
		let matchId = match.matchid

		return`
		<li class="list-group-item" id="match-${matchId}">
			<div>
				${attacker.username} vs ${defender.username}: ${attacker_score} - ${defender_score}
			</div>
		</li>`})
}