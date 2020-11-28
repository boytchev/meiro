
var SCORE_STATISTICS = !true;
var IN_SCORE_STATISTICS = false;

//	Основи на Компютърната Графика
//	Тест 004 - Характерният брой
//	П. Бойчев, 2019
//
//	 ├─ T004
//	 │   ├─ initialize()
//	 │   ├─ construct()
//	 │   │    ├─ constructAxes()
//	 │   │    ├─ constructRuler()
//	 │   │    └─ configureStats()
//	 │   ├─ onAnimate()
//	 │   ├─ onObject()
//	 │   ├─ onEnter()
//	 │   │    └─ configure(difficulty)
//	 │   │        ├─ generateSpace()
//	 │   │        ├─ generateTunnels(space)
//	 │   │        ├─ calculateEuler(space)
//	 │   │        ├─ generateGeometry(space)
//	 │   │        ├─ constructObject()
//	 │   │        └─ constructObjectImage()
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
MEIRO.Models.T004 = function T004(room, model)
{
	MEIRO.Model.apply(this, arguments);
	
	this.initialize();
	this.construct();
}
MEIRO.Models.T004.prototype = Object.create(MEIRO.Model.prototype);



MEIRO.Models.T004.DIST = {MIN:10, MAX:22, HEIGHT:0};
MEIRO.Models.T004.POS = {DIST:22, ROT_X:0.9, ROT_Y:0.15, ON_FLOOR:true};
MEIRO.Models.T004.ROT_Y = {MIN:0.0, MAX:1.56};
MEIRO.Models.T004.SCALE = {MAX:0.25};
MEIRO.Models.T004.COMPETENCES = [1,1,1,5,1, 0,2,0,5, 0,0,0, 1,5,5,0,0];



MEIRO.Models.T004.prototype.initialize = function()
{
	if (SCORE_STATISTICS) this.configureStats();
	
	random.randomize();

	this.OBJECT_SIZE = 5;
	this.OBJECT_HEIGHT = 6;
	
	this.AXIS_LENGTH = 3;
	this.AXIS_RADIUS = 0.2;
	this.AXIS_DISTANCE = 5.05;

	this.DISC_RADIUS = 1;
	this.DISC_WIDTH = 1/2;

	this.PILLAR_WIDTH = 2*this.DISC_RADIUS+1;
	
	this.BASE_HEIGHT = 1;
	this.BASE_LENGTH = 13;
	this.BASE_WIDTH = 7;
	
	this.TUBE_LENGTH = this.BASE_LENGTH-2;
	this.TUBE_RADIUS = this.BASE_HEIGHT/4;
	
	this.RULER_LENGTH = this.BASE_LENGTH-0.3;
	this.RULER_WIDTH = 0.5;
	this.RULER_DISTANCE = 0;
	
	this.axes = new THREE.Group();
	this.object = new THREE.Group();
////	this.objectShadow = new THREE.Group();
////	this.objectShadowFlat = new THREE.Group();
////	this.objectShadowFlat.add( this.objectShadow );
////	this.objectShadowFlat.scale.set( 1, 0.01, 1 );

	this.tubeBalance = Math.PI/2;
	this.inBalancing = false;
	this.userAnswer = 0;
	
	this.F = 0;
	this.E = 0;
	this.V = 0;

	//this.constructObject(); -- in configure()
	this.constructAxes();
	this.constructPillars();
	this.constructBase();
	this.constructTube();
	this.constructRuler();
	
	this.playing = false;
	this.startTime = 0;
	this.lastTime = 0;
	this.clicks = 0;
	
	this.waterGulp = new Audio('sounds/water-gulp.mp3');
}

	

MEIRO.Models.T004.prototype.construct = function()
{
	// допълнителна светлина, прави пода по-красив
//	var light = new THREE.PointLight( 'white', 1 );
//	light.position.set( 0, 5, 0 );

	var light = new THREE.SpotLight( 'white', 1, 0, Math.PI/2, 1 );
	light.position.set( 4, 4, 0 );
	light.target = new THREE.Object3D();
	light.target.position.set( 5, 4+1, 0 );
	this.image.add( light );
	this.image.add( light.target );
	
	var light = new THREE.SpotLight( 'white', 1, 0, Math.PI/2, 1 );
	light.position.set( -4, 4, 0 );
	light.target = new THREE.Object3D();
	light.target.position.set( -5, 4+1, 0 );
	this.image.add( light );
	this.image.add( light.target );
	

	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();

	// бутон за стартиране/приключване
	var that = this;
	this.buttonTimer = new MEIRO.CornerButton('topLeft', function(){that.onExitModel();}, '0:00', 'images/time.png');
	this.buttonTimer.hide();

	this.defaultInfo = '<h1>Характерният брой</h1>';
	this.defaultInfo += '<p>Определете Ойлеровата характеристика на централното тяло. Тази характеристика е равна на броя стени минус броя ръбове плюс броя върхове. Огледайте добре дали има тунели или вдлъбнатини и колко са.</p><p>Отговорът е цяло число (положително, нула или отрицателно) и се избира като се кликва на тръбичката с течност. Ако се кликне в някоя от половините на тръбичката, тази половина се издига нагоре и мехурчето се плъзва към нея.</p>';
}



