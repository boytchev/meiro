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
		
console.time('Dungeon Levels');
		
		// construct levels
		this.levels = []; // all levels
		for (var i=0; i<options.size.y; i++)
			this.levels.push( new MEIRO.DungeonLevel(this) );
		
console.timeEnd('Dungeon Levels');
console.time('Dungeon Doors');

		// add some internal cross-data (must be done after the
		// complete dungeon is built)
		for (var i=0; i<options.size.y; i++)
		{
			this.levels[i].roomDoors();
		}

console.timeEnd('Dungeon Doors');
console.time('Dungeon SafeZones');

console.timeEnd('Dungeon SafeZones');

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


// Show the image of a room (param: level number and room number)
MEIRO.Dungeon.prototype.showRoom = function(level,room)
{
//	this.levels[level].rooms[room].show();
}

	

MEIRO.TEXTURE_SIZE = 1024; 
MEIRO.MODELMARK = {HEIGHT: 0.01};
MEIRO.TEXTURE_STROKE_STYLE = 'gray';//'rgb(100, 149, 237)';//'mediumblue'; // colour of texture lines
MEIRO.TEXTURE_GRID_STYLE = 'rgba(100, 149, 237,0.3)';//'mediumblue'; // colour of texture lines


// map u & v ranges from (0,1) to (min,max)
MEIRO.uvMap = function(uv,uMin,uMax,vMin,vMax)
{
	uv.x = uMin + uv.x*(uMax-uMin);
	uv.y = vMin + uv.y*(vMax-vMin);
}


