
//	Основи на Компютърната Графика
//	Модел 26461 - Кожа от повърхнини на Безие
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M26461 = function M26461(room)
{
	MEIRO.Model.apply(this, arguments);

	this.points = [];
	for (var i=0; i<15; i++)
	{
		this.points.push(new MEIRO.Point());
		this.points[i].scale.set(0.1,0.1,0.1);
	}
	
	var material = new THREE.MeshBasicMaterial({color:'black'});
	this.lines = [];
	for (var i=0; i<15; i++)
	{
		this.lines.push(new MEIRO.Cube(0.02));
		this.lines[i].material = material;
		this.lines[i].matrixAutoUpdate = false;
	}

	this.polygon = [];
	for (var i=0; i<8; i++)
		this.polygon.push( new MEIRO.Polygon(4) );
		
	this.showLevel = this.n-1;
	this.showStyle = 0;
	
	this.object1 = new MEIRO.Bezier3D(3);
	this.object2 = new MEIRO.Bezier3D(3);
	
	// бутон за превключване
	this.visible = true;
	var that = this;
	this.showHide = new MEIRO.CornerButton('topLeft', function(){that.onShowHide();}, 'Покажи', 'images/show.hide.png');
	this.showHide.hide();
	this.onShowHide();
	
	this.light = new THREE.AmbientLight('white',0.25);
	
	// сглобяване на целия модел
	this.image.add(this.light,this.object1,this.object2);
	for (var i=0; i<15; i++)
		this.image.add(this.points[i]);
	for (var i=0; i<15; i++)
		this.image.add(this.lines[i]);
	for (var i=0; i<8; i++)
		this.image.add(this.polygon[i]);
}

MEIRO.Models.M26461.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M26461.DIST = {MIN:5, MAX:30, HEIGHT:0};
MEIRO.Models.M26461.POS = {DIST:15, ROT_X:Math.PI/2, ROT_Y:0};
MEIRO.Models.M26461.ROT_Y = {MIN:-0.1, MAX:0.7};


// генератор на човече
MEIRO.Models.M26461.prototype.generateFigure = function(time)
{
	var geometry = new THREE.Geometry();
	var that = this;
	
	function bone(i,dist,size)
	{
		turtle.fd(dist/2);
		
		var x = turtle.basis.x.clone().multiplyScalar(dist);
		var y = turtle.basis.y.clone().multiplyScalar(size);
		var z = turtle.basis.z.clone().multiplyScalar(size);
		that.lines[i].matrix.makeBasis(x,y,z);
		that.lines[i].matrix.setPosition(turtle.basis.o);
		that.lines[i].updateMatrixWorld();
		
		turtle.fd(dist/2);
	}
	
	// 0---1---2
	// 3---4---5
	//(6)-(7)-(8)
	// 9---10--11
	//12---13--14
	function pnt(i,angle,dist)
	{
		var p = turtle.basis.clone();
		
		turtle.lt(angle);
		bone(i,dist,0.02);
		that.points[i].position.copy(turtle.getPosition());
		
		turtle.basis.copy(p);
	}

	var t = time/1000;
	var alpha = 30+30*Math.sin(t);
	
	var turtle = new MEIRO.Turtle();

	turtle.su(alpha/40);	
	turtle.bk(3);
	turtle.lr(180);
	turtle.upp(90);
	pnt(0, -90,2);
	pnt(1, 0,3);
	pnt(2, 90,2);
	turtle.dn(90);

	bone(6,4,0.1);

	turtle.dn(alpha);
	
	turtle.upp(90);
	pnt(3, -45,0.5);
	pnt(4, 0,2.5);
	pnt(5, 45,0.5);
	turtle.dn(90);
	
	bone(7,1.5,0.1);
	turtle.dn(alpha);
	
	turtle.upp(90);
	pnt(9, -90,1);
	pnt(10,0,0.5);
	pnt(11, 90,1);
	turtle.dn(90);

	
	bone(8,3,0.1);

	turtle.upp(90);
	pnt(12, -70,0.4);
	pnt(13, 0,0.8);
	pnt(14, 70,0.4);
	turtle.dn(90);

	this.points[6].position.copy( new THREE.Vector3().lerpVectors(this.points[3].position,this.points[9].position,0.5) );
	this.points[7].position.copy( new THREE.Vector3().lerpVectors(this.points[4].position,this.points[10].position,0.5) );
	this.points[8].position.copy( new THREE.Vector3().lerpVectors(this.points[5].position,this.points[11].position,0.5) );
	
	
	for (var i=0; i<3; i++)
	for (var j=0; j<3; j++)
	{
		this.object1.surface.controlPoints[i][j].copy(this.points[i+3*j].position);
		this.object2.surface.controlPoints[i][j].copy(this.points[i+3*j+6].position);
	}
	this.object1.recalculate();
	this.object2.recalculate();

	function poly(i,a,b,c,d)
	{
		that.polygon[i].setPoint(0,that.points[a].position);
		that.polygon[i].setPoint(1,that.points[b].position);
		that.polygon[i].setPoint(2,that.points[c].position);
		that.polygon[i].setPoint(3,that.points[d].position);
	}
	
	poly(0,0,1,4,3);
	poly(1,1,2,5,4);

	poly(2,3,4,7,6);
	poly(3,4,5,8,7);

	poly(4,6,7,10,9);
	poly(5,7,8,11,10);

	poly(6,9,10,13,12);
	poly(7,10,11,14,13);
}



// аниматор на модела
MEIRO.Models.M26461.prototype.onAnimate = function(time)
{
	this.generateFigure(time);
	//TWEEN.update();
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M26461.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Кожа от повърхнини на Безие</h1>';

	s += '<p>Моделирането на кожа чрез повърхнини на Безие, NURBS или сплайни се реализира чрез контролни точки, свързани към костите. При движение на скелета се променят положенията на контролните точки, а това променя и кожата.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M26461.prototype.onShowHide = function(element)
{
	this.visible = !this.visible;
	for (var i=0; i<15; i++)
		this.points[i].visible = this.visible;
	for (var i=0; i<15; i++)
		this.lines[i].visible = this.visible;
	for (var i=0; i<8; i++)
		this.polygon[i].visible = this.visible;
	reanimate();
}