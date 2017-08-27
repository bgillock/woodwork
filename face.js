class Face {
    constructor(piece, shape, origin, offset, rotation, texture) {
        this.shape = shape
        this.offset = offset
        this.origin = new THREE.Vector3(origin.x, origin.y, origin.z)
        this.origin.add(offset)
        this.rotation = rotation
        this.texture = texture
        this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
        this.texture.repeat.set(0.008, 0.008);
        this.geometry = new THREE.ShapeBufferGeometry(shape);
        this.material = new THREE.MeshPhongMaterial({
            //side: THREE.DoubleSide,
            map: this.texture
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
        this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        this.mesh.scale.set(1, 1, 1);
        this.mesh.userData = piece
        if (piece.object) objects.push(this.mesh)
    }
    highlight() {
        this.mesh.material = rollOverMaterial
    }
    unhighlight() {
        this.mesh.material = this.material
    }
    position(origin) {
        this.origin = new THREE.Vector3(origin.x, origin.y, origin.z)
        this.origin.add(this.offset)
        this.mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
    }
    remove() {
         objects.splice(objects.indexOf(this.mesh), 1);
    }
    rotate(rotation){
        
    }
}