MEIRO.initDungeonRoom = function()
{
	MEIRO.GEOMETRY = {
			FLOOR:	new THREE.BoxGeometry(1,MEIRO.THICKNESS,1),
			WALL:	new THREE.BoxGeometry(1,MEIRO.STAIRS.HEIGHT,1),
			PILLAR:	new THREE.CylinderGeometry(MEIRO.WIDENESS/2,MEIRO.WIDENESS/2,MEIRO.STAIRS.HEIGHT,options.lowpoly?4:12,1,true,0,Math.PI),
			PILLAR4:new THREE.CylinderGeometry(MEIRO.WIDENESS/2,MEIRO.WIDENESS/2,MEIRO.STAIRS.HEIGHT,options.lowpoly?2:6,1,true,0,Math.PI/2),
	//		GLASS:	new THREE.BoxGeometry(0.8*MEIRO.PILLAR.DISTANCE,0.6*MEIRO.PILLAR.HEIGHT,0.6*MEIRO.PILLAR.RADIUS),
			SLOPE:	function()
					{
						//return new THREE.Geometry();
						var V = MEIRO.THICKNESS;
						var W = MEIRO.RAILING.WIDTH;
						var L = MEIRO.STAIRS.LENGTH;
						var H = MEIRO.STAIRS.HEIGHT;
						var T = MEIRO.THICKNESS;
						
						// spline profile of the slope						
						var shape = new THREE.Shape();
							shape.moveTo(0,T/2-V+EPS);
							shape.lineTo(1+MEIRO.WIDENESS/2,T/2-V);
							shape.lineTo(1+MEIRO.WIDENESS/2,T/2-V+0.2+T/2);
							
							shape.bezierCurveTo( // lower curve
								1+MEIRO.WIDENESS/2, T/2-V+0.5+T/2+0.5,
								L-1+0.3, H+T/2-V,
								L, H+T/2-V);

							shape.lineTo(L,H+T/2);
							shape.bezierCurveTo(L-1,H+T/2, 1,T/2, 0,T/2); // upper curve

						var extrudeSettings = {
							depth: 1,
							bevelEnabled: false,
							curveSegments: options.lowpoly?8:60,
						};

						var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
						/*
						for (var i=0; i<geometry.faces.length; i++)
							if ((geometry.faces[i].normal.x)>EPS)
								geometry.faces[i].color = new THREE.Color(Math.random(0.9,1),Math.random(0.9,1),Math.random(0.9,1));
						*/
						for (var i=0; i<geometry.faces.length; i++)
							if (Math.abs(geometry.faces[i].normal.x)>EPS)
						for (var j=0; j<3; j++)
						{
							var vertex;
							if (j==0) vertex = geometry.faces[i].a;
							if (j==1) vertex = geometry.faces[i].b;
							if (j==2) vertex = geometry.faces[i].c;
							vertex = geometry.vertices[vertex];
							var uv = geometry.faceVertexUvs[0][i][j];
							if (geometry.faces[i].normal.x>0)
							{
								uv.x = vertex.z;
								uv.y = vertex.y;
							}
							else
							{
								uv.x = vertex.x;
								uv.y = vertex.z+0.5;
							}
						}

						geometry.rotateY(-Math.PI/2);
						geometry.translate(0.5,-H,0.5-L);
						return geometry;
					}(),
			RAILING1: function()
					{
						var geometry = new THREE.BoxGeometry(1+0*MEIRO.RAILING.WIDTH,MEIRO.RAILING.HEIGHT,MEIRO.RAILING.WIDTH);
						for (var i=0; i<12; i++)
						for (var j=0; j<3; j++)
						{
							var uv = geometry.faceVertexUvs[0][i][j];
							if (i>=4 && i<8) // top/bottom faces
								MEIRO.uvMap(uv,0,1,0,MEIRO.RAILING.WIDTH);
							else
							if (i>=8 && i<12) // front/back faces
								MEIRO.uvMap(uv,0,1,MEIRO.THICKNESS/2,MEIRO.THICKNESS/2+2*MEIRO.RAILING.HEIGHT/MEIRO.STAIRS.HEIGHT);
							else // thin vertical sides
								MEIRO.uvMap(uv,0,MEIRO.RAILING.WIDTH,MEIRO.THICKNESS/2,MEIRO.THICKNESS/2+2*MEIRO.RAILING.HEIGHT/MEIRO.STAIRS.HEIGHT);
						}
						return geometry;
					}(),
			RAILING: function()
					{
						//return new THREE.Geometry();
						var V = MEIRO.RAILING.HEIGHT;
						var W = MEIRO.RAILING.WIDTH;
						var L = MEIRO.STAIRS.LENGTH;
						var H = MEIRO.STAIRS.HEIGHT;
						var T = MEIRO.THICKNESS;
						
						// spline profile of the railing
						var shape = new THREE.Shape();
							shape.moveTo(0,0+T/2);
							shape.bezierCurveTo(1,0+T/2, L-1,H+T/2, L,H+T/2);
							shape.lineTo(L,H+V+T/2);
							shape.lineTo(L-2,H+V+T/2);
							shape.lineTo(L-2,H-T/2);
							shape.lineTo(L-2,H-T/2);
							shape.bezierCurveTo(L-1,H-T/2-0.1, 1,V+T/2, 0,V+T/2);

						var extrudeSettings = {
							depth: W,
							bevelEnabled: false,
							curveSegments: options.lowpoly?8:60,
						};

						var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
						/*
						for (var i=0; i<geometry.faces.length; i++)
							if (Math.abs(geometry.faces[i].normal.x)>EPS)
								geometry.faces[i].color = new THREE.Color(Math.random(0.9,1),Math.random(0.9,1),Math.random(0.9,1));
						*/	
						for (var i=0; i<geometry.faces.length; i++)
							if (Math.abs(geometry.faces[i].normal.x)>EPS)
						for (var j=0; j<3; j++)
						{
							var vertex;
							if (j==0) vertex = geometry.faces[i].a;
							if (j==1) vertex = geometry.faces[i].b;
							if (j==2) vertex = geometry.faces[i].c;
							vertex = geometry.vertices[vertex];
							var uv = geometry.faceVertexUvs[0][i][j];
							uv.x = vertex.z;
							uv.y = vertex.y;
						}
						geometry.rotateY(-Math.PI/2);
						geometry.translate(W/2,-H,0.5-L);
						return geometry;
					}(),
			MODELMARK: function()
					{
						var geometry = new THREE.BoxGeometry(2,MEIRO.MODELMARK.HEIGHT,2);
						for (var i=0; i<12; i++)
						for (var j=0; j<3; j++)
						{
							var uv = geometry.faceVertexUvs[0][i][j];
							if (i>=4 && i<8) // top/bottom faces
								MEIRO.uvMap(uv,0,2,0,2);
								/*
							else
							if (i>=8 && i<12) // front/back faces
								MEIRO.uvMap(uv,0,1,MEIRO.THICKNESS/2,MEIRO.THICKNESS/2+2*MEIRO.RAILING.HEIGHT/MEIRO.STAIRS.HEIGHT);
							else // thin vertical sides
								MEIRO.uvMap(uv,0,MEIRO.RAILING.WIDTH,MEIRO.THICKNESS/2,MEIRO.THICKNESS/2+2*MEIRO.RAILING.HEIGHT/MEIRO.STAIRS.HEIGHT);
								*/
						}
						return geometry;
					}(),
		};

	MEIRO.STYLE = {
			FLOOR: new THREE.MeshPhongMaterial({
					color: 'white',
					bumpScale: 0.2,
			}),
			WALL:  new THREE.MeshPhongMaterial({
					color: 'white',
					bumpScale: 0.2,
					shininess: 200,
			}),
			PILLAR: new THREE.MeshPhongMaterial({
					color: 'white',
					bumpScale: 0.2,
					shininess: 200,
			}),
			PILLAR4: new THREE.MeshPhongMaterial({
					color: 'white',
					bumpScale: 0.2,
					shininess: 200,
			}),
			RAILING:  new THREE.MeshBasicMaterial({
					color: 'white',
			}),
			SLOPE: new THREE.MeshBasicMaterial({
					color: 'white',
			}),
			MODELMARK: new THREE.MeshBasicMaterial({
					color: options.noAO?0xFAFAFA:'white',
			}),
		};

	// make floor texture coordinates be taken from position coordinates
	MEIRO.STYLE.FLOOR.onBeforeCompile = shader => {
		//console.log(shader.vertexShader);
		shader.vertexShader = shader.vertexShader.replace(
			'#include <begin_vertex>\n',
			
			'#include <begin_vertex>\n'+
			'vUv.xy = (instanceMatrix * vec4(transformed,1.0)).xz;\n'+
			''
		);
	}

	// define textures
	if (options.textures)
	{
		MEIRO.generateNoiseCanvas();
		MEIRO.STYLE.FLOOR.map = MEIRO.proceduralFloorTexture(MEIRO.TEXTURE_SIZE);
		MEIRO.STYLE.FLOOR.bumpMap = MEIRO.proceduralFloorBumpTexture(MEIRO.TEXTURE_SIZE);
		
		MEIRO.STYLE.WALL.map = MEIRO.proceduralWallTexture(MEIRO.TEXTURE_SIZE);
		MEIRO.STYLE.WALL.bumpMap = MEIRO.proceduralWallBumpTexture(MEIRO.TEXTURE_SIZE);
		MEIRO.STYLE.WALL.specularMap = MEIRO.proceduralWallSpecularTexture(MEIRO.TEXTURE_SIZE);
		
		MEIRO.STYLE.PILLAR.map = MEIRO.proceduralPillarTexture(MEIRO.TEXTURE_SIZE);
		MEIRO.STYLE.PILLAR.bumpMap = MEIRO.proceduralPillarBumpTexture(MEIRO.TEXTURE_SIZE);
		MEIRO.STYLE.PILLAR.specularMap = MEIRO.proceduralPillarSpecularTexture(MEIRO.TEXTURE_SIZE);
		
		MEIRO.STYLE.PILLAR4.map = MEIRO.proceduralPillar4Texture(MEIRO.TEXTURE_SIZE);
		MEIRO.STYLE.PILLAR4.bumpMap = MEIRO.proceduralPillar4BumpTexture(MEIRO.TEXTURE_SIZE);
		MEIRO.STYLE.PILLAR4.specularMap = MEIRO.proceduralPillar4SpecularTexture(MEIRO.TEXTURE_SIZE);
		
		MEIRO.STYLE.SLOPE.map = MEIRO.STYLE.WALL.map;
		MEIRO.STYLE.RAILING.map = MEIRO.STYLE.WALL.map;
		MEIRO.STYLE.MODELMARK.map = MEIRO.STYLE.FLOOR.map;
	}
}

	
// image of all floors, with holes for downstairs
MEIRO.Dungeon.prototype.imageFloor = function()
{
	var allFloors = new THREE.Group();
	
	var geometry  = MEIRO.GEOMETRY.FLOOR,
		material  = MEIRO.STYLE.FLOOR,
		matrix = new THREE.Matrix4();
		
	for( var level of this.levels )
	{
		var instances = level.floors.length,
			mesh = new THREE.InstancedMesh( geometry.clone(), material, instances ),
			y = level.levelIndex * MEIRO.STAIRS.HEIGHT;

		// create floor tile matrix
		for( var i in level.floors )
		{
			var floor = level.floors[i],
				size = delta(floor.min,floor.max),
				mid = middle(floor.min,floor.max);

			matrix.makeScale( size.x, 1, size.z );
			matrix.setPosition( mid.x, y, mid.z );
			mesh.setMatrixAt( i, matrix );
		}
		
		mesh.geometry.boundingSphere = new THREE.Sphere(
			new THREE.Vector3(options.size.x/2,y,options.size.z/2),
			Math.sqrt(options.size.x*options.size.x+options.size.z*options.size.z)/2
		);
		
		mesh.frustumCulled = true;
		allFloors.add( mesh );
	}
	
	// add roof
	var roof = new THREE.InstancedMesh( geometry.clone(), material, 1 ),
		y = options.size.y * MEIRO.STAIRS.HEIGHT;
		
	matrix.makeScale( options.size.x, 1, options.size.z );
	matrix.setPosition( options.size.x/2, y, options.size.z/2 );
	roof.setMatrixAt( 0, matrix );
	roof.geometry.boundingSphere = new THREE.Sphere(
			new THREE.Vector3(options.size.x/2,y,options.size.z/2),
			Math.sqrt(options.size.x*options.size.x+options.size.z*options.size.z)/2
		);
	allFloors.add( roof );
	
	this.image.add( allFloors );
}


