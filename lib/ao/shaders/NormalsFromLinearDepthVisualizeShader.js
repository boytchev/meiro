NormalsFromLinearDepthVisualizeShader = {

	defines: {
		
	},

	uniforms: {

		"tDepth":       				{ value: null },
		"uCameraNear":  				{ value: 0.0 },
		"uCameraNearMinusCameraFar":	{ value: 0.0 },
		"uInverseProjectionAB":			{ value: new THREE.Vector2() },
		"uSize":						{ value: new THREE.Vector2() },
	},
	
	

	vertexShader: [
		"attribute vec3 position;",
		"attribute vec2 uv;",
		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [
	
		"precision highp float;",

		"varying vec2 vUv;",
		
		// rgba encoded linear depth
		"uniform sampler2D tDepth;",
		// inverse size: 1/(renderWidth, renderHeight)
		"uniform vec2 uSize;",
		"uniform float uCameraNear;",
		"uniform float uCameraNearMinusCameraFar;",
		//the 0th and 5th element of the inverse projection matrix
		"uniform vec2 uInverseProjectionAB;",

		// from https://skytiger.wordpress.com/2010/12/01/packing-depth-into-color/
		"const highp vec3 factorinv = 1.0 / vec3(1.0, 255.0, 65025.0);",
		"highp float ColorToUnit24(const in highp vec3 color) {",
		"	return dot(color, factorinv);",
		"}",
		
		"highp float depth(const in vec2 uv)",
		"{",
		"	return ColorToUnit24(texture2D( tDepth, uv ).rgb);",
		"}",
		
		// given uv coordinates and a dpeth value, find the position viewspace
		"vec3 positionViewspace(const in vec2 uv, const in float zViewport)",
		"{",
		"	float zViewspace = zViewport*uCameraNearMinusCameraFar-uCameraNear;",
		"	return vec3(uInverseProjectionAB*(1.0-2.0*uv)*zViewspace, zViewspace);",
		"}",
		// given uv coordinates find the position in viewspace
		"vec3 positionViewspace(const in vec2 uv)",
		"{",
		"	float zViewspace = depth(uv)*uCameraNearMinusCameraFar-uCameraNear;",
		"	return vec3(uInverseProjectionAB*(1.0-2.0*uv)*zViewspace, zViewspace);",
		"}",
		
		"vec2 dx = vec2(uSize.x, 0.0);",
		"vec2 dy = vec2(0.0, uSize.y);",
		
		"vec3 ddx(const in vec2 uv, const in vec3 C)",
		"{",
		"	return positionViewspace(vUv+dx)-C;",
		"}",
		
		"vec3 ddy(const in vec2 uv, const in vec3 C)",
		"{",
		"	return positionViewspace(vUv+dy)-C;",
		"}",
		
		"vec3 getNormal(const in vec2 uv, const in vec3 C)",
		"{",
			"return normalize(cross(ddx(uv, C), ddy(uv, C)));",
		"}",
				

		"void main() {",
			"highp float dp = depth(vUv);",
			"if(dp >= 1.0)",
			"	discard;",
			
			"gl_FragColor = vec4( 0.5*getNormal(vUv, positionViewspace(vUv, dp))+0.5, 1.0 );",

		"}"

	].join( "\n" )

};
