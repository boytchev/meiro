
//	Основи на Компютърната Графика
//	Модел 14502 - Ограда с дръвчета
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M14502 = function M14502(room, model)
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
	this.P = 200;
	this.path = [];
	var geometry = new THREE.CircleGeometry(0.25,4);
	geometry.translate(0,0.25,0);
	var material = new THREE.MeshPhongMaterial({color:'brown',side:THREE.DoubleSide});
	for (var i=0; i<this.P; i++)
	{
		var path = new THREE.Mesh(geometry,material);
		path.matrixAutoUpdate = false;
		this.path.push(path);
	}
	this.time = 0;

	// дръвчета
	this.T = 40;
	this.t = 0;
	var geomTrunc = new THREE.CylinderGeometry(0.05,0.1,1,6,1,false);
	var geomLeaves = new THREE.IcosahedronGeometry(0.3,1);
	this.tree = [];
	for (var i=0; i<this.T; i++)
	{
		var tree = new THREE.Object3D();
		var trunc = new THREE.Mesh(
			geomTrunc,
			new THREE.MeshPhongMaterial({color:new THREE.Color(0.4*Math.random(),0,0),shading:THREE.FlatShading})
		);
		trunc.position.set(0,0.5,0);
		var leaves = new THREE.Mesh(
			geomLeaves,
			new THREE.MeshPhongMaterial({color:new THREE.Color(0,0.5+0.5*Math.random(),0),shading:THREE.FlatShading})
		);
		leaves.position.set(0,1,0);
		tree.add(trunc,leaves);
		tree.position.set(0,10000,0);
		tree.scale.setScalar(THREE.Math.randFloat(0.5,0.8));
		this.tree.push(tree);
	}
	
	// сглобяване на целия модел
	for (var i=0; i<this.P; i++)
		this.image.add(this.path[i]);
	for (var i=0; i<this.T; i++)
		this.image.add(this.tree[i]);
}

MEIRO.Models.M14502.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M14502.DIST = {MIN:5, MAX:15, HEIGHT:-1};
MEIRO.Models.M14502.POS = {DIST:10, ROT_X:-0.9, ROT_Y:0.4};
MEIRO.Models.M14502.ROT_Y = {MIN:0, MAX:0.7};



// аниматор на модела
MEIRO.Models.M14502.prototype.onAnimate = function(time)
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
	
	var i = (this.time>>2)%this.P;
	this.turtle.basis.apply(this.path[i]);
	
	if (Math.random()>0.95)
	{
		var sign = Math.sign(Math.random()-0.5);
		var i = (this.t)%this.T;
		this.tree[i].position.copy(this.turtle.basis.position(0,0,0.3*sign));
		this.t++;
	}
	
	this.time++;
	reanimate();
}



// информатор на модела
MEIRO.Models.M14502.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Ограда с дръвчета</h1>';

	s += '<p>Разполагането на дръвчета около ограда е направено по метода на стоножката. Невидима костенурка обхожда кривата на оградата се поставят съответните елементи. Напречната ос, т.е. нормалния вектор, се използва, за да се определи мястото на поредното дръвче.</p>';

	element.innerHTML = s;
}
