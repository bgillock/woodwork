var cuttop;
var cutTopCamera, cutScene, cutTopRenderer, cutTopControls;
var cutfront;
var cutFrontCamera, cutFrontRenderer, cutFrontControls;
var cutright;
var cutRightCamera, cutRightRenderer, cutRightControls;
var cutpersp;
var cutPerspCamera, cutPerspRenderer, cutPerspControls;
function loadCutScene(piece) {
    var bbox = new THREE.Box3().setFromObject(piece.group)
    var size = new THREE.Vector3(bbox.max.x-bbox.min.x,bbox.max.y-bbox.min.y,bbox.max.z-bbox.min.z)
    var center = new THREE.Vector3((bbox.max.x+bbox.min.x)/2,(bbox.max.y+bbox.min.y)/2,(bbox.max.z+bbox.min.z)/2)
    
    var frustumSize = size.x;
    cuttop = document.getElementById('cuttop') 
    var aspect = cuttop.clientWidth / cuttop.clientHeight;
    cutTopCamera = new THREE.OrthographicCamera( (frustumSize * aspect / -2) - center.x , 
                                                 (frustumSize * aspect / 2) - center.x, 
                                                 (frustumSize / -2) - center.z, 
                                                 (frustumSize / 2) - center.z,
                                                 1, 2000);
    cutTopCamera.position.set(0,-1000,0); // center x,z above y
    cutTopCamera.lookAt(0,0,0);                                             
    cutTopCamera.up.fromArray( [0,0,-1] ); 
 

    cutTopRenderer = new THREE.WebGLRenderer({ antialias: true });
    cutTopRenderer.setClearColor(0xf0f0f0);
    cutTopRenderer.setPixelRatio(window.devicePixelRatio);
    cutTopRenderer.setSize(cuttop.clientWidth, cuttop.clientHeight);
    
    cutTopControls = new THREE.OrbitControls(cutTopCamera, cutTopRenderer.domElement, renderCut);
    cutTopControls.enabled = true
    cutTopControls.enableRotate = false

    cuttop.appendChild(cutTopRenderer.domElement);
    cuttop.style.cursor = 'auto';
   
    frustumSize = size.x;
    cutfront = document.getElementById('cutfront') 
    aspect = cutfront.clientWidth / cutfront.clientHeight;
    cutFrontCamera = new THREE.OrthographicCamera( (frustumSize * aspect / -2) - center.x , 
                                                 (frustumSize * aspect / 2) - center.x, 
                                                 (frustumSize / -2) + center.y, 
                                                 (frustumSize / 2) + center.y,
                                                 1, 2000);
    cutFrontCamera.position.set(0,0,-1000); // center x,z above y
    cutFrontCamera.lookAt(0,0,0);                                             
    cutFrontCamera.up.fromArray( [0,1,0] );  

    cutFrontRenderer = new THREE.WebGLRenderer({ antialias: true });
    cutFrontRenderer.setClearColor(0xf0f0f0);
    cutFrontRenderer.setPixelRatio(window.devicePixelRatio);
    cutFrontRenderer.setSize(cutfront.clientWidth, cutfront.clientHeight);
    
    cutFrontControls = new THREE.OrbitControls(cutFrontCamera, cutFrontRenderer.domElement, renderCut);
    cutFrontControls.enabled = true
    cutFrontControls.enableRotate = false

    cutfront.appendChild(cutFrontRenderer.domElement);
    cutfront.style.cursor = 'auto';
    
    frustumSize = size.x;
    cutright = document.getElementById('cutright') 
    aspect = cutright.clientWidth / cutright.clientHeight;
    cutRightCamera = new THREE.OrthographicCamera(  (frustumSize / -2) + center.z, 
                                                 (frustumSize / 2) + center.z,
                                                 (frustumSize / -2) + center.y, 
                                                 (frustumSize / 2) + center.y,
                                                 1, 2000);
    cutRightCamera.position.set(-1000,0,0); 
    cutRightCamera.lookAt(0,0,0);                                             
    cutRightCamera.up.fromArray( [0,1,0] );  

    cutRightRenderer = new THREE.WebGLRenderer({ antialias: true });
    cutRightRenderer.setClearColor(0xf0f0f0);
    cutRightRenderer.setPixelRatio(window.devicePixelRatio);
    cutRightRenderer.setSize(cutright.clientWidth, cutright.clientHeight);
    
    cutRightControls = new THREE.OrbitControls(cutRightCamera, cutRightRenderer.domElement, renderCut);
    cutRightControls.enabled = true
    cutRightControls.enableRotate = false

    cutright.appendChild(cutRightRenderer.domElement);
    cutright.style.cursor = 'auto';
    
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

    cutpersp.appendChild(cutPerspRenderer.domElement);
    cutpersp.style.cursor = 'auto';
     
}
function initCutScene() {    
    cutScene = new THREE.Scene();

    // Lights
    var ambientLight = new THREE.AmbientLight(0x606060);
    cutScene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    cutScene.add(directionalLight);
   
    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('keyup', onDocumentKeyUp, false);
    window.addEventListener('resize', onWindowResize, false);
    
    return cutScene
}
function renderCut() {
    if (cutTopCamera == null || cutFrontCamera == null || cutRightCamera == null || cutPerspCamera == null) return
    cutTopRenderer.render(cutScene, cutTopCamera)
    cutFrontRenderer.render(cutScene, cutFrontCamera)
    cutRightRenderer.render(cutScene, cutRightCamera)
    cutPerspRenderer.render(cutScene, cutPerspCamera)
}
