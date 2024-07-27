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
	pictureDiv.src = `http://localhost:8000${profile_pic}`
	newFriendDiv.append(pictureDiv)

	let usernameDiv = document.createElement('div')
	usernameDiv.setAttribute('class', '')
	usernameDiv.innerText = username
	newFriendDiv.append(usernameDiv)

	newFriendDiv.onclick = onClickFunction(newFriendDiv)
	return newFriendDiv
}

export default function generateUserTabs(friendList, onClickFunctionGenerator) {
	return friendList.map((friend) => generateUserTab(friend, onClickFunctionGenerator(friend)))
}
