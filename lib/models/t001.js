
var SCORE_STATISTICS = !true;
var IN_SCORE_STATISTICS = false;

//	Основи на Компютърната Графика
//	Тест 001 - Цветният резервоар
//	П. Бойчев, 2019
//
//	 ├─ T001
//	 │   ├─ initialize()
//	 │   ├─ construct()
//	 │   │    ├─ constructColorRing()
//	 │   │    ├─ constructFloor()
//	 │   │    ├─ constructBase()
//	 │   │    ├─ constructFrames()
//	 │   │    ├─ constructGlass()
//	 │   │    ├─ constructWater()
//	 │   │    ├─ constructPipes()
//	 │   │    │   ├─ constructPipe()
//	 │   │    │   └─ constructValve()
//	 │   │    └─ configureStats
//	 │   ├─ onAnimate()
//	 │   │    ├─ updateWaterAmount()
//	 │   │    ├─ updateWaterColor()
//	 │   │    ├─ activateWaterSound()
//	 │   │    └─ generateWaterSurface(time)
//	 │   ├─ onObject()
//	 │   ├─ onEnter()
//	 │   │    └─ configure(difficulty)
//	 │   ├─ onDragEnd()
//	 │   ├─ onExitModel()
//	 │   │    ├─ evaluateResult()
//	 │   │    ├─ sendStartup(callback)
//	 │   │    └─ sendResult(callback)
//	 │   ├─ onInfo(element)
//	 └─ 
//
//	Glass texture
//		https://www.deviantart.com/galaxiesanddust/art/Dirty-Window-Texture-311006931
//	Warning symbols
//		https://en.wikipedia.org/wiki/European_hazard_symbols
//		http://www.hse.gov.uk/chemical-classification/labelling-packaging/hazard-symbols-hazard-pictograms.htm
//	Sound effects
//		https://freesound.org/people/irisfilm/sounds/463719/
//		https://freesound.org/people/DCSFX/sounds/366159/
//		https://freesound.org/people/Johnnyfarmer/sounds/209772/
//

var DIFFICULTY_LOW = 0;		// ниска трудност
var DIFFICULTY_MEDIUM = 1;	// средна трудност
var DIFFICULTY_HIGH = 2;	// висока трудност

// конструктор на модела
MEIRO.Models.T001 = function T001(room, model)
{
	MEIRO.Model.apply(this, arguments);
	
	this.POOL_SIZE = 8;			// дължина и ширина на басейна
	this.POOL_DEPTH = 5;		// дълбочина на басейна

	this.BASE_HEIGHT = 2;		// височина на основата на басейна
	this.FRAME_WIDTH = 0.25;	// ширина на рамките на басейна

	this.VALVE_LENGTH = 0.8;	// дължина на спирателния кран
	this.VALVE_RADIUS = 0.8;	// радиус на врътката на крана
	this.VALVE_WIDTH = 0.1;		// дебелина на врътката на крана

	this.PIPE_RADIUS = 0.5;		// радиус на тръба
	this.PIPE_LENGTH = 3;		// дължина на хоризонталната част на тръба
	this.PIPE_EXTRUDE = 0.15;	// издаденост на пръстените на тръба

	this.RING_RADIUS = 9;		// вътрешен радиус на цветния пръстен
	this.RING_WIDTH  = 1;		// ширина на цветния пръстен


	this.initialize();
	this.construct();
	
	this.audioWater = new Audio('sounds/water-pipes.mp3');
	this.audioWater.loop = true;
	this.audioWater.volume = 0;

	this.audioBubbles = new Audio('sounds/water-bubbles.mp3');
	this.audioBubbles.loop = true;
	this.audioBubbles.volume = 0;

	this.audioBoom = new Audio('sounds/water-boom.mp3');
	this.audioBoom.loop = false;
	this.audioBoom.volume = 0.5;
}
MEIRO.Models.T001.prototype = Object.create(MEIRO.Model.prototype);


MEIRO.Models.T001.DIST = {MIN:15, MAX:25, HEIGHT:0};
MEIRO.Models.T001.POS = {DIST:25, ROT_X:0.9, ROT_Y:0.15, ON_FLOOR:true};
MEIRO.Models.T001.ROT_Y = {MIN:0.0, MAX:1.56};
MEIRO.Models.T001.SCALE = {MAX:0.25};
MEIRO.Models.T001.COMPETENCES = [1,0,3,1,3, 0,1,0,0, 0,2,0, 5,0,1,0,3];



MEIRO.Models.T001.prototype.initialize = function()
{
	if (SCORE_STATISTICS) this.configureStats();
	
	random.randomize();
	
	this.playing = false;
	this.startTime = 0;
	
	this.waterCyan = 0;
	this.waterMagenta = 0;
	this.waterYellow = 0;
	this.waterLevel = 0;
	this.oldWaterLevel = 0;
	this.activePipe = undefined;

	this.lastTime = 0;
	this.clicks = 0;
}

	

