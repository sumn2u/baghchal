import { el } from "../dom";

export class TigerPossibleMoveList {
    constructor() {
        this.el = el('li');
    }
   
    update(point) {
        this.el = el('li',el('span.possible-point',point));
    }
}