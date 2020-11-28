
var SCORE_STATISTICS = !true;
var IN_SCORE_STATISTICS = false;

//	Основи на Компютърната Графика
//	Тест 007 - Матричната въртележка
//	П. Бойчев, 2019
//
//	 ├─ T007
//	 │   ├─ initialize()
//	 │   ├─ construct()
//	 │   │    ├─ constructFloor()
//	 │   │    ├─ constructBase()
//	 │   │    ├─ constructArenas()
//	 │   │    │    ├─ constructMatrixTexture(matrixData)
//	 │   │    │    └─ randomMatrix()
//	 │   │    ├─ constructMatrices()
//	 │   │    ├─ constructSystems()
//	 │   │    ├─ constructDigits()
//	 │   │    ├─ constructLabels()
//	 │   │    ├─ constructCarousel()
//	 │   │    └─ configureStats()
//	 │   ├─ onAnimate()
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
//	Textures
//		
//	Sound effects
//

var DIFFICULTY_LOW = 0;		// ниска трудност
var DIFFICULTY_MEDIUM = 1;	// средна трудност
var DIFFICULTY_HIGH = 2;	// висока трудност

// конструктор на модела
MEIRO.Models.T007 = function T007(room, model)
{
	MEIRO.Model.apply(this, arguments);
	
	this.initialize();
	this.construct();
}
MEIRO.Models.T007.prototype = Object.create(MEIRO.Model.prototype);



MEIRO.Models.T007.DIST = {MIN:15, MAX:22, HEIGHT:0};
MEIRO.Models.T007.POS = {DIST:22, ROT_X:0.9, ROT_Y:0.15, ON_FLOOR:true};
MEIRO.Models.T007.ROT_Y = {MIN:0.0, MAX:1.56};
MEIRO.Models.T007.SCALE = {MAX:0.25};
MEIRO.Models.T007.COMPETENCES = [3,0,2,5,0, 0,0,4,0, 2,0,2, 0,5,5,2,0];



MEIRO.Models.T007.prototype.initialize = function()
{
	random.randomize();
	this.matrixData = [];

	if (SCORE_STATISTICS) this.configureStats();
	

	this.FLOOR_RADIUS = 8;
	
	this.BASE_RADIUS = 6;
	this.BASE_HEIGHT = 2;
	
	this.ARENA_RADIUS = 1.5;
	this.ARENA_DISTANCE = 4.9;
	
	this.DIGIT_SIZE = 0.3;
	
	this.SYSTEM_HEIGHT = 7;
	this.SYSTEM_SCALE = 0.15;
	this.SYSTEM_LENGTH = 5; // length of thread
	
	this.FRAME_WIDTH = 0.1;
	
	this.systems = [];
	//this.arenas = [];

	//this.labels = [];
	this.carouselSpeed = 0;
	this.carouselSpin = random(1,5);
	this.carouselUp = 0;
	this.carouselBack = 0;
	this.carousel = new THREE.Group();
	
	this.animationSteps = 90;
	this.animationStep = 0;

	this.speedUp = false;
	this.animateTime = 0;
	this.stopTime = -1000000;
	this.scaleVibro = 0;
	
	this.playing = false;
	this.startTime = 0;
	this.lastTime = 0;
	this.clicks = 0;
	
	this.carouselMusic = new Audio('sounds/carousel.mp3');
	this.carouselMusic.loop = true;
	this.carouselMusic.volume = 0;
	this.carouselMusic.pause();
	
	this.swingSqueak = new Audio('sounds/swing_squeak_2.mp3');
	this.swingSqueak.pause();
	this.swingSqueak.volume = 0;
}

	

MEIRO.Models.T007.prototype.construct = function()
{
	// допълнителна светлина, прави пода по-красив
	var light = new THREE.PointLight( 'white', 0.3 );
	light.position.set( 0, 10, 0 );
	this.image.add( light );
	
	this.constructFloor();
	this.constructBase();
	

	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();


	// бутон за стартиране/приключване
	var that = this;
	this.buttonTimer = new MEIRO.CornerButton('topLeft', function(){that.onExitModel();}, '0:00', 'images/time.png');
	this.buttonTimer.hide();

	this.defaultInfo = '<h1>Матричната въртележка</h1>';
	this.defaultInfo += '<p>Шест анимации на графични трансформации са на въртележка. Трансформациите са измежду следните: идентитет, транслация, мащабиране, въртене, ортогонална проекция и перспективна проекция. Чрез кликване върху носещата ос на въртележката тя се завърта. Целта е да я завъртите така, че над показаните в основата матрици да стои съответната трансформация.</p>';
}



MEIRO.Models.T007.prototype.constructFloor = function()
{
	// side
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", 6*this.BASE_RADIUS, this.FLOOR_RADIUS );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", 6*this.BASE_RADIUS, this.FLOOR_RADIUS );
	var lightMap = MEIRO.loadTexture( "textures/007_floor_lightmap.jpg" );

	var geometry = new THREE.ConeBufferGeometry(this.FLOOR_RADIUS, 0.01, 200, 1, false);
	MEIRO.allowLightmap(geometry);
	
	var material = new THREE.MeshStandardMaterial( {
		color: 'white',
		metalness: 0.7,
		map: textureMap,
		lightMap: lightMap,
		lightMapIntensity: 4,
		normalMap: normalMap,
		normalScale: new THREE.Vector2(0.5,0.5),
	});
	
	var floor = new THREE.Mesh( geometry, material );
	this.image.add( floor );
}	
	
	
	
