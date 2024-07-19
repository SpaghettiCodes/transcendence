// https://salonimehta27.medium.com/building-single-page-application-project-in-javascript-b55b767fdf53

// routing thingys
// https://dev.to/rohanbagchi/how-to-write-a-vanillajs-router-hk3

let mainDoc = document.getElementById("main")
import "./jwt.js"
import landing from "./pages/landing.js"
import fourofour from "./pages/404.js"
import ftlogin from "./pages/ft_login.js"
import login from "./pages/login.js"
import test from "./pages/test.js"
import home from "./pages/home.js"
import matchListing from "./pages/matchListing.js"
import testChat from "./pages/testChat.js"
import tournamentList from "./pages/tournamentListing.js"
import tournament from "./pages/tournament.js"
import result from "./pages/result.js"
import profile from "./pages/profile.js"
import matchmaking from "./pages/matchmaking.js"
import chat from "./pages/chat/chat.js"
import friendlist from "./pages/friendlist.js"
import match from "./pages/newMatch.js"
import oldMatch from "./pages/match.js"

const routes = {
	'/': landing,
	'/error': fourofour,
	'/ftlogin': ftlogin,
	'/login': login,
	'/test': test,
	'/home': home,
	'/match': matchListing,
	'/match/<game_id>': match,
	'/match/<game_id>/spectate': match,
	'/match/<game_id>/results': result,
	'/chat': chat,
	'/tournament': tournamentList,
	'/tournament/<tournament_id>': tournament,
	'/profile': profile,
	'/matchmaking': matchmaking,
	'/friends': friendlist,
	'/oldMatch': oldMatch,
	'/testChat': testChat,
}

let clean_up_function = () => {}

const get_renderer = (uri, prop) => {
	console.log(uri)

	// direct match
	if (uri in routes)
		return routes[uri]

	// no direct match, time to crY
	const	uri_chunks = uri.slice(1).split("/")
	const	argument_count = uri_chunks.length - 1

	// first one gotta match someone
	const regex = new RegExp("^\/" + uri_chunks[0])
	const key_list = Object.keys(routes)
	const valid = key_list.filter((value) => value.match(regex))

	// get those where the argument count is the same as the given one
	const same_length = valid.filter((value) => (value.slice(1).split("/").length - 1) === argument_count)

	// get the one with variable
	// well i mean it WOULD be the one with the variable, or else it would match at <direct match>
	const another_regex = /\<.*\>/
	const with_arguments = same_length.filter((value) => value.match(another_regex))

	// joy, not found
	if (!with_arguments.length)
		return routes["/error"]

	let found_uri = undefined
	for (uri of with_arguments) {
		const segments = uri.slice(1).split("/")

		segments.forEach((segment, index, array) => {
			if (segment.match(/\<.*\>/)) {
				// is a variable
				array[index] = true
			} else {
				// not a variable, must be direct match
				let regex = new RegExp("^" + uri_chunks[index] + "$")
				array[index] = Boolean(segment.match(regex))
			}
		})

		if (segments.every(v => v === true)) {
			found_uri = uri
			break
		}
	}

	if (found_uri === undefined)
		return routes["/error"]

	const arg_names = found_uri.slice(1).split("/").slice(1)

	if (!prop["arguments"])
		prop["arguments"] = {}

	arg_names.forEach((value, index) => {
		if (value.match(/\<.*\>/)) {
			// is a variable
			value = value.slice(1, value.length - 1)
			prop["arguments"][value] = uri_chunks[index + 1]
		} else {
			// direct
			prop["arguments"][value] = true
		}
	})

	console.log("Bringing you to " + found_uri)
	console.log("With the props " + JSON.stringify(prop))

	return routes[with_arguments[0]]
}

const render_html = (which, prop={}) => {
	let to_render = get_renderer(which, prop)
	let [ prerender, render_code, postrender, cleanup] = to_render(prop)
	clean_up_function()
	clean_up_function = cleanup
	if (prerender())
	{
		mainDoc.innerHTML = render_code()
		postrender()
	}
}

const navigate = (e, prop={}) => {
	e.preventDefault()

	var uri = window.location.pathname

	// clean uri
	uri = uri.replace(/^\/+|\/+$/g, '');
	uri = '/' + uri.split("/").filter(Boolean).join('/')

	history.replaceState(null, null, uri)

	render_html(uri, prop)
}

export const redirect = (uri, prop={}) => {
	clean_up_function()
	render_html(uri, prop)
	history.pushState(null, null, uri)
}

// catch all links and change their default behavior
// to just use render_html instead of reloading the webpage
// https://www.sitepoint.com/javascript-event-delegation-is-easier-than-you-think/
// https://stackoverflow.com/questions/1760096/override-default-behaviour-for-link-a-objects-in-javascript
document.onclick = (e) => {
	e = e || window.event
	var element = e.target || e.srcElement

	if (element.tagName.toLowerCase() === 'a') {
		render_html(element.getAttribute("href"))
		history.pushState(null, null, element.href)
		return false // prevents default action and stops event propagation
	}
}

// to move the url in history
// https://gomakethings.com/how-to-update-the-browser-url-without-refreshing-the-page-using-the-vanilla-js-history-api/
// https://gomakethings.com/how-to-detect-when-the-browser-url-changes-with-vanilla-js/#:~:text=You%20can%20use%20the%20popstate,The%20URL%20changed...%20%7D)%3B
window.addEventListener("popstate", navigate)

// you could also just call navigate, since i place this script at the bottom
document.addEventListener("DOMContentLoaded", navigate)
