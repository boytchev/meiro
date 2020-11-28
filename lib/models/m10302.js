
//	Основи на Компютърната Графика
//	Модел 10302 - Конструктивна геометрия - умножение
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M10302 = function M10302(room)
{
	MEIRO.Model.apply(this, arguments);

	var rA = 4;
	var rB = 2.5;
	var dA = 1;
	var dB = -3;
	var d = dA-dB;
	
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
	var n = options.lowpoly?10:20;
	var m = options.lowpoly?5:10;
	var alpha = Math.acos( (rA*rA-rB*rB+d*d)/(2*rA*d) );
	var geometry = new THREE.SphereGeometry(rA,n,m,Math.PI,Math.PI,0,alpha);
	var material = new THREE.MeshPhongMaterial({color:'orange'});
					
	this.sphereA = new THREE.Mesh(geometry,material);
	this.sphereA.position.x = dA;
	this.sphereA.rotation.z = Math.PI/2;
	
	var beta = Math.acos( (rB*rB-rA*rA+d*d)/(2*rB*d) );
	var geometry = new THREE.SphereGeometry(rB,n,m,Math.PI,Math.PI,Math.PI-beta,beta);
	
	this.sphereB = new THREE.Mesh(geometry,material);
	this.sphereB.position.x = dB;
	this.sphereB.rotation.z = Math.PI/2;

	// плоска част
	var shape = new THREE.Shape();
	for (var i=0; i<=n; i++)
	{
		var a = -alpha+2*alpha*i/n;
		var x = dA-rA*Math.cos(a);
		var y = rA*Math.sin(a);
		if (i==0) shape.moveTo(x,y);
		shape.lineTo(x,y);
	}
	for (var i=1; i<=n; i++)
	{
		var a = beta-2*beta*i/n;
		var x = dB+rB*Math.cos(a);
		var y = rB*Math.sin(a);
		shape.lineTo(x,y);
	}
	var geometry = new THREE.ShapeGeometry( shape );
	this.flat = new THREE.Mesh(geometry,material);
	
	// сглобяване на целия модел
	this.image.add(this.pointsA,this.pointsB,this.sphereA,this.sphereB,this.flat,this.beam);
}

MEIRO.Models.M10302.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M10302.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M10302.POS = {DIST:15, ROT_X:-Math.PI/2, ROT_Y:0};
MEIRO.Models.M10302.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M10302.prototype.onAnimate = function(time)
{
}



// информатор на модела
MEIRO.Models.M10302.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Конструктивна геометрия - умножение</h1>';

	s += '<p>Операцията <em>умножение</em> на два обекта в конструктивната геометрия създава сечението на обектите &ndash; включват се всички точки, които принадлежат едновременно и на двата от тях.</p>';
	s += '<p>Показаният модел демонстрира умножение на две сфери. Резултатният обект е срязан вертикално на две, за да се вижда вътрешността му.</p>';
	
	element.innerHTML = s;
}
