var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var View = laya.ui.View;
var Dialog = laya.ui.Dialog;
var ui;
(function (ui) {
    var MainUI = (function (_super) {
        __extends(MainUI, _super);
        function MainUI() {
            _super.call(this);
        }
        MainUI.prototype.createChildren = function () {
            _super.prototype.createChildren.call(this);
            this.createView(ui.MainUI.uiView);
        };
        MainUI.uiView = { "type": "View", "props": { "width": 480, "text": "Level:100            this.body.stop();             this.visible = false", "height": 852 }, "child": [{ "type": "Button", "props": { "y": 22, "x": 400, "var": "pauseBtn", "stateNum": "1", "skin": "war/btn_pause.png" } }, { "type": "Label", "props": { "y": 19, "x": 17, "var": "hpLabel", "text": "HP:100", "fontSize": 20, "color": "#ffffff" } }, { "type": "Label", "props": { "y": 19, "x": 99, "var": "levelLabel", "text": "Level:100", "fontSize": 20, "color": "#ffffff" } }, { "type": "Label", "props": { "y": 19, "x": 201, "var": "scoreLabel", "text": "Score:1000", "fontSize": 20, "color": "#ffffff" } }, { "type": "Label", "props": { "y": 521, "x": 68, "width": 350, "var": "infoLabel", "text": "战斗结束", "height": 204, "fontSize": 30, "color": "#ffffff", "align": "center" } }] };
        return MainUI;
    }(View));
    ui.MainUI = MainUI;
})(ui || (ui = {}));
//# sourceMappingURL=layaUI.max.all.js.map