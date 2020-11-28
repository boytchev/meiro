
EncodeLinearDepthRGBAShader = {
	defines: {
	},

	uniforms: {
		"uCameraNear": {value: 0.0},
		"uCameraNearMinusCameraFarInv": {value: 0.0},
	},

	vertexShader: [
	
		"uniform highp mat4 modelViewMatrix;",
		"uniform mat4 projectionMatrix;",
		"attribute highp vec3 position;",
		"varying highp float viewSpaceDepth;",

		"void main() {",

			"gl_Position = modelViewMatrix*vec4( position, 1.0 );",
			"viewSpaceDepth = gl_Position.z;",
			"gl_Position = projectionMatrix*gl_Position;",

		"}"

	].join( "\n" ),

	fragmentShader: [
		"precision highp float;",
		"varying highp float viewSpaceDepth;",
		"uniform highp float uCameraNear;",
		"uniform highp float uCameraNearMinusCameraFarInv;",

		// from https://skytiger.wordpress.com/2010/12/01/packing-depth-into-color/
		"const highp vec3 factor = vec3(1.0, 255.0, 65025.0);",
		"const highp float mask = 1.0 / 256.0;",
		
		"highp vec3 UnitToColor24(const in highp float unit) {",
		"	highp vec3 color = unit * factor.rgb;",
		"	color.gb = fract(color.gb);",
		"	color.rg -= color.gb * mask;",
		"	return clamp(color, 0.0, 1.0);",
		"}",

		"void main() {",

			"gl_FragColor = vec4(UnitToColor24((viewSpaceDepth+uCameraNear)*uCameraNearMinusCameraFarInv), 1.0 );",

		"}"

	].join( "\n" )

};
