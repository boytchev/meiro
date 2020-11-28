
var SCORE_STATISTICS = !true;
var IN_SCORE_STATISTICS = false;

//	Основи на Компютърната Графика
//	Тест 005 - Коенсъдърлендов напръстник
//	П. Бойчев, 2019
//
//	 ├─ T005
//	 │   ├─ initialize()
//	 │   ├─ construct()
//	 │   │    ├─ constructWell()
//	 │   │    ├─ constructFloor()
//	 │   │    ├─ constructDigits()
//	 │   │    └─ configureStats()
//	 │   ├─ onAnimate()
//	 │   ├─ onObject()
//	 │   ├─ onEnter()
//	 │   │    └─ configure(difficulty)
//	 │   │         └─ generateBumpsPositions()
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
MEIRO.Models.T005 = function T005(room, model)
{
	MEIRO.Model.apply(this, arguments);
	
	this.initialize();
	this.construct();
}
MEIRO.Models.T005.prototype = Object.create(MEIRO.Model.prototype);



MEIRO.Models.T005.DIST = {MIN:15, MAX:25, HEIGHT:0};
MEIRO.Models.T005.POS = {DIST:25, ROT_X:0.9, ROT_Y:0.15, ON_FLOOR:true};
MEIRO.Models.T005.ROT_Y = {MIN:0.0, MAX:1.56};
MEIRO.Models.T005.SCALE = {MAX:0.25};
MEIRO.Models.T005.COMPETENCES = [2,0,0,4,0, 5,0,0,0, 0,0,0, 0,1,3,0,0];



MEIRO.Models.T005.prototype.initialize = function()
{
	if (SCORE_STATISTICS) this.configureStats();
	
	random.randomize();

	this.WELL_RADIUS = 3;
	this.WELL_HEIGHT = 8;

	this.PLATE_HEIGHT = 0.65;

	this.FLOOR_SIZE = 10;
	
	this.bumps = [];
	this.zones = [];
	this.codes = [];
	this.plates = [];
	
	this.playing = false;
	this.startTime = 0;
	this.lastTime = 0;
	this.clicks = 0;
	
	this.buttonClick = new Audio('sounds/switch-click.mp3');
	
}

	

MEIRO.Models.T005.prototype.construct = function()
{
	// допълнителна светлина, прави пода по-красив
	var light = new THREE.PointLight( 'white', 1.3 );
	light.position.set( 0, this.WELL_HEIGHT+2, 0 );
	this.image.add( light );

	this.swithchLight = new THREE.PointLight( 'cornflowerblue', 0 );
	this.image.add( this.swithchLight );

	this.constructFloor();
	
	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();


	// бутон за стартиране/приключване
	var that = this;
	this.buttonTimer = new MEIRO.CornerButton('topLeft', function(){that.onExitModel();}, '0:00', 'images/time.png');
	this.buttonTimer.hide();

	this.defaultInfo = '<h1>Коенсъдърлендов напръстник</h1>';
	this.defaultInfo += '<p>Вътрешността на напръстник е разделена на зони. Всяка от тях има битов код според алгоритъма на Коен-Съдърленд за отсичане на отсечка. Кодовете на някои от периферните зони са дадени. Чрез кликване върху празните панели определете кода на една от зоните.</p>';
}



