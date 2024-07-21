export function generateList(items, renderItem) {
    return items.map(renderItem).join('');
}