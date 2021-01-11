//	MEIRO
//	Generation of dungeon's structure - levels of rooms with
//	walls, doors and stairs.
//		
//
//	MEIRO.Dungeon()
//	 ├─ id			- dungeon ID
//	 ├─ min			= {x,y,z}
//	 ├─ max			= {x,y,z} = options.size
//	 ├─ levels[]	- DungeonLevel
//	 └─ roomsBySize( onlyEmpty )
//
//	2020.11-2021.01 - P. Boytchev




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
	roomsBySize( onlyEmpty )
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


	// set the boungind sphere for a given level
	setBoundingSphere( mesh, y )
	{
		mesh.geometry.boundingSphere = new THREE.Sphere(
			new THREE.Vector3(options.size.x/2,y,options.size.z/2),
			Math.sqrt(options.size.x*options.size.x+options.size.z*options.size.z)/2 );
		mesh.frustumCulled = true;
	}
	
} // MEIRO.Dungeon








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
	

MEIRO.TEXTURE_SIZE = 1024; 
MEIRO.TEXTURE_STROKE_STYLE = 'gray';//'rgb(100, 149, 237)';//'mediumblue'; // colour of texture lines
MEIRO.TEXTURE_GRID_STYLE = 'rgba(100, 149, 237,0.3)';//'mediumblue'; // colour of texture lines

MEIRO.POLE = {HEIGHT:0.4};


