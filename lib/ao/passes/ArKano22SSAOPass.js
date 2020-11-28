Arkano22SSAOPass = function(params)
{
	//record for later use
	this.params = params;
	
	var shader = undefined;
	var material = undefined;	
	////////////////////////////////////////////////////////////////////////////////////////////
	//DEPTH RGBA ENCODE
	////////////////////////////////////////////////////////////////////////////////////////////
	shader = EncodeDepthRGBAShader;
	this.depthRGBAEncodeMaterial = new THREE.RawShaderMaterial({
		defines: shader.defines,
		uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	});
	
	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, stencilBuffer: false };
	this.prePassRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth*this.params.widthMultiplier, window.innerHeight*this.params.heightMultiplier, pars );
	this.prePassRenderTarget2 = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );
	
	//used to draw the texture
	this.prePassScene = new THREE.Scene();
	this.prePassCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.prePassQuad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), this.depthVisualizeMaterial );
	this.prePassQuad.frustumCulled = false; // Avoid getting clipped
	this.prePassScene.add( this.prePassQuad );
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//ARKANO22 SSAO SHADER
	////////////////////////////////////////////////////////////////////////////////////////////
	shader = ArKano22SSAOShader;
	this.ArKano22SSAOMaterial = new THREE.RawShaderMaterial({
		defines: shader.defines,
		uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	});
	material = this.ArKano22SSAOMaterial;
	material.uniforms[ "tDepth" ].value = this.prePassRenderTarget.texture;
	material.uniforms[ "tDiffuse" ].value = this.prePassRenderTarget2.texture;
	material.depthTest = false;
	material.depthWrite = false;
	
	
}

Arkano22SSAOPass.prototype.resize = function()
{
	this.prePassRenderTarget.setSize(window.innerWidth*this.params.widthMultiplier, window.innerHeight*this.params.heightMultiplier);
	
	var material = undefined;
	material = this.ArKano22SSAOMaterial;
	material.uniforms[ 'uSize' ].value.set( this.prePassRenderTarget.width, this.prePassRenderTarget.height );
}

Arkano22SSAOPass.prototype.updateCamera = function(camera)
{
	var material = undefined;
	
	material = this.ArKano22SSAOMaterial;
	material.uniforms[ 'uCameraNear' ].value = camera.near;
	material.uniforms[ 'uCameraFar' ].value = camera.far;
}

Arkano22SSAOPass.prototype.updateParameters = function()
{
	var material = undefined;
	material = this.ArKano22SSAOMaterial;
	material.uniforms[ 'uCombine' ].value = this.params.combine;
	material.uniforms[ 'uAOClamp'].value = this.params.aoClamp;
	material.uniforms[ 'uLumInfluence'].value = this.params.lumInfluence;
	material.uniforms[ 'uSamples'].value = this.params.samples;
	material.uniforms[ 'uAOClamp'].value = this.params.aoClamp;
	material.uniforms[ 'uUseNoise'].value = this.params.useNoise;
	material.uniforms[ 'uRadius'].value = this.params.radius;
	material.uniforms[ 'uNoiseAmount'].value = this.params.noiseAmount;
	material.uniforms[ 'uDiffArea'].value = this.params.diffArea;
	material.uniforms[ 'uGDisplace'].value = this.params.gaussDisplace;
}

//renderMode = "Default"/"Depth"/"ViewSpaceDepth"/"Normals"/"ViewSpaceNormals"
Arkano22SSAOPass.prototype.render = function(renderer, camera, scene)
{
	function modelOverlay(target) // PB 2017-06-22
	{
		if (!options.modelOverlay)
		{
			if (controls && controls.room && controls.room.model)
			{
				renderer.autoClear = false;
				controls.room.model.image.overrideMaterial = scene.overrideMaterial;
				renderer.render( controls.room.model.image, camera, target, false );
				renderer.autoClear = true;
			}
		}
	}
	
	scene.overrideMaterial = this.depthRGBAEncodeMaterial;
	renderer.setClearColor( 0xffffff );
	renderer.render(scene, camera, this.prePassRenderTarget, true);
	modelOverlay(this.prePassRenderTarget); // PB 2017-06-22
	scene.overrideMaterial = null;
	if(this.params.combine)
	{
		renderer.setClearColor( 0x000000 );
		renderer.render(scene, camera, this.prePassRenderTarget2, true);
		modelOverlay(this.prePassRenderTarget2); // PB 2017-06-22
	}
 	renderer.setClearColor( 0x000000 );
	this.prePassScene.overrideMaterial = this.ArKano22SSAOMaterial;
	renderer.render(this.prePassScene, this.prePassCamera, null, true);
	scene.overrideMaterial = null; 
	
}
