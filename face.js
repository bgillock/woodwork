class Face {
    constructor(piece, geometry, offset, euler, grain) {
        this.piece = piece
        this.offset = offset
        this.origin = new THREE.Vector3()
        this.origin.add(offset)
        this.rotation = euler
        this.grain = grain
        this.geometry = geometry.clone()
        this.geometry.dynamic = true;

        // mesh
        this.mesh = new THREE.Mesh(this.geometry, this.grain.material)
        this.mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
        this.mesh.setRotationFromEuler(euler)
            // this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        this.mesh.scale.set(1, 1, 1);
        this.mesh.updateMatrixWorld();
        this.mesh.castShadow = false
        this.mesh.receiveShadow = true

        this.updatePosition()
    
        this.mesh.userData = piece
        if (piece.object) piece.objects.push(this.mesh)
    }
    dispose() {

    }
    highlight() {
        this.mesh.material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            opacity: 0.5,
            transparent: true,
            // side: THREE.DoubleSide,
        });
    }
    unhighlight() {
        this.mesh.material = this.grain.material
    }
    updatePosition() {
        // wireframe
        var geo = new THREE.EdgesGeometry(this.mesh.geometry); // or WireframeGeometry
        var mat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 5 });
        if (this.wireframe != null) this.mesh.remove(this.wireframe)

        this.wireframe = new THREE.LineSegments(geo, mat);
        this.mesh.add(this.wireframe);

        this.mesh.updateMatrixWorld();
        this.points = []
        this.normals = []
        var positionArray = this.mesh.geometry.attributes.position.array
        var normals = this.mesh.geometry.attributes.normal.array
        var normalMatrix = new THREE.Matrix3().getNormalMatrix(this.mesh.matrixWorld);
        for (var i = 0; i < 12; i += 3) {
            var p = new THREE.Vector3(positionArray[i], positionArray[i + 1], positionArray[i + 2])
            p.applyMatrix4(this.mesh.matrixWorld)
            this.points.push(p)
            var normal = new THREE.Vector3(-normals[i], -normals[i + 1], -normals[i + 2])
                //  var n = new THREE.Matrix4().extractRotation(this.mesh.matrixWorld).applyMatrix4(normal.clone())
            var newNormal = normal.clone().applyMatrix3(normalMatrix).normalize();
            var flipNormal = new THREE.Vector3(-newNormal.x, -newNormal.y, -newNormal.z)
            this.normals.push(flipNormal)
        }
    }
    removeHit() {
        this.piece.objects.splice(this.piece.objects.indexOf(this.mesh), 1);
    }
    addHit() {
        if (this.piece.objects.indexOf(this.mesh) < 0) {
            this.piece.objects.push(this.mesh)
        }
    }
    clone(piece) {
        var newFace = new Face(piece, this.geometry, this.offset, this.rotation, this.grain)
        return newFace
    }
}