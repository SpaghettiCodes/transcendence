export default function fourofour(prop={}) {
	let prerender = () => {
	}

	let render_code = () => {
		return `
        <div class="content container text-white">
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