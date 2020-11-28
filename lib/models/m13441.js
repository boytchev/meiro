
//	Основи на Компютърната Графика
//	Модел 13441 - Псевдовълни - случайно движение
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M13441 = function M13441(room)
{
	MEIRO.Model.apply(this, arguments);

	// вълни
	this.geom = new THREE.PlaneGeometry(10,10,10,10);
	this.geom.rotateX(-Math.PI/2);
	var waves = new THREE.Mesh(this.geom,new THREE.MeshBasicMaterial({color:'black',wireframe:true}));

	// сглобяване на целия модел
	this.image.add(waves);
}

MEIRO.Models.M13441.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M13441.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M13441.POS = {DIST:10, ROT_X:0.1, ROT_Y:0.2};
MEIRO.Models.M13441.ROT_Y = {MIN:0, MAX:0.7};


// аниматор на модела
MEIRO.Models.M13441.prototype.onAnimate = function(time)
{
	var g = this.geom;
	var v = g.vertices;
	for (var i=0; i<v.length; i++)
	{
		v[i].y = 0.3*Math.sin(rpm(time,20)+2*Math.PI*Math.random());
	}
	g.verticesNeedUpdate = true;
	reanimate();	
}



// информатор на модела
MEIRO.Models.M13441.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Псевдовълни &ndash; случайно движение</h1>';

	s += '<p>Ако всички възли на повърхност се движат вертикално по случаен начин, то повърхността ще е твърде хаотична. За да се получи илюзия за течност, трябва всеки възел сам за себе си да се движи плавно нагоре-надолу.</p>';
	
	element.innerHTML = s;
}
