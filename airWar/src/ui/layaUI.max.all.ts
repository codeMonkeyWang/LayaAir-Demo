
import View=laya.ui.View;
import Dialog=laya.ui.Dialog;
module ui {
    export class MainUI extends View {
		public pauseBtn:Laya.Button;
		public hpLabel:Laya.Label;
		public levelLabel:Laya.Label;
		public scoreLabel:Laya.Label;
		public infoLabel:Laya.Label;

        public static  uiView:any ={"type":"View","props":{"width":480,"text":"Level:100            this.body.stop();             this.visible = false","height":852},"child":[{"type":"Button","props":{"y":22,"x":400,"var":"pauseBtn","stateNum":"1","skin":"war/btn_pause.png"}},{"type":"Label","props":{"y":19,"x":17,"var":"hpLabel","text":"HP:100","fontSize":20,"color":"#ffffff"}},{"type":"Label","props":{"y":19,"x":99,"var":"levelLabel","text":"Level:100","fontSize":20,"color":"#ffffff"}},{"type":"Label","props":{"y":19,"x":201,"var":"scoreLabel","text":"Score:1000","fontSize":20,"color":"#ffffff"}},{"type":"Label","props":{"y":521,"x":68,"width":350,"var":"infoLabel","text":"战斗结束","height":204,"fontSize":30,"color":"#ffffff","align":"center"}}]};
        constructor(){ super()}
        createChildren():void {
        
            super.createChildren();
            this.createView(ui.MainUI.uiView);
        }
    }
}
