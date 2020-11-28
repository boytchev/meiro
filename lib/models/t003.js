
var SCORE_STATISTICS = !true;

//	Основи на Компютърната Графика
//	Тест 003 - Les balles rebondissantes (Подскачащите топки)
//	П. Бойчев, 2019
//
//	 ├─ T003
//	 │   ├─ initialize()
//	 │   ├─ construct()
//	 │   │    ├─ constructFloor()
//	 │   │    ├─ constructBase()
//	 │   │    ├─ constructFrame()
//	 │   │    ├─ constructKeys()
//	 │   │    │    ├─ shapePoint()
//	 │   │    │    ├─ shapeCurve()
//	 │   │    │    ├─ shapeKeyX()
//	 │   │    │    ├─ shapeKeyXX()
//	 │   │    │    ├─ shapeKeyXXX()
//	 │   │    │    └─ shapeKeyXXXXX()
//	 │   │    ├─ constructHints()
//	 │   │    ├─ constructButtons()
//	 │   │    │    └─ constructButton(n,textureName,geometryBase,geometryTop)
//	 │   │    ├─ constructScreen()
//	 │   │    └─ configureStats()
//	 │   ├─ onAnimate()
//	 │   ├─ onObject()
//	 │   ├─ onEnter()
//	 │   │    │─ configure(difficulty)
//	 │   │    │   ├─ fullString(string)
//	 │   │    │   ├─ evalString(string)
//	 │   │    │   ├─ applyMask(value)
//	 │   │    │   ├─ symmetricMask(value)
//	 │   │    │   ├─ evaluateMask(value)
//	 │   │    │   ├─ runString()
//	 │   │    │   └─ generateArrays()
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
MEIRO.Models.T003 = function T003(room, model)
{
	MEIRO.Model.apply(this, arguments);
	
	this.initialize();
	this.construct();
}
MEIRO.Models.T003.prototype = Object.create(MEIRO.Model.prototype);



MEIRO.Models.T003.DIST = {MIN:15, MAX:22, HEIGHT:0};
MEIRO.Models.T003.POS = {DIST:22, ROT_X:0.9, ROT_Y:0.15, ON_FLOOR:true};
MEIRO.Models.T003.ROT_Y = {MIN:0.0, MAX:1.56};
MEIRO.Models.T003.SCALE = {MAX:0.25};
MEIRO.Models.T003.COMPETENCES = [2,2,2,5,0, 0,1,0,5, 0,0,1, 1,5,5,0,0];

// ABCD
// xxxx -	
// 0001 D		0
// 0010 C		1
// 0011 CD		2
// 0100 B		3
// xxxx -		4
// 0110 BC		5
// 0111 BCD		6
// 1000 A		7
// 1001 AD		8
// xxxx -		9
// 1011 ACD		10
// 1100 AB		11
// 1101 ABD		12
// 1110 ABC		13
// 1111 ABCD	14

MEIRO.Models.T003.prototype.initialize = function()
{
	if (SCORE_STATISTICS) this.configureStats();
	
	random.randomize();

	this.playing = false;
	this.startTime = 0;
	this.lastTime = 0;
	this.clicks = 0;
	
	this.string = '';
	this.stringButtonCodes = '-C)D(A+B';
	this.resultMask = 0;
	
	this.keys = [];
	this.keyA = 0b1000;
	this.keyB = 0b0100;
	this.keyC = 0b0010;
	this.keyD = 0b0001;
	this.hints = [];
	
	this.masks = [];
	this.masks.A = 0b111110110000000;
	this.masks.B = 0b111100001101000;
	this.masks.C = 0b110010001100110;
	this.masks.D = 0b101010101000101;

	this.buttons = [];
	this.screenPlates = new THREE.Group();
	this.screenTextures = [];
	this.screenPos = 16;

	this.emptyTexture = new THREE.Texture();
	
	this.FLOOR_RADIUS = 8;
	
	this.BASE_RADIUS = 7*0.75;
	this.BASE_HEIGHT = 2;
	
	this.KEY_RADIUS = 2.95*0.75;
	this.KEY_STEP = 1;
	this.KEY_DISTANCE = 2.95*0.75;
	this.KEY_HEIGHT = 1;
	
	this.HINT_HEIGHT = 8;

	this.BUTTON_RADIUS = 0.7;
	this.BUTTON_HEIGHT = 0.5;

	this.FRAME_RADIUS = 0.04;
	this.FRAME_DISTANCE = this.BASE_RADIUS-0.5;
	this.FRAME_CURVE = 1;
	
	this.SCREEN_SIZE = 0.75;
	this.SCREEN_HEIGHT = 1.15;
	
	this.audioMetal = new Audio('sounds/metal-slide.mp3');
	this.audioClick = new Audio('sounds/button-click.mp3');
}

	

MEIRO.Models.T003.prototype.construct = function()
{
	// допълнителна светлина, прави пода по-красив
	var light = new THREE.PointLight( 'white', 0.3 );
	light.position.set( 0, 10, 0 );
	this.image.add( light );
	

	this.constructFloor();
	this.constructBase();
	this.constructFrame();
	this.constructKeys();
	this.constructHints();
	this.constructButtons();
	this.constructScreen();
	
	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();


	// бутон за стартиране/приключване
	var that = this;
	this.buttonTimer = new MEIRO.CornerButton('topLeft', function(){that.onExitModel();}, '0:00', 'images/time.png');
	this.buttonTimer.hide();

	this.defaultInfo = '<h1>Геометричният шифър</h1>';
	this.defaultInfo += '<p>В горната част на модела има златист шифър. Чрез операции от конструктивната геометрия (сечение AB, обединение A+B и разлика A-B) постройте израз, който създава същата форма. За по-сложните шифри се ползват и скоби. При грешно добавен символ можете да се върнете назад с червения бутон. Жълтите бутони са операциите обединение, разлика и скоби. Белите бутони активират съответните зони.</p><p>Символите на четирите зони са от японски и отговарят на четирите сили. В средата е петата сила, за която няма отделен бутон.';
}



MEIRO.Models.T003.prototype.constructFloor = function()
{
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", 2*this.FLOOR_RADIUS, 2*this.FLOOR_RADIUS );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", 2*this.FLOOR_RADIUS, 2*this.FLOOR_RADIUS );
	var lightMap = MEIRO.loadTexture( "textures/003_floor_lightmap.jpg", 1, 1 );

	var geometry = new THREE.CircleBufferGeometry(this.FLOOR_RADIUS, 8);
	MEIRO.allowLightmap(geometry);
	
	var material = new THREE.MeshStandardMaterial( {
			metalness: 0.8,
			map: textureMap,
			normalMap: normalMap,
			lightMap: lightMap,
			lightMapIntensity: 5,
			polygonOffset: true,
			polygonOffsetUnits: 2,
			polygonOffsetFactor: 2,
	});
	
	var floor = new THREE.Mesh( geometry, material );
	floor.rotation.x = -Math.PI/2;
	this.image.add( floor );
}	



MEIRO.Models.T003.prototype.constructBase = function()
{
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_screen2.jpg", 6*this.BASE_RADIUS, 1 );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", 6*this.BASE_RADIUS, 2 );
	var lightMap = MEIRO.loadTexture( "textures/003_wall_lightmap.jpg" );

	var geometry = new THREE.CylinderBufferGeometry(this.BASE_RADIUS, this.BASE_RADIUS, this.BASE_HEIGHT, 50, 1, true);
	MEIRO.allowLightmap(geometry);
	
	var material = new THREE.MeshStandardMaterial( {
			metalness: 0.8,
			map: textureMap,
			normalMap: normalMap,
			normalScale: new THREE.Vector2(0.5,0.5),
			lightMap: lightMap,
			lightMapIntensity: 2,
			polygonOffset: true,
			polygonOffsetUnits: 2,
			polygonOffsetFactor: 2,
	});
	
	var base = new THREE.Mesh( geometry, material );
	base.position.y = this.BASE_HEIGHT/2;
	base.rotation.y = 3*Math.PI/6;
	this.image.add( base );

	
	var textureMap = MEIRO.loadTexture( "textures/003_base.jpg", 1, 1 );

	var geometry = new THREE.CircleBufferGeometry(this.BASE_RADIUS, 50);
	MEIRO.allowLightmap(geometry);
	
	var material = new THREE.MeshBasicMaterial( {
			color: 'white',
			map: textureMap,
			polygonOffset: true,
			polygonOffsetUnits: 2,
			polygonOffsetFactor: 2,
	});
	
	var baseTop = new THREE.Mesh( geometry, material );
	baseTop.position.y = this.BASE_HEIGHT;
	baseTop.rotation.x = -Math.PI/2;
	this.image.add( baseTop );
	
}	
	
	
	
MEIRO.Models.T003.prototype.constructScreen = function()
{
	var n = Math.floor(2*Math.PI*this.BASE_RADIUS/this.SCREEN_SIZE);
	
	var geometry = new THREE.PlaneBufferGeometry(this.SCREEN_SIZE,this.SCREEN_SIZE);
	geometry.translate( 0,this.SCREEN_HEIGHT, this.BASE_RADIUS );
	
	var material = new THREE.MeshBasicMaterial({
		color: 'white',
		map: this.emptyTexture,
		polygonOffset: true,
		polygonOffsetUnits: -2,
		polygonOffsetFactor: -2,
	});
	
	for (var i=0; i<n; i++)
	{
		var screen = new THREE.Mesh( geometry, material.clone() );
		screen.rotation.y = 2*Math.PI*i/n;
		this.screenPlates.add( screen );
	}
	this.image.add( this.screenPlates );
//	console.log(this.screenPlates);
	
	for (var i=0; i<8; i++)
	{
		this.screenTextures.push( MEIRO.loadTexture( "textures/003_screen_"+i+".jpg", 1, 1 ) );
		//console.log( "textures/003_screen_"+i+".jpg");
	}
}	
	
	
	
MEIRO.Models.T003.prototype.constructFrame = function()
{
	var geometry = new THREE.CylinderBufferGeometry(this.FRAME_RADIUS, this.FRAME_RADIUS, this.HINT_HEIGHT-this.FRAME_CURVE, 6, 1, true);
	
	var material = new THREE.MeshStandardMaterial( {
			color: 'black',
			metalness: 0.1,
			emissive: 'red',
			emissiveIntensity: 0.1,
	});
	
	var pillar = new THREE.Mesh( geometry, material );
	pillar.position.set(this.FRAME_DISTANCE,this.HINT_HEIGHT/2-this.FRAME_CURVE/2,0);
	this.image.add( pillar );
	
	var pillar = new THREE.Mesh( geometry, material );
	pillar.position.set(-this.FRAME_DISTANCE,this.HINT_HEIGHT/2-this.FRAME_CURVE/2,0);
	this.image.add( pillar );
	
	var pillar = new THREE.Mesh( geometry, material );
	pillar.position.set(0,this.HINT_HEIGHT/2-this.FRAME_CURVE/2,-this.FRAME_DISTANCE);
	this.image.add( pillar );
	
	var pillar = new THREE.Mesh( geometry, material );
	pillar.position.set(0,this.HINT_HEIGHT/2-this.FRAME_CURVE/2,this.FRAME_DISTANCE);
	this.image.add( pillar );
	
	// horizontal fragments
	var hollar = new THREE.Mesh( geometry, material );
	hollar.scale.y = (2*this.FRAME_DISTANCE-2*this.FRAME_CURVE)/(this.HINT_HEIGHT-this.FRAME_CURVE);
	hollar.position.set(0,this.HINT_HEIGHT,0);
	hollar.rotation.x = Math.PI/2;
	this.image.add( hollar );
	
	hollar = hollar.clone();
	hollar.rotation.z = Math.PI/2;
	this.image.add( hollar );

	// curved fragments
	var geometry = new THREE.TorusBufferGeometry(this.FRAME_CURVE, this.FRAME_RADIUS*0.95, 6, 16, Math.PI/2);
	var curve = new THREE.Mesh( geometry, material );
	curve.position.set(this.FRAME_DISTANCE-this.FRAME_CURVE,this.HINT_HEIGHT-this.FRAME_CURVE,0);
	this.image.add( curve );

	curve = curve.clone();
	curve.position.set(-this.FRAME_DISTANCE+this.FRAME_CURVE,this.HINT_HEIGHT-this.FRAME_CURVE,0);
	curve.rotation.set(Math.PI,0,Math.PI);
	this.image.add( curve );

	curve = curve.clone();
	curve.position.set(0,this.HINT_HEIGHT-this.FRAME_CURVE,-this.FRAME_DISTANCE+this.FRAME_CURVE);
	curve.rotation.set(Math.PI,Math.PI/2,Math.PI);
	this.image.add( curve );

	curve = curve.clone();
	curve.position.set(0,this.HINT_HEIGHT-this.FRAME_CURVE,this.FRAME_DISTANCE-this.FRAME_CURVE);
	curve.rotation.set(Math.PI,-Math.PI/2,Math.PI);
	this.image.add( curve );
}	
	
	
	
MEIRO.Models.T003.prototype.shapePoint = function(shape,centerX,centerY,A)
{
	var d = this.KEY_DISTANCE;
	var r = this.KEY_RADIUS;
	var a = 30; // 30º
	
	var sin = function(x){return Math.sin(x*Math.PI/180);}
	var cos = function(x){return Math.cos(x*Math.PI/180);}

	shape.moveTo( centerX*d/2+r*cos(a*A), centerY*d/2+r*sin(a*A) );
}	
	
	
	
MEIRO.Models.T003.prototype.shapeCurve = function(shape,centerX,centerY,fromA,toA)
{
	var d = this.KEY_DISTANCE;
	var r = this.KEY_RADIUS;
	var a = 30; // 30º

	var sin = function(x){return Math.sin(x*Math.PI/180);}
	var cos = function(x){return Math.cos(x*Math.PI/180);}

	if (fromA<toA)
		for ( var i=fromA*a; i<toA*a; i+=this.KEY_STEP ) shape.lineTo( centerX*d/2+r*cos(i), centerY*d/2+r*sin(i) );
	else
		for ( var i=fromA*a; i>toA*a; i-=this.KEY_STEP ) shape.lineTo( centerX*d/2+r*cos(i), centerY*d/2+r*sin(i) );
}	
	
	
	
MEIRO.Models.T003.prototype.shapeKeyX = function()
{
	var shape = new THREE.Shape();
		this.shapePoint( shape, 1, 1, -1 );
		this.shapeCurve( shape, 1, 1, -1, 4 );
		this.shapeCurve( shape,-1, 1,  2, 0 );
		this.shapeCurve( shape, 1,-1,  3, 1 );
	return shape;
}	
	
	
	
MEIRO.Models.T003.prototype.shapeKeyXX = function()
{
	var shape = new THREE.Shape();
		this.shapePoint( shape,-1, 1, 0 );
		this.shapeCurve( shape,-1, 1, 0, 2 );
		this.shapeCurve( shape, 1, 1, 4, 6 );
		this.shapeCurve( shape,-1,-1, 3, 2 );
		this.shapeCurve( shape, 1,-1, 4, 3 );
	return shape;
}	
	
	
	
MEIRO.Models.T003.prototype.shapeKeyXXX = function()
{
	var shape = new THREE.Shape();
		this.shapePoint( shape, 1,-1, 3 );
		this.shapeCurve( shape, 1,-1, 3, 4 );
		this.shapeCurve( shape,-1,-1, 2, 1 );
		this.shapeCurve( shape,-1, 1,-1, 0 );
	return shape;
}	
	
	
	
MEIRO.Models.T003.prototype.shapeKeyXXXX = function()
{
	var shape = new THREE.Shape();
		this.shapePoint( shape,-1,-1, 1 );
		this.shapeCurve( shape,-1,-1, 1, 2 );
		this.shapeCurve( shape, 1,-1, 4, 5 );
		this.shapeCurve( shape, 1, 1, 7, 8 );
		this.shapeCurve( shape,-1, 1,-2,-1 );
	return shape;
}	



