

/**
 * @class 程序的入口
 * 
 */
class Main{
    private hero:Role;
    static  level :number = 0;
    private score: number = 0;
    private levelUpScore : number = 10;
    private bulletLevel:number = 0;

    private TEXTURE_PATH :string = "res/atlas/war.json";
    private DATA_PATH:string = "res/airWar_Data.json"

    /**
     * 构造函数
     */
    constructor()
    {
        Laya.init(480,852);

        //设置显示所有内容
        Laya.stage.scaleMode = "showall";
        // 设置剧中对齐
        Laya.stage.alignH = "center";
        // //设置横竖屏
        Laya.stage.screenMode = "vertical";
        //显示FPS
        Laya.Stat.show(0, 50);

        //提前加载需要的资源，并在加载完成后回调游戏初始化的函数
        var assets: Array<any> = [];
        assets.push({ url: this.DATA_PATH, type: Laya.Loader.JSON });
        assets.push({ url: this.TEXTURE_PATH, type: Laya.Loader.ATLAS });
        Laya.loader.load(assets,Laya.Handler.create(this,this.onLoaded))
 }



    /**
     * 加载完成需要的资源，进行初始化的函数
     */
    onLoaded(){

        var bg:BackGround = new BackGround();
        Laya.stage.addChild(bg);

        this.hero= new Role();
        this.hero.init(RoleType.hero);
        this.hero.pos(240,700);
        Laya.stage.addChild(this.hero);

        Laya.stage.on(Laya.Event.MOUSE_MOVE,this,this.onMouseMove)
       //定时销毁
       Laya.timer.frameLoop(1,this,this.onLoop)
    }

    /**
     * 处理鼠标（手指）移动的方法
     */
    onMouseMove(){
        this.hero.pos(Laya.stage.mouseX,Laya.stage.mouseY);
    }


    /**
     * 每帧被调用的函数
     */
    onLoop():void{

        this.roleMove();
        this.collisionDetection()

        //如果主角死亡，则停止游戏循环
        if (this.hero.hp < 1) {
            Laya.timer.clear(this, this.onLoop);
            Laya.SoundManager.playSound("res/sound/game_over.mp3");
        }

        //关卡越高，创建敌机间隔越短
        var cutTime: number = Main.level < 30 ? Main.level * 2 : 60;
        //关卡越高，敌机数量越多
        var numUp: number = Math.floor(Main.level / 10);

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

        if (Laya.timer.currFrame %5 === 0) {
            this.oneShoot(this.hero)
        }
    }


    /**
     * 角色移动的函数
     */
    roleMove():void{
        //遍历所有飞机，更改飞机状态
        for (var i: number = Laya.stage.numChildren - 1; i > -1; i--) {
            var role: Role = Laya.stage.getChildAt(i) as Role;
            if (role && role.speed) {
                //根据飞机速度更改位置
                role.y += role.speed;

                //如果敌人移动到显示区域以外，则移除
                if (role.y > 1000 || !role.visible || ( role.y < -20 && role.isBullet)) {
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
    }

    /**
     * 碰撞检测
     */
    collisionDetection():void{
        //检测碰撞，原理：获取角色对象，一一对比之间的位置，判断是否击中
        for (var i: number = Laya.stage.numChildren - 1; i > 0; i--) {
            //获取角色对象1
            var role1: Role = Laya.stage.getChildAt(i) as Role;
            //如果角色已经死亡，则忽略
            if (role1.hp < 1) continue;
            for (var j: number = i-1; j > 0; j--) {
                //如果角色已经死亡，则忽略
                if ( !role1.visible ) continue;
                //获取角色对象2
                var role2: Role = Laya.stage.getChildAt(j) as Role;

                //如果角色未死亡，并且阵营不同，才进行碰撞
                if ( role1.camp != role2.camp && role2.hp>0) {
                    //计算碰撞区域
                    var hitRadius: number = role1.hitRadius + role2.hitRadius;
                    //根据距离判断是否碰撞
                    if (Math.abs(role1.x - role2.x) < hitRadius && Math.abs(role1.y - role2.y) < hitRadius) {
                        //碰撞后掉血
                        this.lostHp(role1, 1);
                        this.lostHp(role2, 1);
                        this.score++;
                        if(this.score >this.levelUpScore){
                            Main.level++;
                            this.levelUpScore += Main.level*5;
                        }
                    }
                }
            }
        }
    }

    /**
     * 发射子弹all
     */
    allShoot(){
        for (var i: number = Laya.stage.numChildren - 1; i > -1; i--) {
            var role: Role = Laya.stage.getChildAt(i) as Role;
            //处理发射子弹逻辑
            if (role.shootType > 0) {
                this.oneShoot(role);
            }
        }
    }

    /**
     * 发射子弹hero
     */
    oneShoot(role:Role){
        //获取当前时间
        var time: number = Laya.Browser.now();
        //如果当前时间大于下次射击时间
        if (time > role.shootTime) {
            //更新下次射击时间
            role.shootTime = time + role.shootInterval;
            for (var j = 0; j <this.hero.shootType; j++) {
                //从对象池里面创建一个子弹
                var bullet: Role = Laya.Pool.getItemByClass("role", Role);
                //初始化子弹信息
                bullet.init(RoleType.bullet1);

                var rolePlusX: number = (2*j-this.hero.shootType+1)*15
                //设置子弹发射初始化位置
                bullet.pos(role.x+rolePlusX, role.y - role.hitRadius - 10);
                //添加到舞台上
                Laya.stage.addChild(bullet);     
            }
            Laya.SoundManager.playSound("res/sound/bullet.mp3");
        }
    }

    /**
     * 用来生成敌人的方法
     */
    creatEnemy(type:RoleType, num:number){
        for (var i: number = 0; i < num; i++) {
            //创建敌人
            var enemy: Role = Laya.Pool.getItemByClass("role",Role);
            enemy.init(type)

            //随机位置
            enemy.pos(Math.random() * 400 + 40, -Math.random() * 200);
            //添加到舞台上
            Laya.stage.addChild(enemy);
        }
    }


    /**
     * 用来处理掉血的方法
     */
    lostHp(role: Role, lostHp: number): void {
        //减血
        role.hp -= lostHp;

        
        if(role.type === "ufo1"){  
            //子弹升级
            this.bulletLevel ++;
            this.hero.shootType = Math.min(Math.floor(this.bulletLevel/2)+1,4)
            this.hero.shootInterval = 500 - 20*(this.bulletLevel>20 ? 20:this.bulletLevel);
            role.visible = false;
 
        }else if(role.type === "ufo2"){
            //血量增加
            role.visible = false;
            this.hero.hp++;
            Laya.SoundManager.playSound("/res/sound/achievement.mp3");
        }else if(role.hp >0){
            if(!role.isBullet){
                role.playAction("hit")
            }
            Laya.SoundManager.playSound("/res/sound/achievement.mp3");
        }
        else {
            //如果死亡，则播放爆炸动画
            if (role.isBullet) {
                //如果是子弹，则直接隐藏，下次回收
                role.visible = false;
            } else {
                if(role.type != "hero"){
                    Laya.SoundManager.playSound("res/sound/"+role.type+"_down.mp3")
                }
                if(role.type === "enemy3"){
                    var ufo:Role = Laya.Pool.getItemByClass("role",Role);
                    var r :number = Math.random();
                    var ufoType:number = r<0.7 ? 5:6
                    ufo.init(RoleType.ufo1)
                    ufo.pos(role.x,role.y);
                    Laya.stage.addChild(ufo);
                }
                role.playAction("down");
            }
        }
    }
}

new Main();