
//	Основи на Компютърната Графика
//	Модел 21481 - Изглаждане с подпиксели
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M21481 = function M21481(room)
{
	MEIRO.Model.apply(this, arguments);

	this.dx = 16;
	this.dy = 10;
	
	this.dx2 = ((2*this.dx+1)/3-1)/2;
	this.dy2 = ((2*this.dy+1)/3-1)/2;

	this.oxy = new MEIRO.Axes2D([-this.dx2,this.dx2+1],[-this.dy2,this.dy2+1],false,false,false);
	this.oxy.scale.set(1.5,1.5,1);
	this.oxy.position.set(-0.75,-0.75,0);
	
	var color1 = new THREE.Color('red');
	var color2 = new THREE.Color('lightgray');
	this.materials = [];
	for (var i=0; i<=9; i++)
		this.materials.push(new THREE.MeshBasicMaterial({
			color: new THREE.Color().setHSL(219/360,0.79,0.66+0.34*i/9),
			side: THREE.DoubleSide,
			polygonOffset: true,
			polygonOffsetFactor: 1,
			polygonOffsetUnits: 1}));
	
	// плочка A
	this.plateA = new THREE.Object3D();
	this.plateA.scale.set(0.5,0.5,1);
	this.plateA.pixels = [];
	var geometry = new THREE.PlaneGeometry(1,1);
	for (var x=-this.dx; x<=this.dx; x++)
	{
		this.plateA.pixels[x] = [];
		for (var y=-this.dy; y<=this.dy; y++)
		{
			var pixel = new THREE.Mesh(geometry,this.materials[9]);
			pixel.position.set(x,y,0);
			this.plateA.pixels[x][y] = pixel;
			this.plateA.add(pixel);
		}
	}
	this.plateA.visible = true;
	
	// плочка B
	this.plateB = new THREE.Object3D();
	this.plateB.scale.set(1.5,1.5,1);
	this.plateB.pixels = [];
	for (var x=-this.dx2; x<=this.dx2; x++)
	{
		this.plateB.pixels[x] = [];
		for (var y=-this.dy2; y<=this.dy2; y++)
		{
			var pixel = new THREE.Mesh(geometry,this.materials[9]);
			pixel.position.set(x,y,0);
			this.plateB.pixels[x][y] = pixel;
			this.plateB.add(pixel);
		}
	}
	this.plateB.visible = false;
	
	this.randomize();

	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, '(ПОД)ПИКСЕЛИ', 'images/toggle.png');
	this.toggle.hide();
	this.random = new MEIRO.CornerButton('topRight', function(){that.randomize();}, 'НАНОВО', 'images/random.png');
	this.random.hide();

	// сглобяване на целия модел
	this.image.add(this.oxy,this.plateA,this.plateB);
}

MEIRO.Models.M21481.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M21481.DIST = {MIN:15, MAX:50, HEIGHT:0};
MEIRO.Models.M21481.POS = {DIST:25, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M21481.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M21481.prototype.onAnimate = function(time)
{
	//reanimate();
}



// информатор на модела
MEIRO.Models.M21481.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Изглаждане с подпиксели</h1>';

	s += '<p>Всеки пиксел на мрежа от '+(2*this.dx2+1)+'х'+(2*this.dy2+1)+' пиксела е разделен на 3х3 подпиксела. Подпикселите имат само две състояния &ndash; оцветено и неоцветено. Пикселите има 10 състояния, които зависят от броя оцветени и неоцветени подпиксели в тях.</p>';
	
	element.innerHTML = s;
}


MEIRO.Models.M21481.prototype.randomize = function()
{
	var n = 3;
	var p=[];
	for (var i=0; i<n; i++)
		p.push(new THREE.Vector2(THREE.Math.randFloat(-this.dx,this.dx),THREE.Math.randFloat(-this.dy,this.dy)));
		
	var v = new THREE.Vector2();
	
	for (var x=-this.dx2; x<=this.dx2; x++)
	for (var y=-this.dy2; y<=this.dy2; y++)
		this.plateB.pixels[x][y].value = 0;
		
	for (var x=-this.dx; x<=this.dx; x++)
	for (var y=-this.dy; y<=this.dy; y++)
	{
		var s = 0;
		for (var i=0; i<n; i++)
		{
			v.set(x,y);
			s += Math.sin(v.distanceTo(p[i])/2);
		}

		var x2 = Math.floor((x+this.dx)/3)-this.dx2;
		var y2 = Math.floor((y+this.dy)/3)-this.dy2;
		
		if (s>0)
			this.plateA.pixels[x][y].material = this.materials[0];
		else
		{
			this.plateA.pixels[x][y].material = this.materials[9];
			this.plateB.pixels[x2][y2].value++;
		}
		
		this.plateB.pixels[x2][y2].material = this.materials[this.plateB.pixels[x2][y2].value];
	}
	reanimate();
}


// превключвател на модела
MEIRO.Models.M21481.prototype.onToggle = function(element)
{
	this.plateA.visible = !this.plateA.visible;
	this.plateB.visible = !this.plateB.visible;
	reanimate();
}
	