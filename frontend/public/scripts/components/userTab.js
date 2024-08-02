// the tab for SMS and friendlist?
// generates THAT
// use in postrender because its impossible to bind onclick when its not on DOM
// ... unless i refactor the entire rendering mechanism buT eHHh fUCk iT i DOnt Care

function generateUserTab(friendData, onClickFunction) {
	let { username, profile_pic } = friendData

	let newFriendDiv = document.createElement('div')
	newFriendDiv.setAttribute('class', 'friend-list-item gap-3')

	let pictureDiv = document.createElement('img')
	pictureDiv.setAttribute('class', 'picture rounded')
	pictureDiv.src = `https://172.20.10.2:8000${profile_pic}`
	newFriendDiv.append(pictureDiv)

	let usernameDiv = document.createElement('div')
	usernameDiv.setAttribute('class', '')
	usernameDiv.innerText = username
	newFriendDiv.append(usernameDiv)

	if (onClickFunction)
		newFriendDiv.onclick = onClickFunction(newFriendDiv)

	newFriendDiv.playerAssociated = username
	newFriendDiv.setAttribute('id', `player-details-${username}`)
	return newFriendDiv
}

export function generateBlockedTab(fellaUsername,  onClickFunction) {
	let newBlockedDiv = document.createElement('div')
	newBlockedDiv.setAttribute('class', 'friend-list-item gap-3')

	let youBlockedThisguy = document.createElement('div')
	youBlockedThisguy.setAttribute('class', '')
	youBlockedThisguy.style.fontWeight = 'bolder'
	youBlockedThisguy.innerText = "Blocked User"

	if (onClickFunction) {
		newBlockedDiv.onclick = onClickFunction(newBlockedDiv)
	}

	newBlockedDiv.playerAssociated = fellaUsername
	newBlockedDiv.append(youBlockedThisguy)
	return newBlockedDiv
}

export default function generateUserTabs(friendList, onClickFunctionGenerator) {
	if (onClickFunctionGenerator === undefined) {
		onClickFunctionGenerator = () => undefined
	}

	return friendList.map((friend) => generateUserTab(friend, onClickFunctionGenerator(friend)))
}

export function getUserTab(usernameID) {
	return document.getElementById(`player-details-${usernameID}`)
} 