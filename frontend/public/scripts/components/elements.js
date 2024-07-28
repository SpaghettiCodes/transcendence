export const createButton = (classes = '', type, text, id='', dataAttrs = {}) => {
    const dataAttributes = Object.entries(dataAttrs).map(([key, value]) => `data-${key}="${value}"`).join(' ');
    return `<button class="${classes}" type="${type}" id="${id}" ${dataAttributes}><span>${text}</span></button>`;
};

export const createInput = (classes = '', type, id, name, placeholder= '') => `
    <input type="${type}" class="${classes}" id="${id}" name="${name}" placeholder="${placeholder}">
`;

export const createContainer = (content, extraClasses = '') => `
    <div class="container-center ${extraClasses}">
        ${content}
    </div>
`;