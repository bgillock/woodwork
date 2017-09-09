var cut;
var cutCamera, cutScene, cutRenderer, cutControls;
function initCut() {
    cuttop = document.getElementById('cuttop')
    
    cutScene = new THREE.Scene();
    var origin = new THREE.Vector3(0, 0, 0)
    defaultPiece = new Piece(cutScene, origin, defaultPieceShape)
    selectionMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        opacity: 0.5,
        transparent: true,
    });
    
    // Lights
    var ambientLight = new THREE.AmbientLight(0x606060);
    cutScene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    cutScene.add(directionalLight);
    
    var frustumSize = 500;
    var aspect = cuttop.clientWidth / cuttop.clientHeight;
    var centerObject = new THREE.Vector3((origin.x + defaultPieceShape.x)/2, (origin.y + defaultPieceShape.y)/2, (origin.z + defaultPieceShape.z)/2)

    cutTopCamera = new THREE.OrthographicCamera( (frustumSize * aspect / -2) - centerObject.x , 
                                                 (frustumSize * aspect / 2) - centerObject.x, 
                                                 (frustumSize / -2) - centerObject.z, 
                                                 (frustumSize / 2) - centerObject.z,
                                                 1, 2000);
    cutTopCamera.position.set(0,-1000,0); // center x,z above y
    cutTopCamera.lookAt(0,0,0);                                             
    cutTopCamera.up.fromArray( [0,0,-1] );
    
    cutRenderer = new THREE.WebGLRenderer({ antialias: true });
    cutRenderer.setClearColor(0xf0f0f0);
    cutRenderer.setPixelRatio(window.devicePixelRatio);
    cutRenderer.setSize(cuttop.clientWidth, cuttop.clientHeight);
    
    cutControls = new THREE.OrbitControls(cutTopCamera, cutRenderer.domElement, renderCut);
    cutControls.enabled = true
    cutControls.enableRotate = false
        
    cuttop.appendChild(cutRenderer.domElement);
    cuttop.style.cursor = 'auto';
   
    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('keyup', onDocumentKeyUp, false);
    window.addEventListener('resize', onWindowResize, false);
}
function renderCut() {
    cutRenderer.render(cutScene, cutTopCamera);
}
