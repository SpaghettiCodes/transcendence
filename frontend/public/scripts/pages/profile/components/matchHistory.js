import { generateList } from "../../../components/generateList.js"

export function generateMatchHistory(items) {
	if (!items.length) {
		return `<li class="list-group-item">No matches to show</li>`
	}
	return generateList(items, match => {
		let resultData = match.result
		let { type } = match
		let { attacker, attacker_score, defender, defender_score } = resultData
		let matchId = match.matchid

		return`
		<li class="gap-1 match-box p-1 text-white" id="match-${matchId}">
			<div class='d-flex justify-content-center type-div mx-5 fw-bold'>
				${type}
			</div>
			<div class='username-div gap-2'>
				<div class='text-end border-end pe-2'>
					${attacker_score} 
				</div>
				<div class='text-center text-truncate'>
					${attacker.username}
				</div>
				<div class='text-center'>
					-
				</div>
				<div class='text-center text-truncate'>
					${defender.username}
				</div>
				<div class='text-start border-start ps-2'>
					${defender_score}
				</div>
			</div>
		</li>`})
}