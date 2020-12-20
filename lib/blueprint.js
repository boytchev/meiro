//	MEIRO
//	Generation of blueprint - this is floor-plan image of a dungeon.
//
//	MEIRO.BLUEPRINT
//	 ├─ TIMER
//	 ├─ SPEED
//	 └─ FASTSPEED
//	 
//	MEIRO.Blueprint( )
// 	 ├─ Public API
// 	 │   ├─ constructor( dungeon )
// 	 │   ├─ update( )
//   │   ├─ goLevelUp( )
//   │   └─ goLevelDown( )
//	 │
// 	 ├─ Private fields
// 	 │   ├─ showLevel		← float, current position, scrolls smoothly
// 	 │   ├─ targetLevel		← int, current position (no scrolling, sharp values)
// 	 │   ├─ image			← THREE.Group
// 	 │   ├─ imageFrame		← THREE.Mesh
// 	 │   ├─ imageFloors[]	← THREE.Mesh
// 	 │   ├─ imageWalls[]	← THREE.Mesh
// 	 │   ├─ imageThinWalls[]← THREE.LineSegments
// 	 │   ├─ imageStairs[]	← THREE.Mesh
// 	 │   ├─ imageModels[]	← THREE.Mesh
// 	 │   └─ imagePlayers[]	← THREE.Mesh
//	 │
// 	 └─ Private mthods
//	     ├─ generateFrame( )
//	     ├─ generateFloors( )
//	     ├─ generateWalls( )
//	     ├─ generateThinWalls( )
//	     ├─ generateStairs( )
//	     ├─ generateModels( )
//	     └─ generatePlayers( )
//
//	2017.02-2020.12 - P. Boytchev



MEIRO.BLUEPRINT =
{
	TIMER: false,	// show time used for generating the blueprint (in ms)
	SPEED: 800,		// speed for moving to another floor (in ms)
	FASTSPEED: 200,	// speed for moving to another floor (in ms)
}



