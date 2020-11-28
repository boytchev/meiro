//	MEIRO
//	Primitives - a collection of primitives - objects to be used in the models
//
//	http://stackoverflow.com/questions/31923047/creating-custom-object3d-class
//
//
//	MEIRO - Functions
//	 ├─ RandomColor()
//	 └─ RandomMilkyColor()
//
//	MEIRO - Classes
//	 ├─ Point()
//	 ├─ Cube(size)
//	 ├─ Cylinder(size,height)
//	 ├─ Line & DottedLine(from,to)
//	 │   ├─ setFromTo(from,to)
//	 │   ├─ setTo(to)
//	 │   ├─ setFrom(from)
//	 │   ├─ getFrom()
//	 │   └─ getTo()
//	 ├─ Polygon(n)
//	 │   ├─ getPoint(index)
//	 │   └─ setPoint(index,point)
//	 ├─ Pie(size,height)
//	 │   └─ setRange(alpha,beta)
//	 ├─ CirclePie(size)
//	 │   └─ setRange(alpha,beta)
//	 ├─ Text(string)
//	 ├─ Label(string,size,x,y,z)
//	 │   └─ rotateLabel()
//	 ├─ Axes2D(rangeX,rangeY,drawLabels,drawArrows,drawAxes)
//	 │   └─ rotateLabels()
//	 ├─ Axes3D(rangeX,rangeY,rangeZ,drawLabels)
//	 │   ├─ setColor(color)
//	 │   ├─ setLabels(labelX,labelY,labelZ)
//	 │   └─ rotateLabels()
//	 ├─ AxesPolar(radius)
//	 │   └─ rotateLabels()
//	 ├─ AxesSpherical(radius)
//	 │   └─ rotateLabels()
//	 ├─ PaperPlane(color)
//	 ├─ Pawn(color)
//	 │   └─ split(k)	k=[0..1]
//	 ├─ Turtle(size)
//	 │   ├─ fd(length)
//	 │   ├─ bk(length)
//	 │   ├─ sl(length)
//	 │   ├─ sr(length)
//	 │   ├─ su(length)
//	 │   ├─ sd(length)
//	 │   ├─ lt(angle)
//	 │   ├─ rt(angle)
//	 │   ├─ lr(angle)
//	 │   ├─ rr(angle)
//	 │   ├─ upp(angle)
//	 │   ├─ dn(angle)
//	 │   ├─ getPosition()
//	 │   └─ setPosition(pos)
//	 ├─ Screen(width,height,skipPillars)
//	 ├─ Vector(direction,length,color,width)
//	 │   ├─ setDirection(direction)
//	 │   └─ setLength(length)
//	 ├─ Graph(vertices,edges)
//	 ├─ Basis()
//	 │   ├─ reset()
//	 │   ├─ clone()
//	 │   ├─ copy()
//	 │   ├─ translateX(dX)
//	 │   ├─ translateY(dY)
//	 │   ├─ translateZ(dZ)
//	 │   ├─ translate(dX,dY,dZ)
//	 │   ├─ rotateX(angle)
//	 │   ├─ rotateY(angle)
//	 │   ├─ rotateZ(angle)
//	 │   ├─ random(rangeX,rangeY,rangeZ)
//	 │   ├─ lerp(otherBasis,k)
//	 │   ├─ lerpBases(firstBasis,otherBasis,k)
//	 │   ├─ setFromObject(object)
//	 │   ├─ apply(object)
//	 │   ├─ applyScaled(object,scale)
//	 │   └─ position(x,y,z)
//	 └─ Bezier3D = function(n,precision)
//	     ├─ setControlPoint(i,j,x,y,z)
//	     └─ recalculate()
//
// 2017.05 - P. Boytchev

