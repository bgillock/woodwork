function initPull() {
    document.getElementById('pull').addEventListener('click', onPullClick)
}

function onPullClick() {
    var s = document.getElementById("woodsize").selectedIndex;
    l = sizes[s].l
    w = sizes[s].w
    h = sizes[s].h
    defaultPieceShape = new THREE.Vector3(parseInt(l), parseInt(h), parseInt(w))
    var origin = new THREE.Vector3(defaultPieceShape.x / 2, defaultPieceShape.y / 2, defaultPieceShape.z / 2)
    cutPiece.removeFromScene() // get rid of old one
    var w = document.getElementById("woodtype").selectedIndex;
    cutPiece = new MeshPiece(defaultPieceShape, w)
    cutPiece.addToScene(cutScene, cutObjects)
    cutPiece.position(origin)
    //cutScene = loadCutScene(cutPiece)
    centerCutScene(cutPiece)
    renderCut()
}