MEIRO.Models.T005.prototype.constructFloor = function()
{
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", this.FLOOR_SIZE, this.FLOOR_SIZE );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", this.FLOOR_SIZE, this.FLOOR_SIZE );
	var lightMap = MEIRO.loadTexture( "textures/005_floor_lightmap.jpg", 1, 1 );

	var geometry = new THREE.PlaneBufferGeometry(this.FLOOR_SIZE, this.FLOOR_SIZE, 51, 51);
	MEIRO.allowLightmap(geometry);
	
	var pos = geometry.getAttribute('position');
	// vertical alignment
	for (var i=0; i<pos.count; i++)
	{
		var x = pos.getX(i);
		var y = pos.getY(i);
		
		var p = x*x+y*y;
		var distance = Math.abs(p-Math.pow(this.WELL_RADIUS*1.2,2));
		var height = 4/(1+Math.pow(distance,2)); 
		
		var angle = Math.atan2(y,x);
		var limit = 2*Math.pow(Math.cos(2*angle),8);
		
		height = Math.min(height,limit);
		pos.setXY( i, x*(1-height/10), y*(1-height/10) );
		pos.setZ(i, height);
	}
	geometry.computeVertexNormals();
	
	var material = new THREE.MeshStandardMaterial( {
			color: 0x505050,
			metalness: 0,
			roughness: 0.5,
			map: textureMap,
			normalMap: normalMap,
			//normalScale: new THREE.Vector2(0.1,0.5),
			lightMap: lightMap,
			lightMapIntensity: -1,
			polygonOffset: true,
			polygonOffsetUnits: 2,
			polygonOffsetFactor: 2,
//			side: THREE.DoubleSide,
//wireframe: true,
	});
	
	var floor = new THREE.Mesh( geometry, material );
	floor.rotation.x = -Math.PI/2;
	this.image.add( floor );
}	
	
	
	
MEIRO.Models.T005.prototype.constructWell = function()
{
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", 4*this.WELL_RADIUS, 6 );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", 4*this.WELL_RADIUS, 6 );
	var lightMap = MEIRO.loadTexture( "textures/005_well_lightmap.jpg", 4, 1 );

	
	// generate well profile curve
	const CURVE_HEIGHT = 0.3*this.WELL_HEIGHT;
	var N = 30;
	var points = [];
	for (var i=0; i<=N; i++ )
	{
		var y = i/N*this.WELL_HEIGHT;
		var x = this.WELL_RADIUS;
		if (y<=CURVE_HEIGHT)
		{
			x = this.WELL_RADIUS*Math.sqrt(1 - Math.pow(1-y/CURVE_HEIGHT,2));
		}
		if (i==N)
			 x = this.WELL_RADIUS+0.2;
		points.push( new THREE.Vector2(x,y) );
	}

	// generate well as rotational solid
	var geometry = new THREE.LatheBufferGeometry( points, 60 );
	MEIRO.allowLightmap(geometry);

	// generate well mesh
	var nor = geometry.getAttribute('normal');
	var pos = geometry.getAttribute('position');
	var fixNormals = [];
	for (var i=0; i<pos.count; i++)
	{
		if (pos.getZ(i)>=this.WELL_RADIUS-0.001)
			fixNormals.push(i);
	}

	// generate bumps points in 3D
	var bumpsPoints = [];
	const BUMP_RADIUS = this.WELL_RADIUS+0.8;
	var y = this.WELL_HEIGHT-1;
	for (var i=0; i<2*this.config.lines; i++)
	{
		var angle = this.bumps[i]/12*Math.PI*2;
		bumpsPoints.push( new THREE.Vector3(BUMP_RADIUS*Math.cos(angle),y,BUMP_RADIUS*Math.sin(angle)) );
		if (i%2) y -= this.PLATE_HEIGHT;
	}

	// add random bumps
	var y = this.WELL_HEIGHT-1;
	for (var i=0; i<this.config.extra_bumps; i++)
	{
		var angle = random(0,11)/12*Math.PI*2;
		var y = this.WELL_HEIGHT-1-this.PLATE_HEIGHT*random(0,5);
		bumpsPoints.push( new THREE.Vector3(BUMP_RADIUS*Math.cos(angle),y,BUMP_RADIUS*Math.sin(angle)) );
	}

	// makes the bumps
	var q = new THREE.Vector3(0,0,0);
	var pos = geometry.getAttribute('position');
	for (var i=0; i<pos.count; i++)
	{
		q.set( pos.getX(i), pos.getY(i), pos.getZ(i) );
		for (var j=0; j<bumpsPoints.length; j++)
		{
			var dist = Math.pow(q.distanceTo(bumpsPoints[j]),4);
			if (dist<2)
			{
				var k = 1-1/dist/dist/50;
				q.x *= k;
				q.z *= k;
			}
		}
		pos.setXYZ( i, q.x, q.y, q.z );
	}

	geometry.computeVertexNormals();
	for (var i=0; i<fixNormals.length; i++)
	{
		nor.setX(fixNormals[i],0);
	}
	
