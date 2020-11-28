
var SCORE_STATISTICS = !true;
var IN_SCORE_STATISTICS = false;

//	Основи на Компютърната Графика
//	Тест 006 - Еднаквата площ
//	П. Бойчев, 2019
//
//	 ├─ T002
//	 │   ├─ initialize()
//	 │   ├─ construct()
//	 │   │    ├─ constructFloor()
//	 │   │    ├─ constructBase()
//	 │   │    ├─ constructPanels()
//	 │   │    ├─ constructPolys()
//	 │   │    │    ├─ calculateArea(x,y)
//	 │   │    │    ├─ updatePoly(mesh,poly)
//	 │   │    │    └─ randomPoly(n)
//	 │   │    ├─ constructReels()
//	 │   │    └─ configureStats()
//	 │   ├─ onAnimate()
//	 │   ├─ onObject()
//	 │   ├─ onEnter()
//	 │   │    └─ configure(difficulty)
//	 │   ├─ onDragEnd()
//	 │   ├─ onDragMove()
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
MEIRO.Models.T006 = function T006(room, model)
{
	MEIRO.Model.apply(this, arguments);

	this.initialize();
	this.construct();
}
MEIRO.Models.T006.prototype = Object.create(MEIRO.Model.prototype);



MEIRO.Models.T006.DIST = {MIN:15, MAX:25, HEIGHT:0};
MEIRO.Models.T006.POS = {DIST:22, ROT_X:0.9, ROT_Y:0.15, ON_FLOOR:true};
MEIRO.Models.T006.ROT_Y = {MIN:0.0, MAX:1.56};
MEIRO.Models.T006.SCALE = {MAX:0.25};
MEIRO.Models.T006.COMPETENCES = [3,0,5,4,0, 4,3,0,0, 0,0,0, 0,3,3,0,0];



MEIRO.Models.T006.prototype.initialize = function()
{
	if (SCORE_STATISTICS) this.configureStats();
	
	random.randomize();

	this.FLOOR_SIZE = 10;
	this.BASE_SIZE = this.FLOOR_SIZE-2;
	this.BASE_HEIGHT = 1;
	
	this.PANEL_SIZE = this.FLOOR_SIZE-1;
	this.PANEL_WIDTH = 0.2;
	this.PANEL_DISTANCE = 3;
	this.PANEL_DIVE = 0.25;
	
	this.playing = false;
	this.startTime = 0;
	this.lastTime = 0;
	this.clicks = 0;
	
	this.glassChime = new Audio('sounds/glass-chime.mp3');
	this.geigerClick = new Audio('sounds/geiger-click.mp3');
}

	

MEIRO.Models.T006.prototype.construct = function()
{
	// допълнителна светлина, прави пода по-красив
	var light = new THREE.PointLight( 'white', 0.3 );
	light.position.set( 0, 6, 0 );
	this.image.add( light );


	this.panelAfront = null;
	this.panelBfront = null;
	this.panelAback = null;
	this.panelBback = null;
	this.panelInvisible = new THREE.Group();
	this.panelInvisible.visible = false;
	this.image.add(this.panelInvisible);
	
	this.polyAfront = null;
	this.polyAback = null;
	this.polyBfront = null;
	this.polyBback = null;
	
	this.polyDataA = null;
	this.polyDataB = null;

	this.activeReel = null;
	this.reels = [];

	this.dragArea = {minX:0, maxX:0, minY:0, maxY:0};

	this.geigerTime = 0;
	
	this.constructFloor();
	this.constructBase();
	this.constructPanels();


	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();


	// бутон за стартиране/приключване
	var that = this;
	this.buttonTimer = new MEIRO.CornerButton('topLeft', function(){that.onExitModel();}, '0:00', 'images/time.png');
	this.buttonTimer.hide();

	this.defaultInfo = '<h1>Еднаквата площ</h1>';
	this.defaultInfo += '<p>В две вертикални плоскости има многоъгълници. Чрез плъзгачите деформирайте многоъгълниците така, че да не се самопресичат и лицата им да са равни.</p>';
}



