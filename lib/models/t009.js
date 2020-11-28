
var SCORE_STATISTICS = !true;
var IN_SCORE_STATISTICS = false;

//	Основи на Компютърната Графика
//	Тест XXX - Xxxx Xx Xxxxxxxxxx
//	П. Бойчев, 2019
//
//	 ├─ T009
//	 │   ├─ initialize()
//	 │   ├─ construct()
//	 │ 	 │    ├─ constructFloor()
//	 │ 	 │    ├─ constructBase()
//	 │ 	 │    ├─ constructMaze()
//	 │ 	 │    ├─ reduceMaze()
//	 │ 	 │    ├─ generateMaze()
//	 │ 	 │    ├─ constructButterfly()
//	 │ 	 │    ├─ randomizeButterflyPosition()
//	 │ 	 │    ├─ randomizeButterflyOrientation()
//	 │ 	 │    ├─ constructGlassBoxBases()
//	 │ 	 │    ├─ constructGlassBoxes()
//	 │ 	 │    ├─ constructGlassBoxModel()
//	 │ 	 │    ├─ constructButtons()
//	 │ 	 │    ├─ constructDNA()
//	 │   │    └─ configureStats()
//	 │   ├─ onAnimate()
//	 │ 	 │    ├─ setButterflyPosition(x,y,z)
//	 │ 	 │    └─ butterflyAction()
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
MEIRO.Models.T009 = function T009(room, model)
{
	MEIRO.Model.apply(this, arguments);
	
	this.initialize();
	this.construct();
}
MEIRO.Models.T009.prototype = Object.create(MEIRO.Model.prototype);



MEIRO.Models.T009.DIST = {MIN:12, MAX:22, HEIGHT:0};
MEIRO.Models.T009.POS = {DIST:22, ROT_X:0.9, ROT_Y:0.15, ON_FLOOR:true};
MEIRO.Models.T009.ROT_Y = {MIN:0.0, MAX:1.56};
MEIRO.Models.T009.SCALE = {MAX:0.25};
MEIRO.Models.T009.COMPETENCES = [0,0,1,2,0, 0,2,5,0, 0,1,2, 1,2,5,0,0];



MEIRO.Models.T009.prototype.initialize = function()
{
	if (SCORE_STATISTICS) this.configureStats();
	
	random.randomize();

	this.FLOOR_SIZE = 9;
	
	this.BASE_SIZE = 7;
	this.BASE_HEIGHT = 1;
	
	this.BUTTERFLY_SIZE = 0.2;
	//this.BUTTERFLY_SIZE2 = 0.20;
	this.STEPS = 80;
	this.STEPSrot = 35;
	
	this.TARGET_SIZE = 0.10;

	this.BUTTON_RADIUS = 0.3;
	this.buttons = new THREE.Group();
	this.image.add( this.buttons );
	
	this.BOX_SIZE = 3.5;
	this.BOX_HEIGHT = 0.25;
	this.BOX_GLASS_HEIGHT = 7;
	this.BOX_DISTANCE = this.BASE_SIZE/2+this.BOX_SIZE/2+1.5;
	this.BUTTERFLY_DISTANCE = this.BOX_DISTANCE+this.BOX_SIZE/6;
	this.AXIS_RADIUS = 0.02;

	this.buttonLight = new THREE.PointLight('white',0);
	this.image.add( this.buttonLight );
	
	this.colors = {
		D: 'gold',
		U: 'indigo',
		L: 'deeppink',
		R: 'cornflowerblue',
		l: 'limegreen',
		r: 'chocolate',
		F: 'white'
	};

	this.buttonEcho = new Audio('sounds/button-echo.mp3');
	this.buttonEcho.loop = false;
	this.buttonEcho.pause();
	
	this.wingsFapping = new Audio('sounds/wings-flapping.mp3');
	this.wingsFapping.loop = true;
	this.wingsFapping.pause();
	
	this.commands = '';
	this.commandsCount = 0;
	this.dnaCommands = '';

	this.DNA_HEIGHT = 0.2;
	this.DNA_ANGLE = 0.16;
	this.DNA = new THREE.Group();
	this.DNA.position.set( -this.BOX_DISTANCE, this.BOX_HEIGHT-this.DNA_HEIGHT/2, 0 );
	this.image.add( this.DNA );
	
	this.links = [];
	
	this.exiting = false;
	this.playing = false;
	this.startTime = 0;
	this.lastTime = 0;
	this.clicks = 0;
}

	

MEIRO.Models.T009.prototype.construct = function()
{
	// допълнителна светлина, прави пода по-красив
	var light = new THREE.PointLight( 'white', 0.3 );
	light.position.set( 0, 10, 0 );
	this.image.add( light );
	

	this.constructGlassBoxBases();
	this.constructGlassBoxes();
	this.constructFloor();
	this.constructDNA();
	
	
	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();


	// бутон за стартиране/приключване
	var that = this;
	this.buttonTimer = new MEIRO.CornerButton('topLeft', function(){that.onExitModel();}, '0:00', 'images/time.png');
	this.buttonTimer.hide();

	this.defaultInfo = '<h1>Полетът на пеперудата</h1>';
	this.defaultInfo += '<p>Дадена е мрежа от линии и пеперуда в един от върховете. На друг връх има сфера. Трябва да генерирате ДНК на пеперудата по такъв начин, че летейки само по мрежата да достигне до сферата. ДНК-то да пеперудата се създава с натискане на цветните стрелки, които обозначават ходовете на пеперудата &ndash; завъртане или движение напред. С белите кръгли бутони може да проверите докъде достига текущо определеният код. Тези бутони са само за еднократна употреба.</p>';
}



