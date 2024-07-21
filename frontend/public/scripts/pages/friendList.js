import { redirect } from "../router.js"
import { createButton, createInput } from "../components/elements.js"
import { generateProfileInfo } from "../components/generateProfileInfo.js";
import { generateList } from "../components/generateList.js";

export default function template(prop={}) {
	let prerender = async () => {
		try {
			const response = await fetch('/api/friendlist'); //change to the correct endpoint
			if (!response.ok)
				throw new Error('Network response was not ok ' + response.statusText);
			const data = await response.json();
			prop.data = data; // Store the fetched data in the prop object
			return true; // Return true to continue to render_code
		} catch (error) {
			console.error('Fetch error:', error);
			return false; // Return false to abort rendering
		}
	};

	// return the html code here
	let render_code = () => {
		// temp for visual w/o backend, remove later
		const { friends = 
			[
				'Friend 1', 
				'Friend 2', 
				'Friend 3', 
				'Friend 4', 
				'Friend 5', 
				'Friend x', 
				'Friend x', 
				'Friend x', 
				'Friend x', 
				'Friend x', 
				'Friend x', 
				'Friend x', 
				'Friend x', 
				'Friend x', 
				'Friend x', 
				'Friend x', 
				'Friend x', 
				'Friend x', 
				'Friend x'
			], 
		profile = 
			{
				image: 'default-profile.jpg',
				username: 'Default Username',
				gamesPlayed: 4,
				gamesWon: 2,
				winLostRatio: 0.5
			}
		} = prop.data || {};

		return `
			<h1 class="title text-center text-white">Colleagues</h1>
			<div class="d-flex flex-row flex-grow-1 align-self-stretch overflow-auto">
				<div class="d-flex flex-column friend-list overflow-auto">
					<h4>Colleagues</h4>
					<div class="input-group">
						${createInput("form-control rounded", "search", "search", "Colleaguess' ID")}
						${createButton('Search', 'btn btn-dark', 'button')}
					</div>
					<div dir="rtl" class="d-flex flex-column flex-grow-1 overflow-auto mt-2 p-2">
						${generateList(friends, friend => `<div class="friend-list-item">${friend}</div>`)}
					</div>
				</div>
				<div class="d-flex flex-column flex-grow-1 p-3 overflow-auto profile-details">
					${generateProfileInfo(profile)}
					<div class="buttons-bottom">
						${createButton('Block', 'btn btn-success', 'button')}
						${createButton('Invite', 'btn btn-danger', 'button')}
						${createButton('Send Friend Request', 'btn btn-primary', 'button')}
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