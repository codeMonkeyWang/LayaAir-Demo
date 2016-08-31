/**
 * 角色类
 */

enum RoleType{hero,enemy1,enemy2,enemy3,bullet1,ufo1,ufo2}
class Role extends Laya.Sprite {
    private roleTypeArr : Array<string> = ["hero","enemy1","enemy2","enemy3","bullet1","ufo1","ufo2"];
    private data ;
   //是否缓存了动画
    private static cached: boolean = false;
    //定义飞机的身体
    private body: Laya.Animation;
    //类型
    public type:string ;

    //阵营,0：我方，非0：敌方
    public camp: number;
    //血量
    public hp: number;
    //飞行速度
    public speed: number;
    //攻击半径
    public hitRadius: number;


    //射击类型
    public shootType: number = 0;
    //射击间隔
    public shootInterval: number = 500;
    //下次射击时间
    public shootTime: number = Laya.Browser.now() + 1000;
    //当前动作
    public action: string;
    //是否是子弹
    public isBullet:boolean = false;

    constructor() {
        super();
    }
     
    init(type:RoleType):void{    
        
        if(!this.data){
            this.data = Laya.loader.getRes("res/airWar_Data.json");
        }

        if(type === RoleType.bullet1){
            this.isBullet = true;
        }if(type === RoleType.hero){
            this.shootType =1;
        }
        
        this.type = this.roleTypeArr[type];

        //具体类型对应的Data
        var typeData = this.data[this.type];
        this.camp = typeData["camp"];
        this.hp = typeData["hp"];
        this.speed = typeData["speed"];
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

        if(!this.body){
            this.body = new Laya.Animation();
            this.body.interval
            //把机体添加到容器内
            this.addChild(this.body);
            this.body.on(Laya.Event.COMPLETE,this,this.onPlayComplete);
        }
       this.playAction("fly")

    }

    playAction(action:string):void{
        this.action = action;
        this.body.play(0,true,this.type+"_"+ action)
        var bound :Laya.Rectangle = this.body.getBounds();
        this.body.pos(-bound.width/2,-bound.height/2);

        
    }
     onPlayComplete():void {
        if(this.action === "down"){
            this.body.stop();
            this.visible = false;
        }else if(this.action === "hit"){
            this.playAction("fly")
        }
    }
}