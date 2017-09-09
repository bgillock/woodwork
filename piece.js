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
    constructor(scene, origin, size, object = true) {
        // length = z
        // height = y
        // width = x
        this.scene = scene
        this.group = new THREE.Group()
        this.origin = origin
        this.size = size
        this.object = object
        this.texture = new THREE.TextureLoader().load("textures/hardwood2_diffuse.jpg")
        this.back = new Face(this, rectangle(size.x, size.y), origin, new THREE.Vector3(size.x, 0, 0), new THREE.Vector3(0, Math.PI, 0), this.texture) // back
        this.front = new Face(this, rectangle(size.x, size.y), origin, new THREE.Vector3(0, 0, size.z), new THREE.Vector3(0, 0, 0), this.texture) // front
        this.bottom = new Face(this, rectangle(size.x, size.z), origin, new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.PI / 2, 0, 0), this.texture) // bottom
        this.top = new Face(this, rectangle(size.x, size.z), origin, new THREE.Vector3(0, size.y, size.z), new THREE.Vector3(-Math.PI / 2, 0, 0), this.texture) // top
        this.left = new Face(this, rectangle(size.z, size.y), origin, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -Math.PI / 2, 0), this.texture) // left
        this.right = new Face(this, rectangle(size.z, size.y), origin, new THREE.Vector3(size.x, 0, size.z), new THREE.Vector3(0, Math.PI / 2, 0), this.texture) // right

        this.group.add(this.back.mesh)
        this.group.add(this.front.mesh)
        this.group.add(this.bottom.mesh)
        this.group.add(this.top.mesh)
        this.group.add(this.left.mesh)
        this.group.add(this.right.mesh)
        if (object) {
            this.scene.add(this.group);
        }
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
    remove() {
        // scene.remove(this.group)
        this.top.remove()
        this.bottom.remove()
        this.left.remove()
        this.right.remove()
        this.front.remove()
        this.back.remove()
    }
    add() {
        // scene.remove(this.group)
        this.top.add()
        this.bottom.add()
        this.left.add()
        this.right.add()
        this.front.add()
        this.back.add()
    }
    realize() {
        this.object = true
        if (!object) {
            this.scene.add(this.group);
        }
    }
    clone() {
        return JSON.parse(JSON.stringify(this))
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