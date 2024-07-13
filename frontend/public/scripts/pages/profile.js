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
    <div class="video-container">
        <video autoplay muted loop id="bg-video">
            <source src="video/among_us.mp4" type="video/mp4">
            Your browser does not support HTML5 video.
        </video>
    </div>
    <div class="container text-white text-center">
        <h1 class="title">Employee Infos</h1>
    </div>
    <div class="container lowered text-white">
        <div class="profile p-4">
            <div class="profile-info">
                <img src="bocchi.jpeg" alt="Profile Picture" class="profile-pic">
                <h2 class="mt-3">Username</h2>
                <div class="game-stats">
                    <p>Games Played: 3</p>
                    <p>Games Won: 2</p>
                    <p>Win/Lost Ratio: 1.5</p>
                </div>
            </div>
            <div class="col-md-8 match-history ">
                <h3>Match History</h3>
                <div class="tab-content mt-3" id="matchHistoryTabContent">
                    <div class="tab-pane fade show active" id="recent" role="tabpanel" aria-labelledby="recent-tab">
                        <ul class="list-group">
                            <li class="list-group-item">Match 1: Win</li>
                            <li class="list-group-item">Match 2: Loss</li>
                            <li class="list-group-item">Match 3: Win</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div>

            </div>
        </div>
    </div>

    <div class="bottom-left-buttons">
        <button type="button" class="btn btn-secondary">Change Profile Pic</button>
        <button type="button" class="btn btn-secondary">Change Email</button>
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