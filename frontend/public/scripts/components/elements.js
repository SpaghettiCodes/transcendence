export const createButton = (text, classes = '', type) => `
    <button class="${classes}" type="${type}"><span>${text}</span></button>
`;

export const createInput = (classes = '', type, id, placeholder) => `
    <input type="${type}" class="${classes}" id="${id}" placeholder="${placeholder}">
`;

export const createContainer = (content, extraClasses = '') => `
    <div class="container-center ${extraClasses}">
        ${content}
    </div>
`;