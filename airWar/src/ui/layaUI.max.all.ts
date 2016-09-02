
import View=laya.ui.View;
import Dialog=laya.ui.Dialog;
module ui {
    export class MainUI extends View {
		public pauseBtn:Laya.Button;

        public static  uiView:any ={"type":"View","props":{"width":480,"height":852},"child":[{"type":"Button","props":{"y":49,"x":397,"var":"pauseBtn","stateNum":"1","skin":"war/btn_pause.png"}}]};
        constructor(){ super()}
        createChildren():void {
        
            super.createChildren();
            this.createView(ui.MainUI.uiView);
        }
    }
}