MEIRO.Models.T006.prototype.constructFloor = function()
{
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg",this.FLOOR_SIZE, this.FLOOR_SIZE );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", this.FLOOR_SIZE, this.FLOOR_SIZE );
	var lightMap = MEIRO.loadTexture( "textures/006_floor_lightmap.jpg", 1, 1 );

	var geometry = new THREE.PlaneBufferGeometry(this.FLOOR_SIZE, this.FLOOR_SIZE);
	MEIRO.allowLightmap(geometry);
	
	var material = new THREE.MeshStandardMaterial( {
			metalness: 0.6,
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


MEIRO.Models.T006.prototype.constructBase = function()
{
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg",this.BASE_SIZE, this.BASE_HEIGHT );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", this.BASE_SIZE, this.BASE_HEIGHT );
	//var lightMap = MEIRO.loadTexture( "textures/006_floor_lightmap.jpg", 1, 1 );

	var geometry = new THREE.BoxBufferGeometry(this.BASE_SIZE, this.BASE_HEIGHT, this.BASE_SIZE);
	//MEIRO.allowLightmap(geometry);
	
	var material = new THREE.MeshStandardMaterial( {
			metalness: 0.6,
			map: textureMap,
			//normalMap: normalMap,
			//lightMap: lightMap,
			//lightMapIntensity: 2,
			polygonOffset: true,
			polygonOffsetUnits: 2,
			polygonOffsetFactor: 2,
	});
	
	var base = new THREE.Mesh( geometry, material );
	base.position.y = this.BASE_HEIGHT/2;
	this.image.add( base );


	// base top
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg",this.BASE_SIZE, this.BASE_SIZE );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", this.BASE_SIZE, this.BASE_SIZE );
	var lightMap = MEIRO.loadTexture( "textures/006_base_lightmap.jpg", 1, 1 );

	var geometry = new THREE.PlaneBufferGeometry(this.BASE_SIZE, this.BASE_SIZE);
	MEIRO.allowLightmap(geometry);
	
	var material = new THREE.MeshStandardMaterial( {
			metalness: 0.6,
			map: textureMap,
			normalMap: normalMap,
			lightMap: lightMap,
			lightMapIntensity: 2,
			polygonOffset: true,
			polygonOffsetUnits: -2,
			polygonOffsetFactor: -2,
	});
	
	var baseTop = new THREE.Mesh( geometry, material );
	baseTop.rotation.x = -Math.PI/2;
	baseTop.position.y = this.BASE_HEIGHT;
	this.image.add( baseTop );
}	
	
	
	
MEIRO.Models.T006.prototype.constructPanels = function()
{
	//var textureMap = MEIRO.loadTexture( "textures/006_grid.jpg",10, 10 );
	var normalMap = MEIRO.loadTexture( "textures/006_grid_normal.jpg", 10, 10 );

	var geometry = new THREE.BoxBufferGeometry(this.PANEL_SIZE, this.PANEL_SIZE, this.PANEL_WIDTH);

	var materialBack = new THREE.MeshStandardMaterial( {
			color: 'cornflowerblue',
			metalness: 0.4,
			//map: textureMap,
			normalMap: normalMap,
			normalScale: new THREE.Vector2(1/2,1/2),
			transparent: true,
			opacity: 0.5,
			emissive: 'cornflowerblue',
			emissiveIntensity: 0.5,
			side: THREE.BackSide,
	});
	var materialFront = materialBack.clone();
	materialFront.side = THREE.FrontSide;
	
	this.panelAback = new THREE.Mesh( geometry, materialBack );
	this.panelAback.position.z = this.PANEL_DISTANCE;
	this.panelAback.position.y = this.PANEL_SIZE/2+this.BASE_HEIGHT-this.PANEL_DIVE;
	this.image.add( this.panelAback );

	this.panelBback = this.panelAback.clone();
	this.panelBback.position.z = -this.PANEL_DISTANCE;
	this.image.add( this.panelBback );

	this.panelAfront = this.panelAback.clone();
	this.panelAfront.material = materialFront;
	this.image.add( this.panelAfront );

	this.panelBfront = this.panelBback.clone();
	this.panelBfront.material = materialFront;
	this.image.add( this.panelBfront );

	// invisible panels
	var geometry = new THREE.PlaneBufferGeometry(this.PANEL_SIZE+20, this.PANEL_SIZE+20);

	var materialInvisible = new THREE.MeshBasicMaterial( {
			color: 'peru',
			transparent: true,
			opacity: 0.9,
			side: THREE.DoubleSide,
	});
	var panel = new THREE.Mesh( geometry, materialInvisible );
	panel.position.z = this.PANEL_DISTANCE;
	panel.position.y = this.PANEL_SIZE/2+this.BASE_HEIGHT-this.PANEL_DIVE;
	this.panelInvisible.add( panel );

	panel = panel.clone();
	panel.position.z = -this.PANEL_DISTANCE;
	this.panelInvisible.add( panel );
}	
	
	
	
