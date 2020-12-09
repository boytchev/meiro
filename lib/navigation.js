//	MEIRO
//	Key/mouse/touch navigation
//
//	MEIRO.Interaction()
//	 ├─ keyLeft()
//	 ├─ keyRight()
//	 ├─ keyUp()
//	 ├─ keyDown()
//	 ├─ keyPageUp()
//	 ├─ keyPageDown()
//	 ├─ keyHome()
//	 ├─ keyEnd()
//	 ├─ keyCtrl()
//	 ├─ keyShift()
//	 ├─ keyAny()
//	 ├─ mouse()
//	 ├─ mouseX()
//	 ├─ mouseY()
//	 ├─ mouseRelative()
//	 ├─ mouseFirst()
//	 ├─ mouseSecond()
//	 ├─ touchCenter()
//	 ├─ touchOne()
//	 └─ touchTwo()
//
//	MEIRO.OrbitControls()
//	 └─ update()
//
//	MEIRO.FirstPersonControls(dungeon,addButton)
//	 └─ update()
//
//	2017.04 - P. Boytchev

MEIRO.VIEW_HEIGHT = 0.5; // height above the ground
MEIRO.DEBUG_EVENTS = !true;

// Manages keyboard, mouse and touch
MEIRO.HumanInteraction = function()
{
	var that = this;

	this.key = {
		MOUSEFIRST: 0,
		MOUSEMIDDLE: 1,
		MOUSESECOND: 2,
		TOUCHONE: -1,
		TOUCHTWO: -2,
		
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		PAGEUP: 33,
		PAGEDOWN: 34,
		HOME: 36,
		END: 35,
		SPACE: 32,
		
		CTRL: 17,
		SHIFT: 16,
		ALT: 18,
	}
	
	this.keyMap = {
		100: this.key.LEFT, // NumPad-4
		102: this.key.RIGHT, // NumPad-6
		104: this.key.UP, // NumPad-8
		 98: this.key.DOWN, // NumPad-2
		105: this.key.PAGEUP, // NumPad-9
		 99: this.key.PAGEDOWN, // NumPad-3
		103: this.key.HOME, // NumPad-7
		 97: this.key.END, // NumPad-1
		 //65: this.key.LEFT, // A
		 //68: this.key.RIGHT, // D
		 //87: this.key.UP, // W
		 //83: this.key.DOWN, // S
		 //81: this.key.PAGEUP, // Q
		 //69: this.key.PAGEDOWN, // E
	}

	// array of pressed/released keys and mouse buttons
	this.keys = [];
	this.keyHandlers = [];
	
	this.mouseDelta = new THREE.Vector2(0,0);
	this.touchZoomDelta = 0;
	this.touchPosDelta = 0;
	
	this.mousePos = new THREE.Vector2(0,0);
	//this.touchCen = new THREE.Vector2(0,0);
	//this.touchFirstCen = new THREE.Vector2(0,0);
	var touchDist = 0;
	var touchPos = 0;
	
	this.touchTime = 0;
	
	this.signalMouseTouchDown = false;
	this.signalMouseTouchUp = false;

	// hide the right-click context menu
	function onContextMenu(event)
	{
		if (MEIRO.DEBUG_EVENTS) console.log('onContextMenu');//,event);
		if (reanimate) reanimate();
		event.preventDefault();
	}
	
	function onKeyDown(event)
	{
		if (MEIRO.DEBUG_EVENTS) console.log('onKeyDown');//,event);
		if (reanimate) reanimate(event);
		//event.preventDefault();
		
		//console.log(event.keyCode);
		that.anyKey++;
		var key = event.keyCode;
		key = that.keyMap[key] || key;
		that.keys[key] = true;
	}
	
	function onKeyUp(event)
	{
		if (MEIRO.DEBUG_EVENTS) console.log('onKeyUp');//,event);
		if (reanimate) reanimate(event);
		//event.preventDefault();

		that.anyKey--;
		var key = event.keyCode;
		key = that.keyMap[key] || key;
		that.keys[key] = false;
		
		if (that.keyHandlers[key])
			that.keyHandlers[key](event);
	}
	
	function onMouseDown(event)
	{
		if (MEIRO.DEBUG_EVENTS) console.log('onMouseDown');//,event);
		if (reanimate) reanimate(event);
		event.preventDefault();
		
		that.keys[event.button] = true;
		
		that.mousePos.set(event.clientX,event.clientY);
		that.signalMouseTouchDown = event.button==that.key.MOUSEFIRST;
		that.signalMouseTouchUp = false;
	}
	
	function onMouseUp(event)
	{
		if (MEIRO.DEBUG_EVENTS) console.log('onMouseUp');//,event);
		if (reanimate) reanimate(event);
		event.preventDefault();
		
		if (that.keys[that.key.MOUSEFIRST] && that.keys[that.key.MOUSESECOND])
			that.touchTime = animationLoop.time;
			
		that.keys[event.button] = false;
		
		that.mousePos.set(event.clientX,event.clientY);
		that.mouseDelta.set(0,0);
		that.signalMouseTouchDown = false;
		that.signalMouseTouchUp = event.button==that.key.MOUSEFIRST;
	}
	
	function onMouseMove(event)
	{
		if (MEIRO.DEBUG_EVENTS) console.log('onMouseMove');//,event);
		if (reanimate) reanimate(event);
		event.preventDefault();

		that.mouseDelta.x += event.clientX-that.mousePos.x;
		that.mouseDelta.y += event.clientY-that.mousePos.y;
		
		that.mousePos.set(event.clientX,event.clientY);
		that.signalMouseTouchMove = true;
	}
	
	function onTouchStart(event)
	{
		if (MEIRO.DEBUG_EVENTS) console.log('onTouchStart');//,event);
		if (reanimate) reanimate(event);
		event.preventDefault();
//event.touches[1] = {clientX:0, clientY:0};//@@		
		that.keys[that.key.TOUCHONE] = event.touches.length==1;
		that.keys[that.key.TOUCHTWO] = event.touches.length==2;
		
		that.mousePos.set(event.touches[0].clientX,event.touches[0].clientY);

		if (event.touches.length==2)
		{
			var dX = event.touches[1].clientX-event.touches[0].clientX;
			var dY = event.touches[1].clientY-event.touches[0].clientY;
			touchDist = Math.sqrt(dX*dX+dY*dY);
			that.touchZoomDelta = 0;
			that.touchPosDelta = 0;
			//that.touchFirstCen.set( (event.touches[1].clientX+event.touches[0].clientX)/2, (event.touches[1].clientY+event.touches[0].clientY)/2);
			//that.touchCen.set( (event.touches[1].clientX+event.touches[0].clientX)/2, (event.touches[1].clientY+event.touches[0].clientY)/2);
			that.touchTime = animationLoop.time;
		}
		that.signalMouseTouchDown = event.touches.length==1;
		that.signalMouseTouchUp = false;
	}
	
	function onTouchEnd(event)
	{
		if (MEIRO.DEBUG_EVENTS) console.log('onTouchEnd');//,event);
		if (reanimate) reanimate(event);
		event.preventDefault();
		
		that.keys[that.key.TOUCHONE] = event.touches.length==1;
		that.keys[that.key.TOUCHTWO] = event.touches.length==2;
		that.signalMouseTouchDown = false;
		that.signalMouseTouchUp = true;
	}
	
	function onTouchMove(event)
	{
		if (MEIRO.DEBUG_EVENTS) console.log('onTouchMove');//,event);
		if (reanimate) reanimate(event);		
		event.preventDefault();

//event.touches[1] = {clientX:0, clientY:0};//@@		
		that.keys[that.key.TOUCHONE] = (event.touches.length==1) && (animationLoop.time>that.touchTime+100);
		that.keys[that.key.TOUCHTWO] = event.touches.length==2;

		if (that.keys[that.key.TOUCHONE])
		{
			that.mouseDelta.x += event.touches[0].clientX-that.mousePos.x;
			that.mouseDelta.y += event.touches[0].clientY-that.mousePos.y;
		}
		that.mousePos.set(event.touches[0].clientX,event.touches[0].clientY);
		
		
		if (that.keys[that.key.TOUCHTWO])
		{
			var dX = event.touches[1].clientX-event.touches[0].clientX;
			var dY = event.touches[1].clientY-event.touches[0].clientY;
			var newDist = Math.sqrt(dX*dX+dY*dY);
			that.touchZoomDelta += touchDist-newDist;
			touchDist = newDist;
			
			var newPos = (event.touches[1].clientX+event.touches[0].clientX)/2;
			that.touchPosDelta += touchPos-newPos;
			touchPos = newPos;
			
			//that.touchCen.set( (event.touches[1].clientX+event.touches[0].clientX)/2, (event.touches[1].clientY+event.touches[0].clientY)/2);
			that.touchTime = animationLoop.time;

			//that.mouseDelta.set(0,0);
			that.mouseDelta.x += (event.touches[0].clientX+event.touches[1].clientX)/2-that.mousePos.x;
			that.mouseDelta.y += (event.touches[0].clientY+event.touches[1].clientY)/2-that.mousePos.y;
		}
		that.signalMouseTouchMove = event.touches.length==1;
	}
	
	var canvas = renderer.domElement;
	canvas.addEventListener( 'contextmenu', onContextMenu, false );
	canvas.addEventListener( 'mousedown', onMouseDown, false );
	canvas.addEventListener( 'mouseup', onMouseUp, false );
	canvas.addEventListener( 'mousemove', onMouseMove, false );
	canvas.addEventListener( 'touchstart', onTouchStart, false );
	canvas.addEventListener( 'touchend', onTouchEnd, false );
	canvas.addEventListener( 'touchmove', onTouchMove, false );
	window.addEventListener( 'keydown', onKeyDown, false );
	window.addEventListener( 'keyup', onKeyUp, false );
}

