// Simple input system. When a button is held down, a field with the button name is set to true.
// When the button is released the field is reset to false.
export class InputHandler {
    constructor(window){
        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
        window.addEventListener('keyup', (event) => this.handleKeyUp(event));
        this.input = new PIXI.Point();
    }

    handleKeyDown(event) {
        this[event.code] = true;
    }

    handleKeyUp(event) {
        this[event.code] = false;
    }
}