MEIRO.Models.T003.prototype.constructKeys = function()
{
	var textureMap = MEIRO.loadTexture( "textures/rusty_1024x512.jpg", 2, 0.45 );
	textureMap.offset = new THREE.Vector2(0,0.5);
	
	var r = this.KEY_RADIUS;
	var ofs = 0;
	var h = this.BASE_HEIGHT-0.1;
	
	var extrudeSettings = {
		curveSegments: 24,
		steps: 1,
		amount: 2,
		bevelEnabled: true,
		bevelThickness: 0.1,
		bevelSize: 0.1,
		bevelOffset: 0.5,
		bevelSegments: 4
	};
	
	
	var material = new THREE.MeshStandardMaterial( {
			color: 'white',
			map: textureMap,
	});
	
	function blackTop(geometry)
	{
		var normal = geometry.getAttribute('normal');
		var uv = geometry.getAttribute('uv');
		var pos = geometry.getAttribute('position');
		

		var k = 0;
		var m = -1;
		for (var i=0; i<normal.count; i++)
		{
			if (normal.getZ(i)==0)
			{
				m++;
				switch (m%6)
				{
					case 0:
					case 2:
					case 5: uv.setX(i,k); break;
					case 1:
					case 3:
					case 4: uv.setX(i,k+1/100); break;
				}
				if (m%6==5) k=k+1/100;
			}

			if (normal.getZ(i)>0.5)
			{
				normal.setXYZ(i,0,0,0);
			}
		}
		
		normal.needsUpdate = true;	
		uv.needsUpdate = true;	
	}
	

	var shape = this.shapeKeyX();
	var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );	
	geometry.translate(ofs,ofs,0);
	blackTop(geometry);
	
	// B
	var key = new THREE.Mesh( geometry, material );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	this.keys[this.keyB] = key;
	this.image.add( key );
	
	// A
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	key.rotation.z = Math.PI/2;
	this.keys[this.keyA] = key;
	this.image.add( key );
	
	// D
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	key.rotation.z = Math.PI;
	this.keys[this.keyD] = key;
	this.image.add( key );
	
	// C
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	key.rotation.z = -Math.PI/2;
	this.keys[this.keyC] = key;
	this.image.add( key );

	
	var shape = this.shapeKeyXX();
	var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );	
	geometry.translate(0,ofs,0);
	blackTop(geometry);
	
	// AB
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	this.keys[this.keyA+this.keyB] = key;
	this.image.add( key );
	
	// BC
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	key.rotation.z = -Math.PI/2;
	this.keys[this.keyB+this.keyC] = key;
	this.image.add( key );
	
	// AD
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	key.rotation.z = Math.PI/2;
	this.keys[this.keyA+this.keyD] = key;
	this.image.add( key );
	
	// CD
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	key.rotation.z = 2*Math.PI/2;
	this.keys[this.keyC+this.keyD] = key;
	this.image.add( key );

	
	
	var shape = this.shapeKeyXXX();
	var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );	
	geometry.translate(ofs/2,ofs/2,0);
	blackTop(geometry);
	
	// ABC
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	this.keys[this.keyA+this.keyB+this.keyC] = key;
	this.image.add( key );
	
	
	// BCD
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	key.rotation.z = -Math.PI/2;
	this.keys[this.keyB+this.keyC+this.keyD] = key;
	this.image.add( key );
	
	
	// ABD
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	key.rotation.z = Math.PI/2;
	this.keys[this.keyA+this.keyB+this.keyD] = key;
	this.image.add( key );
	
	
	// ACD
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	key.rotation.z = 2*Math.PI/2;
	this.keys[this.keyA+this.keyC+this.keyD] = key;
	this.image.add( key );
	
	
	
	var shape = this.shapeKeyXXXX();
	var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );	
	blackTop(geometry);
	
	// ABCD
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	this.keys[this.keyA+this.keyB+this.keyC+this.keyD] = key;
	this.image.add( key );
	
	for (var i=1; i<=15; i++) if (i!=5 && i!=10)
	{
		this.keys[i].expanding = false;
		this.keys[i].scale.z = 0.001;
	}
}	


MEIRO.Models.T003.prototype.constructHints = function()
{
	var r = this.KEY_RADIUS;
	var ofs = 0;
	var h = this.HINT_HEIGHT-0.25;
	
	var extrudeSettings = {
		curveSegments: 1,
		steps: 1,
		amount: 0.5,
		bevelEnabled: !true
	};
	
	
	var material = new THREE.MeshStandardMaterial( {
			color: 'gold',
			metalness: 0.1,
			emissive: 'red',
			emissiveIntensity: 0.4,
	});
	
	var shape = this.shapeKeyX();
	var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );	
	geometry.translate(ofs,ofs,0);

	// B
	var key = new THREE.Mesh( geometry, material );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	this.hints[this.keyB] = key;
	this.image.add( key );
	
	// A
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	key.rotation.z = Math.PI/2;
	this.hints[this.keyA] = key;
	this.image.add( key );
	
	// D
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	key.rotation.z = Math.PI;
	this.hints[this.keyD] = key;
	this.image.add( key );
	
	// C
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	key.rotation.z = -Math.PI/2;
	this.hints[this.keyC] = key;
	this.image.add( key );

	
	var shape = this.shapeKeyXX();
	var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );	
	geometry.translate(0,ofs,0);
	
	// AB
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	this.hints[this.keyA+this.keyB] = key;
	this.image.add( key );
	
	// BC
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	key.rotation.z = -Math.PI/2;
	this.hints[this.keyB+this.keyC] = key;
	this.image.add( key );
	
	// AD
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	key.rotation.z = Math.PI/2;
	this.hints[this.keyA+this.keyD] = key;
	this.image.add( key );
	
	// CD
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	key.rotation.z = 2*Math.PI/2;
	this.hints[this.keyC+this.keyD] = key;
	this.image.add( key );

	
	
	var shape = this.shapeKeyXXX();
	var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );	
	geometry.translate(ofs/2,ofs/2,0);
	
	// ABC
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	this.hints[this.keyA+this.keyB+this.keyC] = key;
	this.image.add( key );
	
	
	// BCD
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	key.rotation.z = -Math.PI/2;
	this.hints[this.keyB+this.keyC+this.keyD] = key;
	this.image.add( key );
	
	
	// ABD
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	key.rotation.z = Math.PI/2;
	this.hints[this.keyA+this.keyB+this.keyD] = key;
	this.image.add( key );
	
	
	// ACD
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	key.rotation.z = 2*Math.PI/2;
	this.hints[this.keyA+this.keyC+this.keyD] = key;
	this.image.add( key );
	
	
	
	var shape = this.shapeKeyXXXX();
	var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );	
	
	// ABCD
	var key = new THREE.Mesh( geometry, material.clone() );
	key.position.set(0,h,0);
	key.rotation.x = -Math.PI/2;
	this.hints[this.keyA+this.keyB+this.keyC+this.keyD] = key;
	this.image.add( key );
}	


MEIRO.Models.T003.prototype.constructButtons = function()
{
	var that = this;
	
	var geometryBase = new THREE.CylinderBufferGeometry(this.BUTTON_RADIUS, this.BUTTON_RADIUS, this.BUTTON_HEIGHT, 8, 1, true);
	var geometrySupport = new THREE.CylinderBufferGeometry(this.BUTTON_RADIUS*1.1, this.BUTTON_RADIUS*1.1, this.BUTTON_HEIGHT*0.6, 8);
	var geometryTop = new THREE.CircleBufferGeometry(this.BUTTON_RADIUS, 8);
	var textureMap = MEIRO.loadTexture( "textures/003_rusty_button.jpg", 1, 1 );	
	var supportMap = MEIRO.loadTexture( "textures/Metal_plate_64x256.jpg", 16, 1 );	
	var that = this;
	var supportMaterial = new THREE.MeshBasicMaterial( {
			color: 'black',
			//metalness: 0,
			//map: supportMap,
	});
	
	
	constructButton = function(n,textureName)
	{
		var distance = that.FLOOR_RADIUS-that.BUTTON_RADIUS-0.2;
		var angle = Math.PI/4*n;
		
		
		var support = new THREE.Mesh( geometrySupport, supportMaterial );
		support.position.set( distance*Math.cos(angle), that.BUTTON_HEIGHT/2*0.6, distance*Math.sin(angle) );
		that.image.add( support );
		
		var baseMaterial = new THREE.MeshStandardMaterial( {
				metalness: 0,
				map: textureMap,
		});
		
		var button = new THREE.Mesh( geometryBase, baseMaterial );
		button.position.set( distance*Math.cos(angle), that.BUTTON_HEIGHT/2, distance*Math.sin(angle) );

		
		var topMap = MEIRO.loadTexture( "textures/003_button_"+i+".jpg", 1, 1 );
		var material = new THREE.MeshBasicMaterial( {
				color: 'white',
				//metalness: 0,
				map: topMap,
				polygonOffset: true,
				polygonOffsetUnits: 2,
				polygonOffsetFactor: 2,
		});
		
		var buttonTop = new THREE.Mesh( geometryTop, material );
		buttonTop.position.y = that.BUTTON_HEIGHT/2;
		buttonTop.rotation.x = -Math.PI/2;
		buttonTop.rotation.z = Math.PI/2-angle;
		button.add( buttonTop );
		
		return button;
	}	

	for (var i=0; i<8; i++)
	{
		var button = constructButton(i);
		button.expanding = false;
		this.buttons.push( button );
		this.image.add( button );
	}
	
	var color = new THREE.Color('red');
	this.buttons[2].material.color = color;
	this.buttons[2].children[0].material.color = color;

	var color = new THREE.Color('gold');
	this.buttons[0].material.color = color;
	this.buttons[0].children[0].material.color = color;
	this.buttons[4].material.color = color;
	this.buttons[4].children[0].material.color = color;
	this.buttons[6].material.color = color;
	this.buttons[6].children[0].material.color = color;
}	


MEIRO.Models.T003.prototype.onObject = function()
{
	if (!this.playing) return undefined;
	
	// координати на мишка
	this.mouse.x = (controls.human.mousePos.x/window.innerWidth)*2 - 1;
	this.mouse.y = -(controls.human.mousePos.y/window.innerHeight)*2 + 1;

	this.raycaster.setFromCamera( this.mouse, camera );
	
	var that = this;
	
	var pop = function()
	{
		if (that.string.length==0) return;
		that.screenPos = (that.screenPos+that.screenPlates.children.length-1)%that.screenPlates.children.length;
		that.string = that.string.slice(0,-1);
		that.screenPlates.children[that.screenPos].material.map = that.emptyTexture;
	}
	
	var push = function(i)
	{
		that.string += that.stringButtonCodes[i];
		that.screenPlates.children[that.screenPos].material.map = that.screenTextures[i];
		that.screenPlates.children[that.screenPos].material.color = new THREE.Color('green');
		that.screenPos = (that.screenPos+1)%that.screenPlates.children.length;
	}
	
	var lastCharacterIn = function(chs)
	{
		if (that.string.length==0) return false;
		return ( chs.indexOf(that.string[that.string.length-1])>-1 );
	}
	
	var balancedParentheses = function()
	{
		var open = that.string.lastIndexOf('(');
		var close = that.string.lastIndexOf(')');
		return (open <= close);
	}
	
	for( var i=0; i<this.buttons.length; i++)
	{
		var button = this.buttons[i];
		var intersects = this.raycaster.intersectObject( button );
		if (!intersects.length)
		{
			var intersects = this.raycaster.intersectObject( button.children[0] );
		}
		if (intersects.length)
		{
			this.clicks++;
			button.scale.y = 0.5;
			
			if (i==2) // undo
			{
				pop();
			}
			else
			{
				if (i==4) // parentheses
				{
					if (balancedParentheses())
						push(4); // open parenthesis
					else
					{
						if (lastCharacterIn('('))
							pop(); // remove (, because () will be empty
						else
							push(2); // close parenthesis
					}
				}
				else
				{
					if ( (i==0 || i==6) && lastCharacterIn('+-') )
						pop(i); // replace last operator with new operator
					push(i);
				}

			}
			//console.log('on '+i,' ',this.string);
			this.runString();

			this.audioClick.play();
			return button;
		}
	}

	return undefined;
}


MEIRO.Models.T003.prototype.fullString = function(string)
{
	var insert = function(i,ch)
	{
		string = string.substring(0,i+1) + ch + string.substring(i+1);
	}
	
	// add * between XX , X( , )X , )(
	for (var i=string.length-2; i>=0; i--)
	{
		var ch = string[i];
		if (ch=='(' || ch=='+' || ch=='-') continue;
		
		var ch = string[i+1];
		if (ch==')' || ch=='+' || ch=='-') continue;
		
		insert(i,'*');
	}

	return string;
}



MEIRO.Models.T003.prototype.evalString = function(string, defaultValue)
{
	//console.log('eval:{'+string+'}');
	
	if (string=='')
		return defaultValue;
	
	if (string=='A' || string=='B' || string=='C' || string=='D')
		return this.masks[string];
	
	var posPlus = -1;
	var posMult = -1;
	var posSubs = -1;
	var paren = 0;
	for (var i=0; i<string.length; i++)
	{
		switch (string[i])
		{
			case '(': paren++; break;
			case ')': paren--; break;
			case '+': if (!paren) posPlus = i; break;
			case '*': if (!paren) posMult = i; break;
			case '-': if (!paren) posSubs = i; break;
		}
		//console.log(i,string[i],paren);
	}
	
	//console.log(posPlus,posSubs,posMult);
	if (posSubs>=0 && posPlus>=0)
	{
		if (posSubs>posPlus)
			posPlus = -1;
		else
			posSubs = -1;
	}
	
	if (posSubs>=0)
	{
		//console.log('calc:{'+string.substring(0,posSubs)+'} - {'+string.substring(posSubs+1)+'}');
		return ( 
			this.evalString(string.substring(0,posSubs), 0)
			&
			~this.evalString(string.substring(posSubs+1), 0) );
	}
	else
	if (posPlus>=0)
	{
		//console.log('calc:{'+string.substring(0,posPlus)+'} + {'+string.substring(posPlus+1)+'}');
		
		return ( 
			this.evalString(string.substring(0,posPlus), 0)
			|
			this.evalString(string.substring(posPlus+1), 0) );
	}
	else
	if (posMult>=0)
	{
		//console.log('calc:{'+string.substring(0,posMult)+'} + {'+string.substring(posMult+1)+'}');
		return ( 
			this.evalString(string.substring(0,posMult), -1)
			&
			this.evalString(string.substring(posMult+1), -1) );
	}
	else
	{
		// strip first "(" and last ")"
		var first = (string[0]=='(');
		var last = (string[string.length-1]==')');
		if (first || last)
		{
			if (first) string = string.substring(1);
			if (last) string = string.substring(0,string.length-1); 
			return this.evalString(string,defaultValue);
		}
		else
			return (string);
	}

}



MEIRO.Models.T003.prototype.applyMask = function(value)
{
	var changed = false;
	for (var i=1; i<=15; i++) 
	{
		if (i!=5 && i!=10)
		{
			if (this.keys[i].expanding != (value%2>0) )
			{
				this.keys[i].expanding = value%2>0;
				changed = true;
			}
		}
		value = value>>1;
	}
	
	if (changed) this.audioMetal.play();
}



MEIRO.Models.T003.prototype.symmetricMask = function(value)
{
	function get(i) { return (value&(1<<i))?true:false; }
	function same(i,j) { return get(i)==get(j); }

	//	check |
	if ( same(7,3) && same(12,13) && same(8,5) && same(10,6) && same(0,1) ) return true;
	
	// check --
	if ( same(7,0) && same(12,10) && same(11,2) && same(13,6) && same(3,1) ) return true;
	
	// check \ 
	if ( same(8,11) && same(10,13) && same(0,3) && same(2,5) ) return true;
	
	// check /
	if ( same(5,11) && same(12,6) && same(7,1) && same(2,8) ) return true;
	
	return false;
}



