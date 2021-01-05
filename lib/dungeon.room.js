//	MEIRO
//
//	MEIRO.Room(min,max,level)
//	 ├─ min, max			← {x,z}
//	 ├─ level				← MEIRO.DungeonLevel
//	 ├─ index				← index in MEIRO.DungeonLevel.rooms[...]
//	 ├─ doors[...]			← MEIRO.Door
//	 ├─ safeZone
//	 │    ├─ room			← {min:{x,z}, max:{x,z}} - safe zone
//	 │    ├─ doors[...]		← {min:{x,z}, max:{x,z}} - safe zone
//	 │    └─ stairs[...]	← {min:{x,z}, max:{x,z}} - unsafe zone
//	 │         └─ safeZone	← {min:{x,z}, max:{x,z}} - safe zone inside the unsafe zone
//	 │
//	 ├─ show()
//	 ├─ hide()
//	 ├─ generateSafeZones()
//	 └─ inSafeZone(pos)		return 0=outside, 1=inside room, 2=inside door, 3=inside stairs
//
//	2017.03-2021.01 - P. Boytchev


MEIRO.Room = class
{
	constructor( min, max, level )
	{
		this.level = level; // DungeonLevel
		this.min = min;
		this.max = max;
		this.doors = [];
		this.index = level.rooms.length;
		this.safeZone = undefined;
	} // MEIRO.Room.constructor
	

	// generator of safe zones for the room
	// executed once, on demand, by inSafeZone()
	generateSafeZones = function()
	{	
		// Step 1 - generate safe zones for rooms (rooms, doors, stairs entrances/exists)
		this.safeZone = {};
		
		// safe zone of the room itself (contains unsafe stairs)
		//		╔══════════════  ══╗
		//		  ┌──────────────┐ ║
		//		║ | safe         | ║
		//		║ |         zone |  
		//		║ └──────────────┘ ║
		//		╚═══════  ═════════╝
		this.safeZone.room = {
			min:{x:this.min.x+MEIRO.SAFE_ZONE.WALL, z:this.min.z+MEIRO.SAFE_ZONE.WALL},
			max:{x:this.max.x-MEIRO.SAFE_ZONE.WALL, z:this.max.z-MEIRO.SAFE_ZONE.WALL}
		};
		//debugArea(this.dungeon,this.levelIndex,room.safeZone.room.min,room.safeZone.room.max,'red',0.22);
				
		// safe zones for doors
		//             ┌────┐
		//		══════╗|safe|╔══════  
		//		══════╝|zone|╚══════  
		//             └────┘
		this.safeZone.doors = [];
		for (var door of this.doors)
		{
			var doorMin = {x:door.min.x, z:door.min.z};
			var doorMax = {x:door.max.x, z:door.max.z};

			/*
			// check wether there are upstairs near the door
			// if there are - the door has no safe zone
			var found = false;
			if (this.upperLevel)
			{
				for (s in this.upperLevel.stairs)
					if (distSqr(door.mid,this.upperLevel.stairs[s].midDown)<0.5)
					{
						found = true;
						break;
					}
			}
			if (found) continue;
			*/
			
			var coord1 = (door.axis=='x')?'x':'z';
			var coord2 = (door.axis=='x')?'z':'x';
			
			//doorMin[coord1] += MEIRO.SAFE_ZONE.WALL/2;
			//doorMax[coord1] -= MEIRO.SAFE_ZONE.WALL/2;
			doorMin[coord2] -= MEIRO.SAFE_ZONE.WALL;
			doorMax[coord2] += MEIRO.SAFE_ZONE.WALL;

			// if there is wall to the left, then shrink the safe zone
			var found = false;
			for (var wall of this.level.walls)
			{
				if (inArea(door.min,wall.min,wall.max))
				{
					found = true;
					break;
				}
			} // wall of this.level.walls
			if (found) doorMin[coord1] += MEIRO.SAFE_ZONE.WALL;
					
			// if there is wall to the right, then shrink the safe zone
			var found = false;
			for (var wall of this.level.walls)
			{
				if (inArea(door.max,wall.min,wall.max))
				{
					found = true;
					break;
				}
			} // wall of this.level.walls
			if (found) doorMax[coord1] -= MEIRO.SAFE_ZONE.WALL;
					
			this.safeZone.doors.push( {min:doorMin, max:doorMax} );
			//debugArea(this.dungeon,this.levelIndex,doorMin,doorMax,'orange',0.22);
		} // for (var door of this.doors)

				
		// unsafe(!) zones for stairs to the lower level
		this.safeZone.stairs = [];
		//              × = midUp   vec->
		// stairs ┌───────────────────┐       
		//    top | ╔═══════╤═══════╗═|═════╗ 
		//        ├──┐              ║ |      stairs
		// safe zone |  ×           ║ |      bottom
		//        ├──┘              ║ |      
		// we're  | ╚═══════╧═══════╝═|═════╝
		// here   └───────────────────┘
		//       0.5   unsafe zone   1.5
		//
		for (var stairs of this.level.stairs)
		{
			// skip the stairs if the upper side is outside this room
			if (!inAreaZone(stairs.midUp,this.min,this.max,MEIRO.STAIRS.LENGTH))
				continue;

			var p1 = {
				x: stairs.midUp.x+(1.5+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.x-(0.5+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.z,
				z: stairs.midUp.z+(1.5+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.z+(0.5+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.x,
			}
			var p2 = {
				x: stairs.midUp.x-(0.5+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.x+(0.5+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.z,
				z: stairs.midUp.z-(0.5+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.z-(0.5+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.x
			}

			var stairsMin = {x:Math.min(p1.x,p2.x),z:Math.min(p1.z,p2.z)};
			var stairsMax = {x:Math.max(p1.x,p2.x),z:Math.max(p1.z,p2.z)};
			var safeZone = {min:stairsMin, max:stairsMax, stairs:stairs};
			this.safeZone.stairs.push( safeZone );
			//debugArea(this.dungeon,this.levelIndex,stairsMin,stairsMax,'blue',0.24);
					
			// add a safe zone inside the unsafe zone of the stairs
			var p1 = {
				x: stairs.midUp.x-(0.5-MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.x-(0.5-MEIRO.SAFE_ZONE.WALL/2-MEIRO.RAILING.WIDTH)*stairs.vec.z,
				z: stairs.midUp.z-(0.5-MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.z+(0.5-MEIRO.SAFE_ZONE.WALL/2-MEIRO.RAILING.WIDTH)*stairs.vec.x,
			}
			var p2 = {
				x: stairs.midUp.x-(0.5+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.x+(0.5-MEIRO.SAFE_ZONE.WALL/2-MEIRO.RAILING.WIDTH)*stairs.vec.z,
				z: stairs.midUp.z-(0.5+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.z-(0.5-MEIRO.SAFE_ZONE.WALL/2-MEIRO.RAILING.WIDTH)*stairs.vec.x
			}

			var stairsMin = {x:Math.min(p1.x,p2.x),z:Math.min(p1.z,p2.z)};
			var stairsMax = {x:Math.max(p1.x,p2.x),z:Math.max(p1.z,p2.z)};
			safeZone.safeZone = {min:stairsMin, max:stairsMax};
			//debugArea(this.dungeon,this.levelIndex,stairsMin,stairsMax,'yellow',0.3);
		} // for (var stairs of this.level.stairs)

		// unsafe(!) zones for stairs to the upper level
		//        × = midDown  ┌────────────┐ stairs
		//        ╔═══════╤════|══╗═══════╗ | bottom
		//                     |  ║   ┌─────|      
		//    top              |  ║   × safe|zone
		//                     |  ║   └─────|      
		//        ╚═══════╧════|══╝═══════╝ | we're
		//                     └────────────┘ here
		//                  0.7 unsafe zone 0.5
		var upperLevel = this.level.upperLevel;
		if (upperLevel)
		for (var stairs of upperLevel.stairs)
		{
			// skip the stairs if the upper side is outside this room
			if (!inAreaZone(stairs.midDown,this.min,this.max,MEIRO.STAIRS.LENGTH))
				continue;
			var p1 = {
				x: stairs.midDown.x+(0.5+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.x-(0.5+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.z,
				z: stairs.midDown.z+(0.5+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.z+(0.5+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.x,
			}
			var p2 = {
				x: stairs.midDown.x-(0.7+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.x+(0.5+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.z,
				z: stairs.midDown.z-(0.7+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.z-(0.5+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.x
			}
					
			var stairsMin = {x:Math.min(p1.x,p2.x),z:Math.min(p1.z,p2.z)};
			var stairsMax = {x:Math.max(p1.x,p2.x),z:Math.max(p1.z,p2.z)};
			var safeZone = {min:stairsMin, max:stairsMax, stairs:stairs};
			this.safeZone.stairs.push( safeZone );
			//debugArea(this.dungeon,this.levelIndex,stairsMin,stairsMax,'blue',0.24);
					
			// add a safe zone inside the unsafe zone of the stairs
			var p1 = {
				x: stairs.midDown.x+(0.5-MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.x-(0.5-MEIRO.SAFE_ZONE.WALL/2-MEIRO.RAILING.WIDTH)*stairs.vec.z,
				z: stairs.midDown.z+(0.5-MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.z+(0.5-MEIRO.SAFE_ZONE.WALL/2-MEIRO.RAILING.WIDTH)*stairs.vec.x,
			}
			var p2 = {
				x: stairs.midDown.x+(0.5+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.x+(0.5-MEIRO.SAFE_ZONE.WALL/2-MEIRO.RAILING.WIDTH)*stairs.vec.z,
				z: stairs.midDown.z+(0.5+MEIRO.SAFE_ZONE.WALL/2)*stairs.vec.z-(0.5-MEIRO.SAFE_ZONE.WALL/2-MEIRO.RAILING.WIDTH)*stairs.vec.x
			}

			var stairsMin = {x:Math.min(p1.x,p2.x),z:Math.min(p1.z,p2.z)};
			var stairsMax = {x:Math.max(p1.x,p2.x),z:Math.max(p1.z,p2.z)};
			safeZone.safeZone = {min:stairsMin, max:stairsMax};
			//debugArea(this.dungeon,this.levelIndex,stairsMin,stairsMax,'yellow',0.3);
		} // if (upperLevel) for (var stairs of upperLevel.stairs)
				
	} // MEIRO.Room.generateSafeZones


	// checks whether position is in the safe zone of a room
	// returns: 0=outside, 1=inside room, 2=inside door, 3=inside stairs
	inSafeZone( pos )
	{
		if( !this.safeZone ) this.generateSafeZones();
		
		// is it in the original safe zone of the room?
		if (inArea(pos,this.safeZone.room.min,this.safeZone.room.max))
		{
			// check in-room stairs
			for (var i in this.safeZone.stairs)
			{
				if (inArea(pos,this.safeZone.stairs[i].min,this.safeZone.stairs[i].max)) // unsafe zone
				{
					if (inArea(pos,this.safeZone.stairs[i].safeZone.min,this.safeZone.stairs[i].safeZone.max))
					{
						this.inStairs = this.safeZone.stairs[i].stairs;
						//console.log('	room-inside stairs',i);
						return 3;
					}
					else
					{
						//console.log('	room-hit stairs unsafe zone');
						return 0;
					}	
				}
			}
			//console.log('	room-inside');
			return 1;
		}

		// it is ouside the safe zone of a room, so it is at the room peripheral zone
		// possible cases: in stairs safezone, in door safezone, otherwise - it is hitting the wall
		
		// is it in the safe zone of stairs?
		for (var i in this.safeZone.stairs)
		{
			if (inArea(pos,this.safeZone.stairs[i].safeZone.min,this.safeZone.stairs[i].safeZone.max))
			{
				this.inStairs = this.safeZone.stairs[i].stairs;
				//console.log('	outside room-inside stairs',i,'index',this.inStairs.index);
				return 3;
			}
		}
		
		// is it in the safe zone of a door?
		for (var i in this.safeZone.doors)
		{
			if (inArea(pos,this.safeZone.doors[i].min,this.safeZone.doors[i].max))
			{
				// check  stairs
				for (var i in this.safeZone.stairs)
				{
					if (inArea(pos,this.safeZone.stairs[i].min,this.safeZone.stairs[i].max)) // unsafe zone
					{
						if (inArea(pos,this.safeZone.stairs[i].safeZone.min,this.safeZone.stairs[i].safeZone.max))
						{
							this.inStairs = this.safeZone.stairs[i].stairs;
							//console.log('	room-inside stairs',i);
							return 3;
						}
						else
						{
							//console.log('	room-hit stairs unsafe zone');
							return 0;
						}	
					}
				}

				//console.log('	room-inside door',i);
				return 2;
			}
		}
		
		// not in the safe zone
		//console.log('	room-outside any safe zone');
		return 0;
	} // MEIRO.Room.inSafeZone



	// placeholder function
	show()
	{	
	} // MEIRO.Room.show


		
	// placeholder function
	hide()
	{
	} // MEIRO.Room.hide



} // MEIRO.Room
