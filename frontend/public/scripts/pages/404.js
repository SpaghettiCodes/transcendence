export default function fourofour(prop=undefined) {
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

	return [prerender, render_code, postrender]
}