MEIRO.Models.T004.prototype.constructRuler = function()
{
	// ruler
	var textureMap = MEIRO.loadTexture( "textures/004_ruler.jpg", 1, 1 );

	var geometry = new THREE.PlaneBufferGeometry( this.RULER_LENGTH, this.RULER_WIDTH );
	
	var ruler = new THREE.Mesh(
		geometry,
		new THREE.MeshBasicMaterial( {
				color: 'white',
				map: textureMap,
				polygonOffset: true,
				polygonOffsetFactor: -1,
				polygonOffsetUnits: -1,
		})
	);
	ruler.position.z = this.BASE_WIDTH/2+this.RULER_DISTANCE;
	ruler.position.y = this.RULER_WIDTH/2+0.1;
	//ruler.rotation.set(-Math.PI/2,Math.PI/2*0,0);
	this.image.add( ruler );
}


MEIRO.Models.T004.prototype.constructBase = function()
{
	// base
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", 1, 1 );
	//var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", 1, 1 );
	var lightMap = MEIRO.loadTexture( "textures/004_base_lightmap.jpg" );

	var geometry = new THREE.BoxBufferGeometry( this.BASE_LENGTH, this.BASE_HEIGHT, this.BASE_WIDTH );
	MEIRO.allowLightmap(geometry);
	
	var uv = geometry.getAttribute('uv');
	var position = geometry.getAttribute('position');
	for (var i=0; i<uv.count; i++)
	{
		uv.setXY( i, position.getX(i)+position.getZ(i), position.getY(i)+0.5 );
	}
	
	var base = new THREE.Mesh(
		geometry,
		new THREE.MeshStandardMaterial( {
				color: 'white',
				metalness: 0.3,
				roughness: 0.5,
				map: textureMap,
				//normalMap: normalMap,
				lightMap: lightMap,
				lightMapIntensity: -1/2,
		})
	);
	base.position.y = this.BASE_HEIGHT/2;
	base.scale.x = this.BASE_LENGTH/(this.BASE_LENGTH+0.1);
	this.image.add( base );

	// base top
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", this.BASE_LENGTH, this.BASE_WIDTH );
	//var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", this.BASE_LENGTH, this.BASE_WIDTH );
	var lightMap = MEIRO.loadTexture( "textures/004_basetop_lightmap.jpg" );
	var geometry = new THREE.PlaneBufferGeometry( this.BASE_LENGTH, this.BASE_WIDTH );
	MEIRO.allowLightmap(geometry);
	var base = new THREE.Mesh(
		geometry,
		new THREE.MeshStandardMaterial({
				color: 'white',
				metalness: 0.3,
				roughness: 0.5,
				map: textureMap,
				//normalMap: normalMap,
				//normalScale: new THREE.Vector2(0.2,0.2),
				polygonOffset: true,
				polygonOffsetFactor: -1,
				polygonOffsetUnits: -1,
				lightMap: lightMap,
				lightMapIntensity: 2,
		})
	);
	base.scale.x = this.BASE_LENGTH/(this.BASE_LENGTH+0.1);
	base.position.y = this.BASE_HEIGHT;
	base.rotation.x = -Math.PI/2;
	this.image.add( base );

}


