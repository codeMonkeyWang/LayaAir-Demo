
import View=laya.ui.View;
import Dialog=laya.ui.Dialog;
module ui {
    export class GameInfoUI extends View {
		public pauseBtn:Laya.Button;
		public hpLabel:Laya.Label;
		public levelLabel:Laya.Label;
		public scoreLabel:Laya.Label;
		public infoLabel:Laya.Label;

        public static  uiView:any ={"type":"View","props":{"width":480,"height":852},"child":[{"type":"Button","props":{"y":106,"x":369,"width":106,"var":"pauseBtn","stateNum":"1","skin":"war/btn_pause_nor.png","height":73}},{"type":"Label","props":{"y":123,"x":23,"var":"hpLabel","text":"Hp:","color":"#fbfbfb"}},{"type":"Label","props":{"y":126,"x":97,"var":"levelLabel","text":"Level","color":"#ffffff"}},{"type":"Label","props":{"y":124,"x":182,"var":"scoreLabel","text":"Score:","color":"#ffffff"}},{"type":"Label","props":{"y":423,"x":72,"width":364,"var":"infoLabel","text":"test","height":188,"color":"#ffffff"}}]};
        constructor(){ super()}
        createChildren():void {
        
            super.createChildren();
            this.createView(ui.GameInfoUI.uiView);
        }
    }
}
