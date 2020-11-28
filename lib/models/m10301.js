
//	Основи на Компютърната Графика
//	Модел 10301 - Конструктивна геометрия - събиране
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M10301 = function M10301(room)
{
	MEIRO.Model.apply(this, arguments);

	var rA = 4;
	var rB = 2.5;
	var dA = 1;
	var dB = -3;
	
	// греда
	this.beam = new MEIRO.Cube(1);
	this.beam.scale.set(12,0.8,0.1);
	this.beam.position.set(-0.2,0,-0.2);
	this.beam.material = new THREE.MeshPhongMaterial({color:'cornflowerblue'});
	
	// точки
	var geometry = new THREE.IcosahedronGeometry(1,4);
	var material = new THREE.PointsMaterial({color:'black',size:0.003});

	this.pointsA = new THREE.Points(geometry,material);
	this.pointsA.position.x = dA;
	this.pointsA.scale.set(rA,rA,rA);

	this.pointsB = new THREE.Points(geometry,material);
	this.pointsB.position.x = dB;
	this.pointsB.scale.set(rB,rB,rB);

	
	// заоблена част
	var geometry = new THREE.SphereGeometry(1,options.lowpoly?20:40,options.lowpoly?20:40,Math.PI,Math.PI);
	var material = new THREE.MeshPhongMaterial({color:'orange'});
					
	this.sphereA = new THREE.Mesh(geometry,material);
	this.sphereA.position.x = dA;
	this.sphereA.scale.set(rA,rA,rA);
	this.sphereA.rotation.z = Math.PI/2;
	
	this.sphereB = new THREE.Mesh(geometry,material);
	this.sphereB.position.x = dB;
	this.sphereB.scale.set(rB,rB,rB);
	this.sphereB.rotation.z = Math.PI/2;

	// плоска част
	var geometry = new THREE.CircleGeometry(1,options.lowpoly?40:80);
	
	this.circleA = new THREE.Mesh(geometry,material);
	this.circleA.scale.set(rA,rA,rA);
	this.circleA.position.x = dA;
	
	this.circleB = new THREE.Mesh(geometry,material);
	this.circleB.scale.set(rB,rB,rB);
	this.circleB.position.x = dB;
	
	// сглобяване на целия модел
	this.image.add(this.pointsA,this.pointsB,this.sphereA,this.sphereB,this.circleA,this.circleB,this.beam);
}

MEIRO.Models.M10301.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M10301.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M10301.POS = {DIST:15, ROT_X:-Math.PI/2, ROT_Y:0};
MEIRO.Models.M10301.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M10301.prototype.onAnimate = function(time)
{
}



// информатор на модела
MEIRO.Models.M10301.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Конструктивна геометрия - събиране</h1>';

	s += '<p>Операцията <em>събиране</em> на два обекта в конструктивната геометрия създава обединението на обектите &ndash; включват се всички точки, които принадлежат на поне един от тях.</p>';
	s += '<p>Показаният модел демонстрира събиране на две сфери. Резултатният обект е срязан вертикално на две, за да се вижда вътрешността му.</p>';
	
	element.innerHTML = s;
}
