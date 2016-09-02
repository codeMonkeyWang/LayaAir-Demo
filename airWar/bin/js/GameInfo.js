var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * GameInfo
 */
var GameInfo = (function (_super) {
    __extends(GameInfo, _super);
    function GameInfo() {
        _super.call(this);
        // this.pauseBtn.on("click",this,this.onPauseBtnClick);
        // this.reset();
    }
    GameInfo.prototype.reset = function () {
        // this.infoLabel.text = "";
        // this.setHp(5);
        // this.setLevel(0);
        // this.setScore(0);
    };
    GameInfo.prototype.onPauseBtnClick = function (e) {
        // e.stopPropagation(); //阻止事件冒泡
        // this.infoLabel.text = "游戏已暂停，任意地方恢复游戏"
        // gameInstance.pause();
        // Laya.stage.once("click",this,this.onStageClick);
    };
    GameInfo.prototype.onStageClick = function () {
        // this.infoLabel.text = "";
        // gameInstance.resume();
    };
    GameInfo.prototype.setHp = function (value) {
        //     this.hpLabel.text = "HP:"+value;
    };
    GameInfo.prototype.setLevel = function (value) {
        //     this.levelLabel.text = "Level:"+value;
    };
    GameInfo.prototype.setScore = function (value) {
        //     this.scoreLabel.text = "Score:"+value;
    };
    return GameInfo;
}(ui.MainUI));
//# sourceMappingURL=GameInfo.js.map