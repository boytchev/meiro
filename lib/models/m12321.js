
//	Основи на Компютърната Графика
//	Модел 12321 - Движение по параметрична повърхнина
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M12321 = function M12321(room)
{
	MEIRO.Model.apply(this, arguments);

	// повърхност
	var geometry = new THREE.ParametricGeometry(this.calculate,options.lowpoly?20:80,options.lowpoly?15:40);
	var material = new THREE.MeshPhongMaterial({color:'cornflowerblue',side:THREE.DoubleSide,shininess:100,vertexColors: THREE.VertexColors});
	this.surface = new THREE.Mesh(geometry,material);
	
	var faceIndices = ['a','b','c'];
	geometry.faces.forEach(function(face)
		{
		  for (var i = 0; i < 3; i++)
		  {
			var vertexIndex = face[faceIndices[i]];
			var vertex = geometry.vertices[vertexIndex];
			var color = new THREE.Color(
			  1+0.8*Math.sin(vertex.y/3),
			  1+0.8*Math.sin(vertex.y/2),
			  1+0.8*Math.sin(vertex.y/2),
			);
			face.vertexColors[i] = color;
		  }
		});

	// обекти
	this.objects = [];
	this.n = 8;
	for (var i=0; i<this.n; i++) this.objects.push(new MEIRO.Sphere(0.5));
	
	// светлина
	light = new THREE.AmbientLight('red',0.2);
	
	// сглобяване на целия модел
	this.image.add(this.surface,light);
	for (var i=0; i<this.n; i++)
		this.image.add(this.objects[i]);
}

MEIRO.Models.M12321.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M12321.DIST = {MIN:15, MAX:40, HEIGHT:0};
MEIRO.Models.M12321.POS = {DIST:25, ROT_X:0.5, ROT_Y:0.5};
MEIRO.Models.M12321.ROT_Y = {MIN:-0.1, MAX:0.7};


// генератор на модела
MEIRO.Models.M12321.prototype.calculate = function(u,v)
{
	u = u*(2*Math.PI);
	
	var x = 1.15/(v+0.1)*Math.cos(u);
	var y = Math.pow(3*v,2)+Math.sin(6*u);
	var z = 1.15/(v+0.1)*Math.sin(u);
	if (y>8) y = 8;
	
	return new THREE.Vector3(x,y,z);
}


// аниматор на модела
MEIRO.Models.M12321.prototype.onAnimate = function(time)
{
	for (var i=0; i<this.n; i++)
	{
		var t = rpm(time,1);
		var u = t+i/this.n*2*Math.PI;
		var v = 0.15+0.13*Math.sin(3*t+i);
		this.objects[i].position.copy(this.calculate(u,v));
	}
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M12321.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движение по параметрична повърхнина</h1>';

	s += '<p>Движението на обект по параметрична повърхнина използва същото уравнение за координати, което се използва и за генериране на самата повърхнина.</p>';
	
	element.innerHTML = s;
}
