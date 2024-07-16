export default function fourofour(prop={}) {
	let prerender = () => {
		return true
	}

	let render_code = () => {
		return `
        <div class="d-flex flex-column min-vh-100 justify-content-center align-items-center container-fluid text-white" id="fourofour">
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