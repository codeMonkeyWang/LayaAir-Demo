/**
 * @class 程序的入口
 *
 */
var Main = (function () {
    function Main() {
        this.level = 0;
        this.score = 0;
        this.levelUpScore = 10;
        this.bulletLevel = 0;
        this.TEXTURE_PATH = "res/atlas/war.json";
        this.DATA_PATH = "res/airWar_Data.json";
        Laya.init(480, 852, Laya.WebGL);
        var assets = [];
        assets.push({ url: this.DATA_PATH, type: Laya.Loader.JSON });
        assets.push({ url: this.TEXTURE_PATH, type: Laya.Loader.ATLAS });
        Laya.loader.load(assets, Laya.Handler.create(this, this.onLoaded));
        Laya.stage.scaleMode = "showall";
        // 设置剧中对齐
        Laya.stage.alignH = "center";
        // //设置横竖屏
        Laya.stage.screenMode = "vertical";
        //显示FPS
        Laya.Stat.show(0, 50);
    }
    Main.prototype.onLoaded = function () {
        var bg = new BackGround();
        Laya.stage.addChild(bg);
        this.hero = new Role();
        this.hero.init(RoleType.hero);
        this.hero.pos(240, 700);
        Laya.stage.addChild(this.hero);
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        this.creatEnemy(10);
        //定时销毁
        Laya.timer.frameLoop(1, this, this.onLoop);
    };
    Main.prototype.onMouseMove = function () {
        this.hero.pos(Laya.stage.mouseX, Laya.stage.mouseY);
    };
    Main.prototype.creatEnemy = function (num) {
        for (var i = 0; i < num; i++) {
            //随机出现敌人
            var r = Math.random();
            //根据随机数，随机敌人   
            var type;
            if (r < 0.7) {
                type = RoleType.enemy1;
            }
            else if (r < 0.95) {
                type = RoleType.enemy2;
            }
            else {
                type = RoleType.enemy3;
            }
            //创建敌人
            var enemy = Laya.Pool.getItemByClass("role", Role);
            enemy.init(type);
            //随机位置
            enemy.pos(Math.random() * 400 + 40, -Math.random() * 200);
            //添加到舞台上
            Laya.stage.addChild(enemy);
        }
    };
    Main.prototype.onLoop = function () {
        //遍历所有飞机，更改飞机状态
        for (var i = Laya.stage.numChildren - 1; i > -1; i--) {
            var role = Laya.stage.getChildAt(i);
            if (role && role.speed) {
                //根据飞机速度更改位置
                role.y += role.speed;
                //如果敌人移动到显示区域以外，则移除
                if (role.y > 1000 || !role.visible || (role.y < -20 && role.isBullet)) {
                    //从舞台移除
                    role.removeSelf();
                    //回收之前，重置属性信息
                    role.isBullet = false;
                    role.visible = true;
                    //回收到对象池
                    Laya.Pool.recover("role", role);
                }
            }
        }
        //检测碰撞，原理：获取角色对象，一一对比之间的位置，判断是否击中
        for (var i = Laya.stage.numChildren - 1; i > 0; i--) {
            //获取角色对象1
            var role1 = Laya.stage.getChildAt(i);
            //如果角色已经死亡，则忽略
            if (role1.hp < 1)
                continue;
            for (var j = i - 1; j > 0; j--) {
                //如果角色已经死亡，则忽略
                if (!role1.visible)
                    continue;
                //获取角色对象2
                var role2 = Laya.stage.getChildAt(j);
                //如果角色未死亡，并且阵营不同，才进行碰撞
                if (role1.camp != role2.camp && role2.hp > 0) {
                    //计算碰撞区域
                    var hitRadius = role1.hitRadius + role2.hitRadius;
                    //根据距离判断是否碰撞
                    if (Math.abs(role1.x - role2.x) < hitRadius && Math.abs(role1.y - role2.y) < hitRadius) {
                        //碰撞后掉血
                        this.lostHp(role1, 1);
                        this.lostHp(role2, 1);
                        this.score++;
                        if (this.score > this.levelUpScore) {
                            this.level++;
                            this.levelUpScore += this.level * 5;
                        }
                    }
                }
            }
        }
        //如果主角死亡，则停止游戏循环
        if (this.hero.hp < 1) {
            Laya.timer.clear(this, this.onLoop);
            Laya.SoundManager.playSound("res/sound/game_over.mp3");
        }
        //每间隔60帧创建新的敌机
        if (Laya.timer.currFrame % 120 === 0) {
            this.creatEnemy(2);
        }
        if (Laya.timer.currFrame % 5 === 0) {
            for (var i = Laya.stage.numChildren - 1; i > -1; i--) {
                var role = Laya.stage.getChildAt(i);
                //处理发射子弹逻辑
                if (role.shootType > 0) {
                    //获取当前时间
                    var time = Laya.Browser.now();
                    //如果当前时间大于下次射击时间
                    if (time > role.shootTime) {
                        //更新下次射击时间
                        role.shootTime = time + role.shootInterval;
                        for (var j = 0; j < this.hero.shootType; j++) {
                            //从对象池里面创建一个子弹
                            var bullet = Laya.Pool.getItemByClass("role", Role);
                            //初始化子弹信息
                            bullet.init(RoleType.bullet1);
                            var rolePlusX = (2 * j - this.hero.shootType + 1) * 15;
                            //设置子弹发射初始化位置
                            bullet.pos(role.x + rolePlusX, role.y - role.hitRadius - 10);
                            //添加到舞台上
                            Laya.stage.addChild(bullet);
                        }
                        Laya.SoundManager.playSound("res/sound/bullet.mp3");
                    }
                }
            }
        }
    };
    Main.prototype.lostHp = function (role, lostHp) {
        //减血
        role.hp -= lostHp;
        if (role.hp > 0) {
            //如果未死亡，则播放受击动画
            role.playAction("hit");
        }
        else if (role.type === "ufo1") {
            this.bulletLevel++;
            this.hero.shootInterval = Math.min(Math.floor(this.bulletLevel / 2) + 1, 4);
            this.hero.shootInterval = 500 - 20 * (this.bulletLevel > 20 ? 20 : this.bulletLevel);
            role.visible = false;
        }
        else if (role.type === "ufo2") {
            role.visible = false;
            this.hero.hp++;
        }
        else {
            Laya.SoundManager.playSound("res/sound/" + role.type + "_down.mp3");
            //如果死亡，则播放爆炸动画
            if (role.isBullet) {
                //如果是子弹，则直接隐藏，下次回收
                role.visible = false;
            }
            else {
                if (role.type === "enemy3") {
                    var ufo = Laya.Pool.getItemByClass("role", Role);
                    var r = Math.random();
                    var ufoType = r < 0.7 ? 5 : 6;
                    ufo.init(RoleType.ufo1);
                    ufo.pos(role.x, role.y);
                    Laya.stage.addChild(ufo);
                }
                role.playAction("down");
            }
        }
    };
    return Main;
}());
new Main();
//# sourceMappingURL=LayaSample.js.map