// image of all floors, with holes for downstairs
MEIRO.Dungeon.prototype.imageFloor2 = function()
{
	var instances = 1;
	for( var level of this.levels )
		instances += level.floors.length;

	var geometry  = MEIRO.GEOMETRY.FLOOR,
		material  = MEIRO.STYLE.FLOOR;
		
	var idx = 0;
		
	var mesh = new THREE.InstancedMesh( geometry, material, instances );
	var matrix = new THREE.Matrix4();

	for( var lv in this.levels )
	{
		var level = this.levels[lv],
			y = lv*MEIRO.STAIRS.HEIGHT;

		// create floor tile matrix
		for( var floor of level.floors )
		{
			var size = delta(floor.min,floor.max),
				mid = middle(floor.min,floor.max);

			matrix.makeScale( size.x, 1, size.z );
			matrix.setPosition( mid.x, y, mid.z );
			mesh.setMatrixAt( idx++, matrix );
		}
	}
	
	// add roof
	matrix.makeScale( options.size.x, 1, options.size.z );
	matrix.setPosition( options.size.x/2, this.levels.length*MEIRO.STAIRS.HEIGHT, options.size.z/2 );
	mesh.setMatrixAt( idx++, matrix );
	
//	mesh.frustumCulled = false;
//	mesh.geometry.computeBoundingBox();
//	mesh.geometry.computeBoundingSphere();
	this.image.add( mesh );
}


// image of model marks
MEIRO.Dungeon.prototype.imageModelsMarks = function()
{	
	// collect all models marks into one geometry
	var allMarks = new THREE.Geometry();
	
	// scan all levels
	for (var l in this.levels)
	for (var i in this.levels[l].rooms)
	{
		var room = this.levels[l].rooms[i];
		if (!room.model) continue;

		var size = delta(room.min,room.max);
		var mid = middle(room.min,room.max);
		
		// create the mark
		var geom = MEIRO.GEOMETRY.MODELMARK.clone(true);
		geom.translate(mid.x,l*MEIRO.STAIRS.HEIGHT+MEIRO.THICKNESS/2+MEIRO.MODELMARK.HEIGHT/2,mid.z);
		
		// merge it with the other floor plates
		allMarks.merge( geom );
		geom.dispose();
	}

	allMarks.mergeVertices();
	var bufferGeom = (new THREE.BufferGeometry()).fromGeometry(allMarks);
	this.image.add(new THREE.Mesh( bufferGeom, MEIRO.STYLE.MODELMARK));
}


