
//	Основи на Компютърната Графика
//	Модел 10261 - Крива на Лисажу
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M10261 = function M10261(room)
{
	MEIRO.Model.apply(this, arguments);

	this.n = 350; // брой цилиндърчета
	
	this.objects = [];
	
	var geometry = new THREE.CylinderGeometry(1/3,1/3,1/2.5,16,1,true);
	geometry.rotateX(Math.PI/2);
	for (var i=0; i<this.n; i++)
	{
		var material = new THREE.MeshLambertMaterial();
		this.objects.push(new THREE.Mesh(geometry,material));
	}
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'НАНОВО', 'images/random.png');
	this.toggle.hide();
	this.onToggle();

	var light = new THREE.AmbientLight('white',0.3);
	
	// сглобяване на целия модел
	for (var i=0; i<this.n; i++)
		this.image.add(this.objects[i]);
	this.image.add(light);
}

MEIRO.Models.M10261.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M10261.DIST = {MIN:15, MAX:40, HEIGHT:0};
MEIRO.Models.M10261.POS = {DIST:20, ROT_X:1.2, ROT_Y:0};
MEIRO.Models.M10261.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M10261.prototype.onAnimate = function(time)
{
}



// информатор на модела
MEIRO.Models.M10261.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Крива на Лисажу</h1>';

	s += '<p>Тази реализация на кривата на Лисажу използва '+this.n+' малки цилиндърчета. Те са разположени по протежение на кривата и са ориентирани по тангентата ѝ в дадената точка. Понже броят на цилиндърчетата е фиксиран, при острите ръбовете на цилиндърчетата ще стърчат.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M10261.prototype.onToggle = function(element)
{
	do
	{
		var bx = THREE.Math.randInt(1,6);
		var by = THREE.Math.randInt(1,6);
		var bz = THREE.Math.randInt(1,6);
	}
	while (bx==by || bx==bz || by==bz);
	
	var cx = THREE.Math.randInt(0,12)*Math.PI/3;
	var cy = THREE.Math.randInt(0,12)*Math.PI/3;
	var cz = THREE.Math.randInt(0,12)*Math.PI/3;
	
	function liss(t)
	{
		return new THREE.Vector3(Math.sin(bx*t+cx),Math.sin(by*t+cy),Math.sin(bz*t+cz));
	}
	
	for (var i=0; i<this.n; i++)
	{
		var t = 2*Math.PI*i/this.n;
		var p = liss(t);
		this.objects[i].position.copy(p);
		this.objects[i].position.multiplyScalar(3);
		p = p.multiplyScalar(1/2).addScalar(0.6);
		
		this.objects[i].material.color.setRGB(p.x,p.y,p.z);
	}
	for (var i=0; i<this.n; i++)
	{
		this.objects[i].lookAt(this.objects[(i+1)%this.n].position);
	}
	
	reanimate();
}