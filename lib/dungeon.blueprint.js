//	MEIRO
//	Generation of blueprint floor-plan image of a dungeon
//
//	Extends MEIRO class
//	 ├─ WIDENESS
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

MEIRO.BACKGROUND_COLOR = 'gainsboro';
MEIRO.BACKGROUND_COLOR = 'navy';


// blueprint image of a dungeon
MEIRO.Blueprint = class
{
	constructor( dungeon )
	{
		console.time('Blueprint');
		
		// allocates models in empty rooms
		var modelsCount = options.models?options.models.split(',').length:0;
		var rooms = dungeon.roomsBySize( true );
		for (var i=0; i<modelsCount && i<rooms.length; i++)
		{
			var level = dungeon.levels[ rooms[i].levelNo ];
			if( !level.models ) level.models=[];
			level.models.push( rooms[i].room );
		}		

		// lights used onlt by the player
		var light = new THREE.DirectionalLight('white');
		light.position.set(1000,3000,-500);
		scene.add(light);

		var light = new THREE.DirectionalLight('white');
		light.position.set(-1000,-3000,500);
		scene.add(light);

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
		this.blueprintModelMaterial = new THREE.MeshBasicMaterial({
						color: 'cyan',
						side: THREE.DoubleSide,
						transparent: true,
						opacity: 0.5,
						depthWrite: false,
						});
		this.blueprintEdgeMaterial = new THREE.LineBasicMaterial({
						color: 'cyan',
						transparent: true,
						opacity: 0.5,
					});

		this.image = new THREE.Group(); // image of the whole dungeon
		scene.add( this.image );
		
		this.allFloors = [];
		this.allWalls  = [];
		this.allStairs = [];
		this.allModels = [];
		
		for (var i in dungeon.levels)
		{
			this.allFloors.push( this.imageFloors( dungeon.levels[i] ) );
			this.allWalls.push( this.imageWalls ( dungeon.levels[i] ) );
			this.allModels.push( this.imageModels( dungeon.levels[i] ) );
			this.allStairs.push( this.imageStairs( dungeon.levels[i] ) );
		}

		this.image.add( ...this.allFloors, ...this.allWalls, ...this.allStairs, ...this.allModels );
		
		if (options.player)
		{
			this.image.add( this.imagePlayer() );
		}
		
		console.timeEnd('Blueprint');
	} // MEIRO.Blueprint.constructor
	
	
	
	
	
	// blueprint image of a dungeon level floor tiles
	imageFloors( level )
	{
		// number of floor tiles
		var instances = level.floors.length;
		
		var geometry  = new THREE.PlaneBufferGeometry(1,1).rotateX( Math.PI/2 ),
			material  = new THREE.MeshBasicMaterial({
						color: 'cyan',
						side: THREE.DoubleSide,
						polygonOffset: true,
						polygonOffsetUnits: 1,
						polygonOffsetFactor: 1,
						transparent: true,
						opacity: 0.2,
						depthWrite: false,
						}),
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
			material  = new THREE.LineBasicMaterial({
						color: 'cyan',
						transparent: true,
						opacity: 0.5,
					}),
			mesh = new THREE.LineSegments( geometry, material );
			mesh.position.y = level.levelIndex * MEIRO.STAIRS.HEIGHT;
		
		return mesh;
		
	} // MEIRO.Blueprint.imageWalls

	
	// blueprint image of stairs 
	imageStairs( level )
	{
		var N = options.lowpoly?7:12; // number of curved segments
		
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
		
		var material  = new THREE.MeshBasicMaterial({
						color: 'cyan',
						side: THREE.DoubleSide,
						polygonOffset: true,
						polygonOffsetUnits: 1,
						polygonOffsetFactor: 1,
						transparent: true,
						opacity: 0.2,
						depthWrite: false,
						}),
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


	// blueprint image of the player (as a geomarker)
	imagePlayer()
	{
		console.assert(options.player);
		
		//                    __
		// geomarker profile |()|
		//                    \/
		var hole = new THREE.Path();
			hole.moveTo(  0.15, 0.61 );
			hole.absarc( 0, 0.61, 0.15, 0, Math.PI*2, false );
		var shape = new THREE.Shape();
			shape.moveTo(  0, 0 );
			shape.quadraticCurveTo(  0.4, 0.8, 0, 0.82 );
			shape.quadraticCurveTo( -0.4, 0.8, 0, 0 );
			shape.holes.push( hole );
		
		// 3D geometry
		var extrudeSettings = {
			depth: 0.1,
			bevelEnabled: true,
			bevelSegments: options.lowpoly?1:3,
			steps: options.lowpoly?1:3,
			bevelSize: 0.01,
			bevelThickness: 0.01,
			curveSegments: options.lowpoly?4:10 };
			
		var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );
		//geometry.computeVertexNormals();
					
		// get player's coordinates
		var x = options.player.x,
			y = options.player.y, // relative to layer
			z = options.player.z;
			
		// the final geomarker
		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({
			color: 'pink',
			emissive: 'maroon',
			specular:'white'
		}) );
		mesh.scale.set( 2, 2, 2 );
		mesh.position.set( x, y+0.05, z );
		mesh.rotation.y = (Math.PI/2-options.player.rot)||0;
		
		return mesh;
	} // MEIRO.DungeonLevel.imagePlayer
	
	// blueprint image of the models
	imageModels( level )
	{
		if( !level.models ) return new THREE.Mesh();
		
		// number of floor tiles
		var instances = level.models.length;
		
		var geometry  = new THREE.PlaneBufferGeometry(2,2).rotateX( -Math.PI/2 ),
			material  = new THREE.MeshBasicMaterial({
						color: 'cyan',
						side: THREE.DoubleSide,
						transparent: true,
						opacity: 0.5,
						depthWrite: false,
						}),
			mesh = new THREE.InstancedMesh( geometry, material, instances );			
			mesh.position.y = level.levelIndex * MEIRO.STAIRS.HEIGHT;

		// create floor tiles matrices
		var matrix = new THREE.Matrix4();
		for( var i=0; i<instances; i++ )
		{
			
			var room = level.models[i],
				mid = middle(room.min,room.max);
			
			matrix.makeTranslation( mid.x, 0, mid.z );

			mesh.setMatrixAt( i, matrix );
		}

		return mesh;
	} // MEIRO.Blueprint.imageFloors



	// Go to level
	showLevel( level )
	{
		this.level = level;

		var k = Math.pow( Math.cos(controls.rot.y), 10 );
		var n = dungeon.levels.length;
		
		for( var i=0; i<n; i++ )
		{
			var dist = Math.abs(level-i);
			this.allFloors[i].material.opacity = dist?(k*0.1/dist):0.3;
			this.allWalls[i].material.opacity = dist?(k*0.4/dist):1;
			this.allModels[i].material.opacity = dist?(k*0.4/dist):1;
		}
		for( var i=0; i<n; i++ )
		{
			var dist = Math.abs(level-i);
			if( level<i ) dist--;
			this.allStairs[i].material.opacity = dist?(k*0.1/dist):0.3;
		}
	} // MEIRO.Blueprint.showLevel



	// Go one level up
	goLevelUp()
	{
		var that = this;
		this.showLevel( ++this.level );
		new TWEEN.Tween({y:that.image.position.y}).to({y:-MEIRO.STAIRS.HEIGHT*that.level},700)
			.onUpdate(function(){
				that.image.position.y = this.y;})
			.onComplete(function(){
				//oldDownstairs.visible = false;
				//oldFloor.visible = false;
			})
			.easing(TWEEN.Easing.Sinusoidal.InOut)
			.start();
	} // MEIRO.Blueprint.goLevelUp


	// Go one level down
	goLevelDown( )
	{
		var that = this;
		this.showLevel( --this.level );
		new TWEEN.Tween({y:that.image.position.y}).to({y:-MEIRO.STAIRS.HEIGHT*that.level},700)
			.onUpdate(function(){
				that.image.position.y = this.y;})
			.onComplete(function(){
				//oldDownstairs.visible = false;
				//oldFloor.visible = false;
			})
			.easing(TWEEN.Easing.Sinusoidal.InOut)
			.start();
	} // MEIRO.Blueprint.goLevelDown


} // MEIRO.Blueprint