MEIRO.initPrimitives = function()
{
	if (options.textures)
	{
		MEIRO.TEXTURE = {
			CUBE: MEIRO.proceduralCubeTexture(MEIRO.TEXTURE_SIZE),
		};
	}
	
	MEIRO.ARROW_LENGTH = 0.35;
	MEIRO.PRIMITIVE = { };
	MEIRO.PRIMITIVE.FONT = new THREE.Font(MEIRO.FONT_JSON);
	
	MEIRO.PRIMITIVE.LABEL = {
		font:	MEIRO.PRIMITIVE.FONT,
		size:	0.4,
		height:	0.04,
		curveSegments: options.lowpoly?1:6,
		bevelEnabled: false};

	MEIRO.PRIMITIVE.GEOMETRY = {
		CUBE: new THREE.BoxGeometry(1,1,1),
		CYLINDER: new THREE.CylinderGeometry(1,1,1,options.lowpoly?6:32,1,false),
		TUBE: new THREE.CylinderGeometry(1,1,1,options.lowpoly?6:20,1,true),
		PIE: function(){return new THREE.CylinderGeometry(1,1,1,options.lowpoly?6:32,1,false,0,2*Math.PI-EPS)}, //function!!!
		//ISOSPHERE: new THREE.IcosahedronGeometry(1,3),
		SPHERE: new THREE.SphereGeometry(1,options.lowpoly?6:32,options.lowpoly?6:32),
		SPHERE_HALF: new THREE.SphereGeometry(1,options.lowpoly?6:32,options.lowpoly?4:16,0,2*Math.PI,0,Math.PI/2),
		ARROW: new THREE.ConeGeometry(0.085,MEIRO.ARROW_LENGTH,options.lowpoly?6:12),
		X: (function() {
				var geom = new THREE.TextGeometry( 'X', MEIRO.PRIMITIVE.LABEL);
				geom.translate(-0.15,0,0);
				return geom;
			})(),
		Y: (function() {
				var geom = new THREE.TextGeometry( 'Y', MEIRO.PRIMITIVE.LABEL);
				geom.translate(-0.15,0,0);
				return geom;
			})(),
		Z: (function() {
				var geom = new THREE.TextGeometry( 'Z', MEIRO.PRIMITIVE.LABEL);
				geom.translate(-0.15,0,0);
				return geom;
			})(),
		O: (function() {
				var geom = new THREE.TextGeometry( 'O', MEIRO.PRIMITIVE.LABEL);
				geom.translate(0.15,0,0);
				return geom;
			})(),
		R: new THREE.TextGeometry( 'R', MEIRO.PRIMITIVE.LABEL),
		ALPHA: new THREE.TextGeometry( 'α', MEIRO.PRIMITIVE.LABEL),
		BETA: new THREE.TextGeometry( 'β', MEIRO.PRIMITIVE.LABEL),
		CIRCLE: (function(){
			var geometry = new THREE.Geometry();
			for (var a=0; a<360-EPS; )
			{
				var alpha = THREE.Math.degToRad(a);
				geometry.vertices.push( new THREE.Vector3(Math.cos(alpha),Math.sin(alpha),0) );
				a += 5;
				var alpha = THREE.Math.degToRad(a);
				geometry.vertices.push( new THREE.Vector3(Math.cos(alpha),Math.sin(alpha),0) );
			}
			return geometry;
		})(),
		CIRCLE_HALF: (function(){
			var geometry = new THREE.Geometry();
			for (var a=0; a<180-EPS; )
			{
				var alpha = THREE.Math.degToRad(a);
				geometry.vertices.push( new THREE.Vector3(Math.cos(alpha),Math.sin(alpha),0) );
				a += 5;
				var alpha = THREE.Math.degToRad(a);
				geometry.vertices.push( new THREE.Vector3(Math.cos(alpha),Math.sin(alpha),0) );
			}
			return geometry;
		})(),
		CIRCLE_PIE: function(){
			var geometry = new THREE.Geometry();
			for (var a=0; a<360; a += 10)
			{
				var alpha = THREE.Math.degToRad(a);
				geometry.vertices.push( new THREE.Vector3(Math.cos(alpha),Math.sin(alpha),0) );
			}
			geometry.vertices.push( new THREE.Vector3(0,0,0) );
			return geometry;
		}, //function!!
		RADIALS: (function(){
			var geometry = new THREE.Geometry();
			for (var a=0; a<180-EPS; a += 15)
			{
				var alpha = THREE.Math.degToRad(a);
				geometry.vertices.push( new THREE.Vector3(Math.cos(alpha),Math.sin(alpha),0) );
				geometry.vertices.push( new THREE.Vector3(-Math.cos(alpha),-Math.sin(alpha),0) );
			}
			return geometry;
		})(),
		RADIALS_HALF: (function(){
			var geometry = new THREE.Geometry();
			for (var a=0; a<180-EPS; a += 15)
			{
				var alpha = THREE.Math.degToRad(a);
				geometry.vertices.push( new THREE.Vector3(Math.cos(alpha),Math.sin(alpha),0) );
				geometry.vertices.push( new THREE.Vector3(0,0,0) );
			}
			return geometry;
		})(),
		PAPER_PLANE: (function(){
			var w=0.5, h=0.4, v=0.9*h, g=0.1;
			var geometry = new THREE.Geometry();
			geometry.vertices.push(
				new THREE.Vector3(1,0,0),	//0
				new THREE.Vector3(0,v,-w),	//1       1_--2   4--_5
				new THREE.Vector3(0,h,-g),	//2            \ /
				new THREE.Vector3(0,0,0),	//3             3
				new THREE.Vector3(0,h,g),	//4
				new THREE.Vector3(0,v,w)	//5
			);
			geometry.faces.push(
				new THREE.Face3(0,1,2),
				new THREE.Face3(0,2,3),
				new THREE.Face3(0,3,4),
				new THREE.Face3(0,4,5)
			);
			geometry.computeFaceNormals();
			return geometry;
		})(),
	};

	MEIRO.PRIMITIVE.STYLE = {
		POINT: new THREE.MeshPhongMaterial({color: 'red', shininess: 100}),
		CUBE: new THREE.MeshPhongMaterial({color:'white'}),
		CYLINDER: new THREE.MeshLambertMaterial({color:'white'}),
		PIE: new THREE.MeshLambertMaterial({color:'white'}),
		SOLID_LINE: new THREE.LineBasicMaterial( {
						color: 'red',
					}),
		DOTTED_LINE: new THREE.LineDashedMaterial( {
						color: 'red',
						transparent: true,
						opacity: 0.6,
						linewidth: 1,
						scale: 5,
						dashSize: 0.4,
						gapSize: 0.6,
					}),
		SPHERE: new THREE.MeshLambertMaterial({color:'white'}),
		TEXT: new THREE.MeshLambertMaterial({color:'gold'}),
		AXIS: new THREE.MeshBasicMaterial({color:'black'}),
		GRID: new THREE.LineBasicMaterial({color:'black',transparent:true,opacity:0.4,depthWrite:false}),
		WIREFRAME_GRID: new THREE.MeshNormalMaterial({transparent:true,opacity:0.1,depthWrite:false,wireframe:true}),
		PAWN: new THREE.MeshPhongMaterial({color:'black',shininess:200}),
		SOLID_PLATE: new THREE.MeshNormalMaterial(),
		PLATE: new THREE.MeshNormalMaterial({
					transparent:true,
					opacity:0.1,
					depthTest: false,
					side: THREE.DoubleSide,
				}),
		CONTOUR: new THREE.MeshBasicMaterial({
					color: 'red',
					transparent: true,
					opacity: 0.5,
				}),
		LABEL: new THREE.MeshPhongMaterial({color:'darkred'}),
		BEZIER3D: new THREE.MeshPhongMaterial( {color:'cornflowerblue', side:THREE.DoubleSide, shininess:200} ),
	};

	if (options.textures)
	{
		MEIRO.PRIMITIVE.STYLE.CUBE.transparent = true;
		MEIRO.PRIMITIVE.STYLE.CUBE.map = MEIRO.TEXTURE.CUBE;
	}
}


MEIRO.RandomColor = function()
{
	return new THREE.Color(Math.random(),Math.random(),Math.random());
}

MEIRO.RandomMilkyColor = function()
{
	return new THREE.Color(0.6+0.4*Math.random(),0.6+0.4*Math.random(),0.6+0.4*Math.random());
}



// ===========================================================================
// Cube class.
// ===========================================================================
MEIRO.Cube = function(size)
{
	this.type = 'meiro.cube';
	
	this.geometry = MEIRO.PRIMITIVE.GEOMETRY.CUBE;
	this.material = MEIRO.PRIMITIVE.STYLE.CUBE;
	
	THREE.Mesh.call(this, this.geometry, this.material);
	this.scale.set(size,size,size);
}
MEIRO.Cube.prototype = Object.create(THREE.Mesh.prototype);


// ===========================================================================
// Cylinder class.
// ===========================================================================
MEIRO.Cylinder = function(size,height)
{
	this.type = 'meiro.cylinder';
	
	this.geometry = MEIRO.PRIMITIVE.GEOMETRY.CYLINDER;
	this.material = MEIRO.PRIMITIVE.STYLE.CYLINDER;
	
	THREE.Mesh.call(this, this.geometry, this.material);
	this.scale.set(size,height,size);
}
MEIRO.Cylinder.prototype = Object.create(THREE.Mesh.prototype);


// ===========================================================================
// Pie class.
// ===========================================================================
MEIRO.Pie = function(size,height)
{
	this.type = 'meiro.pie';
	
	this.geometry = MEIRO.PRIMITIVE.GEOMETRY.PIE(); //function!!
	this.material = MEIRO.PRIMITIVE.STYLE.PIE;
	
	var v = this.geometry.vertices;
	var log = [];
	for (var i=0; i<v.length/2-1; i++)
	{
		log.push({
			x:v[i].x.toFixed(3), a:(Math.asin(v[i].x)*180/Math.PI).toFixed(3),
			y:v[i].y,
			z:v[i].z.toFixed(3), b:(Math.acos(v[i].z)*180/Math.PI).toFixed(3),
			r:Math.sqrt(v[i].x*v[i].x+v[i].z*v[i].z).toFixed(3),
		});
	}
	
	THREE.Mesh.call(this, this.geometry, this.material);
	this.scale.set(size,height,size);
}
MEIRO.Pie.prototype = Object.create(THREE.Mesh.prototype);


MEIRO.Pie.prototype.setRange = function(alpha, beta)
{
	var v = this.geometry.vertices;
	var n = v.length/2-1;
	for (var i=0; i<n; i++)
	{
		var angle = alpha + (beta-alpha)*i/(n-1);
		v[i+n].x = v[i].x = Math.cos(angle);
		v[i+n].z = v[i].z = Math.sin(angle);
	}
	this.geometry.verticesNeedUpdate = true;
}


// ===========================================================================
// CirclePie class.
// ===========================================================================
MEIRO.CirclePie = function(size)
{
	this.type = 'meiro.circlepie';
	
	this.geometry = MEIRO.PRIMITIVE.GEOMETRY.CIRCLE_PIE();//function!!
	this.material = MEIRO.PRIMITIVE.STYLE.GRID;

	THREE.Line.call(this, this.geometry, this.material);
	this.scale.set(size,size,size);
}
MEIRO.CirclePie.prototype = Object.create(THREE.Line.prototype);


