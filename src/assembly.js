var assembly;
var STATE = {
    NONE: -1,
    CAMERA: 0,
    SELECT: 1,
    MOVE: 2
}
var state = STATE.NONE
var assemblyCamera, assemblyScene, assemblyRenderer, assemblyControls
var originalPiece = null
var grabDelta = null
var closestHit = null

function initAssemblyGrid(size) {
    // grid
    gridHelper = new MyGridHelper(size, 100, 10)
    assemblyScene.add(gridHelper)
        //
    raycaster = new THREE.Raycaster()
    raycaster.linePrecision = 1;
    mouse = new THREE.Vector2()
    gridGeometry = new THREE.PlaneBufferGeometry(size, size)
    gridGeometry.rotateX(-Math.PI / 2)
    gridGeometry.computeBoundingBox()
    var gridMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        opacity: 0.5,
        transparent: true,
        visible: false
            // side: THREE.DoubleSide,
    })
    gridMaterial.receiveShadow = true
    plane = new THREE.Mesh(gridGeometry, gridMaterial)

    assemblyScene.add(plane)
    assemblyObjects.push(plane)
}

function initAssembly() {
    assembly = document.getElementById('assembly')
    assemblyCamera = new THREE.PerspectiveCamera(45, assembly.clientWidth / assembly.clientHeight, 1, 10000)
    assemblyCamera.position.set(500, 800, 1300)
    assemblyCamera.lookAt(new THREE.Vector3())

    assemblyScene = new THREE.Scene()

    initAssemblyGrid(1000)

    // Lights
    var ambientLight = new THREE.AmbientLight(0x606060)
    assemblyScene.add(ambientLight)
    var directionalLight = new THREE.DirectionalLight(0xffffff)
    directionalLight.position.set(1, 0.75, 0.5).normalize()
    var d = 2000;
    var shadowCamera = new THREE.OrthographicCamera(-d, d, -d, d, -20000, 20000)
    shadowCamera.position.set(1, 0.75, 0.5).normalize()
    shadowCamera.lookAt(new THREE.Vector3());
    directionalLight.shadow = new THREE.LightShadow(shadowCamera);
    directionalLight.shadow.bias = 0.0001;

    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048

    // var helper = new THREE.CameraHelper(directionalLight.shadow)
    // assemblyScene.add(helper);
    assemblyScene.add(directionalLight)
    assemblyRenderer = new THREE.WebGLRenderer({ antialias: true })
    assemblyRenderer.setClearColor(0xf0f0f0)
    assemblyRenderer.setPixelRatio(window.devicePixelRatio)
    assemblyRenderer.setSize(assembly.clientWidth, assembly.clientHeight)
    assemblyRenderer.shadowMap.enabled = true
    assemblyRenderer.shadowMap.type = THREE.PCFShadowMap

    assemblyControls = new THREE.OrbitControls(assemblyCamera, assemblyRenderer.domElement, renderAssembly)
    assemblyControls.enabled = false
    assembly.appendChild(assemblyRenderer.domElement)
    assembly.style.cursor = 'auto'
    assembly.addEventListener('mousemove', onAssemblyMouseMove, false)
    assembly.addEventListener('mousedown', onAssemblyMouseDown, false)
    assembly.addEventListener('mouseup', onAssemblyMouseUp, false)
    document.addEventListener('keydown', onDocumentKeyDown, false)
    document.addEventListener('keyup', onDocumentKeyUp, false)
    window.addEventListener('resize', onWindowResize, false)
    window.onload = function() {
        document.getElementById('gsize').addEventListener('change', onGridSizeChange)
    }
}

function onGridSizeChange() {
    assemblyScene.remove(gridHelper)
    assemblyScene.remove(plane)
    assemblyObjects.splice(assemblyObjects.indexOf(plane), 1)
    var gridSize = document.getElementById('gsize').value
    initAssemblyGrid(gridSize)
    assemblyCamera.far = gridSize * 3
    assemblyCamera.updateProjectionMatrix()
    renderAssembly()
    console.log("Change")
}

