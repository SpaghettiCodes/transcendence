import { loadingPage } from "../router.js"

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

export function replaceURL(newUrl) {
	history.replaceState(null, null, newUrl)
}

// prevent spamming of button to prevent multiple calls to redirect
export const redirectSpamWrapper = (func) => () => {
	if (loadingPage)
		return
	func()
}