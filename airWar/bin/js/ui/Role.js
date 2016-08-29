var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * 角色类
 */
var Role = (function (_super) {
    __extends(Role, _super);
    function Role(camp) {
        _super.call(this);
        this.camp = camp;
        if (!this.data) {
            Laya.loader.load("res/airWar.json", Laya.Handler.create(this, this.init), null, Laya.Loader.JSON);
        }
        else {
            this.init();
        }
    }
    Role.prototype.init = function () {
        if (!this.data) {
            this.data = Laya.loader.getRes("res/airWar.json");
            console.log(this.data);
        }
        //具体类型对应的Data
        var typeData = this.data[this.camp + ""];
        this.type = typeData["type"];
        this.hp = typeData["hp"];
        this.speed = typeData["speed"];
        this.hitRadius = typeData["hirRadius"];
        //缓存公用动画模板，减少对象创建开销
        if (!Role.cached) {
            Role.cached = true;
            //缓存hero_fly动画
            Laya.Animation.createFrames(["war/hero1.png", "war/hero2.png"], "hero_fly");
            //缓存hero_down动画
            Laya.Animation.createFrames(["war/hero_down1.png", "war/hero_down2.png", "war/hero_down3.png", "war/hero_down4.png"], "hero_down");
            //缓存enemy1_fly动画
            Laya.Animation.createFrames(["war/enemy1.png"], "enemy1_fly");
            //缓存enemy1_down动画
            Laya.Animation.createFrames(["war/enemy1_down1.png", "war/enemy1_down2.png", "war/enemy1_down3.png", "war/enemy1_down4.png"], "enemy1_down");
            //缓存enemy2_fly动画
            Laya.Animation.createFrames(["war/enemy2.png"], "enemy2_fly");
            //缓存enemy2_down动画
            Laya.Animation.createFrames(["war/enemy2_down1.png", "war/enemy2_down2.png", "war/enemy2_down3.png", "war/enemy2_down4.png"], "enemy2_down");
            //缓存enemy2_hit动画
            Laya.Animation.createFrames(["war/enemy2_hit.png"], "enemy2_hit");
            //缓存enemy3_fly动画
            Laya.Animation.createFrames(["war/enemy3_n1.png", "war/enemy3_n2.png"], "enemy3_fly");
            //缓存enemy3_down动画
            Laya.Animation.createFrames(["war/enemy3_down1.png", "war/enemy3_down2.png", "war/enemy3_down3.png", "war/enemy3_down4.png", "war/enemy3_down5.png", "war/enemy3_down6.png"], "enemy3_down");
            //缓存enemy3_hit动画
            Laya.Animation.createFrames(["war/enemy3_hit.png"], "enemy3_hit");
        }
        if (!this.body) {
            this.body = new Laya.Animation();
            //把机体添加到容器内
            this.addChild(this.body);
        }
        this.playAction("fly");
    };
    Role.prototype.playAction = function (action) {
        this.body.play(0, true, this.type + "_" + action);
        var bound = this.body.getBounds();
        this.body.pos(-bound.width / 2, -bound.height / 2);
    };
    //是否缓存了动画
    Role.cached = false;
    return Role;
}(Laya.Sprite));
//# sourceMappingURL=Role.js.map