// image of walls, with holes for doors
MEIRO.Dungeon.prototype.imageWalls = function()
{
	// collect all walls into one geometry
	var allWalls = new THREE.Geometry();
	var allPillars = new THREE.Geometry();
	var allPillars4 = new THREE.Geometry();
	
	// draw all wall segments; skip those which are too short
	for (var l in this.levels)
	for (var i in this.levels[l].walls)
	{
		var wall = this.levels[l].walls[i];
		var size = delta(wall.min,wall.max);

		// create the wall
		var geom = MEIRO.GEOMETRY.WALL.clone(true);

		// fix texture UV coordinates (front and back faces of the x-wall are symmetrical)
		for (var i=0; i<12; i++)
		for (var j=0; j<3; j++)
		{
			var uv = geom.faceVertexUvs[0][i][j];
			MEIRO.uvMap(uv,wall.min[wall.axis],wall.max[wall.axis],0,MEIRO.STAIRS.HEIGHT);
		}

		// adjust the plate size and position
		var mid = middle(wall.min,wall.max);
		geom.scale( wall.axis=='x'?size.x:MEIRO.WIDENESS,1,wall.axis=='z'?size.z:MEIRO.WIDENESS);
		geom.translate( mid.x, l*MEIRO.STAIRS.HEIGHT+MEIRO.STAIRS.HEIGHT/2, mid.z );

		// merge it with the other walls
		allWalls.merge( geom );
		geom.dispose();
		
		// if the wall is long from edge to edge, it does not need pillars
		// the 4 outer-most walls of each level are such type of walls
		if (size.x>this.max.x-EPS || size.z>this.max.z-EPS)
			continue;

		function halfPillar(pos,angle)
		{
			//console.log('HP [',pos.x,pos.z,']');
			var geom = MEIRO.GEOMETRY.PILLAR.clone(true);
			if (wall.axis=='x') geom.rotateY(Math.PI/2*(angle+1));
			if (wall.axis=='z') geom.rotateY(Math.PI/2*angle);
			geom.translate( pos.x, l*MEIRO.STAIRS.HEIGHT+MEIRO.STAIRS.HEIGHT/2, pos.z );
			allPillars.merge( geom );
			geom.dispose();
		}
		
		function quarterPillar(pos,wallA,wallB)
		{
			//console.log('QP [',pos.x,pos.z,']');
			var geom = MEIRO.GEOMETRY.PILLAR4.clone(true);
			// find orientation of quarter pillar
			//  o=pos *=mid
			//
			//	 o═══     ═══o    ║ *       * ║
			//	 ║ *       * ║    o═══     ═══o
			//    (A)     (B)      (C)     (D)
			var mid = middle(middle(wallA.min,wallA.max),middle(wallB.min,wallB.max));
			if (mid.x>pos.x+EPS && mid.z>pos.z+EPS)
				geom.rotateY(Math.PI); //C
			else if (mid.x<pos.x-EPS && mid.z>pos.z+EPS)
				geom.rotateY(Math.PI/2); //D
			else if (mid.x>pos.x+EPS && mid.z<pos.z-EPS)
					geom.rotateY(-Math.PI/2); //B
			else {} // A - no need for rotation
			geom.translate( pos.x, l*MEIRO.STAIRS.HEIGHT+MEIRO.STAIRS.HEIGHT/2, pos.z );
			allPillars4.merge( geom );
			geom.dispose();
		}
		
		// create the door pillar at the "max" end of the wall
		// only is the pillar is not *inside* another wall
		if (!this.levels[l].findInsideWall(wall.max))
		{
			var otherWall = this.levels[l].findCornerWall(wall.max,wall);
			if (otherWall)
			{
				if (wall.axis=='x') quarterPillar(wall.max,wall,otherWall);
			}
			else
				halfPillar(wall.max,-1);
		}
		
		// create the door pillar at the "min" end of the wall
		// only is the pillar is not *inside* another wall
		if (!this.levels[l].findInsideWall(wall.min))
		{
			var otherWall = this.levels[l].findCornerWall(wall.min,wall);
			if (otherWall)
			{
				if (wall.axis=='x') quarterPillar(wall.min,wall,otherWall);
			}
			else
				halfPillar(wall.min,1);
		}
	}
	
	// optimize the vertices
	allWalls.mergeVertices();
	var buffer = (new THREE.BufferGeometry()).fromGeometry(allWalls);
	this.image.add(new THREE.Mesh(buffer,MEIRO.STYLE.WALL));
	allWalls.dispose;
	
	allPillars.mergeVertices();
	var buffer = (new THREE.BufferGeometry()).fromGeometry(allPillars);
	this.image.add(new THREE.Mesh(buffer,MEIRO.STYLE.PILLAR));
	allPillars.dispose();
	
	allPillars4.mergeVertices();
	var buffer = (new THREE.BufferGeometry()).fromGeometry(allPillars4);
	this.image.add(new THREE.Mesh(buffer,MEIRO.STYLE.PILLAR4));
	allPillars4.dispose();
}



// image of stairs
MEIRO.Dungeon.prototype.imageStairs = function()
{
	var allRailings = new THREE.Geometry();
	var allSlopes = new THREE.Geometry();
	
	for (var l in this.levels)
	for (var i in this.levels[l].stairs)
	{
		var stairs = this.levels[l].stairs[i];
		// 1. main slope
		var mesh = new THREE.Mesh(MEIRO.GEOMETRY.SLOPE, MEIRO.STYLE.SLOPE);
		mesh.position.set( stairs.midUp.x, l*MEIRO.STAIRS.HEIGHT, stairs.midUp.z );
		mesh.rotation.y = (stairs.dir * Math.PI/2);
		allSlopes.mergeMesh( mesh );

		// 2. left and right curved railings along the slope
		var mesh = new THREE.Mesh( MEIRO.GEOMETRY.RAILING, MEIRO.STYLE.RAILING );
		var dist = (0.5-MEIRO.RAILING.WIDTH/2);
		mesh.position.set( stairs.midUp.x-dist*stairs.vec.z, l*MEIRO.STAIRS.HEIGHT, stairs.midUp.z-dist*stairs.vec.x );
		mesh.rotation.y = stairs.dir * Math.PI/2;
		allRailings.mergeMesh( mesh );
		mesh.position.set( stairs.midUp.x+dist*stairs.vec.z, l*MEIRO.STAIRS.HEIGHT, stairs.midUp.z+dist*stairs.vec.x );
		allRailings.mergeMesh( mesh );

		// 3. short frontal straight railing at stairs top
		var mesh = new THREE.Mesh( MEIRO.GEOMETRY.RAILING1, MEIRO.STYLE.RAILING );
		var dist = (2-0.5+MEIRO.RAILING.WIDTH/2);
		mesh.position.set( stairs.midUp.x+dist*stairs.vec.x, l*MEIRO.STAIRS.HEIGHT+MEIRO.RAILING.HEIGHT/2+MEIRO.THICKNESS/2, stairs.midUp.z+dist*stairs.vec.z );
		mesh.rotation.y = stairs.dir * Math.PI/2;
		allRailings.mergeMesh( mesh );
	}
	
	//allRailings.mergeVertices(); - no need, minimal effect, less than 1% merged
	var buffer = (new THREE.BufferGeometry()).fromGeometry(allRailings);
	this.image.add( new THREE.Mesh(buffer,MEIRO.STYLE.RAILING) );
	allRailings.dispose();

	//allSlopes.mergeVertices(); - no need, no effect, 0% merged
	var buffer = (new THREE.BufferGeometry()).fromGeometry(allSlopes);
	this.image.add( new THREE.Mesh(buffer,MEIRO.STYLE.SLOPE) );
	allSlopes.dispose();
}


MEIRO.NOISE_CANVAS = undefined;