MEIRO.Models.T007.prototype.constructBase = function()
{
	// side
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", 6*this.BASE_RADIUS, 2 );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", 6*this.BASE_RADIUS, 2 );
	var lightMap = MEIRO.loadTexture( "textures/007_base_lightmap.jpg" );

	var geometry = new THREE.CylinderBufferGeometry(this.BASE_RADIUS, this.BASE_RADIUS, this.BASE_HEIGHT, 200, 1, true);
	MEIRO.allowLightmap(geometry);
	
	var pos = geometry.getAttribute('position');
	//var uv = geometry.getAttribute('uv');
	//var nor = geometry.getAttribute('normal');
	for (var i=0; i<pos.count; i++)
	{
		var x = pos.getX(i);
		var y = pos.getY(i);
		var z = pos.getZ(i);
		if (Math.abs(x)>0.1 || Math.abs(z)>0.1)
		{
			var angle = Math.atan2(z,x);
			x = Math.cos(angle);
			z = Math.sin(angle);
			var radius=0;
			
			if (y>0)
			{
				radius = this.BASE_RADIUS*(1+0.1*Math.cos(6*angle));
				x *= radius;
				z *= radius;
				pos.setXYZ(i,x,this.BASE_HEIGHT/2,z);
			}
		}
	}
	//geometry.computeVertexNormals();
	
	var material = new THREE.MeshStandardMaterial( {
			metalness: 0.7,
			map: textureMap,
			normalMap: normalMap,
			normalScale: new THREE.Vector2(0.5,0.5),
			lightMap: lightMap,
			lightMapIntensity: 1,
			polygonOffset: true,
			polygonOffsetUnits: 2,
			polygonOffsetFactor: 2,
	});
	
	var base = new THREE.Mesh( geometry, material );
	base.position.y = this.BASE_HEIGHT/2;
	//base.rotation.y = 3*Math.PI/6;
	this.image.add( base );

	// top
	var geometry = new THREE.CircleBufferGeometry(this.BASE_RADIUS, 200);
	geometry.rotateX( -Math.PI/2 );
	//MEIRO.allowLightmap(geometry);
	
	var pos = geometry.getAttribute('position');
	for (var i=0; i<pos.count; i++)
	{
		var x = pos.getX(i);
		var y = pos.getY(i);
		var z = pos.getZ(i);
		var angle = Math.atan2(z,x);
		if (x*x+z*z>0.1)
		{
			x = Math.cos(angle);
			z = Math.sin(angle);
			var radius = this.BASE_RADIUS*(1+0.1*Math.cos(6*angle));
			x *= radius;
			z *= radius;
			pos.setXYZ(i,x,y,z);
		}
	}
	//geometry.computeVertexNormals();
	
	var material = new THREE.MeshStandardMaterial( {
		color: 'black',
		metalness: 0.8,
	});
	
	var top = new THREE.Mesh( geometry, material );
	top.position.y = this.BASE_HEIGHT;
	this.image.add( top );
	
}	
	
	
MEIRO.Models.T007.prototype.constructCarousel = function()
{

	// pillar
	var textureMap = MEIRO.loadTexture( "textures/007_pillar.jpg", 1, 1 );
	var normalMap = MEIRO.loadTexture( "textures/metric_plate_256x256_normal.jpg", 1, 1 );
	
	var points = [];
	var r = 3.2;
	for ( var i = 0; i < 5*this.SYSTEM_HEIGHT; i ++ )
	{
		points.push( new THREE.Vector2(r,i/5));
		r = r*0.92
	}
	var geometryPillar = new THREE.LatheBufferGeometry( points, 32 );
	var material = new THREE.MeshStandardMaterial({
		color: 'cornflowerblue',
		metalness: 0.2,
		map: textureMap,
		normalMap: normalMap,
		normalScale: new THREE.Vector2(0.5,0.5),
	});
	this.pillar = new THREE.Mesh( geometryPillar, material );
	this.pillar.position.y = this.BASE_HEIGHT;
	this.carousel.add( this.pillar );
	
	// topper
	var geometryTopper = new THREE.SphereBufferGeometry(1,12);
	var material = new THREE.MeshStandardMaterial({
		color: 'cornflowerblue',
		metalness: 0.2,
		normalMap: normalMap,
		normalScale: new THREE.Vector2(0.5,0.5),
	});
	var topper = new THREE.Mesh( geometryTopper, material );
	topper.scale.set(1,0.2,1);
	topper.position.y = this.BASE_HEIGHT+this.SYSTEM_HEIGHT-0.03;
	this.carousel.add( topper );
	
	// branches
	for (var i=0; i<6; i++)
	{
		var branch = new THREE.Mesh( geometryPillar,material );
		branch.position.y = this.BASE_HEIGHT+this.SYSTEM_HEIGHT;
		branch.rotation.set(-Math.PI/2,2*Math.PI/6*i+2*Math.PI/12,0,'YXZ');
		branch.scale.set(0.35,this.ARENA_DISTANCE/this.SYSTEM_HEIGHT,0.05);
		this.carousel.add( branch );

		var angle = 2*Math.PI/6*i;
		var topper = new THREE.Mesh( geometryTopper,material );
		topper.position.set(this.ARENA_DISTANCE*Math.cos(angle),this.BASE_HEIGHT+this.SYSTEM_HEIGHT,this.ARENA_DISTANCE*Math.sin(angle));
		topper.scale.set(0.15,0.05,0.15);
		this.carousel.add( topper );
	}
	
	this.image.add( this.carousel );

}	
	
	
MEIRO.Models.T007.prototype.generateCoordSystem = function(x,y,z)
{
	var W = 0.3;	// width of axes	
	var L = 10;		// length of axes
	var S = 8;		// letter scale
	var coordSystem = new THREE.Group();
//	var material = new THREE.MeshBasicMaterial({color:'cornflowerblue'});
	var material = new THREE.MeshStandardMaterial({color:'orange'});

	// arrows
	var geometry = new THREE.CylinderBufferGeometry(W/2,W,L,6/*,1,true*/);
	// y+
	var arrow = new THREE.Mesh( geometry, material );
	arrow.position.y = L/2;
	coordSystem.add( arrow );
	// y-
	var arrow = new THREE.Mesh( geometry, material );
	arrow.position.y = -L/2;
	arrow.rotation.x = Math.PI;
	coordSystem.add( arrow );
	// x+
	var arrow = new THREE.Mesh( geometry, material );
	arrow.position.x = L/2;
	arrow.rotation.z = -Math.PI/2;
	coordSystem.add( arrow );
	// x-
	var arrow = new THREE.Mesh( geometry, material );
	arrow.position.x = -L/2;
	arrow.rotation.z = Math.PI/2;
	coordSystem.add( arrow );
	// z+
	var arrow = new THREE.Mesh( geometry, material );
	arrow.position.z = L/2;
	arrow.rotation.x = Math.PI/2;
	coordSystem.add( arrow );
	// z-
	var arrow = new THREE.Mesh( geometry, material );
	arrow.position.z = -L/2;
	arrow.rotation.x = -Math.PI/2;
	coordSystem.add( arrow );

	// labels
	// x
	MEIRO.PRIMITIVE.GEOMETRY.X.center();
	MEIRO.PRIMITIVE.GEOMETRY.Y.center();
	MEIRO.PRIMITIVE.GEOMETRY.Z.center();
	
	var label = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.X, material);
	label.scale.set( S,S,4*S );
	label.position.set(L,0,0);
	label.rotation.x = -Math.PI/2;
	label.rotation.z = -Math.PI/2;
	coordSystem.add( label );
	//this.labels.push( label );

	var label = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.Y, material);
	label.scale.set( S,S,4*S );
	label.position.set(0,L,0);
	coordSystem.add( label );
	//this.labels.push( label );

	var label = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.Z, material);
	label.scale.set( S,S,4*S );
	label.position.set(0,0,L);
	label.rotation.x = -Math.PI/2;
	coordSystem.add( label );
	//this.labels.push( label );
	
	// cube
	var materialFront = new THREE.MeshStandardMaterial({
		color: 'pink',
		metalness: 0.4,
		transparent: true,
		opacity: 0.7,
		emissive: 'orange',
		emissiveIntensity: 0.5,
		side: THREE.FrontSide,
	});
	var materialBack = materialFront.clone();
	materialBack.side = THREE.BackSide;
	
	coordSystem.cube = new THREE.Group();
	coordSystem.cube.matrixAutoUpdate = false;
	
	var cube = new THREE.Mesh( new THREE.BoxGeometry(8,8,8), materialBack );
	cube.geometry.translate(x,y,z);
	coordSystem.cube.add( cube );
	var cube = new THREE.Mesh( cube.geometry, materialFront );
	coordSystem.cube.add( cube );
	var edges = new THREE.EdgesGeometry( cube.geometry );
	var cube = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 'saddlebrown' } ) );
	coordSystem.cube.add( cube );
	coordSystem.add( coordSystem.cube );
	
	coordSystem.scale.set( this.SYSTEM_SCALE, this.SYSTEM_SCALE, this.SYSTEM_SCALE );
	return coordSystem;
}


