// https://salonimehta27.medium.com/building-single-page-application-project-in-javascript-b55b767fdf53

// routing thingys
// https://dev.to/rohanbagchi/how-to-write-a-vanillajs-router-hk3

let errorContainer = document.getElementById("errorContainer")
let mainContainer = document.getElementById('mainContainer')

import "./jwt.js"
import landing from "./pages/landing.js"
import fourofour from "./pages/404.js"
import ftlogin from "./pages/42auth.js"
import home from "./pages/home.js"
import tournament from "./pages/tournament/tournament.js"
import result from "./pages/result/result.js"
import profile from "./pages/profile/profile.js"
import matchmaking from "./pages/matchmaking.js"
import chat from "./pages/chat/chat.js"
import friendlist from "./pages/friendList/friendList.js"
import match from "./pages/match.js"
import { check_token_exists } from "./jwt.js"
import auth2fa from "./pages/auth.js"

// remove later
import login from "./pages/old/login.js"
import test from "./pages/old/test.js"
import tfa from "./pages/old/tfa.js"
import matchListing from "./pages/old/matchListing.js"
import tournamentListing from "./pages/old/oldTournamentListing.js"

const routes = {
	'/': landing,
	'/error': fourofour,
	'/home': home,
	'/match/<game_id>/spectate': match,
	'/match/<game_id>/results': result,
	'/match/<game_id>': match,
	'/chat': chat,
	'/tournament/<tournament_id>/spectate': tournament,
	'/tournament/<tournament_id>/results': fourofour,
	'/tournament/<tournament_id>': tournament,
	'/profile': profile,
	'/matchmaking/<game_type>': matchmaking,
	'/friends': friendlist,
	'/auth/2fa': auth2fa,
	'/ftlogin': ftlogin,

	// temp, remove when done

	'/tournament': tournamentListing,
	'/match': matchListing,
	'/login': login,
	'/tfa': tfa,
	'/test': test,
}

let clean_up_function = () => {}

const get_renderer = (uri, prop) => {
	console.log(uri)

	// remove query string
	uri = uri.split('?')[0]
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

	return routes[found_uri]
}

const render_html = (which, prop={}, originator=undefined, rightBefore=undefined) => {
	console.log(originator)

	if (originator !== undefined) {
		// get current link
		let callerLocation = rightBefore
		if (rightBefore === undefined)
			callerLocation = window.location.pathname
		console.log(callerLocation)
		if (callerLocation !== originator)
			// the caller location is not the same as where the redirect is called
			// this probably means we have already been redirected away
			return
	}

	let to_render = get_renderer(which, prop)
	let [ prerender, render_code, postrender, cleanup] = to_render(prop)

	if (!check_token_exists()) {
		return
	}

	clean_up_function()
	clean_up_function = cleanup

	prerender().then(
		(success) => {
			if (success) {
				errorContainer.innerHTML = ''
				mainContainer.innerHTML = ''

				if (to_render === routes['/error'])
					errorContainer.innerHTML = render_code()
				else
					mainContainer.innerHTML = render_code()
				postrender()
			} else {
				// abort
				// oh fuck it, prerender is expected to handle the fails
			}
		}
	)
}

const navigate = (e, prop={}) => {
	e.preventDefault()

	// mmm search parameters not included, i wonder why is this not working
	let searchParam = window.location.search

	let uri = window.location.pathname
	// clean uri
	uri = uri.replace(/^\/+|\/+$/g, '');
	uri = '/' + uri.split("/").filter(Boolean).join('/') + searchParam
	history.replaceState(null, null, uri)

	render_html(uri, prop)
}

export const redirect = (uri, prop={}, originator=undefined) => {
	let rightBefore = window.location.pathname
	history.pushState(null, null, uri)
	render_html(uri, prop, originator, rightBefore)
}

export const redirect_replace_history = (uri, prop={}, originator=undefined) => {
	let rightBefore = window.location.pathname
	history.replaceState(null, null, uri)
	render_html(uri, prop, originator, rightBefore)
}

export const redirect_without_history = (uri, prop={}) => {
	render_html(uri, prop)
}

// catch all links and change their default behavior
// to just use render_html instead of reloading the webpage
// https://www.sitepoint.com/javascript-event-delegation-is-easier-than-you-think/
// https://stackoverflow.com/questions/1760096/override-default-behaviour-for-link-a-objects-in-javascript
document.onclick = (e) => {
	e = e || window.event
	var element = e.target || e.srcElement

	if (element.tagName.toLowerCase() === 'a') {
		redirect(element.href)
		return false // prevents default action and stops event propagation
	}
}

// to move the url in history
// https://gomakethings.com/how-to-update-the-browser-url-without-refreshing-the-page-using-the-vanilla-js-history-api/
// https://gomakethings.com/how-to-detect-when-the-browser-url-changes-with-vanilla-js/#:~:text=You%20can%20use%20the%20popstate,The%20URL%20changed...%20%7D)%3B
window.addEventListener("popstate", navigate)

// you could also just call navigate, since i place this script at the bottom
document.addEventListener("DOMContentLoaded", navigate)
