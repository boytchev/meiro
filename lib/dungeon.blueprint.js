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
MEIRO.BACKGROUND_COLOR = 'navy';

MEIRO.initBlueprint = function()
{
	ao = {};
	
	
//MEIRO.PRIMITIVE = {FONT:new THREE.Font(MEIRO.FONT_JSON)};

MEIRO.GEOMETRY = { // collection of pre-baked geometries
		WALL:	new THREE.BoxGeometry(MEIRO.WIDENESS,MEIRO.THICKNESS+2*EPS,MEIRO.WIDENESS),
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
						depth: 0.1,
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
		WALL:  new THREE.MeshBasicMaterial({
				color: 'black',
		}),
		SLOPE: new THREE.MeshBasicMaterial({
			color: 'white',
			polygonOffset: true,
			polygonOffsetFactor: 0.5,
			polygonOffsetUnits: 0.5,
			vertexColors: THREE.FaceColors,
			transparent:true,
			opacity:0.3
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
MEIRO.Blueprint = class
{
	constructor( dungeon )
	{
		console.time('Blueprint');
		
		this.roomOccupancy = {};
		var json = sessionStorage.getItem(MEIRO.SESSION_KEY.ROOM_OCCUPANCY);
		if (json)
			this.roomOccupancy = JSON.parse(json);
		
		
		this.blueprintFaceMaterial = new THREE.MeshBasicMaterial({
						color: 'cyan',
						side: THREE.DoubleSide,
						polygonOffset: true,
						polygonOffsetUnits: 1,
						polygonOffsetFactor: 1,
						transparent: true,
						opacity: 0.2,
						depthWrite: false,
						});
		this.blueprintEdgeMaterial = new THREE.LineBasicMaterial({
						color: 'cyan',
						transparent: true,
						opacity: 0.5,
					});

		this.allFloors = [];
		this.allStairs  = [];
		
		for (var i in dungeon.levels)
		{
			this.allFloors.push( 
				this.imageFloors( dungeon.levels[i] ),
				this.imageWalls ( dungeon.levels[i] )
			);
			this.allStairs.push( this.imageStairs( dungeon.levels[i] ) );
		}
		
		scene.add( ...this.allFloors, ...this.allStairs );
		
		console.timeEnd('Blueprint');
	} // MEIRO.Blueprint.constructor
	
	
	
	
	
	// blueprint image of a dungeon level floor tiles
	imageFloors( level )
	{
		// number of floor tiles
		var instances = level.floors.length;
		
		var geometry  = new THREE.PlaneBufferGeometry(1,1).rotateX( Math.PI/2 ),
			material  = this.blueprintFaceMaterial,
			mesh = new THREE.InstancedMesh( geometry, material, instances );			
			mesh.position.y = level.levelIndex * MEIRO.STAIRS.HEIGHT;
		
		// create floor tiles matrices
		var matrix = new THREE.Matrix4();
		for( var i=0; i<instances; i++ )
		{
			var floor = level.floors[i],
				size = delta(floor.min,floor.max),
				mid = middle(floor.min,floor.max);
			
			console.assert(size.x>EPS && size.z>EPS);
			
			matrix.makeScale( size.x, 1, size.z );
			matrix.setPosition( mid.x, 0, mid.z );

			mesh.setMatrixAt( i, matrix );
		}

		return mesh;
	} // MEIRO.Blueprint.imageFloors


	// blueprint image of a dungeon level walls
	imageWalls( level )
	{
		var points = [];
		
		// create walls as lines
		for( var i=0; i<level.walls.length; i++ )
		{
			var wall = level.walls[i],
				size = delta(wall.min,wall.max),
				mid = middle(wall.min,wall.max);
			points.push(
				new THREE.Vector3( mid.x+size.x/2, 0, mid.z+size.z/2 ),
				new THREE.Vector3( mid.x-size.x/2, 0, mid.z-size.z/2 )
			);
		}

		// images of all downstairs protective railings
		// c╒═══╤═══╤═══d
		//	F       f ● midUp
		// b╘═══╧═══╧═l═a                         
		for (var i in level.stairs)
		{
			var stairs = level.stairs[i],
				f = {x:stairs.vec.x/2, z:stairs.vec.z/2},
				F = {x:3*f.x, z:3*f.z},
				l = {x:f.z, z:-f.x};

			var a = new THREE.Vector3( stairs.midUp.x+l.x-f.x, 0, stairs.midUp.z+l.z-f.z ),
				b = new THREE.Vector3( stairs.midUp.x+l.x+F.x, 0, stairs.midUp.z+l.z+F.z ),
				c = new THREE.Vector3( stairs.midUp.x-l.x+F.x, 0, stairs.midUp.z-l.z+F.z ),
				d = new THREE.Vector3( stairs.midUp.x-l.x-f.x, 0, stairs.midUp.z-l.z-f.z );
				
			points.push( a,b, b,c, c,d );
		}
		
		var geometry  = new THREE.BufferGeometry().setFromPoints( points ),
			material  = this.blueprintEdgeMaterial,
			mesh = new THREE.LineSegments( geometry, material );
			mesh.position.y = level.levelIndex * MEIRO.STAIRS.HEIGHT;
		
		return mesh;
		
	} // MEIRO.Blueprint.imageWalls

	
	// blueprint image of stairs 
	imageStairs( level )
	{
		var N = options.lowpoly?7:20; // number of curved segments
		
		var W = MEIRO.WIDENESS/2;
		
		// profile of the slope
		//    ●────────────● 
		//    0            1
		var shape = new THREE.Shape([
			new THREE.Vector2(0,0),
			new THREE.Vector2(1,0)
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

		var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );
		geometry.translate( -MEIRO.STAIRS.LENGTH+0.5, -MEIRO.STAIRS.HEIGHT, 0.5 );
		geometry.rotateY( -Math.PI/2 );

		var instances = level.stairs.length;
		
		var material  = this.blueprintFaceMaterial,
			mesh = new THREE.InstancedMesh( geometry, material, instances );

		// create stairs matrices
		var matrix = new THREE.Matrix4();
		for( var i=0; i<instances; i++ )
		{
			var stairs = level.stairs[i];
			
			matrix.makeRotationY( stairs.dir * Math.PI/2 );
			matrix.setPosition( stairs.midUp.x, level.levelIndex * MEIRO.STAIRS.HEIGHT, stairs.midUp.z );

			mesh.setMatrixAt( i, matrix );
		}

		return mesh;
	} // MEIRO.DungeonLevel.imageStairs

/*
	// blueprint image of the player (as a geomarker), only
	// if the position is known and is close to this level
	blueprintPlayer()
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
	} // MEIRO.DungeonLevel.blueprintPlayer


	// blueprint image of the models (as symbols)
	blueprintModels()
	{
		for (var roomIndex in this.dungeon.roomOccupancy[this.levelIndex])
		{
			var room = this.rooms[roomIndex];
			var mid = middle(room.min,room.max);
			
			var model = new THREE.LineSegments( MEIRO.GEOMETRY.MODEL, MEIRO.STYLE.MODEL );
			model.position.set(mid.x,MEIRO.THICKNESS/2+EPS,mid.z);
			
			this.imageFloor.add(model);
		}
	} // MEIRO.DungeonLevel.blueprintModels
	*/
} // MEIRO.Blueprint





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
/*	
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
*/	
}
