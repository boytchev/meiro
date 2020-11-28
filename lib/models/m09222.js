
//	Основи на Компютърната Графика
//	Модел 09222 - Торичен възел в ThreeJS
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09222 = function M09222(room)
{
	MEIRO.Model.apply(this, arguments);

	// тяло
	this.body = new THREE.Mesh(
			new THREE.TorusKnotGeometry(2,0.8,80,10,2,3),
			new THREE.MeshNormalMaterial({polygonOffset:true,polygonOffsetFactor:1})
		);

	this.frame = new THREE.Mesh(
			this.body.geometry,
			new THREE.MeshBasicMaterial({wireframe:true,color:'black',transparent:true,opacity:0.02,depthTest:false})
		);

	this.frame2 = new THREE.Mesh(
			this.body.geometry,
			new THREE.MeshBasicMaterial({wireframe:true,color:'black',transparent:true,opacity:0.25})
		);

	// сглобяване на целия модел
	this.image.add(this.body,this.frame,this.frame2);
}

MEIRO.Models.M09222.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09222.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M09222.POS = {DIST:10, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M09222.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09222.prototype.onAnimate = function(time)
{
	this.body.rotation.x += Math.sin(rpm(time,1))/80;
	this.body.rotation.y += Math.sin(rpm(time,1))/50;
	this.body.rotation.z += Math.cos(rpm(time,1))/80;
	this.frame.rotation.copy(this.body.rotation);
	this.frame2.rotation.copy(this.body.rotation);
	reanimate();
}



// информатор на модела
MEIRO.Models.M09222.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Торичен възел в ThreeJS</h1>';

	s += '<p>Торичните възли са тръби, намотани около тор. С параметри може да се контролира гъстотата и преплетеността на намотките.</p>';
	
	element.innerHTML = s;
}