MEIRO.CirclePie.prototype.setRange = function(alpha, beta)
{
	var v = this.geometry.vertices;
	var n = v.length-1;
	for (var i=0; i<n; i++)
	{
		var angle = alpha + (beta-alpha)*i/(n-1);
		v[i].x = Math.cos(angle);
		v[i].y = Math.sin(angle);
	}
	this.geometry.verticesNeedUpdate = true;
}


// ===========================================================================
// DottedLine class.
// ===========================================================================
MEIRO.DottedLine = function(from,to)
{
	this.type = 'meiro.dottedline';
	
	if (!from) from = new THREE.Vector3(0,0,0);
	if (!to) to = from;
	
	this.geometry = new THREE.Geometry();
	this.geometry.vertices.push(from,to);
	this.geometry.computeLineDistances();
	
	this.material = MEIRO.PRIMITIVE.STYLE.DOTTED_LINE;
	THREE.Line.call(this, this.geometry, this.material);
}
MEIRO.DottedLine.prototype = Object.create(THREE.Line.prototype);


MEIRO.DottedLine.prototype.setFromTo = function(from,to)
{
	this.geometry.vertices[0] = from;
	this.geometry.vertices[1] = to;
	this.geometry.verticesNeedUpdate = true;
	this.geometry.lineDistancesNeedUpdate = true;
	this.geometry.computeLineDistances();
}

MEIRO.DottedLine.prototype.getFrom = function()
{
	return this.geometry.vertices[0].clone();
}

MEIRO.DottedLine.prototype.getTo = function()
{
	return this.geometry.vertices[1].clone();
}


MEIRO.DottedLine.prototype.setFromToXZ = function(from)
{
	this.geometry.vertices[0] = from;
	this.geometry.vertices[1].x = from.x;
	this.geometry.vertices[1].y = 0;
	this.geometry.vertices[1].z = from.z;
	this.geometry.verticesNeedUpdate = true;
	this.geometry.lineDistancesNeedUpdate = true;
	this.geometry.computeLineDistances();
}


MEIRO.DottedLine.prototype.setFrom = function(from)
{
	this.geometry.vertices[0] = from;
	this.geometry.verticesNeedUpdate = true;
	this.geometry.lineDistancesNeedUpdate = true;
	this.geometry.computeLineDistances();
}


MEIRO.DottedLine.prototype.setTo = function(to)
{
	this.geometry.vertices[1] = to;
	this.geometry.verticesNeedUpdate = true;
	this.geometry.lineDistancesNeedUpdate = true;
	this.geometry.computeLineDistances();
}

MEIRO.Line = function(from,to)
{
	this.type = 'meiro.line';
	
	MEIRO.DottedLine.call(this, from, to);
	this.material = MEIRO.PRIMITIVE.STYLE.SOLID_LINE;
}
MEIRO.Line.prototype = Object.create(MEIRO.DottedLine.prototype);


// ===========================================================================
// Polygon class.
// ===========================================================================
MEIRO.Polygon = function(n)
{
	this.type = 'meiro.polygon';
	
	this.n = n;
	
	this.geometry = new THREE.Geometry();
	for (var i=0; i<this.n; i++)
		this.geometry.vertices.push(new THREE.Vector3());
	
	this.material = MEIRO.PRIMITIVE.STYLE.SOLID_LINE;
	THREE.Line.call(this, this.geometry, this.material);
}
MEIRO.Polygon.prototype = Object.create(THREE.Line.prototype);


MEIRO.Polygon.prototype.setPoint = function(index,point)
{
	this.geometry.vertices[index] = point;
	this.geometry.verticesNeedUpdate = true;
}

MEIRO.Polygon.prototype.getPoint = function(index)
{
	return this.geometry.vertices[index];
}



// ===========================================================================
// Sphere class.
// ===========================================================================
MEIRO.Sphere = function(size)
{
	this.type = 'meiro.sphere';
	
	this.geometry = MEIRO.PRIMITIVE.GEOMETRY.SPHERE;
	this.material = MEIRO.PRIMITIVE.STYLE.SPHERE;
	
	THREE.Mesh.call(this, this.geometry, this.material);
	this.scale.set(size,size,size);
}
MEIRO.Sphere.prototype = Object.create(THREE.Mesh.prototype);


// ===========================================================================
// Point class.
// ===========================================================================
MEIRO.Point = function()
{
	this.type = 'meiro.point';
	
	this.geometry = MEIRO.PRIMITIVE.GEOMETRY.SPHERE;
	this.material = MEIRO.PRIMITIVE.STYLE.POINT;
	
	THREE.Mesh.call(this, this.geometry, this.material);
	this.scale.set(0.2,0.2,0.2);
}
MEIRO.Point.prototype = Object.create(THREE.Mesh.prototype);


// ===========================================================================
// 3D Text class.
// ===========================================================================
MEIRO.Text = function(string)
{
	this.type = 'meiro.text';
	
	this.geometry = new THREE.TextGeometry( string, {
		font: MEIRO.PRIMITIVE.FONT,
		size: 1,
		height: 0.3, //depth
		curveSegments: options.lowpoly?1:10,
		bevelEnabled: false
	});

	this.material = MEIRO.PRIMITIVE.STYLE.TEXT;
	
	THREE.Mesh.call(this, this.geometry, this.material);
}
MEIRO.Text.prototype = Object.create(THREE.Mesh.prototype);


// ===========================================================================
// Label class.
// ===========================================================================
MEIRO.Label = function(string,size,x,y,z)
{
	this.type = 'meiro.label';
	
	this.geometry = new THREE.TextGeometry( string, {
		font: MEIRO.PRIMITIVE.FONT,
		size: size,
		height: 0.01, //depth
		curveSegments: options.lowpoly?1:8,
		bevelEnabled: false
	});
	this.geometry.translate(x||0,y||0,z||0);

	this.material = MEIRO.PRIMITIVE.STYLE.LABEL;
	
	THREE.Mesh.call(this, this.geometry, this.material);
}
MEIRO.Label.prototype = Object.create(THREE.Mesh.prototype);


MEIRO.Label.prototype.rotateLabel = function()
{
	var angle = controls.viewAngle();
	this.rotation.y = angle;
}


