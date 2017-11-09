class Face {
    constructor(piece, geometry, offset, euler, grain) {
        this.piece = piece
        this.offset = offset
        this.origin = new THREE.Vector3()
        this.origin.add(offset)
        this.rotation = euler
        this.grain = grain
        this.geometry = geometry.clone()
        this.geometry.dynamic = true
            //var width = this.grain.texture.img.width
            //var height = this.grain.texture.img.height
        this.geometry.attributes.uv.array[3] = 1
        this.geometry.attributes.uv.array[4] = 1
        this.geometry.attributes.uv.array[5] = 1
        this.geometry.attributes.uv.array[6] = 1
            //   this.geometry.attributes.uv.dynamic = true

        // mesh
        this.mesh = new THREE.Mesh(this.geometry, this.grain.material)
        this.mesh.position.set(this.origin.x, this.origin.y, this.origin.z)
        this.mesh.setRotationFromEuler(euler)
            // this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        this.mesh.scale.set(1, 1, 1);
        this.mesh.updateMatrixWorld();
        this.mesh.castShadow = false
        this.mesh.receiveShadow = true

        this.updatePosition()

        this.mesh.userData = piece
        this.piece.objects.push(this.mesh)
    }
    dispose() {

    }
    shiftOrigin(shift) {
        this.mesh.position.add(shift)
        this.updatePosition()
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
        this.locals = []
        var positionArray = this.mesh.geometry.attributes.position.array
        var normals = this.mesh.geometry.attributes.normal.array
        var normalMatrix = new THREE.Matrix3().getNormalMatrix(this.mesh.matrixWorld);
        for (var i = 0; i < 12; i += 3) {
            var l = new THREE.Vector3(positionArray[i], positionArray[i + 1], positionArray[i + 2])
            this.locals.push(l)
            var p = new THREE.Vector3(positionArray[i], positionArray[i + 1], positionArray[i + 2])
            p.applyMatrix4(this.mesh.matrixWorld)
            this.points.push(p)
            var normal = new THREE.Vector3(-normals[i], -normals[i + 1], -normals[i + 2])
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
    closeTo(objects, distance) {
        var min = 320000
        var closest = null
        var point = null
            // Look nearby
        for (var i = 0; i < this.points.length; i++) {
            var origin = this.points[i].clone()
            var normal = this.normals[i].clone()

            var raycaster = new THREE.Raycaster(origin, normal.clone().normalize())
            var collisionResults = raycaster.intersectObjects(objects);
            if (collisionResults.length > 0) {
                var c = 0
                if (collisionResults[c].object == plane) { c++ }
                if (collisionResults.length > c) {
                    if (collisionResults[c].distance < distance) {
                        if (closest == null || closest.distance > collisionResults[c].distance) {
                            closest = collisionResults[c]
                            point = this.points[i].clone()
                        }
                        // console.log("Hit " + collisionResults[c].object.userData)
                        /*
                            var geometry = new THREE.Geometry();
                            geometry.vertices.push(origin)
                            geometry.vertices.push(collisionResults[c].point)
    
                            var material = new THREE.LineBasicMaterial({ color: 0xff0000, opacity: 1, linewidth: 3 });
                            var lines = new THREE.Line(geometry, material)
                            scene.add(lines)
                            */
                    }
                }
            }
        }
        // Look the opposite way (inside)
        for (var i = 0; i < this.points.length; i++) {
            var origin = this.points[i].clone()
            var normal = new THREE.Vector3(-this.normals[i].x, -this.normals[i].y, -this.normals[i].z)

            var raycaster = new THREE.Raycaster(origin, normal.clone().normalize())
            var collisionResults = raycaster.intersectObjects(objects);
            if (collisionResults.length > 0) {
                var c = 0
                if (collisionResults[c].object == plane) { c++ }
                if (collisionResults.length > c) {
                    if (collisionResults[c].distance < distance) {
                        if (closest == null || closest.distance > collisionResults[c].distance) {
                            point = this.points[i].clone()
                            closest = collisionResults[c]
                        }
                    }
                }
            }
        }
        if (closest != null) {
            return { point: point, closest: closest }
        } else return null
    }
    onTop(objects, distance) {
        var max = 0
        var highest = null
            // Look nearby
        for (var i = 0; i < this.points.length; i++) {
            var origin = this.points[i].clone()
            origin.y += distance / 2 // Start for far above, but half the distance
            var normal = new THREE.Vector3()
            normal.y = -1

            //    origin.rotation.set(this.back.rotation.x, this.back.rotation.y, this.back.rotation.z);
            var raycaster = new THREE.Raycaster(origin, normal.clone().normalize())
            var collisionResults = raycaster.intersectObjects(objects);
            if (collisionResults.length > 0) {
                var c = 0
                if (collisionResults[c].object == plane) { c++ }
                if (collisionResults.length > c) {
                    if (collisionResults[c].point.y > max) {
                        highest = collisionResults[c]
                        max = highest.point.y
                    }
                }
            }
        }

        return highest
    }
}