MEIRO.Models.T007.prototype.constructMatrices = function()
{
	this.matrixData = [];
	for (var i=0; i<6; i++)
	{
		var matrixData = this.randomMatrix();
		this.matrixData.push( matrixData );
	}
}



MEIRO.Models.T007.prototype.constructSystems = function()
{
	var alphaMap = MEIRO.loadTexture( "textures/007_rope_alpha.jpg",1,7 );
	alphaMap.rotation = 0.018;
	
	var geometry = new THREE.ConeBufferGeometry(0.07,this.SYSTEM_LENGTH,12,1,true);
	var materialBack = new THREE.MeshBasicMaterial({
		color:'navy',
		alphaMap: alphaMap,
		transparent: true,
		side: THREE.BackSide,
	});
	var materialFront = new THREE.MeshBasicMaterial({
		color:'navy',
		alphaMap: alphaMap,
		transparent: true,
		side: THREE.FrontSide,
	});
	
	var angle = 0;
	var dAngle = 2*Math.PI/6;
	for (var i=0; i<6; i++,angle+=dAngle)
	{
		var matrixData = this.matrixData[i];
		
		var system = new THREE.Group();
		{
			// coord system
			var coords = this.generateCoordSystem(...matrixData.offset);
			switch (this.config.difficulty)
			{
				case 0:
					break;
				case 1:
					coords.rotation.set( Math.PI/2*random(0,1),Math.PI/2*random(0,1),0*Math.PI/2*random(0,1),'ZXY' );
					break;
				case 2:
					coords.rotation.set( Math.PI/2*random(0,3),Math.PI/2*random(0,3),Math.PI/2*random(0,3),'ZXY' );
					break;
			}
			coords.position.y = -this.SYSTEM_LENGTH;
			system.add( coords );
			
			// rope
			var rope = new THREE.Mesh( geometry, materialBack );
			rope.rotation.x = Math.PI;
			rope.position.y = -this.SYSTEM_LENGTH/2;
			system.add( rope );

			var rope = rope.clone();
			rope.material = materialFront;
			system.add( rope );
		}
		system.position.set( this.ARENA_DISTANCE*Math.cos(angle), this.BASE_HEIGHT+this.SYSTEM_HEIGHT, this.ARENA_DISTANCE*Math.sin(angle) );
		system.yRot = -angle;
			
		this.carousel.add( system );
		this.systems.push( system );
	}
}

MEIRO.Models.T007.prototype.constructArenas = function()
{
	var arenas = this.config.arenas;
	var angle = 2*Math.PI/arenas;
	var dArena = Math.round(6/arenas);
	
	var geometry = new THREE.CircleBufferGeometry(this.ARENA_RADIUS,48);
	geometry.rotateX(-Math.PI/2);
	geometry.rotateY(Math.PI/2);
	geometry.translate(this.ARENA_DISTANCE,0,0);
	
	for (var i=0; i<arenas; i++)
	{
		var matrixData = this.matrixData[i*dArena];
		var textureMap = this.constructMatrixTexture(matrixData.matrix);

		var material = new THREE.MeshBasicMaterial({
			color: 'white',
			map: textureMap,
			polygonOffset: true,
			polygonOffsetUnits: -1,
			polygonOffsetFactor: -1,
		});
		
		var arena = new THREE.Mesh(geometry,material);
		arena.rotation.y = -i*angle;
		arena.position.set(0,this.BASE_HEIGHT,0);
		this.image.add( arena );
		
		//this.arenas.push( matrixData );
	}
}



