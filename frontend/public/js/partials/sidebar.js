
export default function sidebar(prop={}) {
	let prerender = () => {
		return true
	}

	let render_code = () => {
		return `
        <h2 style="color: white">Sidebar</h2>
        <input type="checkbox" id="check">
        <div class="btn_one">
          <label for="check">
            <i class="bi bi-list" style="font-size: 2rem; color: white;"></i>
          </label>
        </div>
		`
	}

	let postrender = () => {
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}