MEIRO.Models.T004.prototype.constructTube = function()
{
	// tube
	var geometry = new THREE.CylinderBufferGeometry( this.TUBE_RADIUS, this.TUBE_RADIUS, this.TUBE_LENGTH, 12, 1, !true );
	//MEIRO.allowLightmap(geometry);
	
	var tube = new THREE.Mesh(
		geometry,
		new THREE.MeshStandardMaterial( {
				color: 'lightblue',
				//metalness: 1,
				//map: textureMap,
				transparent: true,
				opacity: 0.5,
				//normalMap: normalMap,
				//lightMap: lightMap,
				//lightMapIntensity: -1/2,
				side: THREE.BackSide,
		})
	);
	tube.position.set(0, this.BASE_HEIGHT-0.2, +this.BASE_WIDTH/2+1.2*this.TUBE_RADIUS);
	tube.rotation.z = Math.PI/2;
	this.image.add( tube );
	this.tube = tube;
	
	var liquid = new THREE.Mesh(
		geometry,
		new THREE.MeshStandardMaterial( {
				color: 'cornflowerblue',
				//metalness: 1,
				//roughness: 0.5,
				transparent: true,
				opacity: 0.8,
				emissive: 'cornflowerblue',
				emissiveIntensity: 0.5,
				side: THREE.BackSide,
		})
	);
	liquid.scale.set( 0.6, 1.08, 0.6 );
	liquid.renderOrder = -2;
	tube.add( liquid );
	
	// bubble
	var geometry = new THREE.SphereBufferGeometry( this.TUBE_RADIUS*0.6, 8, 24 );
	var pos = geometry.getAttribute('position');
	for (var i=0; i<pos.count; i++)
	{
		var x = pos.getX(i);
		var z = pos.getZ(i);
		var r = Math.sqrt(x*x+z*z);
		if (r>0.0001)
			r = (1*this.TUBE_RADIUS*0.7+1*r)/2/r;
		pos.setX(i,r*x);
		pos.setZ(i,r*z);
	}
	
	var bubble = new THREE.Mesh(
		geometry,
		new THREE.MeshStandardMaterial( {
				color: 'white',
				metalness: 1/2,
				transparent: true,
				opacity: 0.5,
				emissive: 'white',
				emissiveIntensity: 0.2,
				//polygonOffset: !true,
				//polygonOffsetFactor: -10,
				//polygonOffsetUnits: -10,
				
		})
	);
	bubble.scale.set(1,1.5,1);
	bubble.position.y = 0;
	//bubble.rotation.z = Math.PI/2;
	bubble.renderOrder = 2;
	tube.add( bubble );
	this.bubble = bubble;
	
	var bubble2 = bubble.clone();
	bubble2.position.y = 0;
	bubble.add(bubble2);
	bubble2.scale.set(0.8,0.7,0.8);
	
//	var light = new THREE.SpotLight('red',1);
//	light.position.y = 1;
//	light.target = bubble;
//	bubble.add( light );
	
	// caps
	var geometry = new THREE.SphereBufferGeometry( this.TUBE_RADIUS, 24, 12, 0, 2*Math.PI, 0, Math.PI/2 );
	var material = new THREE.MeshStandardMaterial( {
		color: 'gray',
		metalness: 0.8,
		side: THREE.DoubleSide,
	})

	//MEIRO.allowLightmap(geometry);
	
	var cap = new THREE.Mesh( geometry, material );
	cap.position.y = this.TUBE_LENGTH/2+1/4;
	tube.add( cap );
	
	cap = cap.clone();
	cap.position.y *= -1;
	cap.rotation.z = Math.PI;
	tube.add( cap );
	
	var geometry = new THREE.CylinderBufferGeometry( this.TUBE_RADIUS, this.TUBE_RADIUS, 1/4, 12, 1, true );
	var cap = new THREE.Mesh( geometry, material );
	cap.position.y = this.TUBE_LENGTH/2+1/8;
	tube.add( cap );
	
	cap = cap.clone();
	cap.position.y *= -1;
	tube.add( cap );
	

	// holder
	var geometry = new THREE.CylinderBufferGeometry( this.TUBE_RADIUS, this.TUBE_RADIUS, 1, 12, 1, true, Math.PI/4, 6*Math.PI/4 );
	var holder = new THREE.Mesh( geometry, material );
	tube.add( holder );
	
	// rod
	var rod = new THREE.Mesh( geometry, material );
	rod.scale.set(0.3,1,0.3);
	rod.rotation.y = -Math.PI/2;
	rod.rotation.x = Math.PI/2;
	rod.position.z = -0.7;
	tube.add( rod );
	
}


MEIRO.Models.T004.prototype.generateSpace = function()
{
	var N = this.config.size;

	space = [];
	for (var x=-1; x<N+1; x++)
	{
		space[x]=[];
		for (var y=-1; y<N+1; y++)
		{
			space[x][y]=[];
			for (var z=-1; z<N+1; z++)
			{
				space[x][y][z] = (x>-1 && y>-1 && z>-1 && x<N && y<N && z<N)?1:0;
			}
		}
	}
	
	return space;
}


MEIRO.Models.T004.prototype.generateTunnels = function(space)
{
	var N = this.config.size;
	var T = this.config.tunnels;
	
	function punch()
	{	// generate random tunel
		var p = {};
		p.a1 = random(0,N-1);
		p.a2 = random(p.a1,N-1);
		p.b1 = random(0,N-1);
		p.b2 = random(p.b1,N-1);
		
		if (Math.random()>0.4)
		{	// whole hole
			p.c1 = 0;
			p.c2 = N-1;
		}
		else
		{	// only dent
			if (Math.random()>0.5)
			{
				p.c1 = 0;
				p.c2 = random(0,N-2);
			}
			else
			{
				p.c1 = random(1,N-1);
				p.c2 = N-1;
			}
		}
		return p;
	}
	
	//tunel XY
	for (var i=0; i<T.z; i++)
	{
		var p = punch();
		
		for (var x=p.a1; x<=p.a2; x++)
		for (var y=p.b1; y<=p.b2; y++)
		for (var z=p.c1; z<=p.c2; z++)
			space[x][y][z] = 0;
	}

	//tunel YZ
	for (var i=0; i<T.x; i++)
	{
		var p = punch();
		
		for (var y=p.a1; y<=p.a2; y++)
		for (var z=p.b1; z<=p.b2; z++)
		for (var x=p.c1; x<=p.c2; x++)
			space[x][y][z] = 0;
	}
	
	//tunel XZ
	for (var i=0; i<T.y; i++)
	{
		var p = punch();
		
		for (var z=p.a1; z<=p.a2; z++)
		for (var x=p.b1; x<=p.b2; x++)
		for (var y=p.c1; y<=p.c2; y++)
			space[x][y][z] = 0;
	}	
}


