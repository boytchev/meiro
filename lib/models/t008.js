
var SCORE_STATISTICS = !true;
var IN_SCORE_STATISTICS = false;

//	Основи на Компютърната Графика
//	Тест 008 - Подразделен тор
//	П. Бойчев, 2019
//
//	 ├─ T008
//	 │   ├─ initialize()
//	 │   ├─ construct()
//	 │   │    ├─ constructFloor()
//	 │   │    ├─ constructBase()
//	 │   │    ├─ constructTorus()
//	 │   │    │    └─ constructGraphTexture()
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
MEIRO.Models.T008 = function T008(room, model)
{
	MEIRO.Model.apply(this, arguments);
	
	this.initialize();
	this.construct();
}
MEIRO.Models.T008.prototype = Object.create(MEIRO.Model.prototype);



MEIRO.Models.T008.DIST = {MIN:1, MAX:22, HEIGHT:0};
MEIRO.Models.T008.POS = {DIST:22, ROT_X:0.9, ROT_Y:0.15, ON_FLOOR:true};
MEIRO.Models.T008.ROT_Y = {MIN:0.0, MAX:1.56};
MEIRO.Models.T008.SCALE = {MAX:0.25};
MEIRO.Models.T008.COMPETENCES = [1,0,5,5,4, 2,0,2,0, 0,0,0, 0,1,5,1,0];



MEIRO.Models.T008.prototype.initialize = function()
{
	if (SCORE_STATISTICS) this.configureStats();
	
	random.randomize();

	this.TORUS_RADIUS = 2.5;
	this.TORUS_TUBE_RADIUS = 1.5;
	this.TORUS_HEIGHT = 6;
	
	this.FLOOR_SIZE = 12;
	this.BASE_SIZE = 10;
	this.BASE_HEIGHT = 1;
	
	this.SPHERE_RADIUS = this.TORUS_RADIUS+this.TORUS_TUBE_RADIUS+1;

	this.magicIntro = new Audio('sounds/magic-intro.mp3');
	this.magicIntro.volume = 0;
	this.magicIntro.loop = false;
	//this.magicIntro.pause();
	
	this.distanceToTarget = 10000;

	this.clickMusic = new Audio('sounds/glass-chime.mp3');
	this.clickMusic.pause();
	
	this.fanSound = new Audio('sounds/fan.mp3');
	this.fanSound.volume = 0;
	this.fanSound.loop = false;
	this.fanSound.currentTime = 0;
	//this.fanSound.autoplay = true;
	this.fanSound.pause();
	
	this.playing = false;
	this.startTime = 0;
	this.lastTime = 0;
	this.clicks = 0;
}

	

MEIRO.Models.T008.prototype.construct = function()
{
	// допълнителна светлина, прави пода по-красив
	var light = new THREE.PointLight( 'white', 1 );
	light.position.set( 0, this.TORUS_HEIGHT, 20 );
	this.image.add( light );
	var light = new THREE.PointLight( 'white', 1 );
	light.position.set( 0, this.TORUS_HEIGHT, -20 );
	this.image.add( light );
	

	this.laserLight = new THREE.PointLight( 'white', 3, 0.5 );
	this.laserPoint = new THREE.Mesh(
		new THREE.SphereBufferGeometry(0.05,10,10),
		new THREE.MeshStandardMaterial({color:'orange',metalness:0.7})
	);
	//this.laserPoint2 = new THREE.Mesh(
	//	new THREE.SphereBufferGeometry(0.1,20,20),
	//	new THREE.MeshStandardMaterial({color:'orange',metalness:0.7})
	//);

	this.constructFloor();
	this.constructBase();
	
	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();


	// бутон за стартиране/приключване
	var that = this;
	this.buttonTimer = new MEIRO.CornerButton('topLeft', function(){that.onExitModel();}, '0:00', 'images/time.png');
	this.buttonTimer.hide();

	this.defaultInfo = '<h1>Тор на Лууп</h1>';
	this.defaultInfo += '<p>При подразделяне по метода на Лууп се получават нови върхове. Изберете положението на новия връх, който е за диагонала на червения четириъгълник. Това става с кликване върху самата фигура. За да огледате добре четириъгълника може да променяте гледната точка. Ако въпреки това няма удобна позиция за гледане, кликнете на перката, за да се завърти цялата фигура по случаен начин. Допустимо е също да се приближите толкова, че да влезете в обекта.</p>';
}