MEIRO.Models.T009.prototype.constructDNA = function()
{
	this.dnaGeometry = new THREE.BoxBufferGeometry(this.BOX_SIZE/2,this.DNA_HEIGHT*0.85,2*this.DNA_HEIGHT,7,1,1);
	
	var sin = Math.sin(this.DNA_ANGLE-0.02);
	var cos = Math.cos(this.DNA_ANGLE-0.02);
	
	var pos = this.dnaGeometry.getAttribute('position');
	for (var i=0; i<pos.count; i++)
	{
		var x = pos.getX(i);
		var y = pos.getY(i);
		var z = pos.getZ(i);
		var bump = 0.5+0.5*Math.cos(x*Math.PI*1.1);
		z *= bump;
		
		if (y>0)
		{
			// rotate (x,z) by angle 
			var xx = x*cos+z*sin;
			var zz = z*cos-x*sin;
			x = xx;
			z = zz;
		}
		pos.setZ(i,z);
	}
	
	this.dnaMaterial = new THREE.MeshStandardMaterial({
		color: 'white',
		metalness: 0,
		transparent: !true,
		opacity: 0.4,
	});


}



MEIRO.Models.T009.prototype.constructFloor = function()
{
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", this.FLOOR_SIZE, this.FLOOR_SIZE );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg" );
	var lightMap = MEIRO.loadTexture( "textures/009_floor_lightmap.jpg", 1, 1 );

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
	
	// half circles
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", this.FLOOR_SIZE, this.FLOOR_SIZE );
	textureMap.offset = new THREE.Vector2(0,0.5);
	var lightMap = MEIRO.loadTexture( "textures/009_floor_glass_lightmap.jpg", 1, 1 );
	lightMap.rotation = Math.PI/2;
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
	var geometry = new THREE.CircleBufferGeometry(this.FLOOR_SIZE/2, 30, 0, Math.PI);
	MEIRO.allowLightmap(geometry);
	var floor = new THREE.Mesh( geometry, material );
	floor.position.x = -this.FLOOR_SIZE/2;
	floor.rotation.set(-Math.PI/2,Math.PI/2,0,'YXZ');
	this.image.add( floor );
	var floor = new THREE.Mesh( geometry, material );
	floor.position.x = this.FLOOR_SIZE/2;
	floor.rotation.set(-Math.PI/2,-Math.PI/2,0,'YXZ');
	this.image.add( floor );
}	



MEIRO.Models.T009.prototype.constructGlassBoxBases = function()
{
	// base
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_64x256.jpg", 1, 16 );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_64x256_normal.jpg" );
	textureMap.rotation = Math.PI/2;
	
	var geometry = new THREE.CylinderBufferGeometry( this.BOX_SIZE/2, this.BOX_SIZE/2, this.BOX_HEIGHT, 32, 1 );
	
	var base = new THREE.Mesh(
		geometry,
		new THREE.MeshStandardMaterial( {
				color: 'dimgray',
				metalness: 0.7,
				map: textureMap,
				normalMap: normalMap,
		})
	);
	base.position.y = this.BOX_HEIGHT/2;
	base.position.x = this.BOX_DISTANCE;
	this.image.add( base );
	
	base = base.clone();
	base.position.x = -this.BOX_DISTANCE;
	this.image.add( base );
}


MEIRO.Models.T009.prototype.constructGlassBoxes = function()
{
	var textureMap = MEIRO.loadTexture( "textures/008_net_alpha.jpg", 16, 24 );

	var normalMap = MEIRO.loadTexture( "textures/metric_plate_256x256_normal.jpg" );

	var geometry = new THREE.CylinderBufferGeometry( this.BOX_SIZE/2, this.BOX_SIZE/2, this.BOX_GLASS_HEIGHT, 24, 12, true );
	
	var pos = geometry.getAttribute('position');
	var uv = geometry.getAttribute('uv');
	for (var i=0; i<pos.count; i++)
	{
		var y = pos.getY(i);
		if (y>-this.BOX_GLASS_HEIGHT/2)
		{
			y = this.BOX_GLASS_HEIGHT/2 - (this.BOX_GLASS_HEIGHT/2-y)/3;
			pos.setY(i,y);
		}
		uv.setY(i,y/16);
	}
	
	for (var i=0; i<pos.count; i++)
	{
		var x = pos.getX(i);
		var y = pos.getY(i);
		var z = pos.getZ(i);
		var k = y;
		if (k>0)
		{
			k = k/(this.BOX_GLASS_HEIGHT/2); // k in [0,1]
			k = (1-Math.pow(k,5));

			y = y;
			
			x *= k;
			z *= k;
			pos.setXYZ(i,x,y,z);
		}
	}
	geometry.computeVertexNormals();
	
	var material = new THREE.MeshStandardMaterial( {
			color: 'cornflowerblue',
			metalness: 0.8,
			map: textureMap,
			normalMap: normalMap,
			normalScale: new THREE.Vector2(2,2),
			transparent: true,
			opacity: 0.15,
			emissive: 'cornflowerblue',
			emissiveIntensity: 0.5,
			//lightMap: lightMap,
			//lightMapIntensity: 2,
			side: THREE.FrontSide,
			polygonOffset: true,
			polygonOffsetUnits: -2,
			polygonOffsetFactor: -2,
	});

	// back faces
	var box = new THREE.Mesh( geometry, material );
	box.position.set( this.BOX_DISTANCE, this.BOX_GLASS_HEIGHT/2+this.BOX_HEIGHT, 0 );
	box.renderOrder = 10;
	this.image.add( box );
	
	box = box.clone();
	box.position.x = -this.BOX_DISTANCE;
	this.image.add( box );

	// back faces
	material = material.clone();
	material.side = THREE.BackSide;
	box = box.clone();
	box.material = material;
	box.renderOrder = 5;
	this.image.add( box );
	box = box.clone();
	box.position.x = this.BOX_DISTANCE;
	this.image.add( box );

}