MEIRO.Models.T004.prototype.calculateEuler = function(space)
{
	var N = this.config.size;
	
	this.F = 0;
	this.E = 0;
	this.V = 0;
	for (var x=0; x<N; x++)
	for (var y=0; y<N; y++)
	for (var z=0; z<N; z++)
		if (space[x][y][z])
		{
			if (!space[x+1][y][z] ) this.F++;
			if (!space[x-1][y][z] ) this.F++;
			if (!space[x][y+1][z] ) this.F++;
			if (!space[x][y-1][z] ) this.F++;
			if (!space[x][y][z+1] ) this.F++;
			if (!space[x][y][z-1] ) this.F++;
		}		
	for (var x=-1; x<N; x++)
	for (var y=-1; y<N; y++)
	for (var z=-1; z<N; z++)
		{
			// a box of 2x2x2 cubes around each vertex
			// if 0 cubes - no vertex (external vertex)
			// if 8 cubes - no vertex (internal vertex)
			var count = 0;
			count += space[x][y][z]+space[x+1][y][z];
			count += space[x][y+1][z]+space[x+1][y+1][z];
			count += space[x][y][z+1]+space[x+1][y][z+1];
			count += space[x][y+1][z+1]+space[x+1][y+1][z+1];
			if (0<count && count<8 ) this.V++;
			
			var count = 0; // XY
			count += space[x][y][z]+space[x+1][y][z];
			count += space[x][y+1][z]+space[x+1][y+1][z];
			if (0<count && count<4 ) this.E++;
			
			var count = 0; // XZ
			count += space[x][y][z]+space[x+1][y][z];
			count += space[x][y][z+1]+space[x+1][y][z+1];
			if (0<count && count<4 ) this.E++;
			
			var count = 0; // YZ
			count += space[x][y][z]+space[x][y+1][z];
			count += space[x][y][z+1]+space[x][y+1][z+1];
			if (0<count && count<4 ) this.E++;
		}		
	
	//console.log('F =',this.F);
	//console.log('E =',this.E);
	//console.log('V =',this.V);
	//console.log('F-E+V =',this.F-this.E+this.V);
}


MEIRO.Models.T004.prototype.generateGeometry = function(space)
{
	var N = this.config.size;
	var M = N/2-1/2;

	var triangles = this.F*2;
	var vertices = triangles*3;

	// attribure arrays
	posArr = new Float32Array(3*vertices);
	norArr = new Float32Array(3*vertices);
	texArr = new Float32Array(2*vertices);
	
	var index = 0;
	
	function set(x,y,z,nx,ny,nz,u,v)
	{
		posArr[3*index] = x-M;
		posArr[3*index+1] = y-M;
		posArr[3*index+2] = z-M;
		
		norArr[3*index] = nx;
		norArr[3*index+1] = ny;
		norArr[3*index+2] = nz;

		texArr[2*index] = u;
		texArr[2*index+1] = v;
		
		index++;
	}	
	
	// top plates (from Y+ -> Y-)
	for (var x=0; x<N; x++)
	for (var y=0; y<N; y++)
	for (var z=0; z<N; z++)
		if (space[x][y][z] && !space[x][y+1][z] )
		{
			set(x,y+1,z,		0,1,0,	0,1);
			set(x+1,y+1,z+1,	0,1,0,	1,0);
			set(x+1,y+1,z,		0,1,0,	1,1);

			set(x,y+1,z,		0,1,0,	0,1);
			set(x,y+1,z+1,		0,1,0,	0,0);
			set(x+1,y+1,z+1,	0,1,0,	1,0);
		}
		
	// bottom plates (from Y- -> Y+)
	for (var x=0; x<N; x++)
	for (var y=0; y<N; y++)
	for (var z=0; z<N; z++)
		if (space[x][y][z] && !space[x][y-1][z] )
		{
			set(x,y,z,		0,-1,0,	0,1);
			set(x+1,y,z,	0,-1,0,	1,1);
			set(x+1,y,z+1,	0,-1,0,	1,0);

			set(x,y,z,		0,-1,0,	0,1);
			set(x+1,y,z+1,	0,-1,0,	1,0);
			set(x,y,z+1,	0,-1,0,	0,0);
		}
	
	// front plates (from Z+ -> Z-)
	for (var x=0; x<N; x++)
	for (var y=0; y<N; y++)
	for (var z=0; z<N; z++)
		if (space[x][y][z] && !space[x][y][z+1] )
		{
			set(x,y,z+1,		0,0,1,	0,1);
			set(x+1,y,z+1,		0,0,1,	1,1);
			set(x+1,y+1,z+1,	0,0,1,	1,0);

			set(x,y,z+1,		0,0,1,	0,1);
			set(x+1,y+1,z+1,	0,0,1,	1,0);
			set(x,y+1,z+1,		0,0,1,	0,0);
		}
	
	// back plates (from Z- -> Z+)
	for (var x=0; x<N; x++)
	for (var y=0; y<N; y++)
	for (var z=0; z<N; z++)
		if (space[x][y][z] && !space[x][y][z-1] )
		{
			set(x,y,z,		0,0,-1,	0,1);
			set(x+1,y+1,z,	0,0,-1,	1,0);
			set(x+1,y,z,	0,0,-1,	1,1);

			set(x,y,z,		0,0,-1,	0,1);
			set(x,y+1,z,	0,0,-1,	0,0);
			set(x+1,y+1,z,	0,0,-1,	1,0);
		}
		
	// right plates (from X+ -> X-)
	for (var x=0; x<N; x++)
	for (var y=0; y<N; y++)
	for (var z=0; z<N; z++)
		if (space[x][y][z] && !space[x+1][y][z] )
		{
			set(x+1,y,z,		1,0,0,	0,1);
			set(x+1,y+1,z+1,	1,0,0,	1,0);
			set(x+1,y,z+1,		1,0,0,	1,1);

			set(x+1,y,z,		1,0,0,	0,1);
			set(x+1,y+1,z,		1,0,0,	0,0);
			set(x+1,y+1,z+1,	1,0,0,	1,0);
		}
		
	// left plates (from X- -> X+)
	for (var x=0; x<N; x++)
	for (var y=0; y<N; y++)
	for (var z=0; z<N; z++)
		if (space[x][y][z] && !space[x-1][y][z] )
		{
			set(x,y,z,		-1,0,0,	0,1);
			set(x,y,z+1,		-1,0,0,	1,1);
			set(x,y+1,z+1,	-1,0,0,	1,0);

			set(x,y,z,		-1,0,0,	0,1);
			set(x,y+1,z+1,	-1,0,0,	1,0);
			set(x,y+1,z,		-1,0,0,	0,0);
		}

	var geometry = new THREE.BufferGeometry();

	geometry.addAttribute( 'position', new THREE.BufferAttribute(posArr,3) );
	geometry.addAttribute( 'normal', new THREE.BufferAttribute(norArr,3) );
	geometry.addAttribute( 'uv', new THREE.BufferAttribute(texArr,2) );
		
	return geometry;
}


