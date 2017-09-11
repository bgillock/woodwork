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
        this.renderer.setClearColor(0xf0f0f0);
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(this.cut.clientWidth, this.cut.clientHeight)

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement, renderCut);
        this.controls.enabled = true
        this.controls.enableRotate = false

        this.cut.appendChild(this.renderer.domElement)
        this.cut.style.cursor = 'auto'
    }
}

function loadCutScene(piece) {
    var bbox = new THREE.Box3().setFromObject(piece.group)
    var size = new THREE.Vector3(bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z)
    var center = new THREE.Vector3((bbox.max.x + bbox.min.x) / 2, (bbox.max.y + bbox.min.y) / 2, (bbox.max.z + bbox.min.z) / 2)

    topView = new CutView('cuttop',
        size.x, -center.x, -center.z, [0, 0, -1],
        new THREE.Vector3(0, -1000, 0))

    frontView = new CutView('cutfront',
        size.x, -center.x, center.y, [0, 1, 0],
        new THREE.Vector3(0, 0, -1000))

    rightView = new CutView('cutright',
        size.x, center.z, center.y, [0, 1, 0],
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
    if (topView == null || frontView == null || rightView == null || cutPerspCamera == null) return
    topView.renderer.render(cutScene, topView.camera)
    frontView.renderer.render(cutScene, frontView.camera)
    rightView.renderer.render(cutScene, rightView.camera)
    cutPerspRenderer.render(cutScene, cutPerspCamera)
}

$(function() {
    var handle = $("#lengthSlider-handle");
    $("#lengthSlider").slider({
        range: "max",
        min: 0, // min value
        max: 1000, // max value
        step: 1,
        value: cutPiece.size.x,
        create: function() {
            handle.text($(this).slider("value"));
        },
        slide: function(event, ui) {
            lengthSlider = ui.value;
            handle.text(lengthSlider);
            cutPiece.remove()

            // backgroundShiftDown = 1000 - lengthSlider
            // backgroundPosition = lengthSlider + 'px ' + backgroundShiftDown + 'px';
            //         refreshBackground();
            // $('#backgroundPositionSelect > div > a').css("background-color", '#FFF');
        }
    });
});