MEIRO.HumanInteraction.prototype.keyLeft = function()
{
	return this.keys[this.key.LEFT] && !this.keys[this.key.RIGHT];
}

MEIRO.HumanInteraction.prototype.keyRight = function()
{
	return !this.keys[this.key.LEFT] && this.keys[this.key.RIGHT];
}

MEIRO.HumanInteraction.prototype.keyUp = function()
{
	return !this.keys[this.key.DOWN] && this.keys[this.key.UP];
}

MEIRO.HumanInteraction.prototype.keyDown = function()
{
	return this.keys[this.key.DOWN] && !this.keys[this.key.UP];
}

MEIRO.HumanInteraction.prototype.keyPageUp = function()
{
	return this.keys[this.key.PAGEUP] && !this.keys[this.key.PAGEDOWN];
}

MEIRO.HumanInteraction.prototype.keyPageDown = function()
{
	return !this.keys[this.key.PAGEUP] && this.keys[this.key.PAGEDOWN];
}

MEIRO.HumanInteraction.prototype.keyHome = function()
{
	return this.keys[this.key.HOME] && !this.keys[this.key.END];
}

MEIRO.HumanInteraction.prototype.keyEnd = function()
{
	return !this.keys[this.key.HOME] && this.keys[this.key.END];
}

