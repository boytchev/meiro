
//	Основи на Компютърната Графика
//	Модел 12202 - Младеж, девойка и муха
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M12202 = function M12202(room)
{
	MEIRO.Model.apply(this, arguments);

	var extrudeSettings = {
		amount: 0.1,
		bevelEnabled: true,
		bevelSegments: options.lowpoly?1:3,
		steps: options.lowpoly?1:3,
		bevelSize: 0.01,
		bevelThickness: 0.01,
		curveSegments: options.lowpoly?4:10 };
	var extrudeSettingsTie = {
		amount: 0.01,
		bevelEnabled: true,
		bevelSegments: options.lowpoly?1:3,
		steps: options.lowpoly?1:3,
		bevelSize: 0.01,
		bevelThickness: 0.01,
		curveSegments: options.lowpoly?4:10 };
		
	// младеж
	var shape = new THREE.Shape();
	shape.moveTo(0.00,0.35);
	shape.lineTo(0.05,0.00);
	shape.lineTo(0.14,0.00);
	shape.lineTo(0.08,0.54);
	shape.lineTo(0.15,0.35);
	shape.lineTo(0.22,0.38);
	shape.lineTo(0.11,0.70);
	shape.lineTo(0.05,0.70);
	shape.lineTo(0.00,0.50);
	shape.lineTo(-0.05,0.70);
	shape.lineTo(-0.11,0.70);
	shape.lineTo(-0.22,0.38);
	shape.lineTo(-0.15,0.35);
	shape.lineTo(-0.08,0.54);
	shape.lineTo(-0.14,0.00);
	shape.lineTo(-0.05,0.00);
	shape.lineTo(0.00,0.35);
	
	var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
	geometry.computeFaceNormals();
	geometry.translate(1.5,0,0);
	
	this.adam = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({color:'cornflowerblue',shininess:150}) );
	this.adam.scale.set(3,3,3);
	this.adam.rotation.y = 0;
	
	var shape = new THREE.Shape();
	shape.moveTo(0.00,0.69);
	shape.lineTo(0.029,0.67);
	shape.lineTo(0.032,0.72);
	shape.lineTo(0,0.70);
	shape.lineTo(-0.032,0.72);
	shape.lineTo(-0.029,0.67);
	shape.lineTo(0.0,0.69);
	var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettingsTie );
	geometry.computeFaceNormals();
	geometry.translate(1.5,0,0);
	var tie = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({color:'cornflowerblue',shininess:150}) );
	tie.position.set(0,0.02,0.1);
	tie.material = this.adam.material;
	this.adam.add(tie);

	var head = new MEIRO.Sphere(0.08);
	head.position.set(1.5,0.87,0.05);
	head.material = this.adam.material;
	this.adam.add(head);
		
	// девойка
	var shape = new THREE.Shape();
	shape.moveTo(0.25,0);
	shape.lineTo(0.05,0.57);
	shape.lineTo(0.06,0.61);
	shape.lineTo(0.20,0.39);
	shape.lineTo(0.09,0.65);
	shape.lineTo(0.06,0.63);
	
	shape.quadraticCurveTo(  0.00, 0.66, -0.06, 0.63 );

	shape.lineTo(-0.09,0.65);
	shape.lineTo(-0.20,0.39);
	shape.lineTo(-0.06,0.61);
	shape.lineTo(-0.05,0.57);
	shape.lineTo(-0.25,0);
	shape.quadraticCurveTo(  0.00, -0.05, 0.25, 0 );
	
	var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
	geometry.computeFaceNormals();
	geometry.translate(-1.5,0,0);
	
	this.eve = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({color:'pink',shininess:150}) );
	this.eve.scale.set(3,3,3);
	this.eve.rotation.y = 0;
	
	var head = new MEIRO.Sphere(0.08);
	head.position.set(-1.5,0.85,0.05);
	head.material = this.eve.material;
	this.eve.add(head);
	
	for (var i=0; i<7; i++)
	{
		var a = (i-3)/3;
		var jewel = new MEIRO.Sphere(2/150-Math.abs(a)/150);
		jewel.position.set(-1.5+0.08*Math.sin(a),0.76-0.07*Math.cos(a),0.1);
		jewel.material = this.eve.material;
		this.eve.add(jewel);
	}
	
	// дърво
	var spline = new THREE.QuadraticBezierCurve( 
		new THREE.Vector3(3.5,0,0),
		new THREE.Vector3(2,3,0),
		new THREE.Vector3(2,10,0) );
	var points = [];
	for ( var i = 0; i <= 5; i ++ )
	{
		var p = spline.getPoint(i/5);
		points.push( new THREE.Vector2(p.x,p.y) );
	}
	tree = new THREE.Mesh(
		new THREE.LatheGeometry(points,options.lowpoly?16:60),
		new THREE.MeshLambertMaterial({color:'firebrick'})
	);
	for (var i=0; i<tree.geometry.vertices.length; i++)
	{
		var v = tree.geometry.vertices[i];
		v.x += THREE.Math.randFloat(-0.4,0.4);
		v.y += THREE.Math.randFloat(-0.22,0.22);
		v.z += THREE.Math.randFloat(-0.4,0.4);
	}
	
	// муха
	this.wing1 = new MEIRO.Sphere(1);
	this.wing1.scale.set(0.08,0.01,0.05);
	this.wing1.position.set(0.07,0.02,4.5);
	this.wing1.material = new THREE.MeshLambertMaterial({color:'white',transparent:true,opacity:0.4});
	this.wing2 = this.wing1.clone(true);
	this.wing2.position.set(-0.07,0.02,4.5);
	body = new MEIRO.Sphere(0.03);
	body.position.set(0,0,4.5);
	body.material = new THREE.MeshPhongMaterial({color:'black'});
	this.fly = new THREE.Object3D();
	this.fly.position.y = 2.5;
	this.fly.add(this.wing1,this.wing2,body);
	
	// бутон за превключване
	var that = this;
	this.k = 0;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'РАНДЕВУ', 'images/show.hide.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.adam,this.eve,this.fly,tree);
}

MEIRO.Models.M12202.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M12202.DIST = {MIN:7, MAX:20, HEIGHT:-3};
MEIRO.Models.M12202.POS = {DIST:15, ROT_X:Math.PI/2, ROT_Y:-0.1};
MEIRO.Models.M12202.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M12202.prototype.onAnimate = function(time)
{
	this.adam.rotation.y = -(Math.PI/2-0.086)*this.k;
	this.eve.rotation.y = (Math.PI/2-0.086)*this.k;
	
	this.wing1.rotation.set( Math.random()*6,Math.random()*6,Math.random()*6 );
	this.wing2.rotation.set( Math.random()*6,Math.random()*6,Math.random()*6 );

	this.fly.rotation.y = (1-this.k)*(Math.PI/2-0.1)*Math.sin(rpm(time,20));
	
	TWEEN.update();
	
	if (this.k<1-EPS)
		reanimate();
}



// информатор на модела
MEIRO.Models.M12202.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Младеж, девойка и муха</h1>';

	s += '<p>Този модел демонстрира летене на муха по дъга между други две човечета, движещи се по дъги. Полетът на мухата е чрез линейна комбинация между два ъгъла, определящи текущото положение на човечетата.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M12202.prototype.onToggle = function(element)
{
	var that = this;
	new TWEEN.Tween({k:0})
		.to({k:1},10000)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){that.k=this.k} )
		.start();
		
	reanimate();
}