function onWindowResize() {
    assemblyCamera.aspect = assembly.clientWidth / assembly.clientHeight
    assemblyCamera.updateProjectionMatrix()
    assemblyRenderer.setSize(assembly.clientWidth, assembly.clientHeight)
}

function selectPiece(piece) {
    unselectPiece()
    state = STATE.SELECT
    selectedPiece = piece
    selectedPiece.highlight()
    selectedPiece.addHit()
    assembly.style.cursor = 'pointer'
}

function unselectPiece() {
    state = STATE.NONE
    if (selectedPiece == null) return
    selectedPiece.unhighlight()
    selectedPiece.addHit()
    selectedPiece = null
    assembly.style.cursor = 'auto'
}

function handleMouseMovePiece(event) {
    var intersect = getPlaneIntersect(event)
    if (intersect == null) return
        /// TODO: Snap to a face of another object
    if (intersect.object == selectedPiece) {
        console.log("ERR!")
        return
    }
    var point = new THREE.Vector3(intersect.point.x, intersect.point.y + selectedPiece.size.y / 2, intersect.point.z)
    var bbox = new THREE.Box3().setFromObject(selectedPiece.group)

    // selectedPiece.position(point)
    var onTop = selectedPiece.onTop(assemblyObjects, 1000)
    if (onTop != null) {
        point.y = onTop.y + (bbox.max.y - bbox.min.y) / 2
        console.log("Found top=", onTop.y)
    } else {
        point.y = (bbox.max.y - bbox.min.y) / 2
        console.log("Didn't find top")
    }

    selectedPiece.position(point)
    var hit = selectedPiece.closeTo(assemblyObjects, 10.0)
    if (hit) {
        if (closestHit) {
            closestHit.closest.object.userData.unhighlightFace(closestHit.closest.object.id)
        }
        closestHit = hit
            // console.log("Hit="+hit.point)
        closestHit.closest.object.userData.highlightFace(closestHit.closest.object.id)
    } else if (closestHit) {
        closestHit.closest.object.userData.unhighlightFace(closestHit.closest.object.id)
        closestHit = null
    }
    /*
    if (movePoints == null) {
        var geometry = new THREE.Geometry();

        var v = new THREE.Vector3(selectedPiece.movegroup.position.x,
            selectedPiece.movegroup.position.y, selectedPiece.movegroup.position.z);
        var c = new THREE.Vector3(selectedPiece.top.points[0].x,
            selectedPiece.top.points[0].y, selectedPiece.top.points[0].z);
        geometry.vertices.push(v);
        geometry.vertices.push(c);
        var colors = [];

        colors[0] = new THREE.Color(0, 1, 0)
        colors[1] = new THREE.Color(0, 0, 1)
        geometry.colors = colors;
        geometry.computeBoundingBox();

        var material = new THREE.PointsMaterial({ size: 10, vertexColors: THREE.VertexColors });
        movePoints = new THREE.Points(geometry, material);
        assemblyScene.add(movePoints)
    } else {
        var v = new THREE.Vector3(selectedPiece.movegroup.position.x,
            selectedPiece.movegroup.position.y, selectedPiece.movegroup.position.z);
        var c = new THREE.Vector3(selectedPiece.top.points[0].x,
            selectedPiece.top.points[0].y, selectedPiece.top.points[0].z);
        movePoints.geometry.vertices[0] = v.clone()
        movePoints.geometry.vertices[1] = c.clone()
        movePoints.geometry.verticesNeedUpdate = true
    }
    */
}

