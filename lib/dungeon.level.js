//	MEIRO
//
//	MEIRO.DungeonLevel(dungeon)
//	 ├─ dungeon		- parent dungeon
//	 ├─ levelIndex	- current level index
//	 ├─ floors[]	= {min,max}
//	 ├─ rooms[]		= {min,max,level,image}
//	 ├─ walls[]		= {min,max,axis} axis='x' if along X axis
//	 ├─ doors[]		= MEIRO.Door
//	 ├─ stairs[]	= {min,mid,max,dir,midUp,midDown,vec} 
//	 ├─ lowerLevel	= MEIRO.DungeonLevel
//	 ├─ upperLevel	= MEIRO.DungeonLevel
//	 ├─ generateRooms(min,max)
//	 │   ├─ generateWall(min,axis,length,dir)
//	 │   ├─ generateStairs()
//	 │   ├─ mergeDoors()
//	 │   ├─ mergeWalls()
//	 │   └─ mergeFloors()
//	 ├─ findRoom(pos)
//	 ├─ findRoomIndex(pos)
//	 ├─ findFloorIndex(pos)
//	 ├─ findStairs(pos)
//	 ├─ findWallIndex(pos)
//	 ├─ findCornerWall(pos,firstWall)
//	 └─ findInsideWall(pos)
//
//	2020.11 - P. Boytchev


