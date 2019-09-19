function rectangle(x, y) {
    var rectangle = new THREE.Shape()
    rectangle.moveTo(0, 0)
    rectangle.lineTo(0, y)
    rectangle.lineTo(x, y)
    rectangle.lineTo(x, 0)
    rectangle.lineTo(0, 0)
    return rectangle
}

function getVertIntersectionPoints(A, B, objects) {
    var pointsOfIntersection = []
    var mathPlane = new THREE.Plane()
    var planePointA = new THREE.Vector3(),
        planePointB = new THREE.Vector3()
    var a = new THREE.Vector3(),
        b = new THREE.Vector3()
    planePointA.copy(A)
    planePointB.copy(B)
    var planePointC = new THREE.Vector3(B.x, B.y + 100, B.z)
    mathPlane.setFromCoplanarPoints(planePointA, planePointB, planePointC)
    for (var o = 0; o < objects.length; o++) {
        var points = objects[o].geometry.attributes.position
        for (var i = 0; i < points.count - 1; i++) {
            a.x = points.array[i * points.itemSize]
            a.y = points.array[i * points.itemSize + 1]
            a.z = points.array[i * points.itemSize + 2]
            b.x = points.array[(i + 1) * points.itemSize]
            b.y = points.array[(i + 1) * points.itemSize + 1]
            b.z = points.array[(i + 1) * points.itemSize + 2]
            objects[o].localToWorld(a)
            objects[o].localToWorld(b)
            var line = new THREE.Line3(a, b)
            var pointOfIntersection = mathPlane.intersectLine(line)
            if (pointOfIntersection) {
                if (pointOfIntersection.x >= Math.min(A.x, B.x) &&
                    pointOfIntersection.x <= Math.max(A.x, B.x) &&
                    pointOfIntersection.z >= Math.min(A.z, B.z) &&
                    pointOfIntersection.z <= Math.max(A.z, B.z)) {
                    pointsOfIntersection.push(pointOfIntersection)
                }
            }
        }
    }
    return pointsOfIntersection
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
function getThreeBoxGeometry(size) {
    return new THREE.BoxGeometry(size.x, size.y, size.z);    
}
function linearInterp(a,b,c,d,e){ return d+((e-d)*((c-a)/(b-a)))}
function minMax(min,max,data) {
  min.X = 10000
  max.X = -10000
  min.Y = 10000
  max.Y = -10000
  min.Z = 10000
  max.Z = -10000
  for (var i=0;i<data.length;i++) {
    if (data[i].x < min.X) min.X = data[i].x
    if (data[i].x > max.X) max.X = data[i].x   
    if (data[i].y < min.Y) min.Y = data[i].y
    if (data[i].y > max.Y) max.Y = data[i].y 
    if (data[i].z < min.Z) min.Z = data[i].z
    if (data[i].z > max.Z) max.Z = data[i].z 
  }
}
function assignMaterialToFaces(mesh,min,max,grain,endgrain){
    if (mesh.faceVertexUvs[0].length != mesh.faces.length) return
    
    for (var i=0;i<mesh.faceVertexUvs[0].length; i++) {
      if ((mesh.faces[i].normal.x < -0.5) || 
          (mesh.faces[i].normal.x > 0.5)) {
            mesh.faces[i].materialIndex = endgrain
          mesh.faceVertexUvs[0][i][0].x = linearInterp(min.Z,max.Z,mesh.vertices[mesh.faces[i].a].z,0.0,1.0)  
          mesh.faceVertexUvs[0][i][0].y = linearInterp(min.Y,max.Y,mesh.vertices[mesh.faces[i].a].y,0.0,1.0)
          mesh.faceVertexUvs[0][i][1].x = linearInterp(min.Z,max.Z,mesh.vertices[mesh.faces[i].b].z,0.0,1.0)  
          mesh.faceVertexUvs[0][i][1].y = linearInterp(min.Y,max.Y,mesh.vertices[mesh.faces[i].b].y,0.0,1.0)
          mesh.faceVertexUvs[0][i][2].x = linearInterp(min.Z,max.Z,mesh.vertices[mesh.faces[i].c].z,0.0,1.0)  
          mesh.faceVertexUvs[0][i][2].y = linearInterp(min.Y,max.Y,mesh.vertices[mesh.faces[i].c].y,0.0,1.0)     
        }
        else if ((mesh.faces[i].normal.y < -0.5) || 
          (mesh.faces[i].normal.y > 0.5)) {
            mesh.faces[i].materialIndex = grain
          mesh.faceVertexUvs[0][i][0].x = linearInterp(min.X,max.X,mesh.vertices[mesh.faces[i].a].x,0.0,1.0)  
          mesh.faceVertexUvs[0][i][0].y = linearInterp(min.Z,max.Z,mesh.vertices[mesh.faces[i].a].z,0.0,1.0)
          mesh.faceVertexUvs[0][i][1].x = linearInterp(min.X,max.X,mesh.vertices[mesh.faces[i].b].x,0.0,1.0)  
          mesh.faceVertexUvs[0][i][1].y = linearInterp(min.Z,max.Z,mesh.vertices[mesh.faces[i].b].z,0.0,1.0)
          mesh.faceVertexUvs[0][i][2].x = linearInterp(min.X,max.X,mesh.vertices[mesh.faces[i].c].x,0.0,1.0)  
          mesh.faceVertexUvs[0][i][2].y = linearInterp(min.Z,max.Z,mesh.vertices[mesh.faces[i].c].z,0.0,1.0)     
        } else {
          mesh.faces[i].materialIndex = grain
          mesh.faceVertexUvs[0][i][0].x = linearInterp(min.X,max.X,mesh.vertices[mesh.faces[i].a].x,0.0,1.0)  
          mesh.faceVertexUvs[0][i][0].y = linearInterp(min.Y,max.Y,mesh.vertices[mesh.faces[i].a].y,0.0,1.0)
          mesh.faceVertexUvs[0][i][1].x = linearInterp(min.X,max.X,mesh.vertices[mesh.faces[i].b].x,0.0,1.0)  
          mesh.faceVertexUvs[0][i][1].y = linearInterp(min.Y,max.Y,mesh.vertices[mesh.faces[i].b].y,0.0,1.0)
          mesh.faceVertexUvs[0][i][2].x = linearInterp(min.X,max.X,mesh.vertices[mesh.faces[i].c].x,0.0,1.0)  
          mesh.faceVertexUvs[0][i][2].y = linearInterp(min.Y,max.Y,mesh.vertices[mesh.faces[i].c].y,0.0,1.0)     
        }
    }
}
function assignColorToSides(mesh){
    if (mesh.faceVertexUvs[0].length != mesh.faces.length) return
    for (var i=0;i<mesh.faceVertexUvs[0].length; i++) {
      if (mesh.faces[i].normal.x < -0.5) {
        mesh.faces[i].materialIndex = 2;
      } else if (mesh.faces[i].normal.x > 0.5) {
        mesh.faces[i].materialIndex = 3; 
      } else if (mesh.faces[i].normal.y < -0.5) {
        mesh.faces[i].materialIndex = 4;
      } else if (mesh.faces[i].normal.y > 0.5) {
        mesh.faces[i].materialIndex = 5;
      } else if (mesh.faces[i].normal.z < 0.5) {
        mesh.faces[i].materialIndex = 6;
      } else {
        mesh.faces[i].materialIndex = 7;
      }
    }
}

class MeshPiece {
    constructor(geometry, windex) {
        // length = z
        // height = y
        // width = x
        this.scene = null
        this.objects = []
        this.origin = new THREE.Vector3()
        this.windex = windex
        this.texture1 = new THREE.TextureLoader().load( wtypes[windex].topGrain, (texture) => {
            this.mTopGrain = new THREE.MeshBasicMaterial( { map: this.texture1 } );
        });
        this.texture2 = new THREE.TextureLoader().load( wtypes[windex].endGrain);
        this.mTopGrain = new THREE.MeshBasicMaterial( { map: this.texture1 } );
        this.mEndGrain = new THREE.MeshBasicMaterial( { map: this.texture2 } );
        this.materials = [this.mTopGrain, this.mEndGrain]

        this.movegroup = new THREE.Mesh( geometry, this.materials );
        this.movegroup.geometry.computeVertexNormals();

        var min = new THREE.Vector3 
        var max = new THREE.Vector3
        minMax(min,max,this.movegroup.geometry.vertices)
        assignMaterialToFaces(this.movegroup.geometry,min,max,0,1)
    }
    replaceMesh(mesh) {
        this.movegroup.copy(mesh)
    }
    highlight() {
        this.movegroup.material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            opacity: 0.25,
            transparent: true,
            depthTest: true
        });
    }
    unhighlight() {
        var min = new THREE.Vector3 
        var max = new THREE.Vector3
        minMax(min,max,this.movegroup.geometry.vertices)
        assignMaterialToFaces(this.movegroup.geometry,min,max,0,1)
    }
    position(origin) {
        this.movegroup.position.copy(origin)
    }
    removeHit() {
        this.objects.splice(this.objects.indexOf(this.movegroup), 1);
    }
    addHit() {
        if (this.objects.indexOf(this.movegroup) < 0) {
            this.objects.push(this.movegroup)
        }
    }
    expandX(size){
        if (size > 0) {
            // find min vertices
            var minX = 99999
            var mesh = this.movegroup.geometry
            for (var v=0;v<mesh.vertices.length;v++) {
                if (mesh.vertices[v].x < minX) minX = mesh.vertices[v].x
            }
            for (var v=0;v<mesh.vertices.length;v++) {
                if (mesh.vertices[v].x > minX) mesh.vertices[v].x = minX + size
            }
            mesh.verticesNeedUpdate = true
        }
    }
    aVerticeinThisSubMesh(s,f) {
        var mesh = this.movegroup.geometry
        if ((mesh.vertices[mesh.faces[f].a].subMesh == 0) &&
            ((mesh.vertices[mesh.faces[f].b].subMesh == s) ||
             (mesh.vertices[mesh.faces[f].c].subMesh == s))) return true
        if ((mesh.vertices[mesh.faces[f].b].subMesh == 0) &&
             ((mesh.vertices[mesh.faces[f].a].subMesh == s) ||
              (mesh.vertices[mesh.faces[f].c].subMesh == s))) return true
        if ((mesh.vertices[mesh.faces[f].c].subMesh == 0) &&
              ((mesh.vertices[mesh.faces[f].a].subMesh == s) ||
               (mesh.vertices[mesh.faces[f].b].subMesh == s))) return true
        return false                       
    }
    setSubMesh(s,thisFace) {
        var mesh = this.movegroup.geometry
        mesh.faces[thisFace].subMesh = s
        mesh.vertices[mesh.faces[thisFace].a].subMesh = s
        mesh.vertices[mesh.faces[thisFace].b].subMesh = s
        mesh.vertices[mesh.faces[thisFace].c].subMesh = s
        for (var f=0;f<mesh.faces.length; f++) {
            if (this.aVerticeinThisSubMesh(s,f)) {
                this.setSubMesh(s,f)
                break
            }
        }
    }
    newVerticeIndex(vertices,i) {
        v = vertices.indexOf(i)
    }

    getSubMeshes() {
        // Split mesh into multiple groups of connected vertices.
        var subMeshes = []
        var subMesh = 0
        var mesh = this.movegroup.geometry
        for (var i=0;i<mesh.vertices.length; i++) {
            mesh.vertices[i].subMesh = 0
        }
        for (var i=0;i<mesh.faces.length; i++) {
            if (mesh.vertices[mesh.faces[i].a].subMesh == 0) {
                subMesh++
                this.setSubMesh(subMesh,i)
            }
        }
        for (var s=1; s<=subMesh;s++) {
            var vertices = []
            var geom = new THREE.Geometry();
            for (var f=0;f<mesh.faces.length;f++) {
                if (mesh.faces[f].subMesh == s) {
                    var va = vertices.indexOf(mesh.faces[f].a)
                    if (va == -1) {
                        geom.vertices.push(new THREE.Vector3(mesh.vertices[mesh.faces[f].a].x,
                                                        mesh.vertices[mesh.faces[f].a].y,
                                                        mesh.vertices[mesh.faces[f].a].z))
                        vertices.push(mesh.faces[f].a)
                        va = vertices.length - 1    
                    }
                    var vb = vertices.indexOf(mesh.faces[f].b)
                    if (vb == -1) {
                        geom.vertices.push(new THREE.Vector3(mesh.vertices[mesh.faces[f].b].x,
                                                        mesh.vertices[mesh.faces[f].b].y,
                                                        mesh.vertices[mesh.faces[f].b].z))
                        vertices.push(mesh.faces[f].b)
                        vb = vertices.length - 1    
                    }
                    var vc = vertices.indexOf(mesh.faces[f].c)
                    if (vc == -1) {
                        geom.vertices.push(new THREE.Vector3(mesh.vertices[mesh.faces[f].c].x,
                                                        mesh.vertices[mesh.faces[f].c].y,
                                                        mesh.vertices[mesh.faces[f].c].z))
                        vertices.push(mesh.faces[f].c)
                        vc = vertices.length - 1    
                    }

                    geom.faces.push(new THREE.Face3(va,vb,vc))
                }
            }
            geom.computeVertexNormals()
            var newMesh = new THREE.Mesh( geom, new THREE.MeshBasicMaterial())
            subMeshes.push(newMesh)
            var min = new THREE.Vector3 
            var max = new THREE.Vector3
            minMax(min,max,newMesh.geometry.vertices)
            assignMaterialToFaces(newMesh.geometry,min,max,0,1)
        }
        return subMeshes
    }
    addToScene(scene, objects) {
        this.objects = objects
        this.scene = scene
            // this.position(origin)
        this.scene.add(this.movegroup)
        this.addHit()
    }
    getCornerPoint(id, corner) {
        var mesh = null
        if (this.top.mesh.id == id) mesh = this.top.mesh
        if (this.bottom.mesh.id == id) mesh = this.bottom.mesh
        if (this.left.mesh.id == id) mesh = this.left.mesh
        if (this.right.mesh.id == id) mesh = this.right.mesh
        if (this.front.mesh.id == id) mesh = this.front.mesh
        if (this.back.mesh.id == id) mesh = this.back.mesh
        if (mesh != null) {
            var c = new THREE.Vector3(mesh.geometry.attributes.position.array[corner * 3],
                mesh.geometry.attributes.position.array[corner * 3 + 1],
                mesh.geometry.attributes.position.array[corner * 3 + 2])
            c.add(mesh.position)
            return c
        }
        return null
    }
    getCornerNormal(id, corner) {
        var mesh = null
        if (this.top.mesh.id == id) mesh = this.top
        if (this.bottom.mesh.id == id) mesh = this.bottom
        if (this.left.mesh.id == id) mesh = this.left
        if (this.right.mesh.id == id) mesh = this.right
        if (this.front.mesh.id == id) mesh = this.front
        if (this.back.mesh.id == id) mesh = this.back
        if (mesh != null) {
            var n = mesh.normals[corner].clone()
            return n
        }
        return null
    }
    changeOrigin(origin) {
        var shift = origin.clone()
        shift.sub(this.origin)
        for (var v=0; v<this.movegroup.geometry.vertices.length; v++) {
            this.movegroup.geometry.vertices[v].sub(shift)
        }
        this.origin = origin.clone()
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
        var newPiece = new MeshPiece(this.size, this.windex)
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

                this.movegroup.remove(this.right.mesh)
                var rotation = this.right.rotation.clone()
                rotation.x = -(Math.PI / 2 - angle) // other side of 90
                rotation.order = 'YXZ'
                this.right = new Face(this, new THREE.ShapeBufferGeometry(rectangle(size.z, size.y / Math.sin(angle))),
                        this.right.origin.clone(),
                        rotation,
                        this.right.grain) // right
                this.movegroup.add(this.right.mesh)
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


                this.movegroup.remove(this.left.mesh)
                var rotation = this.left.rotation.clone()
                rotation.x = -(Math.PI / 2 - angle) // other side of 90
                rotation.order = 'YXZ'
                this.left = new Face(this, new THREE.ShapeBufferGeometry(rectangle(size.z, size.y / Math.sin(angle))),
                        this.left.origin.clone(),
                        rotation,
                        this.left.grain) // left
                this.movegroup.add(this.left.mesh)
                break
            
            case SIDE.TOPRIGHT:
                var size = this.size.clone()
                cutGeometryXMax(this.back, size.x - (size.z / Math.tan(angle)))
                this.back.geometry.verticesNeedUpdate = true
                this.back.updatePosition()

                cutGeometryXMaxAngle(this.top, angle)
                this.top.geometry.verticesNeedUpdate = true
                this.top.updatePosition()
/*
                cutGeometryXMinAngle(this.bottom, angle)
                this.bottom.geometry.verticesNeedUpdate = true
                this.bottom.updatePosition()

                this.movegroup.remove(this.right.mesh)
                var rotation = this.right.rotation.clone()
                rotation.x = -(Math.PI / 2 - angle) // other side of 90
                rotation.order = 'YXZ'
                this.right = new Face(this, new THREE.ShapeBufferGeometry(rectangle(size.z, size.y / Math.sin(angle))),
                        this.right.origin.clone(),
                        rotation,
                        this.right.grain) // right
                this.movegroup.add(this.right.mesh)
                */
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

        return hit
    }

    placeOnTop(objects, distance, point) {
        var faces = [this.back, this.front, this.top, this.bottom, this.left, this.right]
        var max = 0
        var highest = null
        for (var f = 0; f < faces.length; f++) {
            // Shoot planes down from all edges
            for (var p = 0; p < faces[f].points.length - 1; p++) {
                console.log(faces[f].points[p])
                var intersectPoints = getVertIntersectionPoints(faces[f].points[p], faces[f].points[p + 1], objects)
                for (var i = 0; i < intersectPoints.length; i++) {
                    if (intersectPoints[i].y > max) {
                        max = intersectPoints[i].y
                        highest = intersectPoints[i]
                    }
                }
            }
            // If piece is smaller the one below, shoot rays down from all corners
            var cornerHit = faces[f].onTop(objects, distance)
            if (cornerHit != null) {
                if (cornerHit.point.y > max) {
                    max = cornerHit.point.y
                    highest = cornerHit.point
                }
            }
        }
        var theseObjects = []
        theseObjects.push(this.top.mesh)
        theseObjects.push(this.bottom.mesh)
        theseObjects.push(this.left.mesh)
        theseObjects.push(this.right.mesh)
        theseObjects.push(this.front.mesh)
        theseObjects.push(this.back.mesh)
        for (var o = 0; o < objects.length; o++) {
            var bbox = new THREE.Box3().setFromObject(objects[o])
            if (bbox.max.y > max) {
                // use bbox points to intersect in y to this piece
                var points = []
                points.push(new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.min.z))
                points.push(new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.max.z))
                points.push(new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.max.z))
                points.push(new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.min.z))
                for (var i = 0; i < points.length; i++) {
                    var origin = points[i].clone()
                    origin.y += distance / 2 // Start for far above, but half the distance
                    var normal = new THREE.Vector3()
                    normal.y = -1

                    //    origin.rotation.set(this.back.rotation.x, this.back.rotation.y, this.back.rotation.z);
                    var raycaster = new THREE.Raycaster(origin, normal.clone().normalize())
                    var collisionResults = raycaster.intersectObjects(theseObjects)
                    if (collisionResults.length > 0) {
                        var c = 0
                        if (collisionResults[c].object == plane) { c++ }
                        if (collisionResults.length > c) {
                            if (bbox.max.y > max) {
                                highest = points[i]
                                max = bbox.max.y
                                    // console.log("cast from move piece=", max)
                            }
                        }
                    }
                }
            }
        }
        var bbox = new THREE.Box3().setFromObject(this.movegroup)
        if (highest != null) {
            point.y = highest.y + (bbox.max.y - bbox.min.y) / 2
        } else {
            point.y = (bbox.max.y - bbox.min.y) / 2
        }
        this.position(point)
    }
}