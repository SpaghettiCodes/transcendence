// https://salonimehta27.medium.com/building-single-page-application-project-in-javascript-b55b767fdf53

// routing thingys
// https://dev.to/rohanbagchi/how-to-write-a-vanillajs-router-hk3

let mainDoc = document.getElementById("main")

import landing from "./pages/landing.js"
import fourofour from "./pages/404.js"
import ftlogin from "./pages/ft_login.js"
import home from "./pages/home.js"
import match from "./pages/match.js"
import game from "./pages/game.js"
import chat from "./pages/chat.js"
import profile from "./pages/profile.js"
import tournament from "./pages/tournament.js"
import matchmaking from "./pages/matchmaking.js"
import msg from "./pages/msg.js"
import friendlist from "./pages/friendlist.js"

const routes = {
	'/': landing,
	'/error': fourofour,
	'/ftlogin': ftlogin,
	'/home': home,
	'/match': match,
	'/match/<game_id>': match,
	'/match/<test>/<test2>': match,
	'/games': game,
	'/chat': chat,
	'/profile': profile,
	'/tournament': tournament,
	'/matchmaking': matchmaking,
	'/msg': msg,
	'/friendlist': friendlist
}

let clean_up_function = () => {}

const get_renderer = (uri, prop) => {
	// direct match
	if (uri in routes)
		return routes[uri]

	// no direct match, time to crY
	const	uri_chunks = uri.slice(1).split("/")
	const	argument_count = uri_chunks.length - 1
	console.log(uri_chunks)

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

	// it should only have 1 that fits
	// it would be really concerning if there is more
	// oh wait there may be more eh i worry about that tmr morning
	const found_uri = with_arguments[0]
	const arg_names = found_uri.slice(1).split("/").slice(1).map((value) => value.slice(1, value.length - 1))

	prop["arguments"] = {}
	arg_names.forEach((value, index) => {
		prop["arguments"][value] = uri_chunks[index + 1]
	})

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

	const uri = window.location.pathname
	render_html(uri, prop)
}

export const redirect = (uri, prop={}) => {
	clean_up_function()
	render_html(uri, prop)
	history.pushState("", "", uri)
}

// catch all links and change their default behavior
// to just use render_html instead of reloading the webpage
// https://www.sitepoint.com/javascript-event-delegation-is-easier-than-you-think/
// https://stackoverflow.com/questions/1760096/override-default-behaviour-for-link-a-objects-in-javascript
document.onclick = (e) => {
	e = e || window.event
	var element = e.target || e.srcElement

	if (element.tagName.toLowerCase() === 'a') {
		history.pushState("", "", element.href)
		render_html(element.getAttribute("href"))
		return false // prevents default action and stops event propagation
	}
}

// to move the url in history
// https://gomakethings.com/how-to-update-the-browser-url-without-refreshing-the-page-using-the-vanilla-js-history-api/
// https://gomakethings.com/how-to-detect-when-the-browser-url-changes-with-vanilla-js/#:~:text=You%20can%20use%20the%20popstate,The%20URL%20changed...%20%7D)%3B
window.addEventListener("popstate", navigate)

// you could also just call navigate, since i place this script at the bottom
document.addEventListener("DOMContentLoaded", navigate)
