
//	Основи на Компютърната Графика
//	Модел 28441 - Симулация на отражение
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M28441 = function M28441(room)
{
	MEIRO.Model.apply(this, arguments);

	var floor = new THREE.Mesh(
		new THREE.RingGeometry(10/Math.sqrt(2),20/Math.sqrt(2),4,1),
		new THREE.MeshBasicMaterial({color:'firebrick',side:THREE.DoubleSide})
	);
	floor.rotation.set(-Math.PI/2,Math.PI/4,0,'YXZ');

	var glass = new MEIRO.Cube(1);
	glass.scale.set(10,0.01,10);
	glass.material = new THREE.MeshBasicMaterial({color:'orange',transparent:true,opacity:0.6,side:THREE.DoubleSide});

	var glass2 = new THREE.Mesh(
		new THREE.RingGeometry(20/Math.sqrt(2),30,4,1),
		glass.material
	);
	glass2.rotation.set(-Math.PI/2,Math.PI/4,0,'YXZ');
	
	this.n = 6;
	this.ball = [];
	this.reflection = [];
	for (var i=0; i<this.n; i++)
	{
		var material = new THREE.MeshPhongMaterial({color:MEIRO.RandomColor(),shininess:30});
		this.ball.push( new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.SPHERE,material) );
		this.reflection.push( new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.SPHERE,material) );
		this.ball[i].offset = 2*Math.PI*Math.random();
	}
	
		
	// сглобяване на целия модел
	this.image.add(floor,glass,glass2);
	for (var i=0; i<this.n; i++)
	{
		this.image.add(this.ball[i]);
		this.image.add(this.reflection[i]);
	}
}

MEIRO.Models.M28441.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M28441.DIST = {MIN:10, MAX:60, HEIGHT:-3};
MEIRO.Models.M28441.POS = {DIST:30, ROT_X:0, ROT_Y:0.3};
MEIRO.Models.M28441.ROT_Y = {MIN:-0.2, MAX:0.7};


// аниматор на модела
MEIRO.Models.M28441.prototype.onAnimate = function(time)
{
	for (var i=0; i<this.n; i++)
	{
		var a = 2*Math.PI*i/this.n;
		var b = this.ball[i];
		b.position.set(
			10*Math.sin(rpm(time,8)+a),
			1+7*Math.abs(Math.sin(rpm(time,20)+b.offset)),
			10*Math.cos(rpm(time,8)+a)
		);
		this.reflection[i].position.set(
			b.position.x,
			-b.position.y,
			b.position.z
		);
	}
	reanimate();
}



// информатор на модела
MEIRO.Models.M28441.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Симулация на отражение</h1>';

	s += '<p>Този модел представя симулация на отражение. Вместо да се използват по-сложни методи с трасиране на лъчи, топките се рисуват двукратно &ndash; веднъж отгоре, и втори път симетрично отдолу.</p>';
	s += '<p>Огледалната повърхност е всъщност полупрозрачна, за да позволи да се видят през нея долните обекти. Ако гледната точка се сниши, те ще станат директно видими.</p>';
	element.innerHTML = s;
}