MEIRO.Models.T006.prototype.calculateArea = function(x,y)
{
	var area = 0;
	for (var i=0; i<x.length; i++) 
	{
		var j = (i+1)%x.length;
		area += (x[j]-x[i])*(y[j]+y[i])/2;
	}
	area = Math.abs(area);
	
	return area;
}


MEIRO.Models.T006.prototype.randomPoly = function(n)
{
	var limit = this.config.tiles/2;
	
//	var attempts = 100;
	
//	do
//	{
		var x = [];
		var y = [];
		
		
		var alpha = 2*Math.PI*Math.random();
		var dAlpha = 2*Math.PI/n;
		
		// generate vertices
		for (var i=0; i<n; i++, alpha+=dAlpha)
		{
			var r = (0.5*Math.random()+0.5)*limit;
			x[i] = THREE.Math.clamp(Math.round(r*Math.cos(alpha)),-limit,limit);
			y[i] = THREE.Math.clamp(Math.round(r*Math.sin(alpha)),-limit+1,limit);
		}
//		x[n] = x[0];
//		y[n] = y[0];
		
		// calculate area
//		var area = this.calculateArea(x,y);
		
//		attempts--;
//	} while (area<=this.config.tiles && attempts>0);
	
	// calculate level of parallelism to axes
	//var hard = 1;
	//for (var i=0; i<n; i++) 
	//{
	//	var diffx = Math.abs(x[i+1]-x[i]);
	//	var diffy = Math.abs(y[i+1]-y[i]);
	//	if (Math.min(diffx,diffy)<0.1) hard-=1/n;
	//}

	// calculate toppers (vertex that have top reels)
	var tops = [];
	for (var i=0; i<n; i++) if (y[i]>0)
	{
		var prev = (i+n-1)%n;
		var next = (i+n+1)%n;
		
		// if next or previous is not on top
		var skip = false;
		if (x[prev]==x[i] && y[prev]>y[i]) skip = true;
		if (x[next]==x[i] && y[next]>y[i]) skip = true;
		if (!skip) tops.push(i);
	}

	// calculate lefters (vertex that have left reels)
	var lefts = [];
	for (var i=0; i<n; i++) if (x[i]<0)
	{
		var prev = (i+n-1)%n;
		var next = (i+n+1)%n;
		
		// if next or previous is not to the left
		var skip = false;
		if (y[prev]==y[i] && x[prev]<x[i]) skip = true;
		if (y[next]==y[i] && x[next]<x[i]) skip = true;
		if (!skip) lefts.push(i);
	}

	// calculate righters (vertex that have right reels)
	var rights = [];
	for (var i=0; i<n; i++) if (x[i]>0)
	{
		var prev = (i+n-1)%n;
		var next = (i+n+1)%n;
		
		// if next or previous is not to the right
		var skip = false;
		if (y[prev]==y[i] && x[prev]>x[i]) skip = true;
		if (y[next]==y[i] && x[next]>x[i]) skip = true;
		if (!skip) rights.push(i);
	}
	
	return {x:x, y:y, /*area:area, hard:hard,*/ tops:tops, lefts:lefts, rights:rights};
}