MEIRO.Models.T001.prototype.construct = function()
{
	// допълнителна светлина, прави пода по-красив
	var light = new THREE.PointLight( 'white', 0.3 );
	light.position.set( 0, 10, 0 );
	this.image.add( light );
	
	this.constructColorRing();
	this.constructFloor();
	this.constructBase();
	this.constructFrames();
	this.constructGlass();
	this.constructWater();
	this.constructPipes();
	

	
	//------------------------------------------------------
	// floating colour box
	//------------------------------------------------------
	const PLATE_SIZE = 4;
	const PLATE_SUBSIZE = 3.8;
	const PLATE_HEIGHT = 0.6;
	this.targetColorBox = new THREE.Mesh(
		new THREE.BoxBufferGeometry( PLATE_SIZE, PLATE_HEIGHT, PLATE_SIZE ),
		new THREE.MeshLambertMaterial()
	);
	
	this.targetColorPlate = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( PLATE_SUBSIZE, PLATE_SUBSIZE ),
		new THREE.MeshBasicMaterial({
			polygonOffset: true,
			polygonOffsetFactor: -2,
			polygonOffsetUnits: -2
		})
	);
	this.targetColorPlate.rotation.x = -Math.PI/2;
	this.targetColorPlate.position.y = PLATE_HEIGHT/2;
	this.targetColorBox.add(this.targetColorPlate);
	this.image.add( this.targetColorBox );
	
	

	
	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();

	// сглобяване на целия модел
	this.image.add(this.pipes);
	
	
	// бутон за стартиране/приключване
	var that = this;
	this.buttonTimer = new MEIRO.CornerButton('topLeft', function(){that.onExitModel();}, '0:00', 'images/time.png');
	this.buttonTimer.hide();

	this.defaultInfo = '<h1>Цветният резервоар</h1>';
	this.defaultInfo += '<p>Развъртете крановете и пуснете такива количества от оцветената вода, че да се получи цветът на плаващата плочка в резервоара. Един от крановете е с жълта вода, един е със светло синя и един с пурпурна. Четвъртият кран е за източване на водата от резервоара.</p><p>За да разберете дали сте постигнали точния цвят, погледнете резервоара отгоре &ndash; трябва цветът на плочката да съвпада с цвета на водата.</p>';
}



MEIRO.Models.T001.prototype.constructColorRing = function()
{
	var colors = [
		new THREE.Color(1,0,0),
		new THREE.Color(1,1/2,0),
		new THREE.Color(1,1,0),
		new THREE.Color(1/2,1,0),
		new THREE.Color(0,1,0),
		new THREE.Color(0,1,1/2),
		new THREE.Color(0,1,1),
		new THREE.Color(0,1/2,1),
		new THREE.Color(0,0,1),
		new THREE.Color(1/2,0,1),
		new THREE.Color(1,0,1),
		new THREE.Color(1,0,1/2),
	];

	var geometry = new THREE.RingGeometry( this.RING_RADIUS, this.RING_RADIUS+this.RING_WIDTH, 8, 1, 0, 2*Math.PI/colors.length );
	
	for( var i=0; i<colors.length; i++)
	{
		var material = new THREE.MeshBasicMaterial( { color: colors[i]} );
		var ring = new THREE.Mesh( geometry, material );
		ring.rotation.set( -Math.PI/2, 2*Math.PI/colors.length*i, 0, 'YXZ' );
		this.image.add( ring );
	}
}



MEIRO.Models.T001.prototype.constructFloor = function()
{
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", 2*this.RING_RADIUS+2, 2*this.RING_RADIUS+2 );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", 2*this.RING_RADIUS+2, 2*this.RING_RADIUS+2 );
	var lightMap = MEIRO.loadTexture( "textures/001_floor_lightmap.jpg", 1, 1 );

	var geometry = new THREE.CircleBufferGeometry(this.RING_RADIUS+1, 24);
	MEIRO.allowLightmap(geometry);
	
	var material = new THREE.MeshStandardMaterial( {
			metalness: 0.8,
			map: textureMap,
			normalMap: normalMap,
			lightMap: lightMap,
			lightMapIntensity: 2,
			polygonOffset: true,
			polygonOffsetUnits: 2,
			polygonOffsetFactor: 2,
	});
	
	var floor = new THREE.Mesh( geometry, material );
	floor.rotation.x = -Math.PI/2;
	this.image.add( floor );
}	
	
	
	
