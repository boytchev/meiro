AOPass = function(params)
{
	this.params = params;
	// create the buffers we will need
	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, stencilBuffer: false };
	this.depthRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth*this.params.widthMultiplier, window.innerHeight*this.params.heightMultiplier, pars );
	// we may not need this - just comment it if you don't need it
	this.normalsRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth*this.params.widthMultiplier, window.innerHeight*this.params.heightMultiplier, pars );
	this.diffuseRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );
	this.aoRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth*this.params.widthMultiplier, window.innerWidth*this.params.widthMultiplier, pars );
	
	// used for the postprocessing pass
	this.postPassScene = new THREE.Scene();
	this.postPassCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.postPassQuad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), this.depthVisualizeMaterial );
	this.postPassQuad.frustumCulled = false; // Avoid getting clipped
	this.postPassScene.add( this.postPassQuad );
	
	
	var shader = undefined;
	var material = undefined;
		
	////////////////////////////////////////////////////////////////////////////////////////////
	//LINEAR DEPTH RGBA ENCODE
	////////////////////////////////////////////////////////////////////////////////////////////
	shader = EncodeLinearDepthRGBAShader;
	this.linearDepthRGBAEncodeMaterial = new THREE.RawShaderMaterial({
		defines: shader.defines,
		uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	});
		
		
	////////////////////////////////////////////////////////////////////////////////////////////
	// NORMALS RGB ENCODE
	////////////////////////////////////////////////////////////////////////////////////////////
	shader = EncodeNormalsShader;
	this.normalsEncodeMaterial = new THREE.RawShaderMaterial({
		defines: shader.defines,
		uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	});
	
	////////////////////////////////////////////////////////////////////////////////////////////
	// NORMALS RGB ENCODE + LINEAR DEPTH A ENCODE
	////////////////////////////////////////////////////////////////////////////////////////////
	//...tbd
	
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//DEPTH VISUALIZE
	////////////////////////////////////////////////////////////////////////////////////////////
	shader = DepthVisualizeShader;
	this.depthVisualizeMaterial = new THREE.RawShaderMaterial({
    	defines: shader.defines,
		uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	});
	material = this.depthVisualizeMaterial;
	material.depthTest = false;
	material.uniforms.tDepth.value = this.depthRenderTarget.texture;
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//TEXTURE VISUALIZE
	////////////////////////////////////////////////////////////////////////////////////////////
	shader = TextureVisualizeShader;
	this.textureVisualizeMaterial = new THREE.RawShaderMaterial({
    	defines: shader.defines,
		uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	});
	material = this.textureVisualizeMaterial;
	material.depthTest = false;
	material.uniforms.tTexture.value = this.normalsRenderTarget.texture;
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//NORMALS FROM LINEAR DEPTH VISUALIZE
	////////////////////////////////////////////////////////////////////////////////////////////
	shader = NormalsFromLinearDepthVisualizeShader;
	this.normalsFromLinearDepthVisualizeMaterial = new THREE.RawShaderMaterial({
    	defines: shader.defines,
		uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	});
	material = this.normalsFromLinearDepthVisualizeMaterial;
	material.depthTest = false;
	material.uniforms.tDepth.value = this.depthRenderTarget.texture;
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//SCALABLE AMBIENT OBSCURANCE SHADER
	////////////////////////////////////////////////////////////////////////////////////////////
	shader = ScalableAmbientObscuranceShader;
	this.scalableAmbientObscuranceMaterial = new THREE.RawShaderMaterial({
    	defines: shader.defines,
		uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	});
	material = this.scalableAmbientObscuranceMaterial;
	material.depthTest = false;
	material.uniforms.tDepth.value = this.depthRenderTarget.texture;
	material.uniforms.tDiffuse.value = this.diffuseRenderTarget.texture;
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//BILATERAL BLUR SHADER
	////////////////////////////////////////////////////////////////////////////////////////////
	shader = BilateralBlurShader;
	this.bilateralBlurMaterial = new THREE.RawShaderMaterial({
    	defines: shader.defines,
		uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	});
	material = this.bilateralBlurMaterial;
	material.depthTest = false;
	material.uniforms.tAOResult.value = this.aoRenderTarget.texture;
	material.uniforms.tDiffuse.value = this.diffuseRenderTarget.texture;
	
	this.resize();
	this.updateParameters();
	
}

