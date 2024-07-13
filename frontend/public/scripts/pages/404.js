export default function fourofour(prop={}) {
	let prerender = () => {
		return true
	}

	let render_code = () => {
		return `
        <div class="content container text-white" id="fourofour">
            <p>404</p>
            <h1>Impostor(page) not found</h1>
        </div>
		`
	}

	let postrender = () => {
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}