MEIRO.Models.T001.prototype.constructBase = function()
{
	// base
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", this.POOL_SIZE, this.BASE_HEIGHT );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", this.POOL_SIZE, this.BASE_HEIGHT );
	var lightMap = MEIRO.loadTexture( "textures/001_wall_lightmap.jpg" );

	var geometry = new THREE.BoxBufferGeometry( this.POOL_SIZE, this.BASE_HEIGHT, this.POOL_SIZE );
	MEIRO.allowLightmap(geometry);
	
	var base = new THREE.Mesh(
		geometry,
		new THREE.MeshStandardMaterial( {
				color: 'gray',
				metalness: 0.7,
				map: textureMap,
				normalMap: normalMap,
				lightMap: lightMap,
				lightMapIntensity: 1,
		})
	);
	base.position.y = this.BASE_HEIGHT/2;
	this.image.add( base );

	// base top
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", this.POOL_SIZE, this.POOL_SIZE );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", this.POOL_SIZE, this.POOL_SIZE );
	var geometry = new THREE.PlaneBufferGeometry(this.POOL_SIZE,this.POOL_SIZE);
	var base = new THREE.Mesh(
		geometry,
		new THREE.MeshStandardMaterial({
				metalness: 0.7,
				map: textureMap,
				normalMap: normalMap,
				normalScale: new THREE.Vector2(0.2,0.2),
				polygonOffset: true,
				polygonOffsetFactor: -1,
				polygonOffsetUnits: -1,
		})
	);
	base.position.y = this.BASE_HEIGHT;
	base.rotation.x = -Math.PI/2;
	this.image.add( base );
	
	// white plate over the base
	var geometry = new THREE.PlaneBufferGeometry(this.POOL_SIZE-3*this.FRAME_WIDTH,this.POOL_SIZE-3*this.FRAME_WIDTH);
	var base = new THREE.Mesh(
		geometry,
		new THREE.MeshBasicMaterial({
			polygonOffset: true,
			polygonOffsetFactor: -2,
			polygonOffsetUnits: -2
		})
	);
	base.position.y = this.BASE_HEIGHT;
	base.rotation.x = -Math.PI/2;
	this.image.add( base );
}


	
MEIRO.Models.T001.prototype.constructFrames = function()
{
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_64x256.jpg", 1, this.POOL_DEPTH+this.BASE_HEIGHT );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_64x256_normal.jpg", 1, this.POOL_DEPTH+this.BASE_HEIGHT );
	
	var geometry = new THREE.BoxBufferGeometry(this.FRAME_WIDTH,this.POOL_DEPTH+this.BASE_HEIGHT,this.FRAME_WIDTH);
	geometry.translate(this.POOL_SIZE/2-this.FRAME_WIDTH/3,this.BASE_HEIGHT/2+this.POOL_DEPTH/2,this.POOL_SIZE/2-this.FRAME_WIDTH/3);
	var material = new THREE.MeshStandardMaterial({
							metalness: 0.3,
							roughness: 0.6,
							map: textureMap,
							normalMap: normalMap,
						})
	
	for (i=0; i<4; i++)
	{
		var frame = new THREE.Mesh(geometry, material);
		frame.rotation.y = Math.PI/2*i;
		this.image.add(frame);
	}
}



MEIRO.Models.T001.prototype.constructGlass = function()
{
	const GLASS_HEIGHT = this.POOL_DEPTH*4.5/5;
	
	var textureMap = new THREE.TextureLoader().load( "textures/glass_1024x512.jpg" );
	var alphaMap = new THREE.TextureLoader().load( "textures/glass_1024x512_alpha.jpg" );
	
	var geometry = new THREE.PlaneBufferGeometry(this.POOL_SIZE,GLASS_HEIGHT);
		geometry.translate( 0, this.BASE_HEIGHT+GLASS_HEIGHT/2, this.POOL_SIZE/2-this.FRAME_WIDTH/3 );
		
	// front sides
	var material = new THREE.MeshBasicMaterial({
				map: textureMap,
				alphaMap: alphaMap,
				transparent: true,
				side: THREE.FrontSide,
			})

	for (var i=0; i<4; i++)
	{
		var glass = new THREE.Mesh( geometry, material );
		glass.rotation.y = i*Math.PI/2;
		glass.renderOrder = 2;
		this.image.add(glass);
	}
	
	// back sides
	var material = new THREE.MeshBasicMaterial({
				map: textureMap,
				alphaMap: alphaMap,
				transparent: true,
				side: THREE.BackSide,
			})
	for (var i=0; i<4; i++)
	{
		var glass = new THREE.Mesh( geometry, material );
		glass.rotation.y = i*Math.PI/2;
		glass.renderOrder = 1;
		this.image.add(glass);
	}

}