MEIRO.HumanInteraction.prototype.keyCtrl = function()
{
	return this.keys[this.key.CTRL];
}

MEIRO.HumanInteraction.prototype.keyShift = function()
{
	return this.keys[this.key.SHIFT];
}

MEIRO.HumanInteraction.prototype.keyAny = function()
{
	return this.keys[this.key.PAGEUP] ||
			this.keys[this.key.PAGEDOWN] ||
			this.keys[this.key.DOWN] || 
			this.keys[this.key.UP] ||
			this.keys[this.key.LEFT] ||
			this.keys[this.key.RIGHT] ||
			this.keys[this.key.CTRL] ||
			this.keys[this.key.SHIFT] ||
			this.keys[this.key.HOME] ||
			this.keys[this.key.END];
}

MEIRO.HumanInteraction.prototype.mouseX = function()
{
	var x = this.mouseDelta.x;
	this.mouseDelta.x = 0;
	return x;
}

MEIRO.HumanInteraction.prototype.mouseY = function()
{
	var y = this.mouseDelta.y;
	this.mouseDelta.y = 0;
	return y;
}

MEIRO.HumanInteraction.prototype.mouse = function()
{
	return new THREE.Vector2(this.mouseX(),this.mouseY());
}

MEIRO.HumanInteraction.prototype.mouseRelative = function()
{
	var size = renderer.getSize();
	return new THREE.Vector2(this.mousePos.x/size.width*2-1,1-2*this.mousePos.y/size.height);
}

MEIRO.HumanInteraction.prototype.touchZoom = function()
{
	var t = this.touchZoomDelta;
	this.touchZoomDelta = 0;
	return t;
}

MEIRO.HumanInteraction.prototype.touchCenter = function()
{
	var t = this.touchPosDelta;
	this.touchPosDelta = 0;
	return t;
}

MEIRO.HumanInteraction.prototype.mouseFirst = function()
{
	return this.keys[this.key.MOUSEFIRST] && (animationLoop.time>this.touchTime+100);
}

MEIRO.HumanInteraction.prototype.mouseSecond = function()
{
	return this.keys[this.key.MOUSESECOND] && (animationLoop.time>this.touchTime+100);
}

MEIRO.HumanInteraction.prototype.touchOne = function()
{
	return this.keys[this.key.TOUCHONE];
}

MEIRO.HumanInteraction.prototype.touchTwo = function()
{
	return this.keys[this.key.TOUCHTWO];
}



// Class for spherical orbiting navigation
MEIRO.OrbitControls = function()
{
	var that = this;
	this.human = new MEIRO.HumanInteraction();

	// orbiting distance
	this.dist = THREE.Math.clamp(1.75*Math.max(options.size.x,options.size.z)||30,10,150);
	this.distDelta = 0;
	this.distTarget = this.dist;
	this.distMin = THREE.Math.clamp(this.dist/options.zoom,10,150);
	this.distMax = THREE.Math.clamp(this.dist*options.zoom,10,150);
	
	this.rotMin = -Math.PI/2+EPS;
	this.rotMax = Math.PI/2-EPS;
	
	
	// orbiting position (angles)
	this.rot = new THREE.Vector2(0,0);
	this.rotDelta = new THREE.Vector2(0,0);//0.05,0.1);
	this.rotTarget = new THREE.Vector2(0,0.5);

	// panning position (only horizontal)
	this.pan = 0;
	this.panDelta = 0;

	this.startUp = true;
	
	if (options.player)
	{
		this.rot.x = Math.PI+options.player.rot+0.2;
		this.rotTarget.x = Math.PI+options.player.rot;
	}
	
	camera.target = new THREE.Vector3(0,0,0);
	
	this.update();
}

