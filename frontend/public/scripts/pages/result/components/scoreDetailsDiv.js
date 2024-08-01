import { playerDetailsGenerator } from "./playerDiv.js"

export let scoreDetailsDiv = (data, callerUsername='') => {
	let { result, status } = data
	let { attacker, attacker_score, defender, defender_score, winner, loser, reason } = result
	let resultMsg = "RESULTS"

	if (reason === 'draw') {
		resultMsg = 'DRAW'
	} else if (winner === callerUsername) {
		resultMsg = 'YOU WIN'
	} else if (loser === callerUsername) {
		if (reason === 'normal') {
			resultMsg = 'YOU LOSE'
		} else if (reason === 'forfeited') {
			resultMsg = 'FORFEITED'
		}
	}

	return `
		<div class='statusDiv text-center flex-grow-1 fw-bold' id='statusDiv'>${resultMsg}</div>
			<div class='d-flex' id='playerScoreField'>
				<div class='scoreDiv text-center flex-grow-1' id='attackerScoreDiv'>${attacker_score}</div>
				<div class='scoreDiv'>:</div>
				<div class='scoreDiv text-center flex-grow-1' id='defenderScoreDiv'>${defender_score}</div>
			</div>
			<div class='resultDiv d-flex flex-grow-2' id='playerDetailsField'>
				${playerDetailsGenerator(attacker, callerUsername)}
				${playerDetailsGenerator(defender, callerUsername)}
		</div>
	`
}