MEIRO.Models.T009.prototype.constructButtons = function()
{
	var geometry = new THREE.CylinderBufferGeometry( this.BUTTON_RADIUS, this.BUTTON_RADIUS, this.BASE_SIZE+0.1, 30, 4 );
	pos = geometry.getAttribute('position');
	for (var i=0; i<pos.count; i++)
	{
		var x = pos.getX(i);
		var y = pos.getY(i);
		var z = pos.getZ(i);
		if (Math.abs(y)>this.BASE_SIZE/2)
		{
			x *= 0.8;
			z *= 0.8;
		}
		else
			y *= 1.98;
		pos.setXYZ(i,x,y,z);
	}
	geometry.computeVertexNormals();
	
	var material = new THREE.MeshStandardMaterial({
		color: 'white',
		metalness: 0,
		emissive: 'white',
		emissiveIntensity: 0,
	});
	
	var that = this;
	function defineButton(name,position)
	{
		material = material.clone();
		material.color = new THREE.Color('white');
		var button = new THREE.Mesh( geometry, material );
		button.rotation.x = Math.PI/2;
		button.position.set(position,that.BASE_HEIGHT/2,0);
		button.name = name;
		that.buttons.add( button );
	}
	
	switch (this.config.attempts)
	{
		case 1:
			defineButton('x', 0); // 3 1
			break;
		case 2:
			defineButton('x',-1); // 3 2 
			defineButton('x',+1); // 3 2
			break;
		case 3:
			defineButton('x',-1); // 3 2 
			defineButton('x', 0); // 3 1
			defineButton('x',+1); // 3 2
			break;
	}
}


MEIRO.Models.T009.prototype.constructGlassBoxModel = function()
{
	var N = this.config.size;
	
	// directional arrows
	var geometryBody = new THREE.TorusBufferGeometry( 1, 0.05, 8, 8, Math.PI/2-0.38  );
	var geometryBodyS = new THREE.CylinderBufferGeometry( 0.05, 0.05, 2.5, 8, 1  );
	var geometryTip = new THREE.ConeBufferGeometry( 0.05, 0.2, 12, 1 );
	geometryTip.rotateZ(-0.5);
	geometryTip.translate(0.07,-0.1,0);
	var that = this;
	
	function createArrow(name)
	{
		var OFS = 0.3;
		
		var material = new THREE.MeshStandardMaterial({
				color: that.colors[name],
				emissive: that.colors[name],
				emissiveIntensity: 0.5,
				side: THREE.DoubleSide,
		});

		var arrow = new THREE.Group();
		arrow.position.set( that.BUTTERFLY_DISTANCE, that.BOX_SIZE/2, 0 );
		arrow.scale.set(1,1,6);
		arrow.name = name;
		
		var body = new THREE.Mesh( geometryBody, material );
		body.position.x = OFS;
		body.position.y = OFS;
		body.name = name;
		arrow.add(body);
		var tip = new THREE.Mesh( geometryTip, material );
		tip.scale.set(0.9,2,2);
		tip.rotation.z = Math.PI/2;
		tip.position.x = OFS;
		tip.position.y = OFS+0.91;
		tip.name = name;
		arrow.add(tip);
		
		return arrow;
	}
	
	function createStraightArrow(name)
	{
		var material = new THREE.MeshStandardMaterial({
				color: that.colors[name],
				emissive: that.colors[name],
				emissiveIntensity: 0.5,
				side: THREE.DoubleSide,
		});

		var arrow = new THREE.Group();
		arrow.position.set( that.BUTTERFLY_DISTANCE, that.BOX_SIZE/2, 0 );
		//arrow.position.y = 0.5;
		arrow.scale.set(1,1,6);
		arrow.name = name;
		
		var body = new THREE.Mesh( geometryBodyS, material );
		body.position.y = 1/2;
		body.name = name;
		arrow.add(body);
		var tip = new THREE.Mesh( geometryTip, material );
		tip.rotation.z = 0.3;
		tip.scale.set(0.9,2,2);
		tip.position.y = 2;
		tip.position.x = -0.12;
		tip.name = name;
		arrow.add(tip);
		
		return arrow;
	}
	
	var cmd = 'DULRlr';
	for (var i=0; i<7-this.config.commands; i++)
	{
		var idx = random(1,cmd.length);
		cmd = cmd.substring(0,idx-1) + cmd.substring(idx,cmd.length);
	}
	//console.log('cmds =',this.config.commands,cmd);
	
	if (cmd.indexOf('D')>=0)
	{	// down
		var arrow = createArrow('D');
		arrow.rotation.z = Math.PI;
		this.buttons.add( arrow );
	}
	if (cmd.indexOf('U')>=0)
	{	// up
		var arrow = createArrow('U');
		arrow.rotation.y = Math.PI;
		this.buttons.add( arrow );
	}
	if (cmd.indexOf('L')>=0)
	{ // left
		var arrow = createArrow('L');
		arrow.rotation.set(Math.PI/2,Math.PI,0);
		this.buttons.add( arrow );
	}
	if (cmd.indexOf('R')>=0)
	{ // right
		var arrow = createArrow('R');
		arrow.rotation.set(-Math.PI/2,Math.PI,0);
		this.buttons.add( arrow );
	}
	if (cmd.indexOf('l')>=0)
	{ // left roll
		var arrow = createArrow('l');
		arrow.rotation.set(Math.PI/2+Math.PI/4,Math.PI/2,0);
		arrow.position.x += 0.25;
		this.buttons.add( arrow );
	}
	if (cmd.indexOf('r')>=0)
	{ // right roll
		var arrow = createArrow('r');
		arrow.rotation.set(-Math.PI/2-Math.PI/4,-Math.PI/2,0);
		arrow.position.x += 0.25;
		this.buttons.add( arrow );
	}
	// forward
	var arrow = createStraightArrow('F');
	arrow.rotation.z = Math.PI/2;
	this.buttons.add( arrow );

	
	
/*	
	var butterfly = this.butterfly.clone(true);
	butterfly.matrixAutoUpdate = true;
	butterfly.scale.set(this.BUTTERFLY_SIZE2,this.BUTTERFLY_SIZE2,this.BUTTERFLY_SIZE2);
	butterfly.position.set(this.BUTTERFLY_DISTANCE, this.BOX_SIZE/2.4, 0);
	butterfly.rotation.z = Math.PI/2;
	this.wing1a = butterfly.getObjectByName('wing1');
	this.wing2a = butterfly.getObjectByName('wing2');

	this.image.add( butterfly );
*/
}
	