MEIRO.Models.T006.prototype.updatePoly = function(mesh,poly)
{
	var shape = new THREE.Shape();
	shape.moveTo(poly.x[0],poly.y[0]);
	for (var i=1; i<poly.x.length; i++)
		shape.lineTo(poly.x[i],poly.y[i]);
	
	mesh.geometry.dispose();
	mesh.geometry = new THREE.ShapeBufferGeometry( shape );
/*
	var pos = mesh.geometry.getAttribute('position');
	
	for (var i=1; i<=poly.x.length; i++)
	{
		pos.setXY(i,poly.x[i-1],poly.y[i-1]);
	}
	
	pos.setXY(pos.count-1,pos.getX(1),pos.getY(1)); // last==first
	pos.setXYZ(0,0,0,1.12*(mesh.position.z<0?this.PANEL_DISTANCE:-this.PANEL_DISTANCE));

	pos.dynamic = true;
	pos.needsUpdate = true;
	
	mesh.geometry.computeVertexNormals();
*/
}	


MEIRO.Models.T006.prototype.constructPolys = function()
{
	var scale = this.PANEL_SIZE/this.config.tiles;
	var material = new THREE.MeshStandardMaterial({
		color: 'navy',
		metalness: 0.5,
		transparent: true,
		opacity: 0.9,
		emissive: 'crimson',
		emissiveIntensity: 1,
		side: THREE.DoubleSide,
	});

	// Polygon A
	this.polyDataA = this.randomPoly(this.config.verticesA);
//console.log('polyDataA',this.polyDataA);

	var geometry = new THREE.BufferGeometry();
	this.polyA = new THREE.Mesh( geometry, material );
	this.polyA.position.y = this.BASE_HEIGHT+this.PANEL_SIZE/2-this.PANEL_DIVE;
	this.polyA.position.z = this.PANEL_DISTANCE;
	this.polyA.scale.set(scale,scale,scale);
	this.polyA.renderOrder = -1;

	this.image.add( this.polyA );

	this.updatePoly(this.polyA,this.polyDataA);
	//console.log('area A =',this.polyDataA.area,/*'hard =',Math.round(100*this.polyDataA.hard)+'%',*/'tops='+this.polyDataA.tops.join(':'));

	
	// Polygon B
	this.polyDataB = this.randomPoly(this.config.verticesB);
	
	var geometry = new THREE.BufferGeometry();

	this.polyB = new THREE.Mesh( geometry, material );
	this.polyB.position.y = this.polyA.position.y;
	this.polyB.position.z = -this.PANEL_DISTANCE;
	this.polyB.scale.set(scale,scale,scale);
	this.polyB.renderOrder = -1;

	this.image.add( this.polyB );
	
	this.updatePoly(this.polyB,this.polyDataB);
	//console.log('area B =',this.polyDataB.area/*,'hard =',Math.round(100*this.polyDataB.hard)+'%'*/);
}	


