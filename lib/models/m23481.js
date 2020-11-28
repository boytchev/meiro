
//	Основи на Компютърната Графика
//	Модел 23481 - Гладкост C1 с кубични криви на Безие
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M23481 = function M23481(room)
{
	MEIRO.Model.apply(this, arguments);

	this.t = 0;
	this.speed = 0;
	
	// екран
	this.screen = new MEIRO.Screen(16,10);
	
	// N точки
	this.n = 7;
	this.points = [];
	for (var i=0; i<this.n; i++)
	{
		var p = new MEIRO.Sphere( (i==0 || i==3 || i==6)?0.15:0.1);
		p.material = MEIRO.PRIMITIVE.STYLE.PAWN;
		p.offset = THREE.Math.randFloat(0,2*Math.PI);
		p.speed = THREE.Math.randFloat(0.5,1.5);
		p.position.set(-3+6*i/(this.n-1),4*Math.sin(p.offset),0);
		this.points.push(p);
	}
	this.points[3].material = new THREE.MeshPhongMaterial({color:'red',shininess:200});
	
	this.lines = [];
	var material = 	new THREE.LineDashedMaterial( {
						color: 'cornflowerblue',
						scale: 7,
						dashSize: 0.5,
						gapSize: 0.5,
					});

	for (var i=0; i<this.n-1; i++)
	{
		var l = new MEIRO.DottedLine(this.points[i].position,this.points[i+1].position);
		l.material = material;
		l.geometry.computeLineDistances();
		this.lines.push(l);
	}
	
	this.m = 50;
	this.line = new MEIRO.Polygon(2*this.m);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СТАРТ', 'images/start.stop.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.screen,this.line);
	for (var i=0; i<this.n; i++) this.image.add(this.points[i]);
	for (var i=0; i<this.n-1; i++) this.image.add(this.lines[i]);
}

MEIRO.Models.M23481.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M23481.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M23481.POS = {DIST:20, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M23481.ROT_Y = {MIN:-0.1, MAX:0.7};


MEIRO.Models.M23481.prototype.bezierCurve = function(t,P0,P1,P2,P3)
{
	var B0 = 1*Math.pow(1-t,3)*Math.pow(t,0);
	var B1 = 3*Math.pow(1-t,2)*Math.pow(t,1);
	var B2 = 3*Math.pow(1-t,1)*Math.pow(t,2);
	var B3 = 1*Math.pow(1-t,0)*Math.pow(t,3);

	var p = new THREE.Vector3();
	p.addScaledVector(P0,B0);
	p.addScaledVector(P1,B1);
	p.addScaledVector(P2,B2);
	p.addScaledVector(P3,B3);
	return p;
}


// аниматор на модела
MEIRO.Models.M23481.prototype.onAnimate = function(time)
{
	this.t += this.speed;

	for (var i=0; i<this.n; i++)
	{
		var p = this.points[i];
		p.position.x = -3+6*i/(this.n-1)+4*Math.cos(2*p.offset+p.speed*rpm(this.t,140));
		p.position.y = 4*Math.sin(p.offset+p.speed*rpm(this.t,180));
	}
	
	this.points[3].position.lerpVectors(this.points[2].position,this.points[4].position,0.5);
	
	for (var i=0; i<this.m; i++)
	{
		var p = this.bezierCurve(i/(this.m-1),this.points[0].position,this.points[1].position,this.points[2].position,this.points[3].position);
		this.line.getPoint(i).copy(p);
	}
	for (var i=0; i<this.m; i++)
	{
		var p = this.bezierCurve(i/(this.m-1),this.points[3].position,this.points[4].position,this.points[5].position,this.points[6].position);
		this.line.getPoint(this.m+i).copy(p);
	}
	this.line.geometry.verticesNeedUpdate = true;
	
	for (var i=0; i<this.n-1; i++)
	{
		this.lines[i].setFromTo(this.points[i].position,this.points[i+1].position);
		this.lines[i].geometry.computeLineDistances();
	}
	
	if (this.speed>0.0001)
		reanimate();
		
	TWEEN.update();
}



// информатор на модела
MEIRO.Models.M23481.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Гладкост C<sup>1</sup> с кубични криви на Безие</h1>';

	s += '<p>Две кубични криви на Безие се съшиват с гладкост <em>C<sup>1</sup></em> по същия начин като квадратичните &ndash; общата точка е по средата на двете съседни контролни точки. Съществената разлика е, че съшиването влияе на формата на кривата само на локалната околност на точката на съшиване.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M23481.prototype.onToggle = function(element)
{
	var that = this;
	new TWEEN.Tween({k:this.speed})
		.to({k:this.speed>0.5?0:1},1000)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){that.speed=this.k} )
		.start();
	reanimate();
}