export const createButton = (classes = '', type, text, id='') => `
    <button class="${classes}" type="${type}" id="${id}"><span>${text}</span></button>
`;

export const createInput = (classes = '', type, id, name, placeholder= '') => `
    <input type="${type}" class="${classes}" id="${id}" name="${name}" placeholder="${placeholder}">
`;

export const createContainer = (content, extraClasses = '') => `
    <div class="container-center ${extraClasses}">
        ${content}
    </div>
`;