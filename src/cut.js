var topView
var frontView
var rightView
var cutpersp;
var cutPerspCamera, cutPerspRenderer, cutPerspControls;
class CutView {
    constructor(id, frustum, offsetLeft, offsetTop, up, position) {
        var frustumSize = frustum
        this.cut = document.getElementById(id)
        var aspect = this.cut.clientWidth / this.cut.clientHeight
        this.camera = new THREE.OrthographicCamera((frustumSize * aspect / -2) + offsetLeft,
            (frustumSize * aspect / 2) + offsetLeft,
            (frustumSize / -2) + offsetTop,
            (frustumSize / 2) + offsetTop,
            1, 2000)
        this.camera.position.set(position.x, position.y, position.z)
        this.camera.lookAt(0, 0, 0)
        this.camera.up.fromArray(up)

        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.autoClear = false
        this.renderer.setClearColor(0xf0f0f0);
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(this.cut.clientWidth, this.cut.clientHeight)

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement, renderCut);
        this.controls.enabled = true
        this.controls.enableRotate = false
        this.controls.enableKeys = false

        this.cut.appendChild(this.renderer.domElement)
        this.cut.style.cursor = 'auto'
    }
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

    rightView = new CutView('cutright',
        size.x, -center.z, -center.y, [0, -1, 0],
        new THREE.Vector3(-1000, 0, 0))

    cutpersp = document.getElementById('cutpersp')
    aspect = cutpersp.clientWidth / cutpersp.clientHeight;
    cutPerspCamera = new THREE.PerspectiveCamera(45, aspect, 1, 10000);
    cutPerspCamera.position.set(size.x * 2, size.y * 2, size.z * 2);
    cutPerspCamera.lookAt(new THREE.Vector3());

    cutPerspRenderer = new THREE.WebGLRenderer({ antialias: true });
    cutPerspRenderer.setClearColor(0xf0f0f0);
    cutPerspRenderer.setPixelRatio(window.devicePixelRatio);
    cutPerspRenderer.setSize(cutpersp.clientWidth, cutpersp.clientHeight);

    cutPerspControls = new THREE.OrbitControls(cutPerspCamera, cutPerspRenderer.domElement, renderCut);
    cutPerspControls.enabled = true
    cutPerspControls.enableRotate = true
    cutPerspControls.enableKeys = false

    cutpersp.appendChild(cutPerspRenderer.domElement);
    cutpersp.style.cursor = 'auto';

}
var gridXZScene = null

function initCutScene() {
    var cutScene = new THREE.Scene();

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

    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('keyup', onDocumentKeyUp, false);
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('load', onWindowLoad)
    document.getElementById('placehor').addEventListener('click', onPlaceClickHor)
    document.getElementById('placevert').addEventListener('click', onPlaceClickVert)
    document.getElementById('frontbevelright').addEventListener('click', onFrontBevelRightClick)
    document.getElementById('frontbevelleft').addEventListener('click', onFrontBevelLeftClick)
    document.getElementById('topbevelright').addEventListener('click', onTopBevelRightClick)
    document.getElementById('topbevelleft').addEventListener('click', onTopBevelLeftClick)
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

function onFrontBevelRightClick() {
    var angle = Math.PI / 4

    cutPiece.cut(SIDE.FRONTRIGHT, angle)
    renderCut()
}
function onFrontBevelLeftClick() {
    var angle = Math.PI / 4

    cutPiece.cut(SIDE.FRONTLEFT, angle)
    renderCut()
}
function onTopBevelRightClick() {
    var angle = Math.PI / 4

    cutPiece.cut(SIDE.TOPRIGHT, angle)
    renderCut()
}
function onTopBevelLeftClick() {
    var angle = Math.PI / 4

    cutPiece.cut(SIDE.TOPLEFT, angle)
    renderCut()
}
function onWindowLoad() {
    renderCut()
}
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