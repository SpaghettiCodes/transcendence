export default class errorDiv {
	constructor (msg) {
		this.mainDiv = document.createElement("div")
		this.mainDiv.setAttribute('class', 'errorBox rounded')
		this.mainDiv.innerText = msg
	}
}