MEIRO.Models.T007.prototype.randomMatrix = function()
{
	//									difficulty	cases
	// maxLevel=0	I					0			0
	// maxLevel=1	Tx Ty Tz			0			1..6
	// maxLevel=2	Sx Sy Sz			0			7..12
	// maxLevel=3	Txy Txz Tyz			01			13..24
	// maxLevel=4	Sxy Sxz Sxz			1			25..36
	// maxLevel=5	Txyz Sxyz			12			37..52
	// maxLevel=6	Rx Ry Rz			2			53..58
	// maxLevel=7	C P					2			59..70
	
	var T = 6; 						// translation value
	var S = 2;						// scale value
	var C = 2; 						// orthogonal projection value
	var CO = 8; 					// orthogonal projection value
	var P = 1/4; 					// perspective projection value
	var PO = 7; 					// perspective projection value
	var SN = Math.sin(Math.PI/2);	// rot value
	var CS = Math.cos(Math.PI/2);	// rot value
	var allMatrixData=[
		//0
		{id:'I', matrix:[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],			step:[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]},
		//1
		{id:'T+00', matrix:[[1,0,0,1],[0,1,0,0],[0,0,1,0],[0,0,0,1]],		step:[[1,0,0,T],[0,1,0,0],[0,0,1,0],[0,0,0,1]]},
		{id:'T0+0', matrix:[[1,0,0,0],[0,1,0,1],[0,0,1,0],[0,0,0,1]],		step:[[1,0,0,0],[0,1,0,T],[0,0,1,0],[0,0,0,1]]},
		{id:'T00+', matrix:[[1,0,0,0],[0,1,0,0],[0,0,1,1],[0,0,0,1]],		step:[[1,0,0,0],[0,1,0,0],[0,0,1,T],[0,0,0,1]]},
		{id:'T-00', matrix:[[1,0,0,-1],[0,1,0,0],[0,0,1,0],[0,0,0,1]],		step:[[1,0,0,-T],[0,1,0,0],[0,0,1,0],[0,0,0,1]]},
		{id:'T0-0', matrix:[[1,0,0,0],[0,1,0,-1],[0,0,1,0],[0,0,0,1]],		step:[[1,0,0,0],[0,1,0,-T],[0,0,1,0],[0,0,0,1]]},
		{id:'T00-', matrix:[[1,0,0,0],[0,1,0,0],[0,0,1,-1],[0,0,0,1]],		step:[[1,0,0,0],[0,1,0,0],[0,0,1,-T],[0,0,0,1]]},
		//7
		{id:'S+00', matrix:[[2,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],		step:[[S,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],	},
		{id:'S0+0', matrix:[[1,0,0,0],[0,2,0,0],[0,0,1,0],[0,0,0,1]],		step:[[1,0,0,0],[0,S,0,0],[0,0,1,0],[0,0,0,1]],	},
		{id:'S00+', matrix:[[1,0,0,0],[0,1,0,0],[0,0,2,0],[0,0,0,1]],		step:[[1,0,0,0],[0,1,0,0],[0,0,S,0],[0,0,0,1]],	},
		{id:'S-00', matrix:[[1/2,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],		step:[[1/S,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],},
		{id:'S0-0', matrix:[[1,0,0,0],[0,1/2,0,0],[0,0,1,0],[0,0,0,1]],		step:[[1,0,0,0],[0,1/S,0,0],[0,0,1,0],[0,0,0,1]],},
		{id:'S00-', matrix:[[1,0,0,0],[0,1,0,0],[0,0,1/2,0],[0,0,0,1]],		step:[[1,0,0,0],[0,1,0,0],[0,0,1/S,0],[0,0,0,1]],},
		//13
		{id:'T++0', matrix:[[1,0,0,1],[0,1,0,1],[0,0,1,0],[0,0,0,1]],		step:[[1,0,0,T],[0,1,0,T],[0,0,1,0],[0,0,0,1]]},
		{id:'T+0+', matrix:[[1,0,0,1],[0,1,0,0],[0,0,1,1],[0,0,0,1]],		step:[[1,0,0,T],[0,1,0,0],[0,0,1,T],[0,0,0,1]]},
		{id:'T0++', matrix:[[1,0,0,0],[0,1,0,1],[0,0,1,1],[0,0,0,1]],		step:[[1,0,0,0],[0,1,0,T],[0,0,1,T],[0,0,0,1]]},
		{id:'T+-0', matrix:[[1,0,0,1],[0,1,0,-1],[0,0,1,0],[0,0,0,1]],		step:[[1,0,0,T],[0,1,0,-T],[0,0,1,0],[0,0,0,1]]},
		{id:'T+0-', matrix:[[1,0,0,1],[0,1,0,0],[0,0,1,-1],[0,0,0,1]],		step:[[1,0,0,T],[0,1,0,0],[0,0,1,-T],[0,0,0,1]]},
		{id:'T0+-', matrix:[[1,0,0,0],[0,1,0,1],[0,0,1,-1],[0,0,0,1]],		step:[[1,0,0,0],[0,1,0,T],[0,0,1,-T],[0,0,0,1]]},		
		{id:'T-+0', matrix:[[1,0,0,-1],[0,1,0,1],[0,0,1,0],[0,0,0,1]],		step:[[1,0,0,-T],[0,1,0,T],[0,0,1,0],[0,0,0,1]]},
		{id:'T-0+', matrix:[[1,0,0,-1],[0,1,0,0],[0,0,1,1],[0,0,0,1]],		step:[[1,0,0,-T],[0,1,0,0],[0,0,1,T],[0,0,0,1]]},
		{id:'T0-+', matrix:[[1,0,0,0],[0,1,0,-1],[0,0,1,1],[0,0,0,1]],		step:[[1,0,0,0],[0,1,0,-T],[0,0,1,T],[0,0,0,1]]},
		{id:'T--0', matrix:[[1,0,0,-1],[0,1,0,-1],[0,0,1,0],[0,0,0,1]],		step:[[1,0,0,-T],[0,1,0,-T],[0,0,1,0],[0,0,0,1]]},
		{id:'T-0-', matrix:[[1,0,0,-1],[0,1,0,0],[0,0,1,-1],[0,0,0,1]],		step:[[1,0,0,-T],[0,1,0,0],[0,0,1,-T],[0,0,0,1]]},
		{id:'T0--', matrix:[[1,0,0,0],[0,1,0,-1],[0,0,1,-1],[0,0,0,1]],		step:[[1,0,0,0],[0,1,0,-T],[0,0,1,-T],[0,0,0,1]]},
		//25
		{id:'S++0', matrix:[[2,0,0,0],[0,2,0,0],[0,0,1,0],[0,0,0,1]],		step:[[S,0,0,0],[0,S,0,0],[0,0,1,0],[0,0,0,1]]},
		{id:'S+0+', matrix:[[2,0,0,0],[0,1,0,0],[0,0,2,0],[0,0,0,1]],		step:[[S,0,0,0],[0,1,0,0],[0,0,S,0],[0,0,0,1]]},
		{id:'S0++', matrix:[[1,0,0,0],[0,2,0,0],[0,0,2,0],[0,0,0,1]],		step:[[1,0,0,0],[0,S,0,0],[0,0,S,0],[0,0,0,1]]},
		{id:'S+-0', matrix:[[2,0,0,0],[0,1/2,0,0],[0,0,1,0],[0,0,0,1]],		step:[[S,0,0,0],[0,1/S,0,0],[0,0,1,0],[0,0,0,1]]},
		{id:'S+0-', matrix:[[2,0,0,0],[0,1,0,0],[0,0,1/2,0],[0,0,0,1]],		step:[[S,0,0,0],[0,1,0,0],[0,0,1/S,0],[0,0,0,1]]},
		{id:'S0+-', matrix:[[1,0,0,0],[0,2,0,0],[0,0,1/2,0],[0,0,0,1]],		step:[[1,0,0,0],[0,S,0,0],[0,0,1/S,0],[0,0,0,1]]},
		{id:'S-+0', matrix:[[1/2,0,0,0],[0,2,0,0],[0,0,1,0],[0,0,0,1]],		step:[[1/S,0,0,0],[0,S,0,0],[0,0,1,0],[0,0,0,1]]},
		{id:'S-0+', matrix:[[1/2,0,0,0],[0,1,0,0],[0,0,2,0],[0,0,0,1]],		step:[[1/S,0,0,0],[0,1,0,0],[0,0,S,0],[0,0,0,1]]},
		{id:'S0-+', matrix:[[1,0,0,0],[0,1/2,0,0],[0,0,2,0],[0,0,0,1]],		step:[[1,0,0,0],[0,1/S,0,0],[0,0,S,0],[0,0,0,1]]},
		{id:'S--0', matrix:[[1/2,0,0,0],[0,1/2,0,0],[0,0,1,0],[0,0,0,1]],	step:[[1/S,0,0,0],[0,1/S,0,0],[0,0,1,0],[0,0,0,1]]},
		{id:'S-0-', matrix:[[1/2,0,0,0],[0,1,0,0],[0,0,1/2,0],[0,0,0,1]],	step:[[1/S,0,0,0],[0,1,0,0],[0,0,1/S,0],[0,0,0,1]]},
		{id:'S0--', matrix:[[1,0,0,0],[0,1/2,0,0],[0,0,1/2,0],[0,0,0,1]],	step:[[1,0,0,0],[0,1/S,0,0],[0,0,1/S,0],[0,0,0,1]]},
		//37
		{id:'T+++', matrix:[[1,0,0,1],[0,1,0,1],[0,0,1,1],[0,0,0,1]],		step:[[1,0,0,T],[0,1,0,T],[0,0,1,T],[0,0,0,1]]},
		{id:'T++-', matrix:[[1,0,0,1],[0,1,0,1],[0,0,1,-1],[0,0,0,1]],		step:[[1,0,0,T],[0,1,0,T],[0,0,1,-T],[0,0,0,1]]},
		{id:'T+-+', matrix:[[1,0,0,1],[0,1,0,-1],[0,0,1,1],[0,0,0,1]],		step:[[1,0,0,T],[0,1,0,-T],[0,0,1,T],[0,0,0,1]]},
		{id:'T+--', matrix:[[1,0,0,1],[0,1,0,-1],[0,0,1,-1],[0,0,0,1]],		step:[[1,0,0,T],[0,1,0,-T],[0,0,1,-T],[0,0,0,1]]},
		{id:'T-++', matrix:[[1,0,0,-1],[0,1,0,1],[0,0,1,1],[0,0,0,1]],		step:[[1,0,0,-T],[0,1,0,T],[0,0,1,T],[0,0,0,1]]},
		{id:'T-+-', matrix:[[1,0,0,-1],[0,1,0,1],[0,0,1,-1],[0,0,0,1]],		step:[[1,0,0,-T],[0,1,0,T],[0,0,1,-T],[0,0,0,1]]},
		{id:'T--+', matrix:[[1,0,0,-1],[0,1,0,-1],[0,0,1,1],[0,0,0,1]],		step:[[1,0,0,-T],[0,1,0,-T],[0,0,1,T],[0,0,0,1]]},
		{id:'T---', matrix:[[1,0,0,-1],[0,1,0,-1],[0,0,1,-1],[0,0,0,1]],	step:[[1,0,0,-T],[0,1,0,-T],[0,0,1,-T],[0,0,0,1]]},
		//45
		{id:'S+++', matrix:[[2,0,0,0],[0,2,0,0],[0,0,2,0],[0,0,0,1]],		step:[[S,0,0,0],[0,S,0,0],[0,0,S,0],[0,0,0,1]]},
		{id:'S++-', matrix:[[2,0,0,0],[0,2,0,0],[0,0,1/2,0],[0,0,0,1]],		step:[[S,0,0,0],[0,S,0,0],[0,0,1/S,0],[0,0,0,1]]},
		{id:'S+-+', matrix:[[2,0,0,0],[0,1/2,0,0],[0,0,2,0],[0,0,0,1]],		step:[[S,0,0,0],[0,1/S,0,0],[0,0,S,0],[0,0,0,1]]},
		{id:'S+--', matrix:[[2,0,0,0],[0,1/2,0,0],[0,0,1/2,0],[0,0,0,1]],	step:[[S,0,0,0],[0,1/S,0,0],[0,0,1/S,0],[0,0,0,1]]},
		{id:'S-++', matrix:[[1/2,0,0,0],[0,2,0,0],[0,0,2,0],[0,0,0,1]],		step:[[1/S,0,0,0],[0,S,0,0],[0,0,S,0],[0,0,0,1]]},
		{id:'S-+-', matrix:[[1/2,0,0,0],[0,2,0,0],[0,0,1/2,0],[0,0,0,1]],	step:[[1/S,0,0,0],[0,S,0,0],[0,0,1/S,0],[0,0,0,1]]},
		{id:'S--+', matrix:[[1/2,0,0,0],[0,1/2,0,0],[0,0,2,0],[0,0,0,1]],	step:[[1/S,0,0,0],[0,1/S,0,0],[0,0,S,0],[0,0,0,1]]},
		{id:'S---', matrix:[[1/2,0,0,0],[0,1/2,0,0],[0,0,1/2,0],[0,0,0,1]],	step:[[1/S,0,0,0],[0,1/S,0,0],[0,0,1/S,0],[0,0,0,1]]},
		//53
		{id:'Rxy', matrix:[[0,-1,0,0],[1,0,0,0],[0,0,1,0],[0,0,0,1]],		step:[[CS,-SN,0,0],[SN,CS,0,0],[0,0,1,0],[0,0,0,1]]},
		{id:'Ryx', matrix:[[0,1,0,0],[-1,0,0,0],[0,0,1,0],[0,0,0,1]],		step:[[CS,SN,0,0],[-SN,CS,0,0],[0,0,1,0],[0,0,0,1]]},
		{id:'Rxz', matrix:[[0,0,-1,0],[0,1,0,0],[1,0,0,0],[0,0,0,1]],		step:[[CS,0,-SN,0],[0,1,0,0],[SN,0,CS,0],[0,0,0,1]]},
		{id:'Rzx', matrix:[[0,0,1,0],[0,1,0,0],[-1,0,0,0],[0,0,0,1]],		step:[[CS,0,SN,0],[0,1,0,0],[-SN,0,CS,0],[0,0,0,1]]},
		{id:'Ryz', matrix:[[1,0,0,0],[0,0,-1,0],[0,1,0,0],[0,0,0,1]],		step:[[1,0,0,0],[0,CS,-SN,0],[0,SN,CS,0],[0,0,0,1]]},
		{id:'Rzy', matrix:[[1,0,0,0],[0,0,1,0],[0,-1,0,0],[0,0,0,1]],		step:[[1,0,0,0],[0,CS,SN,0],[0,-SN,CS,0],[0,0,0,1]]},
		//59
		{id:'Cx+', matrix:[[0,0,0,1],[0,1,0,0],[0,0,1,0],[0,0,0,1]],	step:[[0,0,0,C],[0,1,0,0],[0,0,1,0],[0,0,0,1]],		offset:[CO,0,0]},
		{id:'Cy+', matrix:[[1,0,0,0],[0,0,0,1],[0,0,1,0],[0,0,0,1]],	step:[[1,0,0,0],[0,0,0,C],[0,0,1,0],[0,0,0,1]],		offset:[0,CO,0]},
		{id:'Cz+', matrix:[[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,0,1]],	step:[[1,0,0,0],[0,1,0,0],[0,0,0,C],[0,0,0,1]],		offset:[0,0,CO]},
		{id:'Cx-', matrix:[[0,0,0,-1],[0,1,0,0],[0,0,1,0],[0,0,0,1]],	step:[[0,0,0,-C],[0,1,0,0],[0,0,1,0],[0,0,0,1]],	offset:[-CO,0,0]},
		{id:'Cy-', matrix:[[1,0,0,0],[0,0,0,-1],[0,0,1,0],[0,0,0,1]],	step:[[1,0,0,0],[0,0,0,-C],[0,0,1,0],[0,0,0,1]],	offset:[0,-CO,0]},
		{id:'Cz-', matrix:[[1,0,0,0],[0,1,0,0],[0,0,0,-1],[0,0,0,1]],	step:[[1,0,0,0],[0,1,0,0],[0,0,0,-C],[0,0,0,1]],	offset:[0,0,-CO]},
		//65
		{id:'Pz+', matrix:[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,1,0]],	step:[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,P,0]],		offset:[0,0,PO]},
		{id:'Py+', matrix:[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,1,0,0]],	step:[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,P,0,0]],		offset:[0,PO,0]},
		{id:'Px+', matrix:[[1,0,0,0],[0,1,0,0],[0,0,1,0],[1,0,0,0]],	step:[[1,0,0,0],[0,1,0,0],[0,0,1,0],[P,0,0,0]],		offset:[PO,0,0]},
		{id:'Pz-', matrix:[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,-1,0]],	step:[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,-P,0]],	offset:[0,0,-PO]},
		{id:'Py-', matrix:[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,-1,0,0]],	step:[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,-P,0,0]],	offset:[0,-PO,0]},
		{id:'Px-', matrix:[[1,0,0,0],[0,1,0,0],[0,0,1,0],[-1,0,0,0]],	step:[[1,0,0,0],[0,1,0,0],[0,0,1,0],[-P,0,0,0]],	offset:[-PO,0,0]},
		//71
		//.....
	];
	var randomIndex = 0;
	switch (this.config.difficulty)
	{
		case 0: randomIndex = random(0,24); break;
		case 1: randomIndex = random(13,52); break;
		case 2: randomIndex = random(37,70); break;
	}
	matrixData = allMatrixData[randomIndex];

	var hard = 0;
	if (randomIndex>=1)  hard++;
	if (randomIndex>=7)  hard++;
	if (randomIndex>=13) hard++;
	if (randomIndex>=25) hard++;
	if (randomIndex>=37) hard++;
	if (randomIndex>=45) hard++;
	if (randomIndex>=53) hard++;
	if (randomIndex>=59) hard++;
	if (randomIndex>=65) hard++;
	matrixData.hard = hard;
