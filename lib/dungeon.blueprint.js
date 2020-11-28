//	MEIRO
//	Generation of blueprint floor-plan image of a dungeon
//
//	Extends MEIRO class
//	 ├─ WIDENESS
//	 ├─ THICKNESS
//	 ├─ GEOMETRY
//	 └─ STYLE
//
//	Extends MEIRO.Dungeon class
//	 ├─ blueprint()
// 	 ├─ showLevel(level)
//   ├─ goLevelUp()
//   └─ goLevelDown()
//
//	Extends MEIRO.DungeonLevel class
//	 └─ blueprint()
//	     ├─ blueprintFloor()
//	     ├─ blueprintWalls()
//	     ├─ blueprintStairs()
// 	     └─ blueprintPlayer()
//
//	2017.02-2017.03 - P. Boytchev


MEIRO.WIDENESS  = 0.3; // width of walls
MEIRO.THICKNESS = 0.3; // thickness of floor

MEIRO.BACKGROUND_COLOR = 'gainsboro';

MEIRO.initBlueprint = function()
{
	ao = {};
	
	
//MEIRO.PRIMITIVE = {FONT:new THREE.Font(MEIRO.FONT_JSON)};

MEIRO.GEOMETRY = { // collection of pre-baked geometries
		FLOOR:	new THREE.BoxGeometry(1,MEIRO.THICKNESS+EPS,1),
		//FLOOR:	new THREE.PlaneGeometry(1,1).rotateX(Math.PI/2),
		WALL:	new THREE.BoxGeometry(MEIRO.WIDENESS,MEIRO.THICKNESS+2*EPS,MEIRO.WIDENESS),
		//WALL:	new THREE.PlaneGeometry(MEIRO.WIDENESS,MEIRO.WIDENESS).rotateX(Math.PI/2),
		WALL_1:	new THREE.BoxGeometry(1,MEIRO.THICKNESS+2*EPS,MEIRO.WIDENESS/2),
		WALL_2:	new THREE.BoxGeometry(MEIRO.WIDENESS/2,MEIRO.THICKNESS+2*EPS,2),
		SLOPE:	function()
				{
					var N = options.lowpoly?7:20; // number of curved segments
					
					var T = MEIRO.THICKNESS/2;
					var W = MEIRO.WIDENESS/2;
					
					// rectangural profile of the slope
					//    ●──●────────●──●  +T
					//    │              │
					//    ●──●────────●──●  -T
					//    0  W       1-W 1
					var shape = new THREE.Shape([
						new THREE.Vector2(0,-T),
						new THREE.Vector2(W,-T),
						new THREE.Vector2(1-W,-T),
						new THREE.Vector2(1,-T),
						new THREE.Vector2(1,T),
						new THREE.Vector2(1-W,T),
						new THREE.Vector2(W,T),
						new THREE.Vector2(0,T),
					]);
					
					// spline curve between two levels
					var spline =  new THREE.CubicBezierCurve3( 
						new THREE.Vector3( 0,0,0 ),
						new THREE.Vector3( 1.5,0,0 ),
						new THREE.Vector3( MEIRO.STAIRS.LENGTH-1.5,MEIRO.STAIRS.HEIGHT,0 ),
						new THREE.Vector3( MEIRO.STAIRS.LENGTH-0,MEIRO.STAIRS.HEIGHT,0 )
					);
					
					var extrudeSettings = {
						steps: N,
						bevelEnabled: false,
						extrudePath: spline,
					};

					var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
					geometry.translate(-MEIRO.STAIRS.LENGTH+0.5,-MEIRO.STAIRS.HEIGHT,0.5);
					geometry.rotateY(-Math.PI/2);

					// set the color of the slope; the first 12 faces are for
					// the rectangular front and back faces, then each next 2N
					// faces from a stripe X along the curve; the X's are:
					//    ●─6─●────5────●─4─●
					//    7                 3
					//    ●─0─●────1────●─2─●
					// all are black except for 1 and 5
					for (var i=0; i<geometry.faces.length; i++)
					{
						switch ( Math.floor((i-12)/(2*N)) )
						{
							case 1:
								geometry.faces[i].color.setHex(0xa0a0a0);
								break; 
							case 5:	
								if ((i%4)>1)
									geometry.faces[i].color.setHex(0xa0a0a0);
								else
									geometry.faces[i].color.setHex(0xffffff);
								break;
							default:
								geometry.faces[i].color.setHex(0);
						}
					}
					geometry.colorsNeedUpdate = true;
					
					return geometry;
				}(),
		MODEL: 	new THREE.EdgesGeometry(new THREE.BoxGeometry(1,0,1)),
		PLAYER:	function()
				{	//                    __
					// geomarker profile |()|
					//                    \/
					var shape = new THREE.Shape();
					shape.moveTo(  0, 0 );
					shape.quadraticCurveTo(  0.4, 0.8, 0, 0.82 );
					shape.quadraticCurveTo( -0.4, 0.8, 0, 0 );
					var hole = new THREE.Path();
					hole.moveTo(  0.15, 0.61 );
					hole.absarc( 0, 0.61, 0.15, 0, Math.PI*2, false );
					shape.holes.push(hole);
					
					// 3D geometry
					var extrudeSettings = {
						amount: 0.1,
						bevelEnabled: true,
						bevelSegments: options.lowpoly?1:3,
						steps: options.lowpoly?1:3,
						bevelSize: 0.01,
						bevelThickness: 0.01,
						curveSegments: options.lowpoly?4:10 };
						
					var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
					geometry.computeVertexNormals();
					
					return geometry;
				}(),
	};

	
MEIRO.STYLE = { // collection of prebaked styles
		FLOOR: new THREE.MeshBasicMaterial({
				color: 'white',
		}),
		WALL:  new THREE.MeshBasicMaterial({
				color: 'black',
		}),
		SLOPE: new THREE.MeshBasicMaterial({
			color: 'white',
			polygonOffset: true,
			polygonOffsetFactor: 0.5,
			polygonOffsetUnits: 0.5,
			vertexColors: THREE.FaceColors
		}),
		PLAYER: new THREE.MeshPhongMaterial({
			color: 'pink',
			emissive: 'maroon',
			specular:'white'
		}),
		MODEL: new THREE.LineBasicMaterial({
			color: 'black',
			transparent: !true,
			opacity: 0.1,
		}),
	};
}