// ===========================================================================
// 2D Axes class.
// ===========================================================================
MEIRO.Axes2D = function(rangeX,rangeY,drawLabels,drawArrows,drawAxes)
{
	var EXT = 0.3;	// extent of axes beyond the grid
	var W = 0.04;	// width of axes
	
	if (typeof drawLabels === 'undefined') drawLabels=true;
	if (typeof drawArrows === 'undefined') drawArrows=true;
	if (typeof drawAxes === 'undefined') drawAxes=true;

	this.type = 'meiro.axes2d';

	THREE.Object3D.call(this);
	
	// Step 1. the grid
	var geometry = new THREE.Geometry();
	{
		for (var x=rangeX[0]; x<=rangeX[1]+EPS; x++) if (x || !drawAxes)
		{
			geometry.vertices.push( new THREE.Vector3(x,rangeY[0]-EXT/2,0) );
			geometry.vertices.push( new THREE.Vector3(x,rangeY[1]+EXT/2,0) );
		}
		for (var y=rangeY[0]; y<=rangeY[1]+EPS; y++) if (y || !drawAxes)
		{
			geometry.vertices.push( new THREE.Vector3(rangeX[0]-EXT/2,y,0) );
			geometry.vertices.push( new THREE.Vector3(rangeX[1]+EXT/2,y,0) );
		}
	}
	this.add( new THREE.LineSegments(geometry, MEIRO.PRIMITIVE.STYLE.GRID) );

	
	// Step 2. the axes
	var axes = new THREE.Geometry();
	if (drawAxes)
	{
		{
			var axis = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.CUBE, MEIRO.PRIMITIVE.STYLE.AXIS);
			// axis X
			axis.scale.set(rangeX[1]-rangeX[0]+2*EXT,W,W);
			axis.position.set(rangeX[1]/2+rangeX[0]/2,0,0);
			axes.mergeMesh(axis);
			// axis Y
			axis.scale.set(W,rangeY[1]-rangeY[0]+2*EXT,W);
			axis.position.set(0,rangeY[1]/2+rangeY[0]/2,0);
			axes.mergeMesh(axis);
		}
	}
	if (drawArrows)
	{
		var arrow = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.ARROW, MEIRO.PRIMITIVE.STYLE.AXIS);

		// arrow X-
		arrow.position.set(rangeX[0]-EXT,0,0);
		arrow.rotation.set(0,0,Math.PI/2);
		axes.mergeMesh(arrow);
		// arrow X+
		arrow.position.set(rangeX[1]+EXT,0,0);
		arrow.rotation.set(0,0,-Math.PI/2);
		axes.mergeMesh(arrow);
		// arrow Y-
		arrow.position.set(0,rangeY[0]-EXT,0);
		arrow.rotation.set(0,0,Math.PI);
		axes.mergeMesh(arrow);
		// arrow Y+
		arrow.position.set(0,rangeY[1]+EXT,0);
		arrow.rotation.set(0,0,0);
		axes.mergeMesh(arrow);
	}
	this.add( new THREE.Mesh(axes, MEIRO.PRIMITIVE.STYLE.AXIS) );
	
	// Step 3. The labels
	if (drawLabels)
	{
		// label O
		this.labelO = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.O, MEIRO.PRIMITIVE.STYLE.AXIS);
		this.labelO.position.set(0.1,0.1,-0.02);
		this.add(this.labelO);
		// label X
		this.labelX = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.X, MEIRO.PRIMITIVE.STYLE.AXIS);
		this.labelX.position.set(rangeX[1]+0.5,-0.18,-0.02);
		this.add(this.labelX);
		// label Y
		this.labelY = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.Y, MEIRO.PRIMITIVE.STYLE.AXIS);
		this.labelY.position.set(-0.15,rangeY[1]+0.6,-0.02);
		this.add(this.labelY);
	}
}
MEIRO.Axes2D.prototype = Object.create(THREE.Object3D.prototype);


MEIRO.Axes2D.prototype.rotateLabels = function()
{
	var angle = controls.viewAngle();
	if (this.rotationDir<0) angle = Math.PI-angle;
	this.labelO.rotation.y = angle;
	this.labelX.rotation.y = angle;
	this.labelY.rotation.y = angle;
}



// ===========================================================================
// 3D Axes class.
// ===========================================================================
MEIRO.Axes3D = function(rangeX,rangeY,rangeZ)
{
	var EXT = 0.3;	// extent of axes beyond the grid
	var W = 0.04;	// width of axes

	this.type = 'meiro.axes3d';
	this.rotationDir = 1;
	
	THREE.Object3D.call(this);
	
	// Step 1. the grid
	var geometry = new THREE.Geometry();
	{
		for (var x=rangeX[0]; x<=rangeX[1]+EPS; x++) if (x)
		{
			geometry.vertices.push( new THREE.Vector3(x,0,rangeZ[0]-EXT/2) );
			geometry.vertices.push( new THREE.Vector3(x,0,rangeZ[1]+EXT/2) );
		}
		for (var z=rangeZ[0]; z<=rangeZ[1]+EPS; z++) if (z)
		{
			geometry.vertices.push( new THREE.Vector3(rangeX[0]-EXT/2,0,z) );
			geometry.vertices.push( new THREE.Vector3(rangeX[1]+EXT/2,0,z) );
		}
	}
	this.grid = new THREE.LineSegments(geometry, MEIRO.PRIMITIVE.STYLE.GRID); 
	this.add( this.grid );

	
	// Step 2. the axes
	var axes = new THREE.Geometry();
	{
		var axis = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.CUBE, MEIRO.PRIMITIVE.STYLE.AXIS);
		var arrow = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.ARROW, MEIRO.PRIMITIVE.STYLE.AXIS);
		
		// axis X
		axis.scale.set(rangeX[1]-rangeX[0]+2*EXT,W,W);
		axis.position.set(rangeX[1]/2+rangeX[0]/2,0,0);
		axes.mergeMesh(axis);
		// axis Y
		if (rangeY[0]>EPS)
		{
			axis.scale.set(W,rangeY[1]-rangeY[0]+2*EXT,W);
			axis.position.set(0,rangeY[1]/2+rangeY[0]/2,0);
		}
		else
		{
			axis.scale.set(W,rangeY[1]-rangeY[0]+EXT,W);
			axis.position.set(0,rangeY[1]/2+rangeY[0]/2+EXT/2,0);
		}
		axes.mergeMesh(axis);
		// axis Z
		axis.scale.set(W,W,rangeZ[1]-rangeZ[0]+2*EXT);
		axis.position.set(0,0,rangeZ[1]/2+rangeZ[0]/2);
		axes.mergeMesh(axis);

		// arrow X-
		arrow.position.set(rangeX[0]-EXT,0,0);
		arrow.rotation.set(0,0,Math.PI/2);
		axes.mergeMesh(arrow);
		// arrow X+
		arrow.position.set(rangeX[1]+EXT,0,0);
		arrow.rotation.set(0,0,-Math.PI/2);
		axes.mergeMesh(arrow);
		// arrow Y-
		if (rangeY[0]>EPS)
		{
			arrow.position.set(0,rangeY[0]-EXT,0);
			arrow.rotation.set(0,0,Math.PI);
			axes.mergeMesh(arrow);
		}
		// arrow Y+
		arrow.position.set(0,rangeY[1]+EXT,0);
		arrow.rotation.set(0,0,0);
		axes.mergeMesh(arrow);
		// arrow Z-
		arrow.position.set(0,0,rangeZ[0]-EXT);
		arrow.rotation.set(-Math.PI/2,0,0);
		axes.mergeMesh(arrow);
		// arrow Z+
		arrow.position.set(0,0,rangeZ[1]+EXT);
		arrow.rotation.set(Math.PI/2,0,0);
		axes.mergeMesh(arrow);
	}
	this.axes = new THREE.Mesh(axes, MEIRO.PRIMITIVE.STYLE.AXIS);
	this.add( this.axes );
	
	// Step 3. The labels
	// label O
	this.labelO = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.O, MEIRO.PRIMITIVE.STYLE.AXIS);
	this.labelO.position.set(0.1,0.1,-0.02);
	this.add(this.labelO);
	// label X
	this.labelX = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.X, MEIRO.PRIMITIVE.STYLE.AXIS);
	this.labelX.position.set(rangeX[1]+EXT,0.2,0);
	this.add(this.labelX);
	// label Y
	this.labelY = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.Y, MEIRO.PRIMITIVE.STYLE.AXIS);
	this.labelY.position.set(0,rangeY[1]+EXT+0.2,0);
	this.add(this.labelY);
	// label Z
	this.labelZ = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.Z, MEIRO.PRIMITIVE.STYLE.AXIS);
	this.labelZ.rotation.y = Math.PI/2;
	this.labelZ.position.set(0,0.2,rangeZ[1]+EXT);
	this.add(this.labelZ);
}
MEIRO.Axes3D.prototype = Object.create(THREE.Object3D.prototype);


