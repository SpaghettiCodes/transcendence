export default function fourofour(prop={}) {
	let prerender = () => {
	}

	let render_code = () => {
		return `
		<div>
			404 not found
		</div>
		`
	}

	let postrender = () => {
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}