var assembly;
var STATE = {
    NONE: -1,
    CAMERA: 0,
    SELECT: 1,
    MOVE: 2
};
var state = STATE.NONE;
var assemblyCamera, assemblyScene, assemblyRenderer, assemblyControls;

function initAssemblyGrid(size) {
    // grid
    gridHelper = new MyGridHelper(size, 100, 10)
    assemblyScene.add(gridHelper)
        //
    raycaster = new THREE.Raycaster()
    mouse = new THREE.Vector2()
    gridGeometry = new THREE.PlaneBufferGeometry(size, size)
    gridGeometry.rotateX(-Math.PI / 2)
    gridGeometry.computeBoundingBox()
    plane = new THREE.Mesh(gridGeometry, new THREE.MeshBasicMaterial({
        visible: false
    }))
    assemblyScene.add(plane)
    assemblyObjects.push(plane)
}

function initAssembly() {
    assembly = document.getElementById('assembly')
    assemblyCamera = new THREE.PerspectiveCamera(45, assembly.clientWidth / assembly.clientHeight, 1, 10000)
    assemblyCamera.position.set(500, 800, 1300)
    assemblyCamera.lookAt(new THREE.Vector3())

    assemblyScene = new THREE.Scene()

    // piece to use for showing potential placement
    var centerPoint = new THREE.Vector3(0, 0, 0)
    defaultPiece = new Piece(centerPoint, defaultPieceShape, 0)
    defaultPiece.addToScene(assemblyScene, assemblyObjects, centerPoint, false)

    initAssemblyGrid(1000)

    // Lights
    var ambientLight = new THREE.AmbientLight(0x606060)
    assemblyScene.add(ambientLight)
    var directionalLight = new THREE.DirectionalLight(0xffffff)
    directionalLight.position.set(1, 0.75, 0.5).normalize()
    var d = 2000;
    directionalLight.shadow = new THREE.LightShadow(new THREE.OrthographicCamera(-d, d, -d, d, 1, 2000));
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
    state = STATE.SELECT
    selectedPiece = piece
    selectedPiece.highlight()
    assembly.style.cursor = 'pointer'
}

function unselectPiece(piece) {
    state = STATE.NONE
    selectedPiece.unhighlight()
    selectedPiece = null
    assembly.style.cursor = 'auto'
}

function handleMouseDown(event) {
    switch (state) {
        case STATE.NONE:
            var intersect = getIntersect(event)
            if (intersect == null) break
            if (intersect.object != plane) {
                // clicked on an existing object
                selectPiece(intersect.object.userData)
            } else {
                // create new pience
                var point = intersect.point;
                point.y = Math.max(point.y, 0)
                if (defaultPiece.canPlace(point)) {
                    var newPiece = new Piece(point, defaultPieceShape, 0)
                    newPiece.addToScene(assemblyScene, assemblyObjects, point)
                    selectPiece(newPiece)
                }
            }
            renderAssembly();
            break;
        case STATE.SELECT:
            var intersect = getIntersect(event)
            if (intersect == null) break
            if ((intersect.object != plane) &&
                (intersect.object.userData == selectedPiece)) {
                state = STATE.MOVE
                assembly.style.cursor = 'move'
                selectedPiece.removeHit() // from hit testing
                handleMouseMovePiece(event)
            } else {
                // create new pience
                var point = intersect.point;
                point.y = Math.max(point.y, 0)
                if (defaultPiece.canPlace(point)) {
                    var newPiece = new Piece(point, defaultPieceShape, 0)
                    newPiece.addToScene(assemblyScene, assemblyObjects, point)
                    if (selectedPiece != null) selectedPiece.unhighlight()
                    selectPiece(newPiece)
                }
            }
            renderAssembly()
            break;
    }
}

function handleMouseUp(event) {
    switch (state) {
        case STATE.MOVE:
            state = STATE.SELECT
            selectedPiece.addHit()
            break
    }
}

function handleMouseMovePiece(event) {
    var intersect = getIntersect(event)
    if (intersect == null) return
        /// TODO: Snap to a face of another object
    var point = new THREE.Vector3(intersect.point.x, intersect.point.y, intersect.point.z)
    point.y = Math.max(point.y, 0)
    if (selectedPiece.canPlace(point)) {
        selectedPiece.position(point)
    }
}

function onAssemblyMouseDown(event) {
    if (isControlDown) return
    event.preventDefault();
    switch (event.button) {
        case THREE.MOUSE.LEFT:
            handleMouseDown(event);
            break;
    }
    renderAssembly()
}

function getIntersect(event) {
    mouse.set((event.clientX / assembly.clientWidth) * 2 - 1, -(event.clientY / assembly.clientHeight) * 2 + 1);
    raycaster.setFromCamera(mouse, assemblyCamera);
    var intersects = raycaster.intersectObjects(assemblyObjects);
    if (intersects.length > 0) {
        return intersects[0]
    }
    return null
}

function onAssemblyMouseMove(event) {
    if (isControlDown) return
    event.preventDefault();
    switch (state) {
        case STATE.MOVE:
            handleMouseMovePiece(event);
            break
        case STATE.NONE:
            var intersect = getIntersect(event)
            if (intersect == null) break
            if (intersect.object != plane) {
                assembly.style.cursor = 'pointer';
            } else {
                assembly.style.cursor = 'auto';
            }
            break
        case STATE.SELECT:
            var intersect = getIntersect(event)
            if (intersect == null) {
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
    renderAssembly()
}

function onAssemblyMouseUp(event) {
    if (isControlDown) return
    handleMouseUp(event);
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
            if (selectionMade) {
                selectedPiece.remove()
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
                if (selectedPiece != null) selectedPiece.unhighlight()
                state = STATE.NONE
            }
            break
        case 37: // left arrow
            break
        case 38: // up arrow
            break
        case 39: // right arrow
            break
        case 40: // down arrow
            break;
    }
    renderAssembly()
}

function renderAssembly() {
    console.log(state)
    assemblyRenderer.render(assemblyScene, assemblyCamera);
}