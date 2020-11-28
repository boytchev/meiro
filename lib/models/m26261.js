
//	Основи на Компютърната Графика
//	Модел 26261 - Модел на пръст
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M26261 = function M26261(room)
{
	MEIRO.Model.apply(this, arguments);

	var ratio = 0.85;
	var phalangGeometry = new THREE.CylinderGeometry(ratio,1,2.6,32,1);
	var jointGeometry = new THREE.SphereGeometry(1,32,32);
	var skinMaterial = new THREE.MeshPhongMaterial({color:'peachpuff',shininess:10});
	var nailMaterial = new THREE.MeshPhongMaterial({color:'red',shininess:200});
	phalangGeometry.translate(0,1.3,0);

	function Finger()
	{
		var finger = new THREE.Object3D();
		var f = finger;
		
		for (var i=0; i<3; i++)
		{
			f.add(new THREE.Mesh(jointGeometry,skinMaterial));
			f.add(new THREE.Mesh(phalangGeometry,skinMaterial));
			f = f.children[0];
			f.scale.set(ratio,ratio,ratio);
			f.position.y = 2.6;
			f.rotation.x = 0.3;
		}

		finger.add(new THREE.Mesh(jointGeometry,skinMaterial));
		
		return finger;
	}
	
	this.finger = Finger();
	
	// сглобяване на целия модел
	this.image.add(this.finger);
}

MEIRO.Models.M26261.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M26261.DIST = {MIN:10, MAX:40, HEIGHT:-3};
MEIRO.Models.M26261.POS = {DIST:20, ROT_X:0, ROT_Y:0};
MEIRO.Models.M26261.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M26261.prototype.onAnimate = function(time)
{
	for (var f=this.finger.children[0],n=1; n<3; f=f.children[0],n++)
	{
		f.rotation.x = 0.1+1.5*(0.5+0.5*Math.sin(0.0015*time));
	}
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M26261.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Модел на пръст</h1>';

	s += '<p>При завъртане на слоеве може да се получи "разрив" между два слоя. Той може да се маскира с допълнителен обект на мястото на сгъвката. Например, при модел на пръст този обект може да е сфера.</p>';
	
	element.innerHTML = s;
}
