//	MEIRO
//	Ambient Occlusion
//
//	MEIRO.AO() class
//	 ├─ screenAO
//	 ├─ render(screen, camera)
//	 └─
//
//	MEIRO.FSSAO class - default FSSAO
//	 ├─ shader
//	 ├─ render(scene,camera)
//	 └─ onWindowResize()
//
//	MEIRO.SAO class
//	 ├─ shader
//	 ├─ render(scene,camera)
//	 └─ onWindowResize()
//
//	2017.05 - P. Boytchev


// AO constructor
MEIRO.AO = function()
{
	if (options.SSAO || options.SAO || options.NNAO) 
	{
		// initialize AO parameters
		params = {
			combine: true, //PB:was: false,
			
			widthMultiplier: 1.0,
			heightMultiplier: 1.0,
			
			renderMode: 'ScalableAmbientObscurance', //PB:was: "Default",
			//SAO
			saoSamples: 30, //PB:was: 11,
			saoSpiralTurns: 7.0,
			saoRadius: 0.20,
			saoIntensity: 0.38, //PB:was: 1.0,
			saoBias: 0.01,
			saoAmbientContribution: 1.0, //PB:was: 0.2,
			
			// blur
			saoBlur: true, //PB:was: false,
			saoBlurR:  6,
			saoBlurScale: 1.0,
			saoBlurEdgeSharpness: 0.5, //PB:was: 0.01,
			
			//ssao arkano22
			aoClamp: 1.0, //PB:was: 0.5,
			lumInfluence: 0.5,
			samples: 8,
			useNoise: false,
			noiseAmount: 0.0003,
			radius: 5.0,
			diffArea: 0.4,
			gaussDisplace: 0.4,
		};
		
		var minWidthMultiplier = 0.1;
		var maxWidthMultiplier = 2.0;
		var minHeightMultiplier = 0.1;
		var maxHeightMultiplier = 2.0;
		var gui = new dat.GUI();
		
		// Init gui
		var gui = new dat.GUI();
		gui.add( params, "widthMultiplier", minWidthMultiplier, maxWidthMultiplier );
		gui.add( params, "heightMultiplier", minHeightMultiplier, maxHeightMultiplier );
		gui.add( params, "combine" );
		gui.add( params, "renderMode", {
			'Default': "Default",
			'LinearDepth': "LinearDepth",
			'Normals': "Normals",
			'NormalsFromLinearDepth': "NormalsFromLinearDepth",
			'ScalableAmbientObscurance': "ScalableAmbientObscurance",
		});
	
		var guiSAO = gui.addFolder("SAO");
		guiSAO.add( params, "saoSamples", 1, 128, 1 ).name("samples");
		guiSAO.add( params, "saoSpiralTurns", [1,2,3,5,7,11,13,17,19,23] ).name("spiral turns");
		guiSAO.add( params, "saoRadius", 0.01, 5.0, 0.01 ).name("radius");
		guiSAO.add( params, "saoIntensity", 0.0, 10.0, 0.01 ).name("intensity");
		guiSAO.add( params, "saoBias", -1.0, 1.0, 0.01 ).name("bias");
		guiSAO.add( params, "saoAmbientContribution", 0.0, 1.0 ).name("ambient contribution");
		
		var guiSAOBlur = guiSAO.addFolder("Blur");
		guiSAOBlur.add( params, "saoBlur" ).name("enabled");
		guiSAOBlur.add( params, "saoBlurR", [3,4,6] ).name("blur radius");
		guiSAOBlur.add( params, "saoBlurScale", 0.0, 4.0 ).name("blur gaps");
		guiSAOBlur.add( params, "saoBlurEdgeSharpness", 0.0, 0.5 ).name("edge sharpness");
		
		var guiSSAO = gui.addFolder("SSAO");
		guiSSAO.add( params, "aoClamp", 0.0, 1.0 );
		guiSSAO.add( params, "lumInfluence", 0.0, 1.0 );
		guiSSAO.add( params, "samples", 1, 32);
		guiSSAO.add( params, "useNoise");
		guiSSAO.add( params, "noiseAmount", -0.003, 0.003);
		guiSSAO.add( params, "radius", 0.0);
		guiSSAO.add( params, "diffArea", 0.0, 1.0);
		guiSSAO.add( params, "gaussDisplace", 0.0, 1.0);
	}
	
	// setup the current screen AO
	this.screenAO = undefined;
	//console.log('FSSAO='+options.FSSAO,'SSAO='+options.SSAO,'SAO='+options.SAO,'NNAO='+options.NNAO);
	
	if (options.FSSAO) this.screenAO = new MEIRO.FSSAO();
	if (options.SSAO) this.screenAO = new MEIRO.SSAO(params);
	if (options.SAO) this.screenAO = new MEIRO.SAO(params);
	if (options.NNAO) this.screenAO = new MEIRO.NNAO(params);
}


MEIRO.AO.prototype.render = function(screen, camera)
{
	if (this.screenAO)
	{	// use the screen AO (SSAO or SAO)
		this.screenAO.render(scene, camera);
	}
	else
	{	// no screen AO, use normal Three.js renderer
		renderer.render(scene, camera);
		if (!options.modelOverlay)
		{
			// draw the model (if any)
			if (controls && controls.room && controls.room.model)
			{
				renderer.autoClear = false;
				renderer.render(controls.room.model.image, camera);
				renderer.autoClear = true;
			}
		}
	}
	
	if (options.modelOverlay)
	{
		// draw the model (if any)
		if (controls && controls.room && controls.room.model)
		{
			renderer.autoClearColor = false;
			renderer.render(controls.room.model.image, camera, null, false);
			renderer.autoClearColor = true;
		}
	}
}


