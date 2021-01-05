//	MEIRO
//
//	MEIRO.Door(min,max,axis) extends THREE.Box3(min,max)
//	 ├─ min					← THREE.Vector3
//	 ├─ max					← THREE.Vector3
//	 ├─ axis				← 'x' or 'z'
//	 └─ ...
//
//	2017.03-2021.01 - P. Boytchev


MEIRO.Door = class extends THREE.Box3
{
	constructor( min, max, axis )
	{
		super( min, max );
		
		this.axis = axis;
		this.mid = min.midTo( max );
		
	} // MEIRO.Door.constructor
	
} // MEIRO.Door
