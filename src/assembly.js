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
function setAssemblyCamera(previousCamera){
    var cameraPosition = new THREE.Vector3();
    if (previousCamera != null) {
        cameraPosition.copy(previousCamera.position)
    }
    else cameraPosition.set(500, 800, 1300)
    assembly = document.getElementById('assembly').parentElement
    assemblyCamera = new THREE.PerspectiveCamera(45, assembly.clientWidth / assembly.clientHeight, 1, 10000)
    assemblyCamera.position.copy(cameraPosition)
    assemblyCamera.lookAt(new THREE.Vector3())
    assemblyCamera.updateProjectionMatrix()
    assemblyRenderer.setSize(assembly.clientWidth, assembly.clientHeight)
    renderAssembly()
}
function initAssembly() {
    //setAssemblyCamera()
    assembly = document.getElementById('assembly').parentElement
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
    for (p in Panels) {
        if (Panels[p].title == 'assembly') Panels[p].on('resize', onAssemblyResize)
    }
    assembly.addEventListener('onresize', onAssemblyResize, false)
    assembly.addEventListener('mousemove', onAssemblyMouseMove, false)
    assembly.addEventListener('mousedown', onAssemblyMouseDown, false)
    assembly.addEventListener('mouseup', onAssemblyMouseUp, false)
    document.addEventListener('keydown', onDocumentKeyDown, false)
    document.addEventListener('keyup', onDocumentKeyUp, false)
    assembly.addEventListener('click', onActive)
  //  window.addEventListener('resize', onWindowResize, false)
    window.onload = function() {
        document.getElementById('gsize').addEventListener('change', onGridSizeChange)
    }
}
function onAssemblyResize() {
    setAssemblyCamera(assemblyCamera)
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

    selectedPiece.placeOnTop(assemblyObjects, 1000, point)

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
    //    document.getElementById('assemblyreadout').value = pointString(intersects[0].point, 2)
        return intersects[0]
    }
    return null
}

function pointInHorBox(point, box) {
    return (point.x >= box.min.x) && (point.x <= box.max.x) && (point.z >= box.min.z) && (point.z <= box.max.z)
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
            var point = new THREE.Vector3(intersect.point.x, intersect.point.y, intersect.point.z)
            newPiece.addToScene(assemblyScene, assemblyObjects)
            newPiece.position(point)
            newPiece.removeHit()
            newPiece.placeOnTop(assemblyObjects, 1000, point)
            newPiece.addHit()
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
                originalPiece.removeHit()
                originalPiece.placeOnTop(assembleyObjects, 1000, originalPiece.origin)
                originalPiece.addHit()
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

function renderAssembly() {
    assemblyRenderer.render(assemblyScene, assemblyCamera);
}
/*
myLayout = new GoldenLayout({
    content:[{
        type: 'row',
        content:[{
            type: 'component',
            componentName: 'testComponent',
            componentState: { color: '#1D84BD' }
        },{
            type: 'component',
            componentName: 'testComponent',
            componentState: { color: '#F15C25' }
        }]
    }]
});

myLayout.registerComponent( 'testComponent', function( container, state ){
    container.getElement().css('background-color', state.color);
});

/// Callback for every created stack
myLayout.on( 'stackCreated', function( stack ){

    //HTML for the colorDropdown is stored in a template tag
    var colorDropdown = $( $( 'template' ).html() ),
        colorDropdownBtn = colorDropdown.find( '.selectedColor' );


    var setColor = function( color ){
        var container = stack.getActiveContentItem().container;

        // Set the color on both the dropDown and the background
        colorDropdownBtn.css( 'background-color', color );
        container.getElement().css( 'background-color', color );

        // Update the state
        container.extendState({ color: color });
    };

    // Add the colorDropdown to the header
    stack.header.controlsContainer.prepend( colorDropdown );

    // Update the color initially and whenever the tab changes
    stack.on( 'activeContentItemChanged', function( contentItem ){
         setColor( contentItem.container.getState().color );
    });
       
    // Update the color when the user selects a different color
    // from the dropdown
    colorDropdown.find( 'li' ).click(function(){
        setColor( $(this).css( 'background-color' ) );
    });
});

myLayout.init();
*/