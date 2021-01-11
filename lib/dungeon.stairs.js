//	MEIRO
//
//	MEIRO.Stairs(min,max,mid,dir,midUp,midDown,vec,level)
//	 └─ inSafeZone(pos)		return 0=forbidden, 1=inside stairs; 2=outside stairs
//
//	2020.11-2021.02 - P. Boytchev



	
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
		if( !this.safeZone ) this.generateSafeZones();
		
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
	
	generateSafeZones()
	{
		// Step 2 - generate safe zones for stairs 
		//            × = midUp       × = midDown
		//        ╔═══════╤═══════╗═══════╗
		//      ┌─────────────────║─────────┐      
		//  top |     ×   safe zone   ×     | bottom
		//      └─────────────────║─────────┘      
		//        ╚═══════╧═══════╝═══════╝
		//				    vec ->
		//
		//        ╔═══════╤═══════╗═══════╗ unsafe zone
		//        └───────────────║───────┘      
		//  top       ×               ×       bottom
		//        ┌───────────────║───────┐      
		//        ╚═══════╧═══════╝═══════╝ unsafe zone

		var p1 = {
			x: this.midUp.x-(0.5+MEIRO.SAFE_ZONE.WALL/2)*this.vec.x-(0.5-MEIRO.SAFE_ZONE.WALL/2-MEIRO.RAILING.WIDTH)*this.vec.z,
			z: this.midUp.z-(0.5+MEIRO.SAFE_ZONE.WALL/2)*this.vec.z+(0.5-MEIRO.SAFE_ZONE.WALL/2-MEIRO.RAILING.WIDTH)*this.vec.x,
		}
		var p2 = {
			x: this.midDown.x+(0.5+MEIRO.SAFE_ZONE.WALL/2)*this.vec.x+(0.5-MEIRO.SAFE_ZONE.WALL/2-MEIRO.RAILING.WIDTH)*this.vec.z,
			z: this.midDown.z+(0.5+MEIRO.SAFE_ZONE.WALL/2)*this.vec.z-(0.5-MEIRO.SAFE_ZONE.WALL/2-MEIRO.RAILING.WIDTH)*this.vec.x
		}
		
		var stairsMin = {x:Math.min(p1.x,p2.x),z:Math.min(p1.z,p2.z)};
		var stairsMax = {x:Math.max(p1.x,p2.x),z:Math.max(p1.z,p2.z)};
		this.safeZone = {min:stairsMin, max:stairsMax};
		//debugArea(this.dungeon,this.levelIndex,stairsMin,stairsMax,'pink',0.3);
		//debugArea(this.dungeon,this.levelIndex-1,stairsMin,stairsMax,'pink',0.3);
			
		var p1 = {
			x: this.midUp.x-(0.5+MEIRO.SAFE_ZONE.WALL/2)*this.vec.x-(0.5)*this.vec.z,
			z: this.midUp.z-(0.5+MEIRO.SAFE_ZONE.WALL/2)*this.vec.z+(0.5)*this.vec.x,
		}
		var p2 = {
			x: this.midDown.x+(0.5+MEIRO.SAFE_ZONE.WALL/2)*this.vec.x+(0.5)*this.vec.z,
			z: this.midDown.z+(0.5+MEIRO.SAFE_ZONE.WALL/2)*this.vec.z-(0.5)*this.vec.x
		}
		
		var stairsMin = {x:Math.min(p1.x,p2.x),z:Math.min(p1.z,p2.z)};
		var stairsMax = {x:Math.max(p1.x,p2.x),z:Math.max(p1.z,p2.z)};
		this.unsafeZone = {min:stairsMin, max:stairsMax};
		//debugArea(this.dungeon,this.levelIndex,stairsMin,stairsMax,'blue',0.24);
		//debugArea(this.dungeon,this.levelIndex-1,stairsMin,stairsMax,'blue',0.24);
			
	} // MEIRO.Stairs.generateSafeZones

	
} // MEIRO.Stairs



