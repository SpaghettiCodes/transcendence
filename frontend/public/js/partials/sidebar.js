
export default function sidebar(prop={}) {
	let prerender = () => {
		return true
	}

	let render_code = () => {
		return `
        <input type="checkbox" id="check">
        <div class="btn_one">
          <label for="check">
            <i class="bi bi-list"></i>
          </label>
        </div>
		<div class="sidebar_menu">
			<div class="logo">
				<a href="/home">Apong Us</a>
			</div>
			<div class="btn_two">
				<label for="check">
					<i class="bi bi-x"></i>
				</label>
			</div>
			<div class="menu">
				<ul>
					<li>
						<a href="/home">
							<i class="bi bi-house"></i> Home
						</a>
					</li>
					<li>
						<a href="/userprofile">
							<i class="bi bi-person"></i>Profile
						</a>
					</li>
					<li>
						<a href="/chat">
							<i class="bi bi-chat"></i>Chat
						</a>
					</li>
				</ul>
			</div>
		</div>
		`
	}

	let postrender = () => {
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}