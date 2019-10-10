var topView
var frontView
var rightView
var cutpersp;
var cutPerspCamera, cutPerspRenderer, cutPerspControls;
/*
var sidesFKLR = {
    "Front": SIDE_FRONT,
    "Back": SIDE_BACK,
    "Left": SIDE_LEFT,
    "Right": SIDE_RIGHT
};
var sidesLR = {
    "Left": SIDE_LEFT,
    "Right": SIDE_RIGHT
};
var sidesTBFK = {
    "Top": SIDE_TOP,
    "Bottom": SIDE_BOTTOM,
    "Front": SIDE_FRONT,
    "Back": SIDE_BACK
};
var sidesFK = {
    "Front": SIDE_FRONT,
    "Back": SIDE_BACK
}

const SIDE_TOP = 1
const SIDE_BOTTOM = 2
const SIDE_FRONT = 3
const SIDE_BACK = 4
const SIDE_LEFT = 5
const SIDE_RIGHT = 6
*/
var sidesFKLR = [
    "Front",
    "Back",
    "Left",
    "Right"
];
var sidesLR = [
    "Left",
    "Right"
];
var sidesTBFK = [
    "Top",
    "Bottom",
    "Front",
    "Back"
];
var sidesFK = [
    "Front",
    "Back"
];
var positionsBlade = ["Above","Below"]
class CutView {
    constructor(id, frustum, offsetLeft, offsetTop, up, position) {
        this.cut = document.getElementById(id)
        this.cutter = null
        this.piece = null
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
        this.cutScene = new THREE.Scene();
        
            // Lights
        var ambientLight = new THREE.AmbientLight(0x606060);
        
        this.cutScene.add(ambientLight);
        var directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(1000, 750, 500).normalize();
        directionalLight.castShadow = true
        this.cutScene.add(directionalLight);
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
    subtractCutterFromPiece() {
        var wood = this.piece
        var tool = this.cutter
        var BoxBSP = new ThreeBSP(wood.movegroup.geometry)
        var DatoBSP = new ThreeBSP(tool.movegroup.geometry.translate(-wood.movegroup.position.x,-wood.movegroup.position.y,-wood.movegroup.position.z ))
        tool.movegroup.geometry.translate(wood.movegroup.position.x,wood.movegroup.position.y,wood.movegroup.position.z )
        var result = BoxBSP.subtract(DatoBSP)  
        wood.movegroup.geometry = result.toGeometry();
        wood.movegroup.geometry.verticesNeedUpdate = true;
      
        var subMeshes = wood.getSubMeshes()
        // assignColorToSides(wood.movegroup.geometry)
        var mm = minMax(wood.movegroup.geometry.vertices)
        assignMaterialToFaces(wood.movegroup.geometry,mm.min,mm.max,0,1)
      
    
        return subMeshes[0]
        // wireframe0 = new THREE.WireframeHelper( wood , 0xffffff );
    }
}
class TopView extends CutView {
    constructor(id, frustum, offsetLeft, offsetTop, up, position) {
        super(id, frustum, offsetLeft, offsetTop, up, position)
        this.ctrl = {
            width: 10, widthController: null,
            angle: 0.0, angleController: null,
            inChange: false,
            stop: 400.0, stopController: null,
            fenceSide: "Back", fenceSideController: null,
            baseSide: "Bottom", baseSideController: null,
            view: null
        }
        this.gui = {}
        this.gridScene = new THREE.Scene();
        this.gridScene.add(MyGridHelper(10000, 100, 10));
    }
    createGUI() {
        this.gui = new dat.GUI({name: 'Move', width: 200, autoPlace: false })
        //var blade = this.gui.addFolder( 'blade' );
        var customContainer = document.getElementById('cuttopctrl');
        customContainer.appendChild(this.gui.domElement);

        this.ctrl.widthController = this.gui.add(this.ctrl,'width',1,100.0,1.0).onChange( function ( width ) {
            var defaultCutterShape = new THREE.Vector3(width, 300, 300)
            var cutterGeometry = getThreeBoxGeometry(defaultCutterShape)
            var currentAngle = this.object.angle
            this.object.view.cutScene.remove(this.object.view.cutter.movegroup)
            this.object.view.cutter = new MeshPiece(cutterGeometry,0)
            this.object.view.cutter.changeOrigin(new THREE.Vector3(defaultCutterShape.x/-2,0,0))
            this.object.view.cutter.highlight()
            this.object.view.cutScene.add(this.object.view.cutter.movegroup)
            this.object.view.cutter.position(new THREE.Vector3(0, 0, 0))
            this.object.view.cutter.setAngleY(currentAngle) 
            renderCut()
        } );        
        this.ctrl.angleController = this.gui.add(this.ctrl,'angle',-45,45,5).onChange( function ( angle ) {
            this.object.view.cutter.setAngleY(degrees_to_radians(angle))    
            renderCut()
        } );
        this.ctrl.stopController = this.gui.add(this.ctrl,'stop',0.0,1000.0,0.125).onChange( function ( stop ) {
            this.object.view.piece.setRemainLengthMaxZ(stop)
            renderCut()
        } );
        this.ctrl.view = this
    }