//	var aa=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2));
//	aa.position.z=6;
//	aa.position.y=6;
//	this.image.add(aa);
	
	var materialOutside = new THREE.MeshStandardMaterial( {
			metalness: 0.2,
			map: textureMap,
			normalMap: normalMap,
			side: THREE.FrontSide,
			//wireframe: true,
			lightMap: lightMap,
			lightMapIntensity: -1,
	});
	
	var well = new THREE.Mesh( geometry, materialOutside );
	this.image.add( well );
	
//helper = new THREE.VertexNormalsHelper( well, 3, 0xff0000, 1 );
//this.image.add( helper );
	
	var materialInside = new THREE.MeshStandardMaterial( {
			metalness: 0,
			map: textureMap,
			side: THREE.BackSide,
			emissive: 'cornflowerblue',
			emissiveIntensity: 0.3,
			//wireframe: true,
	});
	
	var well = new THREE.Mesh( geometry, materialInside );
	well.scale.set( 0.97, 1, 0.97 );
	this.image.add( well );

	//console.log('lines=',this.config.lines);
	//console.log('bumps=',bumpsPoints.length);
	
	// generate bumps connections
	var scale1 = (this.WELL_RADIUS-0.35)/BUMP_RADIUS;
	var scale2 = (this.WELL_RADIUS-1.2)/BUMP_RADIUS;

	var v1 = new THREE.Vector3();
	var v2 = new THREE.Vector3();
	var v3 = new THREE.Vector3();
	var v4 = new THREE.Vector3();
	
	//var material = new THREE.LineBasicMaterial( { color : 'black' } );
	var materialThread = new THREE.MeshStandardMaterial( {
			color: 'cornflowerblue',
			metalness: 0.5,
			map: textureMap,
			emissive: 'white',
			emissiveIntensity: 0.5,
			//wireframe: true,
	});
	
	for (var i=0; i<2*this.config.lines; i+=2)
	{
		v1.set( scale1*bumpsPoints[i].x,
				bumpsPoints[i].y,
				scale1*bumpsPoints[i].z );
		v2.set( scale2*bumpsPoints[i].x,
				bumpsPoints[i].y,
				scale2*bumpsPoints[i].z );
		v3.set( scale2*bumpsPoints[i+1].x,
				bumpsPoints[i+1].y,
				scale2*bumpsPoints[i+1].z );
		v4.set( scale1*bumpsPoints[i+1].x,
				bumpsPoints[i+1].y,
				scale1*bumpsPoints[i+1].z );

		var curve = new THREE.CubicBezierCurve3(v1,v2,v3,v4);
		//var points = curve.getPoints( 30 );

		//var geometry = new THREE.BufferGeometry().setFromPoints( points );
		//var curveObject = new THREE.Line( geometry, material );
		//this.image.add( curveObject );
		
		var geometry = new THREE.TubeGeometry( curve, 20, 0.08, 8, false );
		var mesh = new THREE.Mesh( geometry, materialThread );
		this.image.add( mesh );
	}

	
}	


