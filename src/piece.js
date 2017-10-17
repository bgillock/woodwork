function rectangle(x, y) {
    var rectangle = new THREE.Shape()
    rectangle.moveTo(0, 0)
    rectangle.lineTo(0, y)
    rectangle.lineTo(x, y)
    rectangle.lineTo(x, 0)
    rectangle.lineTo(0, 0)
    return rectangle
}

function cutShapeEnd(x, y, a) {
    // x = length of board
    // y = height of board
    // a = angle of cut (from length axis, 90 = straight cut)
    var shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(0, y)
    shape.lineTo(x - (y / Math.tan(a)), y)
    shape.lineTo(x, 0)
    shape.lineTo(0, 0)
    return shape
}

function cutShapeStart(x, y, a) {
    // x = length of board
    // y = height of board
    // a = angle of cut (from length axis, 90 = straight cut)
    var shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(0 + (y / Math.tan(a)), y)
    shape.lineTo(x, y)
    shape.lineTo(x, 0)
    shape.lineTo(0, 0)
    return shape
}

function cutGeometryXMin(face, x) {
    for (var i = 0; i < face.geometry.attributes.position.length; i += 3) {
        if (face.geometry.attributes.position.array[i] < x) {
            face.geometry.attributes.position.array[i] = x;
        }
    }
    face.geometry.verticesNeedUpdate = true
    face.updatePosition()
    face.geometry.attributes.position.needsUpdate = true
}

function cutGeometryXMax(face, x) {
    for (var i = 0; i < face.geometry.attributes.position.length; i += 3) {
        if (face.geometry.attributes.position.array[i] > x) {
            face.geometry.attributes.position.array[i] = x;
        }
    }
    face.geometry.verticesNeedUpdate = true
    face.updatePosition()
    face.geometry.attributes.position.needsUpdate = true

}

function cutGeometryXMinAngle(face, a) {
    var maxy = 0;
    for (var i = 0; i < face.geometry.attributes.position.length; i += 3) {
        if (face.geometry.attributes.position.array[i + 1] > maxy) {
            maxy = face.geometry.attributes.position.array[i + 1]
        }
    }
    // a = angle of cut (from length axis, 90 = straight cut)
    face.geometry.attributes.position.array[3] = (maxy / Math.tan(a))
    face.geometry.verticesNeedUpdate = true
    face.updatePosition()
    face.geometry.attributes.position.needsUpdate = true
}

function cutGeometryXMaxAngle(face, a) {
    var maxy = 0
    var maxx = 0
    for (var i = 0; i < face.geometry.attributes.position.length; i += 3) {
        if (face.geometry.attributes.position.array[i + 1] > maxy) {
            maxy = face.geometry.attributes.position.array[i + 1]
        }
        if (face.geometry.attributes.position.array[i] > maxx) {
            maxx = face.geometry.attributes.position.array[i]
        }
    }
    // a = angle of cut (from length axis, 90 = straight cut)
    face.geometry.attributes.position.array[6] = maxx - (maxy / Math.tan(a))
    face.geometry.verticesNeedUpdate = true
    face.updatePosition()
    face.geometry.attributes.position.needsUpdate = true
}

