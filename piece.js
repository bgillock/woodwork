function rectangle(x, y) {
    var rectangle = new THREE.Shape()
    rectangle.moveTo(0, 0)
    rectangle.lineTo(x, 0)
    rectangle.lineTo(x, y)
    rectangle.lineTo(0, y)
    rectangle.lineTo(0, 0)
    return rectangle
}

function inBox(p, b) {
    return ((p.x >= b.min.x) && (p.x <= b.max.x) && (p.z >= b.min.z) && (p.z <= b.max.z))
}

function faceCloseTo(face, objects, distance) {
    var normals = face.mesh.geometry.attributes.normal.array
    var positions = face.mesh.geometry.attributes.position.array
    var min = 320000
    var closest = null
    for (var i = 0; i < face.points.length; i++) {
        var origin = face.points[i].clone()
        var normal = face.normals[i].clone()

        //    origin.rotation.set(this.back.rotation.x, this.back.rotation.y, this.back.rotation.z);
        var raycaster = new THREE.Raycaster(origin, normal.clone().normalize())
        var collisionResults = raycaster.intersectObjects(objects);
        if (collisionResults.length > 0) {
            var c = 0
            if (collisionResults[c].object == plane) c++
                if (collisionResults.length > c) {
                    if (collisionResults[c].distance < distance &&
                        collisionResults[c].distance < min) {
                        min = collisionResults[c].distance
                        closest = collisionResults[c].object
                        console.log("Hit " + collisionResults[c].object.userData)

                        var geometry = new THREE.Geometry();
                        geometry.vertices.push(origin)
                        geometry.vertices.push(collisionResults[c].point)

                        var material = new THREE.LineBasicMaterial({ color: 0xff0000, opacity: 1, linewidth: 3 });
                        var lines = new THREE.Line(geometry, material)
                        scene.add(lines)
                    }
                }
        }
    }
    return { "min": min, "object": closest }
}

class Piece {
    constructor(origin, size, windex) {
        // length = z
        // height = y
        // width = x
        this.scene = null
        this.objects = []
        this.object = false
        this.origin = origin
        this.windex = windex
        this.group = new THREE.Group()
        this.size = size
        this.back = new Face(this, rectangle(size.x, size.y), origin, new THREE.Vector3(size.x, 0, 0), new THREE.Vector3(0, Math.PI, 0), WoodTypes[windex].sideGrain) // back
        this.front = new Face(this, rectangle(size.x, size.y), origin, new THREE.Vector3(0, 0, size.z), new THREE.Vector3(0, 0, 0), WoodTypes[windex].sideGrain) // front
        this.bottom = new Face(this, rectangle(size.x, size.z), origin, new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.PI / 2, 0, 0), WoodTypes[windex].topGrain) // bottom
        this.top = new Face(this, rectangle(size.x, size.z), origin, new THREE.Vector3(0, size.y, size.z), new THREE.Vector3(-Math.PI / 2, 0, 0), WoodTypes[windex].topGrain) // top
        this.left = new Face(this, rectangle(size.z, size.y), origin, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -Math.PI / 2, 0), WoodTypes[windex].endGrain) // left
        this.right = new Face(this, rectangle(size.z, size.y), origin, new THREE.Vector3(size.x, 0, size.z), new THREE.Vector3(0, Math.PI / 2, 0), WoodTypes[windex].endGrain) // right

        this.group.add(this.back.mesh)
        this.group.add(this.front.mesh)
        this.group.add(this.bottom.mesh)
        this.group.add(this.top.mesh)
        this.group.add(this.left.mesh)
        this.group.add(this.right.mesh)
    }

    highlight() {
        this.top.highlight()
        this.bottom.highlight()
        this.left.highlight()
        this.right.highlight()
        this.front.highlight()
        this.back.highlight()
    }
    unhighlight() {
        this.top.unhighlight()
        this.bottom.unhighlight()
        this.left.unhighlight()
        this.right.unhighlight()
        this.front.unhighlight()
        this.back.unhighlight()
    }
    position(origin) {
        this.top.position(origin)
        this.bottom.position(origin)
        this.left.position(origin)
        this.right.position(origin)
        this.front.position(origin)
        this.back.position(origin)
    }
    removeHit() {
        this.top.removeHit()
        this.bottom.removeHit()
        this.left.removeHit()
        this.right.removeHit()
        this.front.removeHit()
        this.back.removeHit()
    }
    addHit() {
        this.top.addHit()
        this.bottom.addHit()
        this.left.addHit()
        this.right.addHit()
        this.front.addHit()
        this.back.addHit()
    }
    addToScene(scene, objects, origin, object = true) {
        this.objects = objects
        this.scene = scene
        this.object = object
        this.origin = origin
        this.position(origin)

        if (object) {
            this.scene.add(this.group)
            this.addHit()
        }
    }

    removeFromScene() {
        this.removeHit()
        this.scene.remove(this.group)
    }
    clone() {
        var newPiece = new Piece(this.origin, this.size, this.windex)
        newPiece.group = new THREE.Group()
        newPiece.top = this.top.clone(newPiece)
        newPiece.bottom = this.bottom.clone(newPiece)
        newPiece.left = this.left.clone(newPiece)
        newPiece.right = this.right.clone(newPiece)
        newPiece.front = this.front.clone(newPiece)
        newPiece.back = this.back.clone(newPiece)
        newPiece.group.add(newPiece.back.mesh)
        newPiece.group.add(newPiece.front.mesh)
        newPiece.group.add(newPiece.bottom.mesh)
        newPiece.group.add(newPiece.top.mesh)
        newPiece.group.add(newPiece.left.mesh)
        newPiece.group.add(newPiece.right.mesh)
        return newPiece
    }
    canPlace(origin) {

        var opposite = new THREE.Vector3(origin.x + this.size.x, origin.y, origin.z + this.size.z)
        if (!(inBox(origin, gridGeometry.boundingBox) && inBox(opposite, gridGeometry.boundingBox))) return false

        return true
            // for every edge on every face, see it if intersects with a another mesh
            // if (this.back.intersects(objects)) return false;
    }
    closeTo(objects, distance) {
        var faces = [this.back, this.front, this.top, this.bottom, this.left, this.right]
        var hit = null;
        for (var i = 0; i < 6; i++) {
            hit = faceCloseTo(faces[i], objects, distance)
            if (hit.object != null) break
        }

        if (hit.object != null) return true
        return false
    }
}