MEIRO.Models.T001.prototype.constructWater = function()
{
	// water
	var geometry = new THREE.BoxBufferGeometry(this.POOL_SIZE-2*this.FRAME_WIDTH/3,1,this.POOL_SIZE-2*this.FRAME_WIDTH/3,this.POOL_SIZE,1,this.POOL_SIZE);
	var pos = geometry.getAttribute('position');

	this.water = new THREE.Mesh(
		geometry,
		new THREE.MeshBasicMaterial({
			polygonOffset: true,
			polygonOffsetUnits: 1,
			polygonOffsetFactor: 1,
			transparent: true,
		})
	);
	this.water.position.y = this.BASE_HEIGHT-0.5;

	// water line
	var geometry = new THREE.BufferGeometry();
	{
		var vertices = new Float32Array( 3 * (2*this.POOL_SIZE+2*this.POOL_SIZE+1) );
		var n=0;
		var x = (-this.POOL_SIZE/2)*(this.POOL_SIZE-2*this.FRAME_WIDTH/3)/this.POOL_SIZE;
		var z = this.POOL_SIZE/2-this.FRAME_WIDTH/3;
		var dx = (this.POOL_SIZE-2*this.FRAME_WIDTH/3)/(this.POOL_SIZE);
		var dz = (this.POOL_SIZE-2*this.FRAME_WIDTH/3)/(this.POOL_SIZE);
		
		function setVertex()
		{
			vertices[n++] = x;
			vertices[n++] = 0;
			vertices[n++] = z;
		}
		
		for (var i=0; i<=this.POOL_SIZE; i++,x+=dx) setVertex();

		z -= dz;
		x -= dz;
		for (var i=0; i<=this.POOL_SIZE-1; i++,z-=dz) setVertex();

		z += dz;
		x -= dz;
		for (var i=0; i<=this.POOL_SIZE-1; i++,x-=dx) setVertex();

		z += dz;
		x += dz;
		for (var i=0; i<=this.POOL_SIZE-1; i++,z+=dz) setVertex();

		geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	}
	this.image.add( this.water );
	
	this.waterLine = new THREE.Line(
		geometry,
		new THREE.LineBasicMaterial({
			color: 'black',
			transparent: true,
			opacity: 0.2,
		})
	);
	this.waterLine.position.copy(this.water.position);
	this.image.add( this.waterLine );
}
	

	
MEIRO.Models.T001.prototype.constructPipe = function()
{
	var pipe = new THREE.Group();
	pipe.position.y = this.BASE_HEIGHT/2;
	
	// horizontal pipe
	var normalMap = MEIRO.loadTexture( "textures/Metal_pipe_32x32_normal.jpg", 1, 24 );
	
	var geometry = new THREE.CylinderBufferGeometry( this.PIPE_RADIUS, this.PIPE_RADIUS, this.PIPE_LENGTH, options.lowpoly?6:32, 1, false );
	var material = new THREE.MeshStandardMaterial( {
		normalMap: normalMap,
		normalScale: new THREE.Vector2(2,2),
		metalness: 0.2 } );
		
	var tube = new THREE.Mesh( geometry, material );
	tube.position.z = this.POOL_SIZE/2+this.PIPE_LENGTH/2;
	tube.rotation.x = Math.PI/2;
	pipe.add( tube );

	// curved pipe
	var z = this.POOL_SIZE/2+this.PIPE_LENGTH;
	var y = this.BASE_HEIGHT/2;
	var curve = new THREE.CubicBezierCurve3(
		new THREE.Vector3( 0, 0,    z ),
		new THREE.Vector3( 0, 0,    z+3*y/4 ),
		new THREE.Vector3( 0, -y/4, z+y ),
		new THREE.Vector3( 0, -y,   z+y )
	);

	var normalMap = MEIRO.loadTexture( "textures/Metal_pipe_32x32_normal.jpg", 12, 1 );
	
	var geometry = new THREE.TubeGeometry( curve, options.lowpoly?6:20, this.PIPE_RADIUS, options.lowpoly?6:32, false );
	var material = new THREE.MeshStandardMaterial( {
		normalMap: normalMap,
		normalScale: new THREE.Vector2(2,2),
		metalness: 0.2 } );
	var tube = new THREE.Mesh( geometry, material );
	pipe.add( tube );

	// wall connector
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", 2, 2 );
	var geometry = new THREE.CylinderBufferGeometry(this.PIPE_RADIUS+this.PIPE_EXTRUDE,this.PIPE_RADIUS+2*this.PIPE_EXTRUDE,this.PIPE_EXTRUDE,options.lowpoly?6:32);
	var material = new THREE.MeshStandardMaterial( {
		color: 0x404040,
		normalMap: normalMap,
		metalness: 0.6
	});
	var connector = new THREE.Mesh( geometry, material );
	connector.position.z = this.POOL_SIZE/2+this.PIPE_EXTRUDE/2;
	connector.rotation.x = Math.PI/2;
	pipe.add( connector );

	// floor connector
	var connector = new THREE.Mesh( geometry, material );
	connector.position.z = this.POOL_SIZE/2+this.PIPE_LENGTH+this.BASE_HEIGHT/2;
	connector.position.y = this.PIPE_EXTRUDE/2-this.BASE_HEIGHT/2;
	pipe.add( connector );

	// valve connector
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", 2, 1/2 );
	var geometry = new THREE.CylinderBufferGeometry(this.PIPE_RADIUS+this.PIPE_EXTRUDE/2,this.PIPE_RADIUS+this.PIPE_EXTRUDE/2,this.VALVE_LENGTH,options.lowpoly?6:32);
	var material = new THREE.MeshStandardMaterial( {
		color: 'lightgray',
		normalMap: normalMap,
		normalScale: new THREE.Vector2(1/2,1/2),
		roughness: 0.6,
		metalness: 0.7
		} );
	var connector = new THREE.Mesh( geometry, material );
	connector.position.z = this.POOL_SIZE/2+this.PIPE_LENGTH;
	connector.rotation.x = Math.PI/2;
	pipe.add( connector );
	
	return pipe;
}