MEIRO.Models.T008.prototype.constructFloor = function()
{
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", this.FLOOR_SIZE, this.FLOOR_SIZE );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", this.FLOOR_SIZE, this.FLOOR_SIZE );
	var lightMap = MEIRO.loadTexture( "textures/008_floor_lightmap.jpg", 1, 1 );

	var geometry = new THREE.PlaneBufferGeometry(this.FLOOR_SIZE, this.FLOOR_SIZE);
	MEIRO.allowLightmap(geometry);
	
	var material = new THREE.MeshStandardMaterial( {
			color: 'gray',
			metalness: 0.2,
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
	
	
	
MEIRO.Models.T008.prototype.constructBase = function()
{
	// base
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", 4*this.BASE_SIZE, this.BASE_HEIGHT );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", 4*this.BASE_SIZE, this.BASE_HEIGHT );
	var lightMap = MEIRO.loadTexture( "textures/008_base_lightmap.jpg" );

	var geometry = new THREE.CylinderBufferGeometry( this.BASE_SIZE/Math.sqrt(2), this.BASE_SIZE/Math.sqrt(2), this.BASE_HEIGHT, 4, 1, true );
	MEIRO.allowLightmap(geometry);
	
	var base = new THREE.Mesh(
		geometry,
		new THREE.MeshStandardMaterial( {
				color: 'gray',
				metalness: 0.2,
				map: textureMap,
				normalMap: normalMap,
				lightMap: lightMap,
				lightMapIntensity: 2,
		})
	);
	base.position.y = this.BASE_HEIGHT/2;
	base.rotation.y = Math.PI/4;
	this.image.add( base );

	// black top
	var geometry = new THREE.PlaneBufferGeometry(this.BASE_SIZE,this.BASE_SIZE);
	var base = new THREE.Mesh(
		geometry,
		new THREE.MeshBasicMaterial({color:'black'})
	);
	base.position.y = this.BASE_HEIGHT-0.1;
	base.rotation.x = -Math.PI/2;
	this.image.add( base );

	// fan
	var textureMap = MEIRO.loadTexture( "textures/008_fan.jpg", 1, 1 );
	var geometry = new THREE.CircleBufferGeometry(this.BASE_SIZE/2-1);
	geometry.rotateX(-Math.PI/2);
	this.fan = new THREE.Mesh(
		geometry,
		new THREE.MeshBasicMaterial({
			color: 'gray',
			map: textureMap,
		})
	);
	this.fan.position.y = this.BASE_HEIGHT;
	this.image.add( this.fan );

	// net
	var textureMap = MEIRO.loadTexture( "textures/008_net.jpg", this.BASE_SIZE, this.BASE_SIZE );
	var alphaMap = MEIRO.loadTexture( "textures/008_net_alpha.jpg", this.BASE_SIZE, this.BASE_SIZE );
	var geometry = new THREE.PlaneBufferGeometry(this.BASE_SIZE, this.BASE_SIZE);
	geometry.rotateX(-Math.PI/2);
	net = new THREE.Mesh(
		geometry,
		new THREE.MeshStandardMaterial({
			map: textureMap,
			alphaMap: alphaMap,
			transparent: true,
			polygonOffset: true,
			polygonOffsetFactor: -2,
			polygonOffsetUnits: -2
		})
	);
	net.position.y = this.BASE_HEIGHT;
	this.image.add( net );
}


MEIRO.Models.T008.prototype.distanceToLine = function(x0,y0,x1,y1,x2,y2)
{
	//https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
	return Math.abs((y2-y1)*x0-(x2-x1)*y0+x2*y1-y2*x1)/Math.sqrt((y2-y1)*(y2-y1)+(x2-x1)*(x2-x1));
}



MEIRO.Models.T008.prototype.defineGraph = function()
{
	// generate pool of randoms offsets (x,y) + slope (s)
	var randoms = [];
	for (var i=0; i<this.config.points_w; i++)
	{
		randoms[i] = [];
		for (var j=0; j<this.config.points_h; j++)
		{
			var x = 0;
			for (var k=0; k<10 && x==0; k++)
				x = random(this.config.points_dw[0],this.config.points_dw[1]);
			
			var y = 0;
			for (var k=0; k<10 && y==0; k++)
				y = random(this.config.points_dh[0],this.config.points_dh[1]);
		
			var s = random(0,1);
			randoms[i][j] = {x:x, y:y, s:s};
		}
	}

	
	// scale factor for points (in grid cells)
	var pW = this.config.grid_w/this.config.points_w;
	var pH = this.config.grid_h/this.config.points_h;
	
	
	// define graph points
	this.points = [];
	for (var i=-2; i<this.config.points_w+2; i++)
	{
		this.points[i] = [];
		for (var j=-2; j<this.config.points_h+2; j++)
		{
			var ii = (i+this.config.points_w)%this.config.points_w;
			var jj = (j+this.config.points_h)%this.config.points_h;
			var x = (i+0.5)*pW+randoms[ii][jj].x;
			var y = (j+0.5)*pH+randoms[ii][jj].y;
			this.points[i][j] = {x:x, y:y, s:randoms[ii][jj]};
		}
	}

	// search for quadriple with maximal deviation
	this.targetI = 0;
	this.targetJ = 0;
	this.targetDeviation = -1;
	
	for (var i=0; i<this.config.points_w-1; i++)
	for (var j=0; j<this.config.points_h-1; j++)
	{
		var p11 = this.points[i][j];
		var p12 = this.points[i][j+1];
		var p21 = this.points[i+1][j];
		var p22 = this.points[i+1][j+1];

		var midX = p11.x+p12.x+p21.x+p22.x;
		var midY = p11.y+p12.y+p21.y+p22.y;

		var dev = -1;
		
		if (p11.s)
		{
			midX = (midX+2*p12.x+2*p21.x)/8;
			midY = (midY+2*p12.y+2*p21.y)/8;
			dev = this.distanceToLine(midX,midY,p12.x,p12.y,p21.x,p21.y);
		}
		else
		{
			midX = (midX+2*p11.x+2*p22.x)/8;
			midY = (midY+2*p11.y+2*p22.y)/8;
			dev = this.distanceToLine(midX,midY,p11.x,p11.y,p22.x,p22.y);
		}
		
		if (dev>this.targetDeviation)
		{
			this.targetDeviation = dev;
			this.targetI = i;
			this.targetJ = j;
			this.targetMidX = midX;
			this.targetMidY = midY;
		}
	}
	
//	console.log('dev =',this.targetDeviation);
}



MEIRO.Models.T008.prototype.constructGraphTexture = function()
{
	// texture sizes (in pixels)
	var W = (this.config.difficulty<DIFFICULTY_HIGH)?1024:4096;
	var H = 512;
	
	// grid cell sizes (in pixels)
	var dW = W/this.config.grid_w;
	var dH = H/this.config.grid_h;

	// helper functions
	var that = this;
	function moveTo(i,j)
	{
		ctx.moveTo(that.points[i][j].x*dW,that.points[i][j].y*dH);
	}
	
	function lineTo(i,j)
	{
		ctx.lineTo(that.points[i][j].x*dW,that.points[i][j].y*dH);
	}
	
	
	// create canvas elements with 2D context
	var canvas = document.createElement('canvas');
	canvas.width = W;
	canvas.height = H;
	var ctx = canvas.getContext('2d');

	// clear background
	ctx.fillStyle = 'darkblue';
	ctx.fillStyle = 'royalblue';
	ctx.fillRect(0,0,W,H);
	
	// draw target quardriple
	ctx.fillStyle = 'crimson';
	var i = this.targetI;
	var j = this.targetJ;
	{
		moveTo(i,j);
		lineTo(i+1,j);
		lineTo(i+1,j+1);
		lineTo(i,j+1);
		ctx.fill();
	}
			
	// draw grid lines
	ctx.globalAlpha = 0.75;
	ctx.strokeStyle = 'pink';	
	ctx.lineWidth = 1;
	{
		ctx.beginPath();
		for (var i=0; i<this.config.grid_w; i++)
		{
			var x = i*dW;
			ctx.moveTo(x,0);
			ctx.lineTo(x,H);
		}
		for (var j=0; j<this.config.grid_h; j++)
		{
			var y = j*dH;
			ctx.moveTo(0,y);
			ctx.lineTo(W,y);
		}
		ctx.stroke();
	}

	// draw triangles
	ctx.globalAlpha = 1;
	ctx.strokeStyle = 'white';	
	ctx.lineWidth = 3;
	for (var i=-1; i<this.config.points_w+1; i++)
		for (var j=-1; j<this.config.points_h+1; j++)
		{
			ctx.beginPath();
			moveTo(i,j+1);
			lineTo(i,j);
			lineTo(i+1,j);
			
			var ii = (i+this.config.points_w)%this.config.points_w;
			var jj = (j+this.config.points_h)%this.config.points_h;
			if (this.points[ii][jj].s)
			{
				moveTo(i,j+1);
				lineTo(i+1,j);
			}
			else
			{
				moveTo(i,j);
				lineTo(i+1,j+1);
			}
			ctx.stroke();
		}
			
	// generate texture
	var texture = new THREE.Texture(canvas);
	texture.repeat = new THREE.Vector2(1,1);
	texture.magFilter = THREE.LinearFilter;
	texture.mimFilter = THREE.LinearMipMapLinearFilter;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.anisotropy = 256; // looks good at oblique angles
	texture.needsUpdate = true;
	
	return texture;
}



MEIRO.Models.T008.prototype.pointOnTorus = function(i,j)
{
	var u = this.points[i][j].x/this.config.grid_w;
	var v = this.points[i][j].y/this.config.grid_h;
	return this.pointOnTorusUV(u,v);
}

MEIRO.Models.T008.prototype.pointOnTorusUV = function(u,v)
{
	var x = y = z = 0;
	
	function calculatePositionOnCurve( u, p, q, radius, position )
	{
		var cu = Math.cos(u);
		var su = Math.sin(u);
		var quOverP = q/p * u;
		var cs = Math.cos(quOverP);

		position.x = radius * (2+cs) * 0.5 * cu;
		position.y = radius * (2+cs) * su * 0.5;
		position.z = radius * Math.sin(quOverP) * 0.5;
	}

	switch (this.config.difficulty)
	{
		case DIFFICULTY_LOW:
			u *= 2*Math.PI;
			v += 2/this.config.grid_h;
			x = this.TORUS_RADIUS*Math.sin(u);
			z = this.TORUS_RADIUS*Math.cos(u);
			y = 4-4*this.TORUS_TUBE_RADIUS*v;
			break;
		case DIFFICULTY_MEDIUM:
			u *= 2*Math.PI;
			v *= 2*Math.PI;
			x = (this.TORUS_RADIUS + this.TORUS_TUBE_RADIUS*Math.cos(v)) * Math.cos(u);
			y = (this.TORUS_RADIUS + this.TORUS_TUBE_RADIUS*Math.cos(v)) * Math.sin(u);
			z = -this.TORUS_TUBE_RADIUS * Math.sin(v);
			break;
		case DIFFICULTY_HIGH:
			var P1 = new THREE.Vector3();
			var P2 = new THREE.Vector3();
			var B = new THREE.Vector3();
			var T = new THREE.Vector3();
			var N = new THREE.Vector3();
	
			u *= this.config.knot_p*2*Math.PI;
			v *= -2*Math.PI;
			calculatePositionOnCurve( u, this.config.knot_p, this.config.knot_q, this.TORUS_RADIUS, P1 );
			calculatePositionOnCurve( u+0.01, this.config.knot_p, this.config.knot_q, this.TORUS_RADIUS, P2 );
			T.subVectors( P2, P1 );
			N.addVectors( P2, P1 );
			B.crossVectors( T, N );
			N.crossVectors( B, T );
			B.normalize();
			N.normalize();
			var cx = - 0.5*this.TORUS_TUBE_RADIUS * Math.cos(v);
			var cy = 0.5*this.TORUS_TUBE_RADIUS * Math.sin(v);
			x = P1.x + (cx*N.x + cy*B.x);
			y = P1.y + (cx*N.y + cy*B.y);
			z = P1.z + (cx*N.z + cy*B.z);
			break;
	}
	
	var v = new THREE.Vector3(x,y+this.TORUS_HEIGHT,z);
	return v;
}


MEIRO.Models.T008.prototype.constructTorus = function()
{
	var geometry;
	switch (this.config.difficulty)
	{
		case DIFFICULTY_LOW:
			geometry = new THREE.CylinderBufferGeometry( this.TORUS_RADIUS, this.TORUS_RADIUS, 4*this.TORUS_TUBE_RADIUS, 60, 1, true );
			break;
		case DIFFICULTY_MEDIUM:
			geometry = new THREE.TorusBufferGeometry( this.TORUS_RADIUS, this.TORUS_TUBE_RADIUS, 60, 120 );
			break;
		case DIFFICULTY_HIGH:
			geometry = new THREE.TorusKnotBufferGeometry( this.TORUS_RADIUS, 0.5*this.TORUS_TUBE_RADIUS, 240, 60, this.config.knot_p, this.config.knot_q );
			break;
	}
	
	var material = new THREE.MeshStandardMaterial({
		color: 'white',
		metalness: 0.4,
		roughness: 0.1,
		map: this.constructGraphTexture(),
		emissive: 'cornflowerblue',
		emissiveIntensity: 0.2,
		//transparent: true,
		//opacity: 0.3,
		side: THREE.DoubleSide,
	});

	this.torus = new THREE.Mesh( geometry, material );
	this.torus.position.y = this.TORUS_HEIGHT;
	this.torus.rotX = 0;
	this.torus.rotY = 0;
	this.torus.rotZ = 0;
	//torus.rotation.x = -Math.PI/2;
	this.image.add( this.torus );

	this.torus.add(this.laserLight,this.laserPoint/*,this.laserPoint2*/);

	// debug vertices of target quardriple and target midpoint
	/*
	var material = new THREE.MeshStandardMaterial({color:'white',metalness:0});
	var geometry = new THREE.SphereBufferGeometry(0.05,12,12);
	
	var sph = new THREE.Mesh( geometry, material );
	var pos = this.pointOnTorus(this.targetI,this.targetJ); // pos for this.image
	pos.y -= this.TORUS_HEIGHT;
	pos = this.image.localToWorld(pos); // pos for global
	pos = this.torus.worldToLocal(pos); // pos for torus
	sph.position.copy(pos);
	this.torus.add(sph);

	var sph = new THREE.Mesh( geometry, material );
	var pos = this.pointOnTorus(this.targetI+1,this.targetJ); // pos for this.image
	pos.y -= this.TORUS_HEIGHT;
	pos = this.image.localToWorld(pos); // pos for global
	pos = this.torus.worldToLocal(pos); // pos for torus
	sph.position.copy(pos);
	this.torus.add(sph);

	var sph = new THREE.Mesh( geometry, material );
	var pos = this.pointOnTorus(this.targetI,this.targetJ+1); // pos for this.image
	pos.y -= this.TORUS_HEIGHT;
	pos = this.image.localToWorld(pos); // pos for global
	pos = this.torus.worldToLocal(pos); // pos for torus
	sph.position.copy(pos);
	this.torus.add(sph);

	var sph = new THREE.Mesh( geometry, material );
	var pos = this.pointOnTorus(this.targetI+1,this.targetJ+1); // pos for this.image
	pos.y -= this.TORUS_HEIGHT;
	pos = this.image.localToWorld(pos); // pos for global
	pos = this.torus.worldToLocal(pos); // pos for torus
	sph.position.copy(pos);
	this.torus.add(sph);
	
	var sph = new THREE.Mesh( geometry, material );
	var u = this.targetMidX/this.config.grid_w;
	var v = this.targetMidY/this.config.grid_h;
	var pos = this.pointOnTorusUV(u,v); // pos for mid target
	pos.y -= this.TORUS_HEIGHT;
	pos = this.image.localToWorld(pos); // pos for global
	pos = this.torus.worldToLocal(pos); // pos for torus
	sph.position.copy(pos);
	this.torus.add(sph);
	*/
	
	//console.log('range ',this.points[this.targetI][this.targetJ],' to ',this.points[this.targetI+1][this.targetJ+1]);
	//console.log('target ',this.targetMidX,this.targetMidY);
	
}



MEIRO.Models.T008.prototype.onObject = function()
{
	this.fanSound.play();

	if (!this.playing) return undefined;
	
	// координати на мишка
	this.mouse.x = (controls.human.mousePos.x/window.innerWidth)*2 - 1;
	this.mouse.y = -(controls.human.mousePos.y/window.innerHeight)*2 + 1;

	this.raycaster.setFromCamera( this.mouse, camera );
	
	this.torus.updateMatrix();
	this.torus.updateMatrixWorld(true);
	
	var intersects = this.raycaster.intersectObject( this.torus );
	if (intersects.length)
	{
		var p = intersects[0].point;		// world point
		var n = intersects[0].face.normal;	// world normal

		var q = p.clone();
		this.laserPoint.position.copy(this.torus.worldToLocal(p));
		
		this.laserLight.position.copy(this.torus.worldToLocal(q).addScaledVector(n,0.1));
		//this.laserPoint2.position.copy(this.laserLight.position);
		
		this.clickMusic.play();
		
		var x = intersects[0].uv.x*grid_w;
		var y = grid_h-intersects[0].uv.y*grid_h;
		this.distanceToTarget = Math.pow(Math.pow(x-this.targetMidX,2)+Math.pow(y-this.targetMidY,2),0.5);
		
		//console.log('dist',this.distanceToTarget);
		//console.log('lp',this.laserPoint.position.distanceTo(targetPoint));
			
		this.clicks++;

		return undefined;
	}

	var intersects = this.raycaster.intersectObject( this.fan );
	if (intersects.length)
	{
		var rotX = random(0,2)*Math.PI/2;
		var rotY = random(0,2)*Math.PI/2;
		var rotZ = random(0,2)*Math.PI/2;
		var that = this;
		
		var fromX = this.torus.rotX;
		var fromY = this.torus.rotY;
		var fromZ = this.torus.rotZ;
		
		new TWEEN.Tween({k:0})
			.to({k:1},1000)
			.easing( TWEEN.Easing.Quadratic.InOut )
			.onUpdate( function(){
				that.torus.rotX = THREE.Math.lerp(fromX, rotX, this.k);
				that.torus.rotY = THREE.Math.lerp(fromY, rotY, this.k);
				that.torus.rotZ = THREE.Math.lerp(fromZ, rotZ, this.k);
				// анимация по активиране на модела
			} )
			.start();

		this.magicIntro.volume = 1;
		this.magicIntro.currentTime = 0;
		this.magicIntro.rewind = true;
		this.magicIntro.play();

		return undefined;
	}

	return undefined;
}



MEIRO.Models.T008.prototype.onDragEnd = function()
{
}



// аниматор на модела
MEIRO.Models.T008.prototype.onAnimate = function(time)
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
		
		this.laserLight.intensity = 2+4*Math.pow(Math.sin(rpm(time,50)),6);

		this.torus.rotation.x = this.torus.rotX + 0.03*Math.sin(rpm(time,10));
		this.torus.rotation.y = this.torus.rotY + 0.03*Math.sin(rpm(time,13));
		this.torus.rotation.z = this.torus.rotZ + 0.03*Math.sin(rpm(time,17));
		this.torus.position.y = this.TORUS_HEIGHT+0.2*Math.sin(rpm(time,9))
		this.torus.updateMatrix();
		
		this.fan.rotation.y = rpm(time,120);
		
		if (!this.fanSound.paused)
		{
			this.fanSound.volume = THREE.Math.lerp(this.fanSound.volume,0.3+0.2*Math.sin(rpm(time,30)),0.01);
			if (this.fanSound.currentTime>10) this.fanSound.currentTime=0;
		}
	}

	TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.T008.prototype.onInfo = function(element)
{
	element.innerHTML = this.info;
}



