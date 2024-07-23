import { generateList } from "../../../components/generateList.js"

export function generateMatchHistory(items) {
	if (!items.length) {
		return `<li class="list-group-item">No matches to show, Try playing a Game!</li>`
	}
	return generateList(items, match => `<li class="list-group-item">${match.match}: ${match.result}</li>`)
}