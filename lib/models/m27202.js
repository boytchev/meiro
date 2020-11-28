
//	Основи на Компютърната Графика
//	Модел 27202 - Разредена изкуствена мъгла
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M27202 = function M27202(room)
{
	MEIRO.Model.apply(this, arguments);

	var box = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.CUBE);
	box.scale.set(5,5,5);
	box = new THREE.BoxHelper(box,'black');

	var n = 8;
	var alpha = 1/n;
	
	this.artificialFog = [];
	var geometry = new THREE.PlaneGeometry(5,5);
	var material = new THREE.MeshBasicMaterial({color:'navy',side:THREE.DoubleSide,transparent:true,opacity:alpha});
	for (var i=0; i<n; i++)
	{
		var f = new THREE.Mesh(geometry,material);
		f.position.z = 5*(i/(n-1)-0.5);
		this.artificialFog.push( f );
	}

	this.ball = new THREE.Mesh(
		MEIRO.PRIMITIVE.GEOMETRY.SPHERE,
		new THREE.MeshPhongMaterial({color:'gold',shininess:150,emissive:'red',emissiveIntensity:0.3})
	);
	this.ball.scale.set(0.75,0.75,2);
		
	// сглобяване на целия модел
	this.image.add(box,this.ball);
	for (var i=0; i<n; i++)
		this.image.add( this.artificialFog[i] );
}

MEIRO.Models.M27202.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M27202.DIST = {MIN:5, MAX:30, HEIGHT:0};
MEIRO.Models.M27202.POS = {DIST:15, ROT_X:1, ROT_Y:0.4};
MEIRO.Models.M27202.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M27202.prototype.onAnimate = function(time)
{
	var t = rpm(time,10);
	var s = Math.sin(t);
	
	this.ball.position.z = 6*s;
	
	var t = ((t+0.4)%(Math.PI)) - Math.PI/2;
	if (t>0) this.ball.rotation.y = 2*t;
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M27202.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Разредена изкуствена мъгла</h1>';

	s += '<p>Когато мъглата се генерира чрез малък брой полупрозрачни плоскости, може да се види какво влияние оказва всеки от слоевете. Моделът показва куб от 8 плоскости, всяка от които е с 12.5% прозрачност. При преминаване на обект през мъглата си проличават отделните слоеве.</p>';
	
	element.innerHTML = s;
}