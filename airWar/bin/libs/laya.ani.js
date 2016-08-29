
(function(window,document,Laya){
	var __un=Laya.un,__uns=Laya.uns,__static=Laya.static,__class=Laya.class,__getset=Laya.getset,__newvec=Laya.__newvec;

	var Browser=laya.utils.Browser,Byte=laya.utils.Byte,Event=laya.events.Event,EventDispatcher=laya.events.EventDispatcher;
	var Graphics=laya.display.Graphics,Handler=laya.utils.Handler,Loader=laya.net.Loader,MathUtil=laya.maths.MathUtil;
	var Matrix=laya.maths.Matrix,Render=laya.renders.Render,RunDriver=laya.utils.RunDriver,Sprite=laya.display.Sprite;
	var Stat=laya.utils.Stat,Texture=laya.resource.Texture,URL=laya.net.URL;
	/**
	*@private
	*/
	//class laya.ani.AnimationState
	var AnimationState=(function(){
		function AnimationState(){}
		__class(AnimationState,'laya.ani.AnimationState');
		AnimationState.stopped=0;
		AnimationState.paused=1;
		AnimationState.playing=2;
		return AnimationState;
	})()


	/**
	*...
	*@author
	*/
	//class laya.ani.bone.Bone
	var Bone=(function(){
		function Bone(){
			this.name=null;
			this._parent=null;
			this.length=10;
			this.transform=null;
			this.sprite=null;
			this._children=[];
			this.resultTransform=new Transform();
			this.resultMatrix=new Matrix();
		}

		__class(Bone,'laya.ani.bone.Bone');
		var __proto=Bone.prototype;
		__proto.update=function(pMatrix){
			var tResultMatrix;
			if (pMatrix){
				tResultMatrix=this.resultTransform.getMatrix();
				Matrix.mul(tResultMatrix,pMatrix,this.resultMatrix);
				}else {
				if (this._parent){
					tResultMatrix=this.resultTransform.getMatrix();
					Matrix.mul(tResultMatrix,this._parent.resultMatrix,this.resultMatrix);
					}else {
					tResultMatrix=this.resultTransform.getMatrix();
					tResultMatrix.copyTo(this.resultMatrix);
				}
			};
			var i=0,n=0;
			var tBone;
			for (i=0,n=this._children.length;i < n;i++){
				tBone=this._children[i];
				tBone.update();
			}
		}

		__proto.updateDraw=function(x,y){
			if (this.sprite){
				this.sprite.x=x+this.resultMatrix.tx;
				this.sprite.y=y+this.resultMatrix.ty;
				}else {
				this.sprite=new Sprite();
				this.sprite.graphics.drawCircle(0,0,5,"#ff0000");
				Laya.stage.addChild(this.sprite);
				this.sprite.x=x+this.resultMatrix.tx;
				this.sprite.y=y+this.resultMatrix.ty;
			};
			var i=0,n=0;
			var tBone;
			for (i=0,n=this._children.length;i < n;i++){
				tBone=this._children[i];
				tBone.updateDraw(x,y);
			}
		}

		__proto.addChild=function(bone){
			this._children.push(bone);
			bone._parent=this;
		}

		__proto.findBone=function(boneName){
			if (this.name==boneName){
				return this;
				}else {
				var i=0,n=0;
				var tBone;
				var tResult;
				for (i=0,n=this._children.length;i < n;i++){
					tBone=this._children[i];
					tResult=tBone.findBone(boneName);
					if (tResult){
						return tResult;
					}
				}
			}
			return null;
		}

		return Bone;
	})()


	/**
	*@private
	*/
	//class laya.ani.bone.BoneSlot
	var BoneSlot=(function(){
		function BoneSlot(){
			this.name=null;
			this.parent=null;
			this.attachmentName=null;
			this.srcDisplayIndex=-1;
			this.type="src";
			this.templet=null;
			this.currSlotData=null;
			this.currTexture=null;
			this.currDisplayData=null;
			this.displayIndex=-1;
			this._diyTexture=null;
			this._parentMatrix=null;
			this._resultMatrix=null;
		}

		__class(BoneSlot,'laya.ani.bone.BoneSlot');
		var __proto=BoneSlot.prototype;
		/**
		*设置要显示的插槽数据
		*@param slotData
		*@param disIndex
		*/
		__proto.showSlotData=function(slotData){
			this.currSlotData=slotData;
			this.displayIndex=this.srcDisplayIndex;
			this.currDisplayData=null;
			this.currTexture=null;
		}

		/**
		*通过名字显示指定对象
		*@param name
		*/
		__proto.showDisplayByName=function(name){
			this.showDisplayByIndex(this.currSlotData.getDisplayByName(name));
		}

		/**
		*指定显示对象
		*@param index
		*/
		__proto.showDisplayByIndex=function(index){
			if (this.currSlotData && index >-1 && index < this.currSlotData.displayArr.length){
				this.displayIndex=index;
				this.currDisplayData=this.currSlotData.displayArr[index];
				if (this.currDisplayData){
					var tName=this.currDisplayData.name;
					this.currTexture=this.templet.getTexture(tName);
					if (this.currTexture && Render.isWebGL && this.currDisplayData.type==0 && this.currDisplayData.uvs){
						this.currTexture=new Texture(this.currTexture.bitmap,this.currDisplayData.uvs);
					}
				}
				}else {
				this.displayIndex=-1;
				this.currDisplayData=null;
				this.currTexture=null;
			}
		}

		/**
		*替换皮肤
		*@param _texture
		*/
		__proto.replaceSkin=function(_texture){
			this._diyTexture=_texture;
		}

		/**
		*保存父矩阵的索引
		*@param parentMatrix
		*/
		__proto.setParentMatrix=function(parentMatrix){
			this._parentMatrix=parentMatrix;
		}

		/**
		*把纹理画到Graphics上
		*@param graphics
		*@param noUseSave
		*/
		__proto.draw=function(graphics,boneMatrixArray,sprite,noUseSave){
			(noUseSave===void 0)&& (noUseSave=false);
			if ((this._diyTexture==null && this.currTexture==null)|| this.currDisplayData==null){
				if (!(this.currDisplayData && this.currDisplayData.type==3)){
					return;
				}
			};
			var tTexture=this.currTexture;
			if (this._diyTexture)tTexture=this._diyTexture;
			var tSkinSprite;
			switch (this.currDisplayData.type){
				case 0:
					if (graphics){
						var tCurrentMatrix=this.getDisplayMatrix();
						if (this._parentMatrix){
							var tRotateKey=false;
							if (tCurrentMatrix){
								Matrix.mul(tCurrentMatrix,this._parentMatrix,Matrix.TEMP);
								var tResultMatrix;
								if (noUseSave){
									if (this._resultMatrix==null)this._resultMatrix=new Matrix();
									tResultMatrix=this._resultMatrix;
									}else {
									tResultMatrix=new Matrix();
								}
								if (!Render.isWebGL && this.currDisplayData.uvs){
									var tTestMatrix=new Matrix(1,0,0,1);
									if (this.currDisplayData.uvs[1] > this.currDisplayData.uvs[5]){
										tTestMatrix.d=-1;
									}
									if (this.currDisplayData.uvs[0] > this.currDisplayData.uvs[4]
										&& this.currDisplayData.uvs[1] > this.currDisplayData.uvs[5]){
										tRotateKey=true;
										tTestMatrix.rotate(-Math.PI/2);
									}
									Matrix.mul(tTestMatrix,Matrix.TEMP,tResultMatrix);
									}else {
									Matrix.TEMP.copyTo(tResultMatrix);
								}
								if (tRotateKey){
									graphics.drawTexture(tTexture,-this.currDisplayData.height / 2,-this.currDisplayData.width / 2,this.currDisplayData.height,this.currDisplayData.width,tResultMatrix);
									}else {
									graphics.drawTexture(tTexture,-this.currDisplayData.width / 2,-this.currDisplayData.height / 2,this.currDisplayData.width,this.currDisplayData.height,tResultMatrix);
								}
							}
						}
					}
					break ;
				case 1:
					tSkinSprite=RunDriver.skinAniSprite();
					if (tSkinSprite==null){
						return;
					}
					graphics.drawSkin(tSkinSprite);
					var tVBArray=[];
					var tIBArray=[];
					var tRed=1;
					var tGreed=1;
					var tBlue=1;
					var tAlpha=1;
					if (this.currDisplayData.bones==null){
						for (var i=0,ii=0;i < this.currDisplayData.weights.length && ii< this.currDisplayData.uvs.length;){
							var tX=this.currDisplayData.weights[i++];
							var tY=this.currDisplayData.weights[i++];
							tVBArray.push(tX,tY,this.currDisplayData.uvs[ii++],this.currDisplayData.uvs[ii++],tRed,tGreed,tBlue,tAlpha);
						};
						var tTriangleNum=this.currDisplayData.triangles.length / 3;
						for (i=0;i < tTriangleNum;i++){
							tIBArray.push(this.currDisplayData.triangles[i *3]);
							tIBArray.push(this.currDisplayData.triangles[i *3+1]);
							tIBArray.push(this.currDisplayData.triangles[i *3+2]);
						}
						tSkinSprite.init(this.currTexture,tVBArray,tIBArray);
						var tCurrentMatrix2=this.getDisplayMatrix();
						if (this._parentMatrix){
							if (tCurrentMatrix2){
								Matrix.mul(tCurrentMatrix2,this._parentMatrix,Matrix.TEMP);
								var tResultMatrix2;
								if (noUseSave){
									if (this._resultMatrix==null)this._resultMatrix=new Matrix();
									tResultMatrix2=this._resultMatrix;
									}else {
									tResultMatrix2=new Matrix();
								}
								Matrix.TEMP.copyTo(tResultMatrix2);
								tSkinSprite.transform=tResultMatrix2;
							}
						}
						}else {
						this.skinMesh(boneMatrixArray,tSkinSprite);
					}
					break ;
				case 2:
					tSkinSprite=RunDriver.skinAniSprite();
					if (tSkinSprite==null){
						return;
					}
					graphics.drawSkin(tSkinSprite);
					this.skinMesh(boneMatrixArray,tSkinSprite);
					break ;
				case 3:
					break ;
				}
		}

		/**
		*画路径
		*@param boneMatrixArray
		*@param graphics
		*/
		__proto.drawPath=function(boneMatrixArray,graphics){
			var tBones=this.currDisplayData.bones;
			var tWeights=this.currDisplayData.weights;
			var tTriangles=this.currDisplayData.triangles;
			var tVBArray=[];
			var tIBArray=[];
			var tRx=0;
			var tRy=0;
			var nn=0;
			var tMatrix;
			var tX=NaN;
			var tY=NaN;
			var tB=0;
			var tWeight=0;
			var tVertices=[];
			var i=0,j=0,n=0;
			var tRed=1;
			var tGreed=1;
			var tBlue=1;
			var tAlpha=1;
			for (i=0,n=tBones.length;i < n;){
				nn=tBones[i++]+i;
				tRx=0,tRy=0;
				for (;i < nn;i++){
					tMatrix=boneMatrixArray[tBones[i]]
					tX=tWeights[tB];
					tY=tWeights[tB+1];
					tWeight=tWeights[tB+2];
					tRx+=(tX *tMatrix.a+tY *tMatrix.c+tMatrix.tx)*tWeight;
					tRy+=(tX *tMatrix.b+tY *tMatrix.d+tMatrix.ty)*tWeight;
					tB+=3;
				}
				tVertices.push(tRx,tRy);
			}
			for (i=0;i < tVertices.length;){
				tRx=tVertices[i++];
				tRy=tVertices[i++];
				graphics.drawCircle(tRx,tRy,2.5,"#ff0000");
				tVBArray.push(tRx,tRy);
			};
			var tNum=10;
			var tOut=[];
			for (var i=0;i < tNum;i++){
				this.addCurvePosition(i / tNum,tVertices[0],tVertices[1],tVertices[2],tVertices[3],tVertices[4],tVertices[5],tVertices[6],tVertices[7],tOut,i *3,true);
			}
			for (i=0;i < tNum;i++){
				graphics.drawCircle(tOut[i *3],tOut[i*3+1],2.5,"#00ff00");
			}
		}

		__proto.addCurvePosition=function(p,x1,y1,cx1,cy1,cx2,cy2,x2,y2,out,o,tangents){
			if (p==0)p=0.0001;
			var tt=p *p,ttt=tt *p,u=1-p,uu=u *u,uuu=uu *u;
			var ut=u *p,ut3=ut *3,uut3=u *ut3,utt3=ut3 *p;
			var x=x1 *uuu+cx1 *uut3+cx2 *utt3+x2 *ttt,y=y1 *uuu+cy1 *uut3+cy2 *utt3+y2 *ttt;
			out[o]=x;
			out[o+1]=y;
			if (tangents)out[o+2]=Math.atan2(y-(y1 *uu+cy1 *ut *2+cy2 *tt),x-(x1 *uu+cx1 *ut *2+cx2 *tt));
		}

		/**
		*显示蒙皮动画
		*@param boneMatrixArray 当前帧的骨骼矩阵
		*/
		__proto.skinMesh=function(boneMatrixArray,skinSprite){
			var tBones=this.currDisplayData.bones;
			var tUvs=this.currDisplayData.uvs;
			var tWeights=this.currDisplayData.weights;
			var tTriangles=this.currDisplayData.triangles;
			var tVBArray=[];
			var tIBArray=[];
			var tRx=0;
			var tRy=0;
			var nn=0;
			var tMatrix;
			var tX=NaN;
			var tY=NaN;
			var tB=0;
			var tWeight=0;
			var tVertices=[];
			var i=0,j=0,n=0;
			var tRed=1;
			var tGreed=1;
			var tBlue=1;
			var tAlpha=1;
			for (i=0,n=tBones.length;i < n;){
				nn=tBones[i++]+i;
				tRx=0,tRy=0;
				for (;i < nn;i++){
					tMatrix=boneMatrixArray[tBones[i]]
					tX=tWeights[tB];
					tY=tWeights[tB+1];
					tWeight=tWeights[tB+2];
					tRx+=(tX *tMatrix.a+tY *tMatrix.c+tMatrix.tx)*tWeight;
					tRy+=(tX *tMatrix.b+tY *tMatrix.d+tMatrix.ty)*tWeight;
					tB+=3;
				}
				tVertices.push(tRx,tRy);
			}
			for (i=0,j=0;i < tVertices.length && j < tUvs.length;){
				tRx=tVertices[i++];
				tRy=tVertices[i++];
				tVBArray.push(tRx,tRy,tUvs[j++],tUvs[j++],tRed,tGreed,tBlue,tAlpha);
			}
			for (i=0,n=tTriangles.length;i < n;i++){
				tIBArray.push(tTriangles[i]);
			}
			skinSprite.init(this.currTexture,tVBArray,tIBArray);
		}

		/**
		*画骨骼的起始点，方便调试
		*@param graphics
		*/
		__proto.drawBonePoint=function(graphics){
			if (graphics && this._parentMatrix){
				graphics.drawCircle(this._parentMatrix.tx,this._parentMatrix.ty,5,"#ff0000");
			}
		}

		/**
		*得到显示对象的矩阵
		*@return
		*/
		__proto.getDisplayMatrix=function(){
			if (this.currDisplayData){
				return this.currDisplayData.transform.getMatrix();
			}
			return null;
		}

		/**
		*得到插糟的矩阵
		*@return
		*/
		__proto.getMatrix=function(){
			return this._resultMatrix;
		}

		/**
		*用原始数据拷贝出一个
		*@return
		*/
		__proto.copy=function(){
			var tBoneSlot=new BoneSlot();
			tBoneSlot.type="copy";
			tBoneSlot.name=this.name;
			tBoneSlot.attachmentName=this.attachmentName;
			tBoneSlot.srcDisplayIndex=this.srcDisplayIndex;
			tBoneSlot.parent=this.parent;
			tBoneSlot.displayIndex=this.displayIndex;
			tBoneSlot.templet=this.templet;
			tBoneSlot.currSlotData=this.currSlotData;
			tBoneSlot.currTexture=this.currTexture;
			tBoneSlot.currDisplayData=this.currDisplayData;
			return tBoneSlot;
		}

		return BoneSlot;
	})()


	/**
	*...
	*@author
	*/
	//class laya.ani.bone.IkConstraintData
	var IkConstraintData=(function(){
		function IkConstraintData(){
			this.name=null;
			this.targetBoneName=null;
			this.bendDirection=1;
			this.mix=1;
			this.targetBoneIndex=-1;
			this.boneNames=[];
			this.boneIndexs=[];
		}

		__class(IkConstraintData,'laya.ani.bone.IkConstraintData');
		return IkConstraintData;
	})()


	/**
	*@private
	*/
	//class laya.ani.bone.SkinData
	var SkinData=(function(){
		function SkinData(){
			this.name=null;
			this.slotArr=[];
		}

		__class(SkinData,'laya.ani.bone.SkinData');
		return SkinData;
	})()


	/**
	*@private
	*/
	//class laya.ani.bone.SkinSlotDisplayData
	var SkinSlotDisplayData=(function(){
		function SkinSlotDisplayData(){
			this.name=null;
			this.attachmentName=null;
			this.type=0;
			this.transform=null;
			this.width=NaN;
			this.height=NaN;
			this.bones=null;
			this.uvs=null;
			this.weights=null;
			this.triangles=null;
			this.vertices=null;
		}

		__class(SkinSlotDisplayData,'laya.ani.bone.SkinSlotDisplayData');
		return SkinSlotDisplayData;
	})()


	/**
	*@private
	*/
	//class laya.ani.bone.SlotData
	var SlotData=(function(){
		function SlotData(){
			this.name=null;
			this.displayArr=[];
		}

		__class(SlotData,'laya.ani.bone.SlotData');
		var __proto=SlotData.prototype;
		__proto.getDisplayByName=function(name){
			var tDisplay;
			for (var i=0,n=this.displayArr.length;i < n;i++){
				tDisplay=this.displayArr[i];
				if (tDisplay.attachmentName==name){
					return i;
				}
			}
			return-1;
		}

		return SlotData;
	})()


	/**
	*@private
	*/
	//class laya.ani.bone.Transform
	var Transform=(function(){
		function Transform(){
			this.skX=0;
			this.skY=0;
			this.scX=1;
			this.scY=1;
			this.x=0;
			this.y=0;
			this.mMatrix=null;
		}

		__class(Transform,'laya.ani.bone.Transform');
		var __proto=Transform.prototype;
		__proto.initData=function(data){
			if (data.x !=undefined){
				this.x=data.x;
			}
			if (data.y !=undefined){
				this.y=data.y;
			}
			if (data.skX !=undefined){
				this.skX=data.skX;
			}
			if (data.skY !=undefined){
				this.skY=data.skY;
			}
			if (data.scX !=undefined){
				this.scX=data.scX;
			}
			if (data.scY !=undefined){
				this.scY=data.scY;
			}
		}

		__proto.getMatrix=function(){
			var tMatrix;
			if (this.mMatrix){
				tMatrix=this.mMatrix;
				}else {
				tMatrix=this.mMatrix=new Matrix();
			}
			tMatrix.a=Math.cos(this.skY);
			if (this.skX !=0 || this.skY !=0){
				var tAngle=this.skX *Math.PI / 180;
				var cos=Math.cos(tAngle),sin=Math.sin(tAngle);
				tMatrix.setTo(this.scX *cos,this.scX *sin,this.scY *-sin,this.scY *cos,this.x,this.y);
				}else {
				tMatrix.setTo(this.scX,this.skX,this.skY,this.scY,this.x,this.y);
			}
			return tMatrix;
		}

		return Transform;
	})()


	/**
	*<code>AnimationPlayer</code> 类用于动画播放器。
	*/
	//class laya.ani.AnimationPlayer extends laya.events.EventDispatcher
	var AnimationPlayer=(function(_super){
		function AnimationPlayer(cacheFrameRate){
			this._templet=null;
			this._currentTime=NaN;
			this._currentFrameTime=NaN;
			this._playStart=NaN;
			this._playEnd=NaN;
			this._playDuration=NaN;
			this._overallDuration=NaN;
			this._stopWhenCircleFinish=false;
			this._elapsedPlaybackTime=NaN;
			this._startPlayLoopCount=NaN;
			this._currentAnimationClipIndex=0;
			this._currentKeyframeIndex=0;
			this._paused=false;
			this._cacheFrameRate=0;
			this._cacheFrameRateInterval=NaN;
			this.playbackRate=1.0;
			this.isCache=true;
			this.returnToZeroStopped=true;
			AnimationPlayer.__super.call(this);
			(cacheFrameRate===void 0)&& (cacheFrameRate=60);
			this._currentAnimationClipIndex=-1;
			this._currentKeyframeIndex=-1;
			this._currentTime=0.0;
			this._overallDuration=Number.MAX_VALUE;
			this._stopWhenCircleFinish=false;
			this._elapsedPlaybackTime=0;
			this._startPlayLoopCount=-1;
			this._cacheFrameRate=cacheFrameRate;
			this._cacheFrameRateInterval=1000 / this._cacheFrameRate;
		}

		__class(AnimationPlayer,'laya.ani.AnimationPlayer',_super);
		var __proto=AnimationPlayer.prototype;
		/**
		*@private
		*/
		__proto._calculatePlayDuration=function(){
			if (this.state!==/*laya.ani.AnimationState.stopped*/0){
				var oriDuration=this._templet.getAniDuration(this._currentAnimationClipIndex);
				(this._playEnd===0)&& (this._playEnd=oriDuration);
				if (Math.floor(this._playEnd)> oriDuration)
					throw new Error("AnimationPlayer:playEnd must less than original Duration.");
				this._playDuration=this._playEnd-this._playStart;
			}
		}

		/**
		*播放动画。
		*@param index 动画索引。
		*@param playbackRate 播放速率。
		*@param duration 播放时长（0为1次,Number.MAX_VALUE为循环播放）。
		*@param playStart 播放的起始时间位置。
		*@param playEnd 播放的结束时间位置。（0为动画一次循环的最长结束时间位置）。
		*/
		__proto.play=function(index,playbackRate,overallDuration,playStart,playEnd){
			(index===void 0)&& (index=0);
			(playbackRate===void 0)&& (playbackRate=1.0);
			(overallDuration===void 0)&& (overallDuration=Number.MAX_VALUE);
			(playStart===void 0)&& (playStart=0);
			(playEnd===void 0)&& (playEnd=0);
			if (!this._templet)
				throw new Error("AnimationPlayer:templet must not be null,maybe you need to set url.");
			if (overallDuration < 0 || playStart < 0 || playEnd < 0)
				throw new Error("AnimationPlayer:overallDuration,playStart and playEnd must large than zero.");
			if ((playEnd!==0)&&(playStart > playEnd))
				throw new Error("AnimationPlayer:start must less than end.");
			this._currentTime=0;
			this._currentFrameTime=0;
			this._elapsedPlaybackTime=0;
			this.playbackRate=playbackRate;
			this._overallDuration=overallDuration;
			this._playStart=playStart;
			this._playEnd=playEnd;
			this._paused=false;
			this._currentAnimationClipIndex=index;
			this._currentKeyframeIndex=0;
			this._startPlayLoopCount=Stat.loopCount;
			this.event(/*laya.events.Event.PLAYED*/"played");
			if (this._templet.loaded)
				this._calculatePlayDuration();
			else
			this._templet.once(/*laya.events.Event.LOADED*/"loaded",this,this._calculatePlayDuration);
		}

		/**
		*播放动画。
		*@param index 动画索引。
		*@param playbackRate 播放速率。
		*@param duration 播放时长（0为1次,Number.MAX_VALUE为循环播放）。
		*@param playStartFrame 播放的原始起始帧率位置。
		*@param playEndFrame 播放的原始结束帧率位置。（0为动画一次循环的最长结束时间位置）。
		*/
		__proto.playByFrame=function(index,playbackRate,overallDuration,playStartFrame,playEndFrame,fpsIn3DBuilder){
			(index===void 0)&& (index=0);
			(playbackRate===void 0)&& (playbackRate=1.0);
			(overallDuration===void 0)&& (overallDuration=Number.MAX_VALUE);
			(playStartFrame===void 0)&& (playStartFrame=0);
			(playEndFrame===void 0)&& (playEndFrame=0);
			(fpsIn3DBuilder===void 0)&& (fpsIn3DBuilder=30);
			var interval=1000.0 / fpsIn3DBuilder;
			this.play(index,playbackRate,overallDuration,playStartFrame *interval,playEndFrame *interval);
		}

		/**
		*停止播放当前动画
		*@param immediate 是否立即停止
		*/
		__proto.stop=function(immediate){
			(immediate===void 0)&& (immediate=true);
			if (immediate){
				this._currentAnimationClipIndex=this._currentKeyframeIndex=-1;
				this.event(/*laya.events.Event.STOPPED*/"stopped");
				}else {
				this._stopWhenCircleFinish=true;
			}
		}

		/**更新动画播放器 */
		__proto.update=function(elapsedTime){
			if (this._currentAnimationClipIndex===-1 || this._paused || !this._templet || !this._templet.loaded)
				return;
			var time=0;
			(this._startPlayLoopCount!==Stat.loopCount)&& (time=elapsedTime *this.playbackRate,this._elapsedPlaybackTime+=time);
			var currentAniClipPlayDuration=this.playDuration;
			if ((this._overallDuration!==0 && this._elapsedPlaybackTime >=this._overallDuration)|| (this._overallDuration===0 && this._elapsedPlaybackTime >=currentAniClipPlayDuration)){
				this._currentAnimationClipIndex=this._currentKeyframeIndex=-1;
				this.event(/*laya.events.Event.STOPPED*/"stopped");
				return;
			}
			time+=this._currentTime;
			if (currentAniClipPlayDuration > 0){
				while (time >=currentAniClipPlayDuration){
					if (this._stopWhenCircleFinish){
						this._currentAnimationClipIndex=this._currentKeyframeIndex=-1;
						this._stopWhenCircleFinish=false;
						this.event(/*laya.events.Event.STOPPED*/"stopped");
						return;
					}
					time-=currentAniClipPlayDuration;
				}
				this._currentTime=time;
				this._currentKeyframeIndex=Math.floor((this.currentPlayTime)/ this._cacheFrameRateInterval);
				this._currentFrameTime=this._currentKeyframeIndex *this._cacheFrameRateInterval;
				}else {
				if (this._stopWhenCircleFinish){
					this._currentAnimationClipIndex=this._currentKeyframeIndex=-1;
					this._stopWhenCircleFinish=false;
					this.event(/*laya.events.Event.STOPPED*/"stopped");
					return;
				}
				this._currentTime=this._currentFrameTime=this._currentKeyframeIndex=0;
			}
		}

		/**
		*获取当前动画索引
		*@return value 当前动画索引
		*/
		__getset(0,__proto,'currentAnimationClipIndex',function(){
			return this._currentAnimationClipIndex;
		});

		/**
		*设置动画数据模板
		*@param value 动画数据模板
		*/
		/**
		*获取动画数据模板
		*@param value 动画数据模板
		*/
		__getset(0,__proto,'templet',function(){
			return this._templet;
			},function(value){
			if (!this.state===/*laya.ani.AnimationState.stopped*/0)
				this.stop(true);
			this._templet=value;
		});

		/**
		*获取当前精确时间，不包括重播时间
		*@return value 当前时间
		*/
		__getset(0,__proto,'currentPlayTime',function(){
			return this._currentTime+this._playStart;
		});

		/**
		*动画播放的起始时间位置。
		*@return 起始时间位置。
		*/
		__getset(0,__proto,'playStart',function(){
			return this._playStart;
		});

		/**
		*动画播放的结束时间位置。
		*@return 结束时间位置。
		*/
		__getset(0,__proto,'playEnd',function(){
			return this._playEnd;
		});

		/**
		*获取当前帧数
		*@return 当前帧数
		*/
		__getset(0,__proto,'currentKeyframeIndex',function(){
			return this._currentKeyframeIndex;
		});

		/**
		*获取动画播放一次的总时间
		*@return 动画播放一次的总时间
		*/
		__getset(0,__proto,'playDuration',function(){
			return this._playDuration;
		});

		/**
		*获取缓存帧率*
		*@return value 缓存帧率
		*/
		__getset(0,__proto,'cacheFrameRate',function(){
			return this._cacheFrameRate;
		});

		/**
		*获取当前帧时间，不包括重播时间
		*@return value 当前时间
		*/
		__getset(0,__proto,'currentFrameTime',function(){
			return this._currentFrameTime;
		});

		/**
		*设置当前播放位置
		*@param value 当前时间
		*/
		__getset(0,__proto,'currentTime',null,function(value){
			if (this._currentAnimationClipIndex===-1 || !this._templet || !this._templet.loaded)
				return;
			if (value < this._playStart || value > this._playEnd)
				throw new Error("AnimationPlayer:value must large than playStartTime,small than playEndTime.");
			this._currentTime=value;
			this._currentKeyframeIndex=Math.floor(this.currentPlayTime / this._cacheFrameRateInterval);
			this._currentFrameTime=this._currentKeyframeIndex *this._cacheFrameRateInterval;
		});

		/**
		*获取动画播放的总总时间
		*@return 动画播放的总时间
		*/
		__getset(0,__proto,'overallDuration',function(){
			return this._overallDuration;
		});

		/**
		*设置是否暂停
		*@param value 是否暂停
		*/
		/**
		*获取当前是否暂停
		*@return 是否暂停
		*/
		__getset(0,__proto,'paused',function(){
			return this._paused;
			},function(value){
			this._paused=value;
			value && this.event(/*laya.events.Event.PAUSED*/"paused");
		});

		/**
		*获取缓存帧率间隔时间
		*@return 缓存帧率间隔时间
		*/
		__getset(0,__proto,'cacheFrameRateInterval',function(){
			return this._cacheFrameRateInterval;
		});

		/**
		*获取当前播放状态
		*@return 当前播放状态
		*/
		__getset(0,__proto,'state',function(){
			if (this._currentAnimationClipIndex===-1)
				return /*laya.ani.AnimationState.stopped*/0;
			if (this._paused)
				return /*laya.ani.AnimationState.paused*/1;
			return /*laya.ani.AnimationState.playing*/2;
		});

		return AnimationPlayer;
	})(EventDispatcher)


	/**
	*@private
	*/
	//class laya.ani.KeyframesAniTemplet extends laya.events.EventDispatcher
	var KeyframesAniTemplet=(function(_super){
		function KeyframesAniTemplet(){
			this._aniMap={};
			//this._publicExtData=null;
			//this._useParent=false;
			//this.unfixedCurrentFrameIndexes=null;
			//this.unfixedCurrentTimes=null;
			//this.unfixedKeyframes=null;
			this.unfixedLastAniIndex=-1;
			this._loaded=false;
			//this._aniVersion=null;
			this._animationDatasCache=[];
			KeyframesAniTemplet.__super.call(this);
			this._anis=new Array;
		}

		__class(KeyframesAniTemplet,'laya.ani.KeyframesAniTemplet',_super);
		var __proto=KeyframesAniTemplet.prototype;
		__proto.parse=function(data,playbackRate){
			var i=0,j=0,k=0,n=0,l=0;
			var read=new Byte(data);
			this._aniVersion=read.readUTFString();
			var aniClassName=read.readUTFString();
			var strList=read.readUTFString().split("\n");
			var aniCount=read.getUint8();
			var publicDataPos=read.getUint32();
			var publicExtDataPos=read.getUint32();
			var publicData;
			if (publicDataPos > 0)
				publicData=data.slice(publicDataPos,publicExtDataPos);
			var publicRead=new Byte(publicData);
			if (publicExtDataPos > 0)
				this._publicExtData=data.slice(publicExtDataPos,data.byteLength);
			this._useParent=!!read.getUint8();
			this._anis.length=aniCount;
			for (i=0;i < aniCount;i++){
				var ani=this._anis[i]=
				{};
				ani.nodes=new Array;
				var name=ani.name=strList[read.getUint16()];
				this._aniMap[name]=i;
				ani.bone3DMap={};
				ani.playTime=read.getFloat32();
				var boneCount=ani.nodes.length=read.getUint8();
				ani.totalKeyframesLength=0;
				for (j=0;j < boneCount;j++){
					var node=ani.nodes[j]=
					{};
					node.childs=[];
					var nameIndex=read.getInt16();
					if (nameIndex >=0){
						node.name=strList[nameIndex];
						ani.bone3DMap[node.name]=j;
					}
					node.keyFrame=new Array;
					node.parentIndex=read.getInt16();
					node.parentIndex==-1 ? node.parent=null :node.parent=ani.nodes[node.parentIndex];
					var isLerp=!!read.getUint8();
					var keyframeParamsOffset=read.getUint32();
					publicRead.pos=keyframeParamsOffset;
					var keyframeDataCount=node.keyframeWidth=publicRead.getUint16();
					ani.totalKeyframesLength+=keyframeDataCount;
					if (isLerp){
						node.interpolationMethod=[];
						node.interpolationMethod.length=keyframeDataCount;
						for (k=0;k < keyframeDataCount;k++)
						node.interpolationMethod[k]=KeyframesAniTemplet.interpolation[publicRead.getUint8()];
					}
					if (node.parent !=null)
						node.parent.childs.push(node);
					var privateDataLen=read.getUint16();
					if (privateDataLen > 0){
						node.extenData=data.slice(read.pos,read.pos+privateDataLen);
						read.pos+=privateDataLen;
					};
					var keyframeCount=read.getUint16();
					node.keyFrame.length=keyframeCount;
					var startTime=0;
					for (k=0,n=keyframeCount;k < n;k++){
						var keyFrame=node.keyFrame[k]=
						{};
						keyFrame.duration=read.getFloat32();
						keyFrame.startTime=startTime;
						keyFrame.data=new Float32Array(keyframeDataCount);
						keyFrame.dData=new Float32Array(keyframeDataCount);
						keyFrame.nextData=new Float32Array(keyframeDataCount);
						for (l=0;l < keyframeDataCount;l++){
							keyFrame.data[l]=read.getFloat32();
							if (keyFrame.data[l] >-0.00000001 && keyFrame.data[l] < 0.00000001)keyFrame.data[l]=0;
						}
						startTime+=keyFrame.duration;
					}
					node.playTime=ani.playTime;
					this._calculateKeyFrame(node,keyframeCount,keyframeDataCount);
					this._calculateKeyFrameIndex(node,playbackRate);
				}
			}
			this._loaded=true;
			this.event(/*laya.events.Event.LOADED*/"loaded",this);
		}

		__proto._calculateKeyFrame=function(node,keyframeCount,keyframeDataCount){
			var keyFrames=node.keyFrame;
			keyFrames[keyframeCount]=keyFrames[0];
			for (var i=0;i < keyframeCount;i++){
				var keyFrame=keyFrames[i];
				for (var j=0;j < keyframeDataCount;j++){
					keyFrame.dData[j]=(keyFrame.duration===0)? 0 :(keyFrames[i+1].data[j]-keyFrame.data[j])/ keyFrame.duration;
					keyFrame.nextData[j]=keyFrames[i+1].data[j];
				}
			}
			keyFrames.length--;
		}

		__proto._calculateKeyFrameIndex=function(node,playbackRate){
			var frameInterval=1000 / playbackRate;
			node.frameCount=Math.floor(node.playTime / frameInterval);
			node.fullFrame=new Uint16Array(node.frameCount+1);
			var lastFrameIndex=-1;
			for (var i=0,n=node.keyFrame.length;i < n;i++){
				var keyFrame=node.keyFrame[i];
				var tm=keyFrame.startTime;
				var endTm=tm+keyFrame.duration+frameInterval;
				do {
					var frameIndex=Math.floor(tm / frameInterval+0.5);
					for (var k=lastFrameIndex+1;k < frameIndex;k++)
					node.fullFrame[k]=i;
					lastFrameIndex=frameIndex;
					node.fullFrame[frameIndex]=i;
					tm+=frameInterval;
				}while (tm <=endTm);
			}
		}

		__proto.getAnimationCount=function(){
			return this._anis.length;
		}

		__proto.getAnimation=function(aniIndex){
			return this._anis[aniIndex];
		}

		__proto.getAniDuration=function(aniIndex){
			return this._anis[aniIndex].playTime;
		}

		__proto.getNodes=function(aniIndex){
			return this._anis[aniIndex].nodes;
		}

		__proto.getNodeIndexWithName=function(aniIndex,name){
			return this._anis[aniIndex].bone3DMap[name];
		}

		__proto.getNodeCount=function(aniIndex){
			return this._anis[aniIndex].nodes.length;
		}

		__proto.getTotalkeyframesLength=function(aniIndex){
			return this._anis[aniIndex].totalKeyframesLength;
		}

		__proto.getPublicExtData=function(){
			return this._publicExtData;
		}

		__proto.getAnimationDataWithCache=function(cacheDatas,aniIndex,frameIndex){
			var cache=cacheDatas[aniIndex];
			return cache ? cache[frameIndex] :null;
		}

		__proto.setAnimationDataWithCache=function(cacheDatas,aniIndex,frameIndex,data){
			var cache=cacheDatas[aniIndex];
			cache || (cache=cacheDatas[aniIndex]=[]);
			cache[frameIndex]=data;
		}

		__proto.getOriginalData=function(aniIndex,originalData,frameIndex,playCurTime){
			var oneAni=this._anis[aniIndex];
			var nodes=oneAni.nodes;
			var j=0;
			for (var i=0,n=nodes.length,outOfs=0;i < n;i++){
				var node=nodes[i];
				var key;
				key=node.keyFrame[node.fullFrame[frameIndex]];
				node.dataOffset=outOfs;
				var dt=playCurTime-key.startTime;
				for (j=0;j < node.keyframeWidth;){
					j+=node.interpolationMethod[j](node,j,originalData,outOfs+j,key.data,dt,key.dData,key.duration,key.nextData);
				}
				outOfs+=node.keyframeWidth;
			}
		}

		__proto.getNodesCurrentFrameIndex=function(aniIndex,playCurTime){
			var ani=this._anis[aniIndex];
			var nodes=ani.nodes;
			if (aniIndex!==this.unfixedLastAniIndex){
				this.unfixedCurrentFrameIndexes=new Uint32Array(nodes.length);
				this.unfixedCurrentTimes=new Float32Array(nodes.length);
				this.unfixedLastAniIndex=aniIndex;
			}
			for (var i=0,n=nodes.length,outOfs=0;i < n;i++){
				var node=nodes[i];
				if (playCurTime < this.unfixedCurrentTimes[i])
					this.unfixedCurrentFrameIndexes[i]=0;
				this.unfixedCurrentTimes[i]=playCurTime;
				while ((this.unfixedCurrentFrameIndexes[i] < node.keyFrame.length)){
					if (node.keyFrame[this.unfixedCurrentFrameIndexes[i]].startTime > this.unfixedCurrentTimes[i])
						break ;
					this.unfixedCurrentFrameIndexes[i]++;
				}
				this.unfixedCurrentFrameIndexes[i]--;
			}
			return this.unfixedCurrentFrameIndexes;
		}

		__proto.getOriginalDataUnfixedRate=function(aniIndex,originalData,playCurTime){
			var oneAni=this._anis[aniIndex];
			var nodes=oneAni.nodes;
			if (aniIndex!==this.unfixedLastAniIndex){
				this.unfixedCurrentFrameIndexes=new Uint32Array(nodes.length);
				this.unfixedCurrentTimes=new Float32Array(nodes.length);
				this.unfixedKeyframes=__newvec(nodes.length);
				this.unfixedLastAniIndex=aniIndex;
			};
			var j=0;
			for (var i=0,n=nodes.length,outOfs=0;i < n;i++){
				var node=nodes[i];
				if (playCurTime < this.unfixedCurrentTimes[i])
					this.unfixedCurrentFrameIndexes[i]=0;
				this.unfixedCurrentTimes[i]=playCurTime;
				while (this.unfixedCurrentFrameIndexes[i] < node.keyFrame.length){
					if (node.keyFrame[this.unfixedCurrentFrameIndexes[i]].startTime > this.unfixedCurrentTimes[i])
						break ;
					this.unfixedKeyframes[i]=node.keyFrame[this.unfixedCurrentFrameIndexes[i]];
					this.unfixedCurrentFrameIndexes[i]++;
				};
				var key=this.unfixedKeyframes[i];
				node.dataOffset=outOfs;
				var dt=playCurTime-key.startTime;
				for (j=0;j < node.keyframeWidth;){
					j+=node.interpolationMethod[j](node,j,originalData,outOfs+j,key.data,dt,key.dData,key.duration,key.nextData);
				}
				outOfs+=node.keyframeWidth;
			}
		}

		__getset(0,__proto,'loaded',function(){
			return this._loaded;
		});

		KeyframesAniTemplet._LinearInterpolation_0=function(bone,index,out,outOfs,data,dt,dData,duration,nextData){
			out[outOfs]=data[index]+dt *dData[index];
			return 1;
		}

		KeyframesAniTemplet._QuaternionInterpolation_1=function(bone,index,out,outOfs,data,dt,dData,duration,nextData){
			var amount=duration===0 ? 0 :dt / duration;
			MathUtil.slerpQuaternionArray(data,index,nextData,index,amount,out,outOfs);
			return 4;
		}

		KeyframesAniTemplet._AngleInterpolation_2=function(bone,index,out,outOfs,data,dt,dData,duration,nextData){
			return 0;
		}

		KeyframesAniTemplet._RadiansInterpolation_3=function(bone,index,out,outOfs,data,dt,dData,duration,nextData){
			return 0;
		}

		KeyframesAniTemplet._Matrix4x4Interpolation_4=function(bone,index,out,outOfs,data,dt,dData,duration,nextData){
			for (var i=0;i < 16;i++,index++)
			out[outOfs+i]=data[index]+dt *dData[index];
			return 16;
		}

		KeyframesAniTemplet._NoInterpolation_5=function(bone,index,out,outOfs,data,dt,dData,duration,nextData){
			out[outOfs]=data[index];
			return 1;
		}

		KeyframesAniTemplet._uniqueIDCounter=1;
		KeyframesAniTemplet.interpolation=[KeyframesAniTemplet._LinearInterpolation_0,KeyframesAniTemplet._QuaternionInterpolation_1,KeyframesAniTemplet._AngleInterpolation_2,KeyframesAniTemplet._RadiansInterpolation_3,KeyframesAniTemplet._Matrix4x4Interpolation_4,KeyframesAniTemplet._NoInterpolation_5];
		KeyframesAniTemplet.LAYA_ANIMATION_VISION="LAYAANIMATION:1.0.2";
		return KeyframesAniTemplet;
	})(EventDispatcher)


	/**
	*...
	*@author
	*/
	//class laya.ani.GraphicsAni extends laya.display.Graphics
	var GraphicsAni=(function(_super){
		function GraphicsAni(){
			GraphicsAni.__super.call(this);
		}

		__class(GraphicsAni,'laya.ani.GraphicsAni',_super);
		var __proto=GraphicsAni.prototype;
		/**
		*@private
		*画自定义蒙皮动画
		*@param skin
		*/
		__proto.drawSkin=function(skin){
			var arr=[skin];
			this._saveToCmd(Render._context._drawSkin,arr);
		}

		return GraphicsAni;
	})(Graphics)


	/**
	*动画模板类
	*/
	//class laya.ani.bone.Templet extends laya.ani.KeyframesAniTemplet
	var Templet=(function(_super){
		function Templet(){
			this._mainTexture=null;
			this._textureJson=null;
			this._graphicsCache=[];
			this.srcBoneMatrixArr=[];
			this.ikArr=[];
			this.boneSlotDic={};
			this.bindBoneBoneSlotDic={};
			this.boneSlotArray=[];
			this.skinDataArray=[];
			this.skinDic={};
			this.subTextureDic={};
			this.isParseFail=false;
			this.url=null;
			this.yReverseMatrix=null;
			this._rate=60;
			this.aniSectionDic={};
			this.textureDic={};
			this._skBufferUrl=null;
			this._textureDic={};
			this._loadList=null;
			this._path=null;
			this.mRootBone=null;
			Templet.__super.call(this);
			this.mBoneArr=[];
		}

		__class(Templet,'laya.ani.bone.Templet',_super);
		var __proto=Templet.prototype;
		__proto.loadAni=function(url){
			this._skBufferUrl=url;
			Laya.loader.load(url,Handler.create(this,this.onComplete),null,/*laya.net.Loader.BUFFER*/"arraybuffer");
		}

		__proto.onComplete=function(){
			var tSkBuffer=Loader.getRes(this._skBufferUrl);
			this._path=this._skBufferUrl.slice(0,this._skBufferUrl.lastIndexOf("/"))+"/";
			this.parseData(null,tSkBuffer);
		}

		/**
		*解析骨骼动画数据
		*@param texture 骨骼动画用到的纹理
		*@param skeletonData 骨骼动画信息及纹理分块信息
		*@param playbackRate 缓冲的帧率数据（会根据帧率去分帧）
		*/
		__proto.parseData=function(texture,skeletonData,playbackRate){
			(playbackRate===void 0)&& (playbackRate=60);
			this._mainTexture=texture;
			this._rate=playbackRate;
			this.parse(skeletonData,playbackRate);
		}

		/**
		*创建动画
		*0,使用模板缓冲的数据，模板缓冲的数据，不允许修改 （内存开销小，计算开销小，不支持换装）
		*1,使用动画自己的缓冲区，每个动画都会有自己的缓冲区，相当耗费内存 （内存开销大，计算开销小，支持换装）
		*2,使用动态方式，去实时去画 （内存开销小，计算开销大，支持换装,不建议使用）
		*@param aniMode 0 动画模式，0:不支持换装,1,2支持换装
		*@return
		*/
		__proto.buildArmature=function(aniMode){
			(aniMode===void 0)&& (aniMode=0);
			return new Skeleton(this,aniMode);
		}

		/**
		*@private
		*解析动画
		*@param data 解析的二进制数据
		*@param playbackRate 帧率
		*/
		__proto.parse=function(data,playbackRate){
			_super.prototype.parse.call(this,data,playbackRate);
			if (this._aniVersion !=KeyframesAniTemplet.LAYA_ANIMATION_VISION){
				console.log("[Error] 版本不一致，请使用IDE版本（1.2.0）重新导出");
				this._loaded=false;
			}
			if (this._loaded){
				if (this._mainTexture){
					this._parsePublicExtData();
					}else {
					this._parseTexturePath();
				}
				}else {
				this.event(/*laya.events.Event.ERROR*/"error",this);
				this.isParseFail=true;
			}
		}

		__proto._parseTexturePath=function(){
			var i=0;
			this._loadList=[];
			var tByte=new Byte(this.getPublicExtData());
			var tX=0,tY=0,tWidth=0,tHeight=0;
			var tFrameX=0,tFrameY=0,tFrameWidth=0,tFrameHeight=0;
			var tTempleData=0;
			var tTextureLen=tByte.getUint8();
			var tTextureName=tByte.readUTFString();
			var tTextureNameArr=tTextureName.split("\n");
			var tTexture;
			var tSrcTexturePath;
			for (i=0;i < tTextureLen;i++){
				tSrcTexturePath=this._path+tTextureNameArr[i *2];
				tTextureName=tTextureNameArr[i *2+1];
				tX=tByte.getFloat32();
				tY=tByte.getFloat32();
				tWidth=tByte.getFloat32();
				tHeight=tByte.getFloat32();
				tTempleData=tByte.getFloat32();
				tFrameX=isNaN(tTempleData)? 0 :tTempleData;
				tTempleData=tByte.getFloat32();
				tFrameY=isNaN(tTempleData)? 0 :tTempleData;
				tTempleData=tByte.getFloat32();
				tFrameWidth=isNaN(tTempleData)? tWidth :tTempleData;
				tTempleData=tByte.getFloat32();
				tFrameHeight=isNaN(tTempleData)? tHeight :tTempleData;
				if (this._loadList.indexOf(tSrcTexturePath)==-1){
					this._loadList.push(tSrcTexturePath);
				}
			}
			Laya.loader.load(this._loadList,Handler.create(this,this._textureComplete));
		}

		/**
		*纹理加载完成
		*/
		__proto._textureComplete=function(){
			var tTexture;
			var tTextureName;
			for (var i=0,n=this._loadList.length;i < n;i++){
				tTextureName=this._loadList[i];
				tTexture=this._textureDic[tTextureName]=Loader.getRes(tTextureName);
			}
			this._parsePublicExtData();
		}

		/**
		*解析自定义数据
		*/
		__proto._parsePublicExtData=function(){
			var i=0,j=0,k=0,l=0,n=0;
			for (i=0,n=this.getAnimationCount();i < n;i++){
				this._graphicsCache.push([]);
			};
			var tByte=new Byte(this.getPublicExtData());
			var tX=0,tY=0,tWidth=0,tHeight=0;
			var tFrameX=0,tFrameY=0,tFrameWidth=0,tFrameHeight=0;
			var tTempleData=0;
			var tTextureLen=tByte.getUint8();
			var tTextureName=tByte.readUTFString();
			var tTextureNameArr=tTextureName.split("\n");
			var tTexture;
			var tSrcTexturePath;
			for (i=0;i < tTextureLen;i++){
				tTexture=this._mainTexture;
				tSrcTexturePath=this._path+tTextureNameArr[i *2];
				tTextureName=tTextureNameArr[i *2+1];
				if (this._mainTexture==null){
					tTexture=this._textureDic[tSrcTexturePath];
				}
				tX=tByte.getFloat32();
				tY=tByte.getFloat32();
				tWidth=tByte.getFloat32();
				tHeight=tByte.getFloat32();
				tTempleData=tByte.getFloat32();
				tFrameX=isNaN(tTempleData)? 0 :tTempleData;
				tTempleData=tByte.getFloat32();
				tFrameY=isNaN(tTempleData)? 0 :tTempleData;
				tTempleData=tByte.getFloat32();
				tFrameWidth=isNaN(tTempleData)? tWidth :tTempleData;
				tTempleData=tByte.getFloat32();
				tFrameHeight=isNaN(tTempleData)? tHeight :tTempleData;
				this.subTextureDic[tTextureName]=Texture.create(tTexture,tX,tY,tWidth,tHeight,-tFrameX,-tFrameY,tFrameWidth,tFrameHeight);
			};
			var tAniCount=tByte.getUint16();
			var tSectionArr;
			for (i=0;i < tAniCount;i++){
				tSectionArr=[];
				tSectionArr.push(tByte.getUint16());
				tSectionArr.push(tByte.getUint16());
				tSectionArr.push(tByte.getUint16());
				this.aniSectionDic[i]=tSectionArr;
			};
			var tBone;
			var tParentBone;
			var tName;
			var tParentName;
			var tBoneLen=tByte.getInt16();
			var tBoneDic={};
			for (i=0;i < tBoneLen;i++){
				tBone=new Bone();
				tName=tByte.readUTFString();
				tParentName=tByte.readUTFString();
				tBone.length=tByte.getFloat32();
				tBone.name=tName;
				if (tParentName){
					tParentBone=tBoneDic[tParentName];
					if (tParentBone){
						tParentBone.addChild(tBone);
						}else {
						this.mRootBone=tBone;
					}
				}
				tBoneDic[tName]=tBone;
				this.mBoneArr.push(tBone);
			};
			var tMatrixDataLen=tByte.getUint16();
			var tLen=tByte.getUint16();
			var parentIndex=0;
			var boneLength=Math.floor(tLen / tMatrixDataLen);
			var tResultTransform;
			var tMatrixArray=this.srcBoneMatrixArr;
			for (i=0;i < boneLength;i++){
				tResultTransform=new Transform();
				tResultTransform.scX=tByte.getFloat32();
				tResultTransform.skX=tByte.getFloat32();
				tResultTransform.skY=tByte.getFloat32();
				tResultTransform.scY=tByte.getFloat32();
				tResultTransform.x=tByte.getFloat32();
				tResultTransform.y=tByte.getFloat32();
				tMatrixArray.push(tResultTransform);
				tBone=this.mBoneArr[i];
				tBone.transform=tResultTransform;
			};
			var tIkConstraintData;
			var tIkLen=tByte.getUint16();
			var tIkBoneLen=0;
			for (i=0;i < tIkLen;i++){
				tIkConstraintData=new IkConstraintData();
				tIkBoneLen=tByte.getUint16();
				for (j=0;j < tIkBoneLen;j++){
					tIkConstraintData.boneNames.push(tByte.readUTFString());
					tIkConstraintData.boneIndexs.push(tByte.getInt16());
				}
				tIkConstraintData.name=tByte.readUTFString();
				tIkConstraintData.targetBoneName=tByte.readUTFString();
				tIkConstraintData.targetBoneIndex=tByte.getInt16();
				tIkConstraintData.bendDirection=tByte.getFloat32();
				tIkConstraintData.mix=tByte.getFloat32();
				this.ikArr.push(tIkConstraintData);
			};
			var tBoneSlotLen=tByte.getInt16();
			var tDBBoneSlot;
			var tDBBoneSlotArr;
			for (i=0;i < tBoneSlotLen;i++){
				tDBBoneSlot=new BoneSlot();
				tDBBoneSlot.name=tByte.readUTFString();
				tDBBoneSlot.parent=tByte.readUTFString();
				tDBBoneSlot.attachmentName=tByte.readUTFString();
				tDBBoneSlot.srcDisplayIndex=tDBBoneSlot.displayIndex=tByte.getInt16();
				tDBBoneSlot.templet=this;
				this.boneSlotDic[tDBBoneSlot.name]=tDBBoneSlot;
				tDBBoneSlotArr=this.bindBoneBoneSlotDic[tDBBoneSlot.parent];
				if (tDBBoneSlotArr==null){
					this.bindBoneBoneSlotDic[tDBBoneSlot.parent]=tDBBoneSlotArr=[];
				}
				tDBBoneSlotArr.push(tDBBoneSlot);
				this.boneSlotArray.push(tDBBoneSlot);
			};
			var tNameString=tByte.readUTFString();
			var tNameArray=tNameString.split("\n");
			var tNameStartIndex=0;
			var tSkinDataLen=tByte.getUint8();
			var tSkinData,tSlotData,tDisplayData;
			var tSlotDataLen=0,tDisplayDataLen=0;
			var tUvLen=0,tWeightLen=0,tTriangleLen=0,tVerticeLen=0;
			for (i=0;i < tSkinDataLen;i++){
				tSkinData=new SkinData();
				tSkinData.name=tNameArray[tNameStartIndex++];
				tSlotDataLen=tByte.getUint8();
				for (j=0;j < tSlotDataLen;j++){
					tSlotData=new SlotData();
					tSlotData.name=tNameArray[tNameStartIndex++];
					tDBBoneSlot=this.boneSlotDic[tSlotData.name];
					tDisplayDataLen=tByte.getUint8();
					for (k=0;k < tDisplayDataLen;k++){
						tDisplayData=new SkinSlotDisplayData();
						tDisplayData.name=tNameArray[tNameStartIndex++];
						tDisplayData.attachmentName=tNameArray[tNameStartIndex++];
						tDisplayData.transform=new Transform();
						tDisplayData.transform.scX=tByte.getFloat32();
						tDisplayData.transform.skX=tByte.getFloat32();
						tDisplayData.transform.skY=tByte.getFloat32();
						tDisplayData.transform.scY=tByte.getFloat32();
						tDisplayData.transform.x=tByte.getFloat32();
						tDisplayData.transform.y=tByte.getFloat32();
						tSlotData.displayArr.push(tDisplayData);
						tDisplayData.width=tByte.getFloat32();
						tDisplayData.height=tByte.getFloat32();
						tDisplayData.type=tByte.getUint8();
						tBoneLen=tByte.getUint16();
						if (tBoneLen > 0){
							tDisplayData.bones=[];
							for (l=0;l < tBoneLen;l++){
								var tBoneId=tByte.getUint16();
								tDisplayData.bones.push(tBoneId);
							}
						}
						tUvLen=tByte.getUint16();
						if (tUvLen > 0){
							tDisplayData.uvs=[];
							for (l=0;l < tUvLen;l++){
								tDisplayData.uvs.push(tByte.getFloat32());
							}
						}
						tWeightLen=tByte.getUint16();
						if (tWeightLen > 0){
							tDisplayData.weights=[];
							for (l=0;l < tWeightLen;l++){
								tDisplayData.weights.push(tByte.getFloat32());
							}
						}
						tTriangleLen=tByte.getUint16();
						if (tTriangleLen > 0){
							tDisplayData.triangles=[];
							for (l=0;l < tTriangleLen;l++){
								tDisplayData.triangles.push(tByte.getUint16());
							}
						}
						tVerticeLen=tByte.getUint16();
						if (tVerticeLen > 0){
							tDisplayData.vertices=[];
							for (l=0;l < tVerticeLen;l++){
								tDisplayData.vertices.push(tByte.getFloat32());
							}
						}
					}
					tSkinData.slotArr.push(tSlotData);
				}
				this.skinDic[tSkinData.name]=tSkinData;
				this.skinDataArray.push(tSkinData);
			};
			var tReverse=tByte.getUint8();
			if (tReverse==1){
				this.yReverseMatrix=new Matrix(1,0,0,-1,0,0);
			}
			this.showSkinByIndex(this.boneSlotDic,0);
			this.event(/*laya.events.Event.COMPLETE*/"complete",this);
		}

		/**
		*得到指定的纹理
		*@param name 纹理的名字
		*@return
		*/
		__proto.getTexture=function(name){
			return this.subTextureDic[name];
		}

		/**
		*@private
		*显示指定的皮肤
		*@param boneSlotDic 插糟字典的引用
		*@param skinIndex 皮肤的索引
		*/
		__proto.showSkinByIndex=function(boneSlotDic,skinIndex){
			if (skinIndex < 0 && skinIndex >=this.skinDataArray.length)return;
			var i=0,n=0;
			var tBoneSlot;
			var tSlotData;
			var tSkinData=this.skinDataArray[skinIndex];
			if (tSkinData){
				for (i=0,n=tSkinData.slotArr.length;i < n;i++){
					tSlotData=tSkinData.slotArr[i];
					if (tSlotData){
						tBoneSlot=boneSlotDic[tSlotData.name];
						if (tBoneSlot){
							tBoneSlot.showSlotData(tSlotData);
							if (tBoneSlot.attachmentName !="null"){
								tBoneSlot.showDisplayByName(tBoneSlot.attachmentName);
								}else {
								tBoneSlot.showDisplayByIndex(tBoneSlot.displayIndex);
							}
						}
					}
				}
			}
		}

		/**
		*通过皮肤名字得到皮肤索引
		*@param skinName 皮肤名称
		*@return
		*/
		__proto.getSkinIndexByName=function(skinName){
			var tSkinData;
			for (var i=0,n=this.skinDataArray.length;i < n;i++){
				tSkinData=this.skinDataArray[i];
				if (tSkinData.name==skinName){
					return i;
				}
			}
			return-1;
		}

		/**
		*@private
		*得到缓冲数据
		*@param aniIndex 动画索引
		*@param frameIndex 帧索引
		*@return
		*/
		__proto.getGrahicsDataWithCache=function(aniIndex,frameIndex){
			return this._graphicsCache[aniIndex][frameIndex];
		}

		/**
		*@private
		*保存缓冲grahpics
		*@param aniIndex 动画索引
		*@param frameIndex 帧索引
		*@param graphics 要保存的数据
		*/
		__proto.setGrahicsDataWithCache=function(aniIndex,frameIndex,graphics){
			this._graphicsCache[aniIndex][frameIndex]=graphics;
		}

		/**
		*预留
		*/
		__proto.destroy=function(){
			if (this.url){
				delete Templet.TEMPLET_DICTIONARY[this.url];
			}
		}

		/**
		*通过索引得动画名称
		*@param index
		*@return
		*/
		__proto.getAniNameByIndex=function(index){
			var tAni=this.getAnimation(index);
			if (tAni)return tAni.name;
			return null;
		}

		__getset(0,__proto,'rate',function(){
			return this._rate;
		});

		Templet.TEMPLET_DICTIONARY=null
		return Templet;
	})(KeyframesAniTemplet)


	/**
	*骨骼动画由Templet,AnimationPlayer,Skeleton三部分组成
	*/
	//class laya.ani.bone.Skeleton extends laya.display.Sprite
	var Skeleton=(function(_super){
		function Skeleton(templet,aniMode){
			this._templet=null;
			this._player=null;
			this._curOriginalData=null;
			this._boneMatrixArray=[];
			this._lastTime=0;
			this._currAniName=null;
			this._currAniIndex=-1;
			this._pause=true;
			this._aniClipIndex=-1;
			this._clipIndex=-1;
			this._skinIndex=0;
			this._aniMode=0;
			this._graphicsCache=null;
			this._boneSlotDic=null;
			this._bindBoneBoneSlotDic=null;
			this._boneSlotArray=null;
			this._index=-1;
			this._total=-1;
			this._indexControl=false;
			this._aniPath=null;
			this._texturePath=null;
			this._complete=null;
			this._loadAniMode=0;
			this._yReverseMatrix=null;
			this._ikArr=null;
			this._rootBone=null;
			this._boneList=null;
			this._aniSectionDic=null;
			Skeleton.__super.call(this);
			(aniMode===void 0)&& (aniMode=0);
			if (templet)this.init(templet,aniMode);
		}

		__class(Skeleton,'laya.ani.bone.Skeleton',_super);
		var __proto=Skeleton.prototype;
		/**
		*初始化动画
		*0,使用模板缓冲的数据，模板缓冲的数据，不允许修改 （内存开销小，计算开销小，不支持换装）
		*1,使用动画自己的缓冲区，每个动画都会有自己的缓冲区，相当耗费内存 （内存开销大，计算开销小，支持换装）
		*2,使用动态方式，去实时去画 （内存开销小，计算开销大，支持换装,不建议使用）
		*@param templet 模板
		*@param aniMode 动画模式，0:不支持换装,1,2支持换装
		*/
		__proto.init=function(templet,aniMode){
			(aniMode===void 0)&& (aniMode=0);
			if (aniMode==1){
				this._graphicsCache=[];
				for (var i=0,n=templet.getAnimationCount();i < n;i++){
					this._graphicsCache.push([]);
				}
			}
			this._yReverseMatrix=templet.yReverseMatrix;
			this._aniMode=aniMode;
			this._templet=templet;
			this._player=new AnimationPlayer(templet.rate);
			this._player.templet=templet;
			this._player.play();
			this._parseSrcBoneMatrix();
			this._ikArr=templet.ikArr;
			this._boneList=templet.mBoneArr;
			this._rootBone=templet.mRootBone;
			this._aniSectionDic=templet.aniSectionDic;
			this._player.on(/*laya.events.Event.PLAYED*/"played",this,this._onPlay);
			this._player.on(/*laya.events.Event.STOPPED*/"stopped",this,this._onStop);
			this._player.on(/*laya.events.Event.PAUSED*/"paused",this,this._onPause);
		}

		/**
		*通过加载直接创建动画
		*@param path 要加载的动画文件路径
		*@param complete 加载完成的回调函数
		*@param aniMode 0,使用模板缓冲的数据，模板缓冲的数据，不允许修改（内存开销小，计算开销小，不支持换装） 1,使用动画自己的缓冲区，每个动画都会有自己的缓冲区，相当耗费内存 （内存开销大，计算开销小，支持换装）2,使用动态方式，去实时去画（内存开销小，计算开销大，支持换装,不建议使用）
		*/
		__proto.load=function(path,complete,aniMode){
			(aniMode===void 0)&& (aniMode=0);
			this._aniPath=path;
			this._complete=complete;
			this._loadAniMode=aniMode;
			this._texturePath=path.replace(".sk",".png").replace(".bin",".png");
			Laya.loader.load([{url:path,type:/*laya.net.Loader.BUFFER*/"arraybuffer"},{url:this._texturePath,type:/*laya.net.Loader.IMAGE*/"image"}],Handler.create(this,this._onLoaded));
		}

		/**
		*加载完成
		*/
		__proto._onLoaded=function(){
			var tTexture=Loader.getRes(this._texturePath);
			var arraybuffer=Loader.getRes(this._aniPath);
			if (tTexture==null || arraybuffer==null)return;
			if (Templet.TEMPLET_DICTIONARY==null){
				Templet.TEMPLET_DICTIONARY={};
			};
			var tFactory;
			tFactory=Templet.TEMPLET_DICTIONARY[this._aniPath];
			if (tFactory){
				tFactory.isParseFail ? this._parseFail():this._parseComplete();
				}else {
				tFactory=new Templet();
				tFactory.url=this._aniPath;
				Templet.TEMPLET_DICTIONARY[this._aniPath]=tFactory;
				tFactory.on(/*laya.events.Event.COMPLETE*/"complete",this,this._parseComplete);
				tFactory.on(/*laya.events.Event.ERROR*/"error",this,this._parseFail);
				tFactory.parseData(tTexture,arraybuffer,60);
			}
		}

		/**
		*解析完成
		*/
		__proto._parseComplete=function(){
			var tTemple=Templet.TEMPLET_DICTIONARY[this._aniPath];
			if (tTemple){
				this.init(tTemple,this._loadAniMode);
				this.play(0,true);
			}
			this._complete && this._complete.runWith(this);
		}

		/**
		*解析失败
		*/
		__proto._parseFail=function(){
			console.log("[Error]:"+this._aniPath+"解析失败");
		}

		/**
		*传递PLAY事件
		*/
		__proto._onPlay=function(){
			this.event(/*laya.events.Event.PLAYED*/"played");
		}

		/**
		*传递STOP事件
		*/
		__proto._onStop=function(){
			this.event(/*laya.events.Event.STOPPED*/"stopped");
		}

		/**
		*传递PAUSE事件
		*/
		__proto._onPause=function(){
			this.event(/*laya.events.Event.PAUSED*/"paused");
		}

		/**
		*创建骨骼的矩阵，保存每次计算的最终结果
		*/
		__proto._parseSrcBoneMatrix=function(){
			var i=0,n=0;
			n=this._templet.srcBoneMatrixArr.length;
			for (i=0;i < n;i++){
				this._boneMatrixArray.push(new Matrix());
			}
			if (this._aniMode==0){
				this._boneSlotDic=this._templet.boneSlotDic;
				this._bindBoneBoneSlotDic=this._templet.bindBoneBoneSlotDic;
				this._boneSlotArray=this._templet.boneSlotArray;
				}else {
				if (this._boneSlotDic==null)this._boneSlotDic={};
				if (this._bindBoneBoneSlotDic==null)this._bindBoneBoneSlotDic={};
				if (this._boneSlotArray==null)this._boneSlotArray=[];
				var tArr=this._templet.boneSlotArray;
				var tBS;
				var tBSArr;
				for (i=0,n=tArr.length;i < n;i++){
					tBS=tArr[i];
					tBSArr=this._bindBoneBoneSlotDic[tBS.parent];
					if (tBSArr==null){
						this._bindBoneBoneSlotDic[tBS.parent]=tBSArr=[];
					}
					this._boneSlotDic[tBS.name]=tBS=tBS.copy();
					tBSArr.push(tBS);
					this._boneSlotArray.push(tBS);
				}
			}
		}

		/**
		*更新动画
		*@param autoKey true为正常更新，false为index手动更新
		*/
		__proto._update=function(autoKey){
			(autoKey===void 0)&& (autoKey=true);
			if (this._pause)return;
			if (autoKey && this._indexControl){
				return;
			};
			var tCurrTime=Laya.timer.currTimer;
			if (autoKey){
				this._player.update(tCurrTime-this._lastTime)
			}
			this._lastTime=tCurrTime;
			this._aniClipIndex=this._player.currentAnimationClipIndex;
			this._clipIndex=this._player.currentKeyframeIndex;
			if (this._aniClipIndex==-1)return;
			var tGraphics;
			if (this._aniMode==0){
				tGraphics=this._templet.getGrahicsDataWithCache(this._aniClipIndex,this._clipIndex);
				if (tGraphics){
					this.graphics=tGraphics;
					return;
				}
				}else if (this._aniMode==1){
				tGraphics=this._getGrahicsDataWithCache(this._aniClipIndex,this._clipIndex);
				if (tGraphics){
					this.graphics=tGraphics;
					return;
				}
			}
			this._createGraphics();
		}

		/**
		*创建grahics图像
		*/
		__proto._createGraphics=function(){
			var bones=this._templet.getNodes(this._aniClipIndex);
			this._templet.getOriginalData(this._aniClipIndex,this._curOriginalData,this._clipIndex,this._player.currentFrameTime);
			var tSectionArr=this._aniSectionDic[this._aniClipIndex];
			var tParentMatrix;
			var tResultMatrix;
			var tStartIndex=0;
			var i=0,j=0,k=0,n=0;
			var tDBBoneSlot;
			var tDBBoneSlotArr;
			var tParentTransform;
			var tSrcBone;
			var boneCount=this._templet.srcBoneMatrixArr.length;
			for (i=0,n=tSectionArr[0];i < boneCount;i++){
				tSrcBone=this._boneList[i];
				tResultMatrix=this._boneMatrixArray[i];
				tParentTransform=this._templet.srcBoneMatrixArr[i];
				tSrcBone.resultTransform.scX=tParentTransform.scX *this._curOriginalData[tStartIndex++];
				tSrcBone.resultTransform.skX=tParentTransform.skX+this._curOriginalData[tStartIndex++];
				tSrcBone.resultTransform.skY=tParentTransform.skY+this._curOriginalData[tStartIndex++];
				tSrcBone.resultTransform.scY=tParentTransform.scY *this._curOriginalData[tStartIndex++];
				tSrcBone.resultTransform.x=tParentTransform.x+this._curOriginalData[tStartIndex++];
				tSrcBone.resultTransform.y=tParentTransform.y+this._curOriginalData[tStartIndex++];
			};
			var tSlotDic={};
			var tSlotAlphaDic={};
			var tBoneData;
			for (n+=tSectionArr[1];i < n;i++){
				tBoneData=bones[i];
				tSlotDic[tBoneData.name]=this._curOriginalData[tStartIndex++];
				tSlotAlphaDic[tBoneData.name]=this._curOriginalData[tStartIndex++];
				this._curOriginalData[tStartIndex++];
				this._curOriginalData[tStartIndex++];
				this._curOriginalData[tStartIndex++];
				this._curOriginalData[tStartIndex++];
			};
			var tBendDirectionDic={};
			var tMixDic={};
			for (n+=tSectionArr[2];i < n;i++){
				tBoneData=bones[i];
				tBendDirectionDic[tBoneData.name]=this._curOriginalData[tStartIndex++];
				tMixDic[tBoneData.name]=this._curOriginalData[tStartIndex++];
				this._curOriginalData[tStartIndex++];
				this._curOriginalData[tStartIndex++];
				this._curOriginalData[tStartIndex++];
			}
			if (this._yReverseMatrix){
				this._rootBone.update(this._yReverseMatrix);
				}else {
				this._rootBone.update(Matrix.TEMP.identity());
			};
			var tIkConstraintData;
			var tTargetBone;
			var tParentBone;
			var tChildBone;
			for (i=0,n=this._ikArr.length;i < n;i++){
				tIkConstraintData=this._ikArr[i];
				tTargetBone=this._boneList[tIkConstraintData.targetBoneIndex];
				switch(tIkConstraintData.boneIndexs.length){
					case 1:
						tChildBone=this._boneList[tIkConstraintData.boneIndexs[0]];
						this._applyIk1(tChildBone,tTargetBone.resultMatrix.tx,tTargetBone.resultMatrix.ty,tIkConstraintData.mix);
						break ;
					case 2:
						tParentBone=this._boneList[tIkConstraintData.boneIndexs[0]];
						tChildBone=this._boneList[tIkConstraintData.boneIndexs[1]];
						if (tBendDirectionDic[tIkConstraintData.name]){
							this._applyIk2(tParentBone,tChildBone,tTargetBone.resultMatrix.tx,tTargetBone.resultMatrix.ty,tBendDirectionDic[tIkConstraintData.name],tMixDic[tIkConstraintData.name]);
							}else {
							this._applyIk2(tParentBone,tChildBone,tTargetBone.resultMatrix.tx,tTargetBone.resultMatrix.ty,tIkConstraintData.bendDirection,tIkConstraintData.mix);
						}
						break ;
					}
			}
			for (i=0,k=this._boneList.length;i < k;i++){
				tSrcBone=this._boneList[i];
				tDBBoneSlotArr=this._bindBoneBoneSlotDic[tSrcBone.name];
				tSrcBone.resultMatrix.copyTo(this._boneMatrixArray[i]);
				if (tDBBoneSlotArr){
					for (j=0,n=tDBBoneSlotArr.length;j < n;j++){
						tDBBoneSlot=tDBBoneSlotArr[j];
						if (tDBBoneSlot){
							tDBBoneSlot.setParentMatrix(tSrcBone.resultMatrix);
						}
					}
				}
			};
			var tGraphics;
			if (this._aniMode==0 || this._aniMode==1){
				this.graphics=new GraphicsAni();
				}else {
				if ((this.graphics instanceof laya.ani.GraphicsAni )){
					this.graphics.clear();
					}else {
					this.graphics=new GraphicsAni();
				}
			}
			tGraphics=this.graphics;
			var tSlotData2=NaN;
			var tSlotData3=NaN;
			for (i=0,n=this._boneSlotArray.length;i < n;i++){
				tDBBoneSlot=this._boneSlotArray[i];
				tSlotData2=tSlotDic[tDBBoneSlot.name];
				tSlotData3=tSlotAlphaDic[tDBBoneSlot.name];
				if (!isNaN(tSlotData3)){
					tGraphics.save();
					tGraphics.alpha(tSlotData3);
				}
				if (!isNaN(tSlotData2)){
					tDBBoneSlot.showDisplayByIndex(tSlotData2);
				}
				tDBBoneSlot.draw(tGraphics,this._boneMatrixArray,this,this._aniMode==2);
				if (!isNaN(tSlotData3)){
					tGraphics.restore();
				}
			}
			if (this._aniMode==0){
				this._templet.setGrahicsDataWithCache(this._aniClipIndex,this._clipIndex,tGraphics);
				}else if (this._aniMode==1){
				this._setGrahicsDataWithCache(this._aniClipIndex,this._clipIndex,tGraphics);
			}
		}

		__proto._applyIk1=function(bone,targetX,targetY,alpha){
			var pp=bone._parent;
			var id=1 / (pp.resultMatrix.a *pp.resultMatrix.d-pp.resultMatrix.b *pp.resultMatrix.c);
			var x=targetX-pp.resultMatrix.tx;
			var y=targetY-pp.resultMatrix.ty;
			var tx=(x *pp.resultMatrix.d-y *pp.resultMatrix.b)*id-bone.transform.x;
			var ty=(y *pp.resultMatrix.a-x *pp.resultMatrix.c)*id-bone.transform.y;
			var rotationIK=Math.atan2(ty,tx)*Skeleton.radDeg-0-bone.transform.skX;
			if (bone.transform.scX < 0)rotationIK+=180;
			if (rotationIK > 180)
				rotationIK-=360;
			else if (rotationIK <-180)rotationIK+=360;
			bone.transform.skX=bone.transform.skY=bone.transform.skX+rotationIK *alpha;
			bone.update();
		}

		__proto._applyIk2=function(parent,child,targetX,targetY,bendDir,alpha){
			if (alpha==0){
				return;
			};
			var px=parent.resultTransform.x,py=parent.resultTransform.y;
			var psx=parent.resultTransform.scX,psy=parent.resultTransform.scY;
			var csx=child.resultTransform.scX;
			var os1=0,os2=0,s2=0;
			if (psx < 0){
				psx=-psx;
				os1=180;
				s2=-1;
				}else {
				os1=0;
				s2=1;
			}
			if (psy < 0){
				psy=-psy;
				s2=-s2;
			}
			if (csx < 0){
				csx=-csx;
				os2=180;
				}else {
				os2=0
			};
			var cx=child.resultTransform.x,cy=NaN,cwx=NaN,cwy=NaN;
			var a=parent.resultMatrix.a,b=parent.resultMatrix.b;
			var c=parent.resultMatrix.c,d=parent.resultMatrix.d;
			var u=Math.abs(psx-psy)<=0.0001;
			if (!u){
				cy=0;
				cwx=a *cx+parent.resultMatrix.tx;
				cwy=c *cx+parent.resultMatrix.ty;
				}else {
				cy=child.resultTransform.y;
				cwx=a *cx+b *cy+parent.resultMatrix.tx;
				cwy=c *cx+d *cy+parent.resultMatrix.ty;
			};
			var pp=parent._parent;
			a=pp.resultMatrix.a;
			b=pp.resultMatrix.b;
			c=pp.resultMatrix.c;
			d=pp.resultMatrix.d;
			var id=1 / (a *d-b *c);
			var x=targetX-pp.resultMatrix.tx,y=targetY-pp.resultMatrix.ty;
			var tx=(x *d-y *b)*id-px;
			var ty=(y *a-x *c)*id-py;
			x=cwx-pp.resultMatrix.tx;
			y=cwy-pp.resultMatrix.ty;
			var dx=(x *d-y *b)*id-px;
			var dy=(y *a-x *c)*id-py;
			var l1=Math.sqrt(dx *dx+dy *dy);
			var l2=child.length *csx;
			var a1=NaN,a2=NaN;
			if (u){
				l2 *=psx;
				var cos=(tx *tx+ty *ty-l1 *l1-l2 *l2)/ (2 *l1 *l2);
				if (cos <-1)
					cos=-1;
				else if (cos > 1)cos=1;
				a2=Math.acos(cos)*bendDir;
				a=l1+l2 *cos;
				b=l2 *Math.sin(a2);
				a1=Math.atan2(ty *a-tx *b,tx *a+ty *b);
				}else {
				a=psx *l2;
				b=psy *l2;
				var aa=a *a,bb=b *b,dd=tx *tx+ty *ty,ta=Math.atan2(ty,tx);
				c=bb *l1 *l1+aa *dd-aa *bb;
				var c1=-2 *bb *l1,c2=bb-aa;
				d=c1 *c1-4 *c2 *c;
				if (d > 0){
					var q=Math.sqrt(d);
					if (c1 < 0)q=-q;
					q=-(c1+q)/ 2;
					var r0=q / c2,r1=c / q;
					var r=Math.abs(r0)< Math.abs(r1)?r0:r1;
					if (r *r <=dd){
						y=Math.sqrt(dd-r *r)*bendDir;
						a1=ta-Math.atan2(y,r);
						a2=Math.atan2(y / psy,(r-l1)/ psx);
					}
				};
				var minAngle=0,minDist=Number.MAX_VALUE,minX=0,minY=0;
				var maxAngle=0,maxDist=0,maxX=0,maxY=0;
				x=l1+a;
				d=x *x;
				if (d > maxDist){
					maxAngle=0;
					maxDist=d;
					maxX=x;
				}
				x=l1-a;
				d=x *x;
				if (d < minDist){
					minAngle=Math.PI;
					minDist=d;
					minX=x;
				};
				var angle=Math.acos(-a *l1 / (aa-bb));
				x=a *Math.cos(angle)+l1;
				y=b *Math.sin(angle);
				d=x *x+y *y;
				if (d < minDist){
					minAngle=angle;
					minDist=d;
					minX=x;
					minY=y;
				}
				if (d > maxDist){
					maxAngle=angle;
					maxDist=d;
					maxX=x;
					maxY=y;
				}
				if (dd <=(minDist+maxDist)/ 2){
					a1=ta-Math.atan2(minY *bendDir,minX);
					a2=minAngle *bendDir;
					}else {
					a1=ta-Math.atan2(maxY *bendDir,maxX);
					a2=maxAngle *bendDir;
				}
			};
			var os=Math.atan2(cy,cx)*s2;
			var rotation=parent.transform.skX;
			a1=(a1-os)*Skeleton.radDeg+os1-rotation;
			if (a1 > 180)
				a1-=360;
			else if (a1 <-180)a1+=360;
			parent.resultTransform.x=px;
			parent.resultTransform.y=py;
			parent.resultTransform.skX=parent.resultTransform.skY=rotation+a1 *alpha;
			rotation=child.transform.skX;
			rotation=rotation % 360;
			a2=((a2+os)*Skeleton.radDeg-0)*s2+os2-rotation;
			if (a2 > 180)
				a2-=360;
			else if (a2 <-180)a2+=360;
			child.resultTransform.x=cx;
			child.resultTransform.y=cy;
			child.resultTransform.skX=child.resultTransform.skY=child.resultTransform.skY+a2 *alpha;
			parent.update();
		}

		/**
		*得到当前动画的数量
		*@return
		*/
		__proto.getAnimNum=function(){
			return this._templet.getAnimationCount();
		}

		/**
		*得到指定动画的名字
		*@param index 动画的索引
		*/
		__proto.getAniNameByIndex=function(index){
			return this._templet.getAniNameByIndex(index);
		}

		/**
		*通过名字得到插槽的引用
		*@param name 动画的名字
		*@return
		*/
		__proto.getSlotByName=function(name){
			return this._boneSlotDic[name];
		}

		/**
		*通过名字显示一套皮肤
		*@param name 皮肤的名字
		*/
		__proto.showSkinByName=function(name){
			this._skinIndex=this._templet.getSkinIndexByName(name);
			this.showSkinByIndex(this._skinIndex);
		}

		/**
		*通过索引显示一套皮肤
		*@param skinIndex 皮肤索引
		*/
		__proto.showSkinByIndex=function(skinIndex){
			this._skinIndex=skinIndex;
			this._templet.showSkinByIndex(this._boneSlotDic,skinIndex);
			this._clearCache();
		}

		/**
		*设置某插槽的皮肤
		*@param slotName 插槽名称
		*@param index 插糟皮肤的索引
		*/
		__proto.showSlotSkinByIndex=function(slotName,index){
			if (this._aniMode==0)return;
			var tBoneSlot=this.getSlotByName(slotName);
			if (tBoneSlot){
				tBoneSlot.showDisplayByIndex(index);
			}
			this._clearCache();
		}

		/**
		*设置自定义皮肤
		*@param name 插糟的名字
		*@param texture 自定义的纹理
		*/
		__proto.setSlotSkin=function(slotName,texture){
			if (this._aniMode==0)return;
			var tBoneSlot=this.getSlotByName(slotName);
			if (tBoneSlot){
				tBoneSlot.replaceSkin(texture);
			}
			this._clearCache();
		}

		/**
		*换装的时候，需要清一下缓冲区
		*/
		__proto._clearCache=function(){
			if (this._aniMode==1){
				for (var i=0,n=this._graphicsCache.length;i < n;i++){
					this._graphicsCache[i].length=0;
				}
			}
		}

		/**
		*播放动画
		*@param nameOrIndex 动画名字或者索引
		*@param loop 是否循环播放
		*@param force false,如果要播的动画跟上一个相同就不生效,true,强制生效
		*/
		__proto.play=function(nameOrIndex,loop,force){
			(force===void 0)&& (force=true);
			this._indexControl=false;
			var index=-1;
			var duration=NaN;
			if (loop){
				duration=Number.MAX_VALUE;
				}else {
				duration=0;
			}
			if ((typeof nameOrIndex=='string')){
				for (var i=0,n=this._templet.getAnimationCount();i < n;i++){
					var animation=this._templet.getAnimation(i);
					if (animation && nameOrIndex==animation.name){
						index=i;
						break ;
					}
				}
				}else {
				index=nameOrIndex;
			}
			if (index >-1 && index < this.getAnimNum()){
				if (force || this._pause || this._currAniIndex !=index){
					this._currAniIndex=index;
					this._curOriginalData=new Float32Array(this._templet.getTotalkeyframesLength(index));
					this._player.play(index,this._player.playbackRate,duration);
					this._templet.showSkinByIndex(this._boneSlotDic,this._skinIndex);
					if (this._pause){
						this._pause=false;
						this._lastTime=Browser.now();
						Laya.stage.frameLoop(1,this,this._update,null,true);
					}
				}
			}
		}

		/**
		*停止动画
		*/
		__proto.stop=function(){
			if (!this._pause){
				this._pause=true;
				if (this._player){
					this._player.stop(true);
				}
				Laya.timer.clear(this,this._update);
			}
		}

		/**
		*设置动画播放速率
		*@param value 1为标准速率
		*/
		__proto.playbackRate=function(value){
			if (this._player){
				this._player.playbackRate=value;
			}
		}

		/**
		*暂停动画的播放
		*/
		__proto.paused=function(){
			if (!this._pause){
				this._pause=true;
				if (this._player){
					this._player.paused=true;
				}
				Laya.timer.clear(this,this._update);
			}
		}

		/**
		*恢复动画的播放
		*/
		__proto.resume=function(){
			this._indexControl=false;
			if (this._pause){
				this._pause=false;
				if (this._player){
					this._player.paused=false;
				}
				this._lastTime=Browser.now();
				Laya.stage.frameLoop(1,this,this._update,null,true);
			}
		}

		/**
		*@private
		*得到缓冲数据
		*@param aniIndex
		*@param frameIndex
		*@return
		*/
		__proto._getGrahicsDataWithCache=function(aniIndex,frameIndex){
			return this._graphicsCache[aniIndex][frameIndex];
		}

		/**
		*@private
		*保存缓冲grahpics
		*@param aniIndex
		*@param frameIndex
		*@param graphics
		*/
		__proto._setGrahicsDataWithCache=function(aniIndex,frameIndex,graphics){
			this._graphicsCache[aniIndex][frameIndex]=graphics;
		}

		/**
		*销毁当前动画
		*/
		__proto.destroy=function(destroyChild){
			(destroyChild===void 0)&& (destroyChild=true);
			_super.prototype.destroy.call(this,destroyChild);
			this._templet=null;
			this._player.offAll();
			this._player=null;
			this._curOriginalData=null;
			this._boneMatrixArray.length=0;
			this._lastTime=0;
			Laya.timer.clear(this,this._update);
		}

		/**
		*@private
		*设置帧索引
		*/
		/**
		*@private
		*得到帧索引
		*/
		__getset(0,__proto,'index',function(){
			return this._index;
			},function(value){
			if (this.player){
				this._index=value;
				this._player.currentTime=this._index *1000 / this._player.cacheFrameRate;
				this._indexControl=true;
				this._update(false);
			}
		});

		/**
		*得到播放器的引用
		*/
		__getset(0,__proto,'player',function(){
			return this._player;
		});

		/**
		*设置动画路径
		*/
		/**
		*得到资源的URL
		*/
		__getset(0,__proto,'url',function(){
			return this._aniPath;
			},function(path){
			this.load(path);
		});

		/**
		*得到总帧数据
		*/
		__getset(0,__proto,'total',function(){
			if (this._templet && this._player){
				this._total=Math.floor(this._templet.getAniDuration(this._player.currentAnimationClipIndex)/ 1000 *this._player.cacheFrameRate);
				}else {
				this._total=-1;
			}
			return this._total;
		});

		__static(Skeleton,
		['radDeg',function(){return this.radDeg=180 / Math.PI;},'degRad',function(){return this.degRad=Math.PI / 180;}
		]);
		return Skeleton;
	})(Sprite)


	/**
	*<p> <code>MovieClip</code> 用于播放经过工具处理后的 swf 动画。</p>
	*/
	//class laya.ani.swf.MovieClip extends laya.display.Sprite
	var MovieClip=(function(_super){
		function MovieClip(parentMovieClip){
			this._start=0;
			this._Pos=0;
			this._data=null;
			this._curIndex=0;
			this._preIndex=0;
			this._playIndex=0;
			this._playing=false;
			this._ended=true;
			this._count=0;
			this._ids=null;
			this._loadedImage={};
			this._idOfSprite=null;
			this._parentMovieClip=null;
			this._movieClipList=null;
			this._labels=null;
			this.basePath=null;
			this.interval=30;
			this.loop=false;
			MovieClip.__super.call(this);
			this._ids={};
			this._idOfSprite=[];
			this._reset();
			this._playing=false;
			this._parentMovieClip=parentMovieClip;
			if (!parentMovieClip){
				this._movieClipList=[this];
				this.on(/*laya.events.Event.DISPLAY*/"display",this,this._$3__onDisplay);
				this.on(/*laya.events.Event.UNDISPLAY*/"undisplay",this,this._$3__onDisplay);
				}else {
				this._movieClipList=parentMovieClip._movieClipList;
				this._movieClipList.push(this);
			}
		}

		__class(MovieClip,'laya.ani.swf.MovieClip',_super);
		var __proto=MovieClip.prototype;
		/**
		*<p>销毁此对象。以及销毁引用的Texture</p>
		*@param destroyChild 是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
		*/
		__proto.destroy=function(destroyChild){
			(destroyChild===void 0)&& (destroyChild=true);
			this._clear();
			_super.prototype.destroy.call(this,destroyChild);
		}

		/**@private */
		__proto._$3__onDisplay=function(){
			if (this._displayedInStage)Laya.timer.loop(this.interval,this,this.updates,null,true);
			else Laya.timer.clear(this,this.updates);
		}

		/**@private 更新时间轴*/
		__proto.updates=function(){
			if (this._parentMovieClip)return;
			var i=0,len=0;
			len=this._movieClipList.length;
			for (i=0;i < len;i++){
				this._movieClipList[i]&&this._movieClipList[i]._update();
			}
		}

		/**
		*增加一个标签到index帧上，播放到此index后会派发label事件
		*@param label 标签名称
		*@param index 索引位置
		*/
		__proto.addLabel=function(label,index){
			if (!this._labels)this._labels={};
			this._labels[index]=label;
		}

		/**
		*删除某个标签
		*@param label 标签名字，如果label为空，则删除所有Label
		*/
		__proto.removeLabel=function(label){
			if (!label)this._labels=null;
			else if (!this._labels){
				for (var name in this._labels){
					if (this._labels[name]===label){
						delete this._labels[name];
						break ;
					}
				}
			}
		}

		/**
		*@private
		*动画的帧更新处理函数。
		*/
		__proto._update=function(){
			if (!this._data)return;
			if (!this._playing)return;
			this._playIndex++;
			if (this._playIndex >=this._count){
				if (!this.loop){
					this._playIndex--;
					this.stop();
					return;
				}
				this._playIndex=0;
			}
			this._parse(this._playIndex);
			if (this._labels && this._labels[this._playIndex])this.event(/*laya.events.Event.LABEL*/"label",this._labels[this._playIndex]);
		}

		/**
		*停止播放动画。
		*/
		__proto.stop=function(){
			this._playing=false;
		}

		/**
		*跳到某帧并停止播放动画。
		*@param frame 要跳到的帧
		*/
		__proto.gotoAndStop=function(index){
			this.index=index;
			this.stop();
		}

		/**
		*@private
		*清理。
		*/
		__proto._clear=function(){
			this.stop();
			this._idOfSprite.length=0;
			if (!this._parentMovieClip){
				Laya.timer.clear(this,this.updates);
				var i=0,len=0;
				len=this._movieClipList.length;
				for (i=0;i < len;i++){
					if (this._movieClipList[i] !=this)
						this._movieClipList[i]._clear();
				}
				this._movieClipList.length=0;
			};
			var key;
			for (key in this._loadedImage){
				if (this._loadedImage[key]){
					Loader.clearRes(key);
					this._loadedImage[key]=false;
				}
			}
			this.removeChildren();
			this.graphics=null;
			this._parentMovieClip=null;
		}

		/**
		*播放动画。
		*@param index 帧索引。
		*/
		__proto.play=function(index,loop){
			(index===void 0)&& (index=0);
			(loop===void 0)&& (loop=true);
			this.loop=loop;
			this._playing=true;
			if (this._data)
				this._displayFrame(index);
		}

		/**@private */
		__proto._displayFrame=function(frameIndex){
			(frameIndex===void 0)&& (frameIndex=-1);
			if (frameIndex !=-1){
				if (this._curIndex > frameIndex)this._reset();
				this._parse(frameIndex);
			}
		}

		/**@private */
		__proto._reset=function(rm){
			(rm===void 0)&& (rm=true);
			if (rm && this._curIndex !=1)this.removeChildren();
			this._preIndex=this._curIndex=-1;
			this._Pos=this._start;
		}

		/**@private */
		__proto._parse=function(frameIndex){
			var curChild=this;
			var mc,sp,key=0,type=0,tPos=0,ttype=0,ifAdd=false;
			var _idOfSprite=this._idOfSprite,_data=this._data,eStr;
			if (this._ended)this._reset();
			_data.pos=this._Pos;
			this._ended=false;
			this._playIndex=frameIndex;
			if (this._curIndex > frameIndex&&frameIndex<this._preIndex){
				this._reset(true);
				_data.pos=this._Pos;
			}
			while ((this._curIndex <=frameIndex)&& (!this._ended)){
				type=_data.getUint16();
				switch (type){
					case 12:
						key=_data.getUint16();
						tPos=this._ids[_data.getUint16()];
						this._Pos=_data.pos;
						_data.pos=tPos;
						if ((ttype=_data.getUint8())==0){
							var pid=_data.getUint16();
							sp=_idOfSprite[key]
							if (!sp){
								sp=_idOfSprite[key]=new Sprite();
								var spp=new Sprite();
								spp.loadImage(this.basePath+pid+".png");
								this._loadedImage[this.basePath+pid+".png"]=true;
								sp.addChild(spp);
								spp.size(_data.getFloat32(),_data.getFloat32());
								var mat=_data._getMatrix();
								spp.transform=mat;
							}
							sp.alpha=1;
							}else if (ttype==1){
							mc=_idOfSprite[key]
							if (!mc){
								_idOfSprite[key]=mc=new MovieClip(this);
								mc.interval=this.interval;
								mc._ids=this._ids;
								mc.basePath=this.basePath;
								mc._setData(_data,tPos);
								mc._initState();
								mc.play(0);
							}
							mc.alpha=1;
						}
						_data.pos=this._Pos;
						break ;
					case 3:
						(this.addChild(_idOfSprite[ _data.getUint16()])).zOrder=_data.getUint16();
						ifAdd=true;
						break ;
					case 4:
						_idOfSprite[ _data.getUint16()].removeSelf();
						break ;
					case 5:
						_idOfSprite[_data.getUint16()][MovieClip._ValueList[_data.getUint16()]]=(_data.getFloat32());
						break ;
					case 6:
						_idOfSprite[_data.getUint16()].visible=(_data.getUint8()> 0);
						break ;
					case 7:
						sp=_idOfSprite[ _data.getUint16()];
						var mt=sp.transform || Matrix.create();
						mt.setTo(_data.getFloat32(),_data.getFloat32(),_data.getFloat32(),_data.getFloat32(),_data.getFloat32(),_data.getFloat32());
						sp.transform=mt;
						break ;
					case 8:
						_idOfSprite[_data.getUint16()].setPos(_data.getFloat32(),_data.getFloat32());
						break ;
					case 9:
						_idOfSprite[_data.getUint16()].setSize(_data.getFloat32(),_data.getFloat32());
						break ;
					case 10:
						_idOfSprite[ _data.getUint16()].alpha=_data.getFloat32();
						break ;
					case 11:
						_idOfSprite[_data.getUint16()].setScale(_data.getFloat32(),_data.getFloat32());
						break ;
					case 98:
						eStr=_data.getString();
						this.event(eStr);
						if (eStr=="stop")this.stop();
						break ;
					case 99:
						this._curIndex=_data.getUint16();
						ifAdd && this.updateZOrder();
						break ;
					case 100:
						this._count=this._curIndex+1;
						this._ended=true;
						if (this._playing){
							this.event(/*laya.events.Event.FRAME*/"enterframe");
							this.event(/*laya.events.Event.END*/"end");
							this.event(/*laya.events.Event.COMPLETE*/"complete");
						}
						this._reset(false);
						break ;
					}
			}
			if (this._playing&&!this._ended)this.event(/*laya.events.Event.FRAME*/"enterframe");
			this._Pos=_data.pos;
		}

		/**@private */
		__proto._setData=function(data,start){
			this._data=data;
			this._start=start+3;
		}

		/**
		*加载资源。
		*@param url swf 资源地址。
		*/
		__proto.load=function(url){
			url=URL.formatURL(url);
			this.basePath=url.split(".swf")[0]+"/image/";
			this.stop();
			this._clear();
			this._movieClipList=[this];
			var data=Loader.getRes(url);
			if (data){
				this._initData(data);
				}else {
				Laya.loader.load(url,Handler.create(this,this._onLoaded),null,/*laya.net.Loader.BUFFER*/"arraybuffer");
			}
		}

		/**@private */
		__proto._onLoaded=function(data){
			if (!data)return;
			this._initData(data);
		}

		/**@private */
		__proto._initState=function(){
			this._reset();
			this._ended=false;
			var preState=this._playing;
			this._playing=false;
			this._curIndex=0;
			while (!this._ended)this._parse(++this._curIndex);
			this._playing=preState;
		}

		/**@private */
		__proto._initData=function(data){
			this._data=new Byte(data);
			var i=0,len=this._data.getUint16();
			for (i=0;i < len;i++)this._ids[this._data.getInt16()]=this._data.getInt32();
			this.interval=1000 / this._data.getUint16();
			this._setData(this._data,this._ids[32767]);
			this._initState();
			this.play(0);
			this.event(/*laya.events.Event.LOADED*/"loaded");
			if (!this._parentMovieClip)Laya.timer.loop(this.interval,this,this.updates,null,true);
		}

		/**当前播放索引。*/
		__getset(0,__proto,'index',function(){
			return this._playIndex;
			},function(value){
			this._playIndex=value;
			if (this._data)
				this._displayFrame(this._playIndex);
			if (this._labels && this._labels[value])this.event(/*laya.events.Event.LABEL*/"label",this._labels[value]);
		});

		/**
		*资源地址。
		*/
		__getset(0,__proto,'url',null,function(path){
			this.load(path);
		});

		/**
		*帧总数。
		*/
		__getset(0,__proto,'count',function(){
			return this._count;
		});

		/**
		*是否在播放中
		*/
		__getset(0,__proto,'playing',function(){
			return this._playing;
		});

		MovieClip._ValueList=["x","y","width","height","scaleX","scaleY","rotation","alpha"];
		return MovieClip;
	})(Sprite)



})(window,document,Laya);
