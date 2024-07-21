export const createButton = (text, classes = '', type) => `
    <button class="${classes}" type="${type}"><span>${text}</span></button>
`;

export const createInput = (classes = '', type, id, name, placeholder) => `
    <input type="${type}" class="${classes}" id="${id}" name="${name}" placeholder="${placeholder}">
`;

export const createContainer = (content, extraClasses = '') => `
    <div class="container-center ${extraClasses}">
        ${content}
    </div>
`;