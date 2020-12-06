//	MEIRO
//	Generation of blueprint floor-plan image of a dungeon.
//	The blueprint retrieves data from dungeon instance.
//
//	MEIRO.Blueprint()
//	 │
//	 ├─ BLUEPRINT.SPEED
//	 ├─ BLUEPRINT.TIMER
//	 │
// 	 ├─ update()
//   ├─ goLevelUp()
//   ├─ goLevelDown()
//	 │
//	 ├─ imageFloors()
//	 ├─ imageWalls()
//	 ├─ imageStairs()
//	 ├─ imageModels()
//	 └─ imagePlayer()
//
//	2017.02-2020.12 - P. Boytchev



MEIRO.BLUEPRINT =
{
	TIMER: false, // show time used for generating the blueprint (in ms)
	SPEED: 400, // speed for moving to another floor (in ms)
}



// blueprint image of a dungeon
MEIRO.Blueprint = class
{
	constructor( )
	{
		if( MEIRO.BLUEPRINT.TIMER ) console.time('Blueprint');


		// a group of all visual elements
		this.image = new THREE.Group();
		scene.add( this.image );
		
		// if there is a player, then show the level of the player
		this.showLevel = 0;				
		if (options.player)
		{
			this.showLevel = Math.round(options.player.y/MEIRO.STAIRS.HEIGHT);
			this.image.add( this.imagePlayer() );
		}
		
		// create images of elements in array of levels, so opacity
		// of individual levels could be controlled in update()
		this.allFloors = this.imageFloors();
		this.allFatWalls  = this.imageFatWalls();
		this.allThinWalls  = this.imageThinWalls();
		this.allStairs = this.imageStairs();
		this.allModels = this.imageModels();

		this.image.add( ...this.allFloors, ...this.allFatWalls, ...this.allThinWalls, ...this.allStairs, ...this.allModels );

		
		if( MEIRO.BLUEPRINT.TIMER ) console.timeEnd('Blueprint');
		
	} // MEIRO.Blueprint.constructor
	
	

	// generate array of images of each level's floor
	imageFloors( )
	{
		// prepare a floor tile for instanciating
		var matrix   = new THREE.Matrix4(),
			geometry = new THREE.PlaneBufferGeometry(1,1).rotateX( Math.PI/2 ),
			material = new THREE.MeshBasicMaterial({
							color: 'white',
							side: THREE.DoubleSide,
							polygonOffset: true,
							polygonOffsetUnits: 2,
							polygonOffsetFactor: 2,
							transparent: true
						});
	
		// array of one floor per level
		var meshes = [];
		
		for( var level of dungeon.levels )
		{
			// number of floor tiles
			var instances = level.floors.length;
			
			// single instance mesh
			var mesh = new THREE.InstancedMesh( geometry, material.clone(), instances );			
				mesh.position.y = level.levelIndex * MEIRO.STAIRS.HEIGHT;
		
			// create floor tiles matrices
			for( var i=0; i<instances; i++ )
			{
				var floor = level.floors[i],
					size = delta( floor.min, floor.max ),
					mid = middle( floor.min, floor.max );
				
				console.assert(size.x>EPS && size.z>EPS);
				
				matrix.makeScale( size.x, 1, size.z );
				matrix.setPosition( mid.x, 0, mid.z );
				mesh.setMatrixAt( i, matrix );
			} // for i=0..instances

			meshes.push( mesh );
			
		} // for level of dungeon.levels
			
		return meshes;
		
	} // MEIRO.Blueprint.imageFloors



	// generate array of images of each level's walls
	imageFatWalls( level )
	{
		// prepare a floor tile for instanciating
		var matrix   = new THREE.Matrix4(),
			geometry = new THREE.PlaneBufferGeometry(1,1).rotateX( Math.PI/2 ),
			material = new THREE.MeshBasicMaterial({
							color: 'black',
							side: THREE.DoubleSide,
							transparent: true,
						});
	
		// array of one floor per level
		var meshes = [];
		
		for( var level of dungeon.levels )
		{
			// number of floor tiles
			var instances = level.walls.length;
			
			// single instance mesh
			var mesh = new THREE.InstancedMesh( geometry, material.clone(), instances );			
				mesh.position.y = level.levelIndex * MEIRO.STAIRS.HEIGHT;
		
			// create floor tiles matrices
			for( var i=0; i<instances; i++ )
			{
				var floor = level.walls[i],
					size = delta( floor.min, floor.max ),
					mid = middle( floor.min, floor.max );
				
				matrix.makeScale( size.x+MEIRO.WIDENESS, 1, size.z+MEIRO.WIDENESS );
				matrix.setPosition( mid.x, 0, mid.z );
				mesh.setMatrixAt( i, matrix );
			} // for i=0..instances

			meshes.push( mesh );
			
		} // for level of dungeon.levels

		return meshes;
	}
	
	
	// generate array of images of each level's walls
	imageThinWalls( level )
	{
		// prepare material
		var material = new THREE.LineBasicMaterial({
									color: 'black',
									transparent: true,
								});
	
		// array of one floor per level
		var meshes = [];
		
		for( var level of dungeon.levels )
		{
			var points = [];
		
			// create walls
			for( var wall of level.walls )
			{
				var size = delta( wall.min, wall.max ),
					mid = middle( wall.min, wall.max );
					
				points.push(
					new THREE.Vector3( mid.x+size.x/2, 0, mid.z+size.z/2 ),
					new THREE.Vector3( mid.x-size.x/2, 0, mid.z-size.z/2 )
				);
			}

			// images of all downstairs protective railings
			// c╒═══╤═══╤═══d
			//	F       f ● midUp
			// b╘═══╧═══╧═l═a                         
			for (var stairs of level.stairs)
			{
				// three directional vectors
				var f = {x:stairs.vec.x/2, z:stairs.vec.z/2},
					F = {x:3*f.x, z:3*f.z},
					l = {x:f.z, z:-f.x};
					
				// four edge points
				var a = new THREE.Vector3( stairs.midUp.x+l.x-f.x, 0, stairs.midUp.z+l.z-f.z ),
					b = new THREE.Vector3( stairs.midUp.x+l.x+F.x, 0, stairs.midUp.z+l.z+F.z ),
					c = new THREE.Vector3( stairs.midUp.x-l.x+F.x, 0, stairs.midUp.z-l.z+F.z ),
					d = new THREE.Vector3( stairs.midUp.x-l.x-f.x, 0, stairs.midUp.z-l.z-f.z );
					
				points.push( a,b, b,c, c,d );
			} // for stairs of level.stairs
		
			var geometry  = new THREE.BufferGeometry().setFromPoints( points ),
				mesh = new THREE.LineSegments( geometry, material.clone() );
				mesh.position.y = level.levelIndex * MEIRO.STAIRS.HEIGHT;
				
			meshes.push( mesh );
			
		} // for level of dungeon.levels
			
		return meshes;
		
	} // MEIRO.Blueprint.imageWalls



	// generate array of images of each level's stairs 
	imageStairs( level )
	{
		// prepare stairs geometry and material
		var N = options.lowpoly?10:30; // number of curved segments
		
		// profile of the slope
		//   0●────────────●1
		var shape = new THREE.Shape([
			new THREE.Vector2(0,0),
			new THREE.Vector2(1,0)
		]);
		
		// spline curve between two levels
		var spline =  new THREE.CubicBezierCurve3( 
			new THREE.Vector3( 0,0,0 ),
			new THREE.Vector3( 1.5,0,0 ),
			new THREE.Vector3( MEIRO.STAIRS.LENGTH-1.5,MEIRO.STAIRS.HEIGHT,0 ),
			new THREE.Vector3( MEIRO.STAIRS.LENGTH-0,MEIRO.STAIRS.HEIGHT,0 ),
		);
		
		var extrudeSettings = {
			steps: N,
			bevelEnabled: false,
			extrudePath: spline,
		};

		// colours forming steps
		var colors = new Float32Array(36*N);
		for( var i in colors ) colors[i] = (i%36)<18?0.2:1;
		
		var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );
			geometry.translate( -MEIRO.STAIRS.LENGTH+0.5, -MEIRO.STAIRS.HEIGHT, 0.5 );
			geometry.rotateY( -Math.PI/2 );
			geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

		var material = new THREE.MeshBasicMaterial({
							color: 'white',
							polygonOffset: true,
							polygonOffsetUnits: 1,
							polygonOffsetFactor: 1,
							transparent: true,
							vertexColors: true,
						});
								
		var meshes = [];
		
		for( var level of dungeon.levels )
		{
			var instances = level.stairs.length;
		
			var mesh = new THREE.InstancedMesh( geometry, material.clone(), instances );

			// create stairs matrices
			var matrix = new THREE.Matrix4();
			for( var i=0; i<instances; i++ )
			{
				var stairs = level.stairs[i];
				
				matrix.makeRotationY( stairs.dir * Math.PI/2 );
				matrix.setPosition( stairs.midUp.x, level.levelIndex * MEIRO.STAIRS.HEIGHT, stairs.midUp.z );

				mesh.setMatrixAt( i, matrix );
			} // for i=0..instances

			meshes.push( mesh );
			
		} // for level of dungeon.levels
			
		return meshes;
		
	} // MEIRO.DungeonLevel.imageStairs



	// generate array of images of each level's models
	imageModels( )
	{
		// list of rooms with models for each level
		var modelRooms = [];
		for( var i in dungeon.levels ) modelRooms.push( [] );
		
		var modelsCount = options.models?options.models.split(',').length:0,
			rooms = dungeon.roomsBySize( true );

		for( var i=0; i<Math.min(modelsCount,rooms.length); i++)
		{
			var level = rooms[i].levelNo;
			modelRooms[level].push( rooms[i].room );
		}		

		
		// prepare
		var matrix = new THREE.Matrix4(),
			geometry  = new THREE.PlaneBufferGeometry(2,2).rotateX( -Math.PI/2 ),
			material  = new THREE.MeshBasicMaterial({
							color: 'crimson',
							side: THREE.DoubleSide,
							polygonOffset: !true,
							polygonOffsetUnits: 2,
							polygonOffsetFactor: 2,
							transparent: true,
						});
						
		var meshes = [];
		
		for( var j in modelRooms )
		{
			var level = modelRooms[j];
			
			// number of models
			var instances = level.length;

			// single instance mesh
			var mesh = new THREE.InstancedMesh( geometry, material.clone(), instances );			
				mesh.position.y = j * MEIRO.STAIRS.HEIGHT;

			// create floor tiles matrices
			for( var i=0; i<instances; i++ )
			{
				
				var room = level[i],
					mid = middle(room.min,room.max);
			
				matrix.makeTranslation( mid.x, 0, mid.z );

				mesh.setMatrixAt( i, matrix );
			} // for level of dungeon.levels
			meshes.push( mesh );
			
		} // for level of dungeon.levels
			
		return meshes;
		
	} // MEIRO.Blueprint.imageModels
	
	

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
			curveSegments: options.lowpoly?6:12 };
			
		// ExtrudeBufferGeometry does not smooth colours (it is as if there is flat shading)
		// we I am forced to used ExtrudeGeometry, which works fone so far
		var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
		geometry.computeVertexNormals();
					
		// get player's coordinates
		var x = options.player.x,
			y = options.player.y, // relative to layer
			z = options.player.z;
			
		// the final geomarker
		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({
			color: 'crimson',
			emissive: 'maroon',
			specular: 'white'
		}) );
		mesh.scale.set( 2, 2, 2 );
		mesh.position.set( x, y+0.05, z );
		mesh.rotation.y = (Math.PI/2-options.player.rot)||0;

		// add a small pointing cylinder
		var arrGeometry = new THREE.ConeBufferGeometry( 0.05, 0.2, 6 ),
			arrMesh = new THREE.Mesh( arrGeometry, mesh.material );
			arrMesh.position.set( 0, 0.61, 0.2 );
			arrMesh.rotation.x = Math.PI/2;
			
		mesh.add( arrMesh );
		
		return mesh;
	} // MEIRO.DungeonLevel.imagePlayer


	
	// update blueprint screen - set level opacity (level is float)
	// depending on the current level and the camera position
	update( )
	{
		
		// vertical position of the whole image,
		// so the current level is centered vertically
		this.image.position.y = -MEIRO.STAIRS.HEIGHT*this.showLevel;

		// opacity depends on viewpoint - looking from top or bottom
		// makes all levels invisible except the current level
		var k = Math.pow( Math.cos(controls.rot.y), 3 );

		function getOpacity( level, scale=1 )
		{
			return opacity = THREE.Math.clamp( 1-scale*Math.abs(i-level)*2, 0, 1 );
		}
		
		function getSubOpacity( level, scale=1 )
		{
			var subOpacity =  k*THREE.Math.clamp( 1-scale*Math.abs((i-level)/10), 0, 1 ); // from 0 to 1
			return Math.pow(subOpacity,3);
		}
		
		// set opacity of floors, walls, models and stairs
		var n = dungeon.levels.length;
		for( var i=0; i<n; i++ )
		{
			var opacity = getOpacity( this.showLevel ),
				subOpacity = getSubOpacity( this.showLevel );
				
			this.allFloors[i].material.opacity = 0.8*opacity + 0.3*subOpacity;
			this.allThinWalls[i].material.opacity  = 0.9*opacity + 0.5*subOpacity;
			this.allModels[i].material.opacity = 1.0*opacity + 0.5*subOpacity;
		
			this.allFatWalls[i].material.opacity  = opacity;
			
			// stairs level is shifted by 1/2, so that upstairs and downstairs have equal opacities
			opacity = getOpacity( this.showLevel+0.5, 1/2 ),
			subOpacity = getSubOpacity( this.showLevel+0.5, 1/2 );
			this.allStairs[i].material.opacity = 2*opacity// + 0.5*subOpacity;
		}
		
		// set the order of elements (to keep transparent overlapping well) 
		var k = (controls.rot.y>=0) ? 1 : -1;
		for( var i=0; i<n; i++ )
		{
			this.allFloors[i].renderOrder = 10000 + k*(100*i+5);
			this.allModels[i].renderOrder = 10000 + k*(100*i+4);
			this.allThinWalls[i].renderOrder  = 10000 + k*(100*i+3);
			this.allFatWalls[i].renderOrder  = 10000 + k*(100*i+2);
			this.allStairs[i].renderOrder = 10000 + k*(100*i+1);
		}

	} // MEIRO.Blueprint.update





	// -----------------------------------------------------------
	// Go one level up
	// -----------------------------------------------------------
	goLevelUp()
	{
		reanimate();
		var that = this;
		new TWEEN.Tween({level:that.showLevel}).to({level:that.showLevel+1},MEIRO.BLUEPRINT.SPEED)
			.onUpdate(function(){ that.showLevel = this.level; })
			.onComplete(function(){ that.update(); })
			.easing(TWEEN.Easing.Sinusoidal.InOut)
			.start();
	} // MEIRO.Blueprint.goLevelUp





	// -----------------------------------------------------------
	// Go one level down
	// -----------------------------------------------------------
	goLevelDown( )
	{
		reanimate();
		var that = this;
		new TWEEN.Tween({level:that.showLevel}).to({level:that.showLevel-1},MEIRO.BLUEPRINT.SPEED)
			.onUpdate(function(){ that.showLevel = this.level; })
			.onComplete(function(){ that.update(); })
			.easing(TWEEN.Easing.Sinusoidal.InOut)
			.start();
	} // MEIRO.Blueprint.goLevelDown


} // MEIRO.Blueprint