MEIRO.Models.T005.prototype.constructDigits = function()
{
	const N = this.config.lines;
	
	this.mapDigit1 = MEIRO.loadTexture( "textures/005_digit_1.jpg" );
	this.mapDigit0 = MEIRO.loadTexture( "textures/005_digit_0.jpg" );
	this.mapDigitX = MEIRO.loadTexture( "textures/005_digit_none.jpg" );


	var geometry = new THREE.CylinderBufferGeometry( this.WELL_RADIUS, this.WELL_RADIUS, this.PLATE_HEIGHT, 6, 1, true, -Math.PI/25, 2*Math.PI/25  );

	var plateGeometry = new THREE.CylinderBufferGeometry( this.WELL_RADIUS, this.WELL_RADIUS, N*this.PLATE_HEIGHT, 6, 1, true, -Math.PI/25, 2*Math.PI/25  );
	
	var plateMap = MEIRO.loadTexture( "textures/005_rusty_plates.jpg", 1, N/6 );
	var plateMaterial = new THREE.MeshLambertMaterial({
		map: plateMap,
		//alphaMap: alphaMap,
		//transparent: true,
		polygonOffset: true,
		polygonOffsetUnits: -1,
		polygonOffsetFactor: -1,
	});
		
	for (var i=0; i<2*N; i++)
	{
		var angle = (this.zones[i]/2+this.zones[i+1]/2)/12-3/12;
		var user = i==this.config.user_index;
		var skip = false;
		if (!user && this.config.skip && Math.random()>0.35)
		{
//console.log('userIdx=',this.config.user_index,'skipIdx=',i);
			skip = true;
			this.config.skip--;
			continue;
		}

		var plate = new THREE.Mesh( plateGeometry, plateMaterial );
		plate.position.y = this.WELL_HEIGHT-N*this.PLATE_HEIGHT/2-this.PLATE_HEIGHT;
		plate.rotation.y = -angle*2*Math.PI;
		this.image.add( plate );
		
		for (var j=0; j<N; j++)
		{
			var material = new THREE.MeshLambertMaterial({
				color: user?'navy':'darkorange',
				map: this.mapDigitX,
				alphaMap: this.mapDigitX,
				transparent: true,
				opacity: 0.3+0.7*Math.random(),
				polygonOffset: true,
				polygonOffsetUnits: -4,
				polygonOffsetFactor: -4,
			});
			if (!user)
			{
				switch (this.codes[i][j])
				{
					case '0':
						material.map = this.mapDigit0;
						material.alphaMap = this.mapDigit0;
						break;
					case '1':
						material.map = this.mapDigit1;
						material.alphaMap = this.mapDigit1;
						break;
				}
			}
			
			var plate = new THREE.Mesh( geometry, material );
			plate.rotation.z = 0.2-0.4*Math.random();	
			plate.position.y = this.WELL_HEIGHT-3/2*this.PLATE_HEIGHT-j*this.PLATE_HEIGHT;
			plate.rotation.y = -angle*2*Math.PI;
			plate.angle = -angle*2*Math.PI;
			
			if (user) this.plates.push( plate );
			this.image.add( plate );
		}
	}
}



MEIRO.Models.T005.prototype.onObject = function()
{
	if (!this.playing) return undefined;
	
	// координати на мишка
	this.mouse.x = (controls.human.mousePos.x/window.innerWidth)*2 - 1;
	this.mouse.y = -(controls.human.mousePos.y/window.innerHeight)*2 + 1;

	this.raycaster.setFromCamera( this.mouse, camera );

	for (var i=0; i<this.plates.length; i++)
	{
		var plate = this.plates[i];
		var intersects = this.raycaster.intersectObject( plate );
		if (intersects.length)
		{	
			this.clicks++;
			if (plate.material.map == this.mapDigitX)
			{
				plate.material.map = this.mapDigit0;
				plate.material.alphaMap = this.mapDigit0;
			}
			else
			if (plate.material.map == this.mapDigit0)
			{
				plate.material.map = this.mapDigit1;
				plate.material.alphaMap = this.mapDigit1;
			}
			else
			if (plate.material.map == this.mapDigit1)
			{
				plate.material.map = this.mapDigitX;
				plate.material.alphaMap = this.mapDigitX;
			}
			
			this.swithchLight.position.set( 
				(this.WELL_RADIUS+0.3)*Math.sin(plate.angle),
				plate.position.y,
				(this.WELL_RADIUS+0.3)*Math.cos(plate.angle) );
			this.swithchLight.intensity = 10;
			
			//console.log(i);
			this.buttonClick.pause();
			this.buttonClick.currentTime=0;;
			this.buttonClick.play();
			return this.plates[i];
		}
	}

	return undefined;
}