MEIRO.Models.T001.prototype.constructValve = function()
{
	// handle
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", 8, 1 );
	normalMap.offset = new THREE.Vector2( 0, -0.25 );
	
	var material = new THREE.MeshStandardMaterial({
			normalMap: normalMap,
			normalScale: new THREE.Vector2( 2, 2 ),
			metalness: 0.1
		});
	var valve = new THREE.Mesh(
		new THREE.TorusBufferGeometry(this.VALVE_RADIUS,this.VALVE_WIDTH,options.lowpoly?6:12,options.lowpoly?6:30),
		material
	);
	valve.position.y = this.PIPE_RADIUS/2+3*this.VALVE_LENGTH/4;
	valve.position.z = this.POOL_SIZE/2+this.PIPE_LENGTH;
	valve.rotation.x = Math.PI/2;
	valve.scale.set(EPS,EPS,EPS);

	// bar
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", 1/2, 2 );
	var bar = new THREE.Mesh(
		new THREE.CylinderBufferGeometry(this.VALVE_WIDTH*0.7,this.VALVE_WIDTH*0.7,2*this.VALVE_RADIUS,6,1,true),
		new THREE.MeshStandardMaterial({
			color: 'dimgray',
			normalMap: normalMap,
			normalScale: new THREE.Vector2( 2, 2 ),
			metalness: 0.2
		})
	);
	valve.add(bar);

	// second bar
	bar = bar.clone();
	bar.rotation.z = Math.PI/2;
	valve.add(bar);
	valve.name = 'valve';

	// rod
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", 2, 2 );
	geometry = new THREE.CylinderBufferGeometry(this.PIPE_EXTRUDE,this.PIPE_EXTRUDE,this.VALVE_LENGTH,options.lowpoly?6:24);
	var tube = new THREE.Mesh( 
		geometry,
		new THREE.MeshStandardMaterial({
			color: 'dimgray',
			normalMap: normalMap,
			normalScale: new THREE.Vector2( 8, 8 ),
			metalness: 0.2
		})
	);
	tube.position.z = 2*this.VALVE_LENGTH/5;
	tube.rotation.x = -Math.PI/2;
	valve.add( tube );

	return valve;
}



MEIRO.Models.T001.prototype.constructPipes = function()
{
	this.pipes = new THREE.Group();
	
	var that = this;
	function attach( index, pipe, valve )
	{
		pipe.rotation.y = Math.PI/2*index;
		pipe.index = 0;
		pipe.add( valve );
		pipe.valve = valve;
		valve.material = valve.material.clone();
		valve.material.color = new THREE.Color( (['cyan','magenta','yellow','black'])[index] );
		that.pipes.add(pipe);
	}
	
	// cyan, magenta, yellow and black pipes
	var pipe = this.constructPipe();
	var valve = this.constructValve();
	attach( 0, pipe, valve );
	attach( 1, pipe.clone(), valve.clone() );
	attach( 2, pipe.clone(), valve.clone() );
	attach( 3, pipe.clone(), valve.clone() );

	this.image.add( this.pipes );
}



MEIRO.Models.T001.prototype.onObject = function()
{
	if (!this.playing) return undefined;
	
	// координати на мишка
	this.mouse.x = (controls.human.mousePos.x/window.innerWidth)*2 - 1;
	this.mouse.y = -(controls.human.mousePos.y/window.innerHeight)*2 + 1;

	this.raycaster.setFromCamera( this.mouse, camera );
	
	var intersects = this.raycaster.intersectObject( this.water );
	if (intersects.length)
	{	// при кликване върху водата се маркира, че няма кликване
		// в противен случай може да се кликне на тръба зад водата
		return undefined;
	}
			
	for( var i=0; i<4; i++)
	{
		var pipe = this.pipes.children[i];
		
		for(var j=0; j<pipe.children.length; j++)
		{
			var element = pipe.children[j];
			var intersects = this.raycaster.intersectObject( element );
			if (intersects.length)
			{
				this.clicks++;
				//console.log('on '+i);
				this.activePipe = pipe;
				return pipe;
			}
		}
	}

	return undefined;
}



MEIRO.Models.T001.prototype.onDragEnd = function()
{
	this.activePipe = undefined;
}