//console.log('randomIndex=',randomIndex,'hard=',hard);
	if (!matrixData.offset) matrixData.offset=[0,0,0];
	
	var mat4 = new THREE.Matrix4();
	mat4.set(
		...matrixData.step[0],
		...matrixData.step[1],
		...matrixData.step[2],
		...matrixData.step[3] );
	matrixData.matrixStep = mat4;
	
	return matrixData;
}


MEIRO.Models.T007.prototype.constructMatrixTexture = function(matrixData)
{
	var S = 128; // texture size
	var D = S/5; // digit size
	var H_SCALE = 1.25;
	
	var canvas = document.createElement('canvas');
	canvas.width = S;
	canvas.height = S;
	
	var ctx = canvas.getContext('2d');

	ctx.fillStyle = 'white'; // white background
	ctx.fillRect(0,0,S,S);
	
	ctx.font = "bold 18px Arial";
	ctx.textAlign = "center";
	ctx.scale(H_SCALE,1);
	for (var i=0; i<4; i++)
		for (var j=0; j<4; j++)
		{
			ctx.fillStyle = matrixData[i][j]?'black':'lightgray'; 
			ctx.fillText(matrixData[i][j], S/2/H_SCALE+S/5*(j-1.5)/H_SCALE, 5.7*S/10+S/6*(i-1.5));
		}

	var texture = new THREE.Texture(canvas);
	texture.anisotropy = 256; // looks good at oblique angles
	texture.needsUpdate = true;
	return texture;
}