MEIRO.Models.T005.prototype.onDragEnd = function()
{
}



// аниматор на модела
MEIRO.Models.T005.prototype.onAnimate = function(time)
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
		
		this.swithchLight.intensity *= 0.8;
	}

	//TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.T005.prototype.onInfo = function(element)
{
	element.innerHTML = this.info;
}



MEIRO.Models.T005.prototype.evaluateResult = function()
{	
	var match = 0;
	var user_code = '';
	for (var i=0; i<this.plates.length; i++)
	{
		var plate = this.plates[i];
		if (plate.material.map == this.mapDigit0)
			user_code += '0';
		else
		if (plate.material.map == this.mapDigit1)
			user_code += '1';
		else
			user_code += '?';
		if (plate.material.map == this.mapDigit0 && this.codes[this.config.user_index][i]=='0')
			match += 1/this.plates.length;
		else
		if (plate.material.map == this.mapDigit1 && this.codes[this.config.user_index][i]=='1')
			match += 1/this.plates.length;
	}
	match = match*match;
//	console.log('match',match);

	this.config.score = match*this.config.max_score;

	this.config.time =  Math.floor((animationLoop.time-this.startTime)/1000);
	
//	console.log('score=',this.config.score);
	this.info = '';
	this.info += '<h1 style="text-align:center;">Коенсъдърлендов напръстник &ndash; '+Math.round(100*this.config.score)/1+' от '+Math.round(100*this.config.max_score)+' точки</span></h1>';

	this.info += '<p>Верният код на избраната зона е <b>'+this.codes[this.config.user_index]+'</b>';

	if (match>0.99) this.info += ' и напълно съвпада с определения от вас код.</p>';
	else
	if (match<0.01) this.info += ' и нито една част от него не е правилно определена.</p>';
	else
		this.info += ', а определеният от вас код е <b>'+user_code+'</b>.</p>';
//	console.log('evaluation=',this.config.score*match);
}



MEIRO.Models.T005.prototype.sendResult = function(callback)
{
	var competences = [];
	for (var i=0; i<MEIRO.Models.T005.COMPETENCES.length; i++)
		competences.push( Math.round(100*MEIRO.Models.T005.COMPETENCES[i]*this.config.score)/100 );
	
	var data = new FormData();
	data.append('ACTION', 'END');
	data.append('MODEL', 'T005');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	data.append('SCORE', Math.round(100*this.config.score)/100);
	data.append('TIME', this.config.time);
	data.append('CLICKS', this.clicks);
	data.append('COMPETENCES', competences);
	postData(data,callback,callback);
}



MEIRO.Models.T005.prototype.sendStartup = function(callback)
{
	var data = new FormData();
	data.append('ACTION', 'START');
	data.append('MODEL', 'T005');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	postData(data,callback,callback);
}



