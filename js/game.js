$(document).ready(function(e) {
    SiteManager.init();
});

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

var SiteManager = {
    init: function () {
        StartScreen.init();
        TheGame.init();

        //

        StartScreen.showMe();
    }
};

var StartScreen = {
    myVisual:null,
    myStartButton:null,

    init: function () {
        this.myVisual = $('#start-screen');
        this.myStartButton = $('#start-screen .button');
    },

    showMe: function () {
        this.myVisual.fadeIn();
        this.myStartButton.on("click", this.onStartClicked.bind(this));
    },

    hideMe: function() {
        this.myStartButton.off("click");
        this.myVisual.fadeOut();
    },

    onStartClicked: function () {
        this.hideMe();
        TheGame.showMe();
    }
};

var TheGame = {
    JUMP_FORCE:-12,
    GRAVITY:0.4,
    HOR_SPEED:0.6,
    AREA_WIDTH:394,
    AREA_HEIGHT:315,
    MAX_JUMP_HEIGHT:150,
    TARGET_HEIGHT:-1000,

    myVisual:null,
    viewportOffset:{x:0,y:0},
    bLeftIsPressed:false,
    bRightIsPressed:false,
    aActivePlatforms:[],
    aPlatformsPool:[],
    nNextPlatformY:0,
    nPlatformIDCount:0,
    bGameActive:false,

    init: function () {
        Jumper.init();

        this.myVisual = $('#the-game');
    },

    showMe: function() {
        this.setupNewGame();
        this.startGame();

        //

        this.myVisual.fadeIn();
    },

    startGame: function () {
        document.onkeydown = this.onKeyedDown.bind(this);
        document.onkeyup = this.onKeyedUp.bind(this);
        this.bGameActive = true;
        this.onUpdateStage();
    },

    clearGame: function () {
        for(var i=0;i<this.aActivePlatforms.length;i++){
            this.aActivePlatforms[i].div.hide();
            this.aPlatformsPool.push(this.aActivePlatforms[i]);
        }
        this.aActivePlatforms = [];
    },

    setupNewGame: function () {
        Jumper.resetPlayer();

        this.viewportOffset.x = 0;
        this.viewportOffset.y = 0;

        this.bLeftIsPressed = false;
        this.bRightIsPressed = false;

        //this.makeNewPlatform(this.TARGET_HEIGHT,"wideexit");
        this.makeNewPlatform(297,"wide");
        this.makeNewPlatform(Math.floor(this.AREA_HEIGHT*0.65), "normal");
        this.makeNewPlatform(Math.floor(this.AREA_HEIGHT*0.4), "normal");
        this.makeNewPlatform(Math.floor(this.AREA_HEIGHT*0.1), "normal");
        this.nNextPlatformY = -20;

        this.renderToScreen();
    },

    managePlatforms: function () {
        var keepsies = [];
        for(var i=0;i<this.aActivePlatforms.length;i++){
            if(this.aActivePlatforms[i].worldpos.y - this.viewportOffset.y > this.AREA_HEIGHT){
                this.aActivePlatforms[i].div.hide();
                this.aPlatformsPool.push(this.aActivePlatforms[i]);
            }else{
                keepsies.push(this.aActivePlatforms[i]);
            }
        }

        this.aActivePlatforms = keepsies;

        if(this.viewportOffset.y < this.nNextPlatformY+20 && this.viewportOffset.y > this.TARGET_HEIGHT+75){
            this.makeNewPlatform(this.nNextPlatformY, "normal");
            this.nNextPlatformY = this.viewportOffset.y - Math.floor(((Math.random()*0.7)+0.3) * this.MAX_JUMP_HEIGHT);
        }
    },

    makeNewPlatform: function(_y, _version) {
        var pf;

        if(this.aPlatformsPool.length > 0){
            pf = this.aPlatformsPool.pop();
        }else{
            pf = new Platform(this.nPlatformIDCount);
            this.nPlatformIDCount++;
        }

        pf.setVersion(_version);
        pf.setWorldPosY(_y)

        pf.showMe();

        this.aActivePlatforms.push(pf);
    },

    onKeyedDown: function (e) {
        switch(e.keyCode){
            case 37:
                this.bLeftIsPressed = true;
                e.preventDefault();
                break;

            case 39:
                this.bRightIsPressed = true;
                e.preventDefault();
                break;
        }
    },

    onKeyedUp: function (e) {
        switch(e.keyCode){
            case 37:
                this.bLeftIsPressed = false;
                e.preventDefault();
                break;

            case 39:
                this.bRightIsPressed = false;
                e.preventDefault();
                break;
        }
    },

    checkForPlatformHit: function () {
        if(Jumper.dy > 0){
            for(var i=0;i<this.aActivePlatforms.length;i++){
                if(Jumper.worldX > this.aActivePlatforms[i].worldpos.x){
                    if(Jumper.worldX < this.aActivePlatforms[i].worldpos.x + this.aActivePlatforms[i].platformwidth){
                        if(Jumper.worldY >= this.aActivePlatforms[i].worldpos.y){
                            if(Jumper.worldY - Jumper.dy < this.aActivePlatforms[i].worldpos.y){
                                Jumper.dy = this.JUMP_FORCE;
                                Jumper.worldY = this.aActivePlatforms[i].worldpos.y;
                                if(this.aActivePlatforms[i].worldpos.y == this.TARGET_HEIGHT){
                                    //end
                                }else{
                                    //do jump sound
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    renderToScreen: function () {
        for(var i=0;i<this.aActivePlatforms.length;i++){
            this.aActivePlatforms[i].div.css({
                left: this.aActivePlatforms[i].worldpos.x - this.viewportOffset.x,
                top: this.aActivePlatforms[i].worldpos.y - this.viewportOffset.y
            });
        }

        Jumper.renderMe(Jumper.worldX - this.viewportOffset.x, Jumper.worldY - this.viewportOffset.y);

        if(Jumper.worldY - this.viewportOffset.y > this.AREA_HEIGHT+50){
            this.gameOver();
        }
    },

    gameOver: function () {
        this.bGameActive = false;
        document.onkeydown = null;
        document.onkeyup = null;
        window.setTimeout(this.restartGame.bind(this),1500);
    },

    restartGame: function() {
        this.clearGame();
        this.setupNewGame();
        this.startGame();
    },

    handleViewportOffset: function () {
        if(Jumper.dy < 0) {
            var dif = this.AREA_HEIGHT *0.4 - (Jumper.worldY - this.viewportOffset.y);
            if (dif > 0) {
                dif*=1.2;
                this.viewportOffset.y -= (dif*0.1);
            }
        }
    },

    onUpdateStage: function () {
        if(this.bGameActive) {
            this.managePlatforms();
            Jumper.onUpdateMe();
            this.checkForPlatformHit();
            this.renderToScreen();
            this.handleViewportOffset();
            //
            requestAnimationFrame(this.onUpdateStage.bind(this));
        }
    }
};

var Platform = function(_id) {
    this.myPlatformContainer = $('.js-platforms-container');
    var htmlcode = `<div id='platform${_id}' class='platform platform--${_version}'></div>`;
    this.myPlatformContainer.append(htmlcode);
    this.myDiv = $(`#platform${this.nPlatformIDCount}`);
    this.myWorldPos = {x:0,y:0};
}

Platform.prototype.setVersion = function (_version) {
    this.sMyVersion = _version;
    if(_version != "normal"){
        this.nPlatformwidth = 250;
        this.myWorldPos.x = (TheGame.AREA_WIDTH-268)*0.5;
    }else{
        this.nPlatformwidth = 80;
        this.myWorldPos.x = Math.floor(Math.random()*TheGame.AREA_WIDTH*0.8)-25;
    }


    this.myDiv.removeClass('--wide');
    this.myDiv.removeClass('--normal');

    this.myDiv.addClass(`--${this.sMyVersion}`);
}

Platform.prototype.setWorldPosY = function (_y) {
    this.myWorldPos.y = _y;
}

Platform.prototype.showMe = function () {
    this.myDiv.show();
}

Platform.prototype.checkJumper = function () {

}

var Jumper = {
    myVisual:null,
    dx:0,
    dy:0,
    worldX:0,
    worldY:0,
    visualstate:"",

    init: function () {
        this.myVisual = $('#jumper');
    },

    resetPlayer: function () {
        this.dx = 0;
        this.dy = 0;
        this.worldX = 185;
        this.worldY = 290;
    },

    renderMe: function (_x, _y) {
        this.myVisual.css({
            left:_x+"px",
            top:_y+"px"
        });
    },

    onUpdateMe: function () {
        this.dy += TheGame.GRAVITY;
        this.dx *=0.9;


        if (TheGame.bLeftIsPressed) {
            this.dx -= TheGame.HOR_SPEED;
        }
        if (TheGame.bRightIsPressed) {
            this.dx += TheGame.HOR_SPEED;
        }

        this.worldX += this.dx;
        this.worldY += this.dy;

        if(this.worldX < 0){
            this.worldX = TheGame.AREA_WIDTH;
        }else if(this.worldX > TheGame.AREA_WIDTH){
            this.worldX = 0;
        }
    }
};
