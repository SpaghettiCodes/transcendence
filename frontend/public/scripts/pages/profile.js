import { redirect } from "../router.js"
import { generateProfileInfo } from "../components/generateProfileInfo.js";
import { generateList } from "../components/generateList.js";
import { createButton } from "../components/elements.js";

export default function template(prop={}) {
	// attach all pre-rendering code here (like idk, fetch request or something)
    let prerender = async () => {
        try {
            const response = await fetch('/api/profile'); //change to the correct endpoint
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
        const { profile = 
                    { 
                        image: 'bocchi.jpeg', 
                        username: 'Username', 
                        gamesPlayed: 3, 
                        gamesWon: 2, 
                        winLostRatio: 1.5 
                    }, 
                matchHistory = 
                    [
                        { match: 'Match 1', result: 'Win' }, 
                        { match: 'Match 2', result: 'Loss' }, 
                        { match: 'Match 3', result: 'Win' }
                    ] 
            } = prop.data || {};
            
		return `
        <div class="container text-white text-center">
            <h1 class="title">Employee Infos</h1>
        </div>
        <div class="container lowered text-white">
            <div class="profile p-4">
                ${generateProfileInfo(profile)}  
                <div class="profile-info">
                    <img src="bocchi.jpeg" alt="Profile Picture" class="profile-pic" id="pfp">
                    <h2 class="mt-3" id="username">Username</h2>
                    <div class="game-stats" id="stats">
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
                            ${generateList(matchHistory, match => `<li class="list-group-item">${match.match}: ${match.result}</li>`)}
                            <ul class="list-group" id="mh">
                                <li class="list-group-item">Match 1: Win</li>
                                <li class="list-group-item">Match 2: Loss</li>
                                <li class="list-group-item">Match 3: Win</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="bottom-left-buttons">
            ${createButton('Change Profile Pic', 'btn btn-secondary', 'button')}
            ${createButton('Change Email', 'btn btn-secondary', 'button')}
            <button type="button" class="btn btn-secondary" id="pfp_button" accept="image/*">Change Profile Pic</button>
            <button type="button" class="btn btn-secondary" id="email_button">Change Email</button>
        </div>
    `
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
        async function register_test() {
            const url = "http://localhost:8000/api/register";
            const response = await fetch(url, {
                method: "POST",
                body: {
                    "username": "test",
                    "password": "testtest",
                },
                headers: {
                    "Content-Type": "application/json",
                  }
            })
        }
        async function player_test() {
            const url = "http://localhost:8000/api/player/test";
            const response = await fetch(url);
            const json = await response.json();
            console.log(json);
            document.getElementById("username").innerHTML = json.username;
            document.getElementById("stats").innerHTML = `<p>Games Played: ${json.matches_played}</p>
                        <p>Games Won: ${json.matches_won}</p>
                        <p>Win/Lost Ratio: 1.5</p>`
            document.getElementById("pfp").src = `http://localhost:8000/api${json.profile_pic}`;     
            let raw = `[
                {
                    "matchid": "aaaabB",
                    "time_played": "2024-07-20T14:21:44.774438Z",
                    "status": "done",
                    "type": "pong",
                    "result": {
                        "attacker": {
                            "username": "2",
                            "profile_pic": "/media/firefly.png",
                            "is_active": true
                        },
                        "defender": {
                            "username": "1",
                            "profile_pic": "/media/firefly.png",
                            "is_active": true
                        },
                        "attacker_score": 1,
                        "defender_score": 0,
                        "winner": "2",
                        "loser": "1",
                        "reason": "normal"
                    }
                },
                {
                    "matchid": "aaaabL",
                    "time_played": "2024-07-20T16:17:17.642469Z",
                    "status": "done",
                    "type": "apong",
                    "result": {
                        "attacker": {
                            "username": "2",
                            "profile_pic": "/media/firefly.png",
                            "is_active": true
                        },
                        "defender": {
                            "username": "1",
                            "profile_pic": "/media/firefly.png",
                            "is_active": true
                        },
                        "attacker_score": 1,
                        "defender_score": 0,
                        "winner": "2",
                        "loser": "1",
                        "reason": "normal"
                    }
                },
                {
                    "matchid": "aaaabS",
                    "time_played": "2024-07-20T16:38:21.075138Z",
                    "status": "done",
                    "type": "pong",
                    "result": {
                        "attacker": {
                            "username": "2",
                            "profile_pic": "/media/firefly.png",
                            "is_active": true
                        },
                        "defender": {
                            "username": "1",
                            "profile_pic": "/media/firefly.png",
                            "is_active": true
                        },
                        "attacker_score": 1,
                        "defender_score": 1,
                        "winner": "1",
                        "loser": "2",
                        "reason": "draw"
                    }
                },
                {
                    "matchid": "aaaabT",
                    "time_played": "2024-07-20T16:41:45.170125Z",
                    "status": "done",
                    "type": "pong",
                    "result": {
                        "attacker": {
                            "username": "1",
                            "profile_pic": "/media/firefly.png",
                            "is_active": true
                        },
                        "defender": {
                            "username": "2",
                            "profile_pic": "/media/firefly.png",
                            "is_active": true
                        },
                        "attacker_score": 0,
                        "defender_score": 1,
                        "winner": "2",
                        "loser": "1",
                        "reason": "normal"
                    }
                },
                {
                    "matchid": "aaaabU",
                    "time_played": "2024-07-20T16:47:57.357135Z",
                    "status": "done",
                    "type": "pong",
                    "result": {
                        "attacker": {
                            "username": "1",
                            "profile_pic": "/media/firefly.png",
                            "is_active": true
                        },
                        "defender": {
                            "username": "2",
                            "profile_pic": "/media/firefly.png",
                            "is_active": true
                        },
                        "attacker_score": 1,
                        "defender_score": 0,
                        "winner": "1",
                        "loser": "2",
                        "reason": "normal"
                    }
                },
                {
                    "matchid": "aaaabV",
                    "time_played": "2024-07-20T16:49:11.657927Z",
                    "status": "done",
                    "type": "pong",
                    "result": {
                        "attacker": {
                            "username": "1",
                            "profile_pic": "/media/firefly.png",
                            "is_active": true
                        },
                        "defender": {
                            "username": "2",
                            "profile_pic": "/media/firefly.png",
                            "is_active": true
                        },
                        "attacker_score": 0,
                        "defender_score": 2,
                        "winner": "2",
                        "loser": "1",
                        "reason": "normal"
                    }
                }
            ]`
            let MHTemp = JSON.parse(raw);
            console.log(MHTemp);
            let matchHistory = [];
            MHTemp.forEach(match => {
                let matchDiv = `<li class="list-group-item">${match.result.attacker.username} vs ${match.result.defender.username} - ${match.result.winner} WON</li>`;
                matchHistory.push(matchDiv);
            });

            let mhArray = matchHistory.slice(0, 5).join('');
            document.getElementById("mh").innerHTML = mhArray;
        }
        // register_test();
        player_test();

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
        
            const url = "http://localhost:8000/api/player/test";
            const response = await fetch(url, {
                method: "PATCH",
                body: formData,
            });
            const json = await response.json();
            document.getElementById("pfp").src = `http://localhost:8000/api${json.profile_pic}`;
        });

        document.getElementById("email_button").addEventListener("click", async () => {
            const newEmail = prompt("Enter new email:");
            if (newEmail) {
                const url = "http://localhost:8000/api/player/test";
                const response = await fetch(url, {
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