MEIRO.Models.T004.prototype.constructObject = function()
{
	var N = this.config.size;

	var space = this.generateSpace();
	this.generateTunnels( space );
	this.calculateEuler( space );

	this.planes = this.generateGeometry( space );
	this.edges = new THREE.EdgesGeometry( this.planes );
	this.W = this.edges.getAttribute('position').count/6;
	if (IN_SCORE_STATISTICS)
	{
		this.edges.dispose();
		this.planes.dispose();
		//console.log('dispose');
		return;
	}
}
	

MEIRO.Models.T004.prototype.constructObjectImage = function()
{
	var N = this.config.size;

	var group = new THREE.Group();
////	var groupShadow = new THREE.Group();
	
	var materialBack = new THREE.MeshPhongMaterial( {
		color: 'pink',
		transparent: true,
		side: THREE.BackSide,
		emissive: 'goldenrod',
		emissiveIntensity: 0.7,
		opacity: 0.8,
		polygonOffset: true,
		polygonOffsetUnits: 1,
		polygonOffsetFactor: 1,
	});
	var	materialFront = materialBack.clone();
	materialFront.side = THREE.FrontSide;
	

	
	var platesBack = new THREE.Mesh( this.planes, materialBack );
	var platesFront = new THREE.Mesh( this.planes, materialFront );
	
	platesBack.position.y = -1/2;
	platesFront.position.y = -1/2;
	
	group.add(platesBack);
	group.add(platesFront);


	this.object.position.y = this.OBJECT_HEIGHT;
////	this.objectShadow.position.y = this.OBJECT_HEIGHT;
////	this.objectShadowFlat.position.y = this.BASE_HEIGHT+0.02;

	var scale = this.OBJECT_SIZE/N;
	this.object.scale.set( scale, scale, scale );
////	this.objectShadow.scale.set( scale*0.8, scale*0.8, scale*0.8 );

	// edges
	var wireframe = new THREE.LineSegments( this.edges, new THREE.LineBasicMaterial( { color: 'brown' } ) );
	wireframe.position.y = -1/2;
	group.add(wireframe);
	
////	var wireframeShadow = new THREE.LineSegments( this.edges, new THREE.LineBasicMaterial( { color: 'black', transparent: true, opacity: 0.1 } ) );
////	wireframeShadow.position.y = -1/2;
////	groupShadow.add(wireframeShadow);

	// wrapper cube
	var geometry = new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(N,N,N));
	var material = new THREE.LineBasicMaterial({
		color: 'brown',
		transparent: true,
		opacity: 0.3,
	});
	var wrapper = new THREE.LineSegments( geometry, material );
	wrapper.position.x = 1/2;
	wrapper.position.z = 1/2;
	group.add(wrapper);
	
	var angle = Math.acos(2/Math.sqrt(2)/Math.sqrt(3));
	//var axis = new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,12*N));
	//axis.rotation.set(Math.PI/2-angle,Math.PI/4,0,'YXZ');
	//platesFront.add(axis);
	
	group.position.set(-0.6+0.03,0.4,0);
	group.rotation.set(0,Math.PI/4,-angle,'ZYX');