MEIRO.Models.T003.prototype.evaluateMask = function(value)
{	// see textures/sources/003-scoring.jpg
	var score = 0;
	
	var D	 = value & 1<<0;
	var C	 = value & 1<<1;
	var CD	 = value & 1<<2;
	var B	 = value & 1<<3;
	var BC	 = value & 1<<5;
	var BCD	 = value & 1<<6;
	var A	 = value & 1<<7;
	var AD	 = value & 1<<8;
	var ACD	 = value & 1<<10;
	var AB	 = value & 1<<11;
	var ABD	 = value & 1<<12;
	var ABC	 = value & 1<<13;
	var ABCD = value & 1<<14;
	
	function edgeQuad(a,b,c,d)
	{
		/*
			abcd	edge
			----
			0000	0	
			0001	1	
			0010	1
			0011	0	
			0100	1
			0101	2
			0110	0
			0111	1
			1000	1
			1001	0
			1010	2
			1011	1
			1100	0
			1101	1		
			1110	1	
			1111	0
		*/
		var n = 0;
		n = (n<<1) + (a?1:0);
		n = (n<<1) + (b?1:0);
		n = (n<<1) + (c?1:0);
		n = (n<<1) + (d?1:0);
		//console.log ('abcd=',a,b,c,d,'n=',n,'n%3=',n%3);
		if (n%3==0) return 0;
		if (n%5==0) return 2;
		return 1;
	}
	
	// point 1..4
	score += edgeQuad(0,B,AB,A);
	score += edgeQuad(0,C,BC,B);
	score += edgeQuad(0,D,CD,C);
	score += edgeQuad(0,A,AD,D);
	//console.log ('---');

	// point 5..8
	score += edgeQuad(A,AB,ABD,AD);
	score += edgeQuad(B,BC,ABC,AB);
	score += edgeQuad(C,CD,BCD,BC);
	score += edgeQuad(D,AD,ACD,CD);
	//console.log ('---');

	// point 9..12
	score += edgeQuad(AB,ABC,ABCD,ABD);
	score += edgeQuad(BC,BCD,ABCD,ABC);
	score += edgeQuad(CD,ACD,ABCD,BCD);
	score += edgeQuad(AD,ABD,ABCD,ACD);
	//console.log ('---');
	
	return score;
}



MEIRO.Models.T003.prototype.runString = function()
{
	var expression = this.fullString(this.string);
	var value = this.evalString(expression);
	this.applyMask(value);
	this.resultMask = value;
	
//	console.log('1)',this.string);
//	console.log('2)',expression);
//	console.log('3)',result);
//	console.log('3)',value,value.toString(2));


}


// аниматор на модела
MEIRO.Models.T003.prototype.onAnimate = function(time)
{	
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

	for (var i=0; i<this.buttons.length; i++)
	{
		var button = this.buttons[i];
		var k = 0.9;
		button.scale.y = button.scale.y*k+(1-k)*1;
		button.position.y = button.scale.y*this.BUTTON_HEIGHT/2;
	}

	for (var i=1; i<=15; i++) if (i!=5 && i!=10)
	{
		var k = 0.7;
		var key = this.keys[i];
		var targetScale = key.expanding?this.KEY_HEIGHT:0.001;
		key.scale.z = key.scale.z*k+(1-k)*targetScale;
		
		//var hint = this.hints[i];
		//hint.position.y = this.HINT_HEIGHT+2*Math.sin(rpm(time,4));
	}
	//this.hints[this.keyA].material.alphaMap.offset.x = Math.random();
	//this.hints[this.keyA].material.alphaMap.offset.y = Math.random();
	
	this.screenPlates.rotation.y = -rpm(time,1.5);
	TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.T003.prototype.onInfo = function(element)
{
	element.innerHTML = this.info;
}



MEIRO.Models.T003.prototype.evaluateResult = function()
{	
	
	
	function countBits(n)
	{
		var count = 0;
		for (var i=0; i<15; i++,n>>=1)
			if (n%2) count++;
		return count;
	}
	
	//console.log('target mask',this.config.targetMask,this.config.targetMask.toString(2));
	//console.log('result mask',this.resultMask,this.resultMask.toString(2));
	var difference = countBits(this.config.targetMask^this.resultMask);

	var match = THREE.Math.clamp(1 - 0.4*difference, 0, 1);
	
	this.config.score = match*this.config.max_score;

	this.config.time =  Math.floor((animationLoop.time-this.startTime)/1000);
	
//	console.log('score=',this.config.score);
	this.info = '';
	this.info += '<h1 style="text-align:center;">Геометричният шифър &ndash; '+Math.round(1000*this.config.score)/10+' от '+Math.round(100*this.config.max_score)+' точки</span></h1>';

	this.info += '<p>От общо 13 фрагмента избраният шифър има '+countBits(this.config.targetMask)+'. Създаденият от вас шифър е с '+countBits(this.resultMask)+'. ';
	
	if (difference==0)
		this.info += 'Има пълно съвпадение на фрагментите.';
	else
	if (difference==1)
		this.info += 'Само в един фрагмент има разлика.';
	else
		this.info += 'В '+difference+' фрагмента има разлика.';

//	console.log('evaluation=',this.config.score*match);
}



MEIRO.Models.T003.prototype.sendResult = function(callback)
{
	var competences = [];
	for (var i=0; i<MEIRO.Models.T003.COMPETENCES.length; i++)
		competences.push( Math.round(100*MEIRO.Models.T003.COMPETENCES[i]*this.config.score)/100 );
	
	var data = new FormData();
	data.append('ACTION', 'END');
	data.append('MODEL', 'T003');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	data.append('SCORE', Math.round(100*this.config.score)/100);
	data.append('TIME', this.config.time);
	data.append('CLICKS', this.clicks);
	data.append('COMPETENCES', competences);
	postData(data,callback,callback);
}



MEIRO.Models.T003.prototype.sendStartup = function(callback)
{
	var data = new FormData();
	data.append('ACTION', 'START');
	data.append('MODEL', 'T003');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	postData(data,callback,callback);
}



MEIRO.Models.T003.prototype.onEnter = function(element)
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
			// анимация по активиране на модела
		} )
		.start();
}


