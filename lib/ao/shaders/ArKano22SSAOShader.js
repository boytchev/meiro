/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Screen-space ambient occlusion shader
 * - ported from
 *   SSAO GLSL shader v1.2
 *   assembled by Martins Upitis (martinsh) (http://devlog-martinsh.blogspot.com)
 *   original technique is made by ArKano22 (http://www.gamedev.net/topic/550699-ssao-no-halo-artifacts/)
 * - modifications
 * - modified to use RGBA packed depth texture (use clear color 1,1,1,1 for depth pass)
 * - refactoring and optimizations
 */

ArKano22SSAOShader = {

	defines: {
		MAX_SAMPLES: 32
	},

	uniforms: {

		"tDiffuse":     { value: null },
		"tDepth":       { value: null },
		"uSize":        { value: new THREE.Vector2( 512, 512 ) },
		"uCameraNear":  { value: 1 },
		"uCameraFar":   { value: 100 },
		"uCombine":     { value: 0 },
		"uAOClamp":     { value: 0.5 },
		"uLumInfluence":{ value: 0.5 },
		"uSamples":		{ value: 8   },
		"uUseNoise":	{ value: false },
		"uRadius":		{ value: 5.0 },
		"uNoiseAmount": { value: 0.0003 },
		"uDiffArea":	{ value: 0.4 },
		"uGDisplace":	{ value: 0.4 },
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
		"uniform float uCameraNear;",
		"uniform float uCameraFar;",

		"uniform bool uCombine;",      // combine with the image from the render pass

		"uniform vec2 uSize;",        // texture width, height
		"uniform float uAOClamp;",    // depth clamp - reduces haloing at screen edges

		"uniform float uLumInfluence;",  // how much luminance affects occlusion

		"uniform sampler2D tDiffuse;",
		"uniform highp sampler2D tDepth;",

		"varying vec2 vUv;",

		// "#define PI 3.14159265",
		"#define DL 2.399963229728653",  // PI * ( 3.0 - sqrt( 5.0 ) )
		"#define EULER 2.718281828459045",

		// user variables

		"uniform int   uSamples;",     // ao sample count
		"uniform float uRadius;",    // ao radius

		"uniform bool  uUseNoise;",      	 // use noise instead of pattern for sample dithering
		"uniform float uNoiseAmount;",       // dithering amount

		"uniform float uDiffArea;",      // self-shadowing reduction
		"uniform float uGDisplace;",    // gauss bell center


		// RGBA depth

		"#include <packing>",

		// generating noise / pattern texture for dithering

		"vec2 rand( const vec2 coord ) {",

			"vec2 noise;",

			"if ( uUseNoise ) {",

				"float nx = dot ( coord, vec2( 12.9898, 78.233 ) );",
				"float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );",

				"noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );",

			"} else {",

				"float ff = fract( 1.0 - coord.s * ( uSize.x / 2.0 ) );",
				"float gg = fract( coord.t * ( uSize.y / 2.0 ) );",

				"noise = vec2( 0.25, 0.75 ) * vec2( ff ) + vec2( 0.75, 0.25 ) * gg;",

			"}",

			"return ( noise * 2.0  - 1.0 ) * uNoiseAmount;",

		"}",

		"float readDepth( const in vec2 coord ) {",

			"float cameraFarPlusNear = uCameraFar + uCameraNear;",
			"float cameraFarMinusNear = uCameraFar - uCameraNear;",
			"float cameraCoef = 2.0 * uCameraNear;",
			"float z = unpackRGBAToDepth( texture2D( tDepth, coord ) );",
			"return cameraCoef / ( cameraFarPlusNear - z * cameraFarMinusNear );",


		"}",

		"float compareDepths( const in float depth1, const in float depth2, inout int far ) {",

			"float garea = 2.0;",                         // gauss bell width
			"float diff = ( depth1 - depth2 ) * 100.0;",  // depth difference (0-100)

			// reduce left bell width to avoid self-shadowing

			"if ( diff < uGDisplace ) {",

				"garea = uDiffArea;",

			"} else {",

				"far = 1;",

			"}",

			"float dd = diff - uGDisplace;",
			"float gauss = pow( EULER, -2.0 * dd * dd / ( garea * garea ) );",
			"return gauss;",

		"}",

		"float calcAO( float depth, float dw, float dh ) {",

			"float dd = uRadius - depth * uRadius;",
			"vec2 vv = vec2( dw, dh );",

			"vec2 coord1 = vUv + dd * vv;",
			"vec2 coord2 = vUv - dd * vv;",

			"float temp1 = 0.0;",
			"float temp2 = 0.0;",

			"int far = 0;",
			"temp1 = compareDepths( depth, readDepth( coord1 ), far );",

			// DEPTH EXTRAPOLATION

			"if ( far > 0 ) {",

				"temp2 = compareDepths( readDepth( coord2 ), depth, far );",
				"temp1 += ( 1.0 - temp1 ) * temp2;",

			"}",

			"return temp1;",

		"}",

		"void main() {",

			"float depth = readDepth( vUv );",
			"if(depth>0.99) discard;",
			"vec2 noise = rand( vUv );",

			"float tt = clamp( depth, uAOClamp, 1.0 );",

			"float w = ( 1.0 / uSize.x )  / tt + ( noise.x * ( 1.0 - noise.x ) );",
			"float h = ( 1.0 / uSize.y ) / tt + ( noise.y * ( 1.0 - noise.y ) );",

			"float ao = 0.0;",

			"float dz = 1.0 / float( uSamples );",
			"float z = dz * 0.5;",
			"float l = 0.0;",

			"for ( int i = 0; i <= MAX_SAMPLES; i ++ ) {",

				"if(uSamples==i)",
				"	break;",
				"float r = sqrt( z );",

				"float pw = cos( l ) * r;",
				"float ph = sin( l ) * r;",
				"ao += calcAO( depth, pw * w, ph * h );",
				"z = z + dz;",
				"l = l + DL;",
			"}",

			"ao /= float( uSamples );",
			"ao = 1.0 - ao;",

			
			"vec3 luminance = vec3( 1.0 );",

			
			"vec3 final;",  
			"if ( uCombine ) {",

				"vec3 color = texture2D( tDiffuse, vUv ).rgb;",
				"vec3 lumcoeff = vec3( 0.299, 0.587, 0.114 );",
				"float lum = dot( color.rgb, lumcoeff );",
				"vec3 luminance = vec3( lum );",
				"final = vec3( color * mix( vec3( ao ), vec3( 1.0 ), luminance * uLumInfluence ) );",

			"}",
			"else{",

				"final = vec3( mix( vec3( ao ), vec3( 1.0 ), luminance * uLumInfluence ) );",  // ambient occlusion only

			"}",

			"gl_FragColor = vec4( final, 1.0 );",

		"}"

	].join( "\n" )

};
