class Game extends eui.Component implements  eui.UIComponent {
    public ground:eui.Image;
    public readme:eui.Label;
    public score_txt:eui.BitmapLabel;
    public gameover:eui.BitmapLabel;
    public star:eui.Image;
    public player:eui.Image;
    public btn_play:eui.Button;

	private jump_audio:egret.Sound;
	private score_audio:egret.Sound;

    private jumpHeight:number = 180;
    private jumpDuration:number = 300;
    private squashDuration:number = 100;
    private maxMoveSpeed:number = 550;

    private speed_x:number = 0;
    private acc_dir:number = 0;
    private accel:number = 450;
    private score:number = 0;
    private min_duration:number = 2;
    private max_duration:number = 4;

    public constructor() {
        super();
    }

    protected partAdded(partName:string,instance:any):void {
        super.partAdded(partName,instance);
    }

    protected childrenCreated():void {
        super.childrenCreated();

        this.player.visible = false;
        this.star.visible = false;
        this.gameover.visible = false;
        // this.score_anim.node.visible = false;

		this.jump_audio = RES.getRes("jump_mp3");
		this.score_audio = RES.getRes("score_mp3");

        this.setScore(0);

        this.btn_play.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onStartPlay, this);
    }

    private update():void {
        var dt:number = 0.033;

		// 根据当前加速度方向每帧更新速度
		if (this.acc_dir == -1) {
			this.speed_x -= this.accel * dt;
		} else if (this.acc_dir == 1) {
			this.speed_x += this.accel * dt;
		} else if (this.acc_dir) {
			this.speed_x = 100;
		}

		// 限制主角的速度不能超过最大值
		if ( Math.abs(this.speed_x) > this.maxMoveSpeed ) {
			// if speed reach limit, use max speed with current direction
			this.speed_x = this.maxMoveSpeed * this.speed_x/Math.abs(this.speed_x);
		}

		// 根据当前速度更新主角的位置
		this.player.x += this.speed_x * dt;

		// limit player position inside screen
		if ( this.player.x > this.width) {
			this.player.x = this.width;
			this.speed_x = 0;
		} else if (this.player.x < 0) {
			this.player.x = 0;
			this.speed_x = 0;
		}

		// 碰撞检测
		if (this.player.hitTestPoint(this.star.x,this.star.y)) {
			this.onPickStar();
		}
    }

	private onStartPlay():void {
		this.readme.visible = false;
		this.gameover.visible = false;
		this.btn_play.visible = false;
		this.player.visible = true;
		this.star.visible = true;
		// this.enabled = true;

		this.starReinit();
		this.playerStartMove();
        this.setScore(0);

        this.addEventListener(egret.Event.ENTER_FRAME, this.update, this);
        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
        this.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);
    }

	private onGameOver():void {
		// this.enabled = false;
		this.gameover.visible = true;
        this.btn_play.visible = true;

		egret.Tween.removeTweens(this.player);
		egret.Tween.removeTweens(this.star);

        this.removeEventListener(egret.Event.ENTER_FRAME, this.update, this);
        this.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
        this.removeEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);
	}

	private onPickStar():void {
		this.score_audio.play(0,1);
		this.setScore(this.score+1);
		this.starReinit();
	}

	private onTouchBegin(ev:egret.TouchEvent):void {
		if (ev.stageX >= this.width/2) {
            this.acc_dir = 1;
        } else {
            this.acc_dir = -1;
        }
	}

	private onTouchEnd(ev:egret.TouchEvent):void {
		this.acc_dir = 0;
	}

	private playerStartMove():void {
		this.acc_dir = 0;
		this.speed_x = 0;
		this.player.x = this.width/2;
		this.player.y = this.ground.y;

        // 创建 Tween 对象
        egret.Tween.get(this.player, {loop: true})
			.to({scaleX:1.0,scaleY:0.6},this.squashDuration) // squash
			.to({scaleX:1.0,scaleY:1.2},this.squashDuration) // stretch
			.to({y:this.player.y-this.jumpHeight},this.jumpDuration,egret.Ease.cubicOut) // 上升
			.to({scaleX:1.0,scaleY:1.0},this.squashDuration) //scaleBack
			.to({y:this.player.y},this.jumpDuration,egret.Ease.cubicIn) // 下落
			.call(function(){this.jump_audio.play(0,1)},this); // 音效
    }

	private starReinit():void {
		egret.Tween.removeTweens(this.star);
        this.star.alpha = 1.0;
		this.starSetNewPosition();

        // 创建 Tween 对象
        egret.Tween.get(this.star)
			.to({alpha:0.0},4000)
			.call(this.onGameOver,this);
	}

	private starSetNewPosition():void {
        let rand_x = this.star.x;
        let rand_y = this.ground.y - Math.random()*this.jumpHeight - 50;
        while (Math.abs(rand_x-this.star.x) < 100) {
            rand_x = Math.random()*this.width;
        }
		this.star.x = rand_x;
		this.star.y = rand_y;
	}

    private getStarDuration():number {
        return this.min_duration + Math.random()*(this.max_duration - this.min_duration);
    }

	private setScore(x:number):void {
		this.score = x;
		this.score_txt.text = "Score: " + this.score;
	}
}