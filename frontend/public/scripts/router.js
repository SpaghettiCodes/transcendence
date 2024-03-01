// https://salonimehta27.medium.com/building-single-page-application-project-in-javascript-b55b767fdf53

// routing thingys
// https://dev.to/rohanbagchi/how-to-write-a-vanillajs-router-hk3

let mainDoc = document.getElementById("main")

import landing from "./pages/landing.js"
import fourofour from "./pages/404.js"
import ftlogin from "./pages/ft_login.js"
import home from "./pages/home.js"

const routes = {
	'/': landing,
	'/error': fourofour,
	'/ftlogin': ftlogin,
	'/home': home,
}

const render_html = (which, prop=undefined) => {
	let to_render = (which in routes) ? routes[which] : routes["/error"]
	let [ prerender, render_code, postrender ] = to_render(prop)
	prerender()
	mainDoc.innerHTML = render_code()
	postrender()
}

const navigate = (e, prop=undefined) => {
	e.preventDefault()

	const uri = window.location.pathname
	render_html(uri, prop)
}

export const redirect = (uri, prop=undefined) => {
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