MEIRO.Axes3D.prototype.rotateLabels = function()
{
	var angle = controls.viewAngle();
	if (this.rotationDir<0) angle = Math.PI-angle;
	this.labelO.rotation.y = angle;
	this.labelX.rotation.y = angle;
	this.labelY.rotation.y = angle;
	this.labelZ.rotation.y = angle;
}


MEIRO.Axes3D.prototype.setColor = function(color)
{
	this.grid.material = new THREE.LineBasicMaterial({color:color,transparent:true,opacity:0.4,depthWrite:false});
	this.axes.material = new THREE.MeshBasicMaterial({color:color});
	this.labelX.material = this.axes.material;
	this.labelY.material = this.axes.material;
	this.labelZ.material = this.axes.material;
}


MEIRO.Axes3D.prototype.setLabels = function(labelX,labelY,labelZ)
{
	this.labelX.geometry = new THREE.TextGeometry( labelX, MEIRO.PRIMITIVE.LABEL);
	this.labelX.geometry.translate(-0.15,0,0);
	this.labelY.geometry = new THREE.TextGeometry( labelY, MEIRO.PRIMITIVE.LABEL);
	this.labelY.geometry.translate(-0.15,0,0);
	this.labelZ.geometry = new THREE.TextGeometry( labelZ, MEIRO.PRIMITIVE.LABEL);
	this.labelZ.geometry.translate(-0.15,0,0);
}


// ===========================================================================
// Polar Axes class.
// ===========================================================================
MEIRO.AxesPolar = function(radius)
{
	var EXT = 0.3;	// extent of axes beyond the grid
	var W = 0.04;	// width of axes
	
	this.type = 'meiro.axespolar';

	THREE.Object3D.call(this);
	
	// Step 1. the grid
	var geometry = new THREE.Geometry();
	{
		// radials
		var mesh = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.RADIALS,MEIRO.PRIMITIVE.STYLE.GRID);
		mesh.scale.set(radius+EXT/2,radius+EXT/2,1);
		geometry.mergeMesh(mesh);
		// concentrics
		for (var r=1; r<=radius+EPS; r++)
		{
			var mesh = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.CIRCLE,MEIRO.PRIMITIVE.STYLE.GRID);
			mesh.scale.set(r,r,r);
			geometry.mergeMesh(mesh);
		}
	}
	this.add( new THREE.LineSegments(geometry, MEIRO.PRIMITIVE.STYLE.GRID) );

	
	// Step 2. the axes
	var axes = new THREE.Geometry();
	{
		var axis = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.CUBE, MEIRO.PRIMITIVE.STYLE.AXIS);
		var arrow = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.ARROW, MEIRO.PRIMITIVE.STYLE.AXIS);
		
		// axis R
		axis.scale.set(radius+EXT,W,W);
		axis.position.set(radius/2+EXT/2,0,0);
		axes.mergeMesh(axis);
		// axis Alpha
		var axis = new THREE.Mesh(new THREE.TorusGeometry(radius,W/1.75,6,20,1), MEIRO.PRIMITIVE.STYLE.AXIS);
		axes.mergeMesh(axis);
		
		// arrow R
		arrow.position.set(radius+EXT,0,0);
		arrow.rotation.set(0,0,-Math.PI/2);
		axes.mergeMesh(arrow);
		// arrow Alpha
		arrow.position.set(radius*Math.cos(1),radius*Math.sin(1),0);
		arrow.rotation.set(0,0,1);
		axes.mergeMesh(arrow);
	}
	this.add( new THREE.Mesh(axes, MEIRO.PRIMITIVE.STYLE.AXIS) );
	
	
	// Step 3. The labels
	// label O
	this.labelO = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.O, MEIRO.PRIMITIVE.STYLE.AXIS);
	this.labelO.position.set(0.1,0.1,-0.02);
	this.add(this.labelO);
	// label R
	this.labelR = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.R, MEIRO.PRIMITIVE.STYLE.AXIS);
	this.labelR.position.set(radius+0.5,0.18,-0.02);
	this.add(this.labelR);
	// label Alpha
	this.labelA = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.ALPHA, MEIRO.PRIMITIVE.STYLE.AXIS);
	this.labelA.position.set(radius*Math.cos(1),radius*Math.sin(1)+0.2,-0.02);
	this.add(this.labelA);
}
MEIRO.AxesPolar.prototype = Object.create(THREE.Object3D.prototype);

MEIRO.AxesPolar.prototype.rotateLabels = function()
{
	var angle = controls.viewAngle();
	this.labelO.rotation.y = angle;
	this.labelR.rotation.y = angle;
	this.labelA.rotation.y = angle;
}


// ===========================================================================
// Spherical Axes class.
// ===========================================================================
MEIRO.AxesSpherical = function(radius)
{
	var EXT = 0.3;	// extent of axes beyond the grid
	var W = 0.04;	// width of axes
	
	this.type = 'meiro.axesspherical';

	THREE.Object3D.call(this);
	
	// Step 1. the grid
	var geometry = new THREE.Geometry();
	{
		// radials
		var mesh = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.RADIALS_HALF,MEIRO.PRIMITIVE.STYLE.GRID);
		mesh.scale.set(radius+EXT/2,radius+EXT/2,1);
		geometry.mergeMesh(mesh);
		var mesh = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.RADIALS,MEIRO.PRIMITIVE.STYLE.GRID);
		mesh.scale.set(radius+EXT/2,radius+EXT/2,1);
		mesh.rotation.x = Math.PI/2;
		geometry.mergeMesh(mesh);
		// concentrics
		for (var r=1; r<=radius+EPS; r++)
		{
			var mesh = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.CIRCLE_HALF,MEIRO.PRIMITIVE.STYLE.GRID);
			mesh.scale.set(r,r,r);
			geometry.mergeMesh(mesh);
			var mesh = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.CIRCLE,MEIRO.PRIMITIVE.STYLE.GRID);
			mesh.scale.set(r,r,r);
			mesh.rotation.x = Math.PI/2;
			geometry.mergeMesh(mesh);
		}
	}
	this.add( new THREE.LineSegments(geometry, MEIRO.PRIMITIVE.STYLE.GRID) );

	
	// Step 2. the axes
	var axes = new THREE.Geometry();
	{
		var axis = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.CUBE, MEIRO.PRIMITIVE.STYLE.AXIS);
		var arrow = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.ARROW, MEIRO.PRIMITIVE.STYLE.AXIS);
		
		// axis R
		axis.scale.set(radius+EXT,W,W);
		axis.position.set(radius/2+EXT/2,0,0);
		axes.mergeMesh(axis);
		// axis R2
		axis.scale.set(W,radius+EXT,W);
		axis.position.set(0,radius/2+EXT/2,0);
		axes.mergeMesh(axis);
		// axis Beta
		var axis = new THREE.Mesh(new THREE.TorusGeometry(radius,W/1.75,6,20,1), MEIRO.PRIMITIVE.STYLE.AXIS);
		axes.mergeMesh(axis);
		// axis Alpha
		axis.rotation.x = -Math.PI/2;
		axes.mergeMesh(axis);
		
		// arrow R2
		arrow.position.set(0,radius+EXT,0);
		axes.mergeMesh(arrow);
		// arrow R
		arrow.position.set(radius+EXT,0,0);
		arrow.rotation.set(0,0,-Math.PI/2);
		axes.mergeMesh(arrow);
		// arrow Alpha
		arrow.position.set(radius*Math.cos(1),0,-radius*Math.sin(1));
		arrow.rotation.set(-Math.PI/2,0,1);
		axes.mergeMesh(arrow);
		// arrow Beta
		arrow.position.set(radius*Math.cos(1),radius*Math.sin(1),0);
		arrow.rotation.set(0,0,1);
		axes.mergeMesh(arrow);
	}
	this.add( new THREE.Mesh(axes, MEIRO.PRIMITIVE.STYLE.AXIS) );
	
	
	// Step 3. The labels
	// label O
	this.labelO = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.O, MEIRO.PRIMITIVE.STYLE.AXIS);
	this.labelO.position.set(0.1,0.1,-0.02);
	this.add(this.labelO);
	// label R
	this.labelR = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.R, MEIRO.PRIMITIVE.STYLE.AXIS);
	this.labelR.position.set(radius+0.5,0.2,-0.02);
	this.add(this.labelR);
	// label Alpha
	this.labelA = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.ALPHA, MEIRO.PRIMITIVE.STYLE.AXIS);
	this.labelA.position.set(radius*Math.cos(1),0.2,-radius*Math.sin(1));
	this.add(this.labelA);
	// label Beta
	this.labelB = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.BETA, MEIRO.PRIMITIVE.STYLE.AXIS);
	this.labelB.position.set(radius*Math.cos(1),radius*Math.sin(1)+0.3,-0.02);
	this.add(this.labelB);
}
MEIRO.AxesSpherical.prototype = Object.create(THREE.Object3D.prototype);