function onAssemblyMouseDown(event) {
    console.log("onMouseDown, s:" + state)
    if (isControlDown) return
    event.preventDefault();
    if (event.button != THREE.MOUSE.LEFT) return

    switch (state) {
        case STATE.SELECT:
            var intersect = getIntersect(event)
            if (intersect == null) {
                unselectPiece()
            } else if (intersect.object != plane) {
                if (intersect.object.userData == selectedPiece) {
                    state = STATE.MOVE
                    assembly.style.cursor = 'move'
                    originalPiece = selectedPiece.clone()
                    selectedPiece.removeHit() // from hit testing
                    handleMouseMovePiece(event)
                } else {
                    unselectPiece()
                }
            }
            break
    }
    renderAssembly()
}

function pointString(point, precision) {
    return point.x.toFixed(precision) + "," + point.y.toFixed(precision) + "," + point.z.toFixed(precision)
}

function getIntersect(event) {
    mouse.set(((event.offsetX) / assembly.clientWidth) * 2 - 1, -((event.offsetY) / assembly.clientHeight) * 2 + 1);
    raycaster.setFromCamera(mouse, assemblyCamera);
    var intersects = raycaster.intersectObjects(assemblyObjects);
    if (intersects.length > 0) {
        document.getElementById('assemblyreadout').value = pointString(intersects[0].point, 2)
        return intersects[0]
    }
    return null
}

function pointInHorBox(point, box) {
    return (point.x >= box.min.x) && (point.x <= box.max.x) && (point.z >= box.min.z) && (point.z <= box.max.z)
}

function placeOnTop(piece) {
    var pBox = new THREE.Box3().setFromObject(piece.movegroup)
    var maxY = 0
    for (var i = 0; i < pieces.length; i++) {
        if (pieces[i] != piece) {
            var oBox = new THREE.Box3().setFromObject(pieces[i].movegroup)
            if (pointInHorBox(new THREE.Vector3(pBox.min.x, pBox.max.y, pBox.min.z), oBox) ||
                pointInHorBox(new THREE.Vector3(pBox.min.x, pBox.max.y, pBox.max.z), oBox) ||
                pointInHorBox(new THREE.Vector3(pBox.max.x, pBox.max.y, pBox.max.z), oBox) ||
                pointInHorBox(new THREE.Vector3(pBox.max.x, pBox.max.y, pBox.min.z), oBox)) {
                if (oBox.max.y > maxY) { maxY = oBox.max.y }
            }
        }
    }
    return maxY
}

function getPlaneIntersect(event) {
    mouse.set(((event.offsetX) / assembly.clientWidth) * 2 - 1, -((event.offsetY) / assembly.clientHeight) * 2 + 1);
    raycaster.setFromCamera(mouse, assemblyCamera);
    var intersects = raycaster.intersectObjects([plane]);
    if (intersects.length > 0) {
        return intersects[0]
    }
    return null
}

function onAssemblyMouseMove(event) {
    console.log("onMouseMove, s:" + state)
    if (isControlDown) return
    event.preventDefault();
    switch (state) {
        case STATE.MOVE:
            handleMouseMovePiece(event);
            renderAssembly()
            break
        case STATE.NONE:
            var intersect = getIntersect(event)
            if (intersect == null) {
                assembly.style.cursor = 'auto'
                break
            }
            if (intersect.object != plane) {
                assembly.style.cursor = 'pointer'
                break
            }
            assembly.style.cursor = 'auto';
            break
        case STATE.SELECT:
            var intersect = getIntersect(event)
            if (intersect == null) {
                assembly.style.cursor = 'auto'
                break
            }
            if (intersect.object == plane) {
                assembly.style.cursor = 'auto';
                break
            }
            if (intersect.object.userData != selectedPiece) {
                assembly.style.cursor = 'pointer';
            } else {
                assembly.style.cursor = 'move';
            }
            break
    }
}

