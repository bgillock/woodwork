function rectangle(x, y) {
    var rectangle = new THREE.Shape()
    rectangle.moveTo(0, 0)
    rectangle.lineTo(0, y)
    rectangle.lineTo(x, y)
    rectangle.lineTo(x, 0)
    rectangle.lineTo(0, 0)
    return rectangle
}

function getVertIntersectionPoints(A,B,objects) {
    var pointsOfIntersection = []
    var mathPlane = new THREE.Plane()
    var planePointA = new THREE.Vector3(), planePointB = new THREE.Vector3()
    var a = new THREE.Vector3(), b = new THREE.Vector3()
    planePointA.copy(A)
    planePointB.copy(B)
    var planePointC = new THREE.Vector3(B.x,B.y+100,B.z)
    mathPlane.setFromCoplanarPoints(planePointA, planePointB, planePointC)
    for (var o=0; o<objects.length; o++) {
        var points = objects[o].geometry.attributes.position
        for (var i=0;i<points.count-1; i++) {
            a.x = points.array[i*points.itemSize]
            a.y = points.array[i*points.itemSize+1]
            a.z = points.array[i*points.itemSize+2]
            b.x = points.array[(i+1)*points.itemSize]
            b.y = points.array[(i+1)*points.itemSize+1]
            b.z = points.array[(i+1)*points.itemSize+2]
            objects[o].localToWorld(a)
            objects[o].localToWorld(b)
            var line = new THREE.Line3(a, b)
            var pointOfIntersection = mathPlane.intersectLine(line)
            if (pointOfIntersection) {
                if (pointOfIntersection.x >= Math.min(A.x,B.x) && 
                    pointOfIntersection.x <= Math.max(A.x,B.x) &&
                    pointOfIntersection.z >= Math.min(A.z,B.z) && 
                    pointOfIntersection.z <= Math.max(A.z,B.z)) {
                    pointsOfIntersection.push(pointOfIntersection)
                }
            }
        }
    }
    return pointsOfIntersection
}

function cutGeometryXMin(face, x) {
    var count = face.geometry.attributes.position.count
    var psize = face.geometry.attributes.position.itemSize
    var usize = face.geometry.attributes.uv.itemSize
    var maxx = 0
    var maxu = 1
    for (var i = 0; i < count; i++) {
        if (face.geometry.attributes.position.array[i*psize] > maxx) {
            maxx = face.geometry.attributes.position.array[i*psize]
            maxu = face.geometry.attributes.uv.array[i*usize]
        }
    }
    for (var i = 0; i < count; i++) {
        if (face.geometry.attributes.position.array[i*psize] < x) {
            face.geometry.attributes.position.array[i*psize] = x
            var actualMax = maxx/maxu
            face.geometry.attributes.uv.array[i*usize] = face.geometry.attributes.position.array[i*psize]/actualMax
        }
    }
    face.geometry.verticesNeedUpdate = true
    face.updatePosition()
    face.geometry.attributes.position.needsUpdate = true
    face.geometry.attributes.uv.needsUpdate = true
}

function cutGeometryXMax(face, x) {
    var count = face.geometry.attributes.position.count
    var psize = face.geometry.attributes.position.itemSize
    var usize = face.geometry.attributes.uv.itemSize
    var maxx = 0
    var maxu = 1
    for (var i = 0; i < count; i++) {
        if (face.geometry.attributes.position.array[i*psize] > maxx) {
            maxx = face.geometry.attributes.position.array[i*psize]
            maxu = face.geometry.attributes.uv.array[i*usize]
        }
    }
    for (var i = 0; i < count; i++) {
        if (face.geometry.attributes.position.array[i*psize] > x) {
            face.geometry.attributes.position.array[i*psize] = x
            var actualMax = maxx/maxu
            face.geometry.attributes.uv.array[i*usize] = face.geometry.attributes.position.array[i*psize]/actualMax
        }
    }
    face.geometry.verticesNeedUpdate = true
    face.updatePosition()
    face.geometry.attributes.position.needsUpdate = true
    face.geometry.attributes.uv.needsUpdate = true
}

function cutGeometryXMinAngle(face, a) {
    var count = face.geometry.attributes.position.count
    var psize = face.geometry.attributes.position.itemSize
    var usize = face.geometry.attributes.uv.itemSize
    var maxy = face.geometry.attributes.position.array[2*psize + 1]
    var maxx = face.geometry.attributes.position.array[3*psize]
    var maxu = face.geometry.attributes.uv.array[3*usize]
 
    // a = angle of cut (from length axis, 90 = straight cut)
    face.geometry.attributes.position.array[1*psize] = (maxy / Math.tan(a))
    var actualMax = maxx/maxu
    face.geometry.attributes.uv.array[1*usize] = face.geometry.attributes.position.array[1*psize]/actualMax
    face.geometry.verticesNeedUpdate = true
    face.updatePosition()
    face.geometry.attributes.position.needsUpdate = true
    face.geometry.attributes.uv.needsUpdate = true
}

function cutGeometryXMaxAngle(face, a) {

    var count = face.geometry.attributes.position.count
    var psize = face.geometry.attributes.position.itemSize
    var usize = face.geometry.attributes.uv.itemSize
    var maxy = face.geometry.attributes.position.array[2*psize + 1]
    var maxx = face.geometry.attributes.position.array[3*psize]
    var maxu = face.geometry.attributes.uv.array[3*usize]

    // a = angle of cut (from length axis, 90 = straight cut)
    face.geometry.attributes.position.array[2*psize] = maxx - (maxy / Math.tan(a))
    var actualMax = maxx/maxu
    face.geometry.attributes.uv.array[2*usize] = face.geometry.attributes.position.array[2*psize]/actualMax
    face.geometry.verticesNeedUpdate = true
    face.updatePosition()
    face.geometry.attributes.position.needsUpdate = true
    face.geometry.attributes.uv.needsUpdate = true
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
            hit = faces[i].closeTo(objects, distance)
            if (hit != null) break
        }

        if (hit != null) return hit
        return false
    }

    onTop(objects,distance){
        var faces = [this.back, this.front, this.top, this.bottom, this.left, this.right]
        var max = 0
        var highest = null
        for (var f=0; f<faces.length; f++) {
            for (var p=0; p<faces[f].points.length-1; p++) {
                var intersectPoints = getVertIntersectionPoints(faces[f].points[p],faces[f].points[p+1],objects)
                for (var i=0; i<intersectPoints.length; i++) {
                    if (intersectPoints[i].y > max) {
                        max = intersectPoints[i].y
                        highest = intersectPoints[i]
                    }
                }
            }
        }
        return highest
    }
}