MEIRO.Models.T006.prototype.constructReels = function()
{
	var scale = this.PANEL_SIZE/this.config.tiles;
	var that = this;
	
	var normalMap = MEIRO.loadTexture( "textures/006_grid_normal.jpg", 1, 2 );
	this.MATERIAL_INACTIVE = new THREE.MeshStandardMaterial( {
			color: 'cornflowerblue',
			metalness: 0.3,
			//map: textureMap,
			normalMap: normalMap,
			normalScale: new THREE.Vector2(1,1),
			transparent: true,
			opacity: 0.5,
			//emissive: 'cornflowerblue',
			//emissiveIntensity: 0.8,
			//side: THREE.DoubleSide,
			polygonOffset: true,
			polygonOffsetUnits: -20,
			polygonOffsetFactor: -20,
			
	});
	this.MATERIAL_ACTIVE = new THREE.MeshStandardMaterial( {
			color: 'navy',
			metalness: 0.5,
			//emissive: 'yellow',
			//emissiveIntensity: 0.6,
			//side: THREE.DoubleSide,
	});
	
	var geometry = new THREE.CylinderBufferGeometry(1/3,1/3,1/3,24,8);
	geometry.rotateZ(Math.PI/2);
	var pos = geometry.getAttribute('position');
	for (var i=0; i<pos.count; i++)
	{
		var x = pos.getX(i);
		var y = pos.getY(i);
		var z = pos.getZ(i);

		var k = Math.pow(1+y,4);
		x *= k;
		y -= Math.pow(Math.abs(x),2)/1+0.04;
		x /= 1.5;
		z /= 1.75;
		
		pos.setXYZ(i,x,y,z);
	}
	geometry.computeVertexNormals();
	
	function addTopReels(polyData,distance)
	{
		for (var i=0; i<polyData.tops.length; i++)
		{
			var vertexIndex = polyData.tops[i];
			
			var reel = new THREE.Mesh(geometry,that.MATERIAL_INACTIVE);
			reel.position.set( polyData.x[vertexIndex]*scale, that.BASE_HEIGHT+that.PANEL_SIZE-that.PANEL_DIVE, distance );
			reel.dX = 1;
			reel.dY = 0;
			reel.polyData = polyData;
			reel.vertexIndex = vertexIndex;
			reel.topReel = true;
			reel.leftReel = false;
			reel.renderOrder = -10;
			that.image.add( reel );
			that.reels.push( reel );
		}
	}
	
	function addLeftReels(polyData,distance)
	{
		for (var i=0; i<polyData.lefts.length; i++)
		{
			var vertexIndex = polyData.lefts[i];
			
			var reel = new THREE.Mesh(geometry,that.MATERIAL_INACTIVE);
			reel.position.set( -that.config.tiles/2*scale, that.BASE_HEIGHT+that.PANEL_SIZE/2-that.PANEL_DIVE+polyData.y[vertexIndex]*scale, distance );
			reel.rotation.z = Math.PI/2;
			reel.dX = 0;
			reel.dY = 1;
			reel.polyData = polyData;
			reel.vertexIndex = vertexIndex;
			reel.renderOrder = -10;
			reel.topReel = false;
			reel.leftReel = true;
			that.image.add( reel );
			that.reels.push( reel );
		}
	}
	
	function addRightReels(polyData,distance)
	{
		for (var i=0; i<polyData.rights.length; i++)
		{
			var vertexIndex = polyData.rights[i];
			
			var reel = new THREE.Mesh(geometry,that.MATERIAL_INACTIVE);
			reel.position.set( that.config.tiles/2*scale, that.BASE_HEIGHT+that.PANEL_SIZE/2-that.PANEL_DIVE+polyData.y[vertexIndex]*scale, distance );
			reel.rotation.z = -Math.PI/2;
			reel.dX = 0;
			reel.dY = 1;
			reel.polyData = polyData;
			reel.vertexIndex = vertexIndex;
			reel.renderOrder = -10;
			reel.topReel = false;
			reel.leftReel = false;
			that.image.add( reel );
			that.reels.push( reel );
		}
	}
	
	// create all reels
	addTopReels(this.polyDataA,+this.PANEL_DISTANCE);
	addTopReels(this.polyDataB,-this.PANEL_DISTANCE);
	addLeftReels(this.polyDataA,+this.PANEL_DISTANCE);
	addLeftReels(this.polyDataB,-this.PANEL_DISTANCE);
	addRightReels(this.polyDataA,+this.PANEL_DISTANCE);
	addRightReels(this.polyDataB,-this.PANEL_DISTANCE);
}