// Create noise canvas used as a template for textures
MEIRO.generateNoiseCanvas = function()
{
	if (options.noTextures) return;
	var size = MEIRO.TEXTURE_SIZE;
	
	MEIRO.NOISE_CANVAS = document.createElement('canvas');
	MEIRO.NOISE_CANVAS.width = size;
	MEIRO.NOISE_CANVAS.height = size;
	
	var ctx = MEIRO.NOISE_CANVAS.getContext('2d');
	
	// white background
	ctx.fillStyle = 'white';
	ctx.fillRect(0,0,size,size);
	
	// some noise
	ctx.fillStyle = 'rgba(0,0,0,0.1)';
	for (var i=0; i<Math.pow(size,1.5); i++)
	{
		var x = Math.random()*size;
		var y = Math.random()*size;
		ctx.fillRect(x,y,1,1);
	}
	
	// add grid - for debug purposes only
	if (options.debugTextures)
	{
		// draw a black frame
		ctx.fillStyle = 'rgba(0,0,0,0.1)';
		ctx.fillRect(0,0,size,size);
		ctx.fillStyle = 'white';
		ctx.fillRect(size/256,size/256,size-size/128,size-size/128);

		// split into 10x10 blocks by gray lines
		ctx.strokeStyle = MEIRO.TEXTURE_GRID_STYLE;
		ctx.lineWidth = size/512;
		ctx.beginPath();
		for (var i=1; i<10; i++)
		{
		  ctx.moveTo(0,i/10*size);
		  ctx.lineTo(size,i/10*size);
		  ctx.moveTo(i/10*size,0);
		  ctx.lineTo(i/10*size,size);
		}
		ctx.stroke();
		
		// add thicker lines for midsegments
		ctx.lineWidth = 3*size/512;
		ctx.beginPath();
		{
		  ctx.moveTo(0,size/2);
		  ctx.lineTo(size,size/2);
		  ctx.moveTo(size/2,0);
		  ctx.lineTo(size/2,size);
		}
		//ctx.stroke();
		
		// add coordinates
		/*
		ctx.fillStyle = 'black';
		ctx.font = Math.round(0.4*size/10)+'px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('0,0',0.55*size/10,0.7*size/10);
		ctx.fillText('9,0',9.45*size/10,0.7*size/10);
		ctx.fillText('0,9',0.55*size/10,9.7*size/10);
		ctx.fillText('9,9',9.45*size/10,9.7*size/10);
		*/
	}
}


// create a Canvas 2D context
MEIRO.proceduralCreateContext = function(bitmap,sizex,sizey)
{
	var ctx = bitmap.getContext('2d');
	bitmap.width = sizex;
	bitmap.height = sizey;

	ctx.drawImage(MEIRO.NOISE_CANVAS,0,0);
	return ctx;
}


MEIRO.textureFromCanvas = function( canvas, mirrored = true )
{
	var texture = new THREE.Texture(canvas);
	texture.anisotropy = 256; // looks good at oblique angles
	texture.needsUpdate = true;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = mirrored?THREE.MirroredRepeatWrapping:THREE.RepeatWrapping;
	return texture;
}


MEIRO.pseudoAO = function(ctx,size)
{
	if (options.noAO)
	{	// add tiny gray gradientat the edge
		ctx.fillStyle = 'rgba(0,0,0,0.006)';
		for (var i=0; i<50; i++)
		{
			var p = -0.04*(Math.pow(i/49,3));
			ctx.fillRect(0,(0.9+p)*size,size,size);
		}
	}
}


// Generates procedurally texture for the floor - just noise
MEIRO.proceduralFloorTexture = function(size/*in pixels*/)
{	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = size;
	canvas.height = size;
	
	ctx.drawImage(MEIRO.NOISE_CANVAS,0,0);

	var n=10;

	for( var i=0; i<n+1; i+=1 )
	for( var j=0; j<n+1; j+=1 )
	{
		ctx.fillStyle = 'rgba(100,50,0,'+(0.05*Math.random())+')';
		ctx.fillRect( i/n*size, j/n*size, size/n, size/n );
	}
	
	ctx.strokeStyle = 'white';//'rgba(0,0,0,0.5)';
	ctx.lineWidth = 1;
	ctx.beginPath();
	for( var i=0; i<=n; i+=1 )
	{
		ctx.moveTo( i/n*size, 0 );
		ctx.lineTo( i/n*size, size );
		ctx.moveTo( 0, i/n*size );
		ctx.lineTo( size, i/n*size );
	}
	ctx.stroke();
	
	return MEIRO.textureFromCanvas(canvas,false);
}


// Generates procedurally texture for the floor - just noise
MEIRO.proceduralFloorBumpTexture = function(size/*in pixels*/)
{	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = size;
	canvas.height = size;
	
	var n=10;

//	ctx.drawImage(MEIRO.NOISE_CANVAS,0,0,12*size,12*size);
	ctx.fillStyle = 'rgba(255,255,255,0.9)';
	ctx.fillRect( 0, 0, size, size );

	for( var i=0; i<n+1; i+=1 )
	for( var j=0; j<n+1; j+=1 )
	{
		ctx.fillStyle = 'rgba(0,0,0,'+(0.01*Math.random())+')';
		ctx.fillRect( i/n*size, j/n*size, size/n, size/n );
	}
	
	ctx.strokeStyle = 'rgb(253,253,253)';
	ctx.lineWidth = 1;
	ctx.beginPath();
	for( var i=0; i<=n; i+=1 )
	{
		ctx.moveTo( i/n*size, 0 );
		ctx.lineTo( i/n*size, size );
		ctx.moveTo( 0, i/n*size );
		ctx.lineTo( size, i/n*size );
	}
	ctx.stroke();

	return MEIRO.textureFromCanvas(canvas,false);

}


// Generates procedurally texture for the wall - noise + 2 stripes
MEIRO.proceduralWallTexture = function(size/*in pixels*/)
{	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = size;
	canvas.height = size;
	
	ctx.drawImage(MEIRO.NOISE_CANVAS,0,0);
	
	var n=10;

	for( var i=0; i<n+1; i+=1 )
	for( var j=0; j<n+1; j+=1 )
	{
		ctx.fillStyle = 'rgba(100,50,0,'+(0.05*Math.random())+')';
		ctx.fillRect( i/n*size, j/n*size, size/n, size/n );
	}
	
	ctx.strokeStyle = 'white';//'rgba(0,0,0,0.5)';
	ctx.lineWidth = 1;
	ctx.beginPath();
	for( var i=0; i<=n; i+=1 )
	{
		ctx.moveTo( i/n*size, 0 );
		ctx.lineTo( i/n*size, size );
		ctx.moveTo( 0, i/n*size );
		ctx.lineTo( size, i/n*size );
	}
	ctx.stroke();
	
	// thick line
	ctx.strokeStyle = 'dimgray';
	ctx.beginPath();
	ctx.lineWidth = 0.1*size;
	ctx.moveTo(0,0.75*size);
	ctx.lineTo(size,0.75*size);
	ctx.stroke();
	
	// thin line
	ctx.beginPath();
	ctx.lineWidth = 0.025*size;
	ctx.moveTo(0,0.65*size);
	ctx.lineTo(size,0.65*size);
	ctx.stroke();
	
	// central line
	ctx.beginPath();
	ctx.lineWidth = 0.005*size;
	ctx.moveTo(0,0*size);
	ctx.lineTo(size,0*size);
	ctx.stroke();

	
	ctx.strokeStyle = 'rgba(0,0,0,0.3)';
	ctx.lineWidth = 1;
	ctx.beginPath();
	var m = 64;
	for( var i=0; i<=m; i+=1 )
	{
		ctx.moveTo( i/m*size+0.5, 0.72*size );
		ctx.lineTo( i/m*size+0.5, 0.78*size );
	}
	ctx.stroke();
	
	// pseudo AO
	ctx.globalCompositeOperation = 'multiply';
	var gradient = ctx.createLinearGradient( 0, 0.8*size, 0, 0.9*size );
		gradient.addColorStop(0.5, 'white');
		gradient.addColorStop(0.95, 'lightgray');
		gradient.addColorStop(1, 'gray');
	ctx.fillStyle = gradient;	
	ctx.fillRect( 0, 0.8*size, size, 0.1*size );
	ctx.globalCompositeOperation = 'copy';
	
	return MEIRO.textureFromCanvas(canvas);
}