MEIRO.Models.T007.prototype.onObject = function()
{
	if (!this.playing) return undefined;
	
	// координати на мишка
	this.mouse.x = (controls.human.mousePos.x/window.innerWidth)*2 - 1;
	this.mouse.y = -(controls.human.mousePos.y/window.innerHeight)*2 + 1;

	this.raycaster.setFromCamera( this.mouse, camera );
	
	var intersects = this.raycaster.intersectObject( this.pillar );
	if (intersects.length)
	{	
		this.clicks++;
		this.speedUp = true;
		this.carouselMusic.play();
		return this.carousel;
	}

	return undefined;
}



MEIRO.Models.T007.prototype.onDragEnd = function()
{
	this.speedUp = false;
	this.stopTime = animationLoop.time;
	this.scaleVibro = this.carouselSpeed*500;
	this.swingSqueak.volume = 0;
	this.swingSqueak.currentTime = 0;
	this.swingSqueak.play();
}



// аниматор на модела
MEIRO.Models.T007.prototype.onAnimate = function(time)
{	
	var deltaTime = this.animateTime?time-this.animateTime:0;
	this.animateTime = time;
	
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
		
		//for (var i=0; i<this.labels.length; i++)
		//	this.labels[i].rotation.y = i+rpm(time,12);

		if (this.speedUp)
			this.carouselSpeed = THREE.Math.lerp(this.carouselSpeed,0.005,0.005);
		else
			this.carouselSpeed = THREE.Math.lerp(this.carouselSpeed,0,0.05);
		
		var speedK = this.carouselSpeed/0.005;
		
		this.carouselSpin += this.carouselSpeed*deltaTime;
		this.carousel.rotation.y = this.carouselSpin*2*Math.PI/6;
		
		if (this.carouselSpin>6) this.carouselSpin -= 6;
		if (!this.speedUp)
		{
			this.carouselSpin = THREE.Math.lerp(this.carouselSpin,Math.round(this.carouselSpin+0.25),0.01);
		}
		
		if (this.speedUp)
			this.swingSqueak.volume = 0;
		else
		{
			this.swingSqueak.volume = Math.pow(0.998,(time-this.stopTime)/3)/2;
		}
		
		for (var i=0; i<this.systems.length; i++)
		{
			var targetCarouselBack = 0;
			var targetCarouselUp = 0;
			var targetCarouselTwist = 0;
			
			if (this.speedUp)
			{ 
				if (0.2<speedK && speedK<0.8)
					targetCarouselBack = -1*Math.pow(Math.sin(i/12+(speedK-0.2)/0.6*Math.PI),2);
				else
					targetCarouselBack = 0;
				targetCarouselUp   = 1.5*speedK;
				targetCarouselTwist = this.systems[i].yRot;
			}
			else
			{
				var vibro = Math.pow(0.999,(time-this.stopTime)/3);
				targetCarouselBack = 0.6*this.scaleVibro*vibro*Math.sin(rpm(time-this.stopTime+i,40-4*i));
				targetCarouselUp   = -0.3*this.scaleVibro*vibro*Math.cos(rpm(time-this.stopTime-i,42+4*i));
				targetCarouselTwist = this.systems[i].yRot + this.scaleVibro*vibro*Math.sin(rpm(time-this.stopTime+i,20+2*i));
				
			}
			this.carouselBack = THREE.Math.lerp(this.carouselBack ,targetCarouselBack,0.01);
			this.carouselUp   = THREE.Math.lerp(this.carouselUp   ,targetCarouselUp,0.01);

			this.systems[i].rotation.set(
				this.carouselBack,
				THREE.Math.lerp(this.systems[i].rotation.y,targetCarouselTwist,0.03),
				this.carouselUp,
				'YXZ');
				
			//animate the cube;
			var k = (time/3000+i*Math.sin(i))%2;
			k = THREE.Math.clamp(k-0.5,0.001,0.999);
			
			var rescale = this.matrixData[i].id[0]=='R';
			//if (this.animaitonStep%this.animaitonSteps==0)
			//	this.systems[i].children[0].cube.matrix.identity();
			//else
			//	this.systems[i].children[0].cube.matrix.multiply(this.systems[i].matrixStep);
			//this.animaitonStep++;
			var matrix = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
			for (var x=0; x<4; x++)
			{
				var len = 0;
				for (var y=0; y<4; y++)
				{
					matrix[x][y] = THREE.Math.lerp(matrix[x][y],this.matrixData[i].step[x][y],k);
					if (rescale) len += matrix[x][y]*matrix[x][y];
				}
				if (rescale) 
				{
					len = Math.sqrt(len);
					for (var y=0; y<4; y++)
						matrix[x][y] /= len;
				}
			}
			this.systems[i].children[0].cube.matrix.set(
				...matrix[0],
				...matrix[1],
				...matrix[2],
				...matrix[3]
			);
		}
		
		this.carouselMusic.volume = speedK;
	}

	//TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.T007.prototype.onInfo = function(element)
{
	element.innerHTML = this.info;
}