MEIRO.OrbitControls.prototype.update = function()
{
	var fps = THREE.Math.clamp(animationLoop.stats.fps,20,60);

	// test whether SHIFT is pressed/released
	if (this.human.keyShift())
	{
		// pan left-right with shift+keys
		if (this.human.keyLeft()) {this.panDelta = -5/fps; this.startUp = false;}
		if (this.human.keyRight()) {this.panDelta = +5/fps; this.startUp = false;}
	}
	else
	{
		// pan left-right with home/end
		if (this.human.keyHome()) {this.panDelta = -5/fps; this.startUp = false;}
		if (this.human.keyEnd()) {this.panDelta = +5/fps; this.startUp = false;}
		
		// rotate left-right with keys
		if (this.human.keyLeft()) {this.rotDelta.x = -5/fps; this.startUp = false;}
		if (this.human.keyRight()) {this.rotDelta.x = +5/fps; this.startUp = false;}

		// rotate up-down with keys
		if (this.human.keyUp()) {this.rotDelta.y = -3/fps; this.startUp = false;}
		if (this.human.keyDown()) {this.rotDelta.y = +3/fps; this.startUp = false;}
		
		// zoom in-out with keys
		if (this.human.keyPageUp()) {this.distDelta = -6/fps; this.startUp = false;}
		if (this.human.keyPageDown()) {this.distDelta = +6/fps; this.startUp = false;}
	}
	
	var mouseMove = this.human.mouse();
	var touchZoom = this.human.touchZoom();
	var touchCent = this.human.touchCenter();
//console.log('tcen',this.human.touchCen);


	// rotate left-right-up-down with mouse
	if (this.human.mouseFirst())
	{
		this.rotDelta.add(mouseMove.divideScalar(15*fps));
		this.startUp = false;
	}
		
	// zoom in-out with mouse
	// pan left-right with mouse
	if (this.human.mouseSecond())
	{
		this.panDelta = mouseMove.x/(1.75*fps);
		this.distDelta = mouseMove.y/(1.75*fps);
		this.startUp = false;
	}	
	
	// rotate left-right-up-down with one finger
	if (this.human.touchOne())
	{
		this.rotDelta.add(mouseMove.divideScalar(6*fps));
		this.startUp = false;
	}	

	// zoom in-out with two fingers
	if (this.human.touchTwo())
	{
		this.panDelta = touchCent/(1.75*fps);
		//this.human.touchFirstCen.x = this.human.touchCen.x;
		this.distDelta = touchZoom/(1*fps);
		this.startUp = false;
	}	
	
	if (this.startUp)
	{
		this.rot.lerp( this.rotTarget,0.1 );
	}
	else
	{
		this.rotTarget.copy( this.rot );
		this.rotTarget.add( this.rotDelta );
		this.rotTarget.y = THREE.Math.clamp(this.rotTarget.y,this.rotMin,this.rotMax);
		this.rot.lerp( this.rotTarget,0.5 );
	}
	
	this.rotDelta.divideScalar(1.15);

	this.distTarget *= Math.pow(1.3,this.distDelta);
	this.distTarget = THREE.Math.clamp(this.distTarget,this.distMin,this.distMax);
	this.dist = THREE.Math.lerp(this.dist,this.distTarget,0.5);
	this.distDelta /= 1.15;
	
	var x = this.dist*Math.cos(this.rot.x)*Math.cos(this.rot.y);
	var y = this.dist*Math.sin(this.rot.y);
	var z = this.dist*Math.sin(this.rot.x)*Math.cos(this.rot.y);

	var panX = this.dist/11*this.panDelta*Math.sin(this.rot.x);
	var panY = -this.dist/11*this.panDelta*Math.cos(this.rot.x);
	this.panDelta /= 1.15;
	
	camera.target.x -= panX;
	camera.target.z -= panY;
	
	camera.position.set(x,y,z);
	camera.position.add(camera.target);
	camera.lookAt(camera.target);	
}


MEIRO.OrbitControls.prototype.viewAngle = function()
{
	return Math.PI/2-this.rot.x;
}



// Class for first-person navigation
MEIRO.FirstPersonControls = function(dungeon,addButton)
{
	var that = this;
	this.human = new MEIRO.HumanInteraction();
	this.freeWalk = true;
	this.dragObject = undefined;
	
	this.TARGET_SMOOTH = 1;
	
	// person looking direction (angles)
	this.rot = new THREE.Vector2(0,0);
	this.rotDelta = new THREE.Vector2(0,0);
	this.rotTarget = new THREE.Vector2(0,0);

	this.userCamera = false;
	this.userUp = null;
	this.userTarget = null;
	this.userPosition = null;
	this.userLERP = null;
	
	// speed of moving forward/backward
	this.speed = 0;
	
	this.dungeon = dungeon;
	
	if (options.player)
	{
		camera.position.set(options.player.x,options.player.y+MEIRO.VIEW_HEIGHT,options.player.z);
		this.rot.x = options.player.rot;
		this.rotTarget.x = options.player.rot;
		this.level = dungeon.levels[levelFromPos(options.player.y)];
	}
	else
	{
		camera.position.set(0.5,MEIRO.VIEW_HEIGHT,0.5);
		this.rot.x = Math.PI/4;
		this.rotTarget.x = Math.PI/4;
		this.level = dungeon.levels[0];
	}
	camera.target = new THREE.Vector3(0,0,0);

	this.room = this.level.findRoom(camera.position);
	this.room.show();
	if (this.room.onEnter) this.room.onEnter();
	

	this.tilt = 0;
	this.h = 0; // h=[0..1] when on stairs
	
	if (options.player)
	{
		if (Math.abs(options.player.y-Math.round(options.player.y))<EPS)
		{	// position is at room floor
			this.inTheRoom = true;
			this.stairs = null;
		}
		else
		{	// position is on stairs
			this.inTheRoom = false;
			this.stairs = this.level.upperLevel.findStairs(camera.position);
			var slope = this.stairs.slope;
			var t = camera.position[slope.axis];
			this.h = (t-slope.min)/(slope.max-slope.min);
			this.h = THREE.Math.clamp(that.h,0,1);
		}
	}
	else
	{	// no player, assume position is at room floor
		this.inTheRoom = true;
		this.stairs = null;
	}
	
	console.dir(this.room);
	var that = this;
	
	// button for motion type
	if (addButton)
	{
		this.buttonMotion = new MEIRO.CornerButton('bottomLeft', function(){that.startWalk(true,false);}, '', '');
		this.human.keyHandlers[this.human.key.SPACE] = function(){that.startWalk(true,false);};
	}
	
//	this.spot1 = new THREE.Mesh(new THREE.SphereGeometry(0.02,32),new THREE.MeshNormalMaterial());
//	this.spot2 = new THREE.Mesh(new THREE.SphereGeometry(0.01,32),new THREE.MeshNormalMaterial());
//	scene.add(this.spot1);
//	scene.add(this.spot2);
	this.update();
}