////	groupShadow.position.set(-0.6+0.03,0.4,0);
////	groupShadow.rotation.set(0,Math.PI/4,-angle,'ZYX');
	this.object.add( group );
////	this.objectShadow.add( groupShadow );
	this.image.add(this.object);
////	this.image.add(this.objectShadowFlat);
}	



MEIRO.Models.T004.prototype.constructAxes = function()
{
	var textureMap = MEIRO.loadTexture( "textures/002_sucktion.jpg", 1, 1 );
	//var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", 6, 1 );
	//var lightMap = MEIRO.loadTexture( "textures/003_floor_lightmap.jpg", 1, 1 );

	// axes
	var material = new THREE.MeshStandardMaterial( {
			color: 'black',
			metalness: 0.2,
			side: THREE.DoubleSide,
			emissive: 'moccasin',
			emissiveIntensity: 0.1,
			polygonOffset: true,
			polygonOffsetUnits: -1,
			polygonOffsetFactor: -1,
	});

	var geometry = new THREE.CylinderBufferGeometry( this.AXIS_RADIUS, this.AXIS_RADIUS, this.AXIS_LENGTH, 3, 12, true );
	var pos = geometry.getAttribute( 'position' );
	for (var i=0; i<pos.count; i++)
	{
		var y = pos.getY(i);
		var scale = Math.pow(1/(y/this.AXIS_LENGTH+1),2.5);
		pos.setXYZ( i, scale*pos.getX(i), y, scale*pos.getZ(i)); 
	}
	
	var axis = new THREE.Mesh( geometry, material );
	axis.rotation.x = Math.PI/6;
	axis.rotation.z = Math.PI/2;
	axis.position.x = -this.AXIS_DISTANCE;
	this.axes.add( axis );
	
	var axis = new THREE.Mesh( geometry, material );
	axis.rotation.x = -Math.PI/6;
	axis.rotation.z = -Math.PI/2;
	axis.position.x = this.AXIS_DISTANCE;
	this.axes.add( axis );

	
	// rotation discs
	var material = new THREE.MeshStandardMaterial( {
			color: 'white',
			map: textureMap,
			metalness: 0.5,
			side: THREE.DoubleSide,
			emissive: 'moccasin',
			emissiveIntensity: 0.1,
	});
	var geometry = new THREE.CylinderBufferGeometry( this.DISC_RADIUS, this.DISC_RADIUS, this.DISC_WIDTH, 40 );
	var disc = new THREE.Mesh( geometry, material );
	disc.rotation.z = -Math.PI/2;
	disc.position.x = this.AXIS_DISTANCE+this.AXIS_LENGTH/2-this.DISC_WIDTH/1.5+0.04;
	this.axes.add( disc );	
	
	var disc = disc.clone();
	disc.position.x *= -1;
	this.axes.add( disc );	
	
	this.axes.position.y = this.OBJECT_HEIGHT;

	this.image.add( this.axes );
}	


MEIRO.Models.T004.prototype.constructPillars = function()
{
	// pillars
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", this.PILLAR_WIDTH, this.OBJECT_HEIGHT );
	//var normalMap = MEIRO.loadTexture( "textures/Metal_plate_64x256_normal.jpg", this.PILLAR_WIDTH, this.OBJECT_HEIGHT );
	var lightMap = MEIRO.loadTexture( "textures/004_pillar_lightmap.jpg", 1, 1 );
	
	var geometry = new THREE.BoxBufferGeometry(this.DISC_WIDTH-0.1,this.OBJECT_HEIGHT-this.BASE_HEIGHT,this.PILLAR_WIDTH,1, 16, 1);
	MEIRO.allowLightmap(geometry);
	var material = new THREE.MeshStandardMaterial({
							color: 'white',
							//emissive: 'white',
							//emissiveIntensity: 0.1,
							metalness: 0.3,
							roughness: 0.5,
							map: textureMap,
							lightMap: lightMap,
							lightMapIntensity: -1,
							//normalMap: normalMap,
							//normalScale: new THREE.Vector2(1/3,1/3),
						})
	var normal = geometry.getAttribute('normal');
	var position = geometry.getAttribute('position');
	for (var i=0; i<normal.count; i++)
	{
		if (normal.getX(i)==0)
			normal.setXYZ(i,0,0,0);
		if (position.getY(i)<0 && position.getX(i)<0)
			position.setX(i,(1+Math.pow(-position.getY(i),2.26))*position.getX(i));
	}
	
	var pillar = new THREE.Mesh(geometry, material);
	pillar.position.set(this.AXIS_DISTANCE+this.AXIS_LENGTH/2-this.DISC_WIDTH/1.5+0.04,this.OBJECT_HEIGHT/2+this.BASE_HEIGHT/2,0);
	this.image.add(pillar);
	
	var pillar = pillar.clone();
	pillar.rotation.y = Math.PI;
	pillar.position.x *= -1;
	this.image.add(pillar);
	
	
	// pillar arks
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", this.PILLAR_WIDTH, this.PILLAR_WIDTH );
	textureMap.offset = new THREE.Vector2(0, 0.5);
//	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_64x256_normal.jpg", this.PILLAR_WIDTH, this.PILLAR_WIDTH );
	var lightMap = MEIRO.loadTexture( "textures/004_ark_lightmap.jpg", 1, 1 );
	
	var geometry = new THREE.CylinderBufferGeometry(this.PILLAR_WIDTH/2,this.PILLAR_WIDTH/2,this.DISC_WIDTH-0.1, 30, 1, false, 0, Math.PI);
	var material = new THREE.MeshStandardMaterial({
							metalness: 0.3,
							//roughness: 0.5,
							map: textureMap,
//							normalMap: normalMap,
							lightMap: lightMap,
							lightMapIntensity: -1,
						})
	MEIRO.allowLightmap(geometry);
	
	var normal = geometry.getAttribute('normal');
	for (var i=0; i<normal.count; i++)
		if (normal.getZ(i)!=0)
			normal.setXYZ(i,0,0,0);
		
	var ark = new THREE.Mesh(geometry, material);
	ark.rotation.z = Math.PI/2;
	ark.position.set(this.AXIS_DISTANCE+this.AXIS_LENGTH/2-this.DISC_WIDTH/1.5+0.04,this.OBJECT_HEIGHT,0);
	this.image.add(ark);
	
	var ark = ark.clone();
	ark.position.x *= -1;
	this.image.add(ark);
}



