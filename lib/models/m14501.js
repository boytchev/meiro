
//	Основи на Компютърната Графика
//	Модел 14501 - Метод на стоножката
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M14501 = function M14501(room, model)
{
	MEIRO.Model.apply(this, arguments);

	// параметри на движението на костенурката
	this.S = 5;
	this.s = [];
	this.o = [];
	for (var i=0; i<this.S; i++)
	{
		this.s.push(0.5+5*Math.random());
		this.o.push(2*Math.PI*Math.random());
	}
	
	this.turtle = new MEIRO.Turtle(0.5);
	
	// траектория
	this.P = 400;
	this.path = [];
	var geometry = new THREE.CircleGeometry(0.2,3);
	geometry.rotateX(-Math.PI/2);
	geometry.translate(0.1,0,0);
	var material = new THREE.MeshBasicMaterial({color:'black'});
	for (var i=0; i<this.P; i++)
	{
		var path = new THREE.Mesh(geometry,material);
		path.pos1 = new THREE.Vector3();
		path.pos2 = new THREE.Vector3();
		path.matrixAutoUpdate = false;
		this.path.push(path);
	}
	this.time = 0;
	
	// крака
	this.L = 20;
	this.line = [];
	var material = new THREE.LineBasicMaterial({color:'black'});
	for (var i=0; i<this.L; i++)
	{
		this.line.push(new MEIRO.Line());
		this.line[i].material = material;
	}

	// обувки
	var geometry = new THREE.Geometry();
	var material = new THREE.PointsMaterial({color:'black',sizeAttenuation:false,size:3});
	for (var i=0; i<this.L*2; i++)
		geometry.vertices.push(new THREE.Vector3());
	this.shoes = new THREE.Points(geometry,material);
	
	// сглобяване на целия модел
	this.image.add(this.turtle,this.shoes);
	for (var i=0; i<this.P; i++)
		this.image.add(this.path[i]);
	for (var i=0; i<this.L; i++)
		this.image.add(this.line[i]);
}

MEIRO.Models.M14501.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M14501.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M14501.POS = {DIST:15, ROT_X:-0.9, ROT_Y:0.4};
MEIRO.Models.M14501.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M14501.prototype.onAnimate = function(time)
{
	this.turtle.fd(0.02);
	
	var angle = 0;
	for(var i=0; i<this.S; i++)
		angle += 0.5*Math.sin(this.s[i]*time/2500+this.o[i]);
		
	var pos = this.turtle.getPosition();
	if (pos.length()>4)
	{
		var pos1 = this.turtle.basis.position(1,0,0.2);
		var pos2 = this.turtle.basis.position(1,0,-0.2);
		if (pos1.lengthSq()<pos2.lengthSq())
			angle = -1+angle/2;
		else
			angle = 1+angle/2;
	}

	this.turtle.lt(angle);

	var i = this.time%this.P;
	this.turtle.basis.apply(this.path[i]);
	this.path[i].pos1 = this.turtle.basis.position(0,0,1/2);
	this.path[i].pos2 = this.turtle.basis.position(0,0,-1/2);
	
	for (var j=0; j<this.L; j++)
	{
		var k = (20*this.P+i-20*j+1)%this.P;
		this.line[j].setFrom(this.path[k].pos1);
		this.line[j].setTo(this.path[k].pos2);
		this.shoes.geometry.vertices[2*j] = this.path[k].pos1;
		this.shoes.geometry.vertices[2*j+1] = this.path[k].pos2;
	}	
	this.shoes.geometry.verticesNeedUpdate = true;
		
	this.time++;
	reanimate();
}



// информатор на модела
MEIRO.Models.M14501.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Метод на стоножката</h1>';

	s += '<p>Този метод изполва ориентацията на костенурката, за да запомни точки вляво и вдясно от движението. Тези точки са по перпендикулярна пресечна права. За целта се изполва една от локалните оси на костенурката (едната ос сочи по посоката на движение, другата &ndash; вляво или вдясно, а третата &ndash; нагоре).</p>';

	element.innerHTML = s;
}