// blueprint image of a dungeon
MEIRO.Dungeon.prototype.blueprint = function()
{
	console.time('Blueprint');
	
	this.roomOccupancy = {};
	var json = sessionStorage.getItem(MEIRO.SESSION_KEY.ROOM_OCCUPANCY);
	if (json)
		this.roomOccupancy = JSON.parse(json);
	for (var i in this.levels)
		this.levels[i].blueprint();
	console.timeEnd('Blueprint');
}


// blueprint image of a dungeon level - actually two images:
// (1) image of the floor; (2) image of downstairs
MEIRO.DungeonLevel.prototype.blueprint = function()
{
	// image of the floor and all floor elements
	this.imageFloor = new THREE.Object3D();
	//this.imageFloor.position.set( -this.dungeon.max.x/2, 0, -this.dungeon.max.z/2);
	this.imageFloor.visible = false; // hidden by default
	
	// image of the downstairs between this floor and the
	// lower level floor
	this.imageStairs = this.imageFloor.clone();
	
	this.blueprintFloor();
	this.blueprintWalls();
	this.blueprintStairs();
	this.blueprintPlayer();
	this.blueprintModels();
	
	// for debug purposes
	//var helper = new THREE.AxisHelper(30);
	//this.imageFloor.add(helper);
	
	scene.add(this.imageFloor);
	scene.add(this.imageStairs);
}


// blueprint image of floors, with holes for downstairs
MEIRO.DungeonLevel.prototype.blueprintFloor = function()
{	
	var allFloors = new THREE.Geometry();

	// draw all floor segments
	for (var i in this.floors)
	{
		var floor = this.floors[i];
		
		var size = delta(floor.min,floor.max);
		var mid = middle(floor.min,floor.max);
		
		console.assert(size.x>EPS && size.z>EPS);
		
		var mesh = new THREE.Mesh( MEIRO.GEOMETRY.FLOOR, MEIRO.STYLE.FLOOR );
		mesh.scale.set( size.x, 1, size.z );
		mesh.position.set( mid.x, 0, mid.z );
		
		allFloors.mergeMesh( mesh );
	}

	var mesh = new THREE.Mesh(allFloors, MEIRO.STYLE.FLOOR);
	this.imageFloor.add(mesh);
}