// Generates procedurally texture for the wall - noise + 2 stripes
MEIRO.proceduralWallBumpTexture = function(size/*in pixels*/)
{	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = size;
	canvas.height = size;
	
	ctx.fillStyle = 'rgb(240,240,240)';
	ctx.fillRect( 0, 0, size, size );
	
	var n=10;

	for( var i=0; i<n+1; i+=1 )
	for( var j=0; j<n+1; j+=1 )
	{
		ctx.fillStyle = 'rgba(0,0,0,'+(0.01*Math.random())+')';
		ctx.fillRect( i/n*size, j/n*size, size/n, size/n );
	}
	
	// thick line
	ctx.strokeStyle = 'rgba(255,255,255,1)';
	ctx.beginPath();
	ctx.lineWidth = 0.1*size;
	ctx.moveTo(0,0.75*size);
	ctx.lineTo(size,0.75*size);
	ctx.stroke();
	
	// thin line
	ctx.beginPath();
	ctx.lineWidth = 0.025*size;
	ctx.moveTo(0,0.65*size);
	ctx.lineTo(size,0.65*size);
	ctx.stroke();
	
	// central line
	ctx.beginPath();
	ctx.lineWidth = 0.01*size;
	ctx.moveTo(0,0*size);
	ctx.lineTo(size,0*size);
	ctx.stroke();
	
	return MEIRO.textureFromCanvas(canvas);
}


// Generates procedurally texture for the wall - noise + 2 stripes
MEIRO.proceduralWallSpecularTexture = function(size/*in pixels*/)
{	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = size;
	canvas.height = size;
	
	ctx.fillStyle = 'black';
	ctx.fillRect( 0, 0, size, size );
	
	var n = 10;
	
	for( var i=0; i<n+1; i+=1 )
	for( var j=0; j<n+1; j+=1 )
	{
		ctx.fillStyle = 'rgba(255,255,255,'+(0.5*Math.random())+')';
		ctx.fillRect( i/n*size, j/n*size, size/n, size/n );
	}
	
	// thick line
	ctx.strokeStyle = 'white';
	ctx.beginPath();
	ctx.lineWidth = 0.1*size;
	ctx.moveTo(0,0.75*size);
	ctx.lineTo(size,0.75*size);
	ctx.stroke();
	
	// thin line
	ctx.beginPath();
	ctx.lineWidth = 0.025*size;
	ctx.moveTo(0,0.65*size);
	ctx.lineTo(size,0.65*size);
	ctx.stroke();
	
	// central line
	ctx.beginPath();
	ctx.lineWidth = 0.01*size;
	ctx.moveTo(0,0*size);
	ctx.lineTo(size,0*size);
	ctx.stroke();

		
	return MEIRO.textureFromCanvas(canvas);
}


// Generates procedurally texture for the half door pillar
MEIRO.proceduralPillarTexture = function(size/*in pixels*/)
{	
	var sizex = size/4;
	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = sizex;
	canvas.height = size;
	
	ctx.drawImage(MEIRO.NOISE_CANVAS,0,0);

	var n=10;

	for( var i=0; i<n/4+1; i+=1 )
	for( var j=0; j<n+1; j+=1 )
	{
		ctx.fillStyle = 'rgba(100,50,0,'+(0.05*Math.random())+')';
		ctx.fillRect( i/n*size, j/n*size, size/n, size/n );
	}

	ctx.strokeStyle = 'white';//'rgba(0,0,0,0.5)';
	ctx.lineWidth = 1;
	ctx.beginPath();
	for( var i=0; i<=n; i+=1 )
	{
		ctx.moveTo( i/n*size, 0 );
		ctx.lineTo( i/n*size, size );
		ctx.moveTo( 0, i/n*size );
		ctx.lineTo( size, i/n*size );
	}
	ctx.stroke();
	
	// thick line
	ctx.strokeStyle = 'dimgray';
	ctx.beginPath();
	ctx.lineWidth = 0.1*size;
	ctx.moveTo(0,0.75*size);
	ctx.lineTo(sizex,0.75*size);
	ctx.stroke();

	// thin line
	ctx.beginPath();
	ctx.lineWidth = 0.025*size;
	ctx.moveTo(0,0.65*size);
	ctx.lineTo(0.2*sizex,0.65*size);
	ctx.quadraticCurveTo(0.4*sizex,0.65*size,0.4*sizex,0.65*size-0.2*sizex);
	ctx.lineTo(0.4*sizex,0);

	ctx.moveTo(sizex,0.65*size);
	ctx.lineTo(sizex-0.2*sizex,0.65*size);
	ctx.quadraticCurveTo(sizex-0.4*sizex,0.65*size,sizex-0.4*sizex,0.65*size-0.2*sizex);
	ctx.lineTo(sizex-0.4*sizex,0);
	ctx.stroke();
	
	// central line
	ctx.beginPath();
	ctx.lineWidth = 0.005*size;
	ctx.moveTo(0,0*size);
	ctx.lineTo(0.4*sizex,0*size);
	ctx.moveTo(0.6*sizex,0*size);
	ctx.lineTo(1*sizex,0*size);
	ctx.stroke();

	ctx.strokeStyle = 'rgba(0,0,0,0.3)';
	ctx.lineWidth = 1;
	ctx.beginPath();
	var m = 26;
	for( var i=0; i<=m; i+=1 )
	{
		ctx.moveTo( i/m*sizex+0.5, 0.72*size );
		ctx.lineTo( i/m*sizex+0.5, 0.78*size );
	}
	ctx.stroke();
	
	// pseudo AO
	ctx.globalCompositeOperation = 'multiply';
	var gradient = ctx.createLinearGradient( 0, 0.8*size, 0, 0.9*size );
		gradient.addColorStop(0.5, 'white');
		gradient.addColorStop(0.95, 'lightgray');
		gradient.addColorStop(1, 'gray');
	ctx.fillStyle = gradient;	
	ctx.fillRect( 0, 0.8*size, sizex, 0.1*size );
	ctx.globalCompositeOperation = 'copy';

	var texture = MEIRO.textureFromCanvas(canvas);
	texture.repeat.set( 1, 2 );

	return texture;
}