MEIRO.Models.T009.prototype.constructBase = function()
{
	// base
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", 4*this.BASE_SIZE, this.BASE_HEIGHT );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg" );
	var lightMap = MEIRO.loadTexture( "textures/009_base_lightmap.jpg" );

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
	this.base = base;
	this.image.add( base );

	// black top
	var geometry = new THREE.PlaneBufferGeometry(this.BASE_SIZE,this.BASE_SIZE);
	MEIRO.allowLightmap(geometry);

	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", this.BASE_SIZE, this.BASE_SIZE );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg" );
	var lightMap = MEIRO.loadTexture( "textures/009_base_"+this.config.difficulty+"_lightmap.jpg" );

	var base = new THREE.Mesh(
		geometry,
		new THREE.MeshStandardMaterial( {
				color: 'white',
				metalness: 0.2,
				map: textureMap,
				//normalMap: normalMap,
				emissive: 'white',
				emissiveIntensity: 0.1,
				lightMap: lightMap,
				lightMapIntensity: 1,
		})
	);
	base.position.y = this.BASE_HEIGHT;
	base.rotation.x = -Math.PI/2;
	this.baseTop = base;
	this.image.add( base );
}



MEIRO.Models.T009.prototype.constructMaze = function()
{
	var N = this.config.size;

	this.links = [];
	this.nodes = [];
	
	for (var x = 0; x<=N; x++)
	for (var y = 0; y<=N; y++)
	for (var z = 0; z<=N; z++)
	{
		this.nodes.push('A'+x+y+z);
		if (x<N) this.links.push(['A'+x+y+z,'A'+(x+1)+y+z,'z',2*x+1,2*y,2*z]);
		if (y<N) this.links.push(['A'+x+y+z,'A'+x+(y+1)+z,'y',2*x,2*y+1,2*z]);
		if (z<N) this.links.push(['A'+x+y+z,'A'+x+y+(z+1),'x',2*x,2*y,2*z+1]);
	}
	
//	console.log(this.nodes);
//	console.log(this.links);
}



MEIRO.Models.T009.prototype.reduceMaze = function()
{
	var reduceAttempts = Math.round(this.links.length*(1-this.config.links));
	for (var i=0; i<reduceAttempts; i++)
	{
		var n = random(0,this.links.length-1);
		var old = this.links[n];
		//console.log('try to remove',old);
		this.links[n] = '';
		if (this.isConnectedMaze())
		{
			//console.log('OK to remove');
		}
		else
		{
			//console.log('FAILED to remove');
			this.links[n] = old;
		}
	}
}



MEIRO.Models.T009.prototype.isConnectedMaze = function()
{
	var left = [];
	var todo = [];
	
	function process(elem)
	{
		var idx = left.indexOf(elem);
		if (idx<0) return; // already processed

		todo.push(left[idx]); // add to todo
		left.splice(idx,1); // remove from left
	}
	
	for (var i=0; i<this.nodes.length; i++)
		left.push(this.nodes[i]);
	
	process(this.nodes[0]);
	while (todo.length)
	{
		var node = todo[0];
		//console.log('=======',node);
		for (var i=0; i<this.links.length; i++)
		{
			var link = this.links[i];
			if (link[0]==node)
				process(link[1]);
			else if (link[1]==node)
				process(link[0]);
		}
		todo.splice(0,1); // remove from todo
		//console.log('left',left);
		//console.log('todo',todo);
	}
	
	return left.length==0;
}



MEIRO.Models.T009.prototype.distanceInMaze = function(from,to)
{
	if (from==to) return 0;
	
	var left = [];
	var todo = [];
	
	function process(elem)
	{
		var idx = left.indexOf(elem);
		if (idx<0) return; // already processed

		todo.push(left[idx]); // add to todo
		left.splice(idx,1); // remove from left
	}
	
	for (var i=0; i<this.nodes.length; i++)
		left.push(this.nodes[i]);
	
	var distance = 1;
	process(from);
	todo.push('+');
	while (todo.length)
	{
		var node = todo[0];
		if (node=='+')
		{
			if (todo.length==1) return -1;
			todo.splice(0,1); // remove from todo
			todo.push('+');
			distance++;
			continue;
		}
		
		for (var i=0; i<this.links.length; i++)
		{
			var link = this.links[i];
			if (link[0]==node)
			{
				if (link[1]==to) return distance;
				process(link[1]);
			}
			else if (link[1]==node)
			{
				if (link[0]==to) return distance;
				process(link[0]);
			}
		}
		todo.splice(0,1); // remove from todo
	}
	
	return distance;
}



