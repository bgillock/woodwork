function initPull() {
    document.getElementById('pull').addEventListener('click', onPullClick)
}

function onPullClick() {
    var l = document.getElementById('length').value
    var w = document.getElementById('width').value
    var h = document.getElementById('height').value
    defaultPieceShape = new THREE.Vector3(parseInt(l), parseInt(h), parseInt(w))
    var origin = new THREE.Vector3(defaultPieceShape.x / 2, defaultPieceShape.y / 2, defaultPieceShape.z / 2)
    cutPiece.removeFromScene() // get rid of old one
    var w = document.getElementById("woodtype").selectedIndex;
    cutPiece = new Piece(defaultPieceShape, w)
    cutPiece.addToScene(cutScene, cutObjects)
    cutPiece.position(origin)
    renderCut()
}