
//	Основи на Компютърната Графика
//	Модел 09301 - Куб с издутини
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09301 = function M09301(room)
{
	MEIRO.Model.apply(this, arguments);

	// издутини
	var material = new THREE.MeshLambertMaterial({color:'yellow'});
	this.bevelA = new MEIRO.Cube();
	this.bevelA.material = material;
	this.bevelA.scale.set(1,3,1);

	this.bevelB = this.bevelA.clone(true);
	this.bevelB.rotation.x = Math.PI/2;

	this.bevelC = this.bevelA.clone(true);
	this.bevelC.rotation.z = Math.PI/2;

	// куб
	this.cube = new MEIRO.Cube(2.5);
	this.cube.material = new THREE.MeshLambertMaterial({color:'red',transparent:true,opacity:1});
	this.frame = new THREE.LineSegments(new THREE.EdgesGeometry(this.cube.geometry),MEIRO.PRIMITIVE.STYLE.GRID);
	this.frame.scale.set(2.5,2.5,2.5);
	
	this.light = new THREE.PointLight('white',0.5);
	this.light.position.set(0,5,0);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТГОВОР', 'images/show.hide.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.bevelA,this.bevelB,this.bevelC,this.cube,this.frame,this.light);
}

MEIRO.Models.M09301.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09301.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M09301.POS = {DIST:10, ROT_X:1, ROT_Y:0.5};
MEIRO.Models.M09301.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09301.prototype.onAnimate = function(time)
{
	TWEEN.update();
}



// информатор на модела
MEIRO.Models.M09301.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Куб с издутини</h1>';

	s += '<p>Рисуване на куб с 6 издутини, по една на всяка страна, може да се направи с по-малък от видимия брой примитиви. Всяка двойка срещуположни издатини са всъщност един паралелепипед.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M09301.prototype.onToggle = function(element)
{
	var that = this;
	var from = {k:that.cube.material.opacity};
	var to = {k: (that.cube.material.opacity>0.5)?0.3:1};

	new TWEEN.Tween(from)
		.to(to,1000)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){that.cube.material.opacity = this.k;})
		.start();
	reanimate();
}