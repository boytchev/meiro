/** 
  \file SAO_blur.pix
  \author Morgan McGuire and Michael Mara, NVIDIA Research

  \brief 7-tap 1D cross-bilateral blur using a packed depth key

  DX11 HLSL port by Leonardo Zide, Treyarch
  
  Open Source under the "BSD" license: http://www.opensource.org/licenses/bsd-license.php

  Copyright (c) 2011-2012, NVIDIA
  All rights reserved.

  Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// Adapted for WebGL 1.0 by Vassillen Chizhov

BilateralBlurShader = {

	defines: {
		MAX_R: 6
	},

	uniforms: {

		"tAOResult":       				{ value: null },
		"tDiffuse":       				{ value: null },
		"uAxis":						{ value: new THREE.Vector2() },
		"uFinal":						{ value: false },
		
		"uEdgeSharpness":				{ value: 0.01 },
		"uScale":						{ value: 1.0 },
		"uR":							{ value: 6 },
		"uGaussian":					{ value: Array.apply(null, Array(7)).map(function (x,i) { return 0.0; }) },
		
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
	
		"precision mediump float;",
		
		"varying vec2 vUv;",
		
		/** Increase to make depth edges crisper. Decrease to reduce flicker. */
		"uniform float uEdgeSharpness;",
		"",
		/** Step in 2-pixel intervals since we already blurred against neighbors in the
		    first AO pass.  This constant can be increased while R decreases to improve
		    performance at the expense of some dithering artifacts. 

		    Morgan found that a scale of 3 left a 1-pixel checkerboard grid that was
		    unobjectionable after shading was applied but eliminated most temporal incoherence
		    from using small numbers of sample taps.
		    */
		"uniform float uScale;",
		
		/** Filter radius in pixels. This will be multiplied by SCALE. */
		
		"uniform int uR;",
		"uniform float uGaussian[MAX_R+1];",

		
		//////////////////////////////////////////////////////////////////////////////////////////////

		
		/** Channel encoding the bilateral key value (which must not be the same as VALUE_COMPONENTS) */
		
		"uniform highp sampler2D   tAOResult;",
		
		
		/** (1/width, 0) or (0, 1/height)*/
		"uniform vec2       uAxis;",
		"uniform bool       uFinal;",
		
		"uniform sampler2D   tDiffuse;",
		"uniform bool uCombine;",
		"uniform float uAmbientContribution;",
		
		// from https://skytiger.wordpress.com/2010/12/01/packing-depth-into-color/
		"const highp vec3 factorinv = 1.0 / vec3(1.0, 255.0, 65025.0);",
		"highp float ColorToUnit24(const in highp vec3 color) {",
		"	return dot(color, factorinv);",
		"}",
		
		"void main() {",
		
		"    vec4 texel = texture2D(tAOResult, vUv);",
		"    float dp  = ColorToUnit24(texel.rgb);",

		"    float sum = texel.a;",

		/*"    if (dp == 1.0) { ",
		        // Sky pixel (if you aren't using depth keying, disable this test)
				//sum
		"        gl_FragColor = vec4(vec3(0.0),1.0);",
		"        return;",
		"    }",*/

		    // Base weight for depth falloff.  Increase this for more blurriness,
		    // decrease it for better edge discrimination
		"    float BASE = uGaussian[0];",
		"    float totalWeight = BASE;",
		"    sum *= totalWeight;",

		"    for (int r = 1; r <= MAX_R; ++r) {",
		"		if(r==uR+1) break;",
		"       vec4 temp = texture2D(tAOResult, vUv + uAxis * float(r) * uScale);",
		"       float      dp2 = ColorToUnit24(temp.rgb);",
		"       float value    = temp.a;",
				// spatial domain: offset gaussian tap
		"       float weight = 0.3 + uGaussian[r];",
				// range domain (the "bilateral" weight). As depth difference increases, decrease weight.
		"       weight *= max(0.0, 1.0",
		"           - (uEdgeSharpness * 2000.0) * abs(dp2 - dp)",
		"           );",
		"       sum += value * weight;",
		"       totalWeight += weight;",
		
		"       temp = texture2D(tAOResult, vUv - uAxis * float(r) * uScale);",
		"       dp2 = ColorToUnit24(temp.rgb);",
		"       value    = temp.a;",
				// spatial domain: offset gaussian tap
		"       weight = 0.3 + uGaussian[-r];",
				// range domain (the "bilateral" weight). As depth difference increases, decrease weight.
		"       weight *= max(0.0, 1.0",
		"           - (uEdgeSharpness * 2000.0) * abs(dp2 - dp)",
		"           );",
		"       sum += value * weight;",
		"       totalWeight += weight;",		

		"    }",

		"    const float epsilon = 0.0001;",
		"	 float blurred = sum / (totalWeight + epsilon);",
		"    gl_FragColor = uFinal ? uCombine? vec4(blurred*uAmbientContribution*texture2D(tDiffuse,vUv).rgb,1.0): vec4(vec3(blurred),1.0) : vec4(texel.rgb, blurred);",
		"}", 

	].join( "\n" )

};