MEIRO.DungeonLevel = class
{
	constructor( dungeon )
	{
		this.dungeon = dungeon;
		this.levelIndex = dungeon.levels.length;
		this.floors = []; // {min{x,z},max{x,z}}
		this.rooms = []; // {min{x,z},max{x,z}}
		this.walls = []; // {min{x,z},max{x,z},axis=x,z}
		this.doors = []; // MEIRO.Doors
		this.stairs = []; // {min{x,y},max{x,y},dir=0,1,2,3}

		this.lowerLevel = this.levelIndex ? dungeon.levels[this.levelIndex-1] : undefined;
		this.upperLevel = undefined;
		if (this.lowerLevel)
			this.lowerLevel.upperLevel = this;

		// add floor
		this.floors.push( {min:{x:0,z:0}, max:{x:this.dungeon.max.x,z:this.dungeon.max.z}} );
		
		// add bounding (external) walls
		this.walls.push( {min:{x:0,z:0}, max:{x:this.dungeon.max.x, z:0}, axis:'x'} );
		this.walls.push( {min:{x:0,z:this.dungeon.max.z}, max:{x:this.dungeon.max.x, z:this.dungeon.max.z}, axis:'x'} );
		this.walls.push( {min:{x:0,z:0}, max:{x:0, z:this.dungeon.max.z}, axis:'z'} );
		this.walls.push( {min:{x:this.dungeon.max.x,z:0}, max:{x:this.dungeon.max.x, z:this.dungeon.max.z}, axis:'z'} );
		
		// bind random generator to the dungeon's id
		random.seed = dungeon.id+this.levelIndex/2;
		this.generateRooms( dungeon.min, dungeon.max );

		// if this is not the bottom level, then cut holes and
		// put stairs to the lower level
		if (this.lowerLevel)
		{
			random.seed = dungeon.id+this.levelIndex/3;
			this.generateStairs();
		}

		this.mergeWalls();
		this.mergeFloors();
		
	} // MEIRO.DungeonLevel.constructor
	

	generateSplitQuadTree( sizeX, sizeZ, rooms )
	{
		function split( sizeX, sizeZ, rooms )
		{
			if( rooms == 1 )
			{
				return null;
			}
			
			var maxSize = Math.max( sizeX, sizeZ );

			//               maxWall                 	
			//     ╔══════╤═════╦════════════╤══════╗max
			//     ║ min      split             min ║
			//     ║ Room      Pos             Room ║
			//  min╚══════╧═════╩════════════╧══════╝
			//               minWall

			// is it big enough to split?
			if( maxSize <= options.split.maxRoom )
			{
				return null;
			}
			
			// split the room along the longest axis
			if( sizeX > sizeZ )
			{	// split along X
				var splitPos = random2( options.split.minRoom, sizeX-options.split.minRoom ),
					leftRooms = THREE.Math.clamp( Math.round(splitPos/sizeX*rooms), 1, rooms-1 );

				return {
					pos: splitPos,
					min: split( splitPos, sizeZ, leftRooms ),
					max: split( sizeX-splitPos, sizeZ, rooms-leftRooms )
				};
			}
			else
			{	// split along Z
				var splitPos = random2( options.split.minRoom, sizeZ-options.split.minRoom ),				
					leftRooms = THREE.Math.clamp( Math.round(splitPos/sizeZ*rooms), 1, rooms-1 );


				return {
					pos: -splitPos,
					min: split( sizeX, splitPos, leftRooms ),
					max: split( sizeX, sizeZ-splitPos, rooms-leftRooms )
				};

			}
		}
		
		return split( sizeX, sizeZ, rooms );
	}
	
	
	// split the dungeon level into rooms
	generateRooms(min,max)
	{
//		// generate the whole level as a single room
//		this.rooms.push( new MEIRO.Room(min,max,this) );
		
		// calculate the number of rooms in the level (at least one)
		var floors = options.size.y;
		var desiredRooms = Math.max( 1, (options.rooms / floors) | 0 );
		
		// if there are extra rooms, put them in the bottom levels (1 at a level)
		if ( options.rooms-desiredRooms*floors > this.levelIndex )
			desiredRooms++;
		
		var that = this;
		function split( min, max, quadTree )
		{
			if( quadTree == null )
			{
				that.rooms.push( new MEIRO.Room(min,max,that) );
				return;
			}
			
			if( quadTree.pos > 0 )
			{
				// split along X
				var minWall = {x:min.x+quadTree.pos,z:min.z};
				var maxWall = {x:min.x+quadTree.pos,z:max.z};
				that.generateWall( minWall, 'z', max.z-min.z, {x:0,z:1});
				split( min, maxWall, quadTree.min );
				if( !quadTree.min ) quadTree.min = that.rooms[that.rooms.length-1];
				split( minWall, max, quadTree.max );
				if( !quadTree.max ) quadTree.max = that.rooms[that.rooms.length-1];
			}
			else
			{	// split along Z
				var maxWall = {x:max.x,z:min.z-quadTree.pos};
				var minWall = {x:min.x,z:min.z-quadTree.pos};
				that.generateWall( minWall, 'x', max.x-min.x, {x:1,z:0});
				split( min, maxWall, quadTree.min );
				if( !quadTree.min ) quadTree.min = that.rooms[that.rooms.length-1];
				split( minWall, max, quadTree.max );
				if( !quadTree.max ) quadTree.max = that.rooms[that.rooms.length-1];
			}
		}
		
		this.splitQuadTree = this.generateSplitQuadTree( max.x-min.x, max.z-min.z, desiredRooms );
		split( min, max, this.splitQuadTree );

	} // MEIRO.DungeonLevel.generateRooms


	// generate wall with doors (dir=direction vector)
	generateWall(min,axis,length,dir)
	{
		// an array for door positions
		var doors = [-1,length];
		
		// pick a few random positions of the doors
		for (var i=0; i<Math.round(1+length*options.split.extraDoors); i++)
			doors.push(random(0,length-1));
			
		// sort them from beginning to the end
		doors = doors.sort(function(a,b){return a-b;});

		//       doors[i]
		//       min max
		//        |   |                  wall
		//      ══╗   ╔══════════╗   ╔══ max
		// wall ══╝   ╚══════════╝   ╚══
		//  min                  |   |
		//                      min max
		//                    doors[i+1]

		// scan the doors and create walls between each two doors
		var x = min.x;
		var z = min.z;
		for (var i=0; i<doors.length-1; i++)
		{
			var len = doors[i+1]-doors[i];
			if (len>1+EPS) // long enough
			{
				this.walls.push( {
					min:{x:x,z:z},
					max:{x:x+dir.x*(len-1),z:z+dir.z*(len-1)},
					axis:axis} );
			}
			x = x+dir.x*(len);
			z = z+dir.z*(len);
		}
		
		// register doors at the dungeon level
		for (var i=1; i<doors.length-1; i++)
		{
			var doorMin = new MEIRO.Pos(min.x+dir.x*doors[i],min.z+dir.z*doors[i]);
			var doorMax = new MEIRO.Pos(min.x+dir.x*(doors[i]+1),min.z+dir.z*(doors[i]+1));
			this.doors.push( new MEIRO.Door(doorMin,doorMax,axis) );
			console.log('q');
		}
	} // MEIRO.DungeonLevel.generateWall


	// generate stairs between this level and the lower level
	generateStairs()
	{
		var count = options.stairs;
		var attempts = 10*count;

	nextAttempt:
		for (; attempts; attempts--)
		{
			// pick a random room
			var room = this.rooms[random(0,this.rooms.length-1)];
			
			//          0
			//        ┌─┴─┐
			//     1 ─┤   ├─ 3
			//        └─┬─┘
			//          2
			// pick a random position and orientation
			var midUp = {x:random(this.dungeon.min.x,this.dungeon.max.x-1)+0.5,
						z:random(this.dungeon.min.z,this.dungeon.max.z-1)+0.5};
			var dir = random(0,3);

			var vec = {x:0, z:0}; // points towards the downside of the stairs
			switch (dir)
			{
				case 0: vec.z--; break;
				case 2: vec.z++; break;
				case 1: vec.x--; break;
				case 3: vec.x++; break;
			}
			var midDown = {x:midUp.x+vec.x*(MEIRO.STAIRS.LENGTH-1),z:midUp.z+vec.z*(MEIRO.STAIRS.LENGTH-1)};
			var max = {x:Math.max(midUp.x,midDown.x)+0.5, z:Math.max(midUp.z,midDown.z)+0.5};
			var min = {x:Math.min(midUp.x,midDown.x)-0.5, z:Math.min(midUp.z,midDown.z)-0.5};
			var mid = middle(min,max);

			// example for stairs with dir==3
			//
			//	           vec ──>
			//
			//       min         max    
			//        ┌───┬───┬───┐
			//    top > ||||||||| > bottom
			//        └───┴───┴───┘
			//          |   |   |
			//      midUp  mid  midDown

			
			// stairs exit must be well inside the level
			var entry = {x:midUp.x-vec.x, z:midUp.z-vec.z};
			if (!inArea(entry,this.dungeon.min,this.dungeon.max))
				continue nextAttempt;
			var exit = {x:midDown.x+vec.x, z:midDown.z+vec.z};
			if (!inArea(exit,this.dungeon.min,this.dungeon.max))
				continue nextAttempt;

			// stairs of this level must not be close to each other
			for (var j in this.stairs)
			{
				var otherStairs = this.stairs[j];
				if (distSqr(midUp,otherStairs.midUp)<4)
					continue nextAttempt; 
				if (distSqr(midDown,otherStairs.midDown)<4)
					continue nextAttempt; 
				if (distSqr(mid,otherStairs.mid)<4)
					continue nextAttempt; 
				if (distSqr(mid,otherStairs.midUp)<2)
					continue nextAttempt; 
				if (distSqr(midUp,otherStairs.mid)<2)
					continue nextAttempt; 
			}

			// stairs of this level must not be close to stairs
			// of the lower level
			for (var j in this.lowerLevel.stairs)
			{
				var otherStairs = this.lowerLevel.stairs[j];
				if (distSqr(midDown,otherStairs.midUp)<4)
					continue nextAttempt; 
				if (distSqr(midDown,otherStairs.mid)<2)
					continue nextAttempt; 
			}
			
			// stairs must not be close to doors
			for (var door of this.doors)
			{
				var abs = deltaAbs(midUp,door.mid);
				if (abs.x+abs.z<1+EPS) continue nextAttempt; 
				var abs = deltaAbs(mid,door.mid);
				if (abs.x+abs.z<1+EPS) continue nextAttempt; 
			}

			// stairs of this level must not be close to doors
			// from the lower level
			if (this.lowerLevel)
				for (var door of this.lowerLevel.doors)
				{
					var abs = deltaAbs(midDown,door.mid);
					if (abs.x+abs.z<1+EPS) continue nextAttempt; 
					var abs = deltaAbs(mid,door.mid);
					if (abs.x+abs.z<1+EPS) continue nextAttempt; 
				}

			// add a record for these stairs
			this.stairs.push( new MEIRO.Stairs(min,max,mid,dir,midUp,midDown,vec,this) );
			
			var that = this;
			function cutHoleInFloor(min,max)
			{
				// cut a hole in the floors
				var floorIndex = that.findFloorIndex(middle(min,max));
				if (floorIndex<0) return;

				var floor = that.floors[floorIndex];
				that.floors.splice(floorIndex,1);
				
				//                         floor
				//      ╔═════╤════════════╗ max
				//      ║ (4) │         (3)║
				//      ║     │   max      ║
				//      ║     ├──┬─────────╢
				//      ╟─────┴──┤         ║
				//      ║  min   │         ║
				//      ║        │         ║
				//      ║  (1)   │   (2)   ║
				//  min ╚════════╧═════════╝
				//  floor

				function addFloor(min,max)
				{
					var size = delta(min,max);
					if (size.x<EPS || size.z<EPS) return; // do not add this floor, too small
					that.floors.push( {min:min, max:max} );
				}
				addFloor( floor.min, {x:max.x,z:min.z} ); // (1)
				addFloor( {x:max.x,z:floor.min.z}, {x:floor.max.x,z:max.z} ); // (2)
				addFloor( {x:min.x,z:max.z}, floor.max ); // (3)
				addFloor( {x:floor.min.x,z:min.z}, {x:min.x,z:floor.max.z} ); // (4)
			}

			// cut holes in the floor - the first one is at 
			// the stairs, the second one is next to it, etc
			for (var j=0; j<MEIRO.STAIRS.LENGTH/2-EPS; j++)
				cutHoleInFloor({x:midUp.x-0.5+j*vec.x,z:midUp.z-0.5+j*vec.z},{x:midUp.x+0.5+j*vec.x,z:midUp.z+0.5+j*vec.z});
			
			// cut holes in the walls
			function cutHoleInWall(level,pos)
			{
				// cut a hole in a wall
				var wallIndex = level.findWallIndex(pos);
				if (wallIndex<0) return;

				var wall = level.walls[wallIndex];
				level.walls.splice(wallIndex,1);
				
				//             pos
				//              |               wall
				//      ══════╗   ╔════════════ max
				// wall ══════╝   ╚════════════
				//  min
				
				function addWall(min,max)
				{
					var size = delta(min,max);
					if (Math.max(size.x,size.z)<EPS) return; // do not add this wall, too small
					level.walls.push( {min:min, max:max, axis:wall.axis} );
				}

console.log('wall',wall);
				if (wall.axis=='x')
				{
					var p1 = pos.shiftedBy( -0.5, 0 ),
						p2 = pos.shiftedBy( +0.5, 0 )
				}
				else
				{
					var p1 = pos.shiftedBy( 0, -0.5 ),
						p2 = pos.shiftedBy( 0, +0.5 );
				}
				addWall( wall.min, p1 );
				addWall( p2, wall.max );
				level.doors.push( new MEIRO.Door(p1,p2,wall.axis) );
				
			}
		
			// cut holes in walls for this level
			for (var j=0; j<MEIRO.STAIRS.LENGTH/2-EPS; j++)
			{
				var x = midUp.x+j*vec.x;
				var z = midUp.z+j*vec.z;
				cutHoleInWall( this,new MEIRO.Pos(x-vec.x/2, z-vec.z/2) );
			}
			// cut holes in walls for lower level
			for (var j=0; j<MEIRO.STAIRS.LENGTH; j++)
			{
				x = midDown.x-j*vec.x;
				z = midDown.z-j*vec.z;
				cutHoleInWall( this.lowerLevel,new MEIRO.Pos(x+vec.x/2, z+vec.z/2) );
			}
			
			count--;
			if (count==0) return;
		}
	} // MEIRO.DungeonLevel.generateStairs


	// merge aligned doors
	mergeDoors()
	{
		for (var i=this.walls.length-2; i>=0; i--)
		{
			var wallA = this.walls[i];
			var axis = wallA.axis;
			for (var j=this.walls.length-1; j>i; j--)
			{
				var wallB = this.walls[j];
				if (wallB.axis!=axis) continue;
				if (distSqr(wallA.max,wallB.min)>EPS &&
					distSqr(wallA.min,wallB.max)>EPS ) continue; 
				// merge both walls
				wallA.min.x = Math.min(wallA.min.x,wallB.min.x);
				wallA.min.z = Math.min(wallA.min.z,wallB.min.z);
				wallA.max.x = Math.max(wallA.max.x,wallB.max.x);
				wallA.max.z = Math.max(wallA.max.z,wallB.max.z);
				this.walls.splice(j,1);
			}
		}
	} // MEIRO.DungeonLevel.mergeDoors


	// merge aligned walls
	mergeWalls()
	{
		for (var i=this.walls.length-2; i>=0; i--)
		{
			var wallA = this.walls[i];
			var axis = wallA.axis;
			for (var j=this.walls.length-1; j>i; j--)
			{
				var wallB = this.walls[j];
				if (wallB.axis!=axis) continue;
				if (distSqr(wallA.max,wallB.min)>EPS &&
					distSqr(wallA.min,wallB.max)>EPS ) continue; 
				// merge both walls
				wallA.min.x = Math.min(wallA.min.x,wallB.min.x);
				wallA.min.z = Math.min(wallA.min.z,wallB.min.z);
				wallA.max.x = Math.max(wallA.max.x,wallB.max.x);
				wallA.max.z = Math.max(wallA.max.z,wallB.max.z);
				this.walls.splice(j,1);
			}
		}
	} // MEIRO.DungeonLevel.mergeWalls


	// merge aligned floors
	mergeFloors()
	{
		tryAgain:
		
		for (var i=0; i<this.floors.length-1; i++)
		{
			var floorA = this.floors[i];
			var areaA = area(floorA.min,floorA.max);
			
			for (var j=i+1; j<this.floors.length; j++)
			{
				var floorB = this.floors[j];
				var areaB = area(floorB.min,floorB.max);

				// floor C is the smallest spanning area over A and B
				var floorC = {
					min:{ x:Math.min(floorA.min.x,floorB.min.x),
						  z:Math.min(floorA.min.z,floorB.min.z) },
					max:{ x:Math.max(floorA.max.x,floorB.max.x),
						  z:Math.max(floorA.max.z,floorB.max.z) },
				};
				var areaC = area(floorC.min,floorC.max);
				if (equal(areaA+areaB,areaC))
				{
					this.floors.splice(j,1);
					this.floors[i] = floorC;
					continue tryAgain;
				}
			}
		}

	} // MEIRO.DungeonLevel.mergeFloors


	// split the dungeon level into rooms
	findRoom(pos)
	{
		//console.log('find pos',pos.x,pos.z);
		var that = this;
		function split( min, max, quadTree )
		{
			if( quadTree instanceof MEIRO.Room )
			{
				var room = quadTree;
				if( inArea(pos,room.min,room.max) )
					return room;
				else
					return undefined;
			}
			
			//console.log(quadTree.pos,min,max);
			if( quadTree.pos > 0 )
			{
				// split along X
				var midX = min.x+quadTree.pos;
				if( pos.x < midX )
					return split( min, {x:midX, z:max.z}, quadTree.min );
				else
					return split( {x:midX, z:min.z}, max, quadTree.max );
			}
			else
			{	// split along Z
				var midZ = min.z-quadTree.pos;
				if( pos.z < midZ )
					return split( min, {x:max.x, z:midZ}, quadTree.min );
				else
					return split( {x:min.x, z:midZ}, max, quadTree.max );
			}
		}

		return split( this.dungeon.min, this.dungeon.max, this.splitQuadTree );

	} // MEIRO.DungeonLevel.findRoom
	
	
	// find the room where a point is
	findRoomIndex(pos)
	{
		for (var i in this.rooms)
		{
			var room = this.rooms[i];
			if (inArea(pos,room.min,room.max))
				return i;
		}
		return undefined;
	} // MEIRO.DungeonLevel.findRoomIndex


	// find the stairs where a point is
	findStairs(pos)
	{
		for (var i in this.stairs)
		{
			var stairs = this.stairs[i];
			if (inArea(pos,stairs.min,stairs.max))
				return stairs;
		}
		return undefined;
	} // MEIRO.DungeonLevel.findStairs


	// find the floor where a point is
	findFloorIndex(pos)
	{
		for (var i in this.floors)
		{
			var floor = this.floors[i];
			if (inArea(pos,floor.min,floor.max))
				return i;
		}
		return -1;
	} // MEIRO.DungeonLevel.findFloorIndex


	// find the wall where a point is
	findWallIndex(pos)
	{
		for (var i in this.walls)
		{
			var wall = this.walls[i];
			if (inArea(pos,wall.min,wall.max))
				return i;
		}
		return -1;
	} // MEIRO.DungeonLevel.findWallIndex


	// find the corner wall where a point is
	findCornerWall(pos,firstWall)
	{
		for (var i in this.walls) 
		{
			var wall = this.walls[i];
			if (wall.axis!=firstWall.axis)
				if (inArea(pos,wall.min,wall.max))
					return wall;
		}
		return undefined;
	} // MEIRO.DungeonLevel.findCornerWall


	// find the wall where a point is strictly inside
	// i.e. not near its edges
	findInsideWall(pos)
	{
		for (var i in this.walls)
		{
			var wall = this.walls[i];
			if (inArea(pos,wall.min,wall.max))
			{
				if (distSqr(pos,wall.min)<0.5) continue;
				if (distSqr(pos,wall.max)<0.5) continue;
				return wall;
			}
		}
		return undefined;
	} // MEIRO.DungeonLevel.findInsideWall


	// add an array of door for each room
	roomDoors()
	{
		for (var i =0; i<this.doors.length; i++)
		{
			var door = this.doors[i];
			var axisX = (door.axis=='x');
			
			var pos = {x:door.mid.x, y:this.levelIndex, z:door.mid.z};
			//if (this.levelIndex==0) debugPos(this.dungeon,pos.x,2*pos.y,pos.z);
			
			// check one side of the door
			if (axisX) pos.z += 0.5; else pos.x += 0.5;
			var room = this.findRoom(pos);
			room.doors.push(door);
			
			// check the other side of the door
			if (axisX) pos.z -= 1; else pos.x -= 1;
			var room = this.findRoom(pos);
			room.doors.push(door);
		}
	} // MEIRO.DungeonLevel.roomDoors



	
} // MEIRO.DungeonLevel
