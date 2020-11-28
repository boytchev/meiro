
//	Основи на Компютърната Графика
//	Модел 09261 - Размер на обект
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09261 = function M09261(room)
{
	MEIRO.Model.apply(this, arguments);

	// клечки за уши
	this.n = 50;
	this.sticks = [];
	
	var cottonGeom1 = new THREE.SphereGeometry(1,options.lowpoly?3:12,options.lowpoly?3:12);
	cottonGeom1.scale(2.5,0.1,2.5);
	cottonGeom1.translate(0,0.5,0);

	var cottonGeom2 = new THREE.SphereGeometry(1,options.lowpoly?3:12,options.lowpoly?3:12);
	cottonGeom2.scale(2.2,0.1,2.2);
	cottonGeom2.translate(0,-0.5,0);
	
	for (var i=0; i<this.n; i++)
	{
		var stick = new MEIRO.Cylinder();
		stick.position.set(THREE.Math.randFloat(-3,3),THREE.Math.randFloat(-1,1),THREE.Math.randFloat(-3,3));
		stick.rotation.set(THREE.Math.randFloat(0,6.3),THREE.Math.randFloat(0,6.3),THREE.Math.randFloat(0,6.3));
		stick.scale.set(0.05,3,0.05);
		stick.material = new THREE.MeshLambertMaterial({color:MEIRO.RandomMilkyColor()});
		
		stick.add(new THREE.Mesh(cottonGeom1,MEIRO.PRIMITIVE.STYLE.SPHERE));
		stick.add(new THREE.Mesh(cottonGeom2,MEIRO.PRIMITIVE.STYLE.SPHERE));
		
		this.sticks.push(stick);
	}

	// сглобяване на целия модел
	for (var i=0; i<this.n; i++)
		this.image.add(this.sticks[i]);
}

MEIRO.Models.M09261.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09261.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M09261.POS = {DIST:10, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M09261.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09261.prototype.onAnimate = function(time)
{
}



// информатор на модела
MEIRO.Models.M09261.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Размер на обект</h1>';

	s += '<p>Повечето графични обекти имат размер. Това е мащаб отделно по всяка от осите, с който смачкваме или разпъваме обекта.</p>';
	
	element.innerHTML = s;
}