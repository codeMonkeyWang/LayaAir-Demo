/**
 * GameInfo     
 */
class GameInfo extends ui.MainUI {

    constructor() {
        super();
        this.pauseBtn.on("click",this,this.onPauseBtnClick);
        this.reset();
    }

    public reset():void{
        this.infoLabel.text = "";
        this.setHp(5);
        this.setLevel(0);
        this.setScore(0);
    }

    onPauseBtnClick(e:Laya.Event):void{
        e.stopPropagation(); //阻止事件冒泡
        this.infoLabel.text = "游戏已暂停，任意地方恢复游戏"
        gameInstance.pause();
        Laya.stage.once("click",this,this.onStageClick);
        
    }

    onStageClick(){
        this.infoLabel.text = "";
        gameInstance.resume();
    }
    
    public setHp(value:number){
        this.hpLabel.text = "HP:"+value;
    }

    public setLevel(value:number){
        this.levelLabel.text = "Level:"+value;
    }

    public setScore(value:number){
        this.scoreLabel.text = "Score:"+value;
    }
}