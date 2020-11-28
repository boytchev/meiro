/**
 \file SAO_AO.pix
 \author Morgan McGuire and Michael Mara, NVIDIA Research

 Reference implementation of the Scalable Ambient Obscurance (SAO) screen-space ambient obscurance algorithm. 
 
 The optimized algorithmic structure of SAO was published in McGuire, Mara, and Luebke, Scalable Ambient Obscurance,
 <i>HPG</i> 2012, and was developed at NVIDIA with support from Louis Bavoil.

 The mathematical ideas of AlchemyAO were first described in McGuire, Osman, Bukowski, and Hennessy, The 
 Alchemy Screen-Space Ambient Obscurance Algorithm, <i>HPG</i> 2011 and were developed at 
 Vicarious Visions.  
 
 DX11 HLSL port by Leonardo Zide of Treyarch

 <hr>

  Open Source under the "BSD" license: http://www.opensource.org/licenses/bsd-license.php

  Copyright (c) 2011-2012, NVIDIA
  All rights reserved.

  Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

  */

// Adapted for WebGL 1.0 by Vassillen Chizhov

ScalableAmbientObscuranceShader = {

	defines: {
		
	},

	uniforms: {

		"tDepth":       				{ value: null },
		"tDiffuse":       				{ value: null },
		"uCameraNear":  				{ value: 0.0 },
		"uCameraNearMinusCameraFar":	{ value: 0.0 },
		"uInverseProjectionAB":			{ value: new THREE.Vector2() },
		"uSize":						{ value: new THREE.Vector2() },
		
		"uRadius":  					{ value: 1.0 },
		"uIntensityDivR6":  			{ value: 1.0 },
		"uBias":  						{ value: 0.01 },
		"uProjScale":  					{ value: 1.0 },
		
		"uSamples":  					{ value: 11.0 },
		"uSpiralTurns":  				{ value: 7.0 },
		
		"uBlur":  						{ value: false },
		"uCombine":  					{ value: false },
		"uAmbientContribution":  		{ value: 0.2 },
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
		
		"#define PI 3.14159265359",
		"#define PI2 6.28318530718",
		"#define EPSILON 0.01",
		"#define MAX_SAMPLES 128.0",
		//"#define NUM_SPIRAL_TURNS 7.0",
		
		
		// rgb encoded linear depth
		"uniform highp sampler2D tDepth;",
		"uniform sampler2D tDiffuse;",
		// inverse size: 1/(renderWidth, renderHeight)
		"uniform vec2 uSize;",
		"uniform float uCameraNear;",
		"uniform float uCameraNearMinusCameraFar;",
		//the 0th and 5th element of the inverse projection matrix
		"uniform vec2 uInverseProjectionAB;",
		
		/* The height in pixels of a 1m object if viewed from 1m away.  
		You can compute it from your projection matrix.  The actual value is just
		a scale factor on radius; you can simply hardcode this to a constant (~500)
		and make your radius value unitless (...but resolution dependent.)  */
		// in this case it's not pixels, since the texutres are defined in [0,1]x[0,1]
		// Let p1 be a point in viewspace: p1 = (0,1,-1)(object with height 1 at distance 1 from the camera), then:
		// (cameraProjection*p1).y/-p1.z = projection of the y coordinate: n/t - uProjScale == n/t == projectionMatrix[5]
		"uniform float uProjScale;",
		
		// user variables
		"uniform float uRadius;",
		"uniform float uIntensityDivR6;",
		"uniform float uBias;",
		
		"uniform float uSamples;",
		"uniform float uSpiralTurns;",
		
		"uniform bool uBlur;",
		"uniform bool uCombine;",
		"uniform float uAmbientContribution;",
		
		// precomputed stuff
		"vec2 dx = vec2(uSize.x, 0.0);",
		"vec2 dy = vec2(0.0, uSize.y);",
		"float radius2 = uRadius*uRadius;",
		"float invMaxSamples = 1.0/uSamples;",

		// from https://skytiger.wordpress.com/2010/12/01/packing-depth-into-color/
		"const highp vec3 factorinv = 1.0 / vec3(1.0, 255.0, 65025.0);",
		"highp float ColorToUnit24(const in highp vec3 color) {",
		"	return dot(color, factorinv);",
		"}",
		
		"highp float depth(const in vec2 uv)",
		"{",
		"	return ColorToUnit24(texture2D( tDepth, uv ).rgb);",
		"}",
		
		// position reconstruction:
		
		// given uv coordinates and a dpeth value, find the position viewspace
		"vec3 positionViewspace(const in vec2 uv, const in highp float zViewport)",
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
		
		// rand from three js
		"float rand( const in vec2 uv ) {",
		"	const float a = 12.9898, b = 78.233, c = 43758.5453;",
		"	float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );",
		"	return fract(sin(sn) * c);",
		"}",
		
		
		
		/* Returns a unit vector and a screen-space radius for the tap on a unit disk (the caller should scale by the actual disk radius) */
		"vec2 tapLocation(const in float sampleNumber, const in float spinAngle, out float ssR){",
			// Radius relative to ssR
		"	float alpha = (sampleNumber + 0.5) * invMaxSamples;",
		"	float angle = alpha * uSpiralTurns * PI2 + spinAngle;",

		"	ssR = alpha;",
		"	return vec2(cos(angle), sin(angle));",
		"}",
		
		/* Read the camera-space position of the point at screen-space pixel ssP + unitOffset * ssR.  Assumes length(unitOffset) == 1 */
		"vec3 getOffsetPosition(const in vec2 ssC, const in vec2 unitOffset, const in float ssR) {",
			//  Derivation:
			//  mipLevel = floor(log(ssR / MAX_OFFSET));
			//int mipLevel = clamp((int)floor(log2(ssR)) - LOG_MAX_OFFSET, 0, MAX_MIP_LEVEL);

			"vec2 ssP = ssC + ssR*unitOffset;",

			"vec3 P;",

			// Divide coordinate by 2^mipLevel
			//P.z = CS_Z_buffer.Load(int3(ssP >> mipLevel, mipLevel)).r;

			// Offset to pixel center
			"P = positionViewspace(ssP, depth(ssP));",

			"return P;",
		"}",
		
		/* Compute the occlusion due to sample with index i about the pixel at ssC that corresponds
		to camera-space point C with unit normal n_C, using maximum screen-space sampling radius ssDiskRadius */
		"float sampleAO(const in vec2 ssC, const in vec3 C, const in vec3 n_C, const in float ssDiskRadius, const in float tapIndex, const in float randomPatternRotationAngle) {",
			// Offset on the unit disk, spun for this pixel
		"	float ssR;",
		"	vec2 unitOffset = tapLocation(tapIndex, randomPatternRotationAngle, ssR);;",
		"	ssR *= ssDiskRadius;",

			// The occluding point in camera space
		"	vec3 Q = getOffsetPosition(ssC, unitOffset, ssR);",

		"	vec3 v = Q - C;",

		"	float vv = dot(v, v);",
		"	float vn = dot(v, n_C);",
		
		// A: From the HPG12 paper
		// Note large epsilon to avoid overdarkening within cracks
		//"return float(vv < radius2) * max((vn - uBias) / (EPSILON + vv), 0.0) * radius2 * 0.6;",
		
		// B: Smoother transition to zero (lowers contrast, smoothing out corners). [Recommended]
		"	float f = max(radius2 - vv, 0.0); return f * f * f * max((vn - uBias) / (EPSILON + vv), 0.0);",
		
		// C: Medium contrast (which looks better at high radii), no division.  Note that the 
		// contribution still falls off with radius^2, but we've adjusted the rate in a way that is
		// more computationally efficient and happens to be aesthetically pleasing.
		//"return 4.0 * max(1.0 - vv * invRadius2, 0.0) * max(vn - uBias, 0.0);",
		
		// D: Low contrast, no division operation
		//"return 2.0 * float(vv < radius * radius) * max(vn - bias, 0.0);",
		
		"}",

		"void main() {",
			"highp float dp = depth(vUv);",
			// other values can be chosen to limit the effect of AO to a certain distance, currently only pixels with no geometry get discarded
			"if(dp >= 1.0) discard;",
			// viewspace position of the pixel being shaded
			"vec3 C = positionViewspace(vUv, dp);",
			//in the original paper: float randomPatternRotationAngle = (3 * ssC.x ^ ssC.y + ssC.x * ssC.y) * 10;
			//glsl 3.0> doesn't support bitwise operations though, so:
			"float randomPatternRotationAngle = rand(vUv)*PI2;",
			// normal of the pixel being shaded
			"vec3 right = positionViewspace(vUv+dx)-C;",
			"vec3 up = positionViewspace(vUv+dy)-C;",
			"vec3 n_C = normalize(cross(right, up));",
			// there's a minus since C.z is negative, camera is looking along -z in viewspace
			"float ssDiskRadius = -uProjScale * uRadius / C.z;",
			
			"float sum = 0.0;",
			"for (float i = 0.0; i < MAX_SAMPLES; ++i) {",
			"	 if(i==uSamples) break;",
			"	 sum += sampleAO(vUv, C, n_C, ssDiskRadius, i, randomPatternRotationAngle);",
			"}",

			"float A = max(0.0, 1.0 - sum * uIntensityDivR6 * 5.0 * invMaxSamples);",

			// Bilateral box-filter over a quad for free, respecting depth edges
			// (the difference that this makes is subtle)
			/*("if (abs(right.z) < 0.02) {",
			"	A -= ddx(A) * ((ssC.x & 1) - 0.5);",
			"}",
			"if (abs(up.z) < 0.02) {",
			"	A -= ddy(A) * ((ssC.y & 1) - 0.5);",
			"}",*/
			"gl_FragColor = uBlur ? vec4(texture2D( tDepth, vUv ).rgb, A) : uCombine ? vec4( uAmbientContribution*A*texture2D(tDiffuse, vUv).rgb, 1.0 ) : vec4( vec3(A), 1.0 );",
		"}"

	].join( "\n" )

};