MEIRO.Models.T007.prototype.evaluateResult = function()
{	
	var match = 0;
		
	//var S=[];
	//for (var i=0; i<6; i++)
	//	S.push(this.matrixData[Math.round(this.carouselSpin+i)%6].id);

	function similarity(a,b)
	{
		if (a==b) return 1; // complete match
		if (a[0]!=b[0]) return 0; // complete mismatch
		
		a += '    ';
		b += '    ';
		var sim = 1;
		
		// check exact match of characters (bulls)
		for (var i=0; i<4; i++)
			if (a[i]!=b[i])
				sim *= 0.8;
			
		// check usage of characters (cows)
		for (var i=0; i<4; i++)
		{
			if (a.indexOf(b[i])<0)
				sim *= 0.8;
			if (b.indexOf(a[i])<0)
				sim *= 0.8;
		}
		return sim;
	}
	
	var arenas = this.config.arenas;
	var dArena = Math.round(6/arenas);
	var sims = [];
	for (var i=0; i<arenas; i++)
	{
		var index = i*dArena
		var s1 = this.matrixData[index].id;
		var s2 = this.matrixData[Math.round(this.carouselSpin+i*dArena)%6].id;
//		console.log(s1,s2);
		var sim = similarity(s1,s2);
		sims.push(sim);
		match += sim/arenas;
	}

		
	this.config.score = match*this.config.max_score;

	this.config.time =  Math.floor((animationLoop.time-this.startTime)/1000);
	
//	console.log('score=',this.config.score);
	this.info = '';
	this.info += '<h1 style="text-align:center;">Матричната въртележка &ndash; '+Math.round(1000*this.config.score)/10+' от '+Math.round(100*this.config.max_score)+' точки</span></h1>';
	this.info += '<p>В задачата трябва да се определят правилните трансформации на '+arenas+' матрици. '
	for (var i=0; i<arenas; i++)
	{
		this.info += ' '+(['Първата','Другата','Третата','Следващата','Петата','Последата'])[i];
		this.info += ' матрица съвпада на '+Math.floor(100*sims[i])+'%.';
	}
	this.info += '</p>';
//	console.log('evaluation=',this.config.score*match);
}



