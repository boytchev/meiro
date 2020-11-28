
//	Основи на Компютърната Графика
//	Модел 17461 - Z-буфер
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M17461 = function M17461(room)
{
	MEIRO.Model.apply(this, arguments);

	this.dx = 6;
	this.dy = 4;
	
	// плочка A
	this.plateA = new THREE.Object3D();
	this.plateA.pixels = [];
	this.plateA.material1 = new THREE.MeshBasicMaterial({color:'cornflowerblue'});
	this.plateA.material2 = new THREE.MeshBasicMaterial({color:'cornflowerblue',transparent:true,opacity:0.2});
	for (var x=-this.dx; x<=this.dx; x++)
	{
		this.plateA.pixels[x] = [];
		for (var y=-this.dy; y<=this.dy; y++)
		{
			var pixel = new MEIRO.Cube(1);
			pixel.material = this.plateA.material1;
			pixel.scale.set(0.9,0.9,0.1);
			pixel.position.set(x,y,0);
			this.plateA.pixels[x][y] = pixel;
			this.plateA.add(pixel);
		}
	}
	
	// плочка B
	this.plateB = new THREE.Object3D();
	this.plateB.pixels = [];
	this.plateB.material1 = new THREE.MeshBasicMaterial({color:'tomato'});
	this.plateB.material2 = new THREE.MeshBasicMaterial({color:'tomato',transparent:true,opacity:0.2});
	for (var x=-this.dx; x<=this.dx; x++)
	{
		this.plateB.pixels[x] = [];
		for (var y=-this.dy; y<=this.dy; y++)
		{
			var pixel = new MEIRO.Cube(1);
			pixel.material = this.plateB.material1;
			pixel.scale.set(0.9,0.9,0.1);
			pixel.position.set(x,y,0);
			this.plateB.pixels[x][y] = pixel;
			this.plateB.add(pixel);
		}
	}
	
	// плочка C
	this.plateC = new THREE.Object3D();
	this.plateC.pixels = [];
	this.plateC.material1 = new THREE.MeshBasicMaterial({color:'black'});
	this.plateC.material2 = new THREE.MeshBasicMaterial({color:'black',transparent:true,opacity:0.2});
	for (var x=-this.dx; x<=this.dx; x++)
	{
		this.plateC.pixels[x] = [];
		for (var y=-this.dy; y<=this.dy; y++)
		{
			var pixel = new MEIRO.Cube(1);
			pixel.material = this.plateC.material1;
			pixel.scale.set(0.9,0.9,0.1);
			pixel.position.set(x,y,0);
			this.plateC.pixels[x][y] = pixel;
			this.plateC.add(pixel);
		}
	}

	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();
	this.onToggle();

	// сглобяване на целия модел
	this.image.add(this.plateA, this.plateB, this.plateC);
}

MEIRO.Models.M17461.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M17461.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M17461.POS = {DIST:20, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M17461.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M17461.prototype.onAnimate = function(time)
{
	//reanimate();
}



// информатор на модела
MEIRO.Models.M17461.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Z-буфер</h1>';

	s += '<p>При използването на Z-буфер оцветяването на пиксел зависи от дълбочината на новия цвят и дълбочината на веченарисувания цвят. Така лесно може да се разбере дали новият цвят е отпред или отзад на вече нарисувания, а това определя дали новият цвят да се нарисува върху стария или да не се рисува изобщо.</p>';
	s += '<p>В този модел пикселите, които не се рисуват поради дълбочината си, са отбелязани като полупрозрачни. Видимите пиксели са плътни.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M17461.prototype.onToggle = function(element)
{
	var d = 0.6;
	var dxA = THREE.Math.randFloat(-d,d);
	var dyA = THREE.Math.randFloat(-d,d);
	var zA = THREE.Math.randFloat(-2,2);

	var dxB = THREE.Math.randFloat(-d,d);
	var dyB = THREE.Math.randFloat(-d,d);
	var zB = THREE.Math.randFloat(-2,2);

	var dxC = THREE.Math.randFloat(-d,d);
	var dyC = THREE.Math.randFloat(-d,d);
	var zC = THREE.Math.randFloat(-2,2);

	for (var x=-this.dx; x<=this.dx; x++)
	for (var y=-this.dy; y<=this.dy; y++)
	{
		var a = this.plateA.pixels[x][y]; a.position.z = zA+x*dxA+y*dyA;
		var b = this.plateB.pixels[x][y]; b.position.z = zB+x*dxB+y*dyB;
		var c = this.plateC.pixels[x][y]; c.position.z = zC+x*dxC+y*dyC;
		
		if (a.position.z>b.position.z && a.position.z>c.position.z)
			a.material = this.plateA.material1;
		else
			a.material = this.plateA.material2;
		
		if (b.position.z>a.position.z && b.position.z>c.position.z)
			b.material = this.plateB.material1;
		else
			b.material = this.plateB.material2;
			
		if (c.position.z>b.position.z && c.position.z>a.position.z)
			c.material = this.plateC.material1;
		else
			c.material = this.plateC.material2;
	}
	
	reanimate();
}
	