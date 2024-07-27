export default function createInputFields(inputElement, labelName, labelClass, fieldClass, errorClass, errorId) {
	return `
		<div class="${fieldClass}">
			<div class="${labelClass}">
				${labelName}:
			</div>
			${inputElement}
			<h3 class="${errorClass}" id="${errorId}">Test</h3>
		</div>
	`
}