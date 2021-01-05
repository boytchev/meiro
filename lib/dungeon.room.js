//	MEIRO
//	Generation of image of a dungeon room + some area around it
//
//	Extends MEIRO class
//	 ├─ proceduralWallTexture(size)
//	 ├─ uvMap(uv,ax,bx,ay,by)
//	 └─ 
//
//	Extends MEIRO.Dungeon class
//	 ├─ showRoom(level,room)
//	 │   ├─ imageFloor()
//	 │   ├─ imageWalls()
//	 │   ├─ imageStairs()
//	 │   └─ imageModelsMarks()
//	 └─ 
//
//	Extends MEIRO.Room class
//	 ├─ generateImage()
//	 ├─ generateSafeZone()
//	 ├─ show()
//	 ├─ hide()
//	 └─ ...
//
//	2017.03 - P. Boytchev


MEIRO.TEXTURE_SIZE = 1024; 
MEIRO.MODELMARK = {HEIGHT: 0.01};
MEIRO.TEXTURE_STROKE_STYLE = 'rgb(100, 149, 237)';//'mediumblue'; // colour of texture lines
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
			FLOOR: new THREE.MeshBasicMaterial({
					color: 'white',
			}),
			WALL:  new THREE.MeshBasicMaterial({
					color: 'white',
			}),
			PILLAR: new THREE.MeshBasicMaterial({
					color: 'white',
			}),
			PILLAR4: new THREE.MeshBasicMaterial({
					color: 'white',
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
		
	// define textures
	if (options.textures)
	{
		MEIRO.generateNoiseCanvas();
		MEIRO.STYLE.FLOOR.map = MEIRO.proceduralFloorTexture(MEIRO.TEXTURE_SIZE);
		MEIRO.STYLE.WALL.map = MEIRO.proceduralWallTexture(MEIRO.TEXTURE_SIZE);
		MEIRO.STYLE.SLOPE.map = MEIRO.STYLE.WALL.map;
		MEIRO.STYLE.RAILING.map = MEIRO.STYLE.WALL.map;
		MEIRO.STYLE.PILLAR.map = MEIRO.proceduralPillarTexture(MEIRO.TEXTURE_SIZE);
		MEIRO.STYLE.PILLAR4.map = MEIRO.proceduralPillar4Texture(MEIRO.TEXTURE_SIZE);
		MEIRO.STYLE.MODELMARK.map = MEIRO.STYLE.FLOOR.map;
	}
}

	
// Show the image of a room (param: level number and room number)
MEIRO.Dungeon.prototype.showRoom = function(level,room)
{
//	this.levels[level].rooms[room].show();
}

	
// Makes a room shown (generate image if needed)
MEIRO.Room.prototype.show = function()
{
}
	
// Makes a room hidden
MEIRO.Room.prototype.hide = function()
{
}


// image of all floors, with holes for downstairs
MEIRO.Dungeon.prototype.imageFloor = function()
{	
	// collect all floor plates into one geometry
	var allFloors = new THREE.Geometry();
	
	// scan all floor plates and find the intersection with the room
	for (var l in this.levels)
	for (var i in this.levels[l].floors)
	{
		var floor = this.levels[l].floors[i];
		var size = delta(floor.min,floor.max);
		var mid = middle(floor.min,floor.max);
		
		// create the floor plate
		var geom = MEIRO.GEOMETRY.FLOOR.clone(true);
		geom.scale(size.x,1,size.z);
		geom.translate(mid.x,l*MEIRO.STAIRS.HEIGHT,mid.z);

		for (var f=0; f<geom.faces.length; f++)
		for (var j=0; j<3; j++)
		{
			var uv = geom.faceVertexUvs[0][f][j];
			MEIRO.uvMap(uv,floor.min.x,floor.max.x,-floor.max.z,-floor.min.z);
		}
		
		// merge it with the other floor plates
		allFloors.merge( geom );
		
		// if this is the bottom floor, then add it as a top floor
		if (l+i==0)
		{
			geom.translate(0,this.max.y*MEIRO.STAIRS.HEIGHT,0);
			allFloors.merge( geom );
		}
		
		geom.dispose();
	}

	allFloors.mergeVertices();
	var bufferGeom = (new THREE.BufferGeometry()).fromGeometry(allFloors);
	this.image.add(new THREE.Mesh( bufferGeom, MEIRO.STYLE.FLOOR));
}


// image of all floors, with holes for downstairs
MEIRO.Room.prototype.generateSafeZones = function()
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


MEIRO.textureFromCanvas = function(canvas)
{
	var texture = new THREE.Texture(canvas);
	texture.anisotropy = 256; // looks good at oblique angles
	texture.needsUpdate = true;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.MirroredRepeatWrapping;
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

	return MEIRO.textureFromCanvas(canvas);
}


// Generates procedurally texture for the wall - noise + 2 stripes
MEIRO.proceduralWallTexture = function(size/*in pixels*/)
{	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = size;
	canvas.height = size;
	
	ctx.drawImage(MEIRO.NOISE_CANVAS,0,0);
	
	// thick line
	ctx.strokeStyle = MEIRO.TEXTURE_STROKE_STYLE;
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
	
	// thin AO line
	ctx.beginPath();
	ctx.lineWidth = 0.01*size;
	ctx.moveTo(0,0.90*size);
	ctx.lineTo(size,0.90*size);
	ctx.stroke();
	//MEIRO.pseudoAO(ctx,size);
	
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



	// thick line
	ctx.strokeStyle = MEIRO.TEXTURE_STROKE_STYLE;
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
	
	// thin AO line
	ctx.beginPath();
	ctx.lineWidth = 0.01*size;
	ctx.moveTo(0,0.90*size);
	ctx.lineTo(size,0.90*size);
	ctx.stroke();
	
	//MEIRO.pseudoAO(ctx,size);
	
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
	
	ctx.strokeStyle = MEIRO.TEXTURE_STROKE_STYLE;

	// thick line
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

	// thin AO line
	ctx.beginPath();
	ctx.lineWidth = 0.01*size;
	ctx.moveTo(0,0.90*size);
	ctx.lineTo(size,0.90*size);
	ctx.stroke();

	//MEIRO.pseudoAO(ctx,size);
	
	var texture = MEIRO.textureFromCanvas(canvas);
	texture.repeat.set( 1, 2 );

	return texture;
}