// Generates procedurally texture for the half door pillar
MEIRO.proceduralPillarBumpTexture = function(size/*in pixels*/)
{	
	var sizex = size/4;
	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = sizex;
	canvas.height = size;
	
	ctx.fillStyle = 'rgb(240,240,240)';
	ctx.fillRect( 0, 0, sizex, size );

	var n=10;

	for( var i=0; i<n/4+1; i+=1 )
	for( var j=0; j<n+1; j+=1 )
	{
		ctx.fillStyle = 'rgba(0,0,0,'+(0.01*Math.random())+')';
		ctx.fillRect( i/n*size, j/n*size, size/n, size/n );
	}
	
	// thick line
	ctx.strokeStyle = 'rgba(255,255,255,1)';
	ctx.beginPath();
	ctx.lineWidth = 0.1*size;
	ctx.moveTo(0,0.75*size);
	ctx.lineTo(sizex,0.75*size);
	ctx.stroke();

	// thin line
	ctx.beginPath();
	ctx.lineWidth = 0.025*size;
	ctx.moveTo(0,0.65*size);
	ctx.lineTo(0.2*sizex,0.65*size);
	ctx.quadraticCurveTo(0.4*sizex,0.65*size,0.4*sizex,0.65*size-0.2*sizex);
	ctx.lineTo(0.4*sizex,0);

	ctx.moveTo(sizex,0.65*size);
	ctx.lineTo(sizex-0.2*sizex,0.65*size);
	ctx.quadraticCurveTo(sizex-0.4*sizex,0.65*size,sizex-0.4*sizex,0.65*size-0.2*sizex);
	ctx.lineTo(sizex-0.4*sizex,0);
	ctx.stroke();
	
	// central line
	ctx.beginPath();
	ctx.lineWidth = 0.01*size;
	ctx.moveTo(0,0*size);
	ctx.lineTo(0.4*sizex,0*size);
	ctx.moveTo(0.6*sizex,0*size);
	ctx.lineTo(1*sizex,0*size);
	ctx.stroke();

	var texture = MEIRO.textureFromCanvas(canvas);
	texture.repeat.set( 1, 2 );

	return texture;
}




// Generates procedurally texture for the half door pillar
MEIRO.proceduralPillarSpecularTexture = function(size/*in pixels*/)
{	
	var sizex = size/4;
	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = sizex;
	canvas.height = size;
	
	ctx.fillStyle = 'black';
	ctx.fillRect( 0, 0, sizex, size );

	var n=10;

	for( var i=0; i<n/4+1; i+=1 )
	for( var j=0; j<n+1; j+=1 )
	{
		ctx.fillStyle = 'rgba(255,255,255,'+(0.5*Math.random())+')';
		ctx.fillRect( i/n*size, j/n*size, size/n, size/n );
	}
	
	// thick line
	ctx.strokeStyle = 'white';
	ctx.beginPath();
	ctx.lineWidth = 0.1*size;
	ctx.moveTo(0,0.75*size);
	ctx.lineTo(sizex,0.75*size);
	ctx.stroke();

	// thin line
	ctx.beginPath();
	ctx.lineWidth = 0.025*size;
	ctx.moveTo(0,0.65*size);
	ctx.lineTo(0.2*sizex,0.65*size);
	ctx.quadraticCurveTo(0.4*sizex,0.65*size,0.4*sizex,0.65*size-0.2*sizex);
	ctx.lineTo(0.4*sizex,0);

	ctx.moveTo(sizex,0.65*size);
	ctx.lineTo(sizex-0.2*sizex,0.65*size);
	ctx.quadraticCurveTo(sizex-0.4*sizex,0.65*size,sizex-0.4*sizex,0.65*size-0.2*sizex);
	ctx.lineTo(sizex-0.4*sizex,0);
	ctx.stroke();

	// central line
	ctx.beginPath();
	ctx.lineWidth = 0.01*size;
	ctx.moveTo(0,0*size);
	ctx.lineTo(0.4*sizex,0*size);
	ctx.moveTo(0.6*sizex,0*size);
	ctx.lineTo(1*sizex,0*size);
	ctx.stroke();

	var texture = MEIRO.textureFromCanvas(canvas);
	texture.repeat.set( 1, 2 );

	return texture;
}


// Generates procedurally texture for cubes
MEIRO.proceduralCubeTexture = function(size/*in pixels*/)
{	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = size/4;
	canvas.height = size/4;
	
	ctx.fillStyle = 'white';
	ctx.fillRect(0,0,size/4,size/4);
	ctx.strokeStyle = 'rgba(0,0,0,0.5)';
	ctx.lineWidth = 1;
	ctx.strokeRect(1,1,size/4-2,size/4-2);
	
	return MEIRO.textureFromCanvas(canvas);
}