MEIRO.FirstPersonControls.prototype.startWalk = function(toggle,initialize)
{
//	camera.zoom = 1;
//	camera.updateProjectionMatrix();
	if (toggle)
	{
		this.freeWalk=!this.freeWalk;
		this.rot.y = -this.rot.y;
		this.rotTarget.y = this.rot.y;
		this.rot.x += Math.PI;
		this.rotTarget.x = this.rot.x;
	}

	if (this.freeWalk)
		this.startFreeWalk();
	else
		this.startOrbitWalk(initialize);
}


MEIRO.FirstPersonControls.prototype.update = function()
{
//	console.log('r.y =',this.rot.y);
	if (this.freeWalk)
		this.updateFreeWalk();
	else
		this.updateOrbitWalk();
}


MEIRO.FirstPersonControls.prototype.startFreeWalk = function()
{
	if (this.buttonMotion)
		this.buttonMotion.setTextIcon('МОДЕЛ', 'images/motion.orbit.png');
	if (buttonBlueprint) buttonBlueprint.show();
	this.freeWalk = true;
	this.dragObject = undefined;
	
	var model = this.room.model;
	if (model)
	{
		model.onExit();
		if (this.buttonMotion)
			this.buttonMotion.show();
	}
	else
	{
		if (this.buttonMotion)
			this.buttonMotion.hide();
	}

//	this.rot.y = 0;
//	console.log('    =',this.rot.y);
	reanimate();
}


MEIRO.FirstPersonControls.prototype.startOrbitWalk = function(initialize)
{
	if (this.buttonMotion)
	{
		this.buttonMotion.setTextIcon('ЛАБИРИНТ', 'images/motion.free.png');
		this.buttonMotion.show();
	}
	if (buttonBlueprint) buttonBlueprint.hide();
	this.freeWalk = false;
	this.orbitTarget = new THREE.Vector3(this.room.min.x/2+this.room.max.x/2,camera.position.y,this.room.min.z/2+this.room.max.z/2);
	this.dist = this.orbitTarget.distanceTo(camera.position);
	this.distTarget = this.dist;
	this.distDelta = 0;
	
	var toCenter = new THREE.Vector2(this.room.min.x/2+this.room.max.x/2-camera.position.x,this.room.min.z/2+this.room.max.z/2-camera.position.z);
	//this.rot.x = (toCenter.angle()%(Math.PI*2)+Math.PI*2)%(Math.PI*2)+Math.PI;
	//this.rot.y = 0;

	var model = this.room.model;
	if (initialize)
	{
		this.rot.x = model.POS_ROT_X;
		this.rot.y = model.POS_ROT_Y;
		this.rotTarget.x = model.POS_ROT_X;
		this.rotTarget.y = model.POS_ROT_Y;
		this.dist = model.POS_DIST*model.scale;
		this.distTarget = model.POS_DIST*model.scale;
	}

	if (model)
	{
		this.rotTarget.y = model.POS_ROT_Y;
		model.onEnter();
		this.startUp = true;
	}
	
	options.autoPos = false;
	reanimate();
}


