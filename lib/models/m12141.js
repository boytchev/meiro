
//	Основи на Компютърната Графика
//	Модел 12141 - Вложено въртене
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M12141 = function M12141(room)
{
	MEIRO.Model.apply(this, arguments);

	// сфери
	this.sphereA = new MEIRO.Sphere(1/2);
	this.sphereA.material = new THREE.MeshPhongMaterial({color:'cornflowerblue',shininess:150});

	this.sphereB = new MEIRO.Sphere(1/2);
	this.sphereB.material = this.sphereA.material;

	// траектории
	this.pathA = new THREE.Line( MEIRO.PRIMITIVE.GEOMETRY.CIRCLE, MEIRO.PRIMITIVE.STYLE.GRID );
	this.pathA.scale.set(4,4,4);
	this.pathA.rotation.x = Math.PI/2;

	this.pathB = new THREE.Line( MEIRO.PRIMITIVE.GEOMETRY.CIRCLE, MEIRO.PRIMITIVE.STYLE.GRID );
	this.pathB.scale.set(2,2,2);
	this.pathB.rotation.x = Math.PI/2;
	
	// сглобяване на целия модел
	this.image.add(this.sphereA,this.sphereB,this.pathA,this.pathB);
}

MEIRO.Models.M12141.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M12141.DIST = {MIN:5, MAX:20, HEIGHT:1};
MEIRO.Models.M12141.POS = {DIST:12, ROT_X:0, ROT_Y:0.5};
MEIRO.Models.M12141.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M12141.prototype.onAnimate = function(time)
{
	var angle = rpm(time,10);
	this.sphereA.position.set(4*Math.cos(angle),0,4*Math.sin(angle));

	angle = rpm(time,27);
	this.sphereB.position.set(2*Math.cos(angle),0,2*Math.sin(angle));
	this.sphereB.position.add(this.sphereA.position);

	this.pathB.position.copy(this.sphereA.position);
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M12141.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Вложено въртене</h1>';

	s += '<p>Въртене около въртящ се обект се реализира чрез събиране (транслация) на индивидуалните въртения.</p>';
	s += '<p>Ако обект <em>A</em> се движи по кръг и има траектория <em>(x<sub>a</sub>, y<sub>a</sub>) = (r<sub>a</sub>cosα, r<sub>a</sub>sinα)</em> и ако обект <em>B</em> се движи по кръг около <em>A</em> и има траектория <em>(x<sub>b</sub>, y<sub>b</sub>) = (r<sub>b</sub>cosβ, r<sub>b</sub>sinβ)</em>, то пълното движение на <em>B</em> е <em>(x<sub>a</sub>+x<sub>b</sub>, y<sub>a</sub>+y<sub>b</sub>)</em>.</p>';
	
	element.innerHTML = s;
}