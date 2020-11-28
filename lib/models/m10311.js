
//	Основи на Компютърната Графика
//	Модел 10311 - Конструктивна геометрия - изваждане
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M10311 = function M10311(room)
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
	var geometry = new THREE.SphereGeometry(rA,2*n,2*m,Math.PI,Math.PI,alpha,Math.PI-alpha);
	var material = new THREE.MeshPhongMaterial({color:'orange',side:THREE.DoubleSide});
					
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
	for (var i=0; i<=2*n; i++)
	{
		var a = alpha+(2*Math.PI-2*alpha)*i/(2*n);
		var x = dA-rA*Math.cos(a);
		var y = rA*Math.sin(a);
		if (i==0) shape.moveTo(x,y);
		shape.lineTo(x,y);
	}
	for (var i=1; i<n; i++)
	{
		var a = -beta+2*beta*i/n;
		var x = dB+rB*Math.cos(a);
		var y = rB*Math.sin(a);
		shape.lineTo(x,y);
	}
	var geometry = new THREE.ShapeGeometry( shape );
	this.flat = new THREE.Mesh(geometry,material);
	
	// сглобяване на целия модел
	this.image.add(this.pointsA,this.pointsB,this.sphereA,this.sphereB,this.flat,this.beam);
}

MEIRO.Models.M10311.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M10311.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M10311.POS = {DIST:15, ROT_X:-Math.PI/2, ROT_Y:0};
MEIRO.Models.M10311.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M10311.prototype.onAnimate = function(time)
{
}



// информатор на модела
MEIRO.Models.M10311.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Конструктивна геометрия - изваждане</h1>';

	s += '<p>Операцията <em>изваждане</em> на два обекта в конструктивната геометрия създава обект, който включва точки, които принадлежат само на първия обект (от когото се изважда), но не и на втория (който се изважда).</p>';
	s += '<p>Показаният модел демонстрира изваждане на две сфери. Резултатният обект е срязан вертикално на две, за да се вижда вътрешността му.</p>';
	
	element.innerHTML = s;
}
