function MyGridHelper( size, divisions, color1, color2 ) {

	size = size || 10;
	divisions = divisions || 10;
	color1 = new THREE.Color( color1 !== undefined ? color1 : 0x444444 );
	color2 = new THREE.Color( color2 !== undefined ? color2 : 0x888888 );

	var center = divisions / 2;
	var step = size / divisions;
	var halfSize = size / 2;

	var vertices = [], colors = [];

	for ( var i = 0, j = 0, k = - halfSize; i <= divisions; i ++, k += step ) {

		vertices.push( - halfSize, 0, k, halfSize, 0, k );
		vertices.push( k, 0, - halfSize, k, 0, halfSize );

		var color = i === center ? color1 : color2;

		color.toArray( colors, j ); j += 3;
		color.toArray( colors, j ); j += 3;
		color.toArray( colors, j ); j += 3;
		color.toArray( colors, j ); j += 3;

	}

	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

	var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );

	THREE.LineSegments.call( this, geometry, material );

}

MyGridHelper.prototype = Object.create( THREE.LineSegments.prototype );
MyGridHelper.prototype.constructor = MyGridHelper;

        