MEIRO.Models.T009.prototype.generateMaze = function()
{
	var N = this.config.size;

	// tube part
	var geometry = new THREE.CylinderBufferGeometry( 0.02*N/3, 0.02*N/3, 2.05, 4, 4 );
	var pos = geometry.getAttribute('position');
	for (var i=0; i<pos.count; i++)
	{
		x = pos.getX(i);
		y = pos.getY(i);
		z = pos.getZ(i);
		if (y<-0.9 || y>0.9)
		{
			x *= 3;
			z *= 3;
		}
		else
			y *= 1.5;
		if (x*x+z*z<0.0001)
			y *= 1.02;
		pos.setXYZ(i,x,y,z);
	}
	
	geometry.rotateY(Math.PI/4);
	

	this.maze = new THREE.Group();
	this.maze.position.set(-3,this.BASE_HEIGHT+1,-3);
	this.maze.scale.set(3/N,3/N,3/N);
	this.image.add( this.maze );
	
	// helpers
/*	
	var material = new THREE.MeshStandardMaterial({
		color: 'black',
		metalness: 0.5,
		flatShading: true,
	});
	var geo = new THREE.IcosahedronBufferGeometry(0.1*N/3,1);
	for (var x = 0; x<=N; x++)
	for (var z = 0; z<=N; z++)
	for (var y = 0; y<=N; y++)
	{
		var cube = new THREE.Mesh( geo, material );
		cube.position.set(2*x,2*y,2*z);
		this.maze.add( cube );
	}
	*/

	// links
	var material = new THREE.MeshBasicMaterial({
		color: 'black',
	});
	for (var i=0; i<this.links.length; i++) if (this.links[i])
	{
		var dir = this.links[i][2];
		var x = this.links[i][3];
		var y = this.links[i][4];
		var z = this.links[i][5];

		var cube = new THREE.Mesh( geometry, material );
		cube.position.set(x,y,z);
		cube.rotation[dir] = Math.PI/2;
		this.maze.add( cube );
	}
}


MEIRO.Models.T009.prototype.constructButterfly = function()
{
	var N = this.config.size;
	const OFS = 1.5;
	
	this.butterfly = new THREE.Group();
	this.maze.add( this.butterfly );
	
	this.butterflySub = new THREE.Group();
	this.butterfly.add( this.butterflySub );
	
	var bodyPoints = [0,0,8,3,10,3,11,2,12,3,14,3,15,2,16,3,18,3,19,2,20,3,22,3,23,2,24,3,26,3,27,2,29,3,31,4,36,5,41,4,44,2,45,1,46,2,47,3,49,3,51,1,51,0];
	var points = [];
	for (var i=0; i<bodyPoints.length; i+=2)
		points.push( new THREE.Vector2(bodyPoints[i+1]/10,bodyPoints[i]/10	) );

	var geometry = new THREE.LatheBufferGeometry( points,8 );
	var pos = geometry.getAttribute('position');
	for (var i=0; i<pos.count; i++)
	{
		var x = pos.getX(i);
		var y = pos.getY(i);
		var z = pos.getZ(i);
		
		y = y-3.6;
		x = x-Math.cos(y*1.5)/6;
		pos.setXYZ(i,x,y,z);
	}
	
	var textureMap = MEIRO.loadTexture( "textures/009_butterfly_body.jpg", 2, 1 );
	//textureMap.rotation = Math.PI/2;
	var material = new THREE.MeshBasicMaterial({
		map: textureMap,
		color: 'white',
	});
	
	var body = new THREE.Mesh( geometry, material );
	body.position.x = OFS;
	this.butterflySub.add( body );
	
	// eyes
	var geometry = new THREE.IcosahedronBufferGeometry(0.2,1);
	var material = new THREE.MeshStandardMaterial({
		color: 'cornflowerblue',
		metalness: 0.8,
		flatShading: true,
	});
	
	var eye = new THREE.Mesh(geometry,material);
	eye.position.set(0.05+OFS,1.23,0);
	eye.scale.set(1.5,1.5,1.8);
	this.butterflySub.add(eye);
	// wings
	var textureMap = MEIRO.loadTexture( "textures/009_butterfly_wings.jpg", 0.95, 0.95 );
	var alphaMap = MEIRO.loadTexture( "textures/009_butterfly_wings_alpha.jpg" );
	textureMap.wrapS = THREE.ClampToEdgeWrapping;
	textureMap.wrapT = THREE.ClampToEdgeWrapping;
	
	geometry = new THREE.PlaneBufferGeometry( 6, 6, 4, 4 );
	
	geometry.translate(3,-2,0);
	material = new THREE.MeshBasicMaterial({
		//color: 'red',
		map: textureMap,
		transparent: true,
		alphaMap: alphaMap,
		side: THREE.DoubleSide,
		depthWrite: false,
	});
	
	this.wing1 = new THREE.Mesh( geometry, material );
	this.wing1.position.x = OFS;
	this.wing1.position.z = 0.3;
	//this.wing1.name = 'wing1';
	this.butterflySub.add( this.wing1 );
	
	this.wing2 = new THREE.Mesh( geometry, material );
	this.wing2.position.x = OFS;
	this.wing2.position.z = -0.3;
	//this.wing2.name = 'wing2';
	this.butterflySub.add( this.wing2 );
	
	
	// antenae
	var material = new THREE.MeshBasicMaterial({color:0});
	var geometry = new THREE.BoxBufferGeometry(0.02,2,0.02);
	geometry.translate(0,1,0);
	
	var antena = new THREE.Mesh(geometry,material);
	antena.position.set( 0.2+OFS, 1.2, 0.2 );
	antena.rotation.set( 0.5, 0, -0.5);
	this.butterflySub.add( antena );

	var antena = new THREE.Mesh(geometry,material);
	antena.position.set( 0.2+OFS, 1.2, -0.2 );
	antena.rotation.set( -0.5, 0, -0.5);
	this.butterflySub.add( antena );
	
	// legs
	var leg = new THREE.Mesh(geometry,material);
	leg.position.set( 0+OFS, 0.1, 0 );
	leg.rotation.set( 1, 0, 0.75 );
	this.butterflySub.add( leg );
	var leg = new THREE.Mesh(geometry,material);
	leg.position.set( 0+OFS, 0.1, 0 );
	leg.rotation.set( -1, 0, 0.75 );
	this.butterflySub.add( leg );
	var leg = new THREE.Mesh(geometry,material);
	leg.position.set( 0+OFS, 0, 0 );
	leg.rotation.set( 1.5, 0, 0.75 );
	this.butterflySub.add( leg );
	var leg = new THREE.Mesh(geometry,material);
	leg.position.set( 0+OFS, 0, 0 );
	leg.rotation.set( -1.5, 0, 0.75 );
	this.butterflySub.add( leg );
	var leg = new THREE.Mesh(geometry,material);
	leg.position.set( 0+OFS, -0.1, 0 );
	leg.rotation.set( 2, 0, 0.75 );
	this.butterflySub.add( leg );
	var leg = new THREE.Mesh(geometry,material);
	leg.position.set( 0+OFS, -0.1, 0 );
	leg.rotation.set( -2, 0, 0.75 );
	this.butterflySub.add( leg );
	
	
//	this.butterfly.scale.set(1.2,1.2,1.2);
	this.BUTTERFLY_SIZE *= N/3;
	this.butterfly.scale.set(this.BUTTERFLY_SIZE,this.BUTTERFLY_SIZE,this.BUTTERFLY_SIZE);
	this.butterfly.updateMatrix();
	this.butterfly.matrixAutoUpdate = false;
	this.butterfly.matrix.multiply(this.mat.D90);
}



