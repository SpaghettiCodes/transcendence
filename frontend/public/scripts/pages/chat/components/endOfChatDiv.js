export default class endOfChatDiv {
	constructor () {
		this.mainDiv = document.createElement('div')
		this.mainDiv.setAttribute('class', 'eofBox rounded')
		this.mainDiv.innerText = 'End of conversation'
	}
}