// Add a cube - oriented along the axes (i.e. no rotation)
MEIRO.AO.prototype.cube = function(center,sizes,image)
{
	if (this.helper && image)
	{
		var mesh = new THREE.Mesh(MEIRO.AO.HELPER.CUBE, MEIRO.AO.HELPER.STYLE);
		mesh.scale.set(sizes.x,sizes.y,sizes.z);
		mesh.position.set(center.x,center.y,center.z);

		image.add(mesh);
	}
}


// Add a sphere - oriented along the axes (i.e. no rotation)
MEIRO.AO.prototype.sphere = function(center,sizes,image)
{
	if (this.helper && image)
	{
		var mesh = new THREE.Mesh(MEIRO.AO.HELPER.SPHERE, MEIRO.AO.HELPER.STYLE);
		mesh.scale.set(sizes.x,sizes.y,sizes.z);
		mesh.position.set(center.x,center.y,center.z);

		image.add(mesh);
	}
}



//=============================================================
// class supporting FSSAO
// based on https://threejs.org/examples/webgl_postprocessing_ssao.html
//=============================================================
MEIRO.FSSAO = function()
{
	// Setup render pass
	var renderPass = new THREE.RenderPass( scene, camera );
	var renderModelPass = new THREE.RenderPass( undefined, camera );

	// Setup depth pass
	this.depthMaterial = new THREE.MeshDepthMaterial();
	this.depthMaterial.depthPacking = THREE.RGBADepthPacking;
	this.depthMaterial.blending = THREE.NoBlending;

	this.depthRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			anisotropy: 16,
			stencilBuffer: false,
			antialias: true,
		});
	this.depthRenderTarget.texture.name = "SSAOShader.rt";

	// Setup FSSAO pass
	this.ssaoPass = new THREE.ShaderPass( MEIRO.SHADER.FSSAO );
	this.ssaoPass.renderToScreen = true;
	//this.ssaoPass.uniforms[ "tDiffuse" ].value will be set by ShaderPass
	this.ssaoPass.uniforms[ "tDepth" ].value = this.depthRenderTarget.texture;
	this.ssaoPass.uniforms[ 'size' ].value.set( window.innerWidth, window.innerHeight );
	this.ssaoPass.uniforms[ 'cameraNear' ].value = camera.near;	
	this.ssaoPass.uniforms[ 'cameraFar' ].value = camera.far;
	this.ssaoPass.uniforms[ 'aoClamp' ].value = 1.00;

	// Add pass to effect composer
	this.effectComposer = new THREE.EffectComposer( renderer );
	this.effectComposer.addPass( renderPass );
	this.effectComposer.addPass( renderModelPass );
	this.effectComposer.addPass( this.ssaoPass );
}





// renders the FSSAO image
MEIRO.FSSAO.prototype.render = function(scene,camera)
{
	// Render depth into depthRenderTarget
	scene.overrideMaterial = this.depthMaterial;
	renderer.render( scene, camera, this.depthRenderTarget, true );

	if (!options.modelOverlay)
	{
		if (controls && controls.room && controls.room.model)
		{
			renderer.autoClear = false;
			controls.room.model.image.overrideMaterial = this.depthMaterial;
			renderer.render( controls.room.model.image, camera, this.depthRenderTarget, false );
			renderer.autoClear = true;
		}
	}
 
	// Render renderPass and FSSAO shaderPass
	scene.overrideMaterial = null;
	this.effectComposer.render();
}


// event handler to react on windo resize
MEIRO.FSSAO.prototype.onWindowResize = function()
{
	this.ssaoPass.uniforms[ 'size' ].value.set( window.innerWidth, window.innerHeight );

	var pixelRatio = renderer.getPixelRatio();
	var newWidth  = Math.floor( window.innerWidth / pixelRatio ) || 1;
	var newHeight = Math.floor( window.innerHeight / pixelRatio ) || 1;
	this.depthRenderTarget.setSize( newWidth, newHeight );
	this.effectComposer.setSize( newWidth, newHeight );
}






//=============================================================
// class supporting SSAO
// based on https://threejs.org/examples/webgl_postprocessing_ssao.html
//=============================================================
MEIRO.SSAO = function(params)
{
	this.aoPass = new Arkano22SSAOPass(params);
}

// renders the SSAO image
MEIRO.SSAO.prototype.render = function(scene,camera)
{
	this.aoPass.updateParameters();
	this.aoPass.updateCamera(camera);
	this.aoPass.render(renderer, camera, scene);
}


// event handler to react on windo resize
MEIRO.SSAO.prototype.onWindowResize = function()
{
	this.aoPass.resize();
}



MEIRO.SAO = function(params) // TODO
{
	this.aoPass = new AOPass(params);
}


// renders the SAO image
MEIRO.SAO.prototype.render = function(scene,camera) // TO DO
{
	this.aoPass.updateCamera(camera);
	this.aoPass.updateParameters();
	this.aoPass.render(renderer, camera, scene, this.aoPass.params.renderMode);
}


// event handler to react on window resize
MEIRO.SAO.prototype.onWindowResize = function() // TO DO
{
	this.aoPass.resize();
}
