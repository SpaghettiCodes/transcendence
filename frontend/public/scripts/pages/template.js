export default function template(prop=undefined) {
	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = () => {
	}

	// return the html code here
	let render_code = () => {
		return ``
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
	}

	return [prerender, render_code, postrender]
}