 function getFaceBox(intersect) {
     var box = new THREE.Geometry();
     if (Math.abs(intersect.face.normal.z) == 1) {
         var facesPoints = []

         for (var i = 0; i < intersect.object.geometry.faces.length; i++) {
             if (intersect.object.geometry.faces[i].normal == intersect.face.normal) {
                 facesPoints.push(intersect.object.geometry.vertices[intersect.object.geometry.faces[i].a])
                 facesPoints.push(intersect.object.geometry.vertices[intersect.object.geometry.faces[i].b])
                 facesPoints.push(intersect.object.geometry.vertices[intersect.object.geometry.faces[i].c])
             }
         }
         var bbox = new THREE.Box3()
         bbox.setFromPoints(facesPoints)

         box.vertices.push(new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z))
         box.vertices.push(new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.min.z))
         box.vertices.push(new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.min.z))
         box.vertices.push(new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.min.z))
         box.vertices.push(new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z))
     }
     if (Math.abs(intersect.face.normal.y) == 1) {
         var facesPoints = []

         for (var i = 0; i < intersect.object.geometry.faces.length; i++) {
             if (intersect.object.geometry.faces[i].normal == intersect.face.normal) {
                 facesPoints.push(intersect.object.geometry.vertices[intersect.object.geometry.faces[i].a])
                 facesPoints.push(intersect.object.geometry.vertices[intersect.object.geometry.faces[i].b])
                 facesPoints.push(intersect.object.geometry.vertices[intersect.object.geometry.faces[i].c])
             }
         }
         var bbox = new THREE.Box3()
         bbox.setFromPoints(facesPoints)

         box.vertices.push(new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z))
         box.vertices.push(new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.min.z))
         box.vertices.push(new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.max.z))
         box.vertices.push(new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.max.z))
         box.vertices.push(new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z))
     }
     if (Math.abs(intersect.face.normal.x) == 1) {
         var facesPoints = []

         for (var i = 0; i < intersect.object.geometry.faces.length; i++) {
             if (intersect.object.geometry.faces[i].normal == intersect.face.normal) {
                 facesPoints.push(intersect.object.geometry.vertices[intersect.object.geometry.faces[i].a])
                 facesPoints.push(intersect.object.geometry.vertices[intersect.object.geometry.faces[i].b])
                 facesPoints.push(intersect.object.geometry.vertices[intersect.object.geometry.faces[i].c])
             }
         }
         var bbox = new THREE.Box3()
         bbox.setFromPoints(facesPoints)

         box.vertices.push(new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z))
         box.vertices.push(new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.max.z))
         box.vertices.push(new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.max.z))
         box.vertices.push(new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.min.z))
         box.vertices.push(new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z))
     }
     return box
 }