
//	Основи на Компютърната Графика
//	Модел 12281 - Отсечки в произволна равнина
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M12281 = function M12281(room)
{
	MEIRO.Model.apply(this, arguments);
	
	// координатна система
	this.oxyz = new MEIRO.Axes3D([-6,6],[0,6],[-6,6]);
	
	// вектори
	this.vectorU = new MEIRO.Vector(new THREE.Vector3(1,0,0),4,'red');
	this.vectorV = new MEIRO.Vector(new THREE.Vector3(0,0,1),4,'red');

	// надписи
	this.labelU = new MEIRO.Label('U',0.3,-0.1,0,0);
	this.labelV = new MEIRO.Label('V',0.3,-0.1,0,0);
	
	// отсечки
	this.n = 50;
	this.geometry = new THREE.Geometry();
	for (var i=0; i<this.n; i++)
		this.geometry.vertices.push(new THREE.Vector3(4*Math.random(),0,4*Math.random()));
	this.lines = new THREE.LineSegments(this.geometry,new THREE.LineBasicMaterial({color:'black'}));
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();

	// сглобяване на целия модел
	this.image.add(this.oxyz,this.vectorU,this.vectorV,this.labelU,this.labelV,this.lines);
}

MEIRO.Models.M12281.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M12281.DIST = {MIN:20, MAX:30, HEIGHT:-3};
MEIRO.Models.M12281.POS = {DIST:20, ROT_X:1.3, ROT_Y:0.3};
MEIRO.Models.M12281.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M12281.prototype.onAnimate = function(time)
{
	// координатна система
	this.oxyz.rotateLabels();
	
	// надписи
	this.labelU.rotateLabel();
	this.labelV.rotateLabel();

	TWEEN.update();
}



// информатор на модела
MEIRO.Models.M12281.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Отсечки в произволна равнина</h1>';
	
	s += '<p>Два неуспоредни ненулеви вектора <em>u</em> и <em>v</em> дефинират равнина. Всяка точка <em>P</em> от тази равнина с локални координати <em>(x,y)</em> се получава чрез <em>P = x.u + y.v</em>.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M12281.prototype.onToggle = function(element)
{
	this.vectorU.position.set(THREE.Math.randFloat(-4,4),THREE.Math.randFloat(1,4),THREE.Math.randFloat(-4,4));
	this.vectorV.position.copy(this.vectorU.position);

	this.vectorU.setDirection(new THREE.Vector3(THREE.Math.randFloat(-1,1),THREE.Math.randFloat(0,1/3),THREE.Math.randFloat(-1,1)));
	this.vectorV.setDirection(new THREE.Vector3(THREE.Math.randFloat(-1,1),THREE.Math.randFloat(0,1/3),THREE.Math.randFloat(-1,1)));

	var u = this.vectorU.direction.clone().sub(this.vectorU.position);
	var v = this.vectorV.direction.clone().sub(this.vectorV.position);
	
	this.labelU.position.copy(this.vectorU.direction);
	this.labelU.position.sub(this.vectorU.position);
	this.labelU.position.multiplyScalar(4.3);
	this.labelU.position.add(this.vectorU.position);
	this.labelU.position.y -= 1/5;

	this.labelV.position.copy(this.vectorV.direction);
	this.labelV.position.sub(this.vectorV.position);
	this.labelV.position.multiplyScalar(4.3);
	this.labelV.position.add(this.vectorV.position);
	this.labelV.position.y -= 1/5;

	var that = this;
	for (var i=0; i<this.n; i++)
	{
		var vert = this.geometry.vertices[i];
		var from = {x:vert.x,y:vert.y,z:vert.z,i:i};
		var x = 4*Math.random();
		var y = 4*Math.random();
		var p = this.vectorU.position.clone().addScaledVector(u,x).addScaledVector(v,y);
		var to = {x:p.x,y:p.y,z:p.z,i:i};
		new TWEEN.Tween(from)
			.to(to,300)
			.easing( TWEEN.Easing.Quadratic.InOut )
			.onUpdate( function(){
							that.geometry.vertices[this.i].set(this.x,this.y,this.z);
							that.geometry.verticesNeedUpdate = true;
						})
			.delay(500*i/this.n+100*(i%2))
			.start();
	}
	reanimate();
}
