/**
 * 角色类
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RoleType;
(function (RoleType) {
    RoleType[RoleType["hero"] = 0] = "hero";
    RoleType[RoleType["enemy1"] = 1] = "enemy1";
    RoleType[RoleType["enemy2"] = 2] = "enemy2";
    RoleType[RoleType["enemy3"] = 3] = "enemy3";
    RoleType[RoleType["bullet1"] = 4] = "bullet1";
    RoleType[RoleType["ufo1"] = 5] = "ufo1";
    RoleType[RoleType["ufo2"] = 6] = "ufo2";
})(RoleType || (RoleType = {}));
var Role = (function (_super) {
    __extends(Role, _super);
    function Role() {
        _super.call(this);
        this.roleTypeArr = ["hero", "enemy1", "enemy2", "enemy3", "bullet1", "ufo1", "ufo2"];
        //射击类型
        this.shootType = 0;
        //射击间隔
        this.shootInterval = 500;
        //下次射击时间
        this.shootTime = Laya.Browser.now() + 1000;
        //是否是子弹
        this.isBullet = false;
    }
    Role.prototype.init = function (type) {
        //通过json获取数据
        if (!this.data) {
            this.data = Laya.loader.getRes("res/airWar_Data.json");
        }
        if (type === RoleType.bullet1) {
            this.isBullet = true;
        }
        if (type === RoleType.hero) {
            this.shootType = 1;
        }
        //将枚举转换成数组中对应的字符
        this.type = this.roleTypeArr[type];
        //具体类型对应的Data
        var typeData = this.data[this.type];
        this.camp = typeData["camp"];
        this.hp = typeData["hp"] * (Main.level / 5 + 1);
        this.speed = typeData["speed"] * (Main.level / 10 + 1);
        this.hitRadius = typeData["hitRadius"];
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
            Laya.Animation.createFrames(["war/bullet1.png"], "bullet1_fly");
            Laya.Animation.createFrames(["war/ufo1.png"], "ufo1_fly");
            Laya.Animation.createFrames(["war/ufo2.png"], "ufo2_fly");
        }
        if (!this.body) {
            this.body = new Laya.Animation();
            this.body.interval = 50;
            //把机体添加到容器内
            this.addChild(this.body);
            this.body.on(Laya.Event.COMPLETE, this, this.onPlayComplete);
        }
        this.playAction("fly");
    };
    /**
     * 用来加载这种帧动画
     */
    Role.prototype.playAction = function (action) {
        this.action = action;
        this.body.play(0, true, this.type + "_" + action);
        var bound = this.body.getBounds();
        this.body.pos(-bound.width / 2, -bound.height / 2);
    };
    Role.prototype.onPlayComplete = function () {
        if (this.action === "down") {
            this.body.stop();
            this.visible = false;
        }
        else if (this.action === "hit") {
            this.playAction("fly");
        }
    };
    //是否缓存了动画
    Role.cached = false;
    return Role;
}(Laya.Sprite));
//# sourceMappingURL=Role.js.map