MEIRO.Models.T009.prototype.randomizeButterflyPosition = function()
{
	var N = this.config.size;

	var p = {};
	p.x = random(0,N);
	p.y = random(0,N);
	p.z = random(0,N);
	p[(['x','y','z'])[random(0,2)]] = random(0,1)?0:N;
	
	// set random position
	this.butterflyStartPos = new THREE.Vector3(p.x,p.y,p.z);
	this.butterflyTargetPos = new THREE.Vector3(N-p.x,N-p.y,N-p.z);
	
	var butterflyCode = 'A'+p.x+p.y+p.z;
	this.targetCode = 'A'+(N-p.x)+(N-p.y)+(N-p.z);
	this.butterflyFlightDistance = this.distanceInMaze(butterflyCode,this.targetCode);
	
//	console.log('from',butterflyCode,'to',this.targetCode);
}



MEIRO.Models.T009.prototype.randomizeButterflyOrientation = function()
{
	this.setButterflyPosition(this.butterflyStartPos.x,this.butterflyStartPos.y,this.butterflyStartPos.z);
	
	var N = this.config.size;
	
	// set random orientation
	for (var i=0; i<5; i++)
	{
		if (Math.random()<0.5) this.butterfly.matrix.multiply(this.mat.L90);
		if (Math.random()<0.5) this.butterfly.matrix.multiply(this.mat.D90);
		if (Math.random()<0.5) this.butterfly.matrix.multiply(this.mat.r90);
	}
	
	// define target
	var geometry = new THREE.IcosahedronBufferGeometry(this.TARGET_SIZE,1);
	var material = new THREE.MeshStandardMaterial({
		color: 'orange',
		metalness: 0.7,
		flatShading: true,
	});
	
	var target = new THREE.Mesh( geometry, material );
	target.position.set(2*this.butterflyTargetPos.x,2*this.butterflyTargetPos.y,2*this.butterflyTargetPos.z);
	target.scale.set(N,N,N);
	this.maze.add(target);
}



MEIRO.Models.T009.prototype.setButterflyPosition = function(x,y,z)
{
	this.butterfly.matrix.setPosition(new THREE.Vector3(2*x,2*y,2*z));
}



MEIRO.Models.T009.prototype.hasDirectLink = function(a1,a2)
{
	for (var i=0; i<this.links.length; i++)
	{
		var link = this.links[i];
		if (link[0]==a1 && link[1]==a2) return true;
		if (link[0]==a2 && link[1]==a1) return true;
	}
	return false;
}



MEIRO.Models.T009.prototype.butterflyAction = function()
{
	this.butterflySub.position.set( 0,0,0 );
	if (this.commands=='') return;
	
	if (this.commandsCount==0)
	{
		this.wingsFapping.pause();
		
		this.commands = this.commands.substr(1);
		if (this.commands=='')
		{
			if (this.exiting) this.onExitModel();
			return;
		}
		this.commandsCount = this.STEPSrot;
		
		// if moving forward check wether it is possible
		if (this.commands[0]=='F')
		{
			this.commandsCount = this.STEPS;
		
			var mat = this.butterfly.matrix.clone();
			var x1 = Math.round(mat.elements[12]/2); // current position
			var y1 = Math.round(mat.elements[13]/2);
			var z1 = Math.round(mat.elements[14]/2);
			var p1 = 'A'+x1+y1+z1;
			mat.multiply(this.mat.F90);
			var x2 = Math.round(mat.elements[12]/2); // new position
			var y2 = Math.round(mat.elements[13]/2);
			var z2 = Math.round(mat.elements[14]/2);
			var p2 = 'A'+x2+y2+z2;

			if (!this.hasDirectLink(p1,p2))
			{
				this.commandsCount = 0;
				return;
			}
			
		}
		
		this.wingsFapping.play();

	}
	
	this.wingsFapping.volume = 0.5;
	
	this.butterflySub.position.set( 0,2*Math.random()-1,2*Math.random()-1 );
	this.butterfly.matrix.multiply(this.mat[this.commands[0]]);
	this.commandsCount--;
}



