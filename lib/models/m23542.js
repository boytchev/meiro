
//	Основи на Компютърната Графика
//	Модел 23542 - Кубичен сплайн - съшиване на криви
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M23542 = function M23542(room)
{
	MEIRO.Model.apply(this, arguments);

	// екран
	this.screen = new MEIRO.Screen(16,10);
	
	this.visible = false;
	
	// N точки
	this.n = 4;
	this.points = [];
	for (var i=0; i<this.n; i++)
	{
		var p = new MEIRO.Sphere(0.1);
		p.material = MEIRO.PRIMITIVE.STYLE.PAWN;
		p.visible = this.visible;
		this.points.push(p);
	}
	
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
		l.visible = this.visible;
		this.lines.push(l);
	}
	
	this.m = 20;
	this.mno = -1;
	this.c = 150;
	this.cno = this.c-1;
	this.curve = [];
	for (var i=0; i<this.c; i++)
	{
		this.curve.push(new MEIRO.Line(new THREE.Vector3(),new THREE.Vector3()));
		this.curve[i].visible = false;
	}
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ВИЖ', 'images/show.hide.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.screen);
	for (var i=0; i<this.n; i++) this.image.add(this.points[i]);
	for (var i=0; i<this.n-1; i++) this.image.add(this.lines[i]);
	for (var i=0; i<this.c; i++) this.image.add(this.curve[i]);
}

MEIRO.Models.M23542.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M23542.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M23542.POS = {DIST:20, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M23542.ROT_Y = {MIN:-0.1, MAX:0.7};


MEIRO.Models.M23542.prototype.bezierCurve = function(t,P0,P1,P2,P3)
{
	var tt = t*t;
	var ttt = t*tt;
	var B0 = (-ttt+3*tt-3*t+1)/6;
	var B1 = (3*ttt-6*tt+4)/6;
	var B2 = (-3*ttt+3*tt+3*t+1)/6;
	var B3 = ttt/6;
	
	var p = new THREE.Vector3();
	p.addScaledVector(P0,B0);
	p.addScaledVector(P1,B1);
	p.addScaledVector(P2,B2);
	p.addScaledVector(P3,B3);
	return p;
}


// аниматор на модела
MEIRO.Models.M23542.prototype.onAnimate = function(time)
{
	this.mno++;
	if (this.mno>=this.m)
	{
		for (var i=0; i<this.n-1; i++)
			this.points[i].position.copy(this.points[i+1].position);
		this.points[3].position.set(THREE.Math.randFloat(-8,8),THREE.Math.randFloat(-5,5),0);
		
		this.mno = 0;
		
		for (var i=0; i<this.n-1; i++)
		{
			this.lines[i].setFromTo(this.points[i].position,this.points[i+1].position);
			this.lines[i].geometry.computeLineDistances();
		}
	}
	
	var p = this.bezierCurve(this.mno/(this.m-1),this.points[0].position,this.points[1].position,this.points[2].position,this.points[3].position);

	this.curve[this.cno].setTo(p);
	this.curve[this.cno].visible = true;
	this.cno = (this.cno+1)%this.c;
	this.curve[this.cno].setFrom(p);
	this.curve[this.cno].visible = false;
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M23542.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Кубичен сплайн - съшиване на криви</h1>';

	s += '<p>Сплайн кривите се съшиват автоматично, без да се налага промяната на координати на контролни точки. В този модел след рисуването на единична крива се добавя нова контролна точка и се рисува следващата крива. Ако първата крива ползва точките <em>P<sub>0</sub>P<sub>1</sub>P<sub>2</sub>P<sub>3</sub></em>, то втората ползва <em>P<sub>1</sub>P<sub>2</sub>P<sub>3</sub>P<sub>4</sub></em>, третата &ndash; <em>P<sub>2</sub>P<sub>3</sub>P<sub>4</sub>P<sub>5</sub></em> и т.н.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M23542.prototype.onToggle = function(element)
{
	this.visible = !this.visible;

	for (var i=0; i<this.n-1; i++)
		this.lines[i].visible = this.visible;
	
	for (var i=0; i<this.n; i++)
		this.points[i].visible = this.visible;
	
	reanimate();
}