function onAssemblyMouseUp(event) {
    console.log("onMouseUp, s:" + state)
    if (isControlDown) return
    switch (state) {
        case STATE.NONE:
            var intersect = getIntersect(event)
            if (intersect == null) break
            if (intersect.object != plane) {
                // clicked on an existing object
                selectPiece(intersect.object.userData)
                break
            }
            var newPiece = cutPiece.clone()
            var point = new THREE.Vector3(intersect.point.x, intersect.point.y + newPiece.size.y / 2, intersect.point.z)
            point.y = Math.max(point.y, newPiece.size.y / 2)
            newPiece.addToScene(assemblyScene, assemblyObjects)
            newPiece.position(point)
            pieces.push(newPiece)
            break
        case STATE.SELECT:
            var intersect = getIntersect(event)
            if (intersect == null) break
            if (intersect.object != plane) {
                if (intersect.object.userData == selectedPiece) {
                    unselectPiece()
                } else {
                    selectPiece(intersect.object.userData)
                }
            } else {
                unselectPiece()
            }
            break
        case STATE.MOVE:
            var intersect = getIntersect(event)
            if (intersect == null) {
                selectedPiece.removeFromScene()
                originalPiece.addToScene(assemblyScene, assemblyObjects)
                originalPiece.position(originalPiece.origin)
                selectPiece(originalPiece)
                originalPiece = null
                break
            }
            if (closestHit) {
                // console.log("Closest=", selectedPiece.getCorner(closestHit.faceId, closestHit.corner))
                var cornerNormal = selectedPiece.getCornerNormal(closestHit.faceId, closestHit.corner)
                cornerNormal.multiplyScalar(closestHit.closest.distance)
                var position = selectedPiece.movegroup.position.clone()
                position.add(cornerNormal)
                selectedPiece.position(position)
                    //selectedPiece.changeOrigin(selectedPiece.getCorner(closestHit.faceId, closestHit.corner))
                    //selectedPiece.changeOrigin(originalOrigin)
            }
            selectPiece(selectedPiece)
            break
    }
    renderAssembly()
}
var lastCursor = null

function onDocumentKeyDown(event) {
    switch (event.keyCode) {
        case 16:
            isShiftDown = true
            break
        case 17:
            isControlDown = true
            lastCursor = assembly.style.cursor
            assembly.style.cursor = '-webkit-grab';
            assemblyControls.enabled = true
            break
    }

}

function onDocumentKeyUp(event) {
    switch (event.keyCode) {
        case 8: // delete
            if (state == STATE.MOVE ||
                state == STATE.SELECT) {
                state = STATE.NONE
                selectedPiece.removeFromScene()
                selectedPiece = null
            }
            break
        case 16: // shift
            isShiftDown = false
            break
        case 17: // control
            isControlDown = false
            assemblyControls.enabled = false
            assembly.style.cursor = lastCursor
            break
        case 27: // esc
            if (state == STATE.MOVE) {
                state = STATE.SELECT
            }
            if (state == STATE.SELECT) {
                selectedPiece.unhighlight()
                state = STATE.NONE
            }
            break
        case 37: // left arrow
            switch (state) {
                case STATE.SELECT:
                case STATE.MOVE:
                    selectedPiece.movegroup.rotateY(Math.PI / 4)
                    break
            }
            break
        case 38: // up arrow
            switch (state) {
                case STATE.SELECT:
                case STATE.MOVE:
                    selectedPiece.movegroup.rotateX(-Math.PI / 2)
                    break
            }
            break
        case 39: // right arrow
            switch (state) {
                case STATE.SELECT:
                case STATE.MOVE:
                    selectedPiece.movegroup.rotateY(-Math.PI / 4)
                    break
            }
            break
        case 40: // down arrow
            switch (state) {
                case STATE.SELECT:
                case STATE.MOVE:
                    selectedPiece.movegroup.rotateX(Math.PI / 2)
                    break
            }
            break;
    }
    renderAssembly()
}

function renderAssembly() {
    assemblyRenderer.render(assemblyScene, assemblyCamera);
}