MEIRO.Models.T008.prototype.evaluateResult = function()
{	
	var match = 1-Math.pow(10*this.distanceToTarget,2.7)/100;
	match = THREE.Math.clamp(match,0,1);
	
	this.config.score = match*this.config.max_score;

	this.config.time =  Math.floor((animationLoop.time-this.startTime)/1000);
	
//	console.log('score=',this.config.score);
	this.info = '';
	this.info += '<h1 style="text-align:center;">Тор на Лууп &ndash; '+Math.round(1000*this.config.score)/10+' от '+Math.round(100*this.config.max_score)+' точки</span></h1>';
	this.info += 'Новият връх, съответстващ на диагонала в червения четириъгълник, е близо до средата на диагонала, но рядко е точно там.';

	if (this.distanceToTarget>9999)
		this.info += 'Засега нямате избрана точка.</p>';
	else
		this.info += 'Ако едно правоъгълниче е с размери 1х1, то избраната позиция на новия връх е на разстояние '+(Math.round(100*this.distanceToTarget)/100)+' от там, където трябва да е.</p>';
	
//	console.log('evaluation=',this.config.score*match);
}



MEIRO.Models.T008.prototype.sendResult = function(callback)
{
	var competences = [];
	for (var i=0; i<MEIRO.Models.T008.COMPETENCES.length; i++)
		competences.push( Math.round(100*MEIRO.Models.T008.COMPETENCES[i]*this.config.score)/100 );
	
	var data = new FormData();
	data.append('ACTION', 'END');
	data.append('MODEL', 'T008');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	data.append('SCORE', Math.round(100*this.config.score)/100);
	data.append('TIME', this.config.time);
	data.append('CLICKS', this.clicks);
	data.append('COMPETENCES', competences);
	postData(data,callback,callback);
}



