import { redirect } from "../router.js"

export default function template(prop={}) {
	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = () => {
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `
        <div id="msg">
            <div class="video-container">
            <video autoplay muted loop id="bg-video">
                <source src="video/among_us.mp4" type="video/mp4">
                Your browser does not support HTML5 video.
            </video>
            </div>
            <div class="container text-center text-white">
                <h1 class="title">SMS</h1>
            </div>
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-3">
                        <div class="friend-list">
                            <h4>Colleagues</h4>
                            <div class="input-group mb-3">
                                <input type="search" class="form-control rounded" placeholder="Colleagues' ID"/>
                                <button type="button" class="btn btn-dark" data-mdb-ripple-init>Search</button>
                            </div>
                            <div class="friend-list-item">Friend 1</div>
                            <div class="friend-list-item">Friend 2</div>
                            <div class="friend-list-item">Friend 3</div>
                            <div class="friend-list-item">Friend 4</div>
                            <div class="friend-list-item">Friend 5</div>
                        </div>
                    </div>
                    <div class="col-md-9">
                        <div class="gray-box">
                            <h4>Gray Box</h4>
                            <p>Some content here</p>
                        </div>
                        <div class="text-input-box">
                            <div class="d-flex flex-row text-input-box">
                                <textarea class="form-control" rows="1" placeholder="Type your message here..."></textarea>
                                <button  type="button" class="btn btn-dark mx-2">Send</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}