MEIRO.Models.T004.prototype.onObject = function()
{
	if (!this.playing) return undefined;
	
	// координати на мишка
	this.mouse.x = (controls.human.mousePos.x/window.innerWidth)*2 - 1;
	this.mouse.y = -(controls.human.mousePos.y/window.innerHeight)*2 + 1;

	this.raycaster.setFromCamera( this.mouse, camera );
	
	var intersects = this.raycaster.intersectObject( this.tube, true );
	if (intersects.length)
	{	
		this.clicks++;
		var pnt = this.tube.worldToLocal(intersects[0].point);
		if (pnt.y<0)
		{
//			console.log('up');
			this.tubeBalance = Math.PI/2+0.1;
			this.tubeDebalance = 0;
		}
		else
		{
//			console.log('down');
			this.tubeBalance = Math.PI/2-0.1;
			this.tubeDebalance = 0;
		}
		this.inBalancing = true;
		this.waterGulp.pause();
		this.waterGulp.volume = 1;
		this.waterGulp.currentTime = 0;
		this.waterGulp.play();
		return this.tube;
	}

	return undefined;
}



MEIRO.Models.T004.prototype.onDragEnd = function()
{
	this.inBalancing = false;
	this.tubeBalance = Math.PI/2;
}



// аниматор на модела
MEIRO.Models.T004.prototype.onAnimate = function(time)
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

		
////		this.objectShadow.rotation.x = rpm(time,2);
		this.object.rotation.x = rpm(time,2);
		this.axes.rotation.x = rpm(time,2);
		this.bubble.position.y -= 0.3*(this.tube.rotation.z-Math.PI/2);
		this.bubble.position.y = THREE.Math.clamp(this.bubble.position.y,-this.TUBE_LENGTH/2,this.TUBE_LENGTH/2);
		
//	console.log(-2*this.bubble.position.y/this.RULER_LENGTH*10);
		this.tube.rotation.z = THREE.Math.lerp(this.tube.rotation.z, this.tubeBalance, 0.1);
		this.userAnswer = Math.round(-this.bubble.position.y*20/this.RULER_LENGTH);
		if (!this.inBalancing && Math.abs(this.tube.rotation.z-Math.PI/2)<0.01)
		{
			// move bubble to closest integer value
			var posY = -this.userAnswer/20*this.RULER_LENGTH;
			this.bubble.position.y = THREE.Math.lerp(this.bubble.position.y,posY,0.1);
			this.waterGulp.volume *= 0.8;
		}
	}

	//TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.T004.prototype.onInfo = function(element)
{
	element.innerHTML = this.info;
}



MEIRO.Models.T004.prototype.evaluateResult = function()
{	
	var match = 0;
	var euler = this.F-this.E+this.V;
	var diff = Math.abs(this.userAnswer - euler);
	match = THREE.Math.clamp(1-0.45*diff,0,1);
	
	// user can select from -9 to 9, but the answer might be beyond
	// so, assume the end value to be equal to any value beyons
	if (euler<-8.5 && this.userAnswer<-8.5) match = 1;
	if (euler>+8.5 && this.userAnswer>+8.5) match = 1;
	
	
	this.config.score = match*this.config.max_score;

	this.config.time =  Math.floor((animationLoop.time-this.startTime)/1000);
	
//	console.log('score=',this.config.score);
	this.info = '';
	this.info += '<h1 style="text-align:center;">Характерният брой &ndash; '+Math.round(1000*this.config.score)/10+' от '+Math.round(1000*this.config.max_score)/10+' точки</span></h1>';

	this.info += '<p>Конструкцията има ойлерова характеристика F-E+V='+euler+'. Вашият отговор е '+this.userAnswer+'.</p>';

//	console.log('evaluation=',this.config.score*match);
}



