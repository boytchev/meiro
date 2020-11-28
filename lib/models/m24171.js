
//	Основи на Компютърната Графика
//	Модел 24171 - Повърхност на Безие - повърхностна мрежа
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M24171 = function M24171(room)
{
	MEIRO.Model.apply(this, arguments);

	// контролни точки
	this.points = [];
	this.speed = [];
	this.offset = [];
	this.amplitude = [];
	this.k = 0;
	for (var i=0; i<4; i++)
	{
		this.points.push( [] );
		this.speed.push( [] );
		this.offset.push( [] );
		this.amplitude.push( [] );
		for (var j=0; j<4; j++)
		{
			var edge = ((i==0 && j==0) || (i==3 && j==0) || (i==0 && j==3) || (i==3 && j==3) );
			var cont = (i==0 || j==0 || i==3 || j==3);
			this.points[i].push( new MEIRO.Point() );
			this.points[i][j].scale.set(0.1,0.1,0.1);
			if (!cont) this.points[i][j].material = MEIRO.PRIMITIVE.STYLE.PAWN;
			this.speed[i].push( 0.001*(Math.random()+1) );
			this.offset[i].push( Math.random()*Math.PI*2 );
			this.amplitude[i].push( edge?0.7:2.4 );
		}
	}

	this.grid = new THREE.ParametricBufferGeometry(function(u,v){return new THREE.Vector3(10*u-5,0,10*v-5)},3,3);
	this.object = new THREE.Mesh( this.grid, MEIRO.PRIMITIVE.STYLE.WIREFRAME_GRID );
	
	this.m = 16; // точки по един контур
	this.bezierGrid = new THREE.ParametricBufferGeometry(function(u,v){return new THREE.Vector3(0,0,0)},this.m-1,this.m-1);
	this.bezierObject = new THREE.Mesh( this.bezierGrid, MEIRO.PRIMITIVE.STYLE.WIREFRAME_GRID );
	
	this.line = new MEIRO.Polygon(4*this.m);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ДВИЖЕНИЕ', 'images/toggle.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.object,this.bezierObject,this.line);
	for (var i=0; i<4; i++)
		for (var j=0; j<4; j++)
			this.image.add(this.points[i][j]);
}

MEIRO.Models.M24171.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M24171.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M24171.POS = {DIST:20, ROT_X:-1, ROT_Y:0.6};
MEIRO.Models.M24171.ROT_Y = {MIN:-0.1, MAX:0.7};

MEIRO.Models.M24171.prototype.bezierSum = function(u,v)
{
	var B = [];
	B[0] = function(t){return 1*Math.pow(1-t,3)*Math.pow(t,0);}
	B[1] = function(t){return 3*Math.pow(1-t,2)*Math.pow(t,1);}
	B[2] = function(t){return 3*Math.pow(1-t,1)*Math.pow(t,2);}
	B[3] = function(t){return 1*Math.pow(1-t,0)*Math.pow(t,3);}

	var p = new THREE.Vector3();
	for (var i=0; i<4; i++)
	for (var j=0; j<4; j++)
		p.addScaledVector(
			this.points[i][j].position,
			B[i](u)*B[j](v));
	return p;
}

MEIRO.Models.M24171.prototype.bezierCurve = function(t,p0,p1,p2,p3)
{
	var B0 = 1*Math.pow(1-t,3)*Math.pow(t,0);
	var B1 = 3*Math.pow(1-t,2)*Math.pow(t,1);
	var B2 = 3*Math.pow(1-t,1)*Math.pow(t,2);
	var B3 = 1*Math.pow(1-t,0)*Math.pow(t,3);

	var p = new THREE.Vector3();
	p.addScaledVector(p0.position,B0);
	p.addScaledVector(p1.position,B1);
	p.addScaledVector(p2.position,B2);
	p.addScaledVector(p3.position,B3);
	return p;
}

// аниматор на модела
MEIRO.Models.M24171.prototype.onAnimate = function(time)
{
	var k = 0;
	var pos = this.object.geometry.attributes.position.array;
	for (var i=0; i<4; i++)
		for (var j=0; j<4; j++)
		{
			k++;
			pos[k++]=this.k*this.amplitude[i][j]*Math.sin(this.offset[i][j]+this.speed[i][j]*time);
			k++;
			this.points[i][j].position.set(pos[k-3],pos[k-2],pos[k-1]);
		}
	this.object.geometry.attributes.position.needsUpdate = true;

	
	var k = 0;
	var pos = this.bezierObject.geometry.attributes.position.array;
	for (var i=0; i<this.m; i++)
		for (var j=0; j<this.m; j++)
		{
			var p = this.bezierSum(i/(this.m-1),j/(this.m-1));
			pos[k++] = p.x;
			pos[k++] = p.y;
			pos[k++] = p.z;
		}
	this.bezierObject.geometry.attributes.position.needsUpdate = true;

	
	for (var i=0; i<this.m; i++)
	{
		var p = this.bezierCurve(
			i/(this.m-1),
			this.points[0][0],
			this.points[0][1],
			this.points[0][2],
			this.points[0][3],
		);
		this.line.getPoint(i).copy(p);
	}
	for (var i=0; i<this.m; i++)
	{
		var p = this.bezierCurve(
			i/(this.m-1),
			this.points[0][3],
			this.points[1][3],
			this.points[2][3],
			this.points[3][3],
		);
		this.line.getPoint(this.m+i).copy(p);
	}
	for (var i=0; i<this.m; i++)
	{
		var p = this.bezierCurve(
			i/(this.m-1),
			this.points[3][3],
			this.points[3][2],
			this.points[3][1],
			this.points[3][0],
		);
		this.line.getPoint(2*this.m+i).copy(p);
	}
	for (var i=0; i<this.m; i++)
	{
		var p = this.bezierCurve(
			i/(this.m-1),
			this.points[3][0],
			this.points[2][0],
			this.points[1][0],
			this.points[0][0],
		);
		this.line.getPoint(3*this.m+i).copy(p);
	}
	this.line.geometry.verticesNeedUpdate = true;


	if (this.k>0) reanimate();
	
	TWEEN.update();
}



// информатор на модела
MEIRO.Models.M24171.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Повърхност на Безие - повърхностна мрежа</h1>';

	s += '<p>На базата на контролните точки се изчислява точка от повърхността на Безие като сума от всички точки с коефициент според полиномите на Бернщайн. Понеже контролните точки са в матрица, всяка от тях се умножава по два полинома &ndash; единият е според положението по u-направлението, а другият според v-направлението.';
	
	element.innerHTML = s;
}





// превключвател на модела
MEIRO.Models.M24171.prototype.onToggle = function(element)
{
	var that = this;
	new TWEEN.Tween({k:that.k})
		.to({k:that.k>0.5?0:1},500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){that.k=this.k} )
		.start();
		
	reanimate();
}