// blueprint image of walls, with holes for doors
MEIRO.DungeonLevel.prototype.blueprintWalls = function()
{
	var allWalls = new THREE.Geometry();

	// images of all wall segments
	for (var i in this.walls)
	{
		var wall = this.walls[i];
		
		var size = delta(wall.min,wall.max);
		var mid = middle(wall.min,wall.max);

		console.assert(size.x>EPS || size.z>EPS);
		
		var mesh = new THREE.Mesh( MEIRO.GEOMETRY.WALL, MEIRO.STYLE.WALL );
		mesh.scale[wall.axis] = (size[wall.axis]+MEIRO.WIDENESS)/MEIRO.WIDENESS;
		mesh.position.set( mid.x, 0, mid.z );
		allWalls.mergeMesh( mesh );
	}

	// images of all downstairs protective railings
	//           wall_2
	// 		   ╔═══════════
	//	wall_1 ║│││││││││││ < entrance
	//	       ╚═══════════
	//	         wall_2
	for (var i in this.stairs)
	{
		var stairs = this.stairs[i];
		var vec = stairs.vec;
		var angle = stairs.dir*Math.PI/2;
		
		// short wall against entrance
		// 	╓───┬───┬───
		//	║ ●                ● = midDown
		//	╙───┴───┴───
		var mesh = new THREE.Mesh( MEIRO.GEOMETRY.WALL_1, MEIRO.STYLE.WALL );
		mesh.position.set( stairs.midDown.x-vec.x/2, 0, stairs.midDown.z-vec.z/2 );
		mesh.rotation.y = angle;
		allWalls.mergeMesh( mesh );

		// two longer walls to the left and the right of the entrance
		// 	╒═══╤═══╤═══
		//	│         ●        ● = midUp
		//	╘═══╧═══╧═══
		var dist = 0.5-MEIRO.WIDENESS/4;
		var mesh = new THREE.Mesh( MEIRO.GEOMETRY.WALL_2, MEIRO.STYLE.WALL );
		mesh.position.set( stairs.midUp.x+vec.x/2+dist*vec.z, 0, stairs.midUp.z+vec.z/2+dist*vec.x );
		mesh.rotation.y = angle;
		allWalls.mergeMesh( mesh );
		mesh.position.set( stairs.midUp.x+vec.x/2-dist*vec.z, 0, stairs.midUp.z+vec.z/2-dist*vec.x );
		allWalls.mergeMesh( mesh );
	}
	
	//geom.mergeVertices(); todo
	var mesh = new THREE.Mesh(allWalls, MEIRO.STYLE.WALL);
	this.imageFloor.add(mesh);
}


// blueprint image of stairs (only the slope part)
MEIRO.DungeonLevel.prototype.blueprintStairs = function()
{
	var allSlopes = new THREE.Geometry();

	for (var i in this.stairs)
	{
		var stairs = this.stairs[i];
		var mesh = new THREE.Mesh( MEIRO.GEOMETRY.SLOPE, MEIRO.STYLE.SLOPE );
		mesh.position.set( stairs.midUp.x, 0, stairs.midUp.z );
		mesh.rotation.y = stairs.dir * Math.PI/2;
		allSlopes.mergeMesh( mesh );
	}
	
	var mesh = new THREE.Mesh( allSlopes, MEIRO.STYLE.SLOPE );
	this.imageStairs.add( mesh );
}


// blueprint image of the player (as a geomarker), only
// if the position is known and is close to this level
MEIRO.DungeonLevel.prototype.blueprintPlayer = function()
{
	// exit if there are no player's coordinates
	if (!options.player) return;
	
	// get player's coordinates
	var x = options.player.x,
		y = options.player.y/2-this.levelIndex, // relative to layer
		z = options.player.z;
		
	// exit if not close to this level
	if (Math.abs(y)>0.5) return;
	
	// the final geomarker
	var player = new THREE.Mesh( MEIRO.GEOMETRY.PLAYER, MEIRO.STYLE.PLAYER );
	player.scale.set(2,2,2);
	player.position.set(x,y+0.05+MEIRO.THICKNESS/2,z);
	if (options.player) player.rotation.y = (Math.PI/2-options.player.rot)||0;
	
	this.imageFloor.add(player);
	
	// lights used onlt by the player
	var light = new THREE.DirectionalLight('white');
	light.position.set(100,300,-50);
	this.imageFloor.add(light);

	var light = new THREE.DirectionalLight('white');
	light.position.set(-100,-300,50);
	this.imageFloor.add(light);
}


// blueprint image of the models (as symbols)
MEIRO.DungeonLevel.prototype.blueprintModels = function()
{
	for (var roomIndex in this.dungeon.roomOccupancy[this.levelIndex])
	{
		var room = this.rooms[roomIndex];
		var mid = middle(room.min,room.max);
		
		var model = new THREE.LineSegments( MEIRO.GEOMETRY.MODEL, MEIRO.STYLE.MODEL );
		model.position.set(mid.x,MEIRO.THICKNESS/2+EPS,mid.z);
		
		this.imageFloor.add(model);
	}
}


