
//	Основи на Компютърната Графика
//	Модел 13431 - Псевдовълни - синхронно движение
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M13431 = function M13431(room)
{
	MEIRO.Model.apply(this, arguments);

	// вълни
	this.geom = new THREE.PlaneGeometry(10,10,10,10);
	this.geom.rotateX(-Math.PI/2);
	var waves = new THREE.Mesh(this.geom,new THREE.MeshBasicMaterial({color:'black',wireframe:true}));

	// сглобяване на целия модел
	this.image.add(waves);
}

MEIRO.Models.M13431.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M13431.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M13431.POS = {DIST:10, ROT_X:0.1, ROT_Y:0.2};
MEIRO.Models.M13431.ROT_Y = {MIN:0, MAX:0.7};


// аниматор на модела
MEIRO.Models.M13431.prototype.onAnimate = function(time)
{
	var g = this.geom;
	var v = g.vertices;
	for (var i=0; i<v.length; i++)
	{
		v[i].y = Math.sin(rpm(time,20));
	}
	g.verticesNeedUpdate = true;
	reanimate();	
}



// информатор на модела
MEIRO.Models.M13431.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Псевдовълни &ndash; синхронно движение</h1>';

	s += '<p>Ако всички възли на повърхност се движат вертикално и в синхрон, то цялата повърхност ще се премества, без да се деформира. За да се получи илюзия за вълни, трябва възлите да не се движат синхронно.</p>';
	
	element.innerHTML = s;
}
