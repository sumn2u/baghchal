import { el } from "../dom";

export class OnlineUsersList {
    constructor() {
        this.el = el('li');
    }
   
    update(user) {
        this.el = el('li.online-user',
            el('span',user.name),
             el('span.select-friend-span',
                el('button.btn.send-friend-req',{socketId:user.socketId},'Send Request')
            )
        );
    }
}