MEIRO.Models.T001.prototype.generateWaterSurface = function(time)
{
	// положение на горното ниво на водата
	var surfaceY = this.BASE_HEIGHT + this.waterLevel*this.POOL_DEPTH*4/5 - this.water.position.y;
	
	// генериране на вълни по горната повърхност
	var pos = this.water.geometry.getAttribute('position');
	for (var i=0; i<pos.count; i++)
	{
		var x = pos.getX(i);
		var y = pos.getY(i);
		var z = pos.getZ(i);
		if (y>0)
		{
			var y = surfaceY;
			y += (this.waterLevel)*Math.sin(rpm(time,25)+x+z*z/10)/10;
			y += (this.waterLevel)*Math.cos(rpm(time,28)+z-x*x/10)/10;
			pos.setY(i,y);
		}
	}
	pos.needsUpdate = true;	
	
	
	// генериране на контура на водата
	var pos = this.waterLine.geometry.getAttribute('position');
	for (var i=0; i<pos.count; i++)
	{
		var x = pos.getX(i);
		var y = pos.getY(i);
		var z = pos.getZ(i);
		
		var y = surfaceY;
		y += (this.waterLevel)*Math.sin(rpm(time,25)+x+z*z/10)/10;
		y += (this.waterLevel)*Math.cos(rpm(time,28)+z-x*x/10)/10;
		pos.setY(i,y);
	}
	pos.needsUpdate = true;	
	
	
	this.targetColorBox.position.set(
		this.waterLevel*Math.sin(rpm(time,3.5)),
		this.BASE_HEIGHT + this.waterLevel*this.POOL_DEPTH*4/5 + 0.3-0.3*this.waterLevel,
		this.waterLevel*Math.sin(rpm(time-2,3.1))
	);
	this.targetColorBox.rotation.set(0.2*this.waterLevel*Math.sin(rpm(time,10)),0.15*this.waterLevel*Math.cos(rpm(time,13)),0.1*this.waterLevel*Math.sin(rpm(time-1,14)));
}


MEIRO.Models.T001.prototype.updateWaterAmount = function()
{
	// добавяне на цветна вода според активния входен кран
	if (this.activePipe === this.pipes.children[0])
		this.waterCyan -= this.pipes.children[0].valve.rotation.z/3000;

	if (this.activePipe === this.pipes.children[1])
		this.waterMagenta -= this.pipes.children[1].valve.rotation.z/3000;

	if (this.activePipe === this.pipes.children[2])
		this.waterYellow -= this.pipes.children[2].valve.rotation.z/3000;

	// премахване на вода, ако е развъртян изходния кран
	if (this.activePipe === this.pipes.children[3])
	{
		var sum = this.waterCyan+this.waterMagenta+this.waterYellow;
		let k = (sum<0.001) ? 0 : 1-0.005/sum;
		this.waterCyan = Math.max( 0, k*this.waterCyan );
		this.waterMagenta = Math.max( 0, k*this.waterMagenta );
		this.waterYellow = Math.max( 0, k*this.waterYellow );
	}
	
	// сумарно водата не може да е повече от 100%
	var sum = this.waterCyan+this.waterMagenta+this.waterYellow;
	if (sum>1)
	{
		this.waterCyan *= 1/sum;
		this.waterMagenta *= 1/sum;
		this.waterYellow *= 1/sum;
	}
}


MEIRO.Models.T001.prototype.updateWaterColor = function()
{	
	// определяне на цвета на водата, като всяка компонента
	// се мащабира така, че най-голямата да стане 100%
	var max = Math.max(this.waterCyan,this.waterMagenta,this.waterYellow);
	max = Math.max(0.0001,max);
	this.water.material.color.setRGB(
		1-this.waterCyan/max,
		1-this.waterMagenta/max,
		1-this.waterYellow/max
	);

	// определяне на нивото на водата
	this.oldWaterLevel = this.waterLevel;
	this.waterLevel = this.waterCyan+this.waterMagenta+this.waterYellow;
	
	// определяне на прозрачността на водата - при малко вода
	// тя изглежда по-прозрачна, при повече вода - по-гъста
	//this.water.material.opacity = Math.pow((this.waterLevel),1/5);
	//this.water.material.opacity = Math.cos(Math.PI*(1-this.waterLevel))*0.5+0.5;
	this.water.material.opacity = Math.pow(Math.sin(Math.PI/2*(this.waterLevel)),2);
}




MEIRO.Models.T001.prototype.activateWaterSound = function()
{	
	// сила на звука на тръбите
	var valveOpenness = 0;
	for (var i=0; i<4; i++)
		valveOpenness = Math.max(valveOpenness,Math.abs(this.pipes.children[i].valve.rotation.z));
	valveOpenness = valveOpenness / (2*Math.PI);
	
	var waterAudioVolume = valveOpenness * this.waterLevel;

	if (waterAudioVolume>0.001)
	{
		if (this.audioWater.paused)
		{
			this.audioWater.currentTime = 0;
			this.audioWater.play();
		}
		this.audioWater.volume = waterAudioVolume;
	}
	else
		this.audioWater.pause();

	// сила на звука на резервоара
	if (this.waterLevel>0.01)
		this.audioBubbles.play();
	this.audioBubbles.volume = this.waterLevel/4;
	
	// сблъсък на плочката в пода
	if (this.waterLevel<0.01 && this.oldWaterLevel>0.01)
	{
		this.audioBoom.currentTime = 0;
		this.audioBoom.play();
	}
	this.olsWaterLevel = this.waterLevel;
}