// Go one level up
MEIRO.Dungeon.prototype.goLevelUp = function()
{
	//		      /     \        \			new upstairs
	//		═════╧══╤  ══╧═══  ╤══╧═════	new floor
	//		         \        /				old upstairs = new downstairs
	//		════  ╤═══╧══════╧════  ╤═══	old floor
	//		     /                 /		old downstairs
	
	var oldLevel = this.levels[this.level];
	var oldFloor = oldLevel.imageFloor;
	var oldDownstairs = oldLevel.imageStairs;
	
	this.level++;
	
	var newLevel = this.levels[this.level];
	var newFloor = newLevel.imageFloor;
	var newDownstairs = newLevel.imageStairs;
	
	var upperLevel = this.levels[this.level+1]||{};
	if (upperLevel)
		var newUpstairs = upperLevel.imageStairs;
		
	var oldUpstairs = newDownstairs;
	
	// the old floor and old downstairs fly off 
	new TWEEN.Tween({y:0}).to({y:-50},600)
		.onUpdate(function(){
			oldDownstairs.position.y = this.y;
			oldFloor.position.y = this.y;})
		.onComplete(function(){
			oldDownstairs.visible = false;
			oldFloor.visible = false;})
		.easing(TWEEN.Easing.Sinusoidal.In)
		.start();

	// the old upstairs shift slightly
	new TWEEN.Tween({y:MEIRO.STAIRS.HEIGHT}).to({y:0},600)
		.onUpdate(function(){
			oldUpstairs.position.y = this.y;})
		.easing(TWEEN.Easing.Sinusoidal.InOut)
		.start();
	
	// the new floor and new upstairs fly in
	newFloor.visible = true;
	newFloor.position.y = 50;
	if (newUpstairs) newUpstairs.visible = true;
	if (newUpstairs) newUpstairs.position.y = 50+MEIRO.STAIRS.HEIGHT;
	new TWEEN.Tween({y:50}).to({y:0},800)
		.onUpdate(function(){
			if (newUpstairs) newUpstairs.position.y = this.y+MEIRO.STAIRS.HEIGHT;
			newFloor.position.y = this.y;})
		.easing(TWEEN.Easing.Sinusoidal.Out)
		.start();
}


// Go one level down
MEIRO.Dungeon.prototype.goLevelDown = function()
{
	//		      /     \        \			old upstairs
	//		═════╧══╤  ══╧═══  ╤══╧═════	old floor
	//		         \        /				old downstairs = new upstairs
	//		════  ╤═══╧══════╧════  ╤═══	new floor
	//		     /                 /		new downstairs
	
	var oldLevel = this.levels[this.level];
	var oldFloor = oldLevel.imageFloor;
	var oldDownstairs = oldLevel.imageStairs;
	
	var upperLevel = this.levels[this.level+1]||{};
	if (upperLevel)
		var oldUpstairs = upperLevel.imageStairs;
	
	this.level--;
	var newLevel = this.levels[this.level];
	var newFloor = newLevel.imageFloor;
	var newDownstairs = newLevel.imageStairs;
	var newUpstairs = oldDownstairs;
	
	// the old floor and old upstairs fly off 
	new TWEEN.Tween({y:0}).to({y:50},600)
		.onUpdate(function(){
			if (oldUpstairs) oldUpstairs.position.y = this.y+MEIRO.STAIRS.HEIGHT;
			oldFloor.position.y = this.y;})
		.onComplete(function(){
			if (oldUpstairs) oldUpstairs.visible = false;
			oldFloor.visible = false;})
		.easing(TWEEN.Easing.Sinusoidal.In)
		.start();

	// the old upstairs shift slightly
	new TWEEN.Tween({y:0}).to({y:MEIRO.STAIRS.HEIGHT},600)
		.onUpdate(function(){
			oldDownstairs.position.y = this.y;})
		.easing(TWEEN.Easing.Sinusoidal.InOut)
		.start();
	
	
	// the new floor and new downstairs fly in
	newFloor.visible = true;
	newFloor.position.y = -50;
	newDownstairs.visible = true;
	newDownstairs.position.y = -50;
	new TWEEN.Tween({y:-50}).to({y:0},800)
		.onUpdate(function(){
			newDownstairs.position.y = this.y;
			newFloor.position.y = this.y;})
		.easing(TWEEN.Easing.Sinusoidal.Out)
		.start();
}


// Go to level
MEIRO.Dungeon.prototype.showLevel = function(level)
{
	this.level = level;
	
	// show this level
	if (this.levels[level])
	{
		this.levels[level].imageFloor.visible = true;
		this.levels[level].imageStairs.position.y = 0;
		this.levels[level].imageStairs.visible = true;
	}
	
	// show stairs from upper level
	if (this.levels[level+1])
	{
		this.levels[level+1].imageStairs.position.y = MEIRO.STAIRS.HEIGHT;
		this.levels[level+1].imageStairs.visible = true;
	}
}
