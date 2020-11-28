
//	Основи на Компютърната Графика
//	Модел 24161 - Повърхност на Безие - контурни криви
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M24161 = function M24161(room)
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
			this.points[i][j].scale.set(cont?0.2:0.05,cont?0.2:0.05,cont?0.2:0.05);
			if (!cont) this.points[i][j].material = MEIRO.PRIMITIVE.STYLE.PAWN;
			this.speed[i].push( 0.001*(Math.random()+1) );
			this.offset[i].push( Math.random()*Math.PI*2 );
			this.amplitude[i].push( edge?0.7:1.4 );
		}
	}

	this.grid = new THREE.ParametricBufferGeometry(function(u,v){return new THREE.Vector3(10*u-5,0,10*v-5)},3,3);
	this.object = new THREE.Mesh( this.grid, MEIRO.PRIMITIVE.STYLE.WIREFRAME_GRID );
	
	this.m = 18; // точки по един контур
	this.line = new MEIRO.Polygon(4*this.m);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ДВИЖЕНИЕ', 'images/toggle.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.object,this.line);
	for (var i=0; i<4; i++)
		for (var j=0; j<4; j++)
			this.image.add(this.points[i][j]);
}

MEIRO.Models.M24161.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M24161.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M24161.POS = {DIST:20, ROT_X:-1, ROT_Y:0.6};
MEIRO.Models.M24161.ROT_Y = {MIN:-0.1, MAX:0.7};

MEIRO.Models.M24161.prototype.bezierCurve = function(t,p0,p1,p2,p3)
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
MEIRO.Models.M24161.prototype.onAnimate = function(time)
{
	var k = 0;
	for (var i=0; i<4; i++)
		for (var j=0; j<4; j++)
		{
			k++;
			this.object.geometry.attributes.position.array[k++]=this.k*this.amplitude[i][j]*Math.sin(this.offset[i][j]+this.speed[i][j]*time);
			k++;
			this.points[i][j].position.set(
				this.object.geometry.attributes.position.array[k-3],
				this.object.geometry.attributes.position.array[k-2],
				this.object.geometry.attributes.position.array[k-1]
			);
		}
	this.object.geometry.attributes.position.needsUpdate = true;

	
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
MEIRO.Models.M24161.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Повърхност на Безие - контурни криви</h1>';

	s += '<p>Повърхността на Безиер е ограничена от четири криви. Те съвпадат с криви на Безие, дефинирани спрямо съответните четворки периферни контурни точки.';
	
	element.innerHTML = s;
}





// превключвател на модела
MEIRO.Models.M24161.prototype.onToggle = function(element)
{
	var that = this;
	new TWEEN.Tween({k:that.k})
		.to({k:that.k>0.5?0:1},500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){that.k=this.k} )
		.start();
		
	reanimate();
}