MEIRO.Models.T008.prototype.sendStartup = function(callback)
{
	var data = new FormData();
	data.append('ACTION', 'START');
	data.append('MODEL', 'T008');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	postData(data,callback,callback);
}



MEIRO.Models.T008.prototype.onEnter = function(element)
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
MEIRO.Models.T008.prototype.onExitModel = function(element)
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
MEIRO.Models.T008.prototype.configure = function(difficulty)
{	
	this.config = {difficulty: difficulty};
		
	var max_score = grid_w = grid_h = knot_p = knot_q = knot_factor = 0;
	
	switch (difficulty)
	{
		// ниска трудност
		case DIFFICULTY_LOW:
			grid_w = 36; // # of h grids
			grid_h = 12; // # of v grids
			
			points_w = 6; // # of h points
			points_h = 2; // # of v points
			
			points_dw = [-1,2]; // +- random h offset
			points_dh = [-1,2]; // +- random v offset
			
			max_score = 0.1;
			break;
			
		// средна трудност
		case DIFFICULTY_MEDIUM:
			grid_w = 36; // # of h grids
			grid_h = 24; // # of v grids
			
			points_w = 6; // # of h points
			points_h = 4; // # of v points
			
			points_dw = [-1,2]; // +- random h offset
			points_dh = [-1,2]; // +- random v offset
			max_score = 0.3;
			break;
			
		// висока трудност
		case DIFFICULTY_HIGH:
			grid_w = 120; // # of h grids
			grid_h = 16; // # of v grids
			
			points_w = 20; // # of h points
			points_h = 4; // # of v points
			
			points_dw = [-1,1]; // +- random h offset
			points_dh = [-1,1]; // +- random v offset

			// easy 1-3
			// normal 3-1
			// hard 2-3
			switch (random(0,2))
			{
				case 0: 
					knot_p = 1;
					knot_q = 3;
					max_score = 0.7;
					break;
				case 1: 
					knot_p = 2;
					knot_q = 3;
					max_score = 0.8;
					break;
				case 2: 
					knot_p = 3;
					knot_q = 2;
					max_score = 0.9;
					break;
			}
			break;
			
		default: console.error('Unknown difficulty level');
	}

	this.config.grid_w = grid_w; // number of horizontal grid blocks
	this.config.grid_h = grid_h; // number of vertical grid blocks
	this.config.points_w = points_w;
	this.config.points_h = points_h;
	this.config.points_dw = points_dw;
	this.config.points_dh = points_dh;
	this.config.knot_p = knot_p;
	this.config.knot_q = knot_q;
	
	// generate graph and target quadriple
	this.defineGraph();
	this.config.max_score = max_score+Math.min(this.targetDeviation/10,0.1);
	
	//console.log('max_score=',this.config.max_score);

	if (!IN_SCORE_STATISTICS)
	{
		this.constructTorus();
		this.sendStartup();
	}
}


MEIRO.Models.T008.prototype.postConfigure = function()
{	
}


// извежда статистика за шъзмовните конфигурации
MEIRO.Models.T008.prototype.configureStats = function()
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