class Face {
    constructor(piece, shape, origin, offset, rotation, texture) {
        this.piece = piece
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
            map: this.texture,
            polygonOffset: true,
            polygonOffsetFactor: 1, // positive value pushes polygon further away
            polygonOffsetUnits: 1
        });
        
        // mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
        this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        this.mesh.scale.set(1, 1, 1);
        this.mesh.updateMatrixWorld();
        
        // wireframe
        var geo = new THREE.EdgesGeometry( this.mesh.geometry ); // or WireframeGeometry
        var mat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 5 } );
        var wireframe = new THREE.LineSegments( geo, mat );
        this.mesh.add( wireframe );
        
        // Save actual points and normals for this face for other highlighting and hit testing
        this.points = []
        this.normals = []
        var positionArray = this.mesh.geometry.attributes.position.array
        var normals = this.mesh.geometry.attributes.normal.array
        var normalMatrix = new THREE.Matrix3().getNormalMatrix(this.mesh.matrixWorld);

        for (var i = 0; i < 12; i += 3) {
            var p = new THREE.Vector3(positionArray[i], positionArray[i + 1], positionArray[i + 2])
            p.applyMatrix4(this.mesh.matrixWorld)
            this.points.push(p)
            var normal = new THREE.Vector3(normals[i], normals[i + 1], normals[i + 2])
                // rotate to world
            var newNormal = normal.clone().applyMatrix3(normalMatrix).normalize();
            // flip
            var flipNormal = new THREE.Vector3(-newNormal.x, -newNormal.y, -newNormal.z)
            this.normals.push(flipNormal)
        }

        this.mesh.userData = piece
        if (piece.object) piece.objects.push(this.mesh)
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
        this.mesh.material = this.material
    }
    position(origin) {
        this.origin = new THREE.Vector3(origin.x, origin.y, origin.z)
        this.origin.add(this.offset)
        this.mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
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
    remove() {
        this.piece.objects.splice(this.piece.objects.indexOf(this.mesh), 1);
    }
    add() {
        this.piece.objects.push(this.mesh)
    }
    rotate(rotation) {

    }
}