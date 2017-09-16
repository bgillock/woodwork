function initPull(){
    document.getElementById('pull').addEventListener('click', onPullClick)
}
function onPullClick(){
    var l = document.getElementById('length').value
    var w = document.getElementById('width').value
    var h = document.getElementById('height').value   
    defaultPieceShape = new THREE.Vector3(parseInt(l), parseInt(h), parseInt(w))
    var origin = new THREE.Vector3(0, 0, 0)
    cutPiece.removeFromScene() // get rid of old one
    cutPiece = new Piece(origin, defaultPieceShape)
    cutPiece.addToScene(cutScene, cutObjects, origin)
    renderCut()
}