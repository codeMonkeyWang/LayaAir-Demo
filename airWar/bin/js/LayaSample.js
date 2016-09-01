/**
 * @class 程序的入口
 *
 */
var Main = (function () {
    /**
     * 构造函数
     */
    function Main() {
        this.score = 0;
        this.levelUpScore = 10;
        this.bulletLevel = 0;
        this.TEXTURE_PATH = "res/atlas/war.json";
        this.DATA_PATH = "res/airWar_Data.json";
        Laya.init(480, 852);
        //设置显示所有内容
        Laya.stage.scaleMode = "showall";
        // 设置剧中对齐
        Laya.stage.alignH = "center";
        // //设置横竖屏
        Laya.stage.screenMode = "vertical";
        //显示FPS
        Laya.Stat.show(0, 50);
        //提前加载需要的资源，并在加载完成后回调游戏初始化的函数
        var assets = [];
        assets.push({ url: this.DATA_PATH, type: Laya.Loader.JSON });
        assets.push({ url: this.TEXTURE_PATH, type: Laya.Loader.ATLAS });
        Laya.loader.load(assets, Laya.Handler.create(this, this.onLoaded));
    }
    /**
     * 加载完成需要的资源，进行初始化的函数
     */
    Main.prototype.onLoaded = function () {
        var bg = new BackGround();
        Laya.stage.addChild(bg);
        this.hero = new Role();
        this.hero.init(RoleType.hero);
        this.hero.pos(240, 700);
        Laya.stage.addChild(this.hero);
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        //定时销毁
        Laya.timer.frameLoop(1, this, this.onLoop);
    };
    /**
     * 处理鼠标（手指）移动的方法
     */
    Main.prototype.onMouseMove = function () {
        this.hero.pos(Laya.stage.mouseX, Laya.stage.mouseY);
    };
    /**
     * 每帧被调用的函数
     */
    Main.prototype.onLoop = function () {
        this.roleMove();
        this.collisionDetection();
        //如果主角死亡，则停止游戏循环
        if (this.hero.hp < 1) {
            Laya.timer.clear(this, this.onLoop);
            Laya.SoundManager.playSound("res/sound/game_over.mp3");
        }
        //关卡越高，创建敌机间隔越短
        var cutTime = Main.level < 30 ? Main.level * 2 : 60;
        //关卡越高，敌机数量越多
        var numUp = Math.floor(Main.level / 10);
        //生成小飞机
        if (Laya.timer.currFrame % (80 - cutTime) === 0) {
            this.creatEnemy(RoleType.enemy1, 2 + numUp);
        }
        //生成中型飞机
        if (Laya.timer.currFrame % (150 - cutTime * 2) === 0) {
            this.creatEnemy(RoleType.enemy2, 1 + numUp);
        }
        //生成boss
        if (Laya.timer.currFrame % (900 - cutTime * 4) === 0) {
            this.creatEnemy(RoleType.enemy3, 1);
            //播放boss出场声音
            Laya.SoundManager.playSound("res/sound/enemy3_out.mp3");
        }
        if (Laya.timer.currFrame % 5 === 0) {
            this.oneShoot(this.hero);
        }
    };
    /**
     * 角色移动的函数
     */
    Main.prototype.roleMove = function () {
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
    };
    /**
     * 碰撞检测
     */
    Main.prototype.collisionDetection = function () {
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
                            Main.level++;
                            this.levelUpScore += Main.level * 5;
                        }
                    }
                }
            }
        }
    };
    /**
     * 发射子弹all
     */
    Main.prototype.allShoot = function () {
        for (var i = Laya.stage.numChildren - 1; i > -1; i--) {
            var role = Laya.stage.getChildAt(i);
            //处理发射子弹逻辑
            if (role.shootType > 0) {
                this.oneShoot(role);
            }
        }
    };
    /**
     * 发射子弹hero
     */
    Main.prototype.oneShoot = function (role) {
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
    };
    /**
     * 用来生成敌人的方法
     */
    Main.prototype.creatEnemy = function (type, num) {
        for (var i = 0; i < num; i++) {
            //创建敌人
            var enemy = Laya.Pool.getItemByClass("role", Role);
            enemy.init(type);
            //随机位置
            enemy.pos(Math.random() * 400 + 40, -Math.random() * 200);
            //添加到舞台上
            Laya.stage.addChild(enemy);
        }
    };
    /**
     * 用来处理掉血的方法
     */
    Main.prototype.lostHp = function (role, lostHp) {
        //减血
        role.hp -= lostHp;
        if (role.type === "ufo1") {
            //子弹升级
            this.bulletLevel++;
            this.hero.shootType = Math.min(Math.floor(this.bulletLevel / 2) + 1, 4);
            this.hero.shootInterval = 500 - 20 * (this.bulletLevel > 20 ? 20 : this.bulletLevel);
            role.visible = false;
        }
        else if (role.type === "ufo2") {
            //血量增加
            role.visible = false;
            this.hero.hp++;
        }
        else if (role.hp > 0) {
            if (!role.isBullet) {
                role.playAction("hit");
            }
        }
        else {
            //如果死亡，则播放爆炸动画
            if (role.isBullet) {
                //如果是子弹，则直接隐藏，下次回收
                role.visible = false;
            }
            else {
                if (role.type != "hero") {
                    Laya.SoundManager.playSound("res/sound/" + role.type + "_down.mp3");
                }
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
    Main.level = 0;
    return Main;
}());
new Main();
//# sourceMappingURL=LayaSample.js.map