// Generates procedurally texture for the quarter door pillar
MEIRO.proceduralPillar4Texture = function(size/*in pixels*/)
{	
	var sizex = size/8;
	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = sizex;
	canvas.height = size;
	
	ctx.drawImage(MEIRO.NOISE_CANVAS,0,0);
	
	var n=10;
	for( var i=0; i<n/8+1; i+=1 )
	for( var j=0; j<n+1; j+=1 )
	{
		ctx.fillStyle = 'rgba(100,50,0,'+(0.05*Math.random())+')';
		ctx.fillRect( i/n*size, j/n*size, size/n, size/n );
	}

	ctx.strokeStyle = 'white';//'rgba(0,0,0,0.5)';
	ctx.lineWidth = 1;
	ctx.beginPath();
	for( var i=0; i<=n; i+=1 )
	{
		ctx.moveTo( i/n*size, 0 );
		ctx.lineTo( i/n*size, size );
		ctx.moveTo( 0, i/n*size );
		ctx.lineTo( size, i/n*size );
	}
	ctx.stroke();

	// thick line
	ctx.strokeStyle = 'dimgray';
	ctx.lineWidth = 0.1*size;
	ctx.beginPath();
	ctx.moveTo(0,0.75*size);
	ctx.lineTo(sizex,0.75*size);
	ctx.stroke();
	
	// thin line
	ctx.lineWidth = 0.025*size;
	ctx.moveTo(0,0.65*size);
	ctx.lineTo(0.1*sizex,0.65*size);
	ctx.quadraticCurveTo(0.3*sizex,0.65*size,0.3*sizex,0.65*size-0.2*sizex);
	ctx.lineTo(0.3*sizex,0);

	ctx.moveTo(sizex,0.65*size);
	ctx.lineTo(sizex-0.1*sizex,0.65*size);
	ctx.quadraticCurveTo(sizex-0.3*sizex,0.65*size,sizex-0.3*sizex,0.65*size-0.2*sizex);
	ctx.lineTo(sizex-0.3*sizex,0);
	ctx.stroke();

	// central line
	ctx.beginPath();
	ctx.lineWidth = 0.005*size;
	ctx.moveTo(0,0*size);
	ctx.lineTo(0.4*sizex,0*size);
	ctx.moveTo(0.6*sizex,0*size);
	ctx.lineTo(1*sizex,0*size);
	ctx.stroke();
	
	ctx.strokeStyle = 'rgba(0,0,0,0.3)';
	ctx.lineWidth = 1;
	ctx.beginPath();
	var m = 13;
	for( var i=0; i<=m; i+=1 )
	{
		ctx.moveTo( i/m*sizex+0.5, 0.72*size );
		ctx.lineTo( i/m*sizex+0.5, 0.78*size );
	}
	ctx.stroke();

	// pseudo AO
	ctx.globalCompositeOperation = 'multiply';
	var gradient = ctx.createLinearGradient( 0, 0.8*size, 0, 0.9*size );
		gradient.addColorStop(0.5, 'white');
		gradient.addColorStop(0.95, 'lightgray');
		gradient.addColorStop(1, 'gray');
	ctx.fillStyle = gradient;	
	ctx.fillRect( 0, 0.8*size, sizex, 0.1*size );
	ctx.globalCompositeOperation = 'copy';

	var texture = MEIRO.textureFromCanvas(canvas);
	texture.repeat.set( 1, 2 );

	return texture;
}


// Generates procedurally texture for the quarter door pillar
MEIRO.proceduralPillar4BumpTexture = function(size/*in pixels*/)
{	
	var sizex = size/8;
	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = sizex;
	canvas.height = size;
	
	ctx.fillStyle = 'rgb(240,240,240)';
	ctx.fillRect( 0, 0, sizex, size );
	
	var n=10;

	for( var i=0; i<n/8+1; i+=1 )
	for( var j=0; j<n+1; j+=1 )
	{
		ctx.fillStyle = 'rgba(0,0,0,'+(0.01*Math.random())+')';
		ctx.fillRect( i/n*size, j/n*size, size/n, size/n );
	}

	// thick line
	ctx.strokeStyle = 'rgba(255,255,255,1)';
	ctx.lineWidth = 0.1*size;
	ctx.moveTo(0,0.75*size);
	ctx.lineTo(sizex,0.75*size);
	ctx.stroke();

	// thin line
	ctx.lineWidth = 0.025*size;
	ctx.moveTo(0,0.65*size);
	ctx.lineTo(0.1*sizex,0.65*size);
	ctx.quadraticCurveTo(0.3*sizex,0.65*size,0.3*sizex,0.65*size-0.2*sizex);
	ctx.lineTo(0.3*sizex,0);

	ctx.moveTo(sizex,0.65*size);
	ctx.lineTo(sizex-0.1*sizex,0.65*size);
	ctx.quadraticCurveTo(sizex-0.3*sizex,0.65*size,sizex-0.3*sizex,0.65*size-0.2*sizex);
	ctx.lineTo(sizex-0.3*sizex,0);
	ctx.stroke();

	// central line
	ctx.beginPath();
	ctx.lineWidth = 0.01*size;
	ctx.moveTo(0,0*size);
	ctx.lineTo(0.4*sizex,0*size);
	ctx.moveTo(0.6*sizex,0*size);
	ctx.lineTo(1*sizex,0*size);
	ctx.stroke();
	
	var texture = MEIRO.textureFromCanvas(canvas);
	texture.repeat.set( 1, 2 );

	return texture;
}


// Generates procedurally texture for the quarter door pillar
MEIRO.proceduralPillar4SpecularTexture = function(size/*in pixels*/)
{	
	var sizex = size/8;
	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = sizex;
	canvas.height = size;
	
	ctx.fillStyle = 'black';
	ctx.fillRect( 0, 0, sizex, size );
	
	var n=10;

	for( var i=0; i<n/8+1; i+=1 )
	for( var j=0; j<n+1; j+=1 )
	{
		ctx.fillStyle = 'rgba(255,255,255,'+(0.5*Math.random())+')';
		ctx.fillRect( i/n*size, j/n*size, size/n, size/n );
	}

	// thick line
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 0.1*size;
	ctx.moveTo(0,0.75*size);
	ctx.lineTo(sizex,0.75*size);
	ctx.stroke();

	// thin line
	ctx.lineWidth = 0.025*size;
	ctx.moveTo(0,0.65*size);
	ctx.lineTo(0.1*sizex,0.65*size);
	ctx.quadraticCurveTo(0.3*sizex,0.65*size,0.3*sizex,0.65*size-0.2*sizex);
	ctx.lineTo(0.3*sizex,0);

	ctx.moveTo(sizex,0.65*size);
	ctx.lineTo(sizex-0.1*sizex,0.65*size);
	ctx.quadraticCurveTo(sizex-0.3*sizex,0.65*size,sizex-0.3*sizex,0.65*size-0.2*sizex);
	ctx.lineTo(sizex-0.3*sizex,0);
	ctx.stroke();

	// central line
	ctx.beginPath();
	ctx.lineWidth = 0.01*size;
	ctx.moveTo(0,0*size);
	ctx.lineTo(0.4*sizex,0*size);
	ctx.moveTo(0.6*sizex,0*size);
	ctx.lineTo(1*sizex,0*size);
	ctx.stroke();
	
	var texture = MEIRO.textureFromCanvas(canvas);
	texture.repeat.set( 1, 2 );

	return texture;
}
