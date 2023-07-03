export function getTop(center, height) {
    return center - height / 2;
}

export function getBottom(center, height) {
    return center + height / 2;
}

export function getLeft(center, width) {
    return center - width / 2;
}

export function getRight(center, width) {
    return center + width / 2;
}

export function onMouseDragStart(e) {
    // 1. remember the position of the mouse cursor
    this.touchPosition = { x: e.data.global.x, y: e.data.global.y }

    // 2. set the dragging state for current sprite
    this.dragging = true;
    this.zIndex = 1;
}

export function onMouseMove(e) {
    if (!this.dragging) {
        return;
    }
    // 1. get the coordinate of the cursor
    const currPosition = { x: e.data.global.x, y: e.data.global.y };

    // 2. calculate offset
    const offsetX = currPosition.x - this.touchPosition.x;
    const offsetY = currPosition.y - this.touchPosition.y;

    // 3. apply the result to this sprite
    const { x, y } = this.field;
    const newX = x + offsetX;
    const newY = y + offsetY;
    this.position.set(newX, newY);
}
