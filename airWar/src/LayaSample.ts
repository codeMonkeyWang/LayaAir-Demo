/**
 * @class 程序的入口
 */
class GameMain{
    private hero:Role;

    private TEXTURE_PATH :string = "res/atlas/war.json";
    private DATA_PATH:string = "res/airWar.json"

    constructor()
    {
        Laya.init(480,852);
        var bg:BackGround = new BackGround();
        Laya.stage.addChild(bg);
        
        var assets: Array<any> = [];
        assets.push({ url: this.DATA_PATH, type: Laya.Loader.JSON });
        assets.push({ url: this.TEXTURE_PATH, type: Laya.Loader.ATLAS });

        Laya.loader.load(assets,Laya.Handler.create(this,this.onLoaded))
    }

    onLoaded(){
       this.hero= new Role();
       this.hero.init(0);
        this.hero.pos(240,700);
        Laya.stage.addChild(this.hero);

        Laya.stage.on("mousemove",this,this.onMouseMove)
       this.creatEnemy(10);
    }

    onMouseMove(){
        this.hero.pos(Laya.stage.mouseX,Laya.stage.mouseY);
    }

    creatEnemy(num:number){
        for (var i: number = 0; i < num; i++) {
            //随机出现敌人
            var r: number = Math.random();
  
            //根据随机数，随机敌人   
            var type: number;

            if (r<0.7) {
                type = 1;
            }else if(r<0.95){
                type = 2;
            }else{
                type =3;
            }
  
            //创建敌人
            var enemy: Role = Laya.Pool.getItemByClass("role",Role);
            enemy.init(type)

            //随机位置
            enemy.pos(Math.random() * 400 + 40, Math.random() * 200);
            //添加到舞台上
            Laya.stage.addChild(enemy);
        }

    }
}
new GameMain();