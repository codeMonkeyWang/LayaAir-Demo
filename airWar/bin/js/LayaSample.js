/**
 * @class 程序的入口
 */
var GameMain = (function () {
    function GameMain() {
        this.TEXTURE_PATH = "res/atlas/war.json";
        this.DATA_PATH = "res/airWar.json";
        Laya.init(480, 852);
        var bg = new BackGround();
        Laya.stage.addChild(bg);
        var assets = [];
        assets.push({ url: this.DATA_PATH, type: Laya.Loader.JSON });
        assets.push({ url: this.TEXTURE_PATH, type: Laya.Loader.ATLAS });
        Laya.loader.load(assets, Laya.Handler.create(this, this.onLoaded));
    }
    GameMain.prototype.onLoaded = function () {
        this.hero = new Role();
        this.hero.init(0);
        this.hero.pos(240, 700);
        Laya.stage.addChild(this.hero);
        Laya.stage.on("mousemove", this, this.onMouseMove);
        this.creatEnemy(10);
    };
    GameMain.prototype.onMouseMove = function () {
        this.hero.pos(Laya.stage.mouseX, Laya.stage.mouseY);
    };
    GameMain.prototype.creatEnemy = function (num) {
        for (var i = 0; i < num; i++) {
            //随机出现敌人
            var r = Math.random();
            //根据随机数，随机敌人   
            var type;
            if (r < 0.7) {
                type = 1;
            }
            else if (r < 0.95) {
                type = 2;
            }
            else {
                type = 3;
            }
            //创建敌人
            var enemy = Laya.Pool.getItemByClass("role", Role);
            enemy.init(type);
            //随机位置
            enemy.pos(Math.random() * 400 + 40, Math.random() * 200);
            //添加到舞台上
            Laya.stage.addChild(enemy);
        }
    };
    return GameMain;
}());
new GameMain();
//# sourceMappingURL=LayaSample.js.map