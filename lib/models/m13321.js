
//	Основи на Компютърната Графика
//	Модел 13321 - Фонтан от тухли
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M13321 = function M13321(room)
{
	MEIRO.Model.apply(this, arguments);

	// чучур за тухли
	var ball = new MEIRO.Cylinder(1,2);
	ball.material = new THREE.MeshPhongMaterial({color:'black',shininess:150});
	
	// пясъчник
	var n = options.lowpoly?16:60;
	var geom = new THREE.RingGeometry(1,10,n,options.lowpoly?4:10);
	geom.rotateX(-Math.PI/2);
	for (var i=0; i<geom.vertices.length; i++)
	{
		var p = geom.vertices[i];
		var k = Math.sqrt(p.x*p.x+p.z*p.z)/50;
		p.y += k*Math.sin(5*p.x+9*p.y+13*p.z)+k*Math.cos(13*p.x+9*p.y+5*p.z);
		if (geom.vertices.length-i<=(n+1))
		{
			p.x *= 9/10;
			p.z *= 9/10;
			p.y = -2;
		}
	}
	geom.computeVertexNormals();
	for (var i=0; i<geom.faces.length; i++)
	{
		var f = geom.faces[i];
		var p;
		p = geom.vertices[f.a];
		f.vertexColors.push(new THREE.Color(1+0.1*Math.sin(10*p.x+17*p.z),0.8+0.1*Math.cos(17*p.x+10*p.z),0.2));
		p = geom.vertices[f.b];
		f.vertexColors.push(new THREE.Color(1+0.1*Math.sin(10*p.x+17*p.z),0.8+0.1*Math.cos(17*p.x+10*p.z),0.2));
		p = geom.vertices[f.c];
		f.vertexColors.push(new THREE.Color(1+0.1*Math.sin(10*p.x+17*p.z),0.8+0.1*Math.cos(17*p.x+10*p.z),0.2));
	}
	var sand = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({color:'white',vertexColors: THREE.VertexColors}));

	// тухли
	this.n = 50;
	this.brick = [];
	for (var i=0; i<this.n; i++)
	{
		var b = new MEIRO.Cube(1);
		b.scale.set(0.25,0.4,0.8);
		b.position.set(0,THREE.Math.randFloat(-2,0),0);
		b.rotation.set(2*Math.PI*Math.random(),2*Math.PI*Math.random(),2*Math.PI*Math.random());
		b.material = new THREE.MeshLambertMaterial({color:new THREE.Color(THREE.Math.randFloat(0.4,0.8),THREE.Math.randFloat(0,0.3),THREE.Math.randFloat(0,0))});
		b.v = new THREE.Vector3(0,-1,0);
		this.brick.push(b);
	}

	// сглобяване на целия модел
	this.image.add(sand,ball);
	for (var i=0; i<this.n; i++)
	{
		this.image.add(this.brick[i]);
	}
}

MEIRO.Models.M13321.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M13321.DIST = {MIN:5, MAX:20, HEIGHT:-2};
MEIRO.Models.M13321.POS = {DIST:10, ROT_X:0.1, ROT_Y:0.3};
MEIRO.Models.M13321.ROT_Y = {MIN:0, MAX:0.7};


// аниматор на модела
MEIRO.Models.M13321.prototype.onAnimate = function(time)
{
	for (var i=0; i<Math.min(this.n,time/200); i++)
	{
		var b = this.brick[i];
		var p = b.position;
		var r = b.rotation;
		var v = b.v;

		if (p.y>0.3 || v.y>0)
		{	// летене
			p.add(v);
			v.y -= 0.006; // земно ускорение
			r.x += 0.05;
			r.y -= 0.05;
			r.z += 0.05;
		}
		else if (p.y>-1)
		{	// потъване
			p.y -= 0.007;
			r.x += 0.01;
			r.y -= 0.01;
			r.z += 0.01;
		}
		else
		{	// наново
			p.set(0,THREE.Math.randFloat(-2,0),0);
			v.setFromSpherical(new THREE.Spherical(0.3,0.1+0.2*Math.random(),2*Math.PI*Math.random()));
		}
	}
	
	reanimate();	
}



// информатор на модела
MEIRO.Models.M13321.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Фонтан от тухли</h1>';

	s += '<p>Всяка тухла се движи по балистична парабола. Движението по хоризонтала е по случайно избран, не постоянен вектор. Движението по вертикала намалява вертикалната скорост с една и съща стойност, съответстваща на земното притегляне.</p>';
	
	element.innerHTML = s;
}
