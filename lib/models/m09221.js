
//	Основи на Компютърната Графика
//	Модел 09221 - Икосаедър в ThreeJS
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09221 = function M09221(room)
{
	MEIRO.Model.apply(this, arguments);

	// тяло
	this.body = new THREE.Mesh(
			new THREE.IcosahedronGeometry(3),
			new THREE.MeshNormalMaterial({transparent:true,opacity:0.7,depthTest:false})
		);

	this.frame = new THREE.Mesh(
			this.body.geometry,
			new THREE.MeshBasicMaterial({wireframe:true,color:'black',transparent:true,opacity:0.3,side:THREE.DoubleSide})
		);

	// сглобяване на целия модел
	this.image.add(this.body,this.frame);
}

MEIRO.Models.M09221.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09221.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M09221.POS = {DIST:10, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M09221.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09221.prototype.onAnimate = function(time)
{
	this.body.rotation.x += Math.sin(rpm(time,1))/80;
	this.body.rotation.y += Math.sin(rpm(time,1))/50;
	this.body.rotation.z += Math.cos(rpm(time,1))/80;
	this.frame.rotation.copy(this.body.rotation);
	reanimate();
}



// информатор на модела
MEIRO.Models.M09221.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Икосаедър в ThreeJS</h1>';

	s += '<p>В ThreeJS има готови библиотечни модели на платоновите тела, които включват и икосаедъра.</p>';
	
	element.innerHTML = s;
}