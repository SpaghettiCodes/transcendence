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
                <div class="col-md-8 match-history ">
                    <h3>Match History</h3>
                    <div class="tab-content mt-3" id="matchHistoryTabContent">
                        <div class="tab-pane fade show active" id="recent" role="tabpanel" aria-labelledby="recent-tab">
                            <ul class="list-group">
                            ${generateList(matchHistory, match => `<li class="list-group-item">${match.match}: ${match.result}</li>`)}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="bottom-left-buttons">
            ${createButton('Change Profile Pic', 'btn btn-secondary', 'button')}
            ${createButton('Change Email', 'btn btn-secondary', 'button')}
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