// blueprint image of a dungeon
MEIRO.Blueprint = class
{
	constructor( dungeon )
	{
		if( MEIRO.BLUEPRINT.TIMER ) console.time('Blueprint');

		// if there is a player, then show the level of the player
		// targetLevel is the current level, showLevel slides between levels
		this.showLevel = options.player ? Math.round(options.player.y/MEIRO.STAIRS.HEIGHT) : 0;
		this.targetLevel = this.showLevel;				
		
		this.image = new THREE.Group();
		scene.add( this.image );
		
		// create images of elements in array of levels, so opacity
		// of individual levels could be controlled in update()
		this.imageFrame = this.generateFrame( );
		this.imageFloors = this.generateFloors( dungeon );
		this.imageWalls = this.generateWalls( dungeon );
		this.imageThinWalls = this.generateThinWalls( dungeon );
		this.imageStairs = this.generateStairs( dungeon );
		this.imageModels = this.generateModels( dungeon );
		this.imagePlayers = this.generatePlayers( );

		this.image.add( this.imageFrame, ...this.imageFloors, ...this.imageWalls, ...this.imageThinWalls, ...this.imageStairs, ...this.imageModels, ...this.imagePlayers );
		
		if( MEIRO.BLUEPRINT.TIMER ) console.timeEnd('Blueprint');
		
	} // MEIRO.Blueprint.constructor
	
	
	
	// generate a frame for the whole dungeon
	generateFrame()
	{
		var x = options.size.x,
			y = options.size.y*MEIRO.STAIRS.HEIGHT,
			z = options.size.z;
			
		var geometry = new THREE.BoxBufferGeometry( x, y, z ),
			edges    = new THREE.EdgesGeometry( geometry ),
			material = new THREE.LineBasicMaterial( {
							color: 'black',
							transparent: true,
							opacity:0.2 } ),
			mesh = new THREE.LineSegments( edges, material );
			
		mesh.position.set( x/2, y/2, z/2 );
		
		return mesh;
		
	} // MEIRO.Blueprint.generateFrame
	
	
	
	// generate array of images of each level's floor
	generateFloors( dungeon )
	{
		var meshes = [];
		
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
	
		for( var level of dungeon.levels )
		{
			// number of floor tiles
			var instances = level.floors.length;
			
			// single instance mesh
			var mesh = new THREE.InstancedMesh( geometry, material.clone(), instances );			
				mesh.position.y = level.levelIndex * MEIRO.STAIRS.HEIGHT;
				mesh.renderOrder = 10000 + 100*level.levelIndex + 5;

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
		
	} // MEIRO.Blueprint.generateFloors



	// generate array of images of each level's normal wall
	generateWalls( dungeon )
	{
		var meshes = [];
		
		// prepare a floor tile for instanciating
		var matrix   = new THREE.Matrix4(),
			geometry = new THREE.PlaneBufferGeometry(1,1).rotateX( Math.PI/2 ),
			material = new THREE.MeshBasicMaterial({
							color: 'black',
							side: THREE.DoubleSide,
							transparent: true,
						});
	
		for( var level of dungeon.levels )
		{
			// number of floor tiles
			var instances = level.walls.length;
			
			// single instance mesh
			var mesh = new THREE.InstancedMesh( geometry, material.clone(), instances );			
				mesh.position.y = level.levelIndex * MEIRO.STAIRS.HEIGHT;
				mesh.renderOrder = 10000 + 100*level.levelIndex + 2;
		
			// create wall matrices
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
		
	} // MEIRO.Blueprint.generateWalls

	
	
	// generate array of images of each level's thin wall
	generateThinWalls( dungeon )
	{
		var lines = [];
		
		// prepare material
		var material = new THREE.LineBasicMaterial({
								color: 'black',
								transparent: true,
							});
	
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
				line = new THREE.LineSegments( geometry, material.clone() );
				line.position.y = level.levelIndex * MEIRO.STAIRS.HEIGHT;
				line.renderOrder  = 10000 + 100*level.levelIndex + 3;
				
			lines.push( line );
			
		} // for level of dungeon.levels

		return lines;
		
	} // MEIRO.Blueprint.generateThinWalls



	// generate array of images of each level's stairs 
	generateStairs( dungeon )
	{
		var meshes = [];
		
		// prepare stairs geometry and material
		var N = options.lowpoly?8:24; // number of curved segments
		
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
		
		var canvas = document.createElement( 'canvas' );
			canvas.width = 128;
			canvas.height = 32;
		
		var ctx = canvas.getContext( '2d' );
			ctx.fillStyle = 'white';
			ctx.fillRect( 0, 0, 128, 32 );	
			ctx.strokeStyle = 'gray';
			ctx.beginPath();
			for( var i=7.5; i<128; i+=12 )
			{
				ctx.moveTo( i+0.5, 0 );	
				ctx.lineTo( i+0.5, 32 );
			}
			ctx.stroke();
			ctx.fillStyle = 'black';
			ctx.fillRect( 0, 0, 128, 3 );
			ctx.fillRect( 0, 29, 128, 3 );
			ctx.strokeStyle = 'crimson';
			ctx.beginPath();
				ctx.moveTo( 5, 16.5 );	
				ctx.lineTo( 50, 16.5 );
				ctx.moveTo( 30, 12.5 );	
				ctx.lineTo( 50, 16.5 );
				ctx.lineTo( 30, 20.5 );
			ctx.stroke();
			
		var texture = new THREE.CanvasTexture( canvas, THREE.UVMapping, THREE.MirroredRepeatWrapping, THREE.RepeatWrapping );
			texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
			texture.repeat.set( 2/3, 1 );
			
		var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );
			geometry.translate( -MEIRO.STAIRS.LENGTH+0.5, -MEIRO.STAIRS.HEIGHT, 0.5 );
			geometry.rotateY( -Math.PI/2 );
			//geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

		var material = new THREE.MeshBasicMaterial({
							color: 'white',
							map: texture,
							polygonOffset: true,
							polygonOffsetUnits: 1,
							polygonOffsetFactor: 1,
							transparent: true,
							//vertexColors: true,
						});
								
		
		for( var level of dungeon.levels )
		{
			var instances = level.stairs.length;
		
			var mesh = new THREE.InstancedMesh( geometry, material.clone(), instances );
				mesh.renderOrder = 10000 + 100*level.levelIndex + 1;

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
		
	} // MEIRO.DungeonLevel.generateStairs



	// generate array of images of each level's models
	generateModels( dungeon )
	{
		var meshes = [];
		
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
						
		
		for( var j in modelRooms )
		{
			var level = modelRooms[j];
			
			// number of models
			var instances = level.length;

			// single instance mesh
			var mesh = new THREE.InstancedMesh( geometry, material.clone(), instances );
				mesh.position.y = j * MEIRO.STAIRS.HEIGHT;
				mesh.renderOrder = 10000 + 100*j + 4;

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
		
	} // MEIRO.Blueprint.generateModels
	
	

	// generate images of the players (currently at most one player)
	generatePlayers( )
	{
		var meshes = [];
		
		if( !options.player ) return meshes;
		
		var geometry = new THREE.CircleBufferGeometry( 0.5, 20 );
			geometry.rotateX( -Math.PI/2 );
			
		var pos = geometry.getAttribute( 'position' );
			pos.setZ( 0, 1 );

		// get player's coordinates
		var x = options.player.x,
			y = options.player.y, // relative to layer
			z = options.player.z;

		// the geomarker
		var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({
			color: 'crimson',
		}) );
			mesh.position.set( x, y+0.15, z );
			mesh.rotation.y = (Math.PI/2-options.player.rot)||0;

		// text "YOU ARE HERE"
		mesh.labelA = new MEIRO.Label(MEIRO.translate('YOU ARE'),0.5,0,1.8,0);
		mesh.labelA.position.set(0,0.1,0);
		
		mesh.labelB = new MEIRO.Label(MEIRO.translate('HERE'),0.5,0,1.1,0);
		mesh.labelB.position.set(0,0.1,0);
		
		mesh.add( mesh.labelA, mesh.labelB );

		meshes.push( mesh );
		
		return meshes;
		
	} // MEIRO.Blueprint.generatePlayers


	
	// update blueprint screen - set level opacity (level is float)
	// depending on the current level and the camera position
	update( )
	{
		var n = this.imageFloors.length;
		
		// vertical position of the whole image,
		// so the current level is centered vertically
		this.image.position.y = -MEIRO.STAIRS.HEIGHT*this.showLevel;

		if( options.lowpoly )
		{
			for( var i=0; i<n; i++ )
			{
				var visible = (i == this.targetLevel);
				
				this.imageFloors[i].visible = visible;
				this.imageModels[i].visible = visible;
				this.imageThinWalls[i].visible = visible;
				this.imageWalls[i].visible = visible;
				
				visible = visible || ( (i-1) == this.targetLevel);
				this.imageStairs[i].visible = visible;
			}
		}
		else
		{
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
			for( var i=0; i<n; i++ )
			{
				var opacity = getOpacity( this.showLevel ),
					subOpacity = getSubOpacity( this.showLevel );
					
				this.imageFloors[i].material.opacity = 1.0*opacity + 0.1*subOpacity;
				this.imageThinWalls[i].material.opacity  = 0.9*opacity + 0.5*subOpacity;
				this.imageModels[i].material.opacity = 1.0*opacity + 0.5*subOpacity;
			
				this.imageWalls[i].material.opacity  = opacity;
				
				// stairs level is shifted by 1/2, so that upstairs and downstairs have equal opacities
				opacity = getOpacity( this.showLevel+0.5, 1/2 ),
				subOpacity = getSubOpacity( this.showLevel+0.5, 1 );
				this.imageStairs[i].material.opacity = 2*opacity + 0.2*subOpacity;
			}
		}
		
		// update text orientation of the player
		// so it always faces the screen
		if( options.player )
		{
			for( var player of this.imagePlayers )
			{
				var y = -0.8*Math.cos( controls.rot.y );
				player.labelA.position.y = y;
				player.labelB.position.y = y;
				
				player.labelA.rotation.set(
					-controls.rot.y,
					options.player.rot-controls.rot.x,
					0,
					'YXZ' );
				player.labelB.rotation.set(
					-controls.rot.y,
					options.player.rot-controls.rot.x,
					0,
					'YXZ');
			} // for player
		} // if options.player
		
	} // MEIRO.Blueprint.update





	// -----------------------------------------------------------
	// Go one level up
	// -----------------------------------------------------------
	goLevelUp()
	{
		reanimate();

		this.targetLevel++;
		
		var that = this,
			speed = options.lowpoly ? MEIRO.BLUEPRINT.SPEED : MEIRO.BLUEPRINT.SPEED;
		new TWEEN.Tween({level:that.showLevel}).to({level:that.targetLevel},speed)
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
		
		this.targetLevel--;
		
		var that = this,
			speed = options.lowpoly ? MEIRO.BLUEPRINT.SPEED : MEIRO.BLUEPRINT.SPEED;
		new TWEEN.Tween({level:that.showLevel}).to({level:that.targetLevel},speed)
			.onUpdate(function(){ that.showLevel = this.level; })
			.onComplete(function(){ that.update(); })
			.easing(TWEEN.Easing.Sinusoidal.InOut)
			.start();
	} // MEIRO.Blueprint.goLevelDown


} // MEIRO.Blueprint