MEIRO.FirstPersonControls.prototype.updateOrbitWalk = function()
{
	if (!this.room) return;
	
	// test for interactive elements - only if there is model with onObject method
	if (this.dragObject)
	{	// already dragging
		if (this.human.signalMouseTouchMove)
		{	// currently dragging
			if (this.room.model.onDragMove) this.room.model.onDragMove();
			this.human.signalMouseTouchMove = false;
			//console.log('dragging');
		}
		if (this.human.signalMouseTouchUp)
		{	// stop dragging
			if (this.room.model.onDragEnd) this.room.model.onDragEnd();
			this.human.signalMouseTouchUp = false;
			//console.log('end dragging');
			this.dragObject = undefined;
		}
	}
	else
	if (this.room.model && this.room.model.onObject)
	{
		if (this.human.signalMouseTouchDown)
		{	// start dragging
			this.dragObject = this.room.model.onObject();
			this.human.signalMouseTouchDown = false;
			//if (this.dragObject) console.log('start dragging of',this.dragObject);
		}
	}
	if (this.dragObject) return; // if dragging, do not rotate the scene


	
	var mid = middle(this.room.min,this.room.max);
	var size = delta(this.room.min,this.room.max);
	
	var fps = THREE.Math.clamp(animationLoop.stats.fps,20,60);

	// rotate left-right with keys
	if (this.human.keyLeft()) {this.rotDelta.x = +3/fps; this.startUp = false;}
	if (this.human.keyRight()) {this.rotDelta.x = -3/fps; this.startUp = false;}

	// rotate up-down with keys
	if (this.human.keyPageUp()) {this.rotDelta.y = +2/fps; this.startUp = false;}
	if (this.human.keyPageDown()) {this.rotDelta.y = -2/fps; this.startUp = false;}

	// zoom in-out with keys
	if (this.human.keyUp()) {this.distDelta = -5/fps; this.startUp = false;}
	if (this.human.keyDown()) {this.distDelta = +5/fps; this.startUp = false;}

	var mouseMove = this.human.mouse();
	var touchDist = this.human.touchZoom();

	// rotate left-right-up-down with mouse
	if (this.human.mouseFirst())
	{
		this.rotDelta.add(mouseMove.divideScalar(15*fps));
		this.startUp = false;
	}
	
	// zoom in-out with mouse
	if (this.human.mouseSecond())
	{
		this.distDelta = mouseMove.y/(1.75*fps);
		this.startUp = false;
	}	
	
	// rotate left-right-up-down with one finger
	if (this.human.touchOne())
	{
		this.rotDelta.add(mouseMove.divideScalar(6*fps));
		this.startUp = false;
	}	

	// zoom in-out with two fingers
	if (this.human.touchTwo())
	{
		this.distDelta = touchDist/(1*fps);
		this.startUp = false;
	}	
	
	if (this.startUp)
	{
		this.rot.lerp( this.rotTarget,0.1 );
	}
	else
	{
		this.rotTarget.copy( this.rot );
		this.rotTarget.add( this.rotDelta );
		this.rotTarget.y = THREE.Math.clamp(this.rotTarget.y,-Math.PI/2+EPS,Math.PI/2-EPS);
		this.rot.lerp( this.rotTarget,0.5 );
	}
	
	this.rotDelta.divideScalar(1.15);
	if (this.room.model)
		this.rot.y = THREE.Math.clamp(this.rot.y,this.room.model.MIN_ROT_Y,this.room.model.MAX_ROT_Y);
	else
		this.rot.y = THREE.Math.clamp(this.rot.y,-0.5,0.5);

	this.distTarget *= Math.pow(1.3,this.distDelta);

	if (this.room.model)
		this.distTarget = THREE.Math.clamp(this.distTarget,this.room.model.MIN_DIST*this.room.model.scale,this.room.model.MAX_DIST*this.room.model.scale);
	else
		this.distTarget = THREE.Math.clamp(this.distTarget,0.5,Math.min(size.x,size.z)/2-MEIRO.THICKNESS);
		
	this.dist = THREE.Math.lerp(this.dist,this.distTarget,0.5);
	this.distDelta /= 1.15;

	var x = this.dist*Math.cos(this.rot.x)*Math.cos(this.rot.y);
	var y = this.dist*Math.sin(this.rot.y);
	var z = this.dist*Math.sin(this.rot.x)*Math.cos(this.rot.y);

	var x = this.dist*Math.cos(this.rot.x)*Math.cos(this.rot.y);
	var y = this.dist*Math.sin(this.rot.y);
	var z = this.dist*Math.sin(this.rot.x)*Math.cos(this.rot.y);

//	camera.zoom = 1/this.dist;
//	camera.updateProjectionMatrix();
	
	camera.zoom = 1-this.rot.y/3;
	camera.zoom = THREE.Math.clamp( camera.zoom, 0.2, 1 );
	
	camera.updateProjectionMatrix();
	
	if (y+this.orbitTarget.y > MEIRO.STAIRS.HEIGHT-0.5)
	{
	//	if (this.rot.y>1.4)
	//	{
	//		globalClippingPlane.constant = MEIRO.STAIRS.HEIGHT-MEIRO.THICKNESS/2;
	//	}
	//	else
	//	{
		y = MEIRO.STAIRS.HEIGHT-this.orbitTarget.y-0.5;
	//		globalClippingPlane.constant = 10*MEIRO.STAIRS.HEIGHT;
	//	}
	//}
	//else
	//{
	//	globalClippingPlane.constant = 10*MEIRO.STAIRS.HEIGHT;
	}
	
	if (this.userCamera)
	{
		camera.target.lerpVectors(this.orbitTarget,this.userTarget,this.userLERP);
		camera.up.lerpVectors(THREE.Object3D.DefaultUp,this.userUp,this.userLERP);
		var newPos = new THREE.Vector3(x,y,z).add(this.orbitTarget);
		camera.position.lerpVectors(newPos,this.userPosition,this.userLERP);
	}
	else
	{
		camera.target.lerp(this.orbitTarget,this.TARGET_SMOOTH);
		camera.up.set(0,1,0);
		var newPos = new THREE.Vector3(x,y,z).add(this.orbitTarget);
		camera.position.lerp(newPos,this.TARGET_SMOOTH);
	}
	

/*	
	var roomY = this.room.level.levelIndex*MEIRO.STAIRS.HEIGHT;
	var T = MEIRO.THICKNESS/2+EPS;
	camera.position.x = THREE.Math.clamp(
		camera.position.x,
		this.room.min.x+T,
		this.room.max.x-T);
	camera.position.y = THREE.Math.clamp(
		camera.position.y,
		roomY+T,
		roomY+MEIRO.STAIRS.HEIGHT-T);
	camera.position.z = THREE.Math.clamp(
		camera.position.z,
		this.room.min.z+T,
		this.room.max.z-T);
*/
	camera.lookAt(camera.target);		
	
	this.TARGET_SMOOTH = 0.1;
}



