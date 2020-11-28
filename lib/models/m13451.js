
//	Основи на Компютърната Графика
//	Модел 13451 - Псевдовълни - плавно движение
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M13451 = function M13451(room)
{
	MEIRO.Model.apply(this, arguments);

	// материали
	this.material = [];
	this.material[0] = new THREE.MeshPhongMaterial({color:'black',wireframe:true});
	this.material[1] = new THREE.MeshPhongMaterial({color:'cornflowerblue'});
	
	// вълни
	this.geom = new THREE.PlaneGeometry(10,10,10,10);
	this.geom.rotateX(-Math.PI/2);
	for (var i=0; i<this.geom.vertices.length; i++)
	{
		this.geom.vertices[i].offset = 2*Math.PI*Math.random();
	}
	this.waves = new THREE.Mesh(this.geom,this.material[0]);

	// светлина
	var light = new THREE.PointLight('white',1);
	light.position.set(0,5,0);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, '', 'images/show.hide.png');
	this.toggle.stateTexts = ['МРЕЖА','ПОВЪРХНОСТ'];
	this.toggle.state = 0;
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.waves,light);
}

MEIRO.Models.M13451.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M13451.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M13451.POS = {DIST:10, ROT_X:0.1, ROT_Y:0.2};
MEIRO.Models.M13451.ROT_Y = {MIN:0, MAX:0.7};


// аниматор на модела
MEIRO.Models.M13451.prototype.onAnimate = function(time)
{
	var g = this.geom;
	var v = g.vertices;
	for (var i=0; i<v.length; i++)
	{
		v[i].y = 0.3*Math.sin(rpm(time,20)+v[i].offset);
	}
	g.computeVertexNormals();
	g.verticesNeedUpdate = true;
	reanimate();	
}



// информатор на модела
MEIRO.Models.M13451.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Псевдовълни &ndash; плавно движение</h1>';

	s += '<p>В този модел всеки възел се движи плавно нагоре-надолу. Отместването във времето е случайно, но е фиксирано в началото. По време на движение това отмества се запазва каквото си е било за всеки възел.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M13451.prototype.onToggle = function(element)
{
	this.toggle.state = (this.toggle.state+1)%2;
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);
	this.waves.material = this.material[this.toggle.state];
	reanimate();
}