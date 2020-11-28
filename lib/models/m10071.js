
//	Основи на Компютърната Графика
//	Модел 10071 - Хапчета с антибиотик
//	П. Бойчев, 2017


//Модел на хапче
MEIRO.Pill = function(width,radius,ratio)
{	// width - дължина на цилиндричната част
	// radius - радиус в по-широката част
	// ratio - коефициент на намаление на по-дребната част
	
	THREE.Object3D.call(this);

	// по-голямата половина
	var material = new THREE.MeshPhongMaterial({color:MEIRO.RandomColor(), shininess:80});
	var body = new THREE.Mesh( MEIRO.PRIMITIVE.GEOMETRY.CYLINDER, material );
	body.scale.set(radius,width,radius);
	body.position.set(0,width/2,0);
	body.rotation.y = 2*Math.PI/6/2;
	this.add(body);

	var cap = new THREE.Mesh( MEIRO.PRIMITIVE.GEOMETRY.SPHERE_HALF, material );
	cap.scale.set(radius,radius,radius);
	cap.position.set(0,width,0);
	this.add(cap);

	// по-малката половина
	var material = new THREE.MeshPhongMaterial({color:MEIRO.RandomColor(), shininess:80});
	var body = new THREE.Mesh( MEIRO.PRIMITIVE.GEOMETRY.CYLINDER, material );
	body.scale.set(radius*ratio,width*ratio,radius*ratio);
	body.position.set(0,-width*ratio/2,0);
	body.rotation.y = 2*Math.PI/6/2;
	this.add(body);

	var cap = new THREE.Mesh( MEIRO.PRIMITIVE.GEOMETRY.SPHERE_HALF, material );
	cap.scale.set(radius*ratio,radius*ratio,radius*ratio);
	cap.rotation.x = Math.PI;
	cap.position.set(0,-width*ratio,0);
	this.add(cap);
	
	this.rotation.set(Math.PI/2,Math.random()*10,Math.random()*10,'ZYX');
}
MEIRO.Pill.prototype = Object.create(THREE.Object3D.prototype);


// конструктор на модела
MEIRO.Models.M10071 = function M10071(room)
{
	MEIRO.Model.apply(this, arguments);

	this.n = 30; // брой хапчета
	this.pills = [];
	for (var i=0; i<this.n; i++)
		this.pills.push(new MEIRO.Pill(0.6,0.3,0.95));
	
	light = new THREE.HemisphereLight('white','yellow',0.5);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'НАНОВО', 'images/random.png');
	this.onToggle();
	this.toggle.hide();
	
	// сглобяване на целия модел
	for (var i=0; i<this.n; i++)
		this.image.add(this.pills[i]);
	this.image.add(light);
}

MEIRO.Models.M10071.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M10071.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M10071.POS = {DIST:20, ROT_X:0, ROT_Y:0.1};
MEIRO.Models.M10071.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M10071.prototype.onAnimate = function(time)
{
}



// информатор на модела
MEIRO.Models.M10071.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Хапче с антибиотик</h1>';

	s += '<p>Хапчето с антибиотик е изградено от две отделни цилиндрични части, заоблени в края с полусфери.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M10071.prototype.onToggle = function(element)
{
	for (var i=0; i<this.n; i++)
		this.pills[i].position.set( THREE.Math.randFloat(-6,6),0,THREE.Math.randFloat(-6,6) );

	reanimate();
}