// аниматор на модела
MEIRO.Models.T001.prototype.onAnimate = function(time)
{	
	this.updateWaterAmount();
	this.updateWaterColor();
	this.generateWaterSurface(time);
	this.activateWaterSound();
	
	// развъртане на активния кран (ако има такъв)
	// и завъртане на всички неактивни кранове
	for( var i=0; i<4; i++)
	{
		var pipe = this.pipes.children[i];
		pipe.valve.position.y = this.PIPE_RADIUS+this.VALVE_LENGTH*(2/5-3/5*pipe.valve.rotation.z/(2*Math.PI));
		
		if (pipe == this.activePipe)
			pipe.valve.rotation.z = THREE.Math.lerp(pipe.valve.rotation.z,-2*Math.PI,0.015);
		else
			pipe.valve.rotation.z = Math.min( pipe.valve.rotation.z+0.25, 0 );
	}
	

	if (this.playing)
	{
		if (time-this.lastTime>=1000)
		{
			var dTime =  Math.floor((time-this.startTime)/1000);
			var s = dTime%60;
			var m = Math.floor(dTime/60)%60;
			var h = Math.floor(dTime/60/60);
			var string = (m<10?0:'')+m+':'+(s<10?0:'')+s;
			if (h) string = h+':'+string;
			this.buttonTimer.setText(string);
			this.lastTime = time;
		}
	}
	
	TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.T001.prototype.onInfo = function(element)
{
	element.innerHTML = this.info;
}



MEIRO.Models.T001.prototype.evaluateResult = function()
{	
	var r1 = this.water.material.color.r*this.water.material.opacity + (1-this.water.material.opacity);
	var g1 = this.water.material.color.g*this.water.material.opacity + (1-this.water.material.opacity);
	var b1 = this.water.material.color.b*this.water.material.opacity + (1-this.water.material.opacity);
	
	var r2 = this.config.targetColor.r;
	var g2 = this.config.targetColor.g;
	var b2 = this.config.targetColor.b;

	// https://en.wikipedia.org/wiki/Color_difference
	var dR = r1-r2;
	var dG = g1-g2;
	var dB = b1-b2;
	var rr = (r1+r2)/2*255;
	var k = (2+rr/256)+4+(2+(255-rr)/256);
	var dC = Math.sqrt( (2+rr/256)*dR*dR+4*dG*dG+(2+(255-rr)/256)*dB*dB)/Math.sqrt(k);

	var match1 = Math.max( 0, 1-2*dC );
	
	var maxDiff = Math.max(Math.abs(dR),Math.abs(dG),Math.abs(dB));
	var match2 = Math.max( 0, 1-20*maxDiff*maxDiff );
	
	var match = (match1+match2)/2;
	
	this.config.score = match*this.config.max_score;
	var target_color = Math.round(100-100*r2)/100+', '+Math.round(100-100*g2)/100+', '+Math.round(100-100*b2)/100;
	var player_color = Math.round(100-100*r1)/100+', '+Math.round(100-100*g1)/100+', '+Math.round(100-100*b1)/100;
	
	this.config.time =  Math.floor((animationLoop.time-this.startTime)/1000);
	
//	console.log('score=',this.config.score);
	this.info = '';
	this.info += '<h1 style="text-align:center;">Цветният резервоар &ndash; '+Math.round(1000*this.config.score)/10+' от '+Math.round(100*this.config.max_score)+' точки</span></h1>';

	this.info += '<p><table style="width:20em; margin:auto;">';
	this.info += '<tr><td style="text-align:center; width:10em;">Желан цвят:</td><td style="text-align:center; width:10em;">Постигнат цвят:</td></tr>';
	this.info += '<tr><td style="text-align:center;">'+target_color+'</td><td style="text-align:center;">'+player_color+' </td></tr>';
	this.info += '<tr><td style="text-align:center;"><div style="border: solid 1px black; height:3em; background:rgb('+Math.round(255*r2)+','+Math.round(255*g2)+','+Math.round(255*b2)+')"></div></td><td style="text-align:center;"><div style="border: solid 1px black; height:3em; background:rgb('+Math.round(255*r1)+','+Math.round(255*g1)+','+Math.round(255*b1)+')"></div></td></tr>';
	this.info += '</table></p>';
//	console.log('evaluation=',this.config.score*match);
}



MEIRO.Models.T001.prototype.sendResult = function(callback)
{
	var data = new FormData();
	data.append('ACTION', 'END');
	data.append('MODEL', 'T001');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	data.append('SCORE', Math.round(100*this.config.score)/100);
	data.append('TIME', this.config.time);
	data.append('CLICKS', this.clicks);
	
	var competences = [];
	for (var i=0; i<MEIRO.Models.T001.COMPETENCES.length; i++)
		competences.push( Math.round(100*MEIRO.Models.T001.COMPETENCES[i]*this.config.score)/100 );
	
	data.append('COMPETENCES', competences);
	postData(data,callback,callback);
}



MEIRO.Models.T001.prototype.sendStartup = function(callback)
{
	var data = new FormData();
	data.append('ACTION', 'START');
	data.append('MODEL', 'T001');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	postData(data,callback,callback);
}



MEIRO.Models.T001.prototype.onEnter = function(element)
{
	MEIRO.Model.prototype.onEnter.call(this);

	var that = this;
	
	that.info = that.defaultInfo;

	if (controls.buttonMotion) controls.buttonMotion.hide();
	that.buttonTimer.setText('');
	that.buttonTimer.show();
	that.playing = true;
	that.configure(parseInt(options.difficulty)|0);
	that.startTime = animationLoop.time;
	new TWEEN.Tween({k:0})
		.to({k:1},500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
			that.targetColorBox.material.color.lerp(that.config.targetColor,this.k);
			that.targetColorPlate.material.color.set(that.targetColorBox.material.color);
			for( var i=0; i<4; i++)
			{
				that.pipes.children[i].valve.scale.set(this.k,this.k,this.k);
			}
		} )
		.start();
}


