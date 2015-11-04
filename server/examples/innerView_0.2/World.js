var World = function() {

    this.props = {
        rotationSpeed : 0.03,
        moveSpeed : 0.2,
        isRotating : false,
        isMoving : false,
        vectorRotationCurrent : new THREE.Vector3(0,0,0),
        vectorRotationTarget : new THREE.Vector3(0,0,0),
        vectorMoveTarget : new THREE.Vector3(0,0,0),
        rotationAsDegrees : []
    };

    this.worldObject = new THREE.Object3D();
    this.pivotObject = new THREE.Object3D();
    this.scene = new THREE.Scene();
    this.map = [];

    this.init();
};

//Init
World.prototype.init = function() {
    this.map = WORLDMAP.map;
    this.worldObject.position.set(2,2,2);
    this.buildWorld();
};

//Creates the world objects from the map
World.prototype.buildWorld = function() {

    // INNERWALLS
    var wallTexture = THREE.ImageUtils.loadTexture( "textures/patterns/floor_tile.jpg" );
    var material = new THREE.MeshBasicMaterial( { map: wallTexture } );
    var geometry = new THREE.BoxGeometry(2, 2, 2);

    for (var z = 0; z < this.map.length; z++) {
        for (var x = 0; x < this.map[z].length; x++) {
            for (var y = 0; y < this.map[z][x].length; y++) {

                if(this.map[z][x][y] === 1){
                    var mesh = new THREE.Mesh(geometry, material);
                    mesh.position.set((x * 2)-2,(z * 2)-2,(y * 2)-2);
                    mesh.name = "cube";
                    this.world.add(mesh);
                }
            }
        }
    }

    // OUTERWALLS
    var outerWallTexture = THREE.ImageUtils.loadTexture( "textures/patterns/floor_tile.jpg" );
    outerWallTexture.wrapS = outerWallTexture.wrapT = THREE.RepeatWrapping;
    outerWallTexture.repeat.set(12.5,12.5);
    var outerWallMaterial = new THREE.MeshBasicMaterial( { map: outerWallTexture } );
    var outerGeometry = new THREE.BoxGeometry(2, 25, 25);

    var outerWalls = [  [-4,7,9,0],
        [18,7,9,0],
        [9,7,-4,0],
        [9,7,18,0],
        [9,-4,9,Math.PI],
        [9,16,9,Math.PI]    ];

    outerWalls.foreach(function(wall){

        var wallMesh = new THREE.Mesh(outerGeometry, outerWallMaterial);
        wallMesh.position.set(wall[0],wall[1],wall[2]);
        this.worldObject.add(wallMesh);
    },this);

    // ADDING THINGS TO THINGS
    this.pivotObject.add(this.worldObject);
    this.scene.add(this.pivotObject);

};

// rotates the world object
World.prototype.rotate = function() {
    if (!this.props.isRotating)
        return;

    var delta = new THREE.Vector3();
    delta.subVectors(this.props.vectorRotationTarget, this.props.vectorRotationCurrent);

    if (delta.length() < this.props.rotationSpeed){
        // rotation is very close to target
        // so set rotation to target and stop rotating
        this.props.vectorRotationCurrent = this.props.vectorRotationTarget;
        this.props.isRotating = false;

        this.props.rotationAsDegrees = this.fixDegrees(this.worldObject.getWorldRotation());

        //not sure if this still does anything
        world.updateMatrixWorld();
    } else {
        // rotation by rotationSpeed
        delta.setLength(this.props.rotationSpeed);
        this.props.vectorRotationCurrent.add(delta);
    }

    this.pivotObject.rotation.set()

};

// moves the world object
World.prototype.move = function() {
    if(!this.props.isMoving)
        return;

    var delta = new THREE.Vector3();
    delta.subVectors(this.props.vectorMoveTarget, this.worldObject.position);

    if (delta.length() < this.props.moveSpeed) {

        this.props.isMoving = false;
    } else {
        delta.setLength(this.props.moveSpeed);
        this.worldObject.position.add(delta);
    }

};

//expects an [x,y,z] array from the control pads
World.prototype.setMoveTo = function(target) {

    var tmp;

    switch (worldDegrees[0]){

        case 0:

            switch (worldDegrees[2]){
                case 90:
                    tmp = target.x;
                    target.x = target.y;
                    target.y = -tmp;
                    break;
                case 180:
                    target.x = -target.x;
                    break;
                case 270:
                    tmp = target.x;
                    target.x = target.y;
                    target.y = tmp;
                    break;
            }
            break;

        case 90:

            switch (worldDegrees[2]){
                case 0:
                    target.y = target.z;
                    target.z = 0;
                    break;
                case 90:
                    tmp = target.x;
                    target.x = target.z;
                    target.y = -tmp;
                    target.z = 0;
                    break;
                case 180:
                    target.x = -target.x;
                    target.y = -target.z;
                    target.z = 0;
                    break;
                case 270:
                    tmp = target.x;
                    target.x = -target.z;
                    target.z = 0;
                    target.y = tmp;
                    break;
            }
            break;

        case 180:

            switch (worldDegrees[2]){
                case 0:
                    target.z = -target.z;
                    break;
                case 90:
                    target.z = -target.z;
                    target.y = -target.x;
                    target.x = 0;
                    break;
                case 180:
                    target.z = -target.z;
                    target.x = -target.x;
                    break;
                case 270:
                    target.z = -target.z;
                    target.y = target.x;
                    target.x = 0;
                    break;
            }
            break;

        case 270:

            switch (worldDegrees[2]){
                case 0:
                    target.y = -target.z;
                    target.z = 0;
                    break;
                case 90:
                    tmp = target.x;
                    target.x = -target.z;
                    target.y = -tmp;
                    target.z = 0;
                    break;
                case 180:
                    target.x = -target.x;
                    target.y = target.z;
                    target.z = 0;
                    break;
                case 270:
                    tmp = target.x;
                    target.x = target.z;
                    target.y = tmp;
                    target.z = 0;
                    break;
            }
    }

    var offset = new THREE.Vector3(target.x,target.y,target.z);
    this.props.vectorMoveTarget = new THREE.Vector3().subVectors(this.worldObject.position,offset);
    this.props.isMoving = true;
};

//expects an [x,y,z] array in radians (Pi is 180 degrees)
World.prototype.setRotateTo = function(target) {
    this.props.vectorMoveTarget = new THREE.Vector3(target.x,target.y,target.z);
    this.props.isMoving = true;
};

//turn radians into degrees, rounded to 0, 90, 180 or 270
World.prototype.fixDegrees = function(degArray) {
    var i = 0, l = degArray.length, r = [], d;
    for (i;i<l;i++){
        d = (Math.round((degArray[i] * 180 / Math.PI)/10)*10);
        d = (-90?270:d);
        r.push(Math.abs(d));
    }
    return r;
};

World.prototype.update = function() {
    this.rotate();
    this.move();
};

World.prototype.isBusy = function() {
    return (this.props.isMoving || this.props.isRotating);
};