// FSSAO shaders
// based on THREE.js FSSAOSHader.js by alteredq / http://alteredqualia.com/
MEIRO.SHADER.FSSAO = {
	uniforms: {
		"tDiffuse":     { value: null },
		"tDepth":       { value: null },
		"size":         { value: new THREE.Vector2( 512, 512 ) },
		"cameraNear":   { value: 1 },
		"cameraFar":    { value: 100 },
		"aoClamp":      { value: 0.15 },
	},

	vertexShader: [
		"varying vec2 vUv;",
		"void main()",
		"{",
			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"

	].join( "\n" ),

	fragmentShader: [
		"uniform float cameraNear;",
		"uniform float cameraFar;",

		"uniform vec2 size;",        // texture width, height
		"uniform float aoClamp;",    // depth clamp - reduces haloing at screen edges

		"uniform float lumInfluence;",  // how much luminance affects occlusion

		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tDepth;",

		"varying vec2 vUv;",

		// "#define PI 3.14159265",
		"#define DL 2.399963229728653",  // PI * ( 3.0 - sqrt( 5.0 ) )
		"#define EULER 2.718281828459045",

		// user variables

		"const int samples = 6;",     // ao sample count
		"const float radius = 20.0;",  // ao radius

		"const float diffArea = 0.5;",   // self-shadowing reduction
		"const float gDisplace = 0.5;",  // gauss bell center
		"const float noiseAmount = 0.0005;",  // gauss bell center

		// RGBA depth
		"#include <packing>",

		// generating noise / pattern texture for dithering
		"vec2 rand( const vec2 coord )",
		"{",
			"float nx = dot ( coord, vec2( 12.9898, 78.233 ) );",
			"float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );",
			"vec2 noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );",
			"return ( noise * 2.0  - 1.0 ) * noiseAmount;",
		"}",

		// get the depth at given coordinates
		"float readDepth( const in vec2 coord )",
		"{",
			"float cameraFarPlusNear = cameraFar + cameraNear;",
			"float cameraFarMinusNear = cameraFar - cameraNear;",
			"float cameraCoef = 2.0 * cameraNear;",

			"float z = unpackRGBAToDepth( texture2D( tDepth, coord ) );",

			"return cameraCoef / ( cameraFarPlusNear - z * cameraFarMinusNear );",
		"}",

		"float compareDepths( const in float depth1, const in float depth2, inout int far )",
		"{",
			"float garea = 2.0;",                         // gauss bell width
			"float diff = ( depth1 - depth2 ) * 100.0;",  // depth difference (0-100)

			// reduce left bell width to avoid self-shadowing
			"if ( diff < gDisplace )",
			"{",
				"garea = diffArea;",
			"} else {",
				"far = 1;",
			"}",

			"float dd = diff - gDisplace;",
			"float gauss = pow( EULER, -2.0 * dd * dd / ( garea * garea ) );",
			"return gauss;",
		"}",

		"float calcAO( float depth, float dw, float dh )",
		"{",
			"float dd = radius - depth * radius;",
			"vec2 vv = vec2( dw, dh );",

			"vec2 coord1 = vUv + dd * vv;",
			"vec2 coord2 = vUv - dd * vv;",

			"float temp1 = 0.0;",
			"float temp2 = 0.0;",

			"int far = 0;",
			"temp1 = compareDepths( depth, readDepth( coord1 ), far );",

			// DEPTH EXTRAPOLATION

			"if ( far > 0 )",
			"{",
				"temp2 = compareDepths( readDepth( coord2 ), depth, far );",
				"temp1 += ( 1.0 - temp1 ) * temp2;",
			"}",

			"return pow(abs(temp1),0.2);",
		"}",

		"void main()",
		"{",
			"vec2 noise = rand( vUv );",
			"float depth = readDepth( vUv );",

			"float tt = clamp( depth, aoClamp, 1.0 );",

			"float w = ( 1.0 / size.x ) / tt + ( noise.x * ( 1.0 - noise.x ) );",
			"float h = ( 1.0 / size.y ) / tt + ( noise.y * ( 1.0 - noise.y ) );",

			"float ao = 0.0;",

			"float dz = 0.5 / float( samples );", 
			"float z = 1.0 - dz / 2.0;",
			"float l = vUv.x+vUv.y;",

			"for ( int i = 0; i <= samples; i ++ )",
			"{",
				"float r = sqrt( 1.0 - z );",

				"float pw = cos( l ) * r;",
				"float ph = sin( l ) * r;",
				"ao += calcAO( depth, pw * w, ph * h );",
				"z = z - dz;",
				"l = l + DL;",
			"}",

			"ao /= float( samples );",
			"ao = pow(abs(1.0-ao),0.125);",

			"vec3 color = texture2D( tDiffuse, vUv ).rgb;",
			"ao = ao*(1.0-pow(depth,4.0));",
			"ao = clamp((ao - 0.5) * 1.3 + 0.5, 0.0, 1.0);",
			"vec3 final = ao*color;",
			"gl_FragColor = vec4( final, 1.0 );",
		"}"
	].join( "\n" )
};