// превключвател на модела
MEIRO.Models.T001.prototype.onExitModel = function(element)
{
	//MEIRO.Model.prototype.onExit.call(this);
	
	var that = this;
	
	that.playing = false;
	that.evaluateResult();
	new TWEEN.Tween({k:1})
		.to({k:EPS},500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
			for( var i=0; i<4; i++)
			{
				that.pipes.children[i].valve.scale.set(this.k,this.k,this.k);
			}
		} )
		.start();
	that.sendResult(
	function(){
		MEIRO.showInfo(this,
				function(){
					console.log('on before close info');
					if (MEIRO.singleRoom)
					{	
						window.history.back();
					}
				},
				function(){
					console.log('on after close info');
					if (!MEIRO.singleRoom)
					{
						if (controls.buttonMotion) controls.buttonMotion.show();
						controls.startWalk(true,false);
					}
					that.info = that.defaultInfo;
				}
		);
	}
	);
	
	reanimate();
}



// конфигурира сцената според желаната трудност
MEIRO.Models.T001.prototype.configure = function(difficulty)
{	
	this.config = {difficulty: difficulty};
		
	var max_score = 0;
	var cmy = [0,0,0];
	
	switch (difficulty)
	{
		// ниска трудност - основни CMY цветове и млечните им варианти
		case DIFFICULTY_LOW:
			
			if (random(0,1))
			{
				max_score = 0.1;
				cmy[random(0,2)] = 4;
			}
			else
			{
				max_score = 0.2;
				cmy[random(0,2)] = 2;
			}
			break;
			
		// средна трудност - смесени CMY цветове и млечните им (основни RGB и млечните им)
		case DIFFICULTY_MEDIUM:
			var c = 2*random(1,2);
			cmy = [c,c,c];
			cmy[random(0,2)] = 0;
			if (c==4)
				max_score = 0.3;
			else
				max_score = 0.4;
			break;
			
		// висока трудност - цветове с поне една компонента наполовина
		case DIFFICULTY_HIGH:
			max_score = 1.0;
			cmy[0] = 1*random(1,4);
			cmy[1] = 1*random(1,4);
			cmy[2] = 1*random(1,4);
			if (cmy[0]==4) max_score -= 0.1;
			if (cmy[1]==4) max_score -= 0.1;
			if (cmy[2]==4) max_score -= 0.1;
			break;
			
		default: console.error('Unknown difficulty level');
	}

	this.config.targetColor = new THREE.Color( 1-cmy[0]/4, 1-cmy[1]/4, 1-cmy[2]/4 );
	this.config.max_score = max_score;
	
	if (!IN_SCORE_STATISTICS)
	{
		this.sendStartup();
	}
}


// извежда статистика за шъзмовните конфигурации
MEIRO.Models.T001.prototype.configureStats = function()
{	
	IN_SCORE_STATISTICS = true;
	
	var data = [];
	var that = this;
	
	var NUMBER_OF_TESTS = 100000;
	
	function calculateStats(difficulty,name)
	{
		var min=1000;
		var max=0;
		var avg = 0;
		for(var i=0; i<NUMBER_OF_TESTS; i++)
		{
			that.configure(difficulty);
			var k = Math.round(that.config.max_score*1000);
			min = Math.min(k,min);
			max = Math.max(k,max);
			avg += k;
		}
		data.push({level:name, min:min, avg:Math.floor(10*avg/NUMBER_OF_TESTS)/10, max:max});
	}
	
	console.log('\n\n\nSCORE AND DIFFICULTY STATISTICS\nVALUE RANGE: 0..1000\nTESTS COUNT: '+NUMBER_OF_TESTS);
	calculateStats(DIFFICULTY_LOW,'LOW');
	calculateStats(DIFFICULTY_MEDIUM,'MEDIUM');
	calculateStats(DIFFICULTY_HIGH,'HIGH');
	
	console.table( data );
	
	IN_SCORE_STATISTICS = false;
}