MEIRO.Models.T004.prototype.sendResult = function(callback)
{
	var competences = [];
	for (var i=0; i<MEIRO.Models.T004.COMPETENCES.length; i++)
		competences.push( Math.round(100*MEIRO.Models.T004.COMPETENCES[i]*this.config.score)/100 );
	
	var data = new FormData();
	data.append('ACTION', 'END');
	data.append('MODEL', 'T004');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	data.append('SCORE', Math.round(100*this.config.score)/100);
	data.append('TIME', this.config.time);
	data.append('CLICKS', this.clicks);
	data.append('COMPETENCES', competences);
	postData(data,callback,callback);
}



MEIRO.Models.T004.prototype.sendStartup = function(callback)
{
	var data = new FormData();
	data.append('ACTION', 'START');
	data.append('MODEL', 'T004');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	postData(data,callback,callback);
}



MEIRO.Models.T004.prototype.onEnter = function(element)
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
MEIRO.Models.T004.prototype.onExitModel = function(element)
{
	//MEIRO.Model.prototype.onExit.call(this);
	
	var that = this;
	
	that.playing = false;
	that.evaluateResult();
	new TWEEN.Tween({k:1})
		.to({k:EPS},500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
			// анимация при деактивиране на модела
		} )
		.start();
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
MEIRO.Models.T004.prototype.configure = function(difficulty)
{	
	this.config = {difficulty: difficulty};
		
	var max_score = 0;
	var s = x = y = z = sum = 0;
	var limit = {from:0, to:0};
	var map = {from:0, to:0};
	
	var attempt = 30;
	while (--attempt > 0)
	{
		switch (difficulty)
		{
			// ниска трудност (10-20)
			case DIFFICULTY_LOW:
				s = random(3,5);
				sum = random(1,3);
				limit = {from:0.10, to:0.30};
				map   = {from:0.10, to:0.20};
				break;
				
			// средна трудност (30-40)
			case DIFFICULTY_MEDIUM:
				s = random(5,7);
				sum = random(2,5);
				limit = {from:0.20, to:0.40};
				map   = {from:0.30, to:0.40};
				break;
				
			// висока трудност (70-100)
			case DIFFICULTY_HIGH:
				s = random(8,11);
				sum = random(5,6);
				limit = {from:0.50, to:1.00};
				map   = {from:0.70, to:1.00};
				break;
				
			default: console.error('Unknown difficulty level');
		}
				
		x = random(0,sum-1);
		y = random(0,sum-x);
		z = sum-x-y;

		this.config.size = s;
		this.config.tunnels = {x:x,y:y,z:z};
		this.constructObject();

		var complexity = this.W;
		var euleristic1 = (this.F-this.E+this.V)!=2?1.25:1;		// *1,25 if euler not 2
		var euleristic2 = (100+this.F-this.E+this.V)%2?1.25:1;	// *1.25 if euler odd
		max_score = (complexity*euleristic1*euleristic2)/300;
		//break;
		
		//console.log('diff='+difficulty,' max_score=',max_score,'limit=[',limit.from,'..',limit.to,']');
		//if (max_score<limit.from) console.log('spoiled');
		if (max_score<limit.from)
		{
			if (!IN_SCORE_STATISTICS)
			{
				this.planes.dispose();
				this.edges.dispose();
			}
			continue;
		}
		if (max_score>limit.to) continue;
		
		break;
	}
	this.constructObjectImage();
	//if (30-attempt!=1) console.log('attempts',30-attempt);
	max_score = THREE.Math.mapLinear(max_score,limit.from,limit.to,map.from,map.to);
	max_score = THREE.Math.clamp(max_score,map.from,map.to);

	//	console.log('max_score=',max_score,' tunnels:',x,y,z);

	// recalibrate, because scores are crowded near the
	// bottom limit (=map.from)
	max_score = (max_score-map.from)/(map.to-map.from);
	max_score = Math.pow(max_score,1/6);
	max_score = max_score*(map.to-map.from)+map.from;
//	console.log('new_score=',max_score);
	
	this.config.max_score = max_score;
	if (!IN_SCORE_STATISTICS)
	{
		this.sendStartup();
	}
}


// извежда статистика за шъзмовните конфигурации
MEIRO.Models.T004.prototype.configureStats = function()
{	
	IN_SCORE_STATISTICS = true;
	
	var data = [];
	var that = this;
	
	var NUMBER_OF_TESTS = 1000;
	var REPORT_NUMBER_OF_TESTS = NUMBER_OF_TESTS/50;

	
	function calculateStats(difficulty,name)
	{
		var min=10000000;
		var max=0;
		var avg = 0;
		for(var i=0; i<NUMBER_OF_TESTS; i++)
		{
			if (i%REPORT_NUMBER_OF_TESTS==0) console.log('done',i,'tests of',NUMBER_OF_TESTS);
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