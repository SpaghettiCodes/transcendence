import { redirect } from "../../router.js"
import { generateProfileInfo } from "../../components/generateProfileInfo.js";
import { generateList } from "../../components/generateList.js";
import { createButton } from "../../components/elements.js";
import { fetchMod } from "../../jwt.js";
import { generateMatchHistory } from "./components/matchHistory.js";

export default function template(prop={}) {
	let yourName = undefined

	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = async () => {
		try {
			// get user data
			const response = await fetchMod("http://localhost:8000/api/me"); //change to the correct endpoint
			if (!response.ok)
				throw new Error('Network response was not ok ' + response.statusText);
			const data = await response.json();
			console.log(data)
			prop.data = data; // Store the fetched data in the prop object
			yourName = data.username

			// get match history
			// i may throw this in /players and /me also
			// see first
			const matchHistoryResponse = await fetchMod(`http://localhost:8000/api/player/${yourName}/match`)
			if (!matchHistoryResponse.ok)
				throw new Error('Server responded with ' + matchHistoryResponse.statusText)
			const matchData = await matchHistoryResponse.json()
			prop.match = matchData

			return true; // Return true to continue to render_code
		} catch (error) {
			console.error('Fetch error:', error);
			return false; // Return false to abort rendering
		}
	};


	// return the html code here
	let render_code = () => {
		const profile = prop.data
		const matches = prop.match

		console.log(matches)

		return `
		<div class="container text-white text-center">
			<h1 class="title">Employee Infos</h1>
		</div>
		<div class="container lowered text-white">
			<div class="profile p-4">
				${generateProfileInfo(profile)} 
				<div class="col-md-8 match-history ">
					<h3>Match History</h3>
					<div class="tab-content mt-3" id="matchHistoryTabContent">
						<div class="tab-pane fade show active" id="recent" role="tabpanel" aria-labelledby="recent-tab">
							<ul class="list-group">
								${generateMatchHistory(matches)}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="bottom-left-buttons">
			${createButton('Change Profile Pic', 'btn btn-secondary', '', 'pfp_button')}
			${createButton('Change Email', 'btn btn-secondary', '', 'email_button')}
		</div>
	`
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		const linkResultURL = () => {
			let matches = prop.match
			matches.forEach(match => {
				let matchId = match.matchid
				console.log(match)
				console.log(match.matchid)
				let matchDiv = document.getElementById(`match-${matchId}`)
				matchDiv.onclick = () => {
					redirect(`/match/${matchId}/results`)
				}
			});
		}
		linkResultURL()

		document.getElementById('pfp_button').accept = 'image/*'
		document.getElementById("pfp_button").addEventListener("click", () => {
			// Trigger file selection dialog
			document.getElementById("fileInput").click(); // Assuming you add an input element with id "fileInput"
		});
		
		// Add an input element for file selection
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = 'image/*';
		fileInput.id = 'fileInput';
		fileInput.style.display = 'none'; // Hide the input element
		
		// Append the file input to the body or a suitable container
		document.body.appendChild(fileInput);

		// Add change event listener to the file input
		fileInput.addEventListener('change', async (event) => {
			const file = event.target.files[0];
			if (!file) return;
		
			const formData = new FormData();
			formData.append("profile_pic", file);
		
			const url = `http://localhost:8000/api/player/${yourName}`;
			const response = await fetchMod(url, {
				method: "PATCH",
				body: formData,
			});
			const json = await response.json();
			document.getElementById("pfp").src = `http://localhost:8000/api${json.profile_pic}`;
		});

		document.getElementById("email_button").addEventListener("click", async () => {
			const newEmail = prompt("Enter new email:");
			if (newEmail) {
				const url = `http://localhost:8000/api/player/${yourName}`;
				const response = await fetchMod(url, {
					method: "PATCH",
					body: JSON.stringify({
						"email": newEmail
					}),
					headers: {
						"Content-Type": "application/json",
					}
				});
			}
		});
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}

// async function player_test() {
// 	const response = await fetch("http://localhost:8000/api/me");
// 	const json = await response.json();
// 	console.log(json);
// 	yourName = json.username
// 	document.getElementById("username").innerHTML = json.username;
// 	document.getElementById("stats").innerHTML = `<p>Games Played: ${json.matches_played}</p>
// 				<p>Games Won: ${json.matches_won}</p>
// 				<p>Win/Lost Ratio: 1.5</p>`
// 	document.getElementById("pfp").src = `http://localhost:8000/api${json.profile_pic}`;
// 	let matchHistory = [];
// 	MHTemp.forEach(match => {
// 		let matchDiv = `<li class="list-group-item">${match.result.attacker.username} vs ${match.result.defender.username} - ${match.result.winner} WON</li>`;
// 		matchHistory.push(matchDiv);
// 	});
// 	let mhArray = matchHistory.slice(0, 5).join('');
// 	document.getElementById("mh").innerHTML = mhArray;
// }