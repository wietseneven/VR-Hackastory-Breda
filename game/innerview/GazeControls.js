var GazeControls = function(scene) {
    this.ControlsPads = new THREE.Object3D();
    this.rayCaster = new THREE.Raycaster();
    this.rayVector = new THREE.Vector3();

    this.lookingAt = {id: 0, timer: 0, delay: 1000, cooldown: 0};
};

GazeControls.prototype.getGaze = function (camera, navNodes, position) {

    if (Date.now() - this.lookingAt.cooldown < this.lookingAt.delay)
        return;

    navNodes.forEach(function (n) {
        n.material.color.set(0xffffff);
    });

    this.rayCaster.setFromCamera( this.rayVector, camera );

    var intersects = this.rayCaster.intersectObjects(navNodes, true);

    for (i = intersects.length - 1; i >= 0; i--) {
        if (intersects[i].object.visible === false)
            intersects.splice(i);
    }

    if (intersects.length > 0 && intersects[0].object.name.indexOf("NavPath") === 0) {

        if (this.lookingAt.id === intersects[0].object.id) {

            var realPosition = new THREE.Vector3().setFromMatrixPosition(intersects[0].object.matrixWorld);

            if (Math.abs(realPosition.y) > 2) {

                intersects[0].object.material.color.set(0xff0000);

            } else {

                intersects[0].object.material.color.set(0x00ff00);

                if (Date.now() - this.lookingAt.timer > this.lookingAt.delay) {
                    //intersects[0].object.material = this.normalMaterial;
                    this.lookingAt.cooldown = Date.now();


                    var moveMe = new THREE.Vector3(
                        (position.x - 2) + intersects[0].object.position.x,
                        (position.y - 2) + intersects[0].object.position.y,
                        (position.z - 2) + intersects[0].object.position.z
                    );

                    return moveMe;

                }
            }
        } else {
            this.lookingAt.id = intersects[0].object.id;
            this.lookingAt.timer = Date.now();
        }

    } else {
        this.lookingAt.id = 0;
    }

};