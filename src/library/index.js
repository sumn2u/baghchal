import Game from "./game/game";
(function(window){

    /**
     * render congratulations modal
     */

    const _modalService= () =>{
      const d = document;
       const body = d.querySelector('body');
      const buttons = d.querySelectorAll('[data-modal-trigger]');

      // attach click event to all modal triggers
      for (let button of buttons) {
        triggerEvent(button);
      }

      function triggerEvent(button) {
        // button.addEventListener('click', () => {
        const trigger = button.getAttribute('data-modal-trigger');
        const modal = d.querySelector(`[data-modal=${trigger}]`);
        const modalBody = modal.querySelector('.modal-body');
        const closeBtn = modal.querySelector('.close');

        closeBtn.addEventListener('click', () => modal.classList.remove('is-open'))
        modal.addEventListener('click', () => modal.classList.remove('is-open'))

        modalBody.addEventListener('click', (e) => e.stopPropagation());

        modal.classList.toggle('is-open');

       // Close modal when hitting escape
         body.addEventListener('keydown', (e) => {
           if (e.keyCode === 27) {
             modal.classList.remove('is-open')
           }
         });
        //  });
      }
    }
    const _init = (config)=>{
       return new Game(config);
     }
     window.game = {
       init:_init,
       modalService: _modalService
     }

     
   
   })(window);

  