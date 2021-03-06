var OuterGame = function() {
    this.world = new OuterWorld();
    this.view = new OuterView();
    this.gaze = new GazeControls(this.world.scene);
    this.input = new DesktopControls();
    this.socket = io(document.location.origin);

    this.lastMessage = {pivot: "", pos: ""};

    this.active = true;

    this.socketEvents();
    this.socketUpdate();
    this.update();

    window.addEventListener("touchend", function () {
        console.log("touchend");
        if (screenfull.enabled) {
            screenfull.request();
        }
    });
    
    this.playSoundTrack();
};

OuterGame.prototype.destroy = function () {

    // clean up the OuterGame World.
    this.active = false;
    this.view.destroy();
};

OuterGame.prototype.update = function() {
    if ( ! this.active ) {
        return;
    }
    requestAnimationFrame( this.update.bind( this ) );

    if(!this.world.isBusy()) {

        var target = this.gaze.getGaze(this.view.camera, this.world.navNodesObject.children, this.world.worldObject.position);
        if (target != null) this.world.setMoveTo(target);

        this.world.setJumpBy(this.input.getMovement(),this.view.getRotation());
    }

    if (this.world.update()) {
        this.socketUpdate();
        this.checkTriggers();
    }

    this.view.rotateCamera(this.input.getMouse());

    this.view.render(this.world.scene);

};

OuterGame.prototype.playSoundTrack = function () {

    createjs.Sound.on('fileload', function () {
        createjs.Sound.play('soundMan');
    });

    createjs.Sound.registerSound('/global/assets/audio/soundscape-outside-man-final.mp3', 'soundMan');
};

OuterGame.prototype.stopSoundTrack = function () {

    createjs.Sound.stop('soundMan');
};

OuterGame.prototype.socketEvents = function() {
    this.socket.on('pivot', function(eventData) {
        eventData = JSON.parse(eventData);
        var x = Math.round(eventData.x) / 180 * Math.PI,
            y = Math.round(eventData.y) / 180 * Math.PI,
            z = Math.round(eventData.z) / 180 * Math.PI;

        //console.log('pivot', eventData, x, y, z);
        //world.rotation.set(x, y, z);
    });
    this.socket.on('world-position', function(eventData) {
        eventData = JSON.parse(eventData);
        var x = Math.round(eventData.x),
            y = Math.round(eventData.y),
            z = Math.round(eventData.z);

        //console.log('worldpos', x, y, z);
        ////hypercube.position.set(x+16,y+14,z+16);
        //hypercube.position.set(x, y, z);
        //marker.mesh.position.set(-x - 8, -y - 7, -z - 8);
        //world.position.set(-x, -y, -z);
    });
    //this.socket.on('rotate-h', this.world.setRotateTo.bind(this.world, 72));
    //this.socket.on('rotate-k', this.world.setRotateTo.bind(this.world, 75));
    //this.socket.on('rotate-u', this.world.setRotateTo.bind(this.world, 85));
    //this.socket.on('rotate-j', this.world.setRotateTo.bind(this.world, 74));
};

OuterGame.prototype.socketUpdate = function () {
    var newPivot = JSON.stringify({
        x: this.world.pivotObject.rotation.x,
        y: this.world.pivotObject.rotation.y,
        z: this.world.pivotObject.rotation.z
    });
    var newWorldPos = JSON.stringify({
        x: this.world.worldObject.position.x,
        y: this.world.worldObject.position.y,
        z: this.world.worldObject.position.z
    });

    if (newWorldPos !== this.lastMessage.pos) {
        this.socket.emit('world-position', newWorldPos);
        this.lastMessage.pos = newWorldPos;
        console.log('mainGame -> worldpos', newWorldPos);
    }
    if (newPivot !== this.lastMessage.pivot) {
        this.socket.emit('pivot', newPivot);
        this.lastMessage.pivot = newPivot;
        console.log('mainGame -> pivot', newPivot);
    }
};

OuterGame.prototype.checkTriggers = function () {
    this.world.triggerObjects.forEach(function (trigger) {
        trigger.checkHit(this.world.worldObject.position, function (triggerObject) {
            switch (triggerObject) {
                case 'Trigger_Finish' :
                    console.log('mainGame -> won');

                    this.stopSoundTrack();

                    this.socket.emit('won', true);
                    break;
            }
        }.bind(this));
    }, this);
};