MEIRO.Models.T009.prototype.onObject = function()
{
	if (!this.playing) return undefined;
	
	// координати на мишка
	this.mouse.x = (controls.human.mousePos.x/window.innerWidth)*2 - 1;
	this.mouse.y = -(controls.human.mousePos.y/window.innerHeight)*2 + 1;

	this.raycaster.setFromCamera( this.mouse, camera );
	
	var intersects = this.raycaster.intersectObjects( [this.base,this.baseTop,this.buttons], true );
	
	if (intersects.length)
	{
		this.clicks++;
		
		var obj = intersects[0].object;
		if (!obj.name) return undefined;

		this.buttonLight.intensity = 2;
		this.buttonLight.color = obj.name=='F'?new THREE.Color('white'):obj.material.color;
		var p = intersects[0].point;
		p = this.image.worldToLocal(p);
		this.buttonLight.position.copy(p);

		this.buttonEcho.currentTime = 0;
		this.buttonEcho.play();
		
		if (obj.name=='x')
		{	// activation button
			obj.scale.y = 0.1;
			//this.butterfly.matrix = this.originalMatrix.clone();
			this.commands = ' '+this.dnaCommands;
			this.commandsCount = 0;
			this.dnaCommands = '';
			this.wingsFapping.play();
		}
		else
		{	// definition button
			this.dnaCommands += obj.name;
			
			
			var dna = new THREE.Mesh(this.dnaGeometry,this.dnaMaterial.clone());
			dna.material.color.copy(obj.material.color);
			dna.position.y = (this.DNA.children.length+1)*this.DNA_HEIGHT;
			dna.rotation.y = this.DNA.children.length*this.DNA_ANGLE;
			this.DNA.add( dna );
			if (this.dnaCommands.length>30)
			{
				var k = 30/this.dnaCommands.length;
				this.DNA.scale.set(1,k,1);
			}
		}
		
		return undefined;
	}
	
	return undefined;
}



MEIRO.Models.T009.prototype.onDragEnd = function()
{
}



// аниматор на модела
MEIRO.Models.T009.prototype.onAnimate = function(time)
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
		
		if (this.commands)
		{
			var t = rpm(time,350);
			this.wing1.rotation.y = -Math.PI/2*(0.5+0.5*Math.sin(t));
			this.wing2.rotation.y = +Math.PI/2*(0.5+0.5*Math.sin(t));
		}
		else
		{
			var t = 15*Math.sin(rpm(time,13))*Math.sin(rpm(time,27))*Math.cos(rpm(time,31));
			this.wing1.rotation.y = -THREE.Math.clamp(t,0,Math.PI/2);
			this.wing2.rotation.y = THREE.Math.clamp(t,0,Math.PI/2);
		}

		this.buttonLight.intensity *= 0.9;
		
		this.DNA.rotation.y = rpm(time,3);
		
		this.butterflyAction();
	}

	//TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.T009.prototype.onInfo = function(element)
{
	element.innerHTML = this.info;
}



MEIRO.Models.T009.prototype.evaluateResult = function()
{	
	var match = 0;

	var mat = this.butterfly.matrix.elements;
	var x = Math.round(mat[12]/2); // current position
	var y = Math.round(mat[13]/2);
	var z = Math.round(mat[14]/2);
	var currentCode = 'A'+x+y+z;
	//console.log(currentCode);
	var finalDistance = this.distanceInMaze(currentCode,this.targetCode);
	match = THREE.Math.clamp(1-finalDistance/this.butterflyFlightDistance,0,1);
	
	this.config.score = match*this.config.max_score;

	this.config.time =  Math.floor((animationLoop.time-this.startTime)/1000);
	
//	console.log('score=',this.config.score);
	this.info = '';
	this.info += '<h1 style="text-align:center;">Полетът на пеперудата &ndash; '+Math.round(1000*this.config.score)/10+' от '+Math.round(100*this.config.max_score)+' точки</span></h1>';
	this.info += '<p>Първоначалната позиция на пеперудата бе отдалечена на '+this.butterflyFlightDistance+' стъпки. ';
	switch (finalDistance)
	{
		case 0:
			this.info += 'Крайната позиция на пеперудата е точно върху целта. ';
			break;
		case 1:
			this.info += 'Крайната позиция на пеперудата е само на 1 стъпка от целта. ';
			break;
		default:
			this.info += 'Крайната позиция на пеперудата е на '+finalDistance+' стъпки от целта. ';
			break;
	}
	this.info += '</p>';
	
//	console.log('evaluation=',this.config.score*match);
}



MEIRO.Models.T009.prototype.sendResult = function(callback)
{
	var competences = [];
	for (var i=0; i<MEIRO.Models.T009.COMPETENCES.length; i++)
		competences.push( Math.round(100*MEIRO.Models.T009.COMPETENCES[i]*this.config.score)/100 );
	
	var data = new FormData();
	data.append('ACTION', 'END');
	data.append('MODEL', 'T009');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	data.append('SCORE', Math.round(100*this.config.score)/100);
	data.append('TIME', this.config.time);
	data.append('CLICKS', this.clicks);
	data.append('COMPETENCES', competences);
	postData(data,callback,callback);
}



MEIRO.Models.T009.prototype.sendStartup = function(callback)
{
	var data = new FormData();
	data.append('ACTION', 'START');
	data.append('MODEL', 'T009');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	postData(data,callback,callback);
}