MEIRO.FirstPersonControls.prototype.updateFreeWalk = function()
{
	var fps = THREE.Math.clamp(animationLoop.stats.fps,20,60);

	if (this.human.keyAny())
		if (reanimate) reanimate();

	// rotate left-right with keys
	if (this.human.keyLeft()) this.rotDelta.x = -0.2/fps+1.1*this.rotDelta.x;
	if (this.human.keyRight()) this.rotDelta.x = +0.2/fps+1.1*this.rotDelta.x;

	// rotate up-down with keys
	if (this.human.keyPageUp()) this.rotDelta.y = +1/fps;
	if (this.human.keyPageDown()) this.rotDelta.y = -1/fps;

	// go forward/backward with keys
	if (this.human.keyUp()) this.speed = 1.25/fps;
	if (this.human.keyDown()) this.speed = -1.25/fps;

	var mousePos = this.human.mouseRelative();
	mousePos.x = Math.sign(mousePos.x)*Math.pow(Math.abs(mousePos.x),1.5);
	mousePos.y = Math.sign(mousePos.y)*Math.pow(Math.abs(mousePos.y),1.5);
	//var touchPos = this.human.touchCenter();
	
	// rotate view left-right-up-down with mouse
	if (this.human.mouseSecond() && !this.human.mouseFirst())
	{
		if (reanimate) reanimate();
		this.rotDelta.copy(mousePos.divideScalar(0.3*fps));
	}
	
	// rotate view and move left-right-up-down with mouse
	if (this.human.mouseFirst() && !this.human.mouseSecond())
	{
		if (reanimate) reanimate();
		this.speed = 1.25/fps;
		this.rotDelta.copy(mousePos.divideScalar(0.3*fps));
	}
	
	// rotate view and move back left-right-up-down with mouse
	if (this.human.mouseFirst() && this.human.mouseSecond())
	{
		if (reanimate) reanimate();
		this.speed = -1.25/fps;
		this.rotDelta.copy(mousePos.divideScalar(0.3*fps));
	}
	
	// rotate view and move left-right-up-down with one finger
	if (this.human.touchOne())
	{
		if (reanimate) reanimate();
		this.speed = 1.1/fps;
		this.rotDelta.copy(mousePos.divideScalar(0.3*fps));
	}
		// rotate view left-right-up-down with two fingers
	if (this.human.touchTwo())
	{
		if (reanimate) reanimate();
		this.rotDelta.copy(touchPos.divideScalar(0.25*fps));
	}
	
	
	this.speed *= 0.95;
		
	this.rotTarget.copy( this.rot );
	this.rotTarget.add( this.rotDelta );
	this.rotTarget.y = THREE.Math.clamp(this.rotTarget.y,-0.2,1);
	this.rotTarget.y = THREE.Math.lerp(this.rotTarget.y,0,0.05);
	
	this.rot.lerp( this.rotTarget,0.5 );
	this.rotDelta.divideScalar(1.15);
	
	var direction = new THREE.Vector3(
		Math.cos(this.rot.x)*Math.cos(this.rot.y),
		Math.sin(this.rot.y),
		Math.sin(this.rot.x)*Math.cos(this.rot.y)
	);
	
	if (this.inTheRoom)
		camera.position.y = THREE.Math.lerp(camera.position.y,this.room.level.levelIndex*MEIRO.STAIRS.HEIGHT+MEIRO.VIEW_HEIGHT,0.9);
	
	camera.position.copy(this.walk(direction));

	var newTarget = new THREE.Vector3();
	newTarget.copy(camera.target);
	newTarget.addVectors(camera.position,direction);
	this.tilt = this.tilt*0.9+10*this.rotDelta.x*this.speed; // increase 10 to increase tilting
	camera.up.set(Math.cos(this.rot.x)/2,1,Math.sin(this.rot.x+this.tilt)/2);
	
	// when on stairs move the target up or down
	if (!this.inTheRoom)
	{
		var dotProduct = Math.cos(this.rot.x)*this.stairs.vec.x + Math.sin(this.rot.x)*this.stairs.vec.z;
		//console.log('dot',dotProduct,this.stairs.vec.x*this.stairs.vec.x+this.stairs.vec.z*this.stairs.vec.z);
		newTarget.y -= dotProduct*( Math.cos(Math.PI*(2*this.h-1))/2+0.5 )/1.5;
	}
	
	//camera.target.y += 0.1*Math.sin(animationLoop.time/50)*this.speed;
	camera.target.lerp(newTarget,this.TARGET_SMOOTH);
	camera.lookAt(camera.target);
//	this.spot2.position.set(camera.position.x+0.05*direction.x,camera.position.y-0.4,camera.position.z+0.05*direction.z);
//	this.spot1.position.set(camera.position.x,camera.position.y-0.4,camera.position.z);
//	camera.lookAt(this.spot1.position);
}


