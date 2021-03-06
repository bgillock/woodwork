const ARROW_UP = 38
const ARROW_LEFT = 37
const ARROW_RIGHT = 39
const ARROW_DOWN = 40
const END = 35
const ENTER = 220
const HOME = 36
const CONTROL = 17
const SHIFT = 16
const DELETE = 46
const PAGEDOWN = 34
const PAGEUP = 33
const INSERT = 45
var lastCursor = null
var rotate = false
var step = 1
var activeSide = 'assembly'
function onActive(event) {
    setActiveView(event.currentTarget.id)
    renderCut()
}
function onDocumentKeyUp(event) {
    if (activeSide == 'assembly') {
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
                        selectedPiece.position(selectedPiece.movegroup.position.clone())
                        selectedPiece.removeHit()
                        selectedPiece.placeOnTop(assemblyObjects, 1000, selectedPiece.movegroup.position.clone())
                        selectedPiece.addHit()
                        break
                }
                break
            case 38: // up arrow
                switch (state) {
                    case STATE.SELECT:
                    case STATE.MOVE:
                        selectedPiece.movegroup.rotateX(-Math.PI / 4)
                        selectedPiece.position(selectedPiece.movegroup.position.clone())
                        selectedPiece.removeHit()
                        selectedPiece.placeOnTop(assemblyObjects, 1000, selectedPiece.movegroup.position.clone())
                        selectedPiece.addHit()
                        break
                }
                break
            case 39: // right arrow
                switch (state) {
                    case STATE.SELECT:
                    case STATE.MOVE:
                        selectedPiece.movegroup.rotateY(-Math.PI / 4).updateMatrixWorld(true)
                        selectedPiece.position(selectedPiece.movegroup.position.clone())
                        selectedPiece.removeHit()
                        selectedPiece.placeOnTop(assemblyObjects, 1000, selectedPiece.movegroup.position.clone())
                        selectedPiece.addHit()
                        break
                }
                break
            case 40: // down arrow
                switch (state) {
                    case STATE.SELECT:
                    case STATE.MOVE:
                        selectedPiece.movegroup.rotateX(Math.PI / 4)
                        selectedPiece.position(selectedPiece.movegroup.position.clone())
                        selectedPiece.removeHit()
                        selectedPiece.placeOnTop(assemblyObjects, 1000, selectedPiece.movegroup.position.clone())
                        selectedPiece.addHit()
                        break
                }
                break;
        }
        renderAssembly()
    } else {
        switch (event.keyCode) {
            case CONTROL:
                step = 1
                break
            case SHIFT:
                step = 1
                break
        }
    }
}
function onDocumentKeyDown(event) {
    var cutter = activeView().cutter
    var cutPiece = activeView().piece

    if (activeSide == 'assembly') {
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
    } else {
        switch (event.keyCode) {
            case CONTROL:
                step = 10
                break
            case SHIFT:
                step = 100
                break
            case ARROW_UP: 
                switch (activeSide) {
                    case 'cuttop': 
                        break
                    case 'cutfront':                    
                    case 'cutright':
                        cutter.movegroup.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, -step, 0 ) );
                        frontView.ctrl.depthController.setValue(cutter.getDepth(cutPiece.getHeight()))
                        rightView.ctrl.depthController.setValue(cutter.getDepth(cutPiece.getHeight()))
                        break
                }
                cutter.movegroup.geometry.verticesNeedsUpdate = true
                renderCut()
                break
            case ARROW_DOWN:
                switch (activeSide) {
                    case 'cuttop': 
                        break
                    case 'cutfront':                    
                    case 'cutright':
                        cutter.movegroup.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, step, 0 ) );
                        frontView.ctrl.depthController.setValue(cutter.getDepth(cutPiece.getHeight()))
                        rightView.ctrl.depthController.setValue(cutter.getDepth(cutPiece.getHeight()))
                        break
                }
                cutter.movegroup.geometry.verticesNeedsUpdate = true
                renderCut()
                break 
            case ARROW_RIGHT:
                switch (activeSide) {
                    case 'cuttop':     
                    case 'cutfront':
                        cutPiece.movegroup.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( step, 0, 0 ) );
                        frontView.ctrl.stopController.setValue(cutPiece.getRemainLengthMaxZ())
                        topView.ctrl.stopController.setValue(cutPiece.getRemainLengthMaxZ()) 
                        break
                    case 'cutright':
                        cutPiece.movegroup.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, -step ) );
                        break
                }
                cutter.movegroup.geometry.verticesNeedsUpdate = true
                renderCut()
                break
            case ARROW_LEFT:     
                switch (activeSide) {
                    case 'cuttop':      
                    case 'cutfront':
                        cutPiece.movegroup.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( -step, 0, 0 ) );
                        frontView.ctrl.stopController.setValue(cutPiece.getRemainLengthMaxZ())                        
                        topView.ctrl.stopController.setValue(cutPiece.getRemainLengthMaxZ())
                        break

                    case 'cutright':
                        cutPiece.movegroup.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, step ) );
                        break
                }
                cutter.movegroup.geometry.verticesNeedsUpdate = true
                renderCut()
                break
            case PAGEDOWN:
                switch (activeSide) {
                    case 'cuttop':
                        cutter.movegroup.geometry.rotateY(-Math.PI / 4)  
                        break              
                    case 'cutfront':
                        cutter.movegroup.geometry.rotateZ(-Math.PI / 4)
                        break
                    case 'cutright':
                        cutter.movegroup.geometry.rotateX(-Math.PI / 4)
                        break
                }
                cutter.movegroup.geometry.verticesNeedsUpdate = true
                renderCut()
                break
            case PAGEUP:
                switch (activeSide) {
                    case 'cuttop':
                        cutPiece.movegroup.geometry.rotateZ(-Math.PI)  
                        break              
                    case 'cutfront':
                        cutPiece.movegroup.geometry.rotateY(-Math.PI)
                        break
                    case 'cutright':
                        cutPiece.movegroup.geometry.rotateX(-Math.PI)
                        break
                }
                cutPiece.movegroup.geometry.verticesNeedsUpdate = true
                renderCut()
                break
            case DELETE:
                switch (activeSide) {
                    case 'cuttop':
                        cutter.movegroup.geometry.rotateY(Math.PI / 4)  
                        break              
                    case 'cutfront':
                        cutter.movegroup.geometry.rotateZ(Math.PI / 4)
                        break
                    case 'cutright':
                        cutter.movegroup.geometry.rotateX(Math.PI / 4)
                        break
                }
                cutter.movegroup.geometry.verticesNeedsUpdate = true
                renderCut()
                break
            case HOME:
                var defaultCutterShape = new THREE.Vector3(20, 300, 300)
                defaultCutterShape.copy(getCutterSize(defaultPieceShape))
                cutScene.remove(cutter.movegroup)
                cutter = new MeshPiece(defaultCutterShape,0)
                cutter.changeOrigin(new THREE.Vector3(defaultCutterShape.x/-2,0,0))
                cutter.highlight()
                cutter.movegroup.geometry.verticesNeedsUpdate = true;
                cutScene.add(cutter.movegroup)
                renderCut()
                break   
            case ENTER: // x = make cut

                var newMesh = activeView().subtractCutterFromPiece()
                //cutPiece.replaceMesh(newMesh)
                renderCut()
                break
        }
    }
}