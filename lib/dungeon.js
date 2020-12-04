//	MEIRO
//	Generation of dungeon's structure - levels of rooms with
//	walls, doors and stairs.
//		
//
//	MEIRO.Dungeon()
//	 ├─ id			- dungeon ID
//	 ├─ min			= {x,y,z}
//	 ├─ max			= {x,y,z}
//	 ├─ levels[]	- DungeonLevel
//	 └─ roomsBySize(onlyEmpty)
//
//
//	MEIRO.Room(min,max,level)
//	 ├─ doors[]
//	 └─ inSafeZone(pos)		return 0=outside, 1=inside room, 2=inside door, 3=inside stairs
//
//	MEIRO.Stairs(min,max,mid,dir,midUp,midDown,vec,level)
//	 └─ inSafeZone(pos)		return 0=forbidden, 1=inside stairs; 2=outside stairs
//
//	2020.11 - P. Boytchev

MEIRO.STAIRS = {
	LENGTH: 3, // do not change
	HEIGHT: 2,
};

// save zone around objects which is forbidden for walking
MEIRO.SAFE_ZONE = {
	WALL:0.2 // forbidden zone around walls
};


	
// Dungeon constructor - size.x and size.z are horizontal
// sizes, size.y is nu,ber of levels
MEIRO.Dungeon = class
{
	constructor()
	{
		console.time('Dungeon');
		
		this.id = options.id;
		
		this.min = {x:0,y:0,z:0};
		this.max = options.size;
		
		// construct levels
		this.levels = []; // all levels
		for (var i=0; i<options.size.y; i++)
			this.levels.push( new MEIRO.DungeonLevel(this) );

		// add some internal cross-data (must be done after the
		// complete dungeon is built)
		for (var i=0; i<options.size.y; i++)
		{
			this.levels[i].roomDoors();
//			this.levels[i].generateSafeZones();
		}

		// add some internal cross-data (must be done after the
		// complete dungeon is built)
		for (var i=0; i<options.size.y; i++)
		{
//			this.levels[i].roomDoors();
			this.levels[i].generateSafeZones();
		}

		console.dir(this);
		
		console.timeEnd('Dungeon');
		//console.table(this.roomsBySize(true));
		//console.log('Empty rooms:',this.roomsBySize(true).length);
		
	} // MEIRO.Dungeon.constructor
	
	
	// get a list of all rooms grouped by minimal room size
	roomsBySize(onlyEmpty)
	{
		var result = [];
		for (var l in this.levels)
		for (var r in this.levels[l].rooms)
		{
			var level = this.levels[l];
			var room = level.rooms[r];
			var size = delta(room.min,room.max);
			var stairs = false;
			// get stairs to lower levels
			for (var s in level.stairs)
				if ( inArea(level.stairs[s].mid,room.min,room.max) ||
					 inArea(level.stairs[s].midUp,room.min,room.max) )
				{
					stairs = true;
					break;
				}
			// get stairs to upper levels
			if (!stairs && level.upperLevel)
			for (var s in level.upperLevel.stairs)
				if ( inArea(level.upperLevel.stairs[s].mid,room.min,room.max) ||
					 inArea(level.upperLevel.stairs[s].midDown,room.min,room.max) )
				{
					stairs = true;
					break;
				}
				
			if (onlyEmpty && stairs) continue;	
			result.push( {size:Math.min(size.x,size.z), room:room, levelNo:parseInt(l), roomNo:parseInt(r), stairs:stairs} );
		}
		result.sort(function(a,b) {
			if (b.size!=a.size) return b.size-a.size;
			var an = Math.sin(a.levelNo)+Math.sin(a.roomNo);
			var bn = Math.sin(b.levelNo)+Math.sin(b.roomNo);
			return bn-an;
		});
		return result;
		
	} // MEIRO.Dungeon.roomsBySize

} // MEIRO.Dungeon







MEIRO.Stairs = class
{
	constructor( min, max, mid, dir, midUp, midDown, vec, level )
	{
		this.min = min;
		this.max = max;
		this.mid = mid;
		this.dir = dir;
		this.midUp = midUp;
		this.midDown = midDown;
		this.vec = vec;
		this.level = level; // upper level
		this.index = level.stairs.length;

		var d={};
		var u={};
		
		d.x = midDown.x+0.5*vec.x;
		d.z = midDown.z+0.5*vec.z;
		u.x = midUp.x-0.5*vec.x;
		u.z = midUp.z-0.5*vec.z;
		
		var axis = (dir%2)?'x':'z';
		this.slope = {axis:axis, min:d[axis], max:u[axis]};
		
	} // MEIRO.Stairs.constructor


	// checks whether position is in the safe zone of stairs
	// returns: 0=forbidden, 1=inside stairs; 2=outside stairs
	inSafeZone( pos )
	{
		// is it in the safe zone of the stairs?
		if (inArea(pos,this.safeZone.min,this.safeZone.max))
		{
			//console.log('	stairs-inside');
			return 1;
		}
		
		// is it in the unsafe zone of the stairs?
		if (inArea(pos,this.unsafeZone.min,this.unsafeZone.max))
		{
			//console.log('	stairs-forbidden');
			return 0;
		}

		// it is outside the stairs
		//console.log('	stairs-outside');
		return 2;
	} // MEIRO.Stairs.inSafeZone
	
} // MEIRO.Stairs





MEIRO.Room = class
{
	constructor( min, max, level )
	{
		this.level = level; // DungeonLevel
		this.min = min;
		this.max = max;
		this.image = undefined;
		this.doors = [];
		this.index = level.rooms.length;
	} // MEIRO.Room.constructor
	

	// checks whether position is in the safe zone of a room
	// returns: 0=outside, 1=inside room, 2=inside door, 3=inside stairs
	inSafeZone( pos )
	{
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


	
} // MEIRO.Room








// debug stairs		
function debugPos(dungeon,x,y,z)
{
	var style = new THREE.MeshNormalMaterial({
			transparent : !true,
			opacity : 0.5,
		});
	var geom = new THREE.SphereGeometry(0.2);
	var mesh = new THREE.Mesh(geom,style);
	mesh.position.set( x-0*dungeon.max.x/2, y+0.2, z-0*dungeon.max.z/2 );
	scene.add( mesh );
}
function debugArea(dungeon,y,min,max,color,height)
{
	var style = new THREE.MeshBasicMaterial({
			color: color,
			transparent : true,
			opacity : 0.5,
		});
	var geom = new THREE.BoxGeometry(max.x-min.x,height,max.z-min.z);
	var mesh = new THREE.Mesh(geom,style);
	var mid = middle(min,max);
	mesh.position.set( mid.x-0*dungeon.max.x/2, 2*y, mid.z-0*dungeon.max.z/2 );
	scene.add( mesh );
}
