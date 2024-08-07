import { createAlert } from "../../components/alert.js";
import { createButton } from "../../components/elements.js";
import { generateProfileInfo } from "../../components/generateProfileInfo.js";
import { fetchMod } from "../../jwt.js";
import { redirect } from "../../router.js"
import { redirectSpamWrapper } from "../helpers.js";
import { generateMatchHistory } from "./components/matchHistory.js";
import drawPieChartData from "./components/pieChartData.js";

export default function template(prop={}) {
	let yourName = undefined

	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = async () => {
		// get user data
		const response = await fetchMod("https://localhost:8000/api/me"); //change to the correct endpoint
		if (!response.ok) {
			history.back()
			return false
		}
		const data = await response.json();
		data.is_online = true // funny hack
		prop.data = data; // Store the fetched data in the prop object
		yourName = data.username

		// get match history
		// i may throw this in /players and /me also
		// see first
		const matchHistoryResponse = await fetchMod(`https://localhost:8000/api/player/${yourName}/match`)
		if (!matchHistoryResponse.ok) {
			history.back()
			return false
		}
		const matchData = await matchHistoryResponse.json()
		prop.match = matchData

		return true; // Return true to continue to render_code
	}

	// return the html code here
	let render_code = () => {
		const profile = prop.data
		const matches = prop.match

		return `
		<div class='d-flex flex-column overflow-hidden'>
			<div class="text-white text-center">
				<h1 class="title">Employee Info</h1>
			</div>
			<div class="d-flex justify-content-center flex-grow-1 gap-5 text-white overflow-y-hidden profile p-4">
				<div class='d-flex flex-column overflow-y-auto gap-3 profile-stuff'>
					<div class="profile-info">
						${generateProfileInfo(profile)}
						${profile.email ? `<div>Email: ${profile.email}</div>` : ""}
					</div>
					<div class="emailNoti" id='emailNoti'>
					</div>
					<div>
						${createButton('btn btn-secondary', 'button', 'Change Profile Pic', 'pfp_button')}
						${createButton('btn btn-secondary', 'button', 'Change Email', 'email_button')}
					</div>
					<div class="emailNoti" id='emailNoti'>
					</div>
					<div class="d-flex flex-column match-history flex-grow-1 overflow-y-auto p-3 rounded">
						<h3>Match History</h3>
						<div class="d-flex overflow-y-auto tab-content mt-3 tab-pane fade show active" id="recent" role="tabpanel" aria-labelledby="recent-tab" id="matchHistoryTabContent">
							<ul class="d-flex w-100 flex-column overflow-y-auto list-group">
								${generateMatchHistory(matches)}
							</ul>
						</div>
					</div>
				</div>
				<div class="d-flex flex-column chartArea scroll-y-auto">
					<div class="chartBox1">
						<canvas id="myChart1"></canvas>
					</div>
					<div class="chartBox2">
						<canvas id="myChart2"></canvas>
					</div>
                    <div class="chartBox3">
						<canvas id="myChart3"></canvas>
					</div>
				</div>
			</div>
		</div>
    `
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
		const emailNoti = document.getElementById('emailNoti')
		const profile = prop.data
		const { 
			pong_matches_won,
			pong_matches_lost,
			apong_matches_won,
			apong_matches_lost,
			tournament_won,
			tournament_lost,
		} = profile

		drawPieChartData(document.getElementById('myChart1'), {
			labels: ['Losses', 'Wins'],
			rawData: [pong_matches_lost, pong_matches_won],
			id: 'pong',
			gameName: 'Pong'
		})

		drawPieChartData(document.getElementById('myChart2'), {
			labels: ['Losses', 'Wins'],
			rawData: [apong_matches_lost, apong_matches_won],
			id: 'apong',
			gameName: 'APong'
		})

		drawPieChartData(document.getElementById('myChart3'), {
			labels: ['Losses', 'Wins'],
			rawData: [tournament_lost, tournament_won],
			id: 'tournament',
			gameName: 'Tournaments'
		})

		// ----- keep ----- //
		const linkResultURL = () => {
			let matches = prop.match
			matches.forEach(match => {
				let matchId = match.matchid
				let matchDiv = document.getElementById(`match-${matchId}`)
				matchDiv.onclick = redirectSpamWrapper(
					() => {
						redirect(`/match/${matchId}/results`)
					}
				)
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
			const fileSize = file.size / 1024 / 1024 // in mb
			if (!file) return;

			if (fileSize > 6) {
				return createAlert('error', 'File size is too big!')
			}
	
			const formData = new FormData();
			formData.append("profile_pic", file);
		
			const url = `https://localhost:8000/api/player/${yourName}`;
			const response = await fetchMod(url, {
				method: "PATCH",
				body: formData,
			});
			if (!response.ok) {
				if (response.status === 400) {
					let errorList = await response.json()
					let picErrorList = errorList['profile_pic']
					if (!picErrorList)
						return
					return createAlert('error', picErrorList[0])
				}
				return createAlert('error', 'Invalid Image!')
			}
			const json = await response.json();
			document.getElementById("pfp").src = `https://localhost:8000/api${json.profile_pic}`;	
		});

		document.getElementById("email_button").addEventListener("click", async () => {
			const newEmail = prompt("Enter new email:");
			if (newEmail) {
				const url = `https://localhost:8000/api/player/${yourName}`;
				const response = await fetchMod(url, {
					method: "PATCH",
					body: JSON.stringify({
						"email": newEmail
					}),
					headers: {
						"Content-Type": "application/json",
					}
				});

				if (!response.ok) {
					if (response.status === 400) {
						let errorList = await response.json()
						let emailErrorList = errorList['email']
						if (!emailErrorList)
							return
						return createAlert('error', emailErrorList[0])
					}
				}

				emailNoti.innerText = `Success, email is now ${newEmail}`
			}
		});
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}
