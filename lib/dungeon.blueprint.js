//	MEIRO
//	Generation of blueprint floor-plan image of a dungeon
//
//	MEIRO.Blueprint( )
//	 ├─ imageFloors()
//	 ├─ imageWalls()
//	 ├─ imageStairs()
//	 ├─ imageModels()


// 	 ├─ showLevel(level)
//   ├─ goLevelUp()
//   └─ goLevelDown()
//
//	2017.02-2020.12 - P. Boytchev


MEIRO.BACKGROUND_COLOR = 'gainsboro';


// blueprint image of a dungeon
MEIRO.Blueprint = class
{
	constructor( )
	{
		console.time('Blueprint');

		// list of rooms with models for each level
		this.modelRooms = [];
		for( var i in dungeon.levels ) this.modelRooms.push( [] );
		
		var modelsCount = options.models?options.models.split(',').length:0,
			rooms = dungeon.roomsBySize( true );

		for( var i=0; i<Math.min(modelsCount,rooms.length); i++)
		{
			var level = rooms[i].levelNo;
			this.modelRooms[level].push( rooms[i].room );
		}		

		this.image = new THREE.Group(); // image of the whole dungeon
		scene.add( this.image );
		
		this.allFloors = this.imageFloors();
		this.allWalls  = this.imageWalls();
		this.allStairs = this.imageStairs();
		this.allModels = this.imageModels();

		this.image.add( ...this.allFloors, ...this.allWalls, ...this.allStairs, ...this.allModels );

		this.showLevel = 0;				

		if (options.player)
		{
			this.showLevel = Math.round(options.player.y/MEIRO.STAIRS.HEIGHT);
			this.image.add( this.imagePlayer() );
		}
		
		console.timeEnd('Blueprint');
	} // MEIRO.Blueprint.constructor
	
	

	// -----------------------------------------------------------
	// image of all floors
	// -----------------------------------------------------------
	imageFloors( )
	{
		// prepare floor tile
		var matrix   = new THREE.Matrix4(),
			geometry = new THREE.PlaneBufferGeometry(1,1).rotateX( Math.PI/2 ),
			material = new THREE.MeshBasicMaterial({
							color: 'white',
							side: THREE.DoubleSide,
							polygonOffset: true,
							polygonOffsetUnits: 1,
							polygonOffsetFactor: 1,
							transparent: true
						});
	
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



	// -----------------------------------------------------------
	// image of all walls
	// -----------------------------------------------------------
	imageWalls( level )
	{
		// prepare material
		var material = new THREE.LineBasicMaterial({
									color: 'black',
									transparent: true,
								});
	
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


	
	// -----------------------------------------------------------
	// blueprint image of stairs 
	// -----------------------------------------------------------
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



	// -----------------------------------------------------------
	// blueprint image of the models
	// -----------------------------------------------------------
	imageModels( )
	{
		
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
		
		for( var j in this.modelRooms )
		{
			var level = this.modelRooms[j];
			
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
			curveSegments: options.lowpoly?4:20 };
			
		var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );
		geometry.computeVertexNormals();
					
		// get player's coordinates
		var x = options.player.x,
			y = options.player.y, // relative to layer
			z = options.player.z;
			
		// the final geomarker
		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({
			color: 'crimson',
			emissive: 'maroon',
			specular:'white'
		}) );
		mesh.scale.set( 2, 2, 2 );
		mesh.position.set( x, y+0.05, z );
		mesh.rotation.y = (Math.PI/2-options.player.rot)||0;
		
		return mesh;
	} // MEIRO.DungeonLevel.imagePlayer


	



	// Go to level
	showLevel( level )
	{
		this.level = level;

	} // MEIRO.Blueprint.showLevel



	// Set level opacity, level is float - it can poit between actual integer levels
	opacityLevels( )
	{
		this.image.position.y = -MEIRO.STAIRS.HEIGHT*this.showLevel;

		var k = Math.pow( Math.cos(controls.rot.y), 3 );
//		console.log(Math.sign(controls.rot.y));
		
		var n = dungeon.levels.length;
		for( var i=0; i<n; i++ )
		{
			var opacity = THREE.Math.clamp( 1-Math.abs(i-this.showLevel), 0, 1 ); // from 0 to 1
			var subOpacity = k*THREE.Math.clamp( 1-Math.abs((i-this.showLevel)/10), 0, 1 ); // from 0 to 1
				subOpacity = Math.pow(subOpacity,3);
				
			this.allFloors[i].material.opacity = 0.8*opacity + 0.3*subOpacity;
			this.allWalls[i].material.opacity = 0.9*opacity + 0.5*subOpacity;
			this.allModels[i].material.opacity = 1 * opacity + 0.5*subOpacity;
		}
		for( var i=0; i<n; i++ )
		{
			var opacity = THREE.Math.clamp( 1-Math.abs(i-this.showLevel-0.5), 0, 1 ); // from 0 to 1
			var subOpacity = k*THREE.Math.clamp( 1-Math.abs((i-this.showLevel-0.5)/10), 0, 1 ); // from 0 to 1
				subOpacity = Math.pow(subOpacity,4);
			
			this.allStairs[i].material.opacity = 0.9*opacity + 0.2*subOpacity;
		}
		
		if( controls.rot.y>=0 )
		{
			for( var i=0; i<n; i++ )
			{
				this.allFloors[i].renderOrder = 1000+10*i;
				this.allModels[i].renderOrder = 1000+10*i-1;
				this.allWalls[i].renderOrder = 1000+10*i-3;
				this.allStairs[i].renderOrder = 1000+10*i-5;
			}
		}
		else
		{
			for( var i=0; i<n; i++ )
			{
				this.allFloors[i].renderOrder = 1000-10*i;
				this.allModels[i].renderOrder = 1000-10*i+1;
				this.allWalls[i].renderOrder = 1000-10*i+3;
				this.allStairs[i].renderOrder = 1000-10*i+5;
			}
		}
	} // MEIRO.Blueprint.showLevel



	// Go one level up
	goLevelUp()
	{
		reanimate();
		var that = this;
		new TWEEN.Tween({level:that.showLevel}).to({level:that.showLevel+1},500)
			.onUpdate(function(){ that.showLevel = this.level; })
			.onComplete(function(){ that.opacityLevels(); })
			.easing(TWEEN.Easing.Sinusoidal.InOut)
			.start();
	} // MEIRO.Blueprint.goLevelUp


	// Go one level down
	goLevelDown( )
	{
		reanimate();
		var that = this;
		new TWEEN.Tween({level:that.showLevel}).to({level:that.showLevel-1},500)
			.onUpdate(function(){ that.showLevel = this.level; })
			.onComplete(function(){ that.opacityLevels(); })
			.easing(TWEEN.Easing.Sinusoidal.InOut)
			.start();
	} // MEIRO.Blueprint.goLevelDown


} // MEIRO.Blueprint