MEIRO.Models.T007.prototype.sendResult = function(callback)
{
	var competences = [];
	for (var i=0; i<MEIRO.Models.T007.COMPETENCES.length; i++)
		competences.push( Math.round(100*MEIRO.Models.T007.COMPETENCES[i]*this.config.score)/100 );
	
	var data = new FormData();
	data.append('ACTION', 'END');
	data.append('MODEL', 'T007');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	data.append('SCORE', Math.round(100*this.config.score)/100);
	data.append('TIME', this.config.time);
	data.append('CLICKS', this.clicks);
	data.append('COMPETENCES', competences);
	postData(data,callback,callback);
}



MEIRO.Models.T007.prototype.sendStartup = function(callback)
{
	var data = new FormData();
	data.append('ACTION', 'START');
	data.append('MODEL', 'T007');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	postData(data,callback,callback);
}



MEIRO.Models.T007.prototype.onEnter = function(element)
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
	//new TWEEN.Tween({k:0})
	//	.to({k:1},500)
	//	.easing( TWEEN.Easing.Quadratic.InOut )
	//	.onUpdate( function(){
	//		// анимация по активиране на модела
	//	} )
	//	.start();
}


// превключвател на модела
MEIRO.Models.T007.prototype.onExitModel = function(element)
{
	//MEIRO.Model.prototype.onExit.call(this);
	
	var that = this;
	
	that.playing = false;
	that.evaluateResult();
	//new TWEEN.Tween({k:1})
	//	.to({k:EPS},500)
	//	.easing( TWEEN.Easing.Quadratic.InOut )
	//	.onUpdate( function(){
	//		// анимация при деактивиране на модела
	//	} )
	//	.start();
	that.sendResult(
	function(){
		MEIRO.showInfo(this,
				function(){
//					console.log('on before close info');
					if (MEIRO.singleRoom)
					{	
						window.history.back();
					}
				},
				function(){
//					console.log('on after close info');
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
MEIRO.Models.T007.prototype.configure = function(difficulty)
{	
	this.config = {difficulty: difficulty};
		
	var max_score = 0;
	
	switch (difficulty)
	{
		// ниска трудност
		case DIFFICULTY_LOW:
			arenas = 2;
			//max_score = 0.2;
			break;
			
		// средна трудност
		case DIFFICULTY_MEDIUM:
			arenas = 3;
			//max_score = 0.4;
			break;
			
		// висока трудност
		case DIFFICULTY_HIGH:
			arenas = 6;
			//max_score = 1.0;
			break;
			
		default: console.error('Unknown difficulty level');
	}

	this.config.arenas = arenas;
	
	this.constructMatrices();
	for (var i=0; i<6; i++) max_score += this.matrixData[i].hard/100;

	switch (difficulty)
	{
		case DIFFICULTY_LOW:
			max_score = THREE.Math.mapLinear(max_score,0.03,0.18,0.1,0.2);
			max_score = THREE.Math.clamp(max_score,0.1,0.2);
			break;
		case DIFFICULTY_MEDIUM:
			max_score = THREE.Math.mapLinear(max_score,0.18,0.36,0.3,0.4);
			max_score = THREE.Math.clamp(max_score,0.3,0.4);
			break;
		case DIFFICULTY_HIGH:
			max_score = THREE.Math.mapLinear(max_score,0.30,0.53,0.7,1);
			max_score = THREE.Math.clamp(max_score,0.7,1);
			break;
	}
	
	this.config.max_score = Math.round(100*max_score)/100;
	//console.log('max_score2=',max_score);
	
	if (!IN_SCORE_STATISTICS)
	{
		this.constructSystems();
		this.constructArenas();
		this.constructCarousel();
		this.sendStartup();
	}
}


MEIRO.Models.T007.prototype.postConfigure = function()
{	
}


// извежда статистика за шъзмовните конфигурации
MEIRO.Models.T007.prototype.configureStats = function()
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