AOPass.prototype.resize = function()
{
	this.depthRenderTarget.setSize(window.innerWidth*this.params.widthMultiplier, window.innerHeight*this.params.heightMultiplier);
	this.normalsRenderTarget.setSize(window.innerWidth*this.params.widthMultiplier, window.innerHeight*this.params.heightMultiplier);
	this.aoRenderTarget.setSize(window.innerWidth*this.params.widthMultiplier, window.innerHeight*this.params.heightMultiplier);
	var material = undefined;
	
	material = this.normalsFromLinearDepthVisualizeMaterial;
	material.uniforms.uSize.value.set( 1.0/this.depthRenderTarget.width, 1.0/this.depthRenderTarget.height );
	
	material = this.scalableAmbientObscuranceMaterial;
	material.uniforms.uSize.value.set( 1.0/this.depthRenderTarget.width, 1.0/this.depthRenderTarget.height );
}

AOPass.prototype.updateCamera = function(camera)
{
	var material = undefined;
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//LINEAR DEPTH RGBA ENCODE
	////////////////////////////////////////////////////////////////////////////////////////////
	material = this.linearDepthRGBAEncodeMaterial;
	material.uniforms.uCameraNear.value = camera.near;
	material.uniforms.uCameraNearMinusCameraFarInv.value = 1.0/(camera.near-camera.far);
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//NORMALS FROM LINEAR DEPTH VISUALIZE
	////////////////////////////////////////////////////////////////////////////////////////////
	material = this.normalsFromLinearDepthVisualizeMaterial;
	material.uniforms.uCameraNear.value = camera.near;
	material.uniforms.uCameraNearMinusCameraFar.value = camera.near-camera.far;
	material.uniforms.uInverseProjectionAB.value.set( 1.0/camera.projectionMatrix.elements[0],1.0/camera.projectionMatrix.elements[5]);
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//SCALABLE AMBIENT OBSCURANCE SHADER
	////////////////////////////////////////////////////////////////////////////////////////////
	material = this.scalableAmbientObscuranceMaterial;
	material.uniforms.uCameraNear.value = camera.near;
	material.uniforms.uCameraNearMinusCameraFar.value = camera.near-camera.far;
	material.uniforms.uInverseProjectionAB.value.set( 1.0/camera.projectionMatrix.elements[0],1.0/camera.projectionMatrix.elements[5]);
}

AOPass.prototype.updateParameters = function()
{
	////////////////////////////////////////////////////////////////////////////////////////////
	//SCALABLE AMBIENT OBSCURANCE SHADER
	////////////////////////////////////////////////////////////////////////////////////////////
	var material = this.scalableAmbientObscuranceMaterial;
	material.uniforms.uSamples.value = this.params.saoSamples;
	material.uniforms.uSpiralTurns.value = this.params.saoSpiralTurns;
	material.uniforms.uRadius.value = this.params.saoRadius;
	var rad6 = this.params.saoRadius*this.params.saoRadius*this.params.saoRadius;
	rad6*=rad6;
	material.uniforms.uIntensityDivR6.value = this.params.saoIntensity/rad6;
	material.uniforms.uBias.value = this.params.saoBias;
	material.uniforms.uBlur.value = this.params.saoBlur;
	material.uniforms.uCombine.value = this.params.combine;
	material.uniforms.uAmbientContribution.value = this.params.saoAmbientContribution;
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//BILATERAL BLUR SHADER
	////////////////////////////////////////////////////////////////////////////////////////////
	material = this.bilateralBlurMaterial;
	material.uniforms.uR.value = this.params.saoBlurR;
	material.uniforms.uScale.value = this.params.saoBlurScale;
	material.uniforms.uEdgeSharpness.value = this.params.saoBlurEdgeSharpness;
	material.uniforms.uCombine.value = this.params.combine;
	material.uniforms.uAmbientContribution.value = this.params.saoAmbientContribution;
	if(this.params.saoBlurR==3)
	{
		material.uniforms.uGaussian.value[0] = 0.153170; material.uniforms.uGaussian.value[1] = 0.144893; material.uniforms.uGaussian.value[2] = 0.122649; material.uniforms.uGaussian.value[3] = 0.092902;
	}
	else if(this.params.saoBlurR==4)
	{
		 material.uniforms.uGaussian.value[0] = 0.153170; material.uniforms.uGaussian.value[1] = 0.144893; material.uniforms.uGaussian.value[2] = 0.122649; material.uniforms.uGaussian.value[3] = 0.092902; material.uniforms.uGaussian.value[4] = 0.062970;
	}
	else if(this.params.saoBlurR==6)
	{
		material.uniforms.uGaussian.value[0] = 0.111220; material.uniforms.uGaussian.value[1] = 0.107798; material.uniforms.uGaussian.value[2] = 0.098151; material.uniforms.uGaussian.value[3] = 0.083953;
		material.uniforms.uGaussian.value[4] = 0.067458; material.uniforms.uGaussian.value[5] = 0.050920; material.uniforms.uGaussian.value[6] = 0.036108;
	}
	
}