MEIRO.Models.T009.prototype.onEnter = function(element)
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
MEIRO.Models.T009.prototype.onExitModel = function(element)
{
	if (!this.exiting)
	{
		this.exiting = true;
		this.commands = ' '+this.dnaCommands;
		this.commandsCount = 0;
		this.dnaCommands = '';
		this.wingsFapping.play();
		return;
	}
	
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
MEIRO.Models.T009.prototype.configure = function(difficulty)
{	
	this.config = {difficulty: difficulty};
		
	var size = max_score = attempts = commands = links = 0;
	
	switch (difficulty)
	{
		// ниска трудност
		case DIFFICULTY_LOW:
			size = 1;
			attempts = 3;//random(2,3);
			links = Math.random();
			commands = random(6,7);
			break;
			
		// средна трудност
		case DIFFICULTY_MEDIUM:
			size = 2;
			attempts = 3;//random(2,3);
			links = 0.8*Math.random();
			commands = random(5,7);
			break;
			
		// висока трудност
		case DIFFICULTY_HIGH:
			size = 3;
			attempts = 3;//random(1,3);
			links = 0.5*Math.random();
			commands = random(3,7);
			commands = random(7,7);
			break;
			
		default: console.error('Unknown difficulty level');
	}

	this.config.size = size;
	this.config.attempts = attempts;
	this.config.links = links;
	this.config.commands = commands;
	
	this.constructMaze();
	this.reduceMaze();
	this.randomizeButterflyPosition();
	
	//console.log();
/*			level0	leve1	leve2
distance  	3..7	2..18	5..27		10%
attempts  	2..3	2..3	1..3		40% -- always 3, ignore from max_score
commands  	6..7	5..7	3..7		60%
links		0..1	0..0.8	0..0.5		30%
			-------	-------	-------
difficulty	0.1-0.2	0.3-0.4	0.7-1.0
*/
	var hard = 0;
	var distance = this.butterflyFlightDistance;
	switch (difficulty)
	{
		case DIFFICULTY_LOW:
			distance = THREE.Math.clamp(THREE.Math.mapLinear(distance,3,7,0,1),0,1);
			//attempts = THREE.Math.clamp(THREE.Math.mapLinear(attempts,3,2,0,1),0,1);
			commands = THREE.Math.clamp(THREE.Math.mapLinear(commands,7,6,0,1),0,1);
			links = THREE.Math.clamp(THREE.Math.mapLinear(links,1,0,0,1),0,1);
			hard = 0.1*distance + 0*attempts + 0.6*commands + 0.3*links;
			max_score = 0.1 + 0.1*hard;
			break;
			
		case DIFFICULTY_MEDIUM:
			distance = THREE.Math.clamp(THREE.Math.mapLinear(distance,4,13,0,1),0,1);
			//attempts = THREE.Math.clamp(THREE.Math.mapLinear(attempts,3,2,0,1),0,1);
			commands = THREE.Math.clamp(THREE.Math.mapLinear(commands,7,5,0,1),0,1);
			links = THREE.Math.clamp(THREE.Math.mapLinear(links,0.8,0,0,1),0,1);
			hard = 0.1*distance + 0*attempts + 0.6*commands + 0.3*links;
			max_score = 0.3 + 0.1*hard;
			break;
			
		case DIFFICULTY_HIGH:
			distance = THREE.Math.clamp(THREE.Math.mapLinear(distance,5,20,0,1),0,1);
			//attempts = THREE.Math.clamp(THREE.Math.mapLinear(attempts,3,1,0,1),0,1);
			commands = THREE.Math.clamp(THREE.Math.mapLinear(commands,7,3,0,1),0,1);
			links = THREE.Math.clamp(THREE.Math.mapLinear(links,0.5,0,0,1),0,1);
			hard = 0.1*distance + 0*attempts + 0.6*commands + 0.3*links;
			max_score = 0.7 + 0.3*hard;
			break;
			
		default: console.error('Unknown difficulty level');
	}
/*	console.log(
		'dist',Math.round(100*distance),
		//'atts',Math.round(100*attempts),
		'cmds',Math.round(100*commands),
		'lnks',Math.round(100*links) );
*/
	this.config.max_score = Math.round(100*max_score)/100; //this.butterflyFlightDistance;
//	console.log('max_score',max_score);
	
	if (!IN_SCORE_STATISTICS)
	{
		var stepDist = 2/this.BUTTERFLY_SIZE/this.STEPS*3/size;
		var fullDist = 2/this.BUTTERFLY_SIZE*3/size;
		var stepAngle = THREE.Math.degToRad(90/this.STEPSrot);
		var fullAngle = THREE.Math.degToRad(90);
		this.mat = {
			F: new THREE.Matrix4().makeTranslation(0,stepDist,0),
			L: new THREE.Matrix4().makeRotationX(stepAngle),
			R: new THREE.Matrix4().makeRotationX(-stepAngle),
			D: new THREE.Matrix4().makeRotationZ(stepAngle),
			U: new THREE.Matrix4().makeRotationZ(-stepAngle),
			l: new THREE.Matrix4().makeRotationY(-stepAngle), // left roll
			r: new THREE.Matrix4().makeRotationY(stepAngle), // right roll
			L90: new THREE.Matrix4().makeRotationX(fullAngle),
			D90: new THREE.Matrix4().makeRotationZ(fullAngle),
			r90: new THREE.Matrix4().makeRotationY(fullAngle),
			F90: new THREE.Matrix4().makeTranslation(0,fullDist,0),
		}
		
		this.constructBase();
		this.generateMaze();
		this.constructButterfly();
		this.constructGlassBoxModel();
		this.constructButtons();
		this.randomizeButterflyOrientation();
		
		this.sendStartup();
		//console.log(renderer.info);
	}
}


MEIRO.Models.T009.prototype.postConfigure = function()
{	
}


// извежда статистика за шъзмовните конфигурации
MEIRO.Models.T009.prototype.configureStats = function()
{
	IN_SCORE_STATISTICS = true;
	
	var data = [];
	var that = this;
	
	var NUMBER_OF_TESTS = 100//000;

	function calculateStats(difficulty,name)
	{
		var min=1000000;
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