MEIRO.Models.T006.prototype.onObject = function()
{
	if (!this.playing) return undefined;
	
	// координати на мишка
	this.mouse.x = (controls.human.mousePos.x/window.innerWidth)*2 - 1;
	this.mouse.y = -(controls.human.mousePos.y/window.innerHeight)*2 + 1;

	this.raycaster.setFromCamera( this.mouse, camera );
	
/*
	var intersects = this.raycaster.intersectObject( this.panelAfront );
	if (intersects.length) return undefined;

	var intersects = this.raycaster.intersectObject( this.panelBfront );
	if (intersects.length) return undefined;
*/
	if (this.activeReel)
	{
		// drag
		var panelIndex = this.activeReel.polyData===this.polyDataA?0:1;
		var intersects = this.raycaster.intersectObject( this.panelInvisible.children[panelIndex] );
		if (intersects.length)
		{
			this.clicks++;
			return intersects[0].point;
		}
	}
	else
	{
		// select for drag
		for (var i=0; i<this.reels.length; i++)
		{
			var reel = this.reels[i];
			var intersects = this.raycaster.intersectObject( reel );
			if (intersects.length)
			{
				this.clicks++;
				if (this.activeReel) this.activeReel.material = this.MATERIAL_INACTIVE;
				this.activeReel = reel;
				this.activeReel.material = this.MATERIAL_ACTIVE;
				
				var limit = this.config.tiles/2;
				
				// find boundary of motion
				if (reel.topReel)
				{	// top reel moves only left-right
					this.dragArea.minX = -limit;
					this.dragArea.maxX = limit;
					this.dragArea.minY = limit;
					this.dragArea.maxY = limit;
					
					for (var j=0; j<this.reels.length; j++) if (i!=j)
					{
						var otherReel = this.reels[j];
						if (!otherReel.topReel) continue; // not top 
						if (reel.polyData!==otherReel.polyData) continue; // not same panel
						
						if (reel.polyData.x[otherReel.vertexIndex] < reel.polyData.x[reel.vertexIndex])
						{
							this.dragArea.minX = Math.max(this.dragArea.minX,reel.polyData.x[otherReel.vertexIndex]+1);
						}
						if (reel.polyData.x[otherReel.vertexIndex] > reel.polyData.x[reel.vertexIndex])
						{
							this.dragArea.maxX = Math.min(this.dragArea.maxX,reel.polyData.x[otherReel.vertexIndex]-1);
						}
					}
				}
				else
				{	// side reel move only up-down
					this.dragArea.minX = reel.leftReel?-limit:limit;
					this.dragArea.maxX = reel.leftReel?-limit:limit;
					this.dragArea.minY = -limit+1;
					this.dragArea.maxY = limit;
					
					for (var j=0; j<this.reels.length; j++) if (i!=j)
					{
						var otherReel = this.reels[j];
						if (otherReel.topReel) continue; // not left/right
						if (otherReel.leftReel!=reel.leftReel) continue; // not same side
						if (reel.polyData!==otherReel.polyData) continue; // not same panel
						
						if (reel.polyData.y[otherReel.vertexIndex] < reel.polyData.y[reel.vertexIndex])
						{
							this.dragArea.minY = Math.max(this.dragArea.minY,reel.polyData.y[otherReel.vertexIndex]+1);
						}
						if (reel.polyData.y[otherReel.vertexIndex] > reel.polyData.y[reel.vertexIndex])
						{
							this.dragArea.maxY = Math.min(this.dragArea.maxY,reel.polyData.y[otherReel.vertexIndex]-1);
						}
					}
				}
//				console.log(this.dragArea);
				return reel;
			};
		}
	}
	return undefined;
}



