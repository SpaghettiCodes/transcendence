
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
						<i class="bi bi-house"></i>
						<a href="/home">Home</a>
					</li>
					<li>
			 			<i class="bi bi-person"></i>
						<a href="/userprofile">Profile</a>
					</li>
					<li>
						<i class="bi bi-chat"></i>
						<a href="/chat">Chat</a>
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