MEIRO.FirstPersonControls.prototype.viewAngle = function()
{
	return (controls.freeWalk?-1:1)*Math.PI/2-this.rot.x;
}


	
// performs one step walk in a given direction and
// return the new position; the original position is
// camera.pos, the direction is a parameter, the speed
// is this.speed
MEIRO.FirstPersonControls.prototype.walk = function(direction)
{
	// no movement at all, exit
	if (this.speed==0) return camera.position;

	var dir = new THREE.Vector3();
	var pos = new THREE.Vector3();
	var that = this;

	//console.log('----',this.inTheRoom,'room',that.room.index,'level',that.room.level.levelIndex,that.level.levelIndex);
	
	function inSafeZone(x,z)
	{
		var OK;
		
		dir.set(x,0,z);
		pos.copy(camera.position);
		pos.addScaledVector(dir,that.speed);
		
		if (that.inTheRoom)
		{	// the player is in the room, check the safe zone of the room
			// OK: 0=outside room, 1=inside room, 2=inside door, 3=inside stairs
			OK = that.room.inSafeZone(pos);
			//console.log('	room.inSafeZone=',OK);
			if (OK==2) // inside door
			{
				if (!inArea(pos,that.room.min,that.room.max)) // ouside room
				{	// go to another room
					//console.log('Exit room',that.room.index,'level',that.room.level.levelIndex);
					if (that.room.onExit) that.room.onExit();
					that.room = that.level.findRoom(pos);
					//console.log('Enter room',that.room.index,'level',that.room.level.levelIndex);
					if (that.room.onEnter) that.room.onEnter();
					that.room.show();
					if (that.room.model)
					{
						if (that.buttonMotion) that.buttonMotion.show();
						//if (buttonBlueprint) buttonBlueprint.show();
					}
					else
					{
						if (that.buttonMotion) that.buttonMotion.hide();
						//if (buttonBlueprint) buttonBlueprint.hide();
					}
				}
			}
			if (OK==3) // inside stairs
			{	// go down/up the stairs
				that.inTheRoom = false;
				that.stairs = that.room.inStairs;
				console.log('Exit room',that.room.index,'level',that.room.level.levelIndex);
				if (that.room.onExit) that.room.onExit();
				//console.log('Enter stairs',that.stairs.index);
				if (that.buttonMotion) that.buttonMotion.hide();
				//if (buttonBlueprint) buttonBlueprint.hide();
			}
			if (OK==0)
			{				
				//console.log('>>>>> CURRENT POS',pos);
				//console.log('>>>>> CURRENT ROOM?',that.room);
				//console.log('>>>>> NEW ROOM?',that.level.findRoom(pos).index);
			}
		}
		else
		{	// the player is on the stairs, check the safe zone of the stairs only
			if (that.stairs.dir%2)
			{
				pos.z = THREE.Math.lerp(pos.z,that.stairs.mid.z,0.05);
			}
			else
			{
				pos.x = THREE.Math.lerp(pos.x,that.stairs.mid.x,0.05);
			}
			OK = that.stairs.inSafeZone(pos);
			if (OK==2)
			{
				// attempt to exit the stairs -- allowed only if stepping outside stairs total zone
				
				// 1. find the room (upper or lower level)
				if (pos.y/2>that.stairs.level.levelIndex-0.5)
				{ // upper level
					that.level = that.stairs.level;
					//console.log('-->upper level of stairs');
				}
				else
				{ // lower level
					that.level = that.stairs.level.lowerLevel;
					//console.log('-->lower level of stairs');
				}
				that.room = that.level.findRoom(pos);
				that.inTheRoom = true;
				if (that.room.model)
					that.buttonMotion.show();

				//console.log('Exit stairs',that.stairs.index);
				// find which level and which room in that level
				//console.log('Enter room',that.room.index,'level',that.room.level.levelIndex);
				if (that.room.onEnter) that.room.onEnter();
				that.room.show();
			}
			else
			{
				var slope = that.stairs.slope;
				var t = pos[slope.axis];
				that.h = (t-slope.min)/(slope.max-slope.min);
				that.h = THREE.Math.clamp(that.h,0,1);
				
				var curve = new THREE.CubicBezierCurve(
					new THREE.Vector2( 0, 0 ),
					new THREE.Vector2( 1, 0 ),
					new THREE.Vector2( MEIRO.STAIRS.LENGTH-1, MEIRO.STAIRS.HEIGHT ),
					new THREE.Vector2( MEIRO.STAIRS.LENGTH, MEIRO.STAIRS.HEIGHT )
				);
				pos.y = (that.stairs.level.levelIndex-1)*2+curve.getPoint(that.h).y+MEIRO.VIEW_HEIGHT;
			}
		}
		return OK;
	}
	
	// first try the true (X,Z) direction, then (X,0) and (0,Z)
	if (inSafeZone(direction.x,direction.z)) return pos;
	if (inSafeZone(direction.x,0)) return pos;
	if (inSafeZone(0,direction.z)) return pos;

	// if we can go back, then we are not locked;
	// if we are locked, then move the position within the closest point in the room
	if (inSafeZone(-direction.x,-direction.z)==0)
	{
		return {x: Math.min(Math.max(pos.x,that.room.min.x),that.room.max.x),
				y: pos.y,
				z: Math.min(Math.max(pos.z,that.room.min.z),that.room.max.z)};
	}
	
	// give up
	return camera.position;
}

