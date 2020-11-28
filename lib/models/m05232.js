
//	Основи на Компютърната Графика
//	Модел 05232 - Най-близка точка от отсечка
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M05232 = function M05232(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxyz = new MEIRO.Axes3D([-6,6],[-2,4],[-6,6]);
	
	// N точки
	this.n = 20;
	this.points = [];
	for (var i=0; i<this.n; i++) this.points.push(new MEIRO.Point());
	
	// отсечка
	this.from = new THREE.Vector3(0,-2,0);
	this.to = new THREE.Vector3(0,2,0);
	this.line = new MEIRO.Cylinder(0.2,5);
	this.line.material = new THREE.MeshLambertMaterial({color:'cornflowerblue'});
	
	// разстояния
	this.distances = [];
	for (var i=0; i<this.n; i++) this.distances.push(new MEIRO.Line());
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();

	// сглобяване на целия модел
	this.image.add(this.oxyz,this.line);
	for (var i=0; i<this.n; i++) this.image.add(this.points[i]);
	for (var i=0; i<this.n; i++) this.image.add(this.distances[i]);
}

MEIRO.Models.M05232.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M05232.DIST = {MIN:10, MAX:30, HEIGHT:-1};
MEIRO.Models.M05232.POS = {DIST:20, ROT_X:1.3, ROT_Y:0.1};
MEIRO.Models.M05232.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M05232.prototype.onAnimate = function(time)
{
	// координатна система
	this.oxyz.rotateLabels();
	
	// точки
	for (var i=0; i<this.n; i++)
	{
		var a = rpm(time,2+i/10)+i;
		var b = rpm(time,3-i/10)+i*i;
		var x = 1.5*Math.cos(a)*Math.cos(b);
		var y = Math.sin(b);
		var z = 1.5*Math.sin(a)*Math.cos(b);
		
		this.points[i].position.set(x,y,z);
		this.points[i].position.multiplyScalar(4);
	}
	
	// линия
	var v = new THREE.Vector3().subVectors(this.to,this.from);
	this.line.position.copy(this.to);
	this.line.position.add(this.from).multiplyScalar(0.5);
	this.line.scale.y = v.length();
	var sph = new THREE.Spherical().setFromVector3(v);
	this.line.rotation.set(sph.phi,sph.theta,0,'YXZ');
		
	// разстояния
	var vv = v.dot(v);
	for (var i=0; i<this.n; i++)
	{
		var w = new THREE.Vector3().subVectors(this.from,this.points[i].position);
		var t = - v.dot(w)/vv;
		
		t = THREE.Math.clamp(t,0,1);

		this.distances[i].setFrom(this.points[i].position);
		this.distances[i].setTo(v.clone().multiplyScalar(t).add(this.from));
	}

	TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.M05232.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Най-близка точка от отсечка</h1>';
	
	s += '<p>Изчисляването на най-краткото разстояние от дадена точка до отсечкс и намирането на съответната най-близка точка от тази отсечка е по същия начин, като и при права. Единствената разлика е ограничаването на намерената точка да е между краищата на отсечката.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M05232.prototype.onToggle = function(element)
{
	var that = this;
	new TWEEN.Tween(
		{	x1:that.from.x,y1:that.from.y,z1:that.from.z,
			x2:that.to.x,y2:that.to.y,z2:that.to.z})
		.to({x1:THREE.Math.randFloat(-4,4),y1:THREE.Math.randFloat(-2,2),z1:THREE.Math.randFloat(-4,4),
			x2:THREE.Math.randFloat(-4,4),y2:THREE.Math.randFloat(-2,2),z2:THREE.Math.randFloat(-4,4)},1000)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
						that.from.set(this.x1,this.y1,this.z1);
						that.to.set(this.x2,this.y2,this.z2);
					})
		.start();
	reanimate();
}