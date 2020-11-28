
EncodeDepthRGBAShader = {
	defines: {
	},

	uniforms: {
	},

	vertexShader: [
	
		"uniform mat4 modelViewMatrix;",
		"uniform mat4 projectionMatrix;",
		"attribute vec3 position;",

		"void main() {",

			"gl_Position = projectionMatrix*modelViewMatrix*vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [
		"precision highp float;",

		"const float PackUpscale = 256. / 255.; // fraction -> 0..1 (including 1)",
		"const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256.,  256. );",
		"const float ShiftRight8 = 1. / 256.;",
		
		"vec4 packDepthToRGBA( const in float v ) {",
		"	vec4 r = vec4( fract( v * PackFactors ), v );",
		"	r.yzw -= r.xyz * ShiftRight8; // tidy overflow",
		"	return r * PackUpscale;",
		"}",

		"void main() {",

			"gl_FragColor = packDepthToRGBA( gl_FragCoord.z );",

		"}"

	].join( "\n" )

};
