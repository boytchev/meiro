
//	Основи на Компютърната Графика
//	Модел 09271 - Ориентация на обект
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09271 = function M09271(room)
{
	MEIRO.Model.apply(this, arguments);

	// снежни топки
	var ballMat = new THREE.MeshLambertMaterial({color:'white',side:THREE.DoubleSide});
	this.ballA = new MEIRO.Sphere(1.6);
	this.ballA.position.y = -2.3;
	this.ballA.material = ballMat;
	
	this.ballB = new MEIRO.Sphere(1.1);
	this.ballB.material = ballMat;
	
	this.ballC = new MEIRO.Sphere(0.6);
	this.ballC.position.y = 1.5;
	this.ballC.material = ballMat;
	
	// нос и очи
	this.nose = new THREE.Mesh(
		new THREE.ConeGeometry(0.2,1,8,1,true),
		new THREE.MeshLambertMaterial({color:'red'})
	);
	this.nose.position.set(0,1.5,0.6);
	this.nose.rotation.set(Math.PI/2,0,0);
	this.eyeL = new MEIRO.Cylinder(0.07,0.1);
	this.eyeL.material = new THREE.MeshBasicMaterial({color:'black'});
	this.eyeL.position.set(0.2,1.6,0.57);
	this.eyeL.rotation.set(Math.PI/2,0,0);
	this.eyeR = this.eyeL.clone(true);
	this.eyeR.position.x = -0.2;
	
	// шапка
	this.hat = new THREE.Object3D();
	this.hat1 = new MEIRO.Cylinder(0.5,0.6);
	this.hat1.material = new THREE.MeshPhongMaterial({color:'black'});
	this.hat1.position.set(0,0.7,0);
	this.hat.add(this.hat1);
	this.hat2 = new MEIRO.Cylinder(1,0.1);
	this.hat2.material = this.hat1.material
	this.hat2.position.set(0,0.4,0);
	this.hat.add(this.hat2);
	this.hat.position.copy(this.ballC.position);
	
	// шипове
	this.n = 120;
	this.spikes = [];
	var spikeGeom = new THREE.ConeGeometry(0.1,1,8,1,false);
	spikeGeom.translate(0,1.2,0);
	var spikeMat = new THREE.MeshNormalMaterial({transparent:true,opacity:0.5});
	for (var i=0; i<this.n; i++)
	{
		var spike = new THREE.Mesh(spikeGeom,spikeMat);
		spike.rotation.set(Math.random()*Math.PI,0,Math.random()*2*Math.PI);
		this.spikes.push(spike);
	}

	// сглобяване на целия модел
	this.image.add(this.ballA,this.ballB,this.ballC,this.nose,this.eyeL,this.eyeR,this.hat);
	for (var i=0; i<this.n; i++)
		this.image.add(this.spikes[i]);
}

MEIRO.Models.M09271.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09271.DIST = {MIN:1, MAX:20, HEIGHT:0};
MEIRO.Models.M09271.POS = {DIST:10, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M09271.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09271.prototype.onAnimate = function(time)
{
	this.hat.rotation.z = Math.sin(rpm(time,3))/2;
	for (var i=0; i<this.n; i++)
	{
		this.spikes[i].rotation.set(6*Math.sin(rpm(time,1)+i*i),0,6*Math.cos(rpm(time,1)-i));
	}
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M09271.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Ориентация на обект</h1>';

	s += '<p>Повечето графични обекти имат ориентация. Тя може да се реализира чрез невидима централна ос, накланянето на която променя ориентацията на обекта. Но може да се реализира чрез комплект от ъгли, които всъщност са ъгли на наклона на тази ос.</p>';
	
	element.innerHTML = s;
}