//renderMode = "Default"/"LinearDepth"/"Normals"/"NormalsFromLinearDepth"/"ScalableAmbientObscurance"
AOPass.prototype.render = function(renderer, camera, scene, renderMode)
{
	function modelOverlay(target,material) // PB 2017-06-22
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
	
	switch(renderMode)
	{
	case "LinearDepth":
	{
		scene.overrideMaterial = this.linearDepthRGBAEncodeMaterial;
		renderer.setClearColor( 0xffffff );
		renderer.render(scene, camera, this.depthRenderTarget, true);
		modelOverlay(this.depthRenderTarget) // PB 2017-06-22		
		scene.overrideMaterial = null;
		this.postPassScene.overrideMaterial = this.depthVisualizeMaterial;
		renderer.render(this.postPassScene, this.postPassCamera, null, true);
		break;
	}
	case "Normals":
	{
		scene.overrideMaterial = this.normalsEncodeMaterial;
		renderer.setClearColor( 0x000000 );
		renderer.render(scene, camera, this.normalsRenderTarget, true);
		modelOverlay(this.normalsRenderTarget); // PB 2017-06-22
		scene.overrideMaterial = null;
		this.postPassScene.overrideMaterial = this.textureVisualizeMaterial ;
		renderer.render(this.postPassScene, this.postPassCamera, null, true);
		break;
	}
	case "NormalsFromLinearDepth":
	{
		scene.overrideMaterial = this.linearDepthRGBAEncodeMaterial;
		renderer.setClearColor( 0xffffff );
		renderer.render(scene, camera, this.depthRenderTarget, true);
		modelOverlay(this.depthRenderTarget); // PB 2017-06-22
		scene.overrideMaterial = null;
		this.postPassScene.overrideMaterial = this.normalsFromLinearDepthVisualizeMaterial;
		renderer.setClearColor( 0x000000 );
		renderer.render(this.postPassScene, this.postPassCamera, null, true);
		break;
	}
	case "ScalableAmbientObscurance":
	{
		scene.overrideMaterial = this.linearDepthRGBAEncodeMaterial;
		renderer.setClearColor( 0xffffff );
		renderer.render(scene, camera, this.depthRenderTarget, true);
		modelOverlay(this.depthRenderTarget); // PB 2017-06-22
		scene.overrideMaterial = null;
		renderer.setClearColor( 0x000000 );
		if(this.params.combine)
		{
			renderer.render(scene, camera, this.diffuseRenderTarget, true);
			modelOverlay(this.diffuseRenderTarget); // PB 2017-06-22
		}
		this.postPassScene.overrideMaterial = this.scalableAmbientObscuranceMaterial;
		if(this.params.saoBlur)
		{
			renderer.render(this.postPassScene, this.postPassCamera, this.aoRenderTarget, true);
			
			this.postPassScene.overrideMaterial = this.bilateralBlurMaterial;
			this.bilateralBlurMaterial.uniforms.tAOResult.value = this.aoRenderTarget.texture;
			this.bilateralBlurMaterial.uniforms.uAxis.value.set(1.0/this.depthRenderTarget.width, 0.0);
			this.bilateralBlurMaterial.uniforms.uFinal.value = false;
			renderer.render(this.postPassScene, this.postPassCamera, this.depthRenderTarget, true);
			
			this.bilateralBlurMaterial.uniforms.tAOResult.value = this.depthRenderTarget.texture;
			this.bilateralBlurMaterial.uniforms.uAxis.value.set(0.0, 1.0/this.depthRenderTarget.height);
			this.bilateralBlurMaterial.uniforms.uFinal.value = true;
			renderer.render(this.postPassScene, this.postPassCamera, null, true);
		}
		else
			renderer.render(this.postPassScene, this.postPassCamera, null, true);
		break;
	}
	default:
	{
		renderer.render(scene, camera);
		modelOverlay(); // PB 2017-06-22
	}
	}
}
