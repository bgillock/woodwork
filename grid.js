function MyGridHelper(size, majorDivisions, minorDivisions, color1, color2, color3 ) {

	size = size || 10;
	majorDivisions = majorDivisions || 10; 
    minorDivisions = minorDivisions || 10;
    
	color1 = new THREE.Color( color1 !== undefined ? color1 : 0x000000 );
	color2 = new THREE.Color( color2 !== undefined ? color2 : 0x888888 );
    color3 = new THREE.Color( color3 !== undefined ? color3 : 0x888888 );
    
	var center = majorDivisions / 2;
    var majorStep = size / majorDivisions
    var minorStep = size / (minorDivisions * majorDivisions)
	var halfSize = size / 2;

	var majorVertices = [], majorColors = [];
    var Mj = 0;
    var minorVertices = [], minorColors = [];
    var mj = 0;
	for ( var i = 0, k = - halfSize; i <= majorDivisions * minorDivisions; i ++, k += minorStep ) {
		var color = color3
        if (k == center) {
            
        } else if (k % majorStep == 0) {
            color = color2
            majorVertices.push( - halfSize, 0, k, halfSize, 0, k );
		    majorVertices.push( k, 0, - halfSize, k, 0, halfSize );
            color.toArray( majorColors, Mj ); Mj += 3;
		    color.toArray( majorColors, Mj ); Mj += 3;
		    color.toArray( majorColors, Mj ); Mj += 3;
		    color.toArray( majorColors, Mj ); Mj += 3;
        }
        else {
            color = color3
            minorVertices.push( - halfSize, 0, k, halfSize, 0, k );
		    minorVertices.push( k, 0, - halfSize, k, 0, halfSize );
            color.toArray( minorColors, mj ); mj += 3;
		    color.toArray( minorColors, mj ); mj += 3;
		    color.toArray( minorColors, mj ); mj += 3;
		    color.toArray( minorColors, mj ); mj += 3;
        }
	}

	var majorGeometry = new THREE.BufferGeometry();
	majorGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( majorVertices, 3 ) );
	majorGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( majorColors, 3 ) );

	var majorMaterial = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors, linewidth: 5 } );
	var majorLines = new THREE.LineSegments(majorGeometry, majorMaterial );
    
    var group = new THREE.Group()
    
    group.add(majorLines)
    
	var minorGeometry = new THREE.BufferGeometry();
	minorGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( minorVertices, 3 ) );
	minorGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( minorColors, 3 ) );

	var minorMaterial = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors, linedwidth: 4 } );
	var minorLines = new THREE.LineSegments(minorGeometry, minorMaterial );
    
    group.add(minorLines)
    return group
}


        