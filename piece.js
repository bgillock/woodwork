 function rectangle(x, y) {
    var rectangle = new THREE.Shape()
    rectangle.moveTo(0, 0)
    rectangle.lineTo(x, 0)
    rectangle.lineTo(x, y)
    rectangle.lineTo(0, y)
    rectangle.lineTo(0, 0)
    return rectangle
}

class Piece {
    constructor(origin, size, object=true) {
        // length = z
        // height = y
        // width = x
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
        scene.add(this.group);
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
    remove () {
        scene.remove(this.group)
        this.top.remove()
        this.bottom.remove()
        this.left.remove()
        this.right.remove()
        this.front.remove()
        this.back.remove()    
    }
    
}