MEIRO.AxesSpherical.prototype.rotateLabels = function()
{
	var angle = controls.viewAngle();
	this.labelO.rotation.y = angle;
	this.labelR.rotation.y = angle;
	this.labelA.rotation.y = angle;
	this.labelB.rotation.y = angle;
}



// ===========================================================================
// Paper plane class
// ===========================================================================
MEIRO.PaperPlane = function(color)
{
	this.type = 'meiro.paperplane';
	
	this.geometry = MEIRO.PRIMITIVE.GEOMETRY.PAPER_PLANE;
	this.material = new THREE.MeshLambertMaterial({color:color,side:THREE.DoubleSide});

	THREE.Mesh.call(this, this.geometry, this.material);

	var frame = new THREE.Mesh(this.geometry,new THREE.MeshBasicMaterial({color:'black',wireframe:true}));
	this.add(frame);
}
MEIRO.PaperPlane.prototype = Object.create(THREE.Mesh.prototype);



// ===========================================================================
// Pawn class
// ===========================================================================
MEIRO.Pawn = function(color)
{
	this.type = 'meiro.pawn';
	
	THREE.Object3D.call(this);

	var h = options.lowpoly?8:30; // horizontal segments
	var v = options.lowpoly?8:15; // vertical segments
	
	var material = new THREE.MeshPhongMaterial({color:color, shininess:100});
	
	this.head = new THREE.Mesh( new THREE.SphereGeometry(0.5,h,v), material );
	this.head.position.set(0,3,0);

	this.body = new THREE.Mesh( new THREE.ConeGeometry(0.8,3,options.lowpoly?h:2*h,1,true), material );
	this.body.position.set(0,1.6,0);

	this.neck = new THREE.Mesh( new THREE.SphereGeometry(1,h,v/2), material );
	this.neck.position.set(0,2.43,0);
	this.neck.scale.set(0.5,0.12,0.5);

	this.waist = new THREE.Mesh( new THREE.SphereGeometry(1,h,v/2), material );
	this.waist.position.set(0,0.55,0);
	this.waist.scale.set(0.86,0.3,0.86);

	this.bottom = new THREE.Mesh( new THREE.SphereGeometry(1,h,v,0,Math.PI*2,0,Math.PI/2), material );
	this.bottom.scale.set(1.1,0.7,1.1);
	
	var material = new THREE.MeshPhongMaterial({color:color, shininess:100, side:THREE.DoubleSide});
	this.feet = new THREE.Mesh( new THREE.CircleGeometry(1.1,h), material );
	this.feet.rotation.x = Math.PI/2;

	this.add(this.head,this.neck,this.waist,this.bottom,this.body,this.feet);
}
MEIRO.Pawn.prototype = Object.create(THREE.Object3D.prototype);


MEIRO.Pawn.prototype.split = function(k)
{
	//k = THREE.Math.smootherstep(k,0,1);
	var hDist = 4*k;
	
	this.head.position.x = hDist; 
	this.neck.position.z = hDist; 
	this.waist.position.x = -hDist; 
	this.bottom.position.z = -hDist; 
	
	this.head.position.y = (3-0.4)*(1-k)+0.4; 
	this.neck.position.y = (2.43-0.2)*(1-k)+0.2; 
	this.waist.position.y = (0.55-0.2)*(1-k)+0.2; 
	this.feet.position.y = (-1.75)*(k); 
}




// ===========================================================================
// Turtle class
// ===========================================================================
MEIRO.Turtle = function(size)
{
	this.type = 'meiro.turtle';
	
	THREE.Object3D.call(this);

	// ориентация
	this.basis = new MEIRO.Basis();
	
	if (size>0)
	{
		// костенурка
		var material = new THREE.MeshNormalMaterial({shading:THREE.FlatShading});
		var geometry = new THREE.IcosahedronGeometry(size,1);
		for (var i=0; i<geometry.vertices.length; i++)
		{
			var v = geometry.vertices[i];
			v.x *= 1.1;
			if (v.y<0) v.y *= 0.3;
		}
		this.add(new THREE.Mesh(geometry,material));

		// глава
		geometry = new THREE.IcosahedronGeometry(size,0);
		var head = new THREE.Mesh(geometry,material);
		head.position.set(1.1*size,0.2*size,0);
		head.scale.set(0.6,0.2,0.4);
		head.rotation.set(0,0,0.3);
		this.add(head);

		// опашка
		var tail = new THREE.Mesh(geometry,material);
		tail.position.set(-0.9*size,-0.1*size,0);
		tail.scale.set(0.3,0.1,0.2);
		this.add(tail);

		// крака
		var legs = new THREE.Mesh(geometry,material);
		legs.position.set(0,-0.1*size,0);
		legs.rotation.set(0,Math.PI/3,0);
		legs.scale.set(1.5,0.2,0.2);
		this.add(legs);
		legs = legs.clone();
		legs.rotation.set(0,-Math.PI/3,0);
		this.add(legs);
	}
		
	this.matrixAutoUpdate = false;
}
MEIRO.Turtle.prototype = Object.create(THREE.Object3D.prototype);


MEIRO.Turtle.prototype.fd = function(length)
{
	this.basis.translateX(length);
	this.basis.apply(this);
}


MEIRO.Turtle.prototype.bk = function(length)
{
	this.basis.translateX(-length);
	this.basis.apply(this);
}


MEIRO.Turtle.prototype.su = function(length)
{
	this.basis.translateY(length);
	this.basis.apply(this);
}


MEIRO.Turtle.prototype.sd = function(length)
{
	this.basis.translateY(-length);
	this.basis.apply(this);
}


