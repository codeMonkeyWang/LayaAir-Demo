/**
 * GameInfo     
 */
class GameInfo extends ui.GameInfoUI {
    constructor(parameters) {
        super();
        this.pauseBtn.on("click",this,this.onPauseBtnClick);
    }

    
}