function inBox(p, b) {
    return ((p.x >= b.min.x) && (p.x <= b.max.x) && (p.z >= b.min.z) && (p.z <= b.max.z))
}
var SIDE = {
    TOPLEFT: 0,
    TOPRIGHT: 1,
    FRONTLEFT: 2,
    FRONTRIGHT: 3,
    RIGHTRIGHT: 4,
    RIGHTLEFT: 5
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
            if (collisionResults[c].object == plane) { c++ }
            if (collisionResults.length > c) {
                if (collisionResults[c].distance < distance &&
                    collisionResults[c].distance < min) {
                    min = collisionResults[c].distance
                    closest = collisionResults[c].object
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
        this.back = new Face(this, new THREE.ShapeBufferGeometry(rectangle(size.x, size.y)),
                new THREE.Vector3(size.x / 2, -size.y / 2, -size.z / 2),
                new THREE.Euler(0, Math.PI, 0, 'XYZ'),
                WoodTypes[windex].sideGrain) // back
        this.front = new Face(this, new THREE.ShapeBufferGeometry(rectangle(size.x, size.y)),
                new THREE.Vector3(-size.x / 2, -size.y / 2, size.z / 2),
                new THREE.Euler(0, 0, 0, 'XYZ'),
                WoodTypes[windex].sideGrain) // front
        this.bottom = new Face(this, new THREE.ShapeBufferGeometry(rectangle(size.x, size.z)),
                new THREE.Vector3(-size.x / 2, -size.y / 2, -size.z / 2),
                new THREE.Euler(Math.PI / 2, 0, 0, 'XYZ'),
                WoodTypes[windex].topGrain) // bottom
        this.top = new Face(this, new THREE.ShapeBufferGeometry(rectangle(size.x, size.z)),
                new THREE.Vector3(-size.x / 2, size.y / 2, size.z / 2),
                new THREE.Euler(-Math.PI / 2, 0, 0, 'XYZ'),
                WoodTypes[windex].topGrain) // top
        this.left = new Face(this, new THREE.ShapeBufferGeometry(rectangle(size.z, size.y)),
                new THREE.Vector3(-size.x / 2, -size.y / 2, -size.z / 2),
                new THREE.Euler(0, -Math.PI / 2, 0, 'XYZ'),
                WoodTypes[windex].endGrain) // left
        this.right = new Face(this, new THREE.ShapeBufferGeometry(rectangle(size.z, size.y)),
                new THREE.Vector3(size.x / 2, -size.y / 2, size.z / 2),
                new THREE.Euler(0, Math.PI / 2, 0, 'XYZ'),
                WoodTypes[windex].endGrain) // right

        this.group.add(this.back.mesh)
        this.group.add(this.front.mesh)
        this.group.add(this.bottom.mesh)
        this.group.add(this.top.mesh)
        this.group.add(this.left.mesh)
        this.group.add(this.right.mesh)
            //this.group.position.copy(origin)
        this.movegroup = new THREE.Group()
        this.movegroup.add(this.group)
        this.movegroup.userData = this
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
        this.movegroup.position.copy(origin)
        this.top.updatePosition()
        this.bottom.updatePosition()
        this.left.updatePosition()
        this.right.updatePosition()
        this.front.updatePosition()
        this.back.updatePosition()
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
            this.scene.add(this.movegroup)
            this.addHit()
        }
    }
    highlightFace(id) {
        if (this.top.mesh.id == id) this.top.highlight()
        if (this.bottom.mesh.id == id) this.bottom.highlight()
        if (this.left.mesh.id == id) this.left.highlight()
        if (this.right.mesh.id == id) this.right.highlight()
        if (this.front.mesh.id == id) this.front.highlight()
        if (this.back.mesh.id == id) this.back.highlight()
    }
    unhighlightFace(id) {
        if (this.top.mesh.id == id) this.top.unhighlight()
        if (this.bottom.mesh.id == id) this.bottom.unhighlight()
        if (this.left.mesh.id == id) this.left.unhighlight()
        if (this.right.mesh.id == id) this.right.unhighlight()
        if (this.front.mesh.id == id) this.front.unhighlight()
        if (this.back.mesh.id == id) this.back.unhighlight()
    }
    removeFromScene() {
        this.removeHit()
        this.scene.remove(this.movegroup)
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
        newPiece.movegroup = new THREE.Group()
        newPiece.movegroup.add(newPiece.group)
        newPiece.movegroup.userData = newPiece
        return newPiece
    }
    canPlace(origin) {

        //    var opposite = new THREE.Vector3(origin.x + this.size.x, origin.y, origin.z + this.size.z)
        //    if (!(inBox(origin, gridGeometry.boundingBox) && inBox(opposite, gridGeometry.boundingBox))) return false

        return true
            // for every edge on every face, see it if intersects with a another mesh
            // if (this.back.intersects(objects)) return false;
    }
    cut(side, angle) {
        switch (side) {
            case SIDE.FRONTRIGHT:
                var size = this.size.clone()
                cutGeometryXMax(this.top, size.x - (size.y / Math.tan(angle)))
                this.top.geometry.verticesNeedUpdate = true
                this.top.updatePosition()

                cutGeometryXMaxAngle(this.front, angle)
                this.front.geometry.verticesNeedUpdate = true
                this.front.updatePosition()

                cutGeometryXMinAngle(this.back, angle)
                this.back.geometry.verticesNeedUpdate = true
                this.back.updatePosition()

                this.group.remove(this.right.mesh)
                var rotation = this.right.rotation.clone()
                rotation.x = -(Math.PI / 2 - angle) // other side of 90
                rotation.order = 'YXZ'
                this.right = new Face(this, new THREE.ShapeBufferGeometry(rectangle(size.z, size.y / Math.sin(angle))),
                        this.right.origin.clone(),
                        rotation,
                        this.right.grain) // right
                this.group.add(this.right.mesh)
                break

            case SIDE.FRONTLEFT:
                var size = this.size.clone()
                cutGeometryXMin(this.top, (size.y / Math.tan(angle)))
                this.top.geometry.verticesNeedUpdate = true
                this.top.updatePosition()

                cutGeometryXMinAngle(this.front, angle)
                this.front.geometry.verticesNeedUpdate = true
                this.front.updatePosition()

                cutGeometryXMaxAngle(this.back, angle)
                this.back.geometry.verticesNeedUpdate = true
                this.back.updatePosition()


                this.group.remove(this.left.mesh)
                var rotation = this.left.rotation.clone()
                rotation.x = -(Math.PI / 2 - angle) // other side of 90
                rotation.order = 'YXZ'
                this.left = new Face(this, new THREE.ShapeBufferGeometry(rectangle(size.z, size.y / Math.sin(angle))),
                        this.left.origin.clone(),
                        rotation,
                        this.left.grain) // left
                this.group.add(this.left.mesh)
                break

        }
    }

    closeTo(objects, distance) {
        var faces = [this.back, this.front, this.top, this.bottom, this.left, this.right]
        var hit = null;
        for (var i = 0; i < 6; i++) {
            hit = faceCloseTo(faces[i], objects, distance)
            if (hit.object != null) break
        }

        if (hit.object != null) return hit
        return false
    }
}