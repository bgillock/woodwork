var topView
var frontView
var rightView
var cutpersp;
var cutPerspCamera, cutPerspRenderer, cutPerspControls;
class CutView {
    constructor(id, frustum, offsetLeft, offsetTop, up, position) {
        this.cut = document.getElementById(id).parentElement
        this.createCamera(frustum, offsetLeft, offsetTop)
        this.setCamera(up, position)
        if (this.renderer) this.cut.removeChild(this.renderer.domElement)
        this.renderer = new THREE.WebGLRenderer({ antialias: true})
        this.renderer.autoClear = false
        this.renderer.sortObjects = true

        //this.renderer.alpha = true
        this.renderer.setClearColor(0xf0f0f0);
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(this.cut.clientWidth, this.cut.clientHeight)

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement, renderCut);
        this.controls.enabled = true
        this.controls.enableRotate = false
        this.controls.enableKeys = false

        this.cut.appendChild(this.renderer.domElement)
        this.cut.style.cursor = 'auto'

        this.cut.addEventListener('click', onActive)
    }
    setCamera(up, position) {
        this.camera.position.set(position.x, position.y, position.z)
        this.camera.lookAt(0, 0, 0)
        this.camera.up.fromArray(up)
    }
    createCamera(frustum, offsetLeft, offsetTop) {
        var frustumSize = frustum
        var aspect = this.cut.clientWidth / this.cut.clientHeight
        this.camera = new THREE.OrthographicCamera((frustumSize * aspect / -2) + offsetLeft,
            (frustumSize * aspect / 2) + offsetLeft,
            (frustumSize / 2) + offsetTop,
            (frustumSize / -2) + offsetTop,
            -1000, 2000)
    }
}
function centerCutScene(piece) {
    var bbox = new THREE.Box3().setFromObject(piece.movegroup)
    var size = new THREE.Vector3(bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z)
    var center = new THREE.Vector3((bbox.max.x + bbox.min.x) / 2, (bbox.max.y + bbox.min.y) / 2, (bbox.max.z + bbox.min.z) / 2)
    topView.setCamera([0, 0, 1], new THREE.Vector3(0, -1000, 0))
    frontView.setCamera([0, -1, 0], new THREE.Vector3(0, 0, -1000))
    rightView.setCamera([0, -1, 0], new THREE.Vector3(-1000, 0, 0))
}
function loadCutScene(piece) {
    var bbox = new THREE.Box3().setFromObject(piece.movegroup)
    var size = new THREE.Vector3(bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z)
    var center = new THREE.Vector3((bbox.max.x + bbox.min.x) / 2, (bbox.max.y + bbox.min.y) / 2, (bbox.max.z + bbox.min.z) / 2)

    topView = new CutView('cuttop',
        size.x, center.x, center.z, [0, 0, 1],
        new THREE.Vector3(0, -1000, 0))

    frontView = new CutView('cutfront',
        size.x, center.x, -center.y, [0, -1, 0],
        new THREE.Vector3(0, 0, -1000))

    rightView = new CutView('cutleft',
        size.x, -center.z, -center.y, [0, -1, 0],
        new THREE.Vector3(1000, 0, 0))

    cutpersp = document.getElementById('cutpersp').parentElement
    aspect = cutpersp.clientWidth / cutpersp.clientHeight;
    cutPerspCamera = new THREE.PerspectiveCamera(45, aspect, 1, 10000);

    cutPerspCamera.sortObjects = true
    cutPerspCamera.position.set(size.x * 2, size.y * 2, size.z * 2);
    cutPerspCamera.lookAt(new THREE.Vector3());

    if (cutPerspRenderer) cutpersp.removeChild(cutPerspRenderer.domElement)
    cutPerspRenderer = new THREE.WebGLRenderer({ antialias: true });
    cutPerspRenderer.setClearColor(0xf0f0f0);
    cutPerspRenderer.setPixelRatio(window.devicePixelRatio);
    cutPerspRenderer.setSize(cutpersp.clientWidth, cutpersp.clientHeight);

    cutPerspControls = new THREE.OrbitControls(cutPerspCamera, cutPerspRenderer.domElement, renderCut);
    cutpersp.addEventListener('click', onActive)
    cutPerspControls.enabled = true
    cutPerspControls.enableRotate = true
    cutPerspControls.enableKeys = false
    cutpersp.appendChild(cutPerspRenderer.domElement);
    cutpersp.style.cursor = 'auto';
}

var gridXZScene = null
var gridYXScene = null
var gridZYScene = null

function getCutterSize(pieceSize) {
    var sizes = [pieceSize.x,pieceSize.y,pieceSize.z]
    sizes.sort()
    var size = Math.floor(Math.sqrt((sizes[0]*sizes[0])+(sizes[1]*sizes[1])));
    var cutSize = new THREE.Vector3(size*2,size*2,size*2)
    return cutSize
}

