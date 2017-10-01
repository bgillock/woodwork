// Grid helper
function MyGridHelper(size, majorStep, minorStep, centerColor, majorColor, minorColor) {
    size = size || 10000;
    majorStep = majorStep || 100;
    minorStep = minorStep || 10;

    centerColor = new THREE.Color(centerColor !== undefined ? centerColor : 0x000000);
    majorColor = new THREE.Color(majorColor !== undefined ? majorColor : 0x999999);
    minorColor = new THREE.Color(minorColor !== undefined ? minorColor : 0xCCCCCC);

    var center = 0
    var halfSize = size / 2;

    var majorVertices = [],
        majorColors = [];
    var Mj = 0;
    var minorVertices = [],
        minorColors = [];
    var mj = 0;
    var centerVertices = [],
        centerColors = [];
    var cj = 0;
    for (var k = -halfSize; k <= halfSize; k += minorStep) {
        var color = minorColor
        if (k == center) {
            color = centerColor
            centerVertices.push(-halfSize, 0, k, halfSize, 0, k);
            centerVertices.push(k, 0, -halfSize, k, 0, halfSize);
            color.toArray(centerColors, cj);
            cj += 3;
            color.toArray(centerColors, cj);
            cj += 3;
            color.toArray(centerColors, cj);
            cj += 3;
            color.toArray(centerColors, cj);
            cj += 3;
        } else if (k % majorStep == 0) {
            color = majorColor
            majorVertices.push(-halfSize, 0, k, halfSize, 0, k);
            majorVertices.push(k, 0, -halfSize, k, 0, halfSize);
            color.toArray(majorColors, Mj);
            Mj += 3;
            color.toArray(majorColors, Mj);
            Mj += 3;
            color.toArray(majorColors, Mj);
            Mj += 3;
            color.toArray(majorColors, Mj);
            Mj += 3;
        } else {
            color = minorColor
            minorVertices.push(-halfSize, 0, k, halfSize, 0, k);
            minorVertices.push(k, 0, -halfSize, k, 0, halfSize);
            color.toArray(minorColors, mj);
            mj += 3;
            color.toArray(minorColors, mj);
            mj += 3;
            color.toArray(minorColors, mj);
            mj += 3;
            color.toArray(minorColors, mj);
            mj += 3;
        }
    }

    var majorGeometry = new THREE.BufferGeometry();
    majorGeometry.addAttribute('position', new THREE.Float32BufferAttribute(majorVertices, 3));
    majorGeometry.addAttribute('color', new THREE.Float32BufferAttribute(majorColors, 3));

    var majorMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors, linewidth: 2 });
    var majorLines = new THREE.LineSegments(majorGeometry, majorMaterial);

    var group = new THREE.Group()

    group.add(majorLines)

    var minorGeometry = new THREE.BufferGeometry();
    minorGeometry.addAttribute('position', new THREE.Float32BufferAttribute(minorVertices, 3));
    minorGeometry.addAttribute('color', new THREE.Float32BufferAttribute(minorColors, 3));

    var minorMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors, linedwidth: 1 });
    var minorLines = new THREE.LineSegments(minorGeometry, minorMaterial);

    group.add(minorLines)

    var centerGeometry = new THREE.BufferGeometry();
    centerGeometry.addAttribute('position', new THREE.Float32BufferAttribute(centerVertices, 3));
    centerGeometry.addAttribute('color', new THREE.Float32BufferAttribute(centerColors, 3));

    var centerMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors, linedwidth: 4 });
    var centerLines = new THREE.LineSegments(centerGeometry, centerMaterial);
    group.add(centerLines)

    centerGeometry.computeBoundingBox()
    var plane = new THREE.Mesh(centerGeometry, new THREE.MeshBasicMaterial({
        visible: false
    }))
    group.add(plane)

    return group
}