MEIRO.Models.T006.prototype.onDragMove = function()
{
	if (!this.playing) return;
	if (!this.activeReel) return;
	
	this.panelInvisible.visible = true;
	var point = this.onObject();
	this.panelInvisible.visible = false;
	if (!point) return;

	var limit = this.config.tiles/2;
	var scale = this.PANEL_SIZE/this.config.tiles;
	
	point = this.panelInvisible.worldToLocal(point);
	
	var x = point.x/scale;
	var y = (point.y-this.BASE_HEIGHT-this.PANEL_SIZE/2+this.PANEL_DIVE)/scale;
	
	var reel = this.activeReel;
	var polyData = reel.polyData;
	var vertexIndex = reel.vertexIndex;

//	console.log(x,y);
	// check validity of the new reel position
	
//console.log('x=',Math.round(100*x)/100,'y=',Math.round(100*y)/100);

	x = THREE.Math.clamp(x,this.dragArea.minX,this.dragArea.maxX);
	y = THREE.Math.clamp(y,this.dragArea.minY,this.dragArea.maxY);
	
	// test closeness to another reel
	/*
	for (var j=0; j<this.reels.length && goodPosition; j++)
		if (this.reels[j]!==reel) // different reel
		if (this.reels[j].polyData===reel.polyData) // but same panel
		{
			var p = this.reels[j].position;
			var distance = Math.max( Math.abs(p.x-x),Math.abs(p.y-y) );
			if (distance<=1)
				goodPosition = false;
		}
		*/
	if (reel.topReel)
		polyData.x[vertexIndex] = x;
	else
		polyData.y[vertexIndex] = y;
	
	if (polyData===this.polyDataA)
		this.updatePoly(this.polyA,this.polyDataA);
	else
		this.updatePoly(this.polyB,this.polyDataB);

	// update visual positions of reels
	if (reel.topReel)
		reel.position.x = scale*x;
	else
		reel.position.y = this.BASE_HEIGHT+this.PANEL_SIZE/2-this.PANEL_DIVE+scale*y;
}



MEIRO.Models.T006.prototype.onDragEnd = function()
{
	if (this.activeReel)
	{
		this.activeReel.material = this.MATERIAL_INACTIVE;
		this.glassChime.pause();
		this.glassChime.currentTime = 0;
		this.glassChime.play();
	}
	this.activeReel = null;
}



// аниматор на модела
MEIRO.Models.T006.prototype.onAnimate = function(time)
{	
	if (this.playing)
	{
		if (time-this.lastTime>=1000)
		{
			var dTime = Math.floor((time-this.startTime)/1000);
			var s = dTime%60;
			var m = Math.floor(dTime/60)%60;
			var h = Math.floor(dTime/60/60);
			var string = (m<10?0:'')+m+':'+(s<10?0:'')+s;
			if (h) string = h+':'+string;
			this.buttonTimer.setText(string);
			this.lastTime = time;
		}
		
//		var limit = this.config.tiles/2;
		var scale = this.PANEL_SIZE/this.config.tiles;
		
		for (var i=0; i<this.reels.length; i++)
		{
			var reel = this.reels[i];
			if (reel===this.activeReel) continue;
			var polyData = reel.polyData;
			var index = reel.vertexIndex;
			
			if (reel.topReel)
			{
				polyData.x[index] = THREE.Math.lerp(polyData.x[index],Math.round(polyData.x[index]),0.3);
				reel.position.x = scale*polyData.x[index];
			}
			else
			{
				polyData.y[index] = THREE.Math.lerp(polyData.y[index],Math.round(polyData.y[index]),0.3);
				reel.position.y = this.BASE_HEIGHT+this.PANEL_SIZE/2-this.PANEL_DIVE+scale*polyData.y[index];
			}
		}
		
		this.updatePoly(this.polyA,this.polyDataA);
		this.updatePoly(this.polyB,this.polyDataB);

		if (this.activeReel)
		{
			var areaRatio = this.calculateArea(this.polyDataA.x,this.polyDataA.y)/this.calculateArea(this.polyDataB.x,this.polyDataB.y);
			if (areaRatio<1) areaRatio = 1/areaRatio;
			var geigerInterval = 100*Math.pow(areaRatio,4);
			
			if (time-this.geigerTime > geigerInterval)
			{
				this.geigerTime = time;
				this.geigerClick.pause();
				this.geigerClick.currentTime=0;
				this.geigerClick.play();
//			console.log(geigerInterval);
			}
		}
		//console.log('area A =',);
		//console.log('area B =',);
	}
	//TWEEN.update();
	//reanimate();
}



// информатор на модела
MEIRO.Models.T006.prototype.onInfo = function(element)
{
	element.innerHTML = this.info;
}