function initCutScene() {
    cutScene = new THREE.Scene();

    gridXZScene = new THREE.Scene();
    gridXZScene.add(MyGridHelper(10000, 100, 10));

    gridYXScene = new THREE.Scene();
    gridYXScene.add(MyGridHelper(10000, 100, 10).rotateX(-Math.PI / 2));

    gridZYScene = new THREE.Scene();
    gridZYScene.add(MyGridHelper(10000, 100, 10).rotateZ(-Math.PI / 2));

    // Lights
    var ambientLight = new THREE.AmbientLight(0x606060);

    cutScene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1000, 750, 500).normalize();
    directionalLight.castShadow = true
    cutScene.add(directionalLight);

    document.onmousemove = function(e) {
            cursorX = e.pageX;
            cursorY = e.pageY;
        }
        // setInterval("checkCursor()", 1000);

    return cutScene
}
var cursorX;
var cursorY;

function checkCursor() {
    document.getElementById('frontreadout').value = cursorX + "," + cursorY
}

function onPlaceClickHor() {
    var newPiece = cutPiece.clone()
    newPiece.addToScene(assemblyScene, assemblyObjects)
    newPiece.position(new THREE.Vector3())
    newPiece.removeHit()
    newPiece.placeOnTop(assemblyObjects, 1000, new THREE.Vector3())
    newPiece.addHit()
    pieces.push(newPiece)
    renderAssembly()
}

function onPlaceClickVert() {
    var newPiece = cutPiece.clone()
    newPiece.movegroup.rotateZ(Math.PI / 2)
    var bbox = new THREE.Box3().setFromObject(newPiece.movegroup)
    newPiece.addToScene(assemblyScene, assemblyObjects)
    newPiece.position(new THREE.Vector3())
    newPiece.removeHit()
    newPiece.placeOnTop(assemblyObjects, 1000, new THREE.Vector3())
    newPiece.addHit()
    pieces.push(newPiece)
    renderAssembly()
}

function cut(wood,tool) {
   // create new BoxGeometry by cutting plane with existing BoxGeometry
   // cut native BSP box geometry
  var BoxBSP = new ThreeBSP(wood.movegroup.geometry)
  var DatoBSP = new ThreeBSP(tool.movegroup.geometry.translate(-wood.movegroup.position.x,-wood.movegroup.position.y,-wood.movegroup.position.z ))
  tool.movegroup.geometry.translate(wood.movegroup.position.x,wood.movegroup.position.y,wood.movegroup.position.z )
  result = BoxBSP.subtract(DatoBSP)  
  wood.movegroup.geometry = result.toGeometry();
  wood.movegroup.geometry.verticesNeedUpdate = true;
  // assignColorToSides(wood.movegroup.geometry)
  var min = new THREE.Vector3 
  var max = new THREE.Vector3
  minMax(min,max,wood.movegroup.geometry.vertices)
  assignMaterialToFaces(wood.movegroup.geometry,min,max,0,1)

 // wireframe0 = new THREE.WireframeHelper( wood , 0xffffff );
}
//function onWindowLoad() {
//    console.log("Windowload")
//    renderCut()
//}
function resizeCut() {
    var xSize = window.innerWidth * 0.70
    var ySize = window.innerWidth * 0.25
    topView.cut.style.width = xSize
    topView.cut.style.height = ySize
    topView.camera.aspect = xSize / ySize
    topView.camera.updateProjectionMatrix()
    topView.renderer.setSize(xSize, ySize)
}
function renderCut(camera) {
    if (topView == null || frontView == null || rightView == null || cutPerspCamera == null) return

    // Synchronize views
    if (camera == topView.camera) {
        frontView.camera.zoom = rightView.camera.zoom = camera.zoom
        frontView.camera.position.x = camera.position.x
        rightView.camera.position.z = camera.position.z
        rightView.camera.updateProjectionMatrix();
        frontView.camera.updateProjectionMatrix();
    } else if (camera == frontView.camera) {
        topView.camera.zoom = rightView.camera.zoom = camera.zoom
        topView.camera.position.x = camera.position.x
        rightView.camera.position.y = camera.position.y
        topView.camera.updateProjectionMatrix();
        rightView.camera.updateProjectionMatrix();
    } else if (camera == rightView.camera) {
        topView.camera.zoom = frontView.camera.zoom = camera.zoom
        topView.camera.position.z = camera.position.z
        frontView.camera.position.y = camera.position.y
        topView.camera.updateProjectionMatrix();
        frontView.camera.updateProjectionMatrix();
    }
    console.log("Render cut")
    topView.renderer.clear()
    topView.renderer.render(gridXZScene, topView.camera)
    topView.renderer.clearDepth()
    topView.renderer.render(cutScene, topView.camera)

    frontView.renderer.clear()
    frontView.renderer.render(gridYXScene, frontView.camera)
    frontView.renderer.clearDepth()
    frontView.renderer.render(cutScene, frontView.camera)

    rightView.renderer.clear()
    rightView.renderer.render(gridZYScene, rightView.camera)
    rightView.renderer.clearDepth()
    rightView.renderer.render(cutScene, rightView.camera)

    cutPerspRenderer.render(cutScene, cutPerspCamera)
}