MEIRO.initDungeonRoom = function()
{
	MEIRO.GEOMETRY = {
			FLOOR:	new THREE.BoxBufferGeometry(1,MEIRO.THICKNESS,1),
			WALL:	new THREE.BoxBufferGeometry(1,MEIRO.STAIRS.HEIGHT,1),
			STEP:	new THREE.BoxBufferGeometry(1,MEIRO.STAIRS.STEPHEIGHT,MEIRO.STAIRS.STEPDEPTH),
			PILLAR:	new THREE.CylinderBufferGeometry(MEIRO.WIDENESS/2,MEIRO.WIDENESS/2,MEIRO.STAIRS.HEIGHT,options.lowpoly?4:12,1,true,0,Math.PI),
			PILLAR4:new THREE.CylinderGeometry(MEIRO.WIDENESS/2,MEIRO.WIDENESS/2,MEIRO.STAIRS.HEIGHT,options.lowpoly?2:6,1,true,0,Math.PI/2),
			GLASS:	new THREE.PlaneBufferGeometry(0.9,0.33),
			POLE: function()
				{
					var geometry = new THREE.CylinderBufferGeometry(0.02,0.02,MEIRO.POLE.HEIGHT,options.lowpoly?6:12,2,true).translate(0,MEIRO.POLE.HEIGHT/2,0);
					
					var pos = geometry.getAttribute( 'position' );
					for( var i=0; i<pos.count; i++ )
					{
						var y = pos.getY(i);
						if( EPS<y )
						{
							pos.setX( i, 0.2*pos.getX(i) );
							if( y<0.4 ) pos.setY( i, 0.01 );
							pos.setZ( i, 0.2*pos.getZ(i) );
						}
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
			POLE: new THREE.MeshBasicMaterial({
					color: 0x202020,
			}),
			GLASS: new THREE.MeshBasicMaterial({
					color: 'darkorange', // the negative colour is seen
					transparent: true,
					depthWrite: false,
					side: THREE.DoubleSide,
					blending: THREE.CustomBlending,
					blendEquation: THREE.ReverseSubtractEquation,
					blendSrc: THREE.SrcAlphaFactor,
					blendDst: THREE.OneMinusSrcAlphaFactor,
			}),
			STEP: new THREE.MeshPhongMaterial({
					color: 'white',
					bumpScale: 0.2,
					shininess: 200,
					polygonOffset: true,
					polygonOffsetFactor: -1,
					polygonOffsetUnits: -1,
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

	MEIRO.STYLE.WALL.onBeforeCompile = shader => {
		//console.log(shader.vertexShader);
		shader.vertexShader = shader.vertexShader.replace(
			'#include <begin_vertex>\n',
			
			'#include <begin_vertex>\n'+
			'vec3 xyz = (instanceMatrix * vec4(transformed,1.0)).xyz;\n'+
			'vUv = vec2(xyz.x+xyz.z,xyz.y);\n'+
			''
		);
	}

	// define textures
	if (options.textures)
	{
		MEIRO.generateNoiseCanvas();
		MEIRO.STYLE.FLOOR.map = MEIRO.proceduralFloorTexture(MEIRO.TEXTURE_SIZE,true,false);
		MEIRO.STYLE.FLOOR.bumpMap = MEIRO.proceduralFloorTexture(MEIRO.TEXTURE_SIZE/2,false,true);
		
		MEIRO.STYLE.WALL.map = MEIRO.proceduralWallTexture(MEIRO.TEXTURE_SIZE,true,false,false);
		MEIRO.STYLE.WALL.bumpMap = MEIRO.proceduralWallTexture(MEIRO.TEXTURE_SIZE/4,false,true,false);
		MEIRO.STYLE.WALL.specularMap = MEIRO.proceduralWallTexture(MEIRO.TEXTURE_SIZE/8,false,false,true);
		
		MEIRO.STYLE.PILLAR.map = MEIRO.proceduralPillarTexture(MEIRO.TEXTURE_SIZE,true,false,false);
		MEIRO.STYLE.PILLAR.bumpMap = MEIRO.proceduralPillarTexture(MEIRO.TEXTURE_SIZE/4,false,true,false);
		MEIRO.STYLE.PILLAR.specularMap = MEIRO.proceduralPillarTexture(MEIRO.TEXTURE_SIZE/8,false,false,true);
		
		MEIRO.STYLE.PILLAR4.map = MEIRO.proceduralPillar4Texture(MEIRO.TEXTURE_SIZE,true,false,false);
		MEIRO.STYLE.PILLAR4.bumpMap = MEIRO.proceduralPillar4Texture(MEIRO.TEXTURE_SIZE/4,false,true,false);
		MEIRO.STYLE.PILLAR4.specularMap = MEIRO.proceduralPillar4Texture(MEIRO.TEXTURE_SIZE/8,false,false,true);
		
		MEIRO.STYLE.STEP.map = MEIRO.proceduralStepTexture(MEIRO.TEXTURE_SIZE);
		
		MEIRO.STYLE.GLASS.alphaMap = MEIRO.proceduralGlassAlphaTexture(MEIRO.TEXTURE_SIZE/4);
		MEIRO.STYLE.GLASS.alphaMap.repeat.set(32,1);
		MEIRO.STYLE.GLASS.alphaMap.wrapT = THREE.MirroredRepeatWrapping;
	}
}

	
// image of all floors, with holes for downstairs
MEIRO.Dungeon.prototype.imageFloor = function()
{
	var allFloors = new THREE.Group();
	
	var geometry  = MEIRO.GEOMETRY.FLOOR,
		material  = MEIRO.STYLE.FLOOR,
		matrix = new THREE.Matrix4();
	
	// floor tiles of each level are in one instanced mesh
	// the roof reuses the floor of the lowerest level
	for( var lv = 0; lv<=this.levels.length; lv++ )
	{
		var level = this.levels[ lv % this.levels.length ],
			instances = level.floors.length,
			mesh = new THREE.InstancedMesh( geometry.clone(), material, instances ),
			y = lv * MEIRO.STAIRS.HEIGHT;

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
		
		this.setBoundingSphere( mesh, y );

		allFloors.add( mesh );
	}

	this.image.add( allFloors );
} // MEIRO.Dungeon.imageFloor


// image of walls, with holes for doors
MEIRO.Dungeon.prototype.imageWalls = function()
{
	// collect all walls into one geometry
	var allWalls = new THREE.Group();
	var allPillars2 = new THREE.Group();		// half pillars
	var allPillars4 = new THREE.Group();	// quarter pillars
	
	var geometry  = MEIRO.GEOMETRY.WALL,
		material  = MEIRO.STYLE.WALL,
		matrix = new THREE.Matrix4();

	// draw all wall segments; skip those which are too short
	for (var level of this.levels)
	{
		var instances = level.walls.length,
			mesh = new THREE.InstancedMesh( geometry.clone(), material, instances ),
			y = level.levelIndex * MEIRO.STAIRS.HEIGHT + MEIRO.STAIRS.HEIGHT/2;
			
		var pillars2 = [],
			pillars4 = [];
		
		for (var i in level.walls)
		{
			var wall = level.walls[i];
			var size = delta(wall.min,wall.max);
			var mid = middle(wall.min,wall.max);
		
			matrix.makeScale( wall.axis=='x'?size.x:MEIRO.WIDENESS, 1, wall.axis=='z'?size.z:MEIRO.WIDENESS );
			matrix.setPosition( mid.x, y, mid.z );
			mesh.setMatrixAt( i, matrix );
			
			// if the wall is long from edge to edge, it does not need pillars
			// the 4 outer-most walls of each level are such type of walls
			if (size.x>this.max.x-EPS || size.z>this.max.z-EPS)
				continue;

			function halfPillar(pos,angle)
			{
				pillars2.push( {pos, angle:Math.PI/2*(angle+(wall.axis=='x'?1:0))} );
			}
			
			function quarterPillar(pos,wallA,wallB)
			{
				// find orientation of quarter pillar
				//  o=pos *=mid
				//
				//	 o═══     ═══o    ║ *       * ║
				//	 ║ *       * ║    o═══     ═══o
				//    (A)     (B)      (C)     (D)
				var mid = middle(middle(wallA.min,wallA.max),middle(wallB.min,wallB.max));
				var angle = 0;
				if (mid.x>pos.x+EPS && mid.z>pos.z+EPS)
					angle = 2;//geom.rotateY(Math.PI); //C
				else if (mid.x<pos.x-EPS && mid.z>pos.z+EPS)
					angle = 1;//geom.rotateY(Math.PI/2); //D
				else if (mid.x>pos.x+EPS && mid.z<pos.z-EPS)
					angle = 3;//	geom.rotateY(-Math.PI/2); //B
				else {} // A - no need for rotation
				pillars4.push( {pos, angle:angle*Math.PI/2} );
			}

			// create the door pillar at the "max" end of the wall
			// only is the pillar is not *inside* another wall
			if (!level.findInsideWall(wall.max))
			{
				var otherWall = level.findCornerWall(wall.max,wall);
				if (otherWall)
				{
					if (wall.axis=='x') quarterPillar(wall.max,wall,otherWall);
				}
				else
					halfPillar(wall.max,-1);
			}
			
			// create the door pillar at the "min" end of the wall
			// only is the pillar is not *inside* another wall
			if (!level.findInsideWall(wall.min))
			{
				var otherWall = level.findCornerWall(wall.min,wall);
				if (otherWall)
				{
					if (wall.axis=='x') quarterPillar(wall.min,wall,otherWall);
				}
				else
					halfPillar(wall.min,1);
			}
		}
		
		mesh.geometry.boundingSphere = new THREE.Sphere(
			new THREE.Vector3(options.size.x/2,y,options.size.z/2),
			Math.sqrt(options.size.x*options.size.x+options.size.z*options.size.z)/2 );
		mesh.frustumCulled = true;
		allWalls.add( mesh );

		var instances2 = pillars2.length,
			geometry2 = MEIRO.GEOMETRY.PILLAR,
			material2 = MEIRO.STYLE.PILLAR,
			mesh2 = new THREE.InstancedMesh( geometry2.clone(), material2, instances2 );
		for( var i in pillars2 )
		{
			var pillar = pillars2[i];
			matrix.makeRotationY( pillar.angle );
			matrix.setPosition( pillar.pos.x, y, pillar.pos.z );
			mesh2.setMatrixAt( i, matrix );
		}
		mesh2.geometry.boundingSphere = mesh.geometry.boundingSphere;
		mesh2.frustumCulled = true;
		allPillars2.add( mesh2 );

		var instances4 = pillars4.length,
			geometry4 = MEIRO.GEOMETRY.PILLAR4,
			material4 = MEIRO.STYLE.PILLAR4,
			mesh4 = new THREE.InstancedMesh( geometry4.clone(), material4, instances4 );
		for( var i in pillars4 )
		{
			var pillar = pillars4[i];
			matrix.makeRotationY( pillar.angle );
			matrix.setPosition( pillar.pos.x, y, pillar.pos.z );
			mesh4.setMatrixAt( i, matrix );
		}
		mesh4.geometry.boundingSphere = mesh.geometry.boundingSphere;
		mesh4.frustumCulled = true;
		allPillars4.add( mesh4 );
	}
	
	this.image.add( allWalls, allPillars2, allPillars4 );
}



// image of stairs
MEIRO.Dungeon.prototype.imageStairs = function()
{
	var allSteps = new THREE.Group(),
		allPoles = new THREE.Group(),
		allGlasses = new THREE.Group();
	
	var matrix = new THREE.Matrix4();
	
	for (var lv in this.levels)
	{
		var level = this.levels[lv],
			y = lv * MEIRO.STAIRS.HEIGHT;
		// 1. create steps
		var instances = level.stairs.length * MEIRO.STAIRS.STEPS,
			geometry = MEIRO.GEOMETRY.STEP,
			material = MEIRO.STYLE.STEP,
			mesh = new THREE.InstancedMesh( geometry.clone(), material, instances ),
			idx = 0;
			
		for (var stairs of level.stairs)
		{
			matrix.makeRotationY( stairs.dir * Math.PI/2 );
			for( var j=0; j<MEIRO.STAIRS.STEPS; j++ )
			{
				var offset = 0.5-MEIRO.STAIRS.STEPDEPTH/2-j*MEIRO.STAIRS.STEP_DX;
				matrix.setPosition(
					/*x*/stairs.midUp.x-offset*stairs.vec.x,
					/*y*/y+MEIRO.THICKNESS/2-MEIRO.STAIRS.STEPHEIGHT/2-j*MEIRO.STAIRS.STEP_DY,
					/*z*/stairs.midUp.z-offset*stairs.vec.z );
				mesh.setMatrixAt( idx++, matrix );
			}
		}
		mesh.geometry.boundingSphere = new THREE.Sphere(
			new THREE.Vector3(options.size.x/2,y,options.size.z/2),
			Math.sqrt(options.size.x*options.size.x+options.size.z*options.size.z)/2
		);
		mesh.frustumCulled = true;
		allSteps.add( mesh );

		// 2. create poles
		var instances = level.stairs.length * 8,
			geometry = MEIRO.GEOMETRY.POLE,
			material = MEIRO.STYLE.POLE,
			mesh = new THREE.InstancedMesh( geometry.clone(), material, instances ),
			idx = 0;
			
		for (var stairs of level.stairs)
		{
			var vec = stairs.vec;
			var nor = {x:vec.z,z:-vec.x};
			// top entrance right
			matrix.makeTranslation(
					/*x*/stairs.midUp.x-0.35*vec.x-0.45*nor.x,
					/*y*/y+MEIRO.THICKNESS/2,
					/*z*/stairs.midUp.z-0.35*vec.z-0.45*nor.z );
			mesh.setMatrixAt( idx++, matrix );
			// top entrance left
			matrix.makeTranslation(
					/*x*/stairs.midUp.x-0.35*vec.x+0.45*nor.x,
					/*y*/y+MEIRO.THICKNESS/2,
					/*z*/stairs.midUp.z-0.35*vec.z+0.45*nor.z );
			mesh.setMatrixAt( idx++, matrix );
			// top back right
			matrix.makeTranslation(
					/*x*/stairs.midUp.x+1.45*vec.x-0.45*nor.x,
					/*y*/y+MEIRO.THICKNESS/2,
					/*z*/stairs.midUp.z+1.45*vec.z-0.45*nor.z );
			mesh.setMatrixAt( idx++, matrix );
			// top back left
			matrix.makeTranslation(
					/*x*/stairs.midUp.x+1.45*vec.x+0.45*nor.x,
					/*y*/y+MEIRO.THICKNESS/2,
					/*z*/stairs.midUp.z+1.45*vec.z+0.45*nor.z );
			mesh.setMatrixAt( idx++, matrix );

			// inner bottom right
			matrix.makeTranslation(
					/*x*/stairs.midUp.x+2.45*vec.x-0.425*nor.x,
					/*y*/y+MEIRO.THICKNESS/2-MEIRO.STAIRS.HEIGHT+MEIRO.STAIRS.STEPHEIGHT,
					/*z*/stairs.midUp.z+2.45*vec.z-0.425*nor.z );
			mesh.setMatrixAt( idx++, matrix );
			// inner bottom left
			matrix.makeTranslation(
					/*x*/stairs.midUp.x+2.45*vec.x+0.425*nor.x,
					/*y*/y+MEIRO.THICKNESS/2-MEIRO.STAIRS.HEIGHT+MEIRO.STAIRS.STEPHEIGHT,
					/*z*/stairs.midUp.z+2.45*vec.z+0.425*nor.z );
			mesh.setMatrixAt( idx++, matrix );

			// inner top right
			matrix.makeTranslation(
					/*x*/stairs.midUp.x-0.35*vec.x-0.425*nor.x,
					/*y*/y+MEIRO.THICKNESS/2,
					/*z*/stairs.midUp.z-0.35*vec.z-0.425*nor.z );
			mesh.setMatrixAt( idx++, matrix );
			// inner top left
			matrix.makeTranslation(
					/*x*/stairs.midUp.x-0.35*vec.x+0.425*nor.x,
					/*y*/y+MEIRO.THICKNESS/2,
					/*z*/stairs.midUp.z-0.35*vec.z+0.425*nor.z );
			mesh.setMatrixAt( idx++, matrix );
			var k = Math.floor( MEIRO.STAIRS.STEPS/3 )-1;
		}
		
		mesh.geometry.boundingSphere = new THREE.Sphere(
			new THREE.Vector3(options.size.x/2,y,options.size.z/2),
			Math.sqrt(options.size.x*options.size.x+options.size.z*options.size.z)/2
		);
		mesh.frustumCulled = true;
		allPoles.add( mesh );

		// 3. create glass panels
		var instances = level.stairs.length * 5,
			geometry = MEIRO.GEOMETRY.GLASS,
			material = MEIRO.STYLE.GLASS,
			mesh = new THREE.InstancedMesh( geometry.clone(), material, instances ),
			idx = 0;
			
		for (var stairs of level.stairs)
		{
			var vec = stairs.vec;
			var nor = {x:vec.z,z:-vec.x};
			
			// top back glass
			matrix.makeRotationY( stairs.dir * Math.PI/2 );
			matrix.setPosition(
					/*x*/stairs.midUp.x+1.45*vec.x,
					/*y*/y+MEIRO.THICKNESS/2+0.22,
					/*z*/stairs.midUp.z+1.45*vec.z );
			mesh.setMatrixAt( idx++, matrix );

			// top right glass
			matrix.makeScale(2,1,2);
			matrix.multiply(new THREE.Matrix4().makeRotationY( (stairs.dir+1) * Math.PI/2 ) );
			matrix.setPosition(
					/*x*/stairs.midUp.x+0.55*vec.x-0.45*nor.x,
					/*y*/y+MEIRO.THICKNESS/2+0.22,
					/*z*/stairs.midUp.z+0.55*vec.z-0.45*nor.z );
			mesh.setMatrixAt( idx++, matrix );

			// top left glass
			matrix.setPosition(
					/*x*/stairs.midUp.x+0.55*vec.x+0.45*nor.x,
					/*y*/y+MEIRO.THICKNESS/2+0.22,
					/*z*/stairs.midUp.z+0.55*vec.z+0.45*nor.z );
			mesh.setMatrixAt( idx++, matrix );

			var k = MEIRO.STAIRS.STEPS/2;
			// bottom right glass
			matrix.identity();
			matrix.makeRotationY( (stairs.dir+1) * Math.PI/2 );
			matrix.multiply( new THREE.Matrix4().set(
					(MEIRO.STAIRS.LENGTH-0.2)/0.9,  0,  0,  0,
					-2.175,  1,  0,  0,
					0,  0,  1,  0,
					0,  0,  0,  1  )
			  );
			matrix.setPosition(
					/*x*/stairs.mid.x+0.05*vec.x-0.425*nor.x,
					/*y*/y+MEIRO.THICKNESS/2-MEIRO.STAIRS.HEIGHT/2+0.245,
					/*z*/stairs.mid.z+0.05*vec.z-0.425*nor.z );
			mesh.setMatrixAt( idx++, matrix );
			matrix.setPosition(
					/*x*/stairs.mid.x+0.05*vec.x+0.425*nor.x,
					/*y*/y+MEIRO.THICKNESS/2-MEIRO.STAIRS.HEIGHT/2+0.245,
					/*z*/stairs.mid.z+0.05*vec.z+0.425*nor.z );
			mesh.setMatrixAt( idx++, matrix );
		}
		
		mesh.geometry.boundingSphere = new THREE.Sphere(
			new THREE.Vector3(options.size.x/2,y,options.size.z/2),
			Math.sqrt(options.size.x*options.size.x+options.size.z*options.size.z)/2
		);
		mesh.frustumCulled = true;
		allGlasses.add( mesh );
	}
	
	this.image.add( allSteps, allPoles, allGlasses );
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
	ctx.fillStyle = 'rgba(0,0,0,0.2)';
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
		
		ctx.fillStyle = 'black';
		ctx.font = Math.round(0.4*size/10)+'px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('0,0',0.55*size/10,0.7*size/10);
		ctx.fillText('9,0',9.45*size/10,0.7*size/10);
		ctx.fillText('0,9',0.55*size/10,9.7*size/10);
		ctx.fillText('9,9',9.45*size/10,9.7*size/10);
		
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


// Generates procedurally texture for the floor - main or bump
MEIRO.proceduralFloorTexture = function(size/*in pixels*/,main,bump)
{	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = size;
	canvas.height = size;
	
	if( main ) ctx.drawImage(MEIRO.NOISE_CANVAS,0,0);
	if( bump )
	{
		ctx.fillStyle = 'white';
		ctx.fillRect( 0, 0, size, size );
	}

	var n=10;

	for( var i=0; i<n+1; i+=1 )
	for( var j=0; j<n+1; j+=1 )
	{
		if( main ) ctx.fillStyle = 'rgba(100,50,0,'+(0.05*Math.random())+')';
		if( bump ) ctx.fillStyle = 'rgba(0,0,0,'+(0.01*Math.random())+')';
		ctx.fillRect( i/n*size, j/n*size, size/n, size/n );
	}
	
	if( main ) ctx.strokeStyle = 'white';
	if( bump ) ctx.strokeStyle = 'rgb(253,253,253)';
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


// Generates procedurally texture for the wall - main, bump or specular
MEIRO.proceduralWallTexture = function(size/*in pixels*/,main,bump,spec)
{	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = size;
	canvas.height = size;
	
	if( main )
		ctx.drawImage(MEIRO.NOISE_CANVAS,0,0);
	if( bump )
	{	
		ctx.fillStyle = 'rgb(240,240,240)';
		ctx.fillRect( 0, 0, size, size );
	}
	if( spec )
	{	
		ctx.fillStyle = 'rgb(0,0,0)';
		ctx.fillRect( 0, 0, size, size );
	}
	
	// number of square sections in the texture
	// each section will appear as individual tile
	var n=10;

	for( var i=0; i<n+1; i+=1 )
	for( var j=0; j<n+1; j+=1 )
	{
		if( main ) ctx.fillStyle = 'rgba(100,50,0,'+(0.05*Math.random())+')';
		if( bump ) ctx.fillStyle = 'rgba(0,0,0,'+(0.01*Math.random())+')';
		if( spec ) ctx.fillStyle = 'rgba(255,255,255,'+(0.5*Math.random())+')';
		ctx.fillRect( i/n*size, j/n*size, size/n, size/n );
	}
	
	if( main )
	{
		// draw a thin NxN grid
		ctx.strokeStyle = 'white';
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
	}
	
	// thick line
	if( main ) ctx.strokeStyle = 'dimgray';
	if( bump ) ctx.strokeStyle = 'rgba(255,255,255,1)';
	if( spec ) ctx.strokeStyle = 'white';
	ctx.lineWidth = 0.1*size;
	ctx.beginPath();
		ctx.moveTo(0,0.75*size);
		ctx.lineTo(size,0.75*size);
	ctx.stroke();
	
	// thin line
	ctx.lineWidth = 0.025*size;
	ctx.beginPath();
		ctx.moveTo(0,0.65*size);
		ctx.lineTo(size,0.65*size);
	ctx.stroke();
	
	// central line - divides mirrored part of texture
	// because seeing mirrored tiles is not so good
	if( main ) ctx.lineWidth = 0.005*size;
	if( bump ) ctx.lineWidth = 0.01*size;
	if( spec ) ctx.lineWidth = 0.01*size;
	ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(size,0);
	ctx.stroke();

	if( main )
	{
		// short vertical lines over the thick line
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
		
		// pseudo AO where the wall touches the ground
		ctx.globalCompositeOperation = 'multiply';
		var gradient = ctx.createLinearGradient( 0, 0.8*size, 0, 0.9*size );
			gradient.addColorStop(0.5, 'white');
			gradient.addColorStop(0.95, 'lightgray');
			gradient.addColorStop(1, 'gray');
		ctx.fillStyle = gradient;	
		ctx.fillRect( 0, 0.8*size, size, 0.1*size );
		ctx.globalCompositeOperation = 'copy';
	}
	
	return MEIRO.textureFromCanvas(canvas);
}


// Generates procedurally texture for the half door pillar - main, bump or specular
MEIRO.proceduralPillarTexture = function(size/*in pixels*/,main,bump,spec)
{	
	var sizex = size/4;
	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = sizex;
	canvas.height = size;
	
	if( main )
		ctx.drawImage(MEIRO.NOISE_CANVAS,0,0);
	if( bump )
	{
		ctx.fillStyle = 'rgb(240,240,240)';
		ctx.fillRect( 0, 0, sizex, size );
	}
	if( spec )
	{
		ctx.fillStyle = 'black';
		ctx.fillRect( 0, 0, sizex, size );
	}

	var n=10;

	for( var i=0; i<n/4+1; i+=1 )
	for( var j=0; j<n+1; j+=1 )
	{
		if( main ) ctx.fillStyle = 'rgba(100,50,0,'+(0.05*Math.random())+')';
		if( bump ) ctx.fillStyle = 'rgba(0,0,0,'+(0.01*Math.random())+')';
		if( spec ) ctx.fillStyle = 'rgba(255,255,255,'+(0.5*Math.random())+')';
		ctx.fillRect( i/n*size, j/n*size, size/n, size/n );
	}

	if( main )
	{
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
	}
	
	// thick line
	if( main ) ctx.strokeStyle = 'dimgray';
	if( bump ) ctx.strokeStyle = 'rgba(255,255,255,1)';
	if( spec ) ctx.strokeStyle = 'white';
	ctx.lineWidth = 0.1*size;
	ctx.beginPath();
		ctx.moveTo(0,0.75*size);
		ctx.lineTo(sizex,0.75*size);
	ctx.stroke();

	// thin line
	ctx.lineWidth = 0.025*size;
	ctx.beginPath();
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
	if( main ) ctx.lineWidth = 0.005*size;
	if( bump ) ctx.lineWidth = 0.01*size;
	if( spec ) ctx.lineWidth = 0.01*size;
	ctx.beginPath();
		ctx.moveTo(0,0*size);
		ctx.lineTo(0.4*sizex,0*size);
		ctx.moveTo(0.6*sizex,0*size);
		ctx.lineTo(1*sizex,0*size);
	ctx.stroke();

	if( main )
	{
		ctx.strokeStyle = 'rgba(0,0,0,0.3)';
		ctx.lineWidth = 1;
		ctx.beginPath();
		var m = 20;
		for( var i=0.5; i<m; i+=1 )
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
	}
	
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


// Generates procedurally texture for the quarter door pillar - main, bump or specular
MEIRO.proceduralPillar4Texture = function(size/*in pixels*/,main,bump,spec)
{	
	var sizex = size/8;
	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = sizex;
	canvas.height = size;
	
	if( main )
		ctx.drawImage(MEIRO.NOISE_CANVAS,0,0);
	if( bump )
	{
		ctx.fillStyle = 'rgb(240,240,240)';
		ctx.fillRect( 0, 0, sizex, size );
	}
	if( spec )
	{
		ctx.fillStyle = 'black';
		ctx.fillRect( 0, 0, sizex, size );
	}
	
	var n=10;
	for( var i=0; i<n/8+1; i+=1 )
	for( var j=0; j<n+1; j+=1 )
	{
		if( main ) ctx.fillStyle = 'rgba(100,50,0,'+(0.05*Math.random())+')';
		if( bump ) ctx.fillStyle = 'rgba(0,0,0,'+(0.01*Math.random())+')';
		if( spec ) ctx.fillStyle = 'rgba(255,255,255,'+(0.5*Math.random())+')';
		ctx.fillRect( i/n*size, j/n*size, size/n, size/n );
	}

	if( main )
	{
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
	}
	
	// thick line
	if( main ) ctx.strokeStyle = 'dimgray';
	if( bump ) ctx.strokeStyle = 'rgba(255,255,255,1)';
	if( spec ) ctx.strokeStyle = 'white';
	ctx.lineWidth = 0.1*size;
	ctx.beginPath();
		ctx.moveTo(0,0.75*size);
		ctx.lineTo(sizex,0.75*size);
	ctx.stroke();
	
	// thin line
	ctx.lineWidth = 0.025*size;
	ctx.beginPath();
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
	if( main ) ctx.lineWidth = 0.005*size;
	if( bump ) ctx.lineWidth = 0.01*size;
	if( spec ) ctx.lineWidth = 0.01*size;
	ctx.beginPath();
		ctx.moveTo(0,0*size);
		ctx.lineTo(0.4*sizex,0*size);
		ctx.moveTo(0.6*sizex,0*size);
		ctx.lineTo(1*sizex,0*size);
	ctx.stroke();

	if( main )
	{
		ctx.strokeStyle = 'rgba(0,0,0,0.3)';
		ctx.lineWidth = 1;
		ctx.beginPath();
		var m = 10;
		for( var i=0.5; i<=m; i+=1 )
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
	}
	
	var texture = MEIRO.textureFromCanvas(canvas);
	texture.repeat.set( 1, 2 );

	return texture;
}


// Generates procedurally texture for the floor - just noise
MEIRO.proceduralStepTexture = function(size/*in pixels*/)
{	
	var sizey = size/8;
	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = size;
	canvas.height = sizey;
	
	ctx.drawImage(MEIRO.NOISE_CANVAS,0,0);
	ctx.fillStyle = 'rgba(0,0,0,0.3)';
	ctx.fillRect( 0, 0, size, sizey );

	ctx.strokeStyle = 'rgba(1,1,0,0.3)';
	ctx.lineWidth = 1;
	ctx.beginPath();
	n=14;
		for( var i=0; i<n; i++ )
		{
			ctx.moveTo( size/20, sizey/8+i/n*sizey+0.5 );
			ctx.lineTo( 19*size/20, sizey/8+i/n*sizey+0.5 );
		}
	ctx.stroke();

	ctx.strokeStyle = 'rgba(0,0,0,0.7)';
	ctx.lineWidth = sizey/8;
	ctx.beginPath();
		ctx.moveTo( 0, sizey/16 );
		ctx.lineTo( size, sizey/16 );
		ctx.moveTo( 0, 16*sizey/16 );
		ctx.lineTo( size, 16*sizey/16 );
	ctx.stroke();

	return MEIRO.textureFromCanvas(canvas,false);
}

// Generates procedurally texture for the floor - just noise
MEIRO.proceduralGlassAlphaTexture = function(size/*in pixels*/)
{	
	var sizex = 32;
	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = sizex;
	canvas.height = size;
	
	ctx.fillStyle = 'black';
	ctx.fillRect( 0, 0, sizex, size );
	
	ctx.fillStyle = 'white';
	ctx.fillRect( 0, size-1, sizex, 1 );
	ctx.fillRect( 0, 0, sizex, 1 );

	ctx.fillStyle = 'rgba(255,255,255,0.1)';
	ctx.fillRect( 0, 0, sizex, size );

//	for( var x=0; x<sizex; x+=3 )
//	for( var y=0; y<size; y+=3 )
//		if( (x+y)%3 == 0 )
//			ctx.fillRect( x, y, 2, 2 );
	
	ctx.fillRect( sizex-1, 0, 1, size );

	return MEIRO.textureFromCanvas(canvas,false);
}