MEIRO.Turtle.prototype.sr = function(length)
{
	this.basis.translateZ(length);
	this.basis.apply(this);
}

MEIRO.Turtle.prototype.sl = function(length)
{
	this.basis.translateZ(-length);
	this.basis.apply(this);
}


MEIRO.Turtle.prototype.lt = function(angle)
{
	this.basis.rotateY(THREE.Math.degToRad(angle));
	this.basis.apply(this);
}


MEIRO.Turtle.prototype.rt = function(angle)
{
	this.basis.rotateY(THREE.Math.degToRad(-angle));
	this.basis.apply(this);
}


MEIRO.Turtle.prototype.lr = function(angle)
{
	this.basis.rotateX(THREE.Math.degToRad(angle));
	this.basis.apply(this);
}


MEIRO.Turtle.prototype.rr = function(angle)
{
	this.basis.rotateX(THREE.Math.degToRad(-angle));
	this.basis.apply(this);
}


MEIRO.Turtle.prototype.upp = function(angle)
{
	this.basis.rotateZ(THREE.Math.degToRad(-angle));
	this.basis.apply(this);
}


MEIRO.Turtle.prototype.dn = function(angle)
{
	this.basis.rotateZ(THREE.Math.degToRad(angle));
	this.basis.apply(this);
}


MEIRO.Turtle.prototype.getPosition = function()
{
	return this.basis.o.clone();
}


MEIRO.Turtle.prototype.setPosition = function(pos)
{
	return this.basis.o.copy(pos);
}



// ===========================================================================
// Graph class
// ===========================================================================
MEIRO.Graph = function(scale,vertices,edges)
{
	this.type = 'meiro.graph';
	
	THREE.Object3D.call(this);

	// върхове
	var material = new THREE.MeshPhongMaterial({color:'orange',shininess:200});
	this.vertex = [];
	var n = Math.floor(vertices.length/3);
	for (var i=0; i<n; i++)
	{
		this.vertex.push( new MEIRO.Sphere(0.2) );
		this.vertex[i].material = material;
		this.vertex[i].position.set(vertices[3*i],vertices[3*i+1],vertices[3*i+2]);
		this.vertex[i].position.multiplyScalar(scale);
		this.add(this.vertex[i]);
	}
	
	// ребра
	var material = new THREE.MeshPhongMaterial({color:'cornflowerblue',shininess:200});
	var geometry = MEIRO.PRIMITIVE.GEOMETRY.CYLINDER.clone().rotateX(Math.PI/2);
	this.edge = [];
	for (var i=0,j=0; i<edges.length; i+=2,j++)
	{
		var p1 = this.vertex[ edges[i]   ].position;
		var p2 = this.vertex[ edges[i+1] ].position;
		
		this.edge.push( new THREE.Mesh(geometry,material));
		this.edge[j].scale.set(0.08,0.08,p1.distanceTo(p2));

		this.edge[j].position.lerpVectors(p1,p2,0.5);
		this.edge[j].lookAtPos = p2;
		this.edge[j].lookAt(p2);
		this.add(this.edge[j]);
	}
}
MEIRO.Graph.prototype = Object.create(THREE.Object3D.prototype);



// ===========================================================================
// Screen class
// ===========================================================================
MEIRO.Screen = function(width,height,skipPillars)
{
	var th = 0.2; // thickness
	
	this.type = 'meiro.screen';
	
	THREE.Object3D.call(this);

	if (!skipPillars)
	{
		this.corner1 = new MEIRO.Sphere(th); this.corner1.position.set(+width/2,+height/2,0);
		this.corner2 = new MEIRO.Sphere(th); this.corner2.position.set(+width/2,-height/2,0);
		this.corner3 = new MEIRO.Sphere(th); this.corner3.position.set(-width/2,+height/2,0);
		this.corner4 = new MEIRO.Sphere(th); this.corner4.position.set(-width/2,-height/2,0);
		
		this.edge1 = new MEIRO.Cylinder(th,height); this.edge1.position.set(+width/2,0,0);
		this.edge2 = new MEIRO.Cylinder(th,height); this.edge2.position.set(-width/2,0,0);
		
		this.add(this.corner1,this.corner2,this.corner3,this.corner4,this.edge1,this.edge2);
	}
	
	this.plate = new MEIRO.Cube(1);
	this.plate.scale.set(width,height,th/2);
	this.plate.material = MEIRO.PRIMITIVE.STYLE.PLATE;
	
	this.add(this.plate);
}
MEIRO.Screen.prototype = Object.create(THREE.Object3D.prototype);




// ===========================================================================
// Vector class
// ===========================================================================

MEIRO.Vector = function(direction,length,color,width)
{
	if (!width) width=1;
	this.width = width;
	var W = 0.06*width;	// width of axes
	var A = 0.10; // arrow length
	
	this.type = 'meiro.vector';
	this.direction = direction.clone().normalize();
	
	THREE.Object3D.call(this);
	
	var material = MEIRO.PRIMITIVE.STYLE.AXIS.clone();
	if (color)
		material.color = new THREE.Color(color);
	
	this.axis = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.CUBE, material);
	this.arrow = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.ARROW, material);

	// axis
	this.axis.scale.set(W,W,length-width*MEIRO.ARROW_LENGTH);
	this.axis.position.set(0,0,(length-width*MEIRO.ARROW_LENGTH)/2);
	
	// arrow
	this.arrow.position.set(0,0,length-width*MEIRO.ARROW_LENGTH/2);
	this.arrow.rotation.set(Math.PI/2,0,0);
	this.arrow.scale.set(width,width,width);

	this.add(this.axis,this.arrow);
	this.lookAt(direction);
}
MEIRO.Vector.prototype = Object.create(THREE.Object3D.prototype);

MEIRO.Vector.prototype.setDirection = function(direction)
{
	this.direction = new THREE.Vector3().copy(direction).normalize().add(this.position);
	this.lookAt(this.direction);
}

MEIRO.Vector.prototype.setLength = function(length)
{
	this.axis.scale.z = length-this.width*MEIRO.ARROW_LENGTH;
	this.axis.position.z = (length-this.width*MEIRO.ARROW_LENGTH)/2;
	
	this.arrow.position.z = length-this.width*MEIRO.ARROW_LENGTH/2;
}



// ===========================================================================
// Basis class (non-graphical)
// ===========================================================================

MEIRO.Basis = function()
{
	this.reset();
}

MEIRO.Basis.prototype.reset = function()
{
	// axes lengths are 1
	this.x = new THREE.Vector3(1,0,0);
	this.y = new THREE.Vector3(0,1,0);
	this.z = new THREE.Vector3(0,0,1);
	
	this.o = new THREE.Vector3(0,0,0);
}

MEIRO.Basis.prototype.clone = function()
{
	var n = new MEIRO.Basis();
	n.x.copy(this.x);
	n.y.copy(this.y);
	n.z.copy(this.z);
	n.o.copy(this.o);
	return n;
}

MEIRO.Basis.prototype.copy = function(n)
{
	this.x.copy(n.x);
	this.y.copy(n.y);
	this.z.copy(n.z);
	this.o.copy(n.o);
}

MEIRO.Basis.prototype.translateX = function(dX)
{
	// move along local X
	this.o.addScaledVector(this.x,dX);
}

MEIRO.Basis.prototype.translateY = function(dY)
{
	// move along local Y
	this.o.addScaledVector(this.y,dY);
}