MEIRO.Models.T006.prototype.evaluateResult = function()
{	
	var match = 0;
	
	var areaA = Math.round(10*this.calculateArea(this.polyDataA.x,this.polyDataA.y))/10;
	var areaB = Math.round(10*this.calculateArea(this.polyDataB.x,this.polyDataB.y))/10;
	var overdraft = Math.max(areaA,areaB) / Math.min(areaA,areaB) - 1;
	console.log('overdraft',overdraft);
	match = THREE.Math.clamp(1-4*overdraft,0,1);
	console.log('match',match);
	
	this.config.score = match*this.config.max_score;

	this.config.time =  Math.floor((animationLoop.time-this.startTime)/1000);
	
//	console.log('score=',this.config.score);
	this.info = ''
	this.info += '<h1 style="text-align:center;">Еднаквата площ &ndash; '+Math.round(1000*this.config.score)/10+' от '+Math.round(100*this.config.max_score)+' точки</span></h1>';
	this.info += '<p>Единият многоъгълник има площ '+areaA+' квадратни единици. Другият многоъгълник е с площ '+areaB+', което е '+Math.round(1000*areaB/areaA)/10+'%.</p>';

//	console.log('evaluation=',this.config.score*match);
}



MEIRO.Models.T006.prototype.sendResult = function(callback)
{
	var competences = [];
	for (var i=0; i<MEIRO.Models.T006.COMPETENCES.length; i++)
		competences.push( Math.round(100*MEIRO.Models.T006.COMPETENCES[i]*this.config.score)/100 );
	
	var data = new FormData();
	data.append('ACTION', 'END');
	data.append('MODEL', 'T006');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	data.append('SCORE', Math.round(100*this.config.score)/100);
	data.append('TIME', this.config.time);
	data.append('CLICKS', this.clicks);
	data.append('COMPETENCES', competences);
	postData(data,callback,callback);
}



MEIRO.Models.T006.prototype.sendStartup = function(callback)
{
	var data = new FormData();
	data.append('ACTION', 'START');
	data.append('MODEL', 'T006');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	postData(data,callback,callback);
}



MEIRO.Models.T006.prototype.onEnter = function(element)
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
MEIRO.Models.T006.prototype.onExitModel = function(element)
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
MEIRO.Models.T006.prototype.configure = function(difficulty)
{	
	this.config = {difficulty: difficulty};
		
	var max_score = 0;
	
	switch (difficulty)
	{
		// ниска трудност
		case DIFFICULTY_LOW:
			vertices = 3;
			vertices2 = random(3,4);
			max_score = (vertices2==3)?0.1:0.2;
			tiles = 6;
			break;
			
		// средна трудност
		case DIFFICULTY_MEDIUM:
			vertices = 4;
			vertices2 = random(4,5);
			max_score = (vertices2==4)?0.3:0.4;
			tiles = 8;
			break;
			
		// висока трудност
		case DIFFICULTY_HIGH:
			vertices = random(5,6);
			vertices2 = random(5,6);
			tiles = 10+2*random(0,2);
			max_score = -0.3+(vertices+vertices2)/10 + (tiles-10)/40;
			break;
			
		default: console.error('Unknown difficulty level');
	}

	this.config.verticesA = vertices;
	this.config.verticesB = vertices2;
	this.config.tiles = tiles;
	this.config.max_score = max_score;
	if (!IN_SCORE_STATISTICS)
	{
		var repeat = new THREE.Vector2(tiles,tiles);
		this.panelAback.material.normalMap.repeat = repeat;
		this.panelBback.material.normalMap.repeat = repeat;
		this.panelAfront.material.normalMap.repeat = repeat;
		this.panelBfront.material.normalMap.repeat = repeat;
		this.constructPolys();
		this.constructReels();
		console.log('max_score =',max_score);
		console.log('areas',Math.round(10*this.calculateArea(this.polyDataA.x,this.polyDataA.y))/10,Math.round(10*this.calculateArea(this.polyDataB.x,this.polyDataB.y))/10);
		this.sendStartup();
	}
}


MEIRO.Models.T006.prototype.postConfigure = function()
{	
}


// извежда статистика за шъзмовните конфигурации
MEIRO.Models.T006.prototype.configureStats = function()
{
	IN_SCORE_STATISTICS = true;
	
	var data = [];
	var that = this;
	
	var NUMBER_OF_TESTS = 10000;
	
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