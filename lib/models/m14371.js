
//	Основи на Компютърната Графика
//	Модел 14371 - Аеронавигация - завой (yaw)
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M14371 = function M14371(room, model)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxyz = new MEIRO.Axes3D([-1,4],[-1,2],[-3,3]);
	this.oxyz.setLabels('надлъжна','вертикална','напречна');
	this.oxyz.labelO.visible = false;
	this.oxyz.labelX.geometry.translate(-1,0,0);
	this.oxyz.labelY.geometry.translate(-1.3,0,0);
	this.oxyz.labelZ.geometry.translate(-1,0,0);
	this.oxyz.grid.visible = false;
	
	// самолетче
	this.plane = new MEIRO.PaperPlane('cornflowerblue');
	this.plane.scale.set(2,2,2);

	// светлина
	light = new THREE.AmbientLight('white',0.5);
	
	// сглобяване на целия модел
	this.image.add(light,this.oxyz,this.plane);
}

MEIRO.Models.M14371.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M14371.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M14371.POS = {DIST:10, ROT_X:-0.9, ROT_Y:0.4};
MEIRO.Models.M14371.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M14371.prototype.onAnimate = function(time)
{	
	this.oxyz.rotateLabels();
	this.plane.rotation.y = Math.sin(rpm(time,15));
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M14371.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Аеронавигация &ndash; завой (yaw)</h1>';

	s += '<p><em>Завой</em> (<em>yaw</em>) е завъртане около вертикалната ос на обект. В този случай предната част на обекта се завърта наляво или надясно.</p>';

	element.innerHTML = s;
}