MEIRO.Models.T005.prototype.onEnter = function(element)
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
MEIRO.Models.T005.prototype.onExitModel = function(element)
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
MEIRO.Models.T005.prototype.configure = function(difficulty)
{	
	this.config = {difficulty: difficulty};
		
	var max_score = 0;
	var lines = 0;
	var min_span = 0;
	var extra_bumps = 0;
	
	switch (difficulty)
	{
		// ниска трудност
		case DIFFICULTY_LOW:
			lines = 2;
			min_span = 3;
			skip = 1; //all=4, max skip=all-2=2
			extra_bumps = random(2,4);
			max_score = 0.1;
			break;
			
		// средна трудност
		case DIFFICULTY_MEDIUM:
			lines = 3;
			min_span = 2;
			skip = random(2,3); // all=6, max skip=all-2=4
			extra_bumps = random(4,8);
			max_score = 0.3;
			break;
			
		// висока трудност
		case DIFFICULTY_HIGH:
			lines = random(4,6);
			min_span = 1;
			skip = 2*lines-1-1;
			extra_bumps = random(8,24);
			max_score = 0.7+(lines-4)*0.1;
			break;
			
		default: console.error('Unknown difficulty level');
	}

	this.config.lines = lines;
	this.config.max_score = max_score/*+this.config.crosses*/;
	this.config.min_span = min_span;
	this.config.user_index = random(0,2*lines-1);
	this.config.skip = skip;
	this.config.extra_bumps = extra_bumps;
	
	this.generateBumpsPositions();
	if (!IN_SCORE_STATISTICS)
	{
		this.constructWell();
		this.constructDigits();
	}
	this.config.max_score += 0.1*this.config.crosses;
	if (!IN_SCORE_STATISTICS)
	{
		this.sendStartup();
	}
	
	//console.log('max_score',this.config.max_score);
}


MEIRO.Models.T005.prototype.generateBumpsPositions = function()
{
	const MAX_BUMPS = 12;
	const BUMPS_COUNT = this.config.lines*2;
	var anotherAttempt = true;
	var attempts = 5;
	while (anotherAttempt && attempts--)
	{
		var used = [];
		this.bumps = [];
		
		for (var i=0; i<BUMPS_COUNT; i++)
		{
			 // pick a random bump
			j = random(0,MAX_BUMPS-1);
			while (used[j]) j = random(0,MAX_BUMPS-1);
		
			used[j] = true;
			this.bumps[i] = j;
		}
		
		anotherAttempt = false;
		for (var i=0; i<BUMPS_COUNT && !anotherAttempt; i+=2)
		{
			var d = this.bumps[i]-this.bumps[i+1];
			if (d<0) d+=BUMPS_COUNT;
			if (d>BUMPS_COUNT/2) d=BUMPS_COUNT-d;
			if (d<this.config.min_span) anotherAttempt = true;
		}
	}
	
	this.zones = [];
	this.zones.push(...this.bumps);
	this.zones.sort(function (a,b) {return a-b;});
	this.zones.push(this.zones[0]+12);
	
	// random codes
	this.codes = [];
	this.codes.push( random(1024,65535).toString(2).substr(2,this.config.lines));
	for (var i=1; i<this.zones.length-1; i++)
	{
		// swich bit corresponding the line pair containing zones[i]
		var pair = this.bumps.indexOf(this.zones[i])>>1;
		
		var code = this.codes[i-1];
		code = code.substr(0,pair)+((code[pair]=='1')?'0':'1')+code.substr(pair+1);
		this.codes.push( code );
	}
	
	// find number of crosses
	var line_indexes = [];
	for (var i=0; i<this.zones.length; i++)
	{
		// swich bit corresponding the line pair containing zones[i]
		var pair = this.bumps.indexOf(this.zones[i]%12)>>1;
		line_indexes.push( pair );
	}
	line_indexes.push( line_indexes[0] );
	this.config.crosses = 0;
	for (var i=0; i<line_indexes.length-1; i++)
		if (line_indexes[i]!=line_indexes[i+1])
			this.config.crosses += 1/(line_indexes.length-2);
	this.config.crosses = 2*this.config.crosses-1;
	
	//console.log('bumps',this.bumps);
	//console.log('zones',this.zones);
	//console.log('codes',this.codes);
	//console.log('index',line_indexes);
	//console.log('cross',Math.round(100*this.config.crosses)+'%');
	
}


// извежда статистика за шъзмовните конфигурации
MEIRO.Models.T005.prototype.configureStats = function()
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