MEIRO.Basis.prototype.translateZ = function(dZ)
{
	// move along local Z
	this.o.addScaledVector(this.z,dZ);
}

MEIRO.Basis.prototype.translate = function(dX,dY,dZ)
{
	// move along local axes
	this.o.addScaledVector(this.x,dX);
	this.o.addScaledVector(this.y,dY);
	this.o.addScaledVector(this.z,dZ);
}

MEIRO.Basis.prototype.rotateX = function(angle)
{
	// rotate around local X
	this.y.applyAxisAngle(this.x,angle);
	this.z.applyAxisAngle(this.x,angle);
}

MEIRO.Basis.prototype.rotateY = function(angle)
{
	// rotate around local Y
	this.x.applyAxisAngle(this.y,angle);
	this.z.applyAxisAngle(this.y,angle);
}

MEIRO.Basis.prototype.rotateZ = function(angle)
{
	// rotate around local Z
	this.x.applyAxisAngle(this.z,angle);
	this.y.applyAxisAngle(this.z,angle);
}

MEIRO.Basis.prototype.random = function(rangeX,rangeY,rangeZ)
{
	this.o.x = THREE.Math.randInt(rangeX[0],rangeX[1]);
	this.o.y = THREE.Math.randInt(rangeY[0],rangeY[1]);
	this.o.z = THREE.Math.randInt(rangeZ[0],rangeZ[1]);
	
	// randomize x axis
	this.x.set(THREE.Math.randFloat(-1,1),THREE.Math.randFloat(0,1),THREE.Math.randFloat(-1,1));
	this.x.normalize();
	
	// randomize y axis, but make it perpendicular to x and pointing to y+
	this.y.set(THREE.Math.randFloat(-1,1),THREE.Math.randFloat(-1,1),THREE.Math.randFloat(-1,1));
	this.y.cross(this.x);	
	if (this.y.y<0) this.y.multiplyScalar(-1);
	this.y.normalize();
	
	//calculate z axis as perpendicular to both x and y
	this.z.copy(this.x);
	this.z.cross(this.y);
	this.z.normalize();
}

// lerp this basis towards another basis
MEIRO.Basis.prototype.lerp = function(otherBasis,k)
{
	this.o.lerp(otherBasis.o,k);
	this.x.lerp(otherBasis.x,k);
	this.y.lerp(otherBasis.y,k);
	this.z.lerp(otherBasis.z,k);
	
	// make axes orthogonal keeping y unchanged
	this.y.normalize();
	
	// X = YxZ
	this.x.copy(this.y);
	this.x.cross(this.z);
	this.x.normalize();
	
	// Z = XxY
	this.z.copy(this.x);
	this.z.cross(this.y);
	this.z.normalize();
}

// lerp two bases 
MEIRO.Basis.prototype.lerpBases = function(firstBasis,otherBasis,k)
{
	this.o.lerpVectors(firstBasis,otherBasis.o,k);
	this.x.lerpVectors(firstBasis,otherBasis.x,k);
	this.y.lerpVectors(firstBasis,otherBasis.y,k);
	this.z.lerpVectors(firstBasis,otherBasis.z,k);
	
	// make axes orthogonal keeping y unchanged
	this.y.normalize();
	
	// X = YxZ
	this.x.copy(this.y);
	this.x.cross(this.z);
	this.x.normalize();
	
	// Z = XxY
	this.z.copy(this.x);
	this.z.cross(this.y);
	this.z.normalize();
}


// set basis from object's matrix
MEIRO.Basis.prototype.setFromObject = function(object)
{
	object.matrix.extractBasis(this.x,this.y,this.z);
	this.o.setFromMatrixPosition(object.matrix);
}

// apply to object's matrix
MEIRO.Basis.prototype.apply = function(object)
{
	object.matrix.makeBasis(this.x,this.y,this.z);
	object.matrix.setPosition(this.o);
	object.updateMatrixWorld();
}

// apply to object's matrix
MEIRO.Basis.prototype.applyScaled = function(object,scale)
{
	var x = this.x.clone().multiplyScalar(scale);
	var y = this.y.clone().multiplyScalar(scale);
	var z = this.z.clone().multiplyScalar(scale);
	object.matrix.makeBasis(x,y,z);
	object.matrix.setPosition(this.o);
	object.updateMatrixWorld();
}


// calculate position
MEIRO.Basis.prototype.position = function(x,y,z)
{
	var p = this.o.clone();
	p.addScaledVector(this.x,x);
	p.addScaledVector(this.y,y);
	p.addScaledVector(this.z,z);
	return p;
}


// ===========================================================================
// Bezier3D class
// ===========================================================================
MEIRO.Bezier3D = function(n,precision)
{
	this.type = 'meiro.bezier3d';
	
	this.n = n;
	
	var points = [];
	for (var i=0; i<n; i++)
	{
		points.push( [] );
		for (var j=0; j<n; j++)
			points[i].push( new THREE.Vector4(i-(this.n-1)/2,0,j-(this.n-1)/2,1) );
	}

	var knots = [];
	for (var i=0; i<2*n; i++)
		knots.push( (i<n)?0:1 );
	
	var that = this;
	this.surface = new THREE.NURBSSurface(n-1,n-1,knots,knots,points);
	function getSurfacePoint(u,v)
	{
		return that.surface.getPoint(u,v);
	}

	if (!precision)
		precision = options.lowpoly?10:30;
		
	this.geometry = new THREE.ParametricBufferGeometry( getSurfacePoint, precision, precision );
	this.material = MEIRO.PRIMITIVE.STYLE.BEZIER3D;

	THREE.Mesh.call(this, this.geometry, this.material);
}
MEIRO.Bezier3D.prototype = Object.create(THREE.Mesh.prototype);


MEIRO.Bezier3D.prototype.setControlPoint = function(i,j,x,y,z)
{
	var p = this.surface.controlPoints;
	p[i][j].x = x;
	p[i][j].y = y;
	p[i][j].z = z;
}


MEIRO.Bezier3D.prototype.recalculate = function()
{
	var EPS = 0.00001;
	var normal = new THREE.Vector3();
	var p0 = new THREE.Vector3(), p1 = new THREE.Vector3();
	var pu = new THREE.Vector3(), pv = new THREE.Vector3();
	var geom = this.geometry;
	var pos = geom.attributes.position.array;
	var nor = geom.attributes.normal.array;
	var param = geom.parameters;
	var i, j, k=0,m=0;

	for (i=0; i<=param.stacks; i++)
	{
		var v = i/param.stacks;
		for (j=0; j<=param.slices; j++)
		{
			var u = j/param.slices;
			p0 = param.func(u,v);
			pos[k++] = p0.x;
			pos[k++] = p0.y;
			pos[k++] = p0.z;

			if (u-EPS>=0)
			{
				p1 = param.func(u-EPS,v);
				pu.subVectors(p0,p1);
			}
			else
			{
				p1 = param.func(u+EPS,v);
				pu.subVectors(p1,p0);
			}

			if (v-EPS>=0)
			{
				p1 = param.func(u,v-EPS);
				pv.subVectors(p0,p1);
			}
			else
			{
				p1 = param.func(u,v+EPS);
				pv.subVectors(p1,p0);
			}

			normal.crossVectors(pu,pv).normalize();
			nor[m++] = normal.x;
			nor[m++] = normal.y;
			nor[m++] = normal.z;
		}
	}	
	geom.attributes.position.needsUpdate = true;
	geom.attributes.normal.needsUpdate = true;
}
