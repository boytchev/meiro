
DepthVisualizeShader = {
	defines: {
		
	},

	uniforms: {

		"tDepth": { value: null },
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
		"precision mediump float;",
	
		"uniform highp sampler2D tDepth;",
		
		// from https://skytiger.wordpress.com/2010/12/01/packing-depth-into-color/
		"const highp vec3 factorinv = 1.0 / vec3(1.0, 255.0, 65025.0);",
		"highp float ColorToUnit24(const in highp vec3 color) {",
		"	return dot(color, factorinv);",
		"}",
		
		"varying vec2 vUv;",

		"void main() {",

			"highp vec4 texel = texture2D( tDepth, vUv );",
			"gl_FragColor = vec4(vec3(ColorToUnit24(texel.rgb)), 1.0);",

		"}"

	].join( "\n" )

};