    addCutterAndPieceToScene (cutter,piece,angleY,width,stopRemain) {
        this.cutter = cutter
        this.cutScene.add(cutter.movegroup)
        this.piece = piece
        this.cutScene.add(piece.movegroup)
        this.ctrl.stopController.setValue(stopRemain)
        this.ctrl.angleController.setValue(angleY)
        this.ctrl.widthController.setValue(width)    
    }
}
class FrontView extends CutView {
    constructor(id, frustum, offsetLeft, offsetTop, up, position) {
        super(id, frustum, offsetLeft, offsetTop, up, position)
        this.ctrl = {
            width: 10, widthController: null,
            depth: 0.0, depthController: null,
            blade: "Above", bladeController: null,
            inChange: false,
            stop: 400.0, stopController: null,
            fenceSide: "Back", fenceSideController: null,
            baseSide: "Bottom", baseSideController: null
        }
        this.gui = {}
        
        this.gridScene = new THREE.Scene();
        this.gridScene.add(MyGridHelper(10000, 100, 10).rotateX(-Math.PI / 2));
    }

    createGUI() {
        this.gui = new dat.GUI({name: 'Move', width: 200, autoPlace: false })

        var customContainer = document.getElementById('cutfrontctrl');
        customContainer.appendChild(this.gui.domElement);

        this.ctrl.widthController = this.gui.add(this.ctrl,'width',1,100.0,1.0).onChange( function ( width ) {
            var defaultCutterShape = new THREE.Vector3(width, 300, 300)
            var cutterGeometry = getThreeBoxGeometry(defaultCutterShape)
            var currentAngle = cutter.angle
            cutter.removeFromScene()
            cutter = new MeshPiece(cutterGeometry,0)
            cutter.changeOrigin(new THREE.Vector3(defaultCutterShape.x/-2,0,0))
            cutter.highlight()
            cutter.addToScene(cutScene, cutObjects)
            cutter.position(new THREE.Vector3(0, 0, 0))
            cutter.setAngleY(currentAngle) 
            renderCut()
        } );        
        this.ctrl.depthController = this.gui.add(this.ctrl,'depth',0,100,1).onChange( function ( depth ) {
            if (!this.object.inChange) {
                this.object.inChange = true 
                var top = cutPiece.getHeight()
                cutter.setDepth(-top,depth)
                var height = cutPiece.getHeight() - depth
                this.object.heightController.setValue(height)
                this.object.inChange = false 
            }
            renderCut()
        } );
        this.ctrl.bladeController = this.gui.add(this.ctrl,'blade',positionsBlade).onChange( function ( position ) {
            console.log(position)
            renderCut()
        } );
        this.ctrl.stopController = this.gui.add(this.ctrl,'stop',0.0,1000.0,0.125).onChange( function ( stop ) {
            cutPiece.setRemainLengthMaxZ(stop)
            renderCut()
        } );
        this.ctrl.fenceSideController = this.gui.add(this.ctrl,'fenceSide',sidesTBFK).onChange( function ( side ) {
            console.log(side)
            this.object.baseSideController.setValue("Back")
            renderCut()
        } );
        this.ctrl.baseSideController = this.gui.add(this.ctrl,'baseSide',sidesTBFK).onChange( function ( side ) {
            console.log(side)
            renderCut()
        } );    
        this.ctrl.view = this
    }

}
class RightView extends CutView {
    constructor(id, frustum, offsetLeft, offsetTop, up, position) {
        super(id, frustum, offsetLeft, offsetTop, up, position)
        this.ctrl = {
            width: 10, widthController: null,
            depth: 0.0, depthController: null,
            inChange: false,
            fence: 100.0, fenceController: null,
            fenceSide: "Back", fenceSideController: null,
            baseSide: "Bottom", baseSideController: null
        }
        this.gui = {}
        
        this.gridScene = new THREE.Scene();
        this.gridScene.add(MyGridHelper(10000, 100, 10).rotateZ(-Math.PI / 2));
    }
    createGUI() {
        this.gui = new dat.GUI({name: 'Move', width: 200, autoPlace: false })

        var customContainer = document.getElementById('cutrightctrl');
        customContainer.appendChild(this.gui.domElement);

        this.ctrl.widthController = this.gui.add(this.ctrl,'width',1,100.0,1.0).onChange( function ( width ) {
            var defaultCutterShape = new THREE.Vector3(width, 300, 300)
            var cutterGeometry = getThreeBoxGeometry(defaultCutterShape)
            var currentAngle = cutter.angle
            cutter.removeFromScene()
            cutter = new MeshPiece(cutterGeometry,0)
            cutter.changeOrigin(new THREE.Vector3(defaultCutterShape.x/-2,0,0))
            cutter.highlight()
            cutter.addToScene(cutScene, cutObjects)
            cutter.position(new THREE.Vector3(0, 0, 0))
            cutter.setAngleY(currentAngle) 
            renderCut()
        } );        
        this.ctrl.depthController = this.gui.add(this.ctrl,'depth',0,100,1).onChange( function ( depth ) {
            if (!this.object.inChange) {
                this.object.inChange = true 
                var top = cutPiece.getHeight()
                cutter.setDepth(-top,depth)
                var height = cutPiece.getHeight() - depth
                this.object.heightController.setValue(height)
                this.object.inChange = false 
            }
            renderCut()
        } );
        this.ctrl.fenceController = this.gui.add(this.ctrl,'fence',0.0,1000.0,0.125).onChange( function ( fence ) {
            cutPiece.setRemainLengthMaxZ(fence)
            renderCut()
        } );
        this.ctrl.fenceSideController = this.gui.add(this.ctrl,'fenceSide',sidesTBFK).onChange( function ( side ) {
            console.log(side)
            this.object.baseSideController.setValue("Back")
            renderCut()
        } );
        this.ctrl.baseSideController = this.gui.add(this.ctrl,'baseSide',sidesTBFK).onChange( function ( side ) {
            console.log(side)
            renderCut()
        } );
        this.ctrl.view = this
    }
    addCutterAndPieceToScene (cutter,piece,angleY,width,stopRemain) {
        this.cutScene.add(cutter.movegroup)
        this.cutScene.add(piece.movegroup)
        this.ctrl.stopController.setValue(stopRemain)
        this.ctrl.angleController.setValue(angleY)
        this.ctrl.widthController.setValue(width)    
    }
}
function setActiveView(id) {
    var x = document.getElementsByClassName("lm_tab lm_active");
    var i;
    for (i = 0; i < x.length; i++) {
      if (x[i].title == activeSide) x[i].style.backgroundColor = "black";
    }

    activeSide = id
    var i;
    for (i = 0; i < x.length; i++) {
      if (x[i].title == activeSide) x[i].style.backgroundColor = "red";
    }

    switch (activeSide) {
        case 'cuttop':
            rightView.gui.hide()
            frontView.gui.hide()
            topView.gui.show()
            break
        case 'cutfront':
            topView.gui.hide()
            frontView.gui.show()
            rightView.gui.hide()
            break
        case 'cutright':
            topView.gui.hide()
            frontView.gui.hide()
            rightView.gui.show()
            break
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
function addCutterAndPieceToScene (cutter,piece,angleY,width,stopRemain) {
    piece.addToScene(cutScene, cutObjects)
    topView.ctrl.stopController.setValue(stopRemain)
    cutter.addToScene(cutScene, cutObjects)
    topView.ctrl.angleController.setValue(angleY)
    topView.ctrl.widthController.setValue(width)    
    //centerCutScene(piece)
}
function loadCutScene(piece) {
    var bbox = new THREE.Box3().setFromObject(piece.movegroup)
    var size = new THREE.Vector3(bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z)
    var center = new THREE.Vector3((bbox.max.x + bbox.min.x) / 2, (bbox.max.y + bbox.min.y) / 2, (bbox.max.z + bbox.min.z) / 2)

    topView = new TopView('cuttop',
        size.x, center.x, center.z, [0, 0, 1],
        new THREE.Vector3(0, -1000, 0))

    frontView = new FrontView('cutfront',
        size.x, center.x, -center.y, [0, -1, 0],
        new THREE.Vector3(0, 0, -1000))

    rightView = new RightView('cutright',
        size.x, -center.z, -center.y, [0, -1, 0],
        new THREE.Vector3(1000, 0, 0))

    cutpersp = document.getElementById('cutpersp')
    aspect = cutpersp.clientWidth / cutpersp.clientHeight;
    cutPerspCamera = new THREE.PerspectiveCamera(45, aspect, 1, 10000);

    cutPerspCamera.sortObjects = true
    cutPerspCamera.position.set(size.x * 2, size.y * 2, size.z * 2);
    cutPerspCamera.lookAt(new THREE.Vector3());
    cutPerspCamera.up.fromArray([0,-1,0])

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
    topView.createGUI()
    frontView.createGUI()
    rightView.createGUI()
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
function activeView() {
    switch (activeSide) {
        case 'cuttop':
            return topView
        case 'cutfront':
            return frontView
        case 'cutright':
            return rightView
    }
}
function cut(wood,tool) {

  var woodBSP = new ThreeBSP(this.piece.movegroup.geometry)
  var toolGeom = this.cutter.movegroup.geometry.clone()
                    .translate(this.cutter.movegroup.position.x, this.cutter.movegroup.position.y, this.cutter.movegroup.position.z) // move to visible position
                    .translate(-this.piece.movegroup.position.x,-this.piece.movegroup.position.y,-this.piece.movegroup.position.z) // move wood position
  var toolBSP = new ThreeBSP(toolGeom)  

  result = woodBSP.subtract(toolBSP)  
  this.piece.movegroup.geometry = result.toGeometry();
  this.piece.movegroup.geometry.verticesNeedUpdate = true;

  var subMeshes = this.piece.getSubMeshes()

  var mm = minMax(this.piece.movegroup.geometry.vertices)
  assignMaterialToFaces(this.piece.movegroup.geometry,mm.min,mm.max,0,1)

  return subMeshes[0]
 // wireframe0 = new THREE.WireframeHelper( wood , 0xffffff );
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
    topView.renderer.render(topView.gridScene, topView.camera)
    topView.renderer.clearDepth()
    topView.renderer.render(topView.cutScene, topView.camera)

    frontView.renderer.clear()
    frontView.renderer.render(frontView.gridScene, frontView.camera)
    frontView.renderer.clearDepth()
    frontView.renderer.render(frontView.cutScene, frontView.camera)

    rightView.renderer.clear()
    rightView.renderer.render(rightView.gridScene, rightView.camera)
    rightView.renderer.clearDepth()
    rightView.renderer.render(rightView.cutScene, rightView.camera)

    cutPerspRenderer.render(topView.cutScene, cutPerspCamera)
}