// превключвател на модела
MEIRO.Models.T003.prototype.onExitModel = function(element)
{
	//MEIRO.Model.prototype.onExit.call(this);
	
	var that = this;
	
	that.playing = false;
	that.evaluateResult();

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
MEIRO.Models.T003.prototype.configure = function(difficulty)
{	
	this.config = {difficulty: difficulty};

// generated when generateArrays() is uncommented and stats are turned on
easyPairs = [102, 10, 1285, 10, 6528, 10, 10280, 10, 17476, 10, 20544, 10, 21760, 10, 24672, 10, 25600, 10, 30055, 10, 30720, 10, 31854, 10, 32109, 10, 32197, 10, 32230, 10, 32232, 10, 1, 13, 2, 13, 8, 13, 64, 13, 109, 13, 128, 13, 1024, 13, 1414, 13, 4096, 13, 4421, 13, 6248, 13, 6409, 13, 8192, 13, 9254, 13, 10402, 13, 11648, 13, 16448, 13, 17408, 13, 20480, 13, 20805, 13, 21828, 13, 21837, 13, 22632, 13, 24576, 13, 25638, 13, 25700, 13, 25830, 13, 28032, 13, 29798, 13, 30021, 13, 30816, 13, 30825, 13, 31848, 13, 32000, 13, 32111, 13, 32130, 13, 32192, 13, 32231, 13, 32237, 13, 32238, 13, 4, 17, 7, 17, 32, 17, 42, 17, 111, 17, 256, 17, 385, 17, 1092, 17, 1383, 17, 1415, 17, 1512, 17, 2048, 17, 2184, 17, 5376, 17, 5445, 17, 6509, 17, 6537, 17, 6630, 17, 7182, 17, 7557, 17, 8288, 17, 9318, 17, 10350, 17, 10410, 17, 10437, 17, 11565, 17, 11686, 17, 12579, 17, 14336, 17, 14440, 17, 14760, 17, 15744, 17, 16384, 17, 17472, 17, 21504, 17, 24640, 17, 28672, 17, 30048, 17, 31812, 17, 32103, 17, 32110, 17, 32229, 17, 32236, 17, 32239, 17, 38, 20, 100, 20, 230, 20, 261, 20, 1284, 20, 1293, 20, 2088, 20, 2432, 20, 4198, 20, 6400, 20, 6511, 20, 6530, 20, 6592, 20, 6631, 20, 6637, 20, 6638, 20, 7533, 20, 7654, 20, 9477, 20, 10272, 20, 10281, 20, 11304, 20, 11567, 20, 11629, 20, 11687, 20, 11693, 20, 11694, 20, 11750, 20, 14701, 20, 14822, 20, 15661, 20, 15782, 20, 20545, 20, 20546, 20, 20552, 20, 20582, 20, 20672, 20, 21568, 20, 21958, 20, 22976, 20, 23917, 20, 24038, 20, 25601, 20, 25602, 20, 25608, 20, 25664, 20, 25709, 20, 25728, 20, 25861, 20, 27688, 20, 28013, 20, 28134, 20, 28736, 20, 29696, 20, 30946, 20, 31085, 20, 31206, 20, 32009, 20, 32045, 20, 32101, 20, 32102, 20, 32108, 20, 32166, 20, 32228, 20];

mediumPairs = [3, 30, 9, 30, 10, 30, 45, 30, 66, 30, 129, 30, 130, 30, 136, 30, 192, 30, 237, 30, 291, 30, 390, 30, 424, 30, 1025, 30, 1032, 30, 1088, 30, 1376, 30, 1422, 30, 1516, 30, 1519, 30, 2062, 30, 2181, 30, 2210, 30, 2313, 30, 3560, 30, 4098, 30, 4160, 30, 4205, 30, 4224, 30, 4420, 30, 4429, 30, 5120, 30, 6240, 30, 6249, 30, 6411, 30, 6473, 30, 6639, 30, 7172, 30, 7214, 30, 7272, 30, 7438, 30, 7567, 30, 7655, 30, 7662, 30, 8193, 30, 8200, 30, 8256, 30, 9216, 30, 9252, 30, 9382, 30, 9606, 30, 10308, 30, 10403, 30, 10469, 30, 10479, 30, 10693, 30, 11426, 30, 11520, 30, 11631, 30, 11650, 30, 11695, 30, 11712, 30, 11757, 30, 12288, 30, 12576, 30, 12583, 30, 12613, 30, 13350, 30, 13671, 30, 14627, 30, 14763, 30, 14823, 30, 14830, 30, 15470, 30, 15663, 30, 15725, 30, 15789, 30, 15813, 30, 15846, 30, 15848, 30, 16450, 30, 16486, 30, 16576, 30, 17409, 30, 17416, 30, 17479, 30, 17669, 30, 17767, 30, 17896, 30, 19524, 30, 19660, 30, 20482, 30, 20589, 30, 20608, 30, 20804, 30, 20813, 30, 21792, 30, 21802, 30, 21836, 30, 21889, 30, 21959, 30, 22624, 30, 22633, 30, 22857, 30, 22912, 30, 23566, 30, 23656, 30, 23941, 30, 24039, 30, 24046, 30, 24577, 30, 24584, 30, 24682, 30, 24928, 30, 25057, 30, 25636, 30, 25711, 30, 25766, 30, 25828, 30, 25990, 30, 26664, 30, 26734, 30, 26821, 30, 27810, 30, 27904, 30, 28015, 30, 28034, 30, 28096, 30, 28141, 30, 28963, 30, 28997, 30, 29734, 30, 29764, 30, 29792, 30, 29796, 30, 29926, 30, 30016, 30, 30020, 30, 30029, 30, 30051, 30, 30052, 30, 30184, 30, 30724, 30, 30727, 30, 30817, 30, 30856, 30, 30954, 30, 31144, 30, 31207, 30, 31214, 30, 31808, 30, 31822, 30, 31840, 30, 31844, 30, 31849, 30, 31941, 30, 32002, 30, 32047, 30, 32064, 30, 32068, 30, 32096, 30, 32137, 30, 32173, 30, 32194, 30, 47, 33, 239, 33, 391, 33, 1423, 33, 2218, 33, 2413, 33, 2441, 33, 2534, 33, 3373, 33, 3494, 33, 4207, 33, 5444, 33, 5453, 33, 6445, 33, 6501, 33, 6502, 33, 6508, 33, 6539, 33, 6566, 33, 6601, 33, 6628, 33, 7663, 33, 9316, 33, 9446, 33, 9607, 33, 10411, 33, 10541, 33, 10662, 33, 11434, 33, 11557, 33, 11558, 33, 11564, 33, 11684, 33, 11759, 33, 13414, 33, 13637, 33, 14432, 33, 14441, 33, 14831, 33, 15464, 33, 15616, 33, 15727, 33, 15746, 33, 15791, 33, 15808, 33, 15847, 33, 15853, 33, 15854, 33, 16385, 33, 16386, 33, 16392, 33, 16493, 33, 16512, 33, 17798, 33, 20591, 33, 22793, 33, 22985, 33, 24047, 33, 25991, 33, 26786, 33, 27818, 33, 28143, 33, 31215, 33, 32175, 33, 36, 35, 166, 35, 228, 35, 260, 35, 269, 35, 288, 35, 295, 35, 298, 35, 417, 35, 427, 35, 1095, 35, 1292, 35, 1379, 35, 1380, 35, 2052, 35, 2055, 35, 2080, 35, 2089, 35, 2094, 35, 2188, 35, 2191, 35, 2304, 35, 2415, 35, 2434, 35, 2437, 35, 2472, 35, 2496, 35, 2541, 35, 3112, 35, 3140, 35, 3276, 35, 3431, 35, 3495, 35, 3502, 35, 3564, 35, 3567, 35, 4134, 35, 4196, 35, 4326, 35, 4550, 35, 5408, 35, 5418, 35, 5505, 35, 6370, 35, 6402, 35, 6447, 35, 6464, 35, 6573, 35, 6594, 35, 7301, 35, 7428, 35, 7470, 35, 7525, 35, 7532, 35, 7589, 35, 7599, 35, 8298, 35, 8453, 35, 8544, 35, 8673, 35, 9261, 35, 9476, 35, 9485, 35, 10273, 35, 10318, 35, 10340, 35, 10606, 35, 10663, 35, 10670, 35, 10725, 35, 10735, 35, 11296, 35, 11305, 35, 11529, 35, 11622, 35, 11748, 35, 12712, 35, 13664, 35, 14340, 35, 14343, 35, 14472, 35, 14624, 35, 14631, 35, 14693, 35, 14700, 35, 14764, 35, 14767, 35, 15428, 35, 15654, 35, 15719, 35, 15726, 35, 15780, 35, 15845, 35, 15852, 35, 15855, 35, 16388, 35, 16391, 35, 16416, 35, 16426, 35, 16495, 35, 16640, 35, 16769, 35, 17612, 35, 17760, 35, 17799, 35, 17900, 35, 17903, 35, 18432, 35, 18568, 35, 18880, 35, 19496, 35, 19520, 35, 19656, 35, 19944, 35, 20518, 35, 20553, 35, 20580, 35, 20674, 35, 20710, 35, 20934, 35, 21536, 35, 21546, 35, 21569, 35, 21576, 35, 21770, 35, 21966, 35, 22754, 35, 22848, 35, 22893, 35, 22921, 35, 22978, 35, 23014, 35, 23556, 35, 23598, 35, 23822, 35, 23909, 35, 23916, 35, 23951, 35, 24801, 35, 24837, 35, 24896, 35, 25025, 35, 25609, 35, 25645, 35, 25666, 35, 25730, 35, 25792, 35, 25837, 35, 25860, 35, 25869, 35, 26692, 35, 26794, 35, 26853, 35, 26863, 35, 27077, 35, 27680, 35, 27689, 35, 27913, 35, 27949, 35, 28006, 35, 28070, 35, 28132, 35, 28676, 35, 28679, 35, 28737, 35, 28744, 35, 28960, 35, 28967, 35, 29698, 35, 29760, 35, 29805, 35, 29824, 35, 30058, 35, 30150, 35, 30177, 35, 30188, 35, 30191, 35, 30723, 35, 30947, 35, 31011, 35, 31077, 35, 31084, 35, 31147, 35, 31815, 35, 31948, 35, 31970, 35, 31973, 35, 31983, 35, 32011, 35, 32038, 35, 32073, 35, 32078, 35, 32099, 35, 32100, 35, 32164, 35, 32207, 35, 32235, 35, 11, 38, 73, 38, 131, 38, 137, 38, 138, 38, 173, 38, 194, 38, 398, 38, 1033, 38, 1154, 38, 2211, 38, 2315, 38, 2377, 38, 2543, 38, 3234, 38, 3503, 38, 4105, 38, 4141, 38, 4161, 38, 4162, 38, 4168, 38, 4226, 38, 4288, 38, 4333, 38, 4428, 38, 4551, 38, 5184, 38, 5574, 38, 6241, 38, 6378, 38, 6475, 38, 6575, 38, 7264, 38, 7273, 38, 8201, 38, 8322, 38, 8582, 38, 9217, 38, 9218, 38, 9224, 38, 9263, 38, 9280, 38, 9325, 38, 9344, 38, 9380, 38, 9614, 38, 10671, 38, 11427, 38, 11522, 38, 11584, 38, 11657, 38, 11714, 38, 12352, 38, 12612, 38, 12621, 38, 13312, 38, 13348, 38, 13478, 38, 14562, 38, 15625, 38, 15717, 38, 15718, 38, 15724, 38, 15844, 38, 16422, 38, 16457, 38, 16484, 38, 16578, 38, 16614, 38, 16645, 38, 17417, 38, 17538, 38, 17668, 38, 17677, 38, 18472, 38, 18761, 38, 18816, 38, 19618, 38, 20489, 38, 20525, 38, 20610, 38, 20717, 38, 20812, 38, 20935, 38, 21967, 38, 22625, 38, 22762, 38, 22784, 38, 22859, 38, 22895, 38, 22914, 38, 23015, 38, 23021, 38, 23022, 38, 23648, 38, 23657, 38, 24585, 38, 24706, 38, 24966, 38, 25647, 38, 25764, 38, 25839, 38, 25998, 38, 26656, 38, 26665, 38, 27811, 38, 27906, 38, 27951, 38, 27968, 38, 28041, 38, 28071, 38, 28077, 38, 28078, 38, 28098, 38, 28996, 38, 29005, 38, 29732, 38, 29807, 38, 29862, 38, 29924, 38, 30028, 38, 30151, 38, 30955, 38, 31841, 38, 31978, 38, 32066, 38, 32139, 38, 32201, 38, 140, 40, 143, 40, 161, 40, 171, 40, 175, 40, 266, 40, 395, 40, 399, 40, 428, 40, 431, 40, 1228, 40, 1515, 40, 2051, 40, 2187, 40, 2213, 40, 2219, 40, 2223, 40, 2318, 40, 2339, 40, 2349, 40, 2406, 40, 2443, 40, 2447, 40, 2470, 40, 2475, 40, 2505, 40, 2532, 40, 3136, 40, 3242, 40, 3272, 40, 3365, 40, 3372, 40, 3424, 40, 4143, 40, 4335, 40, 5152, 40, 5162, 40, 5386, 40, 5452, 40, 5575, 40, 6438, 40, 6500, 40, 6564, 40, 6603, 40, 7204, 40, 7311, 40, 8417, 40, 8512, 40, 8583, 40, 8641, 40, 9327, 40, 9444, 40, 9615, 40, 10447, 40, 10533, 40, 10540, 40, 10564, 40, 11435, 40, 11556, 40, 12292, 40, 12295, 40, 12580, 40, 12715, 40, 13380, 40, 13408, 40, 13412, 40, 13542, 40, 13632, 40, 13636, 40, 13645, 40, 13667, 40, 13668, 40, 13800, 40, 14339, 40, 14433, 40, 14570, 40, 15424, 40, 15438, 40, 15456, 40, 15460, 40, 15465, 40, 15557, 40, 15618, 40, 15680, 40, 15684, 40, 15712, 40, 15753, 40, 15810, 40, 16387, 40, 16393, 40, 16394, 40, 16429, 40, 16513, 40, 16514, 40, 16520, 40, 16621, 40, 16675, 40, 16774, 40, 16808, 40, 17475, 40, 17608, 40, 17763, 40, 17764, 40, 17806, 40, 18446, 40, 18565, 40, 18594, 40, 18697, 40, 18889, 40, 19527, 40, 19626, 40, 19663, 40, 19815, 40, 19948, 40, 19951, 40, 20527, 40, 20719, 40, 21514, 40, 21633, 40, 21921, 40, 21931, 40, 22795, 40, 22987, 40, 23023, 40, 23685, 40, 23812, 40, 23854, 40, 23973, 40, 23983, 40, 24650, 40, 24769, 40, 24938, 40, 24967, 40, 25067, 40, 25999, 40, 26702, 40, 26724, 40, 26787, 40, 26990, 40, 27109, 40, 27119, 40, 27819, 40, 28079, 40, 28675, 40, 28808, 40, 29096, 40, 29767, 40, 29802, 40, 30145, 40, 30860, 40, 30863, 40, 31008, 40, 31015, 40, 31148, 40, 31151, 40, 31944, 40];

hardPairs = [164, 70, 268, 70, 2081, 70, 2306, 70, 2351, 70, 2368, 70, 2471, 70, 2477, 70, 2478, 70, 2498, 70, 3104, 70, 3113, 70, 4132, 70, 4262, 70, 4324, 70, 4558, 70, 6371, 70, 6466, 70, 7394, 70, 7524, 70, 8452, 70, 8461, 70, 9389, 70, 9484, 70, 11297, 70, 11531, 70, 11593, 70, 11620, 70, 12742, 70, 13357, 70, 14692, 70, 15652, 70, 16431, 70, 16623, 70, 16775, 70, 17807, 70, 18602, 70, 18752, 70, 18797, 70, 18825, 70, 18882, 70, 18918, 70, 19488, 70, 19497, 70, 19757, 70, 19878, 70, 20516, 70, 20555, 70, 20646, 70, 20675, 70, 20681, 70, 20682, 70, 20708, 70, 20942, 70, 21577, 70, 21698, 70, 22755, 70, 22829, 70, 22850, 70, 22885, 70, 22886, 70, 22892, 70, 22923, 70, 22950, 70, 23012, 70, 23778, 70, 23908, 70, 24836, 70, 24845, 70, 25611, 70, 25673, 70, 25731, 70, 25737, 70, 25738, 70, 25773, 70, 25794, 70, 25868, 70, 26795, 70, 26925, 70, 27046, 70, 27681, 70, 27915, 70, 27941, 70, 27942, 70, 27948, 70, 27977, 70, 28004, 70, 28068, 70, 28745, 70, 28866, 70, 29126, 70, 29705, 70, 29741, 70, 29761, 70, 29762, 70, 29768, 70, 29826, 70, 29888, 70, 29933, 70, 30158, 70, 31076, 70, 31971, 70, 32036, 70, 32075, 70, 75, 76, 139, 76, 201, 76, 292, 76, 1091, 76, 1155, 76, 1162, 76, 1224, 76, 2084, 76, 2308, 76, 2336, 76, 2343, 76, 2350, 76, 2379, 76, 2469, 76, 2476, 76, 2479, 76, 3143, 76, 3235, 76, 3279, 76, 3427, 76, 3428, 76, 3563, 76, 4107, 76, 4169, 76, 4233, 76, 4269, 76, 4290, 76, 4559, 76, 5130, 76, 5185, 76, 5192, 76, 5249, 76, 5537, 76, 5547, 76, 5582, 76, 6379, 76, 7265, 76, 7333, 76, 7343, 76, 7402, 76, 7460, 76, 8266, 76, 8323, 76, 8330, 76, 8385, 76, 8554, 76, 8590, 76, 8683, 76, 9225, 76, 9282, 76, 9346, 76, 9391, 76, 9408, 76, 9453, 76, 10574, 76, 10596, 76, 10703, 76, 11586, 76, 11659, 76, 11721, 76, 12291, 76, 12353, 76, 12360, 76, 12424, 76, 12620, 76, 12716, 76, 12719, 76, 12743, 76, 13314, 76, 13359, 76, 13376, 76, 13421, 76, 13440, 76, 13476, 76, 13674, 76, 13766, 76, 13793, 76, 13804, 76, 13807, 76, 14476, 76, 14479, 76, 14563, 76, 14628, 76, 15431, 76, 15564, 76, 15586, 76, 15589, 76, 15599, 76, 15627, 76, 15689, 76, 15694, 76, 15715, 76, 15716, 76, 15823, 76, 15851, 76, 16420, 76, 16459, 76, 16550, 76, 16585, 76, 16612, 76, 16644, 76, 16653, 76, 16672, 76, 16679, 76, 16682, 76, 16801, 76, 16811, 76, 17539, 76, 17546, 76, 17615, 76, 17676, 76, 17899, 76, 18436, 76, 18439, 76, 18464, 76, 18473, 76, 18478, 76, 18572, 76, 18575, 76, 18688, 76, 18763, 76, 18799, 76, 18818, 76, 18821, 76, 18856, 76, 18925, 76, 19619, 76, 19808, 76, 19879, 76, 19886, 76, 20491, 76, 20617, 76, 20653, 76, 20943, 76, 21899, 76, 22763, 76, 22786, 76, 22831, 76, 22957, 76, 23588, 76, 23649, 76, 23695, 76, 23786, 76, 24707, 76, 24714, 76, 24811, 76, 24974, 76, 25775, 76, 26657, 76, 26831, 76, 26948, 76, 27047, 76, 27054, 76, 27970, 76, 28043, 76, 28105, 76, 28964, 76, 29004, 76, 29099, 76, 29127, 76, 29743, 76, 29860, 76, 29900, 76, 29921, 76, 29935, 76, 30026, 76, 30159, 76, 30187, 76, 30859, 76, 31811, 76, 31951, 76, 31979, 76, 32203, 76, 2341, 82, 2342, 82, 2348, 82, 2404, 82, 2468, 82, 2507, 82, 3243, 82, 3364, 82, 4271, 82, 5583, 82, 6436, 82, 8591, 82, 9455, 82, 10532, 82, 13423, 82, 13540, 82, 13644, 82, 13767, 82, 14571, 82, 15457, 82, 15594, 82, 15682, 82, 15755, 82, 15817, 82, 16395, 82, 16515, 82, 16521, 82, 16522, 82, 16557, 82, 16782, 82, 18595, 82, 18699, 82, 18891, 82, 18927, 82, 19627, 82, 19887, 82, 20655, 82, 22959, 82, 24975, 82, 27055, 82, 1231, 88, 2370, 88, 3105, 88, 4260, 88, 5515, 88, 7395, 88, 8427, 88, 8460, 88, 11595, 88, 12750, 88, 13383, 88, 13418, 88, 13485, 88, 13761, 88, 14475, 88, 15560, 88, 16524, 88, 16527, 88, 16545, 88, 16555, 88, 16559, 88, 16650, 88, 16779, 88, 16783, 88, 16812, 88, 16815, 88, 18435, 88, 18571, 88, 18597, 88, 18603, 88, 18607, 88, 18702, 88, 18723, 88, 18733, 88, 18754, 88, 18790, 88, 18827, 88, 18831, 88, 18854, 88, 18859, 88, 18916, 88, 19489, 88, 19523, 88, 19659, 88, 19749, 88, 19756, 88, 19811, 88, 19812, 88, 19947, 88, 20644, 88, 20683, 88, 21665, 88, 21675, 88, 21699, 88, 21706, 88, 22822, 88, 22884, 88, 22948, 88, 23717, 88, 23727, 88, 23779, 88, 23844, 88, 24844, 88, 24906, 88, 25035, 88, 25675, 88, 25739, 88, 25801, 88, 26917, 88, 26924, 88, 26958, 88, 26980, 88, 27087, 88, 27940, 88, 27979, 88, 28812, 88, 28815, 88, 28867, 88, 28874, 88, 29100, 88, 29103, 88, 29134, 88, 29707, 88, 29763, 88, 29769, 88, 29770, 88, 29833, 88, 29869, 88, 29889, 88, 29890, 88, 29896, 88, 31012, 88, 203, 94, 1163, 94, 4171, 94, 4235, 94, 4291, 94, 4297, 94, 4298, 94, 5193, 94, 5314, 94, 7403, 94, 8331, 94, 9227, 94, 9289, 94, 9347, 94, 9353, 94, 9354, 94, 9410, 94, 11723, 94, 12361, 94, 12482, 94, 12751, 94, 13321, 94, 13377, 94, 13378, 94, 13384, 94, 13442, 94, 13487, 94, 13504, 94, 13549, 94, 13774, 94, 15587, 94, 15691, 94, 16548, 94, 16587, 94, 16652, 94, 17547, 94, 18465, 94, 18690, 94, 18735, 94, 18855, 94, 18861, 94, 18862, 94, 20619, 94, 23787, 94, 24715, 94, 28107, 94, 29135, 94, 29871, 94, 2340, 100, 3139, 100, 3275, 100, 5281, 100, 5291, 100, 8522, 100, 8651, 100, 12428, 100, 12431, 100, 13516, 100, 13537, 100, 13551, 100, 13642, 100, 13775, 100, 13803, 100, 15427, 100, 15567, 100, 15595, 100, 15819, 100, 16523, 100, 16676, 100, 17611, 100, 18468, 100, 18692, 100, 18720, 100, 18727, 100, 18734, 100, 18853, 100, 18860, 100, 18863, 100, 21643, 100, 24779, 100, 28811, 100, 29903, 100, 29931, 100, 30155, 100, 31947, 100, 79, 70, 107, 70, 199, 70, 205, 70, 233, 70, 234, 70, 301, 70, 326, 70, 354, 70, 363, 70, 364, 70, 422, 70, 455, 70, 461, 70, 483, 70, 484, 70, 490, 70, 1039, 70, 1061, 70, 1071, 70, 1101, 70, 1102, 70, 1129, 70, 1130, 70, 1159, 70, 1166, 70, 1198, 70, 1221, 70, 1222, 70, 1256, 70, 1260, 70, 1313, 70, 1323, 70, 1324, 70, 1386, 70, 1411, 70, 1417, 70, 1418, 70, 1443, 70, 1444, 70, 1449, 70, 1473, 70, 1474, 70, 1480, 70, 1484, 70, 1505, 70, 2093, 70, 2118, 70, 2127, 70, 2146, 70, 2149, 70, 2214, 70, 2247, 70, 2254, 70, 2276, 70, 2281, 70, 2282, 70, 2317, 70, 2345, 70, 2373, 70, 2408, 70, 2438, 70, 2466, 70, 2500, 70, 2509, 70, 2528, 70, 2535, 70, 2537, 70, 2542, 70, 3077, 70, 3087, 70, 3110, 70, 3116, 70, 3149, 70, 3150, 70, 3181, 70, 3207, 70, 3213, 70, 3246, 70, 3269, 70, 3270, 70, 3304, 70, 3308, 70, 3329, 70, 3334, 70, 3340, 70, 3368, 70, 3375, 70, 3433, 70, 3438, 70, 3465, 70, 3466, 70, 3488, 70, 3498, 70, 3501, 70, 3526, 70, 3528, 70, 3532, 70, 3554, 70, 3557, 70, 4167, 70, 4173, 70, 4201, 70, 4202, 70, 4293, 70, 4328, 70, 4363, 70, 4367, 70, 4389, 70, 4390, 70, 4399, 70, 4419, 70, 4425, 70, 4452, 70, 4458, 70, 4483, 70, 4484, 70, 4487, 70, 4489, 70, 4512, 70, 4515, 70, 4521, 70, 4522, 70, 4545, 70, 4577, 70, 4578, 70, 4581, 70, 4588, 70, 4591, 70, 5127, 70, 5134, 70, 5166, 70, 5189, 70, 5190, 70, 5224, 70, 5228, 70, 5254, 70, 5379, 70, 5385, 70, 5390, 70, 5411, 70, 5417, 70, 5422, 70, 5441, 70, 5446, 70, 5473, 70, 5474, 70, 5484, 70, 5506, 70, 5512, 70, 5538, 70, 5542, 70, 5544, 70, 5568, 70, 5572, 70, 5600, 70, 5607, 70, 5613, 70, 5614, 70, 6155, 70, 6182, 70, 6187, 70, 6188, 70, 6191, 70, 6215, 70, 6217, 70, 6218, 70, 6244, 70, 6276, 70, 6279, 70, 6281, 70, 6282, 70, 6285, 70, 6286, 70, 6304, 70, 6314, 70, 6342, 70, 6344, 70, 6348, 70, 6373, 70, 6380, 70, 6383, 70, 6406, 70, 6412, 70, 6433, 70, 6434, 70, 6468, 70, 6471, 70, 6478, 70, 6496, 70, 6499, 70, 6506, 70, 6567, 70, 6574, 70, 6607, 70, 6635, 70, 7175, 70, 7177, 70, 7178, 70, 7210, 70, 7213, 70, 7237, 70, 7238, 70, 7240, 70, 7279, 70, 7304, 70, 7308, 70, 7334, 70, 7364, 70, 7406, 70, 7434, 70, 7463, 70, 7465, 70, 7466, 70, 7496, 70, 7500, 70, 7503, 70, 7526, 70, 7596, 70, 7623, 70, 7630, 70, 7652, 70, 7657, 70, 7658, 70, 8235, 70, 8236, 70, 8239, 70, 8263, 70, 8269, 70, 8291, 70, 8297, 70, 8355, 70, 8359, 70, 8362, 70, 8389, 70, 8418, 70, 8421, 70, 8424, 70, 8485, 70, 8486, 70, 8488, 70, 8491, 70, 8547, 70, 8553, 70, 8557, 70, 8615, 70, 8617, 70, 8618, 70, 8645, 70, 8674, 70, 8677, 70, 8680, 70, 9223, 70, 9230, 70, 9251, 70, 9258, 70, 9285, 70, 9286, 70, 9314, 70, 9317, 70, 9320, 70, 9324, 70, 9350, 70, 9378, 70, 9508, 70, 9513, 70, 9514, 70, 9518, 70, 9569, 70, 9570, 70, 9576, 70, 9583, 70, 9601, 70, 9602, 70, 9608, 70, 9633, 70, 9644, 70, 9647, 70, 9664, 70, 9668, 70, 9700, 70, 9709, 70, 9710, 70, 10252, 70, 10255, 70, 10277, 70, 10311, 70, 10371, 70, 10377, 70, 10378, 70, 10381, 70, 10382, 70, 10404, 70, 10433, 70, 10434, 70, 10440, 70, 10444, 70, 10465, 70, 10501, 70, 10504, 70, 10529, 70, 10530, 70, 10543, 70, 10573, 70, 10599, 70, 10627, 70, 10628, 70, 10631, 70, 10633, 70, 10669, 70, 10689, 70, 10694, 70, 10721, 70, 10722, 70, 10732, 70, 11271, 70, 11277, 70, 11300, 70, 11303, 70, 11333, 70, 11334, 70, 11340, 70, 11375, 70, 11393, 70, 11394, 70, 11400, 70, 11404, 70, 11429, 70, 11439, 70, 11456, 70, 11488, 70, 11492, 70, 11495, 70, 11501, 70, 11524, 70, 11534, 70, 11552, 70, 11555, 70, 11621, 70, 11628, 70, 11660, 70, 11663, 70, 11681, 70, 11691, 70, 11719, 70, 11725, 70, 11753, 70, 11754, 70, 12323, 70, 12327, 70, 12330, 70, 12357, 70, 12386, 70, 12389, 70, 12392, 70, 12450, 70, 12547, 70, 12551, 70, 12553, 70, 12586, 70, 12589, 70, 12609, 70, 12642, 70, 12648, 70, 12655, 70, 12673, 70, 12705, 70, 12710, 70, 12768, 70, 12775, 70, 13318, 70, 13346, 70, 13569, 70, 13574, 70, 13601, 70, 13608, 70, 13615, 70, 13677, 70, 13696, 70, 13728, 70, 13735, 70, 13798, 70, 14345, 70, 14346, 70, 14349, 70, 14350, 70, 14371, 70, 14375, 70, 14406, 70, 14408, 70, 14412, 70, 14434, 70, 14437, 70, 14465, 70, 14466, 70, 14469, 70, 14470, 70, 14502, 70, 14528, 70, 14532, 70, 14560, 70, 14567, 70, 14573, 70, 14574, 70, 14595, 70, 14599, 70, 14605, 70, 14638, 70, 14657, 70, 14689, 70, 14694, 70, 14699, 70, 14757, 70, 14791, 70, 14797, 70, 14819, 70, 14820, 70, 14826, 70, 15365, 70, 15368, 70, 15372, 70, 15394, 70, 15407, 70, 15469, 70, 15488, 70, 15492, 70, 15534, 70, 15590, 70, 15617, 70, 15622, 70, 15624, 70, 15631, 70, 15650, 70, 15653, 70, 15659, 70, 15660, 70, 15693, 70, 15721, 70, 15757, 70, 15758, 70, 15779, 70, 15785, 70, 15814, 70, 15842, 70, 16460, 70, 16481, 70, 16485, 70, 16492, 70, 16580, 70, 16608, 70, 16737, 70, 16744, 70, 16836, 70, 16864, 70, 16873, 70, 17420, 70, 17452, 70, 17513, 70, 17514, 70, 17540, 70, 17640, 70, 17644, 70, 17666, 70, 17670, 70, 17672, 70, 17698, 70, 17704, 70, 17769, 70, 17774, 70, 17796, 70, 17824, 70, 17834, 70, 17857, 70, 17858, 70, 17864, 70, 17868, 70, 17890, 70, 17893, 70, 18501, 70, 18508, 70, 18628, 70, 18637, 70, 18656, 70, 19462, 70, 19468, 70, 19565, 70, 19588, 70, 19598, 70, 19688, 70, 19692, 70, 19720, 70, 19821, 70, 19910, 70, 19912, 70, 19916, 70, 19942, 70, 20547, 70, 20554, 70, 20558, 70, 20579, 70, 20673, 70, 20678, 70, 20680, 70, 20706, 70, 20738, 70, 20742, 70, 20744, 70, 20769, 70, 20770, 70, 20776, 70, 20779, 70, 20842, 70, 20846, 70, 20930, 70, 20936, 70, 20961, 70, 20962, 70, 20966, 70, 21511, 70, 21518, 70, 21550, 70, 21570, 70, 21602, 70, 21605, 70, 21615, 70, 21638, 70, 21696, 70, 21742, 70, 21774, 70, 21806, 70, 21867, 70, 21926, 70, 21988, 70, 21993, 70, 21994, 70, 22529, 70, 22530, 70, 22533, 70, 22534, 70, 22540, 70, 22543, 70, 22562, 70, 22599, 70, 22631, 70, 22721, 70, 22722, 70, 22726, 70, 22732, 70, 22758, 70, 22785, 70, 22792, 70, 22982, 70, 22988, 70, 23009, 70, 23010, 70, 23561, 70, 23562, 70, 23565, 70, 23594, 70, 23631, 70, 23663, 70, 23686, 70, 23688, 70, 23744, 70, 23757, 70, 23758, 70, 23790, 70, 23815, 70, 23818, 70, 23849, 70, 23850, 70, 23853, 70, 23873, 70, 23878, 70, 23910, 70, 23948, 70, 23974, 70, 24009, 70, 24010, 70, 24036, 70, 24041, 70, 24042, 70, 24609, 70, 24613, 70, 24647, 70, 24653, 70, 24736, 70, 24773, 70, 24805, 70, 24865, 70, 24866, 70, 24941, 70, 24992, 70, 24995, 70, 25029, 70, 25061, 70, 25603, 70, 25610, 70, 25613, 70, 25641, 70, 25665, 70, 25672, 70, 25729, 70, 25733, 70, 25736, 70, 25768, 70, 25859, 70, 25865, 70, 25897, 70, 25898, 70, 25901, 70, 25921, 70, 25926, 70, 25964, 70, 26017, 70, 26021, 70, 26055, 70, 26061, 70, 26083, 70, 26089, 70, 26090, 70, 26625, 70, 26626, 70, 26629, 70, 26630, 70, 26658, 70, 26701, 70, 26727, 70, 26756, 70, 26759, 70, 26784, 70, 26817, 70, 26818, 70, 26822, 70, 26824, 70, 26849, 70, 26860, 70, 26881, 70, 26989, 70, 27073, 70, 27105, 70, 27106, 70, 27110, 70, 27655, 70, 27657, 70, 27658, 70, 27661, 70, 27693, 70, 27720, 70, 27746, 70, 27749, 70, 27788, 70, 27820, 70, 27847, 70, 27853, 70, 27854, 70, 27881, 70, 27882, 70, 27911, 70, 27917, 70, 27945, 70, 27946, 70, 28005, 70, 28012, 70, 28103, 70, 28109, 70, 28137, 70, 28138, 70, 28707, 70, 28711, 70, 28714, 70, 28738, 70, 28742, 70, 28780, 70, 28783, 70, 28834, 70, 28864, 70, 28903, 70, 28931, 70, 28935, 70, 28937, 70, 28969, 70, 29035, 70, 29039, 70, 29057, 70, 29090, 70, 29120, 70, 29155, 70, 29159, 70, 29161, 70, 29697, 70, 29701, 70, 29704, 70, 29736, 70, 29967, 70, 29995, 70, 29999, 70, 30084, 70, 30087, 70, 30115, 70, 30119, 70, 30122, 70, 30755, 70, 30759, 70, 30799, 70, 30886, 70, 30919, 70, 30925, 70, 30948, 70, 30979, 70, 30983, 70, 30989, 70, 31018, 70, 31021, 70, 31048, 70, 31074, 70, 31078, 70, 31137, 70, 31142, 70, 31171, 70, 31175, 70, 31177, 70, 31181, 70, 31204, 70, 31759, 70, 31787, 70, 31791, 70, 31879, 70, 31886, 70, 31904, 70, 31914, 70, 31918, 70, 32012, 70, 32033, 70, 32037, 70, 32044, 70, 67, 78, 74, 78, 141, 78, 142, 78, 163, 78, 167, 78, 169, 78, 174, 78, 193, 78, 200, 78, 204, 78, 225, 78, 267, 78, 271, 78, 293, 78, 294, 78, 303, 78, 323, 78, 329, 78, 356, 78, 362, 78, 394, 78, 397, 78, 423, 78, 429, 78, 430, 78, 450, 78, 456, 78, 460, 78, 491, 78, 1027, 78, 1034, 78, 1059, 78, 1065, 78, 1089, 78, 1090, 78, 1096, 78, 1121, 78, 1153, 78, 1160, 78, 1164, 78, 1186, 78, 1192, 78, 1196, 78, 1216, 78, 1248, 78, 1252, 78, 1255, 78, 1261, 78, 1290, 78, 1316, 78, 1346, 78, 1352, 78, 1356, 78, 1359, 78, 1387, 78, 1441, 78, 1451, 78, 1486, 78, 1507, 78, 2059, 78, 2086, 78, 2091, 78, 2092, 78, 2095, 78, 2119, 78, 2121, 78, 2122, 78, 2148, 78, 2179, 78, 2215, 78, 2217, 78, 2221, 78, 2222, 78, 2241, 78, 2242, 78, 2255, 78, 2273, 78, 2309, 78, 2319, 78, 2344, 78, 2347, 78, 2407, 78, 2414, 78, 2435, 78, 2436, 78, 2439, 78, 2442, 78, 2445, 78, 2446, 78, 2464, 78, 2467, 78, 2473, 78, 2474, 78, 2497, 78, 2502, 78, 2504, 78, 2508, 78, 2529, 78, 2530, 78, 2533, 78, 2540, 78, 3079, 78, 3081, 78, 3082, 78, 3114, 78, 3117, 78, 3141, 78, 3142, 78, 3144, 78, 3183, 78, 3201, 78, 3202, 78, 3215, 78, 3240, 78, 3244, 78, 3264, 78, 3277, 78, 3278, 78, 3296, 78, 3300, 78, 3303, 78, 3309, 78, 3332, 78, 3338, 78, 3367, 78, 3369, 78, 3370, 78, 3374, 78, 3400, 78, 3404, 78, 3407, 78, 3429, 78, 3430, 78, 3436, 78, 3493, 78, 3500, 78, 3527, 78, 3534, 78, 3556, 78, 3561, 78, 3562, 78, 4099, 78, 4106, 78, 4109, 78, 4110, 78, 4131, 78, 4135, 78, 4137, 78, 4142, 78, 4172, 78, 4193, 78, 4225, 78, 4229, 78, 4230, 78, 4232, 78, 4258, 78, 4264, 78, 4292, 78, 4320, 78, 4327, 78, 4334, 78, 4362, 78, 4366, 78, 4398, 78, 4418, 78, 4424, 78, 4431, 78, 4513, 78, 4518, 78, 4523, 78, 4557, 78, 4579, 78, 4580, 78, 4586, 78, 5121, 78, 5122, 78, 5128, 78, 5132, 78, 5154, 78, 5160, 78, 5164, 78, 5216, 78, 5220, 78, 5223, 78, 5229, 78, 5248, 78, 5252, 78, 5350, 78, 5388, 78, 5409, 78, 5419, 78, 5420, 78, 5475, 78, 5476, 78, 5482, 78, 5517, 78, 5518, 78, 5536, 78, 5543, 78, 5546, 78, 5549, 78, 5550, 78, 5602, 78, 5605, 78, 5612, 78, 5615, 78, 6147, 78, 6179, 78, 6183, 78, 6209, 78, 6210, 78, 6251, 78, 6284, 78, 6287, 78, 6310, 78, 6343, 78, 6350, 78, 6372, 78, 6377, 78, 6404, 78, 6432, 78, 6439, 78, 6446, 78, 6470, 78, 6498, 78, 6565, 78, 6572, 78, 6595, 78, 6602, 78, 7169, 78, 7170, 78, 7202, 78, 7215, 78, 7232, 78, 7268, 78, 7271, 78, 7274, 78, 7303, 78, 7309, 78, 7342, 78, 7365, 78, 7366, 78, 7372, 78, 7400, 78, 7404, 78, 7426, 78, 7435, 78, 7458, 78, 7461, 78, 7462, 78, 7467, 78, 7468, 78, 7488, 78, 7492, 78, 7495, 78, 7497, 78, 7502, 78, 7520, 78, 7530, 78, 7555, 78, 7587, 78, 7588, 78, 7593, 78, 7617, 78, 7618, 78, 7631, 78, 7649, 78, 8195, 78, 8202, 78, 8205, 78, 8206, 78, 8257, 78, 8258, 78, 8264, 78, 8268, 78, 8321, 78, 8325, 78, 8326, 78, 8328, 78, 8353, 78, 8357, 78, 8384, 78, 8388, 78, 8420, 78, 8429, 78, 8430, 78, 8451, 78, 8455, 78, 8457, 78, 8490, 78, 8493, 78, 8513, 78, 8546, 78, 8552, 78, 8559, 78, 8578, 78, 8581, 78, 8584, 78, 8613, 78, 8619, 78, 8640, 78, 8644, 78, 8675, 78, 8676, 78, 8681, 78, 8685, 78, 8686, 78, 9228, 78, 9249, 78, 9348, 78, 9376, 78, 9383, 78, 9390, 78, 9474, 78, 9480, 78, 9487, 78, 9515, 78, 9516, 78, 9536, 78, 9540, 78, 9543, 78, 9549, 78, 9571, 78, 9572, 78, 9577, 78, 9582, 78, 9613, 78, 9641, 78, 9670, 78, 9697, 78, 9708, 78, 9711, 78, 10243, 78, 10276, 78, 10305, 78, 10306, 78, 10319, 78, 10337, 78, 10347, 78, 10380, 78, 10383, 78, 10446, 78, 10467, 78, 10499, 78, 10503, 78, 10509, 78, 10528, 78, 10535, 78, 10542, 78, 10561, 78, 10593, 78, 10597, 78, 10598, 78, 10603, 78, 10604, 78, 10661, 78, 10668, 78, 10695, 78, 10701, 78, 10723, 78, 10724, 78, 10730, 78, 11265, 78, 11266, 78, 11279, 78, 11301, 78, 11307, 78, 11328, 78, 11341, 78, 11342, 78, 11360, 78, 11364, 78, 11367, 78, 11369, 78, 11370, 78, 11405, 78, 11433, 78, 11468, 78, 11490, 78, 11493, 78, 11503, 78, 11532, 78, 11553, 78, 11588, 78, 11591, 78, 11616, 78, 11626, 78, 11651, 78, 11658, 78, 11713, 78, 11720, 78, 11724, 78, 11745, 78, 12289, 78, 12290, 78, 12293, 78, 12294, 78, 12296, 78, 12321, 78, 12325, 78, 12356, 78, 12388, 78, 12397, 78, 12398, 78, 12416, 78, 12448, 78, 12518, 78, 12546, 78, 12550, 78, 12552, 78, 12591, 78, 12608, 78, 12615, 78, 12644, 78, 12654, 78, 12711, 78, 12713, 78, 12714, 78, 12741, 78, 12769, 78, 12770, 78, 12773, 78, 12776, 78, 13316, 78, 13344, 78, 13351, 78, 13358, 78, 13572, 78, 13581, 78, 13604, 78, 13609, 78, 13610, 78, 13614, 78, 13665, 78, 13666, 78, 13672, 78, 13679, 78, 13701, 78, 13702, 78, 13733, 78, 13736, 78, 13792, 78, 13799, 78, 14348, 78, 14351, 78, 14369, 78, 14373, 78, 14407, 78, 14414, 78, 14436, 78, 14468, 78, 14471, 78, 14499, 78, 14503, 78, 14505, 78, 14509, 78, 14510, 78, 14534, 78, 14565, 78, 14572, 78, 14575, 78, 14594, 78, 14598, 78, 14603, 78, 14607, 78, 14629, 78, 14630, 78, 14636, 78, 14656, 78, 14660, 78, 14663, 78, 14665, 78, 14688, 78, 14691, 78, 14698, 78, 14730, 78, 14733, 78, 14734, 78, 14756, 78, 14786, 78, 14792, 78, 14796, 78, 14827, 78, 15367, 78, 15373, 78, 15392, 78, 15396, 78, 15399, 78, 15401, 78, 15429, 78, 15430, 78, 15436, 78, 15471, 78, 15493, 78, 15522, 78, 15528, 78, 15532, 78, 15556, 78, 15598, 78, 15620, 78, 15630, 78, 15648, 78, 15651, 78, 15756, 78, 15759, 78, 15777, 78, 15787, 78, 15815, 78, 15821, 78, 15849, 78, 15850, 78, 16451, 78, 16458, 78, 16462, 78, 16483, 78, 16577, 78, 16582, 78, 16584, 78, 16610, 78, 16707, 78, 16708, 78, 16711, 78, 16713, 78, 16717, 78, 16736, 78, 16739, 78, 16743, 78, 16749, 78, 16834, 78, 16838, 78, 16840, 78, 16865, 78, 16866, 78, 16870, 78, 17411, 78, 17418, 78, 17421, 78, 17443, 78, 17444, 78, 17447, 78, 17449, 78, 17453, 78, 17487, 78, 17505, 78, 17537, 78, 17541, 78, 17544, 78, 17570, 78, 17574, 78, 17576, 78, 17607, 78, 17613, 78, 17614, 78, 17632, 78, 17636, 78, 17639, 78, 17645, 78, 17667, 78, 17673, 78, 17696, 78, 17699, 78, 17703, 78, 17705, 78, 17706, 78, 17709, 78, 17730, 78, 17736, 78, 17740, 78, 17743, 78, 17761, 78, 17762, 78, 17772, 78, 17830, 78, 17870, 78, 17892, 78, 17897, 78, 17898, 78, 18500, 78, 18505, 78, 18506, 78, 18510, 78, 18528, 78, 18537, 78, 18538, 78, 18541, 78, 18542, 78, 18625, 78, 18626, 78, 18630, 78, 18636, 78, 18658, 78, 18662, 78, 18765, 78, 18793, 78, 18881, 78, 18885, 78, 18888, 78, 18920, 78, 19460, 78, 19465, 78, 19466, 78, 19469, 78, 19498, 78, 19502, 78, 19535, 78, 19567, 78, 19585, 78, 19586, 78, 19589, 78, 19596, 78, 19622, 78, 19624, 78, 19655, 78, 19680, 78, 19684, 78, 19687, 78, 19693, 78, 19712, 78, 19721, 78, 19725, 78, 19784, 78, 19788, 78, 19791, 78, 19816, 78, 19823, 78, 19841, 78, 19842, 78, 19845, 78, 19846, 78, 19874, 78, 19880, 78, 19911, 78, 19918, 78, 19936, 78, 19943, 78, 19949, 78, 19950, 78, 20483, 78, 20490, 78, 20493, 78, 20494, 78, 20515, 78, 20519, 78, 20521, 78, 20526, 78, 20559, 78, 20587, 78, 20609, 78, 20613, 78, 20614, 78, 20616, 78, 20642, 78, 20648, 78, 20679, 78, 20685, 78, 20711, 78, 20713, 78, 20714, 78, 20718, 78, 20740, 78, 20749, 78, 20768, 78, 20775, 78, 20778, 78, 20781, 78, 20811, 78, 20815, 78, 20844, 78, 20866, 78, 20869, 78, 20870, 78, 20872, 78, 20898, 78, 20904, 78, 20931, 78, 20937, 78, 20941, 78, 20963, 78, 20967, 78, 20970, 78, 20973, 78, 20974, 78, 21516, 78, 21548, 78, 21609, 78, 21610, 78, 21636, 78, 21708, 78, 21736, 78, 21740, 78, 21771, 78, 21772, 78, 21804, 78, 21834, 78, 21891, 78, 21897, 78, 21898, 78, 21901, 78, 21902, 78, 21923, 78, 21927, 78, 21929, 78, 21933, 78, 21934, 78, 21985, 78, 22532, 78, 22535, 78, 22560, 78, 22569, 78, 22573, 78, 22574, 78, 22603, 78, 22629, 78, 22635, 78, 22657, 78, 22658, 78, 22661, 78, 22662, 78, 22690, 78, 22696, 78, 22727, 78, 22729, 78, 22730, 78, 22734, 78, 22759, 78, 22761, 78, 22765, 78, 22766, 78, 22797, 78, 22825, 78, 22860, 78, 22863, 78, 22881, 78, 22891, 78, 22917, 78, 22918, 78, 22946, 78, 22952, 78, 22979, 78, 22983, 78, 22986, 78, 22990, 78, 23011, 78, 23018, 78, 23553, 78, 23554, 78, 23557, 78, 23567, 78, 23586, 78, 23590, 78, 23596, 78, 23623, 78, 23625, 78, 23626, 78, 23652, 78, 23655, 78, 23658, 78, 23684, 78, 23694, 78, 23752, 78, 23784, 78, 23788, 78, 23810, 78, 23814, 78, 23819, 78, 23820, 78, 23842, 78, 23851, 78, 23855, 78, 23882, 78, 23904, 78, 23914, 78, 23939, 78, 23971, 78, 23975, 78, 23977, 78, 23981, 78, 23982, 78, 24033, 78, 24579, 78, 24586, 78, 24589, 78, 24590, 78, 24612, 78, 24617, 78, 24621, 78, 24622, 78, 24652, 78, 24683, 78, 24705, 78, 24709, 78, 24710, 78, 24712, 78, 24742, 78, 24744, 78, 24772, 78, 24803, 78, 24804, 78, 24809, 78, 24810, 78, 24813, 78, 24814, 78, 24835, 78, 24839, 78, 24841, 78, 24864, 78, 24871, 78, 24873, 78, 24939, 78, 24943, 78, 24962, 78, 24965, 78, 24968, 78, 24993, 78, 24998, 78, 25000, 78, 25028, 78, 25060, 78, 25066, 78, 25069, 78, 25070, 78, 25615, 78, 25643, 78, 25735, 78, 25742, 78, 25763, 78, 25767, 78, 25770, 78, 25774, 78, 25804, 78, 25825, 78, 25871, 78, 25899, 78, 25903, 78, 25962, 78, 25987, 78, 25993, 78, 25994, 78, 25997, 78, 26020, 78, 26025, 78, 26029, 78, 26030, 78, 26049, 78, 26050, 78, 26056, 78, 26060, 78, 26628, 78, 26631, 78, 26633, 78, 26634, 78, 26637, 78, 26638, 78, 26669, 78, 26670, 78, 26689, 78, 26690, 78, 26694, 78, 26700, 78, 26721, 78, 26725, 78, 26731, 78, 26790, 78, 26823, 78, 26829, 78, 26851, 78, 26852, 78, 26880, 78, 26889, 78, 26921, 78, 26945, 78, 26949, 78, 26977, 78, 26987, 78, 26991, 78, 27010, 78, 27013, 78, 27014, 78, 27016, 78, 27042, 78, 27048, 78, 27076, 78, 27107, 78, 27111, 78, 27114, 78, 27117, 78, 27118, 78, 27663, 78, 27691, 78, 27695, 78, 27719, 78, 27779, 78, 27785, 78, 27786, 78, 27789, 78, 27812, 78, 27815, 78, 27817, 78, 27821, 78, 27841, 78, 27842, 78, 27848, 78, 27873, 78, 27910, 78, 27919, 78, 27938, 78, 27947, 78, 27972, 78, 27975, 78, 28000, 78, 28010, 78, 28035, 78, 28042, 78, 28045, 78, 28046, 78, 28067, 78, 28073, 78, 28097, 78, 28104, 78, 28108, 78, 28129, 78, 28705, 78, 28709, 78, 28743, 78, 28749, 78, 28832, 78, 28869, 78, 28897, 78, 28901, 78, 28930, 78, 28934, 78, 28936, 78, 28965, 78, 28966, 78, 28968, 78, 28971, 78, 28995, 78, 28999, 78, 29001, 78, 29028, 78, 29034, 78, 29038, 78, 29088, 78, 29091, 78, 29121, 78, 29125, 78, 29157, 78, 29703, 78, 29710, 78, 29731, 78, 29735, 78, 29738, 78, 29742, 78, 29772, 78, 29793, 78, 29830, 78, 29858, 78, 29892, 78, 29920, 78, 29927, 78, 29934, 78, 29962, 78, 29966, 78, 29988, 78, 29998, 78, 30018, 78, 30024, 78, 30031, 78, 30059, 78, 30113, 78, 30117, 78, 30157, 78, 30179, 78, 30185, 78, 30186, 78, 30731, 78, 30753, 78, 30757, 78, 30787, 78, 30851, 78, 30857, 78, 30858, 78, 30861, 78, 30862, 78, 30883, 78, 30887, 78, 30889, 78, 30893, 78, 30894, 78, 30924, 78, 30978, 78, 30982, 78, 30987, 78, 30991, 78, 31009, 78, 31010, 78, 31023, 78, 31043, 78, 31044, 78, 31047, 78, 31114, 78, 31117, 78, 31118, 78, 31143, 78, 31149, 78, 31150, 78, 31180, 78, 31747, 78, 31779, 78, 31780, 78, 31783, 78, 31809, 78, 31810, 78, 31823, 78, 31851, 78, 31884, 78, 31916, 78, 31943, 78, 31949, 78, 31950, 78, 31977, 78, 32195, 78, 32202, 78, 165, 85, 172, 85, 206, 85, 227, 85, 270, 85, 302, 85, 322, 85, 328, 85, 332, 85, 335, 85, 396, 85, 421, 85, 451, 85, 457, 85, 462, 85, 1057, 85, 1067, 85, 1123, 85, 1165, 85, 1184, 85, 1188, 85, 1191, 85, 1194, 85, 1197, 85, 1250, 85, 1253, 85, 1263, 85, 1291, 85, 1347, 85, 1353, 85, 1358, 85, 1487, 85, 2083, 85, 2087, 85, 2113, 85, 2114, 85, 2145, 85, 2155, 85, 2209, 85, 2220, 85, 2249, 85, 2250, 85, 2275, 85, 2307, 85, 2311, 85, 2314, 85, 2346, 85, 2369, 85, 2376, 85, 2380, 85, 2383, 85, 2401, 85, 2405, 85, 2411, 85, 2412, 85, 2444, 85, 2465, 85, 2503, 85, 2510, 85, 2531, 85, 2538, 85, 3073, 85, 3074, 85, 3106, 85, 3119, 85, 3168, 85, 3172, 85, 3175, 85, 3177, 85, 3178, 85, 3209, 85, 3210, 85, 3232, 85, 3236, 85, 3239, 85, 3245, 85, 3298, 85, 3301, 85, 3311, 85, 3330, 85, 3339, 85, 3362, 85, 3366, 85, 3371, 85, 3392, 85, 3396, 85, 3399, 85, 3401, 85, 3406, 85, 3434, 85, 3459, 85, 3491, 85, 3492, 85, 3497, 85, 3521, 85, 3522, 85, 3535, 85, 3553, 85, 4108, 85, 4111, 85, 4129, 85, 4133, 85, 4139, 85, 4140, 85, 4174, 85, 4195, 85, 4228, 85, 4231, 85, 4256, 85, 4266, 85, 4294, 85, 4322, 85, 4325, 85, 4332, 85, 4364, 85, 4396, 85, 4430, 85, 4490, 85, 4493, 85, 4494, 85, 4519, 85, 4525, 85, 4526, 85, 4546, 85, 4552, 85, 4556, 85, 4587, 85, 5133, 85, 5156, 85, 5159, 85, 5165, 85, 5196, 85, 5218, 85, 5221, 85, 5231, 85, 5253, 85, 5286, 85, 5316, 85, 5358, 85, 5412, 85, 5442, 85, 5448, 85, 5455, 85, 5483, 85, 5516, 85, 5519, 85, 5541, 85, 5548, 85, 5551, 85, 5581, 85, 5604, 85, 5609, 85, 5610, 85, 6177, 85, 6181, 85, 6243, 85, 6275, 85, 6307, 85, 6311, 85, 6313, 85, 6317, 85, 6318, 85, 6337, 85, 6338, 85, 6351, 85, 6369, 85, 6437, 85, 6444, 85, 6467, 85, 6474, 85, 7200, 85, 7207, 85, 7209, 85, 7247, 85, 7266, 85, 7269, 85, 7297, 85, 7298, 85, 7330, 85, 7336, 85, 7340, 85, 7360, 85, 7373, 85, 7374, 85, 7392, 85, 7396, 85, 7399, 85, 7405, 85, 7427, 85, 7456, 85, 7459, 85, 7489, 85, 7494, 85, 7521, 85, 7522, 85, 7531, 85, 7563, 85, 7585, 85, 7595, 85, 7625, 85, 7626, 85, 7651, 85, 8204, 85, 8207, 85, 8270, 85, 8324, 85, 8327, 85, 8356, 85, 8361, 85, 8365, 85, 8366, 85, 8390, 85, 8428, 85, 8431, 85, 8450, 85, 8454, 85, 8456, 85, 8495, 85, 8516, 85, 8519, 85, 8525, 85, 8548, 85, 8558, 85, 8579, 85, 8580, 85, 8585, 85, 8612, 85, 8621, 85, 8622, 85, 8646, 85, 8684, 85, 8687, 85, 9229, 85, 9257, 85, 9292, 85, 9313, 85, 9349, 85, 9381, 85, 9384, 85, 9388, 85, 9412, 85, 9440, 85, 9447, 85, 9454, 85, 9475, 85, 9481, 85, 9486, 85, 9537, 85, 9542, 85, 9580, 85, 9612, 85, 9643, 85, 9671, 85, 9677, 85, 9699, 85, 9705, 85, 9706, 85, 10251, 85, 10313, 85, 10314, 85, 10339, 85, 10475, 85, 10498, 85, 10502, 85, 10507, 85, 10511, 85, 10534, 85, 10560, 85, 10567, 85, 10569, 85, 10592, 85, 10595, 85, 10602, 85, 10634, 85, 10637, 85, 10638, 85, 10660, 85, 10690, 85, 10696, 85, 10700, 85, 10731, 85, 11273, 85, 11274, 85, 11299, 85, 11336, 85, 11362, 85, 11365, 85, 11407, 85, 11425, 85, 11463, 85, 11469, 85, 11470, 85, 11497, 85, 11498, 85, 11523, 85, 11530, 85, 11585, 85, 11590, 85, 11592, 85, 11596, 85, 11599, 85, 11617, 85, 11618, 85, 11627, 85, 11726, 85, 11747, 85, 12324, 85, 12329, 85, 12333, 85, 12334, 85, 12358, 85, 12385, 85, 12396, 85, 12399, 85, 12454, 85, 12456, 85, 12512, 85, 12519, 85, 12548, 85, 12557, 85, 12590, 85, 12614, 85, 12651, 85, 12652, 85, 12674, 85, 12677, 85, 12678, 85, 12680, 85, 12709, 85, 12736, 85, 12740, 85, 12771, 85, 12772, 85, 12777, 85, 12781, 85, 12782, 85, 13317, 85, 13349, 85, 13352, 85, 13356, 85, 13415, 85, 13422, 85, 13570, 85, 13576, 85, 13583, 85, 13611, 85, 13612, 85, 13639, 85, 13673, 85, 13678, 85, 13700, 85, 13703, 85, 13731, 85, 13732, 85, 13738, 85, 13741, 85, 13742, 85, 13765, 85, 13794, 85, 13797, 85, 14372, 85, 14401, 85, 14402, 85, 14415, 85, 14443, 85, 14497, 85, 14501, 85, 14507, 85, 14508, 85, 14511, 85, 14535, 85, 14541, 85, 14564, 85, 14569, 85, 14596, 85, 14602, 85, 14606, 85, 14662, 85, 14664, 85, 14668, 85, 14671, 85, 14690, 85, 14731, 85, 14732, 85, 14735, 85, 14787, 85, 14793, 85, 14798, 85, 15361, 85, 15362, 85, 15375, 85, 15397, 85, 15403, 85, 15437, 85, 15463, 85, 15466, 85, 15495, 85, 15502, 85, 15520, 85, 15524, 85, 15527, 85, 15530, 85, 15533, 85, 15558, 85, 15592, 85, 15596, 85, 15628, 85, 15649, 85, 15687, 85, 15722, 85, 15747, 85, 15754, 85, 15809, 85, 15816, 85, 15820, 85, 15841, 85, 16397, 85, 16398, 85, 16419, 85, 16423, 85, 16425, 85, 16430, 85, 16463, 85, 16491, 85, 16517, 85, 16518, 85, 16546, 85, 16552, 85, 16583, 85, 16589, 85, 16615, 85, 16617, 85, 16618, 85, 16622, 85, 16643, 85, 16647, 85, 16649, 85, 16681, 85, 16706, 85, 16710, 85, 16712, 85, 16738, 85, 16741, 85, 16742, 85, 16747, 85, 16751, 85, 16770, 85, 16773, 85, 16776, 85, 16802, 85, 16835, 85, 16839, 85, 16841, 85, 16845, 85, 16867, 85, 16871, 85, 16874, 85, 16877, 85, 16878, 85, 17423, 85, 17441, 85, 17445, 85, 17451, 85, 17455, 85, 17481, 85, 17482, 85, 17507, 85, 17543, 85, 17550, 85, 17568, 85, 17578, 85, 17582, 85, 17601, 85, 17602, 85, 17634, 85, 17637, 85, 17647, 85, 17679, 85, 17697, 85, 17701, 85, 17702, 85, 17707, 85, 17711, 85, 17731, 85, 17737, 85, 17742, 85, 17770, 85, 17795, 85, 17801, 85, 17802, 85, 17805, 85, 17827, 85, 17831, 85, 17833, 85, 17837, 85, 17838, 85, 17871, 85, 17889, 85, 18441, 85, 18442, 85, 18445, 85, 18474, 85, 18497, 85, 18498, 85, 18502, 85, 18511, 85, 18530, 85, 18534, 85, 18540, 85, 18543, 85, 18561, 85, 18562, 85, 18566, 85, 18600, 85, 18631, 85, 18633, 85, 18634, 85, 18638, 85, 18663, 85, 18665, 85, 18666, 85, 18669, 85, 18670, 85, 18753, 85, 18757, 85, 18760, 85, 18792, 85, 18817, 85, 18824, 85, 18884, 85, 18893, 85, 18912, 85, 18921, 85, 19457, 85, 19458, 85, 19461, 85, 19471, 85, 19490, 85, 19494, 85, 19500, 85, 19529, 85, 19530, 85, 19552, 85, 19556, 85, 19559, 85, 19561, 85, 19562, 85, 19591, 85, 19593, 85, 19594, 85, 19597, 85, 19616, 85, 19630, 85, 19649, 85, 19650, 85, 19682, 85, 19685, 85, 19695, 85, 19713, 85, 19717, 85, 19727, 85, 19752, 85, 19776, 85, 19780, 85, 19783, 85, 19785, 85, 19790, 85, 19817, 85, 19822, 85, 19844, 85, 19847, 85, 19849, 85, 19850, 85, 19853, 85, 19854, 85, 19872, 85, 19882, 85, 19905, 85, 19906, 85, 19919, 85, 19938, 85, 19941, 85, 20492, 85, 20495, 85, 20513, 85, 20517, 85, 20523, 85, 20524, 85, 20612, 85, 20615, 85, 20640, 85, 20650, 85, 20684, 85, 20705, 85, 20709, 85, 20716, 85, 20747, 85, 20751, 85, 20773, 85, 20774, 85, 20783, 85, 20810, 85, 20814, 85, 20836, 85, 20867, 85, 20868, 85, 20871, 85, 20873, 85, 20896, 85, 20899, 85, 20905, 85, 20906, 85, 20940, 85, 20965, 85, 20971, 85, 20972, 85, 20975, 85, 21507, 85, 21513, 85, 21517, 85, 21539, 85, 21540, 85, 21543, 85, 21545, 85, 21549, 85, 21583, 85, 21601, 85, 21634, 85, 21637, 85, 21640, 85, 21666, 85, 21670, 85, 21672, 85, 21703, 85, 21709, 85, 21710, 85, 21728, 85, 21732, 85, 21735, 85, 21741, 85, 21796, 85, 21835, 85, 21900, 85, 21903, 85, 21925, 85, 21932, 85, 21935, 85, 21955, 85, 21961, 85, 21962, 85, 21987, 85, 22539, 85, 22566, 85, 22571, 85, 22572, 85, 22575, 85, 22595, 85, 22627, 85, 22628, 85, 22660, 85, 22663, 85, 22665, 85, 22666, 85, 22669, 85, 22670, 85, 22688, 85, 22698, 85, 22735, 85, 22753, 85, 22757, 85, 22764, 85, 22767, 85, 22789, 85, 22799, 85, 22824, 85, 22827, 85, 22851, 85, 22852, 85, 22855, 85, 22858, 85, 22862, 85, 22880, 85, 22883, 85, 22887, 85, 22890, 85, 22894, 85, 22915, 85, 22916, 85, 22919, 85, 22922, 85, 22925, 85, 22926, 85, 22944, 85, 22947, 85, 22953, 85, 22954, 85, 22991, 85, 23013, 85, 23019, 85, 23020, 85, 23559, 85, 23584, 85, 23593, 85, 23597, 85, 23617, 85, 23618, 85, 23650, 85, 23653, 85, 23681, 85, 23682, 85, 23692, 85, 23714, 85, 23718, 85, 23720, 85, 23751, 85, 23776, 85, 23780, 85, 23783, 85, 23789, 85, 23811, 85, 23840, 85, 23843, 85, 23847, 85, 23874, 85, 23883, 85, 23905, 85, 23906, 85, 23915, 85, 23947, 85, 23969, 85, 23979, 85, 23980, 85, 24003, 85, 24035, 85, 24588, 85, 24591, 85, 24619, 85, 24620, 85, 24623, 85, 24643, 85, 24649, 85, 24654, 85, 24708, 85, 24711, 85, 24739, 85, 24743, 85, 24746, 85, 24770, 85, 24774, 85, 24776, 85, 24812, 85, 24815, 85, 24834, 85, 24838, 85, 24840, 85, 24869, 85, 24870, 85, 24872, 85, 24875, 85, 24899, 85, 24900, 85, 24903, 85, 24905, 85, 24909, 85, 24932, 85, 24942, 85, 24963, 85, 24964, 85, 24969, 85, 24999, 85, 25001, 85, 25002, 85, 25026, 85, 25030, 85, 25032, 85, 25068, 85, 25071, 85, 25679, 85, 25707, 85, 25740, 85, 25761, 85, 25765, 85, 25772, 85, 25799, 85, 25805, 85, 25806, 85, 25827, 85, 25833, 85, 25834, 85, 25866, 85, 25870, 85, 25892, 85, 25902, 85, 25922, 85, 25928, 85, 25932, 85, 25935, 85, 25963, 85, 25996, 85, 26027, 85, 26028, 85, 26031, 85, 26062, 85, 26636, 85, 26639, 85, 26662, 85, 26667, 85, 26668, 85, 26671, 85, 26695, 85, 26697, 85, 26698, 85, 26723, 85, 26755, 85, 26761, 85, 26762, 85, 26765, 85, 26766, 85, 26791, 85, 26793, 85, 26797, 85, 26798, 85, 26828, 85, 26859, 85, 26885, 85, 26888, 85, 26920, 85, 26923, 85, 26944, 85, 26953, 85, 26957, 85, 26976, 85, 26979, 85, 26983, 85, 26986, 85, 27011, 85, 27012, 85, 27015, 85, 27017, 85, 27040, 85, 27043, 85, 27049, 85, 27050, 85, 27074, 85, 27078, 85, 27080, 85, 27115, 85, 27116, 85, 27651, 85, 27683, 85, 27684, 85, 27687, 85, 27713, 85, 27714, 85, 27727, 85, 27745, 85, 27755, 85, 27791, 85, 27809, 85, 27813, 85, 27823, 85, 27875, 85, 27907, 85, 27908, 85, 27914, 85, 27918, 85, 27936, 85, 27939, 85, 27943, 85, 27950, 85, 27969, 85, 27974, 85, 27976, 85, 27980, 85, 27983, 85, 28001, 85, 28002, 85, 28011, 85, 28044, 85, 28047, 85, 28065, 85, 28069, 85, 28075, 85, 28076, 85, 28110, 85, 28131, 85, 28681, 85, 28682, 85, 28685, 85, 28686, 85, 28708, 85, 28713, 85, 28717, 85, 28718, 85, 28748, 85, 28779, 85, 28801, 85, 28802, 85, 28805, 85, 28806, 85, 28838, 85, 28840, 85, 28868, 85, 28899, 85, 28900, 85, 28905, 85, 28906, 85, 28909, 85, 28910, 85, 28932, 85, 28941, 85, 28970, 85, 28973, 85, 28994, 85, 28998, 85, 29000, 85, 29036, 85, 29058, 85, 29061, 85, 29062, 85, 29064, 85, 29089, 85, 29094, 85, 29124, 85, 29156, 85, 29162, 85, 29165, 85, 29166, 85, 29708, 85, 29729, 85, 29733, 85, 29740, 85, 29773, 85, 29774, 85, 29795, 85, 29801, 85, 29828, 85, 29856, 85, 29893, 85, 29894, 85, 29922, 85, 29925, 85, 29928, 85, 29932, 85, 29963, 85, 29964, 85, 29996, 85, 30019, 85, 30025, 85, 30030, 85, 30083, 85, 30089, 85, 30090, 85, 30093, 85, 30094, 85, 30116, 85, 30121, 85, 30125, 85, 30126, 85, 30146, 85, 30152, 85, 30156, 85, 30756, 85, 30795, 85, 30881, 85, 30885, 85, 30891, 85, 30892, 85, 30895, 85, 30915, 85, 30921, 85, 30922, 85, 30926, 85, 30980, 85, 30986, 85, 30990, 85, 31022, 85, 31042, 85, 31046, 85, 31051, 85, 31052, 85, 31055, 85, 31115, 85, 31116, 85, 31119, 85, 31141, 85, 31178, 85, 31182, 85, 31755, 85, 31777, 85, 31781, 85, 31817, 85, 31818, 85, 31843, 85, 31875, 85, 31881, 85, 31882, 85, 31885, 85, 31907, 85, 31908, 85, 31911, 85, 31913, 85, 31917, 85, 31937, 85, 31938, 85, 31969, 85, 32067, 85, 32074, 85, 207, 93, 235, 93, 300, 93, 334, 93, 420, 93, 463, 93, 1103, 93, 1131, 93, 1167, 93, 1189, 93, 1199, 93, 1223, 93, 1229, 93, 1230, 93, 1257, 93, 1258, 93, 1419, 93, 1475, 93, 1481, 93, 1482, 93, 2085, 93, 2147, 93, 2212, 93, 2283, 93, 2310, 93, 2316, 93, 2337, 93, 2338, 93, 2372, 93, 2375, 93, 2382, 93, 2400, 93, 2403, 93, 2410, 93, 2511, 93, 2539, 93, 3108, 93, 3111, 93, 3151, 93, 3170, 93, 3173, 93, 3237, 93, 3247, 93, 3271, 93, 3305, 93, 3306, 93, 3331, 93, 3360, 93, 3363, 93, 3393, 93, 3398, 93, 3425, 93, 3426, 93, 3435, 93, 3467, 93, 3489, 93, 3499, 93, 3529, 93, 3530, 93, 3555, 93, 4175, 93, 4203, 93, 4295, 93, 4301, 93, 4329, 93, 4330, 93, 4388, 93, 4427, 93, 4491, 93, 4492, 93, 4495, 93, 4517, 93, 4524, 93, 4527, 93, 4547, 93, 4553, 93, 5135, 93, 5157, 93, 5167, 93, 5191, 93, 5197, 93, 5198, 93, 5225, 93, 5226, 93, 5255, 93, 5262, 93, 5294, 93, 5317, 93, 5318, 93, 5352, 93, 5356, 93, 5387, 93, 5443, 93, 5449, 93, 5454, 93, 5507, 93, 5513, 93, 5514, 93, 5539, 93, 5540, 93, 5545, 93, 5569, 93, 5570, 93, 5576, 93, 5580, 93, 5601, 93, 6180, 93, 6219, 93, 6283, 93, 6305, 93, 6309, 93, 6315, 93, 6316, 93, 6319, 93, 6345, 93, 6346, 93, 7179, 93, 7205, 93, 7211, 93, 7239, 93, 7241, 93, 7242, 93, 7305, 93, 7306, 93, 7328, 93, 7332, 93, 7335, 93, 7338, 93, 7341, 93, 7368, 93, 7397, 93, 7407, 93, 7457, 93, 7498, 93, 7523, 93, 7659, 93, 8271, 93, 8299, 93, 8363, 93, 8364, 93, 8367, 93, 8391, 93, 8397, 93, 8419, 93, 8425, 93, 8426, 93, 8484, 93, 8494, 93, 8518, 93, 8555, 93, 8556, 93, 8620, 93, 8623, 93, 8647, 93, 8653, 93, 8682, 93, 9231, 93, 9259, 93, 9287, 93, 9293, 93, 9294, 93, 9315, 93, 9321, 93, 9322, 93, 9351, 93, 9358, 93, 9379, 93, 9386, 93, 9413, 93, 9414, 93, 9442, 93, 9445, 93, 9448, 93, 9452, 93, 9578, 93, 9603, 93, 9609, 93, 9610, 93, 9665, 93, 9666, 93, 9672, 93, 9676, 93, 10379, 93, 10435, 93, 10441, 93, 10442, 93, 10500, 93, 10506, 93, 10510, 93, 10566, 93, 10568, 93, 10572, 93, 10575, 93, 10594, 93, 10635, 93, 10636, 93, 10639, 93, 10691, 93, 10697, 93, 10702, 93, 11335, 93, 11395, 93, 11401, 93, 11402, 93, 11457, 93, 11458, 93, 11464, 93, 11489, 93, 11598, 93, 11619, 93, 11727, 93, 11755, 93, 12331, 93, 12332, 93, 12335, 93, 12359, 93, 12365, 93, 12387, 93, 12393, 93, 12394, 93, 12451, 93, 12455, 93, 12458, 93, 12485, 93, 12514, 93, 12517, 93, 12520, 93, 12555, 93, 12559, 93, 12588, 93, 12611, 93, 12617, 93, 12650, 93, 12675, 93, 12676, 93, 12679, 93, 12681, 93, 12708, 93, 12717, 93, 12718, 93, 12737, 93, 12780, 93, 12783, 93, 13319, 93, 13326, 93, 13347, 93, 13354, 93, 13381, 93, 13382, 93, 13410, 93, 13413, 93, 13416, 93, 13420, 93, 13446, 93, 13474, 93, 13571, 93, 13577, 93, 13582, 93, 13633, 93, 13638, 93, 13676, 93, 13697, 93, 13698, 93, 13704, 93, 13729, 93, 13740, 93, 13743, 93, 13760, 93, 13764, 93, 13796, 93, 13805, 93, 13806, 93, 14347, 93, 14409, 93, 14410, 93, 14435, 93, 14467, 93, 14473, 93, 14474, 93, 14477, 93, 14478, 93, 14500, 93, 14529, 93, 14530, 93, 14536, 93, 14540, 93, 14561, 93, 14604, 93, 14659, 93, 14670, 93, 14799, 93, 15369, 93, 15370, 93, 15395, 93, 15432, 93, 15458, 93, 15461, 93, 15489, 93, 15490, 93, 15496, 93, 15500, 93, 15525, 93, 15535, 93, 15552, 93, 15584, 93, 15588, 93, 15591, 93, 15597, 93, 15619, 93, 15626, 93, 15681, 93, 15686, 93, 15688, 93, 15692, 93, 15695, 93, 15713, 93, 15714, 93, 15723, 93, 15822, 93, 15843, 93, 16396, 93, 16399, 93, 16417, 93, 16421, 93, 16427, 93, 16428, 93, 16516, 93, 16519, 93, 16544, 93, 16554, 93, 16588, 93, 16609, 93, 16613, 93, 16620, 93, 16642, 93, 16646, 93, 16648, 93, 16673, 93, 16674, 93, 16680, 93, 16683, 93, 16746, 93, 16750, 93, 16771, 93, 16772, 93, 16777, 93, 16800, 93, 16803, 93, 16809, 93, 16810, 93, 16844, 93, 16869, 93, 16875, 93, 16876, 93, 16879, 93, 17515, 93, 17548, 93, 17580, 93, 17641, 93, 17642, 93, 17674, 93, 17678, 93, 17710, 93, 17771, 93, 17804, 93, 17825, 93, 17829, 93, 17835, 93, 17836, 93, 17839, 93, 17859, 93, 17865, 93, 17866, 93, 17891, 93, 18433, 93, 18434, 93, 18437, 93, 18438, 93, 18444, 93, 18447, 93, 18466, 93, 18503, 93, 18535, 93, 18564, 93, 18567, 93, 18569, 93, 18570, 93, 18573, 93, 18574, 93, 18592, 93, 18639, 93, 18657, 93, 18661, 93, 18668, 93, 18671, 93, 18689, 93, 18696, 93, 18886, 93, 18892, 93, 18913, 93, 18914, 93, 19463, 93, 19501, 93, 19521, 93, 19522, 93, 19554, 93, 19557, 93, 19599, 93, 19628, 93, 19657, 93, 19658, 93, 19689, 93, 19690, 93, 19719, 93, 19722, 93, 19726, 93, 19753, 93, 19754, 93, 19777, 93, 19782, 93, 19813, 93, 19814, 93, 19820, 93, 19852, 93, 19855, 93, 19913, 93, 19914, 93, 19940, 93, 19945, 93, 19946, 93, 20686, 93, 20707, 93, 20746, 93, 20750, 93, 20782, 93, 20897, 93, 20902, 93, 20907, 93, 20938, 93, 20964, 93, 21519, 93, 21537, 93, 21541, 93, 21547, 93, 21551, 93, 21571, 93, 21578, 93, 21603, 93, 21639, 93, 21646, 93, 21664, 93, 21674, 93, 21678, 93, 21697, 93, 21704, 93, 21730, 93, 21733, 93, 21743, 93, 21924, 93, 21995, 93, 22531, 93, 22563, 93, 22567, 93, 22668, 93, 22671, 93, 22694, 93, 22723, 93, 22756, 93, 22787, 93, 22791, 93, 22794, 93, 22798, 93, 22819, 93, 22826, 93, 22854, 93, 22882, 93, 22924, 93, 22927, 93, 22945, 93, 22955, 93, 23563, 93, 23595, 93, 23599, 93, 23687, 93, 23689, 93, 23690, 93, 23693, 93, 23712, 93, 23722, 93, 23726, 93, 23745, 93, 23746, 93, 23759, 93, 23781, 93, 23791, 93, 23841, 93, 23845, 93, 23846, 93, 23852, 93, 23875, 93, 23907, 93, 23972, 93, 24011, 93, 24043, 93, 24655, 93, 24737, 93, 24741, 93, 24775, 93, 24781, 93, 24874, 93, 24877, 93, 24898, 93, 24902, 93, 24904, 93, 24940, 93, 24997, 93, 25003, 93, 25027, 93, 25031, 93, 25033, 93, 25037, 93, 25667, 93, 25674, 93, 25741, 93, 25769, 93, 25793, 93, 25800, 93, 25867, 93, 25900, 93, 25923, 93, 25929, 93, 25934, 93, 26063, 93, 26091, 93, 26627, 93, 26659, 93, 26663, 93, 26703, 93, 26764, 93, 26767, 93, 26785, 93, 26789, 93, 26796, 93, 26799, 93, 26819, 93, 26825, 93, 26826, 93, 26830, 93, 26883, 93, 26887, 93, 26893, 93, 26915, 93, 26922, 93, 26952, 93, 26978, 93, 26981, 93, 26982, 93, 26988, 93, 27041, 93, 27051, 93, 27075, 93, 27079, 93, 27081, 93, 27085, 93, 27108, 93, 27659, 93, 27685, 93, 27721, 93, 27722, 93, 27747, 93, 27855, 93, 27883, 93, 27916, 93, 27937, 93, 27982, 93, 28003, 93, 28111, 93, 28139, 93, 28684, 93, 28687, 93, 28715, 93, 28716, 93, 28719, 93, 28739, 93, 28746, 93, 28750, 93, 28804, 93, 28807, 93, 28835, 93, 28839, 93, 28842, 93, 28865, 93, 28870, 93, 28872, 93, 28908, 93, 28911, 93, 28939, 93, 28943, 93, 28975, 93, 29059, 93, 29060, 93, 29063, 93, 29065, 93, 29095, 93, 29097, 93, 29098, 93, 29122, 93, 29128, 93, 29163, 93, 29164, 93, 29167, 93, 29699, 93, 29706, 93, 29709, 93, 29737, 93, 29825, 93, 29829, 93, 29832, 93, 29864, 93, 30092, 93, 30095, 93, 30123, 93, 30124, 93, 30127, 93, 30884, 93, 30927, 93, 30988, 93, 31013, 93, 31014, 93, 31020, 93, 31050, 93, 31054, 93, 31140, 93, 31179, 93, 31183, 93, 31887, 93, 31905, 93, 31909, 93, 31915, 93, 31919, 93, 195, 100, 202, 100, 331, 100, 458, 100, 1035, 100, 1097, 100, 1098, 100, 1161, 100, 1187, 100, 1193, 100, 1217, 100, 1218, 100, 1249, 100, 1354, 100, 2123, 100, 2243, 100, 2374, 100, 2402, 100, 2499, 100, 2506, 100, 3083, 100, 3109, 100, 3115, 100, 3145, 100, 3146, 100, 3203, 100, 3241, 100, 3265, 100, 3266, 100, 3297, 100, 3361, 100, 3402, 100, 4163, 100, 4170, 100, 4227, 100, 4234, 100, 4237, 100, 4238, 100, 4259, 100, 4263, 100, 4265, 100, 4270, 100, 4289, 100, 4296, 100, 4300, 100, 4321, 100, 4426, 100, 4516, 100, 5123, 100, 5129, 100, 5155, 100, 5161, 100, 5186, 100, 5217, 100, 5250, 100, 5256, 100, 5260, 100, 5282, 100, 5288, 100, 5292, 100, 5312, 100, 5344, 100, 5348, 100, 5351, 100, 5357, 100, 5603, 100, 6211, 100, 6308, 100, 7171, 100, 7203, 100, 7233, 100, 7234, 100, 7275, 100, 7367, 100, 7401, 100, 7490, 100, 7499, 100, 7619, 100, 8203, 100, 8259, 100, 8265, 100, 8329, 100, 8333, 100, 8334, 100, 8386, 100, 8392, 100, 8396, 100, 8459, 100, 8463, 100, 8492, 100, 8515, 100, 8521, 100, 8586, 100, 8589, 100, 8642, 100, 8648, 100, 8652, 100, 9219, 100, 9226, 100, 9281, 100, 9288, 100, 9345, 100, 9352, 100, 9356, 100, 9377, 100, 9482, 100, 9538, 100, 9544, 100, 9548, 100, 9551, 100, 9579, 100, 9678, 100, 10307, 100, 10508, 100, 10563, 100, 11267, 100, 11329, 100, 11330, 100, 11343, 100, 11361, 100, 11371, 100, 11491, 100, 11715, 100, 11722, 100, 12297, 100, 12298, 100, 12301, 100, 12302, 100, 12354, 100, 12364, 100, 12417, 100, 12418, 100, 12421, 100, 12422, 100, 12449, 100, 12453, 100, 12480, 100, 12484, 100, 12516, 100, 12525, 100, 12526, 100, 12554, 100, 12558, 100, 12610, 100, 12616, 100, 12623, 100, 12749, 100, 12778, 100, 13313, 100, 13320, 100, 13324, 100, 13345, 100, 13444, 100, 13472, 100, 13479, 100, 13486, 100, 13580, 100, 13709, 100, 13710, 100, 13737, 100, 14542, 100, 14658, 100, 14667, 100, 14794, 100, 15393, 100, 15501, 100, 15523, 100, 15529, 100, 16579, 100, 16586, 100, 16590, 100, 16611, 100, 16685, 100, 16715, 100, 16716, 100, 16719, 100, 16748, 100, 16806, 100, 16842, 100, 16846, 100, 16868, 100, 17419, 100, 17545, 100, 17549, 100, 17571, 100, 17572, 100, 17575, 100, 17577, 100, 17581, 100, 17633, 100, 17675, 100, 17708, 100, 17738, 100, 17828, 100, 18477, 100, 18507, 100, 18529, 100, 18533, 100, 18539, 100, 18598, 100, 18627, 100, 18659, 100, 18660, 100, 18701, 100, 18729, 100, 18764, 100, 18767, 100, 18785, 100, 18795, 100, 18822, 100, 18850, 100, 18883, 100, 18887, 100, 18890, 100, 18894, 100, 18915, 100, 18919, 100, 18922, 100, 18926, 100, 19467, 100, 19499, 100, 19503, 100, 19587, 100, 19620, 100, 19623, 100, 19625, 100, 19629, 100, 19681, 100, 19714, 100, 19718, 100, 19723, 100, 19724, 100, 19746, 100, 19755, 100, 19759, 100, 19786, 100, 19818, 100, 19843, 100, 19875, 100, 19881, 100, 19885, 100, 19937, 100, 20611, 100, 20618, 100, 20621, 100, 20622, 100, 20643, 100, 20647, 100, 20649, 100, 20654, 100, 20687, 100, 20715, 100, 20748, 100, 20780, 100, 20874, 100, 20877, 100, 20878, 100, 20903, 100, 20909, 100, 20910, 100, 20939, 100, 21611, 100, 21644, 100, 21676, 100, 21737, 100, 21738, 100, 22561, 100, 22565, 100, 22659, 100, 22691, 100, 22695, 100, 22697, 100, 22701, 100, 22702, 100, 22731, 100, 22790, 100, 22796, 100, 22817, 100, 22818, 100, 22951, 100, 22958, 100, 23555, 100, 23587, 100, 23591, 100, 23627, 100, 23659, 100, 23724, 100, 23753, 100, 23754, 100, 23785, 100, 24587, 100, 24713, 100, 24717, 100, 24718, 100, 24740, 100, 24745, 100, 24749, 100, 24750, 100, 24780, 100, 24843, 100, 24847, 100, 24879, 100, 24970, 100, 24973, 100, 24996, 100, 25005, 100, 25006, 100, 25036, 100, 25743, 100, 25771, 100, 25995, 100, 26051, 100, 26057, 100, 26058, 100, 26635, 100, 26661, 100, 26691, 100, 26788, 100, 26882, 100, 26886, 100, 26891, 100, 26895, 100, 26913, 100, 26914, 100, 26927, 100, 26947, 100, 26951, 100, 27018, 100, 27021, 100, 27022, 100, 27053, 100, 27084, 100, 27787, 100, 27843, 100, 27849, 100, 27850, 100, 28099, 100, 28106, 100, 28751, 100, 28833, 100, 28837, 100, 28871, 100, 28877, 100, 28938, 100, 28942, 100, 28974, 100, 29003, 100, 29007, 100, 29093, 100, 29123, 100, 29129, 100, 29133, 100, 29711, 100, 29739, 100, 29831, 100, 29838, 100, 29859, 100, 29863, 100, 29866, 100, 29870, 100];



	var max_score = 0;
	var mask = 0;
	
	switch (difficulty)
	{
		// ниска трудност
		case DIFFICULTY_LOW:
			var n = random(0,(easyPairs.length>>1) - 1);
			mask = easyPairs[2*n];
			max_score = easyPairs[2*n+1]/100;
			break;
			
		// средна трудност
		case DIFFICULTY_MEDIUM:
			var n = random(0,(mediumPairs.length>>1) - 1);
			mask = mediumPairs[2*n];
			max_score = mediumPairs[2*n+1]/100;
			break;
			
		// висока трудност
		case DIFFICULTY_HIGH:
			var n = random(0,(hardPairs.length>>1) - 1);
			mask = hardPairs[2*n];
			max_score = hardPairs[2*n+1]/100;
			break;
			
		default: console.error('Unknown difficulty level');
	}

	this.config.targetMask = mask;
	this.config.max_score = max_score;
	//console.log('max_score',max_score);
	
	if (!SCORE_STATISTICS)
	{
		mask = this.config.targetMask;
		for (var i=1; i<=15; i++) 
		{
			if (i!=5 && i!=10)
				this.hints[i].visible = (mask%2>0);
			mask = mask>>1;
		}
		this.sendStartup();
	}
}


// извежда статистика за шъзмовните конфигурации
MEIRO.Models.T003.prototype.configureStats = function()
{	
	//this.generateArrays();
	
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
			if (isNaN(that.config.max_score)) console.log('FOUND NAN',that.config.max_score);
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
}


MEIRO.Models.T003.prototype.generateArrays = function()
{	
	var sym = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
	var asym = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
	for (var i=1; i< (1<<15); i++)
	{
		if (i & (1<<4)) continue;
		if (i & (1<<9)) continue;
		var b = this.evaluateMask(i);
		if (this.symmetricMask(i))
			sym[b].push(i);
		else
			asym[b].push(i);
	}
	console.log('n asym sym');
	for (var i=1; i<sym.length; i++) console.log(i,asym[i].length,sym[i].length);
//console.log(sym[6][0]);	
//console.log(asym[6][0]);
	
	console.log('EASY Sym2..Sym5');
	var easy = [];
	for (var i=2; i<=5; i++)
	for (var j=0; j<sym[i].length; j++)
		easy.push( sym[i][j],Math.round(10+10*(i-2)/3) );
	
	console.log('MEDIUM Sym6..Sym10');
	var medium = [];
	for (var i=6; i<=10; i++)
	for (var j=0; j<sym[i].length; j++)
		medium.push( sym[i][j],Math.round(30+10*(i-6)/4) );

	console.log('HARD Sym11..Sym30 + Asym8..Asym30');
	var hard = [];
	for (var i=11; i<=16; i++)
	for (var j=0; j<sym[i].length; j++)
		hard.push( sym[i][j],Math.round(Math.min(100, 70+30*(i-11)/5)) );  //max in 13
	for (var i=8; i<=12; i++)
	for (var j=0; j<asym[i].length; j++)
		hard.push( asym[i][j],Math.round(Math.min(100,70+30*(i-8)/4)) ); // max in 12
	
	document.write('<br>easyPairs = ['+easy.join(', ')+'];');
	document.write('<br>mediumPairs = ['+medium.join(', ')+'];');
	document.write('<br>hardPairs = ['+hard.join(', ')+'];');
	/*
	for (var i=1; i<=12; i++) console.log('sym['+i+']=['+sym[i].join(',')+